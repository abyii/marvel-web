import { NextApiRequest, NextApiResponse } from 'next';
import dbClient from 'apps/webapp/utils/dbConnector';

export default async function (
  req: NextApiRequest & { url: string },
  res: NextApiResponse
) {
  try {
    const articles = await dbClient.article.findMany({
      where: {
        OR: [
          {
            title: {
              contains: req?.query?.q as string,
            },
          },
          {
            caption: {
              contains: req?.query?.q as string,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        caption: true,
        typeOfArticle: true,
        createdAt: true,
      },
      take: 12,
      skip: Number(req?.query?.skip) || 0,
    });

    return res.json({
      data: articles,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Couldn't fetch work list",
      error: error?.message,
    });
  }
}
