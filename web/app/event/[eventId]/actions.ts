"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";
import sanitize from "sanitize-html";
import { ScopeEnum } from "@prisma/client";

import { authOptions } from "../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../utils/dbConnector";
import { supabaseStorageClient } from "../../../utils/supabaseStorageClient";
import { SANITIZE_OPTIONS } from "../../../utils";
import { EventFormData } from "../../../types";

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

export async function updateEvent(
  eventId: string,
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
      !formData.eventStartTime ||
      !formData.eventEndTime ||
      new Date(formData.eventStartTime) > new Date(formData.eventEndTime) ||
      (formData.requiresRegistration &&
        (!formData.registrationStartTime ||
          !formData.registrationEndTime ||
          new Date(formData.registrationStartTime) >
            new Date(formData.registrationEndTime)))
    ) {
      return {
        success: false,
        message: "Timings aren't right.",
      };
    }

    const existingEvent = await dbClient.event.findUnique({
      where: {
        id: eventId,
      },
    });

    if (!existingEvent) {
      return { success: false, message: "Event not found." };
    }

    let coverPhoto: string | null = existingEvent.coverPhoto;
    if (formData.coverPhoto && formData.coverPhoto !== existingEvent.coverPhoto) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData.coverPhoto as string, {
          public_id: existingEvent.id,
          folder: "event_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    } else if (!formData.coverPhoto && existingEvent.coverPhoto) {
      await cloudinary.uploader.destroy(`event_covers/${existingEvent.id}`);
      coverPhoto = null;
    }

    await dbClient.event.update({
      where: {
        id: existingEvent.id,
      },
      data: {
        typeOfEvent: formData.typeOfEvent,
        title: formData.title,
        caption: formData.caption,
        coverPhoto: coverPhoto,
        eventStartTime: formData.eventStartTime,
        eventEndTime: formData.eventEndTime,
        registrationStartTime: formData.requiresRegistration
          ? formData.registrationStartTime
          : null,
        registrationEndTime: formData.requiresRegistration
          ? formData.registrationEndTime
          : null,
        actionLink: formData.requiresActionButton ? formData.actionLink : null,
        actionText: formData.requiresActionButton ? formData.actionText : null,
      },
    });

    await supabaseStorageClient.update(
      `event/${existingEvent.id}.md`,
      new Blob([cleanContent], { type: "text/markdown" }),
      { upsert: true }
    );

    revalidatePath(`/event/${existingEvent.id}`);
    revalidatePath(`/events`);

    return { success: true, message: "Event updated successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Couldn't update event",
    };
  }
}

export async function deleteEvent(eventId: string): Promise<ActionResponse> {
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

    const existingEvent = await dbClient.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        id: true,
        coverPhoto: true,
      },
    });

    if (!existingEvent) {
      return {
        success: false,
        message: "Couldn't delete because it doesnt exist.",
      };
    }

    await dbClient.event.delete({
      where: {
        id: existingEvent.id,
      },
    });

    if (existingEvent.coverPhoto) {
      await cloudinary.uploader.destroy(`event_covers/${existingEvent.id}`);
    }
    await supabaseStorageClient.remove([`event/${existingEvent.id}.md`]);

    revalidatePath(`/event/${existingEvent.id}`);
    revalidatePath(`/events`);

    return { success: true, message: "Event deleted successfully" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Couldn't delete event",
    };
  }
}