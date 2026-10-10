"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath, updateTag } from "next/cache";

import { authOptions } from "../../pages/api/auth/[...nextauth]";
import dbClient from "../../utils/dbConnector";
import { CourseFormData } from "../../types";
import { cacheTags } from "../../utils/cache";
import { getCourseLevelFiles } from "../../utils/github";

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

export async function createCourse(
  formData: CourseFormData
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const isAdmin = session.user.scope?.some((s) => s.scope === "ADMIN");
    if (!isAdmin) {
      return { success: false, message: "Access denied." };
    }

    if (formData?.caption && formData?.caption?.length > 200) {
      return { success: false, message: "Invalid form data." };
    }

    const levels = await getCourseLevelFiles(formData.repoURL as string);

    const createdCourse = await dbClient.course.create({
      data: {
        courseCode: formData.courseCode as string,
        caption: formData.caption,
        courseDuration: formData.courseDuration,
        repoURL: formData.repoURL,
        totalLevels: levels?.length,
      },
      select: {
        id: true,
      },
    });

    if (formData.coverPhoto) {
      const coverPhoto = (
        await cloudinary.uploader.upload(formData.coverPhoto as string, {
          public_id: createdCourse.id,
          folder: "course_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
      await dbClient.course.update({
        where: {
          id: createdCourse.id,
        },
        data: {
          coverPhoto: coverPhoto,
        },
      });
    }

    revalidatePath("/courses");
    // the course code may have been cached as not-found
    revalidatePath(`/course/${formData.courseCode}`);
    updateTag(cacheTags.course(formData.courseCode as string));

    return { success: true, message: "Course created successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}