"use server";

import { getServerSession } from "next-auth/next";

import { authOptions } from "../pages/api/auth/[...nextauth]";
import dbClient from "../utils/dbConnector";

type SearchArguments = {
  query: string;
  category: "people" | "course" | "event" | "work" | "article" | "report";
  skip: number;
};

// reports are returned regardless of review status: report pages are public
export async function searchMarvel(args: SearchArguments) {
  if (!(await getServerSession(authOptions))) {
    throw new Error("Sign in to search.");
  }
  // client-supplied offset: a negative or fractional skip makes Prisma throw
  const skip = Math.max(0, Math.trunc(Number(args.skip) || 0));
  switch (args.category) {
    case "people":
      return await dbClient.people.findMany({
        where: {
          name: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        select: {
          name: true,
          slug: true,
          profilePic: true,
          id: true,
          scope: {
            where: {
              OR: [{ scope: "CRDN" }, { scope: "ADMIN" }],
            },
          },
        },
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    case "course":
      return await dbClient.course.findMany({
        where: {
          OR: [
            {
              courseCode: {
                contains: args.query,
                mode: "insensitive",
              },
            },
            {
              caption: {
                contains: args.query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          courseCode: true,
          caption: true,
          totalLevels: true,
          courseDuration: true,
        },
        orderBy: [{ courseCode: "asc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    case "event":
      return await dbClient.event.findMany({
        where: {
          OR: [
            {
              title: {
                contains: args.query,
                mode: "insensitive",
              },
            },
            {
              caption: {
                contains: args.query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          typeOfEvent: true,
          caption: true,
          coverPhoto: true,
          eventStartTime: true,
          eventEndTime: true,
          registrationStartTime: true,
          registrationEndTime: true,
        },
        orderBy: [{ eventStartTime: "desc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    case "work":
      return await dbClient.work.findMany({
        where: {
          OR: [
            {
              name: {
                contains: args.query,
                mode: "insensitive",
              },
            },
            {
              courseCode: {
                contains: args.query,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          name: true,
          id: true,
          courseCode: true,
          typeOfWork: true,
          People: {
            select: {
              person: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    case "report":
      return await dbClient.report.findMany({
        where: {
          title: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          title: true,
          isOverview: true,
          workId: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    case "article":
      return await dbClient.article.findMany({
        where: {
          title: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        select: {
          id: true,
          title: true,
          caption: true,
          typeOfArticle: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    default:
      return [];
  }
}