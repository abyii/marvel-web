import { NextApiRequest, NextApiResponse } from "next";
import dbClient from "../../../utils/dbConnector";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function delete_article(
  req: NextApiRequest & { url: string },
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    const existingArticle = await dbClient.article.findUnique({
      where: {
        id: req?.query?.id as string,
      },
      select: {
        id: true,
        typeOfArticle: true,
        People: {
          select: {
            personId: true,
            role: true,
            person: {
              select: {
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!existingArticle)
      return res.json({ message: "Couldn't delete because it doesnt exist." });
    const condition = existingArticle?.People?.filter((p) => p?.role === "OP")
      ?.map((p) => p.personId)
      ?.includes(session?.user?.id as string);

    if (!condition) return res.status(403).json({ message: "Access denied" });

    await dbClient.articleToPeople.deleteMany({
      where: {
        articleId: existingArticle?.id,
      },
    });
    if (existingArticle?.typeOfArticle === "RESOURCE") {
      await dbClient?.articleToCourse.deleteMany({
        where: {
          articleId: existingArticle?.id,
        },
      });
    }
    await dbClient.article.delete({
      where: {
        id: existingArticle?.id,
      },
    });

    await Promise.all(
      existingArticle?.People?.map((p) =>
        res.revalidate(`/u/${p?.person?.slug}/writings`)
      )
    );

    return res.status(201).json({
      message: `deleted successfully`,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: `Couldn't delete article`,
      error: error?.message,
    });
  }
}