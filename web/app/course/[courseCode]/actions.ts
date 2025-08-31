"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import { ScopeEnum } from "@prisma/client";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import { CourseFormData } from "../../../types";

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

export async function updateCourseMeta(
  courseId: string,
  formData: CourseFormData
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const condition = ["ADMIN", "CRDN"].some((s: ScopeEnum) =>
      session?.user?.scope?.map((s) => s?.scope)?.includes(s)
    );

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    if (formData?.caption && formData?.caption?.length > 200) {
      return { success: false, message: "Invalid form data." };
    }

    const course = await dbClient.course.findUnique({
      where: { id: courseId },
      select: { coverPhoto: true, id: true, courseCode: true },
    });

    if (!course) {
      return { success: false, message: "Course not found." };
    }

    let coverPhoto: string | null = course.coverPhoto;
    if (formData.coverPhoto && formData.coverPhoto !== course.coverPhoto) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData.coverPhoto as string, {
          public_id: course.id,
          folder: "course_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    } else if (!formData.coverPhoto && course.coverPhoto) {
      await cloudinary.uploader.destroy(`course_covers/${course.id}`);
      coverPhoto = null;
    }

    await dbClient.course.update({
      where: { id: course.id },
      data: {
        coverPhoto: coverPhoto,
        caption: formData.caption,
        courseDuration: formData.courseDuration,
        repoURL: formData.repoURL,
      },
    });

    revalidatePath(`/course/${course.courseCode}`);
    revalidatePath(`/courses`);

    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update course",
    };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const hasPermission = session.user.scope?.some(
      (s) => s.scope === "ADMIN"
    );
    if (!hasPermission) {
      return { success: false, message: "Access denied." };
    }

    const existingCourse = await dbClient.course.findUnique({
      where: { id: courseId },
      select: { id: true, courseCode: true, coverPhoto: true },
    });

    if (!existingCourse) {
      return { success: false, message: "Course not found." };
    }

    await dbClient.articleToCourse.deleteMany({
      where: { courseId: existingCourse.id },
    });

    await dbClient.course.delete({
      where: { id: existingCourse.id },
    });

    if (existingCourse.coverPhoto) {
      await cloudinary.uploader.destroy(`course_covers/${existingCourse.id}`);
    }

    revalidatePath("/courses");
    revalidatePath(`/course/${existingCourse.courseCode}`);

    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete course",
    };
  }
}