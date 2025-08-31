"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import sanitize from "sanitize-html";
import { revalidatePath } from "next/cache";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import { supabaseStorageClient } from "../../../utils/supabaseStorageClient";
import { SANITIZE_OPTIONS } from "../../../utils";
import { ScopeEnum, TypeOfArticle } from "@prisma/client";
import { Role, TypeOfWork } from "@prisma/client";
import { ArticleFormData } from "../../../types";
import { v2 as cloudinary } from "cloudinary";

type ActionResponse<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

export async function updateReadMe(
  slug: string,
  content: string
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);

    const condition =
      slug === session?.user?.slug ||
      session?.user?.scope?.map((s) => s.scope)?.includes("ADMIN");

    if (!condition) {
      return { success: false, message: "Access denied" };
    }

    const cleanContent = sanitize(content, SANITIZE_OPTIONS);

    const filePath = `readme/${slug}.md`;
    await supabaseStorageClient.upload(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" }),
      { upsert: true }
    );
    const readMeURL = await supabaseStorageClient.getPublicUrl(filePath);

    await dbClient.people.update({
      where: {
        slug: slug as string,
      },
      data: {
        readMe: readMeURL.data.publicUrl,
      },
    });

    revalidatePath(`/u/${slug}`);
    return { success: true, message: "profile readMe updated successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Couldn't update profile readMe.",
    };
  }
}

