"use server";

import { ReviewStatus, ScopeEnum } from "@prisma/client";
import dbClient from "../utils/dbConnector";

type SearchArguments = {
  query: string;
  category: "people" | "course" | "event" | "work" | "article" | "report";
  skip: number;
};

export async function searchMarvel(args: SearchArguments) {
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
        take: 12,
        skip: args.skip || 0,
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
        take: 12,
        skip: args.skip || 0,
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
        take: 12,
        skip: args.skip || 0,
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
        take: 12,
        skip: args.skip || 0,
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
        take: 12,
        skip: args.skip || 0,
      });
    case "article":
      return await dbClient.article.findMany({
        where: {
          title: {
            contains: args.query,
            mode: "insensitive",
          },
        },
        take: 12,
        skip: args.skip || 0,
      });
    default:
      return [];
  }
}