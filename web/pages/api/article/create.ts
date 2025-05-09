import { NextApiRequest, NextApiResponse } from "next";
import { SANITIZE_OPTIONS } from "@marvel/ui/utils";
import sanitize from "sanitize-html";
import dbClient from "../../../utils/dbConnector";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { v2 as cloudinary } from "cloudinary";
import { ScopeEnum, TypeOfArticle } from "@prisma/client";
import { ArticleFormData } from "../../../types";
import { supabaseStorageClient } from "@marvel/ui/utils/supabaseStorageClient";

export default async function create_article(
  req: NextApiRequest & { url: string },
  res: NextApiResponse
) {
  const typeOfArticle: TypeOfArticle = req.query.type as TypeOfArticle;

  if (!typeOfArticle) {
    return res.status(400).json({ message: "Specify article type." });
  }

  try {
    cloudinary.config({
      cloud_name: process.env.CLDNRY_CLOUD_NAME,
      api_key: process.env.CLDNRY_API_KEY,
      api_secret: process.env.CLDNRY_API_SECRET,
      secure: true,
    });

    const session = await getServerSession(req, res, authOptions);
    const formData: ArticleFormData = req.body;

    const condition = ["ADMIN", "CRDN", "PROFILE"].some((s) =>
      session?.user?.scope?.map((s) => s.scope)?.includes(s as ScopeEnum)
    );

    if (!condition) return res.status(403).json({ message: "Access denied" });

    const cleanContent = sanitize(formData.content, SANITIZE_OPTIONS);

    if (formData?.title?.length >= 60 || cleanContent?.length >= 15_000) {
      return res.status(400).json({
        message: "Invalid form data.",
      });
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

    await res.revalidate(`/u/${session?.user?.slug}/writings`);
    return res.status(201).json({
      message: `${typeOfArticle} post created successfully`,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Couldn't create ${typeOfArticle}`,
      error: error?.message,
    });
  }
}
