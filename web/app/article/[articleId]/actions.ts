"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import sanitize from "sanitize-html";
import { ScopeEnum, TypeOfArticle } from "@prisma/client";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import { supabaseStorageClient } from "../../../utils/supabaseStorageClient";
import { SANITIZE_OPTIONS } from "../../../utils";
import { ArticleFormData } from "../../../types";

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

export async function createArticle(
  formData: ArticleFormData,
  typeOfArticle: TypeOfArticle
): Promise<ActionResponse<{ id: string }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const condition = ["ADMIN", "CRDN", "PROFILE"].some((s) =>
      session?.user?.scope?.map((s) => s.scope)?.includes(s as ScopeEnum)
    );

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    const cleanContent = sanitize(formData.content, SANITIZE_OPTIONS);

    if (formData?.title?.length >= 60 || cleanContent?.length >= 15_000) {
      return { success: false, message: "Invalid form data." };
    }

    const createdArticle = await dbClient.article.create({
      data: {
        typeOfArticle: typeOfArticle,
        title: formData?.title,
        caption: formData?.caption,
        coverPhoto: "",
        content: "",
        reviewStatus:
          session.user.scope?.some(
            (s) => s.scope === "CRDN" || s.scope === "ADMIN"
          )
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
        ...(typeOfArticle === "RESOURCE" && {
          Courses: {
            create: formData?.courseIds?.map((c) => ({
              course: { connect: { id: c } },
            })),
          },
        }),
        feedback: "",
      },
      select: {
        id: true,
      },
    });

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

    const filePath = `article/${createdArticle.id}.md`;
    await supabaseStorageClient.upload(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" })
    );
    const uploadedFileUrl = await supabaseStorageClient.getPublicUrl(filePath);

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
    revalidatePath(`/article/${createdArticle.id}`);

    return {
      success: true,
      message: "Article created successfully",
      data: { id: createdArticle.id },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create article",
    };
  }
}

export async function updateArticle(
  articleId: string,
  formData: ArticleFormData
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const existingArticle = await dbClient.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        title: true,
        typeOfArticle: true,
        coverPhoto: true,
        Courses: { select: { courseId: true } },
        People: { select: { personId: true } },
      },
    });

    if (!existingArticle) {
      return { success: false, message: "Article not found." };
    }

    const condition =
      existingArticle.People.some((p) => p.personId === session.user.id) ||
      session.user.scope?.some((s) => s.scope === "ADMIN");

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    const cleanContent = sanitize(formData.content, SANITIZE_OPTIONS);

    if (formData.title.length >= 60 || cleanContent.length >= 15_000) {
      return { success: false, message: "Invalid form data." };
    }

    let coverPhoto: string | null = existingArticle.coverPhoto;
    if (formData.coverPhoto && formData.coverPhoto !== existingArticle.coverPhoto) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData.coverPhoto as string, {
          public_id: existingArticle.id,
          folder: "article_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    } else if (!formData.coverPhoto && existingArticle.coverPhoto) {
      await cloudinary.uploader.destroy(`article_covers/${existingArticle.id}`);
      coverPhoto = null;
    }

    if (existingArticle.typeOfArticle === "RESOURCE") {
      const oldCourseIds = existingArticle.Courses.map((c) => c.courseId);
      const newCourseIds = formData.courseIds || [];
      const coursesToAdd = newCourseIds.filter((id) => !oldCourseIds.includes(id));
      const coursesToDelete = oldCourseIds.filter(
        (id) => !newCourseIds.includes(id)
      );

      if (coursesToAdd.length > 0) {
        await dbClient.articleToCourse.createMany({
          data: coursesToAdd.map((courseId) => ({
            articleId: existingArticle.id,
            courseId,
          })),
        });
      }
      if (coursesToDelete.length > 0) {
        await dbClient.articleToCourse.deleteMany({
          where: {
            articleId: existingArticle.id,
            courseId: { in: coursesToDelete },
          },
        });
      }
    }

    const filePath = `article/${existingArticle.id}.md`;
    await supabaseStorageClient.upload(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" }),
      { upsert: true }
    );

    await dbClient.article.update({
      where: { id: existingArticle.id },
      data: {
        title: formData.title,
        caption: formData.caption,
        coverPhoto: coverPhoto,
        reviewStatus: "PENDING",
        feedback: "",
      },
    });

    revalidatePath(`/article/${existingArticle.id}`);
    if (formData.title !== existingArticle.title) {
      revalidatePath(`/u/${session.user.slug}/writings`);
    }

    return { success: true, message: "Article updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update article",
    };
  }
}

export async function deleteArticle(articleId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const existingArticle = await dbClient.article.findUnique({
      where: { id: articleId },
      select: {
        id: true,
        typeOfArticle: true,
        coverPhoto: true,
        People: {
          select: {
            personId: true,
            role: true,
            person: { select: { slug: true } },
          },
        },
      },
    });

    if (!existingArticle) {
      return { success: false, message: "Article not found." };
    }

    const isOwner = existingArticle.People.some(
      (p) => p.role === "OP" && p.personId === session.user.id
    );

    if (!isOwner) {
      return { success: false, message: "Access denied." };
    }

    await dbClient.articleToPeople.deleteMany({
      where: { articleId: existingArticle.id },
    });

    if (existingArticle.typeOfArticle === "RESOURCE") {
      await dbClient.articleToCourse.deleteMany({
        where: { articleId: existingArticle.id },
      });
    }

    await dbClient.article.delete({ where: { id: existingArticle.id } });

    await supabaseStorageClient.remove([`article/${existingArticle.id}.md`]);

    if (existingArticle.coverPhoto) {
      await cloudinary.uploader.destroy(`article_covers/${existingArticle.id}`);
    }

    existingArticle.People.forEach((p) => {
      revalidatePath(`/u/${p.person.slug}/writings`);
    });
    revalidatePath(`/article/${articleId}`);

    return { success: true, message: "Article deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete article",
    };
  }
}

export async function reviewArticle(
  articleId: string,
  action: "approve" | "feedback",
  feedbackContent?: string
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const hasPermission = session.user.scope?.some(
      (s) => s.scope === "CRDN" || s.scope === "ADMIN"
    );

    if (!hasPermission) {
      return { success: false, message: "Access denied." };
    }

    const existingArticle = await dbClient.article.findUnique({
      where: { id: articleId },
      select: { id: true, reviewStatus: true },
    });

    if (!existingArticle || existingArticle.reviewStatus !== "PENDING") {
      return { success: false, message: "Article is not available for review." };
    }

    if (action === "approve") {
      await dbClient.article.update({
        where: { id: articleId },
        data: { reviewStatus: "APPROVED", feedback: "" },
      });
    } else if (action === "feedback") {
      if (!feedbackContent || feedbackContent.length > 500) {
        return { success: false, message: "Invalid feedback content." };
      }
      await dbClient.article.update({
        where: { id: articleId },
        data: { reviewStatus: "FLAGGED", feedback: feedbackContent },
      });
    }

    revalidatePath(`/article/${articleId}`);
    return {
      success: true,
      message: `Article ${action === "approve" ? "approved" : "flagged"} successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to review article",
    };
  }
}