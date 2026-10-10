"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath, updateTag } from "next/cache";
import sanitize from "sanitize-html";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import { supabaseStorageClient } from "../../../utils/supabaseStorageClient";
import { SANITIZE_OPTIONS } from "../../../utils";
import { ArticleFormData } from "../../../types";
import { cacheTags } from "../../../utils/cache";

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
        caption: true,
        typeOfArticle: true,
        coverPhoto: true,
        Courses: { select: { course: { select: { courseCode: true, id: true } } } },
        People: {
          select: { personId: true, person: { select: { slug: true } } },
        },
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

    let coursesUpdate: any = undefined;
    // courses whose article list gains or loses this article
    let changedCourseCodes: string[] = [];
    if (existingArticle.typeOfArticle === "RESOURCE") {
      const oldCourses = existingArticle.Courses.map((c) => ({
        id: c.course.id,
        code: c.course.courseCode,
      }));
      const newCourseCodes = formData.courseIds || [];

      const removedCourses = oldCourses.filter(
        (c) => !newCourseCodes.includes(c.code)
      );
      const idsToDelete = removedCourses.map((c) => c.id);

      const codesToAdd = newCourseCodes.filter(
        (code) => !oldCourses.some((oc) => oc.code === code)
      );

      const listedFieldsChanged =
        formData.title !== existingArticle.title ||
        formData.caption !== existingArticle.caption;
      changedCourseCodes = listedFieldsChanged
        ? [...new Set([...oldCourses.map((c) => c.code), ...newCourseCodes])]
        : [...removedCourses.map((c) => c.code), ...codesToAdd];

      if (idsToDelete.length > 0 || codesToAdd.length > 0) {
        coursesUpdate = {
          ...(idsToDelete.length > 0 && {
            deleteMany: { courseId: { in: idsToDelete } },
          }),
          ...(codesToAdd.length > 0 && {
            create: codesToAdd.map((code) => ({
              course: { connect: { courseCode: code } },
            })),
          }),
        };
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
        ...(coursesUpdate && { Courses: coursesUpdate }),
      },
    });

    revalidatePath(`/article/${existingArticle.id}`);
    updateTag(cacheTags.article(existingArticle.id));
    if (formData.title !== existingArticle.title) {
      existingArticle.People.forEach((p) =>
        updateTag(cacheTags.profileWritings(p.person.slug))
      );
    }
    changedCourseCodes.forEach((code) =>
      updateTag(cacheTags.courseArticles(code))
    );

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
        Courses: { select: { course: { select: { courseCode: true } } } },
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
      updateTag(cacheTags.profileWritings(p.person.slug));
    });
    revalidatePath(`/article/${articleId}`);
    updateTag(cacheTags.article(articleId));
    existingArticle.Courses.forEach((c) =>
      updateTag(cacheTags.courseArticles(c.course.courseCode))
    );

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