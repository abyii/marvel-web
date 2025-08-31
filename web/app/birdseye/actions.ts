"use server";

import { ReviewStatus, ScopeEnum } from "@prisma/client";
import dbClient from "../../utils/dbConnector";

type BirdseyeSearchArguments = {
  category: "people" | "article" | "report";
  skip: number;
};

export async function getBirdseyeData(args: BirdseyeSearchArguments) {
  switch (args.category) {
    case "report":
      return await dbClient.report.findMany({
        where: {
          reviewStatus: ReviewStatus.PENDING,
        },
        take: 12,
        skip: args.skip || 0,
      });
    case "article":
      return await dbClient.article.findMany({
        where: {
          reviewStatus: ReviewStatus.PENDING,
        },
        take: 12,
        skip: args.skip || 0,
      });
    case "people":
      return await dbClient.people.findMany({
        where: {
          scope: {
            some: {
              scope: {
                in: [ScopeEnum.ADMIN, ScopeEnum.CRDN],
              },
            },
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
    default:
      return [];
  }
}