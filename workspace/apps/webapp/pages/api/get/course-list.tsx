import { NextApiRequest, NextApiResponse } from 'next';
import { course } from '@marvel/web-utils';
import dbClient from 'apps/webapp/utils/dbConnector';

export default async function (
  req: NextApiRequest & { url: string },
  res: NextApiResponse
) {
  try {
    const courseList = await dbClient.course.findMany({
      select: {
        courseCode: true,
        caption: true,
        totalLevels: true,
      },
    });

    return res.json({
      courseList: courseList,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      message: "Couldn't fetch course list",
      error: error?.message,
    });
  }
}
