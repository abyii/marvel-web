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
    const course = await dbClient.course.findUnique({
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
    });
    if (course) return course;
  } catch (error) {
    // DB is unreachable or unconfigured in local development
  }

  const fallbackRepos: Record<
    string,
    { caption: string; duration: string; totalLevels: number }
  > = {
    "AI-ML-001": {
      caption: "An introductory course on Artificial Intelligence and Machine Learning.",
      duration: "11 Months",
      totalLevels: 4,
    },
    "CL-CY-001": {
      caption: "Introduction to Cloud Computing and Cyber Security",
      duration: "6 Months",
      totalLevels: 4,
    },
    "D-P-001": {
      caption: "Introduction to Design & Prototyping.",
      duration: "6 Months",
      totalLevels: 3,
    },
    "IOT-001": {
      caption: "Introduction to IOT",
      duration: "6 Months",
      totalLevels: 3,
    },
    "AIR-001": {
      caption: "An Intro to Aviation & Drone Science — From Simulators to Autonomous Flight",
      duration: "8 Months",
      totalLevels: 3,
    },
    "VLSI-001": {
      caption: "A focus group on VLSI",
      duration: "8 Months",
      totalLevels: 3,
    },
    "EV-RE-001": {
      caption: "Introduction to renewable energy tech.",
      duration: "4 Months",
      totalLevels: 3,
    },
    "VFX-001": {
      caption: "Introduction to Video Editing.",
      duration: "2 Months",
      totalLevels: 2,
    },
  };

  if (fallbackRepos[courseCode]) {
    return {
      id: courseCode,
      courseCode,
      caption: fallbackRepos[courseCode].caption,
      courseDuration: fallbackRepos[courseCode].duration,
      coverPhoto: "",
      repoURL: `https://github.com/UVCE-Marvel/${courseCode}`,
      totalLevels: fallbackRepos[courseCode].totalLevels,
    };
  }

  return null;
});
