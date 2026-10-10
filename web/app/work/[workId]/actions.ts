"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath, updateTag } from "next/cache";
import { Role, ScopeEnum, Status, TypeOfWork } from "@prisma/client";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import {
  cacheTags,
  revalidateGrads,
  revalidateWork,
} from "../../../utils/cache";
import { WorkFormData } from "../../../types";
import { MAX_PROJECT_MEMBERS } from "../../../utils/limits";

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
        name: true,
        typeOfWork: true,
        People: {
          select: {
            personId: true,
            status: true,
            person: { select: { slug: true } },
          },
        },
        Reports: { select: { id: true } },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found." };
    }

    const condition =
      (work?.typeOfWork === "COURSE" &&
        session?.user?.scope?.map((s) => s.scope)?.includes("CRDN")) ||
      (work?.typeOfWork === "PROJECT" &&
        work?.People?.filter((p) => p.status === "ACTIVE")
          ?.map((p) => p.personId)
          ?.includes(
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
        formData?.totalLevels < work?.Reports?.length)
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

    revalidateWork(work.id, work.Reports.map((r) => r.id));
    if (work.typeOfWork === "PROJECT") {
      updateTag(cacheTags.projects);
      if (formData?.name !== work.name) {
        // project names are listed on every member's works tab
        work.People.forEach((p) =>
          updateTag(cacheTags.profileWorks(p.person.slug))
        );
      }
    }
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
        courseCode: true,
        People: {
          select: {
            person: { select: { slug: true } },
            personId: true,
            status: true,
          },
        },
        Reports: { select: { id: true } },
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

    revalidateWork(workId, work.Reports.map((r) => r.id));
    revalidateWorkLists(work);
    if (work?.People) {
      work.People?.forEach((p: any) =>
        updateTag(cacheTags.profileWorks(p?.person?.slug as string))
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

/**
 * Who may add/remove people on a work: a project's active coordinators, any
 * CRDN for course works, and ADMINs. `work.People` must be the work's ACTIVE
 * COORDINATORs.
 */
function canManagePeople(
  session: Session,
  work: { typeOfWork: TypeOfWork; People: { personId: string }[] }
) {
  const scopes = session.user?.scope?.map((s) => s.scope) ?? [];
  return (
    (work.typeOfWork === "PROJECT" &&
      work.People.some((p) => p.personId === session.user?.id)) ||
    (work.typeOfWork === "COURSE" && scopes.includes("CRDN")) ||
    scopes.includes("ADMIN")
  );
}

const ACTIVE_COORDINATORS = {
  where: { AND: [{ status: "ACTIVE" as const }, { role: "COORDINATOR" as const }] },
  select: { personId: true },
};

/** People that can be added to a work, by name. Existing members are excluded. */
export async function searchPeopleToAdd(
  workId: string,
  query: string
): Promise<
  ActionResponse<
    {
      id: string;
      name: string;
      profilePic: string;
      scope: { scope: ScopeEnum }[];
    }[]
  >
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const name = query?.trim().slice(0, 60);
    if (!name) {
      return { success: true, message: "", data: [] };
    }

    const work = await dbClient.work.findUnique({
      where: { id: workId },
      select: { typeOfWork: true, People: ACTIVE_COORDINATORS },
    });
    if (!work) {
      return { success: false, message: "Work not found." };
    }
    if (!canManagePeople(session, work)) {
      return { success: false, message: "Access denied." };
    }

    const people = await dbClient.people.findMany({
      where: {
        name: { contains: name, mode: "insensitive" },
        Works: { none: { workId } },
      },
      select: {
        id: true,
        name: true,
        profilePic: true,
        // drives the "Add as Coordinator" option
        scope: {
          where: { scope: { in: ["CRDN", "ADMIN"] } },
          select: { scope: true },
        },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: 5,
    });
    return { success: true, message: "", data: people };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Couldn't search people",
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
        courseCode: true,
        People: ACTIVE_COORDINATORS,
        Reports: { select: { id: true } },
        _count: { select: { People: true } },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found." };
    }

    const person = await dbClient.people.findUnique({
      where: { id: args?.personId },
      select: { slug: true },
    });

    const condition = canManagePeople(session, work);

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    if (
      args?.action === "add-person" &&
      work.typeOfWork === "PROJECT" &&
      work._count.People >= MAX_PROJECT_MEMBERS
    ) {
      return {
        success: false,
        message: `A project can have at most ${MAX_PROJECT_MEMBERS} members.`,
      };
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

    revalidateWork(work.id, work.Reports.map((r) => r.id));
    if (
      (args?.action === "add-person" || args?.action === "remove-person") &&
      person?.slug
    ) {
      updateTag(cacheTags.profileWorks(person.slug));
    }
    if (args?.action === "add-person" || args?.action === "remove-person") {
      revalidateWorkLists(work);
    }

    return { success: true, message: `updated successfully` };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Couldn't update",
    };
  }
}

/** Invalidates the non-work pages that list a work along with its people. */
function revalidateWorkLists(work: {
  typeOfWork: TypeOfWork;
  courseCode: string | null;
  Reports: unknown[];
}) {
  if (work.typeOfWork === "PROJECT") {
    updateTag(cacheTags.projects);
  } else if (work.Reports.length > 0 && work.courseCode) {
    // course works are only listed (and can only be grads) once they have reports
    updateTag(cacheTags.courseWorks(work.courseCode));
    revalidateGrads();
  }
}