export async function manageScope(
  slug: string,
  action: "add" | "remove",
  scope: ScopeEnum
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);

    //if session user is *not* CRDN or ADMIN
    const condition = !["CRDN", "ADMIN"].some((e: any) =>
      session?.user?.scope?.map((s) => s.scope)?.includes(e)
    );

    //if session user is not admin and tring to add or remove CRDN or ADMIN
    const condition2 =
      !session?.user?.scope?.map((s) => s.scope)?.includes("ADMIN") &&
      ["CRDN", "ADMIN"].includes(scope);
    if (condition || condition2)
      return {
        success: false,
        message:
          "Access denied. Only admins can add/remove CRDN and ADMIN scope.",
      };

    const person = await dbClient.people.findUnique({
      where: {
        slug: slug,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    if (action === "add") {
      await dbClient.people.update({
        where: {
          id: person?.id,
        },
        data: {
          scope: {
            connectOrCreate: {
              where: {
                personId_scope: {
                  personId: person?.id as string,
                  scope: scope,
                },
              },
              create: {
                scope: scope,
              },
            },
          },
        },
      });
    } else if (action === "remove") {
      await dbClient.people.update({
        where: {
          id: person?.id,
        },
        data: {
          scope: {
            delete: {
              personId_scope: {
                personId: person?.id as string,
                scope: scope,
              },
            },
          },
        },
      });
    } else {
      return { success: false, message: "invalid action" };
    }

    revalidatePath(`/u/${person?.slug}`);
    return { success: true, message: "profile meta-data updated successfully" };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function getCourseList() {
  try {
    const courseList = await dbClient.course.findMany({
      select: {
        courseCode: true,
        totalLevels: true,
      },
    });
    return { success: true, courseList };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

type SpawnWorkFormData = {
  selectedCourse?: string;
  projectName?: string;
  authorSlug?: string;
};

export async function spawnWork(
  type: TypeOfWork,
  formData: SpawnWorkFormData
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    const sessionUser = session?.user;

    const condition = !["CRDN", "ADMIN"].some((e: any) =>
      sessionUser?.scope?.map((s) => s.scope)?.includes(e)
    );

    if (condition) {
      return { success: false, message: "Access denied" };
    }

    const author = await dbClient.people.findFirst({
      where: {
        slug: formData?.authorSlug,
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (!author) {
      return { success: false, message: "Invalid request" };
    }

    if (
      await dbClient.work.count({
        where: {
          OR: [
            ...(type == "PROJECT" && formData?.projectName
              ? [{ name: formData?.projectName }]
              : []),
            ...(type == "COURSE" && formData?.selectedCourse
              ? [
                  {
                    AND: [
                      { courseCode: formData?.selectedCourse },
                      {
                        People: {
                          some: {
                            personId: author?.id,
                          },
                        },
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
      })
    ) {
      return {
        success: false,
        message: "Similar work already exists. Can't create a duplicate one.",
      };
    }

    let course: { totalLevels: number } | null = { totalLevels: 0 };
    if (type == "COURSE") {
      course = await dbClient.course.findUnique({
        where: {
          courseCode: formData?.selectedCourse,
        },
        select: {
          totalLevels: true,
        },
      });
      if (!course) {
        return { success: false, message: "invalid course selection" };
      }
    }
    if (type == "PROJECT" && !formData?.projectName)
      return { success: false, message: "Invalid request" };

    await dbClient.work.create({
      data: {
        typeOfWork: type,
        ...(type === "COURSE" && {
          course: {
            connect: {
              courseCode: formData?.selectedCourse,
            },
          },
          totalLevels: Number(course?.totalLevels),
          searchTerms: author.name + " " + formData?.selectedCourse,
        }),
        ...(type === "PROJECT" && {
          name: formData?.projectName,
          searchTerms: author.name + " " + formData?.projectName,
        }),
        People: {
          create: [
            {
              person: {
                connect: {
                  id: author?.id,
                },
              },
              role: "AUTHOR",
            },
            ...(type !== "COURSE"
              ? [
                  {
                    person: {
                      connect: {
                        id: sessionUser?.id,
                      },
                    },
                    role: "COORDINATOR" as Role,
                  },
                ]
              : []),
          ],
        },
      },
    });

    revalidatePath(`/u/${formData?.authorSlug}/works`);
    return { success: true, message: "work created successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Something went wrong",
    };
  }
}

export async function createArticle(
  typeOfArticle: TypeOfArticle,
  formData: ArticleFormData
): Promise<ActionResponse> {
  try {
    cloudinary.config({
      cloud_name: process.env.CLDNRY_CLOUD_NAME,
      api_key: process.env.CLDNRY_API_KEY,
      api_secret: process.env.CLDNRY_API_SECRET,
      secure: true,
    });

    const session = await getServerSession(authOptions);

    const condition = ["ADMIN", "CRDN", "PROFILE"].some((s) =>
      session?.user?.scope?.map((s) => s.scope)?.includes(s as ScopeEnum)
    );

    if (!condition) return { success: false, message: "Access denied" };

    const cleanContent = sanitize(formData.content, SANITIZE_OPTIONS);

    if (formData?.title?.length >= 60 || cleanContent?.length >= 15_000) {
      return {
        success: false,
        message: "Invalid form data.",
      };
    }

    // Create article
    const createdArticle = await dbClient.article.create({
      data: {
        typeOfArticle: typeOfArticle,
        title: formData?.title,
        caption: formData?.caption,
        coverPhoto: "",
        content: "",
        reviewStatus:
          session &&
          (session.user.scope?.map((s) => s.scope)?.includes("CRDN") ||
            session.user.scope?.map((s) => s.scope)?.includes("ADMIN"))
            ? "APPROVED"
            : "PENDING",
        People: {
          create: [
            {
              personId: session?.user?.id as string,
              role: "OP",
            },
          ],
        },
        ...(typeOfArticle === "RESOURCE"
          ? {
              Courses: {
                create: formData?.courseIds?.map((c) => ({
                  course: { connect: { id: c } },
                })),
              },
            }
          : null),
        feedback: "",
      },
      select: {
        id: true,
      },
    });

    // Upload article cover photo to cloudinary
    let coverPhoto: string | null = null;
    if (formData?.coverPhoto) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData.coverPhoto as string, {
          public_id: createdArticle?.id,
          folder: "article_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    }

    // Upload article content to supabase storage
    const filePath = `article/${createdArticle.id}.md`;
    await supabaseStorageClient.upload(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" })
    );
    const uploadedFileUrl = await supabaseStorageClient.getPublicUrl(filePath);

    // Update article with content url
    await dbClient.article.update({
      where: {
        id: createdArticle?.id,
      },
      data: {
        ...(coverPhoto && { coverPhoto: coverPhoto }),
        ...(uploadedFileUrl.data && {
          content: uploadedFileUrl.data.publicUrl,
        }),
      },
    });

    revalidatePath(`/u/${session?.user?.slug}/writings`);
    return {
      success: true,
      message: `${typeOfArticle} post created successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Couldn't create ${typeOfArticle}`,
    };
  }
}