"use server";

import { ReviewStatus, ScopeEnum } from "@prisma/client";
import { getServerSession } from "next-auth/next";

import { authOptions } from "../../pages/api/auth/[...nextauth]";
import dbClient from "../../utils/dbConnector";

type BirdseyeSearchArguments = {
  category: "people" | "article" | "report";
  skip: number;
};

export async function getBirdseyeData(args: BirdseyeSearchArguments) {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.scope?.some(
      (s) => s.scope === ScopeEnum.CRDN || s.scope === ScopeEnum.ADMIN
    )
  ) {
    throw new Error("Access denied.");
  }
  // client-supplied offset: a negative or fractional skip makes Prisma throw
  const skip = Math.max(0, Math.trunc(Number(args.skip) || 0));
  switch (args.category) {
    case "report":
      // oldest pending first, so the review queue is worked in order
      return await dbClient.report.findMany({
        where: {
          reviewStatus: ReviewStatus.PENDING,
        },
        select: {
          id: true,
          title: true,
          isOverview: true,
          workId: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    case "article":
      return await dbClient.article.findMany({
        where: {
          reviewStatus: ReviewStatus.PENDING,
        },
        select: {
          id: true,
          title: true,
          caption: true,
          typeOfArticle: true,
          createdAt: true,
        },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        take: 12,
        skip,
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
        orderBy: [{ name: "asc" }, { id: "asc" }],
        take: 12,
        skip,
      });
    default:
      return [];
  }
}