"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import axios from "axios";

import { authOptions } from "../../pages/api/auth/[...nextauth]";
import dbClient from "../../utils/dbConnector";
import { CourseFormData } from "../../types";

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

    const repoName = formData?.repoURL?.slice(
      formData?.repoURL.search("github.com") + 11 //number of chars in github.com + 1
    );
    const owner = repoName?.split("/")?.[0];
    const repo = repoName?.split("/")?.[1];
    const filesMetaData: any = (
      await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contents/`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_PAT}`,
          },
        }
      )
    ).data;
    const levels = filesMetaData?.filter((e: any) =>
      /^LEVEL\d+\.md$/.test(e?.["path"])
    );

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

    return { success: true, message: "Course created successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}