"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { Role, Status } from "@prisma/client";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import { WorkFormData } from "../../../types";

type ActionResponse<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

cloudinary.config({
  cloud_name: process.env.CLDNRY_CLOUD_NAME,
  api_key: process.env.CLDNRY_API_KEY,
  api_secret: process.env.CLDNRY_API_SECRET,
  secure: true,
});

export async function updateWorkMeta(
  workId: string,
  formData: WorkFormData & { totalLevels?: number }
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    if (
      formData?.name?.length > 60 ||
      (formData?.note && formData?.note?.length > 200)
    ) {
      return { success: false, message: "Invalid form data." };
    }

    const work = await dbClient.work.findUnique({
      where: { id: workId },
      select: {
        coverPhoto: true,
        id: true,
        typeOfWork: true,
        People: {
          where: { status: "ACTIVE" },
          select: { personId: true },
        },
        _count: {
          select: { Reports: true },
        },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found." };
    }

    const condition =
      (work?.typeOfWork === "COURSE" &&
        session?.user?.scope?.map((s) => s.scope)?.includes("CRDN")) ||
      (work?.typeOfWork === "PROJECT" &&
        work?.People?.map((p) => p.personId)?.includes(
          session?.user?.id as string
        )) ||
      session?.user?.scope?.map((s) => s.scope).includes("ADMIN");

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    let coverPhoto: string | null;
    if (formData?.coverPhoto && formData?.coverPhoto !== work?.coverPhoto) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData?.coverPhoto as string, {
          public_id: work?.id,
          folder: "work_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    } else if (
      (!formData?.coverPhoto || formData?.coverPhoto == "") &&
      (work?.coverPhoto || work?.coverPhoto !== "")
    ) {
      await cloudinary.uploader.destroy(`work_covers/${work?.id}`);
      coverPhoto = null;
    } else {
      coverPhoto = work?.coverPhoto as string;
    }

    if (
      work?.typeOfWork == "COURSE" &&
      formData?.totalLevels &&
      (formData?.totalLevels > 6 ||
        formData?.totalLevels < work?._count?.Reports)
    ) {
      return {
        success: false,
        message:
          "Invalid number of levels. Either it's too large or less than the number of existing reports.",
      };
    }

    await dbClient?.work?.update({
      where: { id: work?.id },
      data: {
        coverPhoto: coverPhoto,
        name: formData?.name,
        note: formData?.note,
        ...(work?.typeOfWork == "COURSE"
          ? { totalLevels: Number(formData?.totalLevels) }
          : {}),
      },
    });

    revalidatePath(`/work/${work?.id}`, 'layout');
    return { success: true, message: "Meta data updated successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Couldn't update meta data",
    };
  }
}

export async function deleteWork(workId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const work = await dbClient.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        typeOfWork: true,
        People: {
          select: {
            person: { select: { slug: true } },
            personId: true,
            status: true,
          },
        },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found." };
    }

    const condition =
      work?.People?.filter((p) => p?.status === "ACTIVE")
        ?.map((p) => p.personId)
        ?.includes(session?.user?.id as string) ||
      session?.user?.scope?.map((s) => s.scope).includes("ADMIN");

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    await dbClient?.report?.deleteMany({ where: { workId: work?.id } });
    await dbClient.peopleOnWork?.deleteMany({ where: { workId: work?.id } });
    await dbClient?.work?.delete({ where: { id: work?.id } });

    if (work?.People) {
      work.People?.forEach((p: any) =>
        revalidatePath(`/u/${p?.person?.slug as string}/works`)
      );
    }

    return { success: true, message: "deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Couldn't delete",
    };
  }
}

type ManagePeopleArgs = {
  action: "add-person" | "remove-person" | "change-status";
  personId: string;
  status: Status;
  role: Role;
};

export async function managePeopleOnWork(
  workId: string,
  args: ManagePeopleArgs
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const work = await dbClient.work.findUnique({
      where: { id: workId },
      select: {
        id: true,
        typeOfWork: true,
        People: {
          where: { AND: [{ status: "ACTIVE" }, { role: "COORDINATOR" }] },
          select: { personId: true, role: true, status: true },
        },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found." };
    }

    const person = await dbClient.people.findUnique({
      where: { id: args?.personId },
      select: { slug: true },
    });

    const condition =
      (work?.typeOfWork === "PROJECT" &&
        work?.People.map((p) => p?.personId).includes(
          session?.user?.id as string
        )) ||
      (work?.typeOfWork === "COURSE" &&
        session?.user?.scope?.map((s) => s.scope).includes("CRDN")) ||
      session?.user?.scope?.map((s) => s.scope)?.includes("ADMIN");

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    if (args?.action === "add-person") {
      await dbClient.work.update({
        where: { id: work?.id },
        data: {
          People: {
            create: {
              person: { connect: { id: args?.personId } },
              role: args?.role,
            },
          },
        },
      });
    } else if (args?.action === "remove-person") {
      await dbClient.work.update({
        where: { id: work?.id },
        data: {
          People: {
            delete: {
              personId_workId: {
                personId: args?.personId,
                workId: work?.id as string,
              },
            },
          },
        },
      });
    } else if (args?.action === "change-status") {
      await dbClient.work.update({
        where: { id: work?.id },
        data: {
          People: {
            update: {
              where: {
                personId_workId: {
                  personId: args?.personId,
                  workId: work?.id as string,
                },
              },
              data: { status: args?.status },
            },
          },
        },
      });
    }

    revalidatePath(`/work/${work?.id}`, 'layout');
    if (
      (args?.action === "add-person" || args?.action === "remove-person") &&
      person?.slug
    ) {
      revalidatePath(`/u/${person?.slug}/works`);
    }

    return { success: true, message: `updated successfully` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Couldn't update",
    };
  }
}