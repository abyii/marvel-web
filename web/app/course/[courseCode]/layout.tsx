import { Window, Paper } from "@marvel/ui/ui";
import dbClient from "../../../utils/dbConnector";
import Image from "next/image";
import EditMeta from "./EditMeta/EditMeta";
import { getCroppedCloudinaryImage } from "@marvel/ui/utils";
import { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getCourse = cache(async (id: string) => {
  try {
    const course = await dbClient.course.findUnique({
      where: {
        courseCode: id,
      },
      select: {
        id: true,
        caption: true,
        courseCode: true,
        courseDuration: true,
        coverPhoto: true,
        repoURL: true,
        totalLevels: true,
        updatedAt: true,
      },
    });
    console.info({ info: "got course" });
    return course;
  } catch (error) {
    return null;
  }
});

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const course = await getCourse(params?.courseCode);

  return {
    title: `${course?.courseCode} | UVCE MARVEL`,
    description: course?.caption,
    openGraph: {
      type: "book",
      title: `${course?.courseCode} | UVCE MARVEL`,
      description: course?.caption,
    },
  } as Metadata;
}

export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export default async function layout(props) {
  const params = await props.params;

  const {
    children
  } = props;

  const course = await getCourse(params?.courseCode);

  if (!course) {
    notFound();
  }

  const coverPhotoSrc = getCroppedCloudinaryImage(
    course?.coverPhoto as string,
    "COURSE_PAGE"
  );

  return (
    <Window className={"pt-12 pb-40"}>
      {/* whole thing  */}
      <div className="w-full max-w-5xl flex flex-col items-center px-5 z-10">
        {/* hero box  */}
        <Image
          className="absolute w-full top-0 -z-10 blur-3xl h-1/2 opacity-50"
          width={"1000"}
          height={"200"}
          alt={"cover photo"}
          src={coverPhotoSrc}
        />

        <Paper
          shadow
          border
          className="w-full flex flex-col md:flex-row mx-5 min-h-[250px] h-min"
        >
          {/* left box  */}
          <Paper className="border-b-[1.5px] border-p-0 dark:border-p-6 dark:border-b md:border-none relative flex flex-col justify-between bg-opacity-50 bg-p-10 dark:bg-p-1 w-full md:w-1/2 h-full p-5">
            <div>
              <p className="text-p-3 dark:text-p-6 tracking-widest">COURSE</p>
              <h1 className="text-6xl my-2">{course?.courseCode}</h1>
              <p className="text-p-3 dark:text-p-8 text-sm">
                {course?.totalLevels} Levels &#183; {course?.courseDuration}
              </p>
              <p className="text-p-3 dark:text-p-8 mt-5">{course?.caption}</p>
            </div>
            <EditMeta course={course} />
          </Paper>
          <Paper className="w-full md:w-1/2 md:h-full flex-1">
            <Image
              width={"1000"}
              height={"1000"}
              className="max-h-min object-cover w-full h-full"
              src={coverPhotoSrc}
              alt={course?.courseCode}
            />
          </Paper>
        </Paper>
        <div className="w-full">{children}</div>
      </div>
    </Window>
  );
}
