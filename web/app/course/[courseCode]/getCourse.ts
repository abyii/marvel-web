import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import dbClient from "../../../utils/dbConnector";
import { cacheTags } from "../../../utils/cache";

/**
 * Course row shared by the course layout and syllabus page. Cached across
 * requests because `/course/<code>/works|articles` are dynamic and would
 * otherwise hit the DB on every request. Expired by `updateTag(cacheTags.course)`.
 */
export const getCourse = cache(async (courseCode: string) => {
  try {
    return await unstable_cache(
      () =>
        dbClient.course.findUnique({
          where: { courseCode },
          select: {
            id: true,
            caption: true,
            courseCode: true,
            courseDuration: true,
            coverPhoto: true,
            repoURL: true,
            totalLevels: true,
          },
        }),
      ["course", courseCode],
      { tags: [cacheTags.course(courseCode)] }
    )();
  } catch (error) {
    return null;
  }
});
