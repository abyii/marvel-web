"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import sanitize from "sanitize-html";

import { authOptions } from "../../pages/api/auth/[...nextauth]";
import dbClient from "../../utils/dbConnector";
import { EventFormData } from "../../types";
import { SANITIZE_OPTIONS } from "@marvel/ui/utils";
import { supabaseStorageClient } from "@marvel/ui/utils/supabaseStorageClient";
import { ScopeEnum } from "@prisma/client";

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

export async function createEvent(
  formData: EventFormData
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const condition = ["ADMIN", "CRDN"].some((s) =>
      session?.user?.scope?.map((s) => s.scope)?.includes(s as ScopeEnum)
    );

    if (!condition) {
      return { success: false, message: "Access denied" };
    }

    const cleanContent = sanitize(formData.description, SANITIZE_OPTIONS);

    if (
      (formData?.eventStartTime &&
        formData?.eventEndTime &&
        new Date(formData?.eventStartTime) > new Date(formData?.eventEndTime)) ||
      (formData?.registrationStartTime &&
        formData?.registrationEndTime &&
        new Date(formData?.registrationStartTime) >
          new Date(formData?.registrationEndTime)) ||
      (formData?.eventStartTime &&
        new Date(formData?.eventStartTime) < new Date())
    ) {
      return {
        success: false,
        message: "Timings aren't right.",
      };
    }

    const createdEvent = await dbClient.event.create({
      data: {
        typeOfEvent: formData?.typeOfEvent,
        title: formData?.title,
        caption: formData?.caption,
        coverPhoto: "",
        description: "",
        eventStartTime: formData?.eventStartTime as Date,
        eventEndTime: formData?.eventEndTime,
        ...(formData?.requiresRegistration && {
          registrationStartTime: formData?.registrationStartTime,
          registrationEndTime: formData?.registrationEndTime,
        }),
        ...(formData?.requiresActionButton && {
          actionLink: formData?.actionLink,
          actionText: formData?.actionText,
        }),
      },
      select: {
        id: true,
      },
    });

    let coverPhoto: string | null = null;
    if (formData?.coverPhoto) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData.coverPhoto as string, {
          public_id: createdEvent?.id,
          folder: "event_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    }

    // Upload event content to supabase storage
    const filePath = `event/${createdEvent.id}.md`;
    await supabaseStorageClient.upload(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" }),
      { upsert: true }
    );
    const uploadedFileUrl = supabaseStorageClient.getPublicUrl(filePath);

    await dbClient.event.update({
      where: {
        id: createdEvent?.id,
      },
      data: {
        ...(coverPhoto && { coverPhoto: coverPhoto }),
        ...(uploadedFileUrl.data && {
          description: uploadedFileUrl.data.publicUrl,
        }),
      },
    });

    revalidatePath("/events");

    return { success: true, message: "Event created successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create event",
    };
  }
}