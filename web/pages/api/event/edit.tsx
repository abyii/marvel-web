import { NextApiRequest, NextApiResponse } from "next";
import { SANITIZE_OPTIONS } from "@marvel/ui/utils";
import sanitize from "sanitize-html";
import dbClient from "../../../utils/dbConnector";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import { ScopeEnum } from "@prisma/client";
import { EventFormData } from "../../../types";
import { supabaseStorageClient } from "@marvel/ui/utils/supabaseStorageClient";

export default async function update_event(
  req: NextApiRequest & { url: string },
  res: NextApiResponse
) {
  try {
    cloudinary.config({
      cloud_name: process.env.CLDNRY_CLOUD_NAME,
      api_key: process.env.CLDNRY_API_KEY,
      api_secret: process.env.CLDNRY_API_SECRET,
      secure: true,
    });

    const session = await getServerSession(req, res, authOptions);
    const formData: EventFormData = req.body;

    const condition = ["ADMIN", "CRDN"].some((s) =>
      session?.user?.scope?.map((s) => s.scope)?.includes(s as ScopeEnum)
    );

    if (!condition) return res.status(403).json({ message: "Access denied" });

    const cleanContent = sanitize(formData.description, SANITIZE_OPTIONS);

    if (
      //@ts-ignore
      formData?.eventStartTime > formData?.eventEndTime ||
      //@ts-ignore
      formData?.registrationStartTime > formData?.registrationEndTime ||
      //@ts-ignore
      formData?.eventStartTime > new Date()
    ) {
      return res.status(400).json({
        message: "Timings aren't right.",
      });
    }

    const existingEvent = await dbClient.event.findUnique({
      where: {
        id: req?.query?.id as string,
      },
    });

    let coverPhoto: string | null;
    if (
      formData?.coverPhoto &&
      formData?.coverPhoto !== existingEvent?.coverPhoto
    ) {
      coverPhoto = (
        await cloudinary.uploader.upload(formData?.coverPhoto as string, {
          public_id: existingEvent?.id,
          folder: "event_covers",
          resource_type: "image",
          overwrite: true,
          secure: true,
        })
      ).secure_url;
    } else if (
      (!formData?.coverPhoto || formData?.coverPhoto == "") &&
      (!existingEvent?.coverPhoto || existingEvent?.coverPhoto !== "")
    ) {
      await cloudinary.uploader.destroy(`event_covers/${existingEvent?.id}`);
      coverPhoto = null;
    } else {
      coverPhoto = existingEvent?.coverPhoto as string;
    }

    const updatedEvent = await dbClient.event.update({
      where: {
        id: existingEvent?.id,
      },
      data: {
        typeOfEvent: formData?.typeOfEvent,
        title: formData?.title,
        caption: formData?.caption,
        ...(coverPhoto && { coverPhoto: coverPhoto }),
        eventStartTime: formData?.eventStartTime,
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

    await supabaseStorageClient.update(
      `event/${existingEvent?.id}.md`,
      new Blob([cleanContent], { type: "text/markdown" }),
      { upsert: true }
    );

    await Promise.all([res.revalidate(`/event/${updatedEvent?.id}`)]);
    return res.status(201).json({
      message: `event updated successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `Couldn't update event`,
      error: error?.message,
    });
  }
}
