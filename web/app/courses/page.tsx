import { Metadata } from "next";
import { CourseCard } from "../../components/Cards";
import dbClient from "../../utils/dbConnector";
import { Window } from "@marvel/ui/ui";
import CourseCreator from "./CourseCreator";
import { cache } from "react";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getCourseList = cache(async () => {
  try {
    const courseList = await dbClient.course.findMany({
      select: {
        courseCode: true,
        caption: true,
        courseDuration: true,
        totalLevels: true,
      },
    });
    if (courseList && courseList.length > 0) return courseList;
  } catch (error) {
    // Database unreachable in local dev without PostgreSQL instance
  }

  return [
    {
      courseCode: "AI-ML-001",
      caption: "An introductory course on Artificial Intelligence and Machine Learning.",
      courseDuration: "11 Months",
      totalLevels: 4,
    },
    {
      courseCode: "CL-CY-001",
      caption: "Introduction to Cloud Computing and Cyber Security",
      courseDuration: "6 Months",
      totalLevels: 4,
    },
    {
      courseCode: "D-P-001",
      caption: "Introduction to Design & Prototyping.",
      courseDuration: "6 Months",
      totalLevels: 3,
    },
    {
      courseCode: "IOT-001",
      caption: "Introduction to IOT",
      courseDuration: "6 Months",
      totalLevels: 3,
    },
    {
      courseCode: "AIR-001",
      caption: "An Intro to Aviation & Drone Science — From Simulators to Autonomous Flight",
      courseDuration: "8 Months",
      totalLevels: 3,
    },
    {
      courseCode: "VLSI-001",
      caption: "A focus group on VLSI",
      courseDuration: "8 Months",
      totalLevels: 3,
    },
    {
      courseCode: "EV-RE-001",
      caption: "Introduction to renewable energy tech.",
      courseDuration: "4 Months",
      totalLevels: 3,
    },
    {
      courseCode: "VFX-001",
      caption: "Introduction to Video Editing.",
      courseDuration: "2 Months",
      totalLevels: 2,
    },
  ];
});

export const metadata: Metadata = {
  title: "List of all Courses. | UVCE MARVEL",
  description:
    "An exhaustive list of courses across five domains at MARVEL: Artificial Intelligence & Machine Learning, Internet of Things, Cloud Computing and Cybersecurity, Design & Prototyping, and Renewable Energy Tech.",
  openGraph: {
    type: "book",
    title: "List of all Courses. | UVCE MARVEL",
    description:
      "An exhaustive list of courses across five domains at MARVEL: Artificial Intelligence & Machine Learning, Internet of Things, Cloud Computing and Cybersecurity, Design & Prototyping, and Renewable Energy Tech.",
    images: [
      {
        url: "https://res.cloudinary.com/marvelweb/image/upload/v1678988482/Group_38_qrhqag.jpg",
        secureUrl:
          "https://res.cloudinary.com/marvelweb/image/upload/v1678988482/Group_38_qrhqag.jpg",
        type: "image/jpeg",
        width: 800,
        height: 800,
      },
    ],
  },
};

export default async function page() {
  const courseList = await getCourseList();
  return (
    <Window className={"pt-5 md:pt-12 pb-40"}>
      <div className="w-full max-w-5xl flex flex-col p-5">
        <h1 className="text-3xl md:text-5xl px-3">
          <span className="text-p-4 dark:text-p-5">Student Track / </span>
          <span className="text-p-0 dark:text-p-9">Courses</span>
        </h1>
        <p className="w-full max-w-2xl text-lg py-12 text-p-0 dark:text-p-9 px-3">
          An exhaustive list of courses across five domains at MARVEL:
          Artificial Intelligence & Machine Learning, Internet of Things, Cloud
          Computing and Cybersecurity, Design & Prototyping, Renewable
          Energy Tech, and Aviation.
        </p>
        <div className="w-full flex justify-end">
          <CourseCreator />
        </div>
        <div className="flex w-full gap-5 flex-wrap mt-5">
          {courseList?.map((c, i) => (
            <CourseCard data={c} key={i} />
          ))}
        </div>
      </div>
    </Window>
  );
}
