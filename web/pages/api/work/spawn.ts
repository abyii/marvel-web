import { NextApiRequest, NextApiResponse } from "next";
import dbClient from "../../../utils/dbConnector";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { Role, TypeOfWork } from "@prisma/client";

type FormData = {
  selectedCourse?: string;
  projectName?: string;
  authorSlug?: string;
};

export default async function spawn_new_work(
  req: NextApiRequest & { url: string },
  res: NextApiResponse
) {
  try {
    const sessionUser = (await getServerSession(req, res, authOptions))?.user;
    const formData: FormData = req.body?.formData;
    const type: TypeOfWork = req.query?.type as TypeOfWork;

    //if session user is *not* CRDN or ADMIN
    const condition = !["CRDN", "ADMIN"].some((e: any) =>
      sessionUser?.scope?.map((s) => s.scope)?.includes(e)
    );

    if (condition) return res.status(403).json({ message: "Access denied" });

    const author = await dbClient.people.findFirst({
      where: {
        slug: formData?.authorSlug,
      },
      select: {
        id: true,
        name: true,
      },
    });
    if (!author) return res.status(400).json({ message: "Invalid request" });

    if (
      await dbClient.work.count({
        where: {
          OR: [
            ...(type == "PROJECT" && formData?.projectName
              ? [{ name: formData?.projectName }]
              : []),
            ...(type == "COURSE" && formData?.selectedCourse
              ? [
                  {
                    AND: [
                      { courseCode: formData?.selectedCourse },
                      {
                        People: {
                          some: {
                            personId: author?.id,
                          },
                        },
                      },
                    ],
                  },
                ]
              : []),
          ],
        },
      })
    ) {
      console.log(type, formData);
      return res.status(400).json({
        message: "Similar work already exists. Can't create a duplicate one.",
      });
    }

    let course: { totalLevels: number } | null = { totalLevels: 0 };
    if (type == "COURSE") {
      course = await dbClient.course.findUnique({
        where: {
          courseCode: formData?.selectedCourse,
        },
        select: {
          totalLevels: true,
        },
      });
      if (!course) {
        return res.status(400).json({ message: "invalid course selection" });
      }
    }
    if (type == "PROJECT" && !formData?.projectName)
      return res.status(400).json({ message: "Invalid request" });

    await dbClient.work.create({
      data: {
        typeOfWork: type,
        ...(type === "COURSE" && {
          course: {
            connect: {
              courseCode: formData?.selectedCourse,
            },
          },
          totalLevels: Number(course?.totalLevels),
          searchTerms: author.name + " " + formData?.selectedCourse,
        }),
        ...(type === "PROJECT" && {
          name: formData?.projectName,
          searchTerms: author.name + " " + formData?.projectName,
        }),
        People: {
          create: [
            {
              person: {
                connect: {
                  id: author?.id,
                },
              },
              role: "AUTHOR",
            },
            ...(type !== "COURSE"
              ? [
                  {
                    person: {
                      connect: {
                        id: sessionUser?.id,
                      },
                    },
                    role: "COORDINATOR" as Role,
                  },
                ]
              : []),
          ],
        },
      },
    });

    await res.revalidate(`/u/${formData?.authorSlug}/works`);
    return res.json({
      status: 200,
      message: "work created successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong",
      error: error?.message,
    });
  }
}
