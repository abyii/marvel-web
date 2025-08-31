import { MarkdownRender, Tab, TabGroup } from "@marvel/ui/ui";
import dbClient from "../../../utils/dbConnector";
import axios from "axios";
import ContentsIndex from "./ContentsIndex";
import Link from "next/link";
import { cache } from "react";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getSyllabus = cache(async (courseCode: string) => {
  const course = await dbClient.course.findUnique({
    where: {
      courseCode: courseCode,
    },
    select: {
      repoURL: true,
      totalLevels: true,
      updatedAt: true,
    },
  });
  const repoName = course?.repoURL?.slice(
    course?.repoURL.search("github.com") + 11 //number of chars in github.com + 1
  );
  const owner = repoName?.split("/")?.[0];
  const repo = repoName?.split("/")?.[1];
  const filesMetaData: any = (
    await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/`, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_PAT}`,
      },
    })
  ).data;

  const levels = filesMetaData?.filter((e) =>
    /^LEVEL\d+\.md$/.test(e?.["path"])
  );
  if (course?.totalLevels !== levels?.length) {
    await dbClient.course.update({
      where: {
        courseCode: courseCode,
      },
      data: {
        totalLevels: levels?.length,
      },
    });
  }
  const content = (
    await Promise.all(
      levels?.map((l) =>
        axios.get(l?.download_url, {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_PAT}`,
          },
        })
      )
    )
  ).map((response) => Buffer.from(response?.data).toString());
  return { content, course };
});

export default async function page(props) {
  const params = await props.params;
  const { content, course } = await getSyllabus(params?.courseCode);
  return (
    <div className="flex flex-col w-full gap-5 items-center">
      <TabGroup className="self-center mt-5">
        <Link href={`/course/${params?.courseCode}/`}>
          <Tab active>Syllabus</Tab>
        </Link>
        <Link href={`/course/${params?.courseCode}/articles`}>
          <Tab>Articles</Tab>
        </Link>
        <Link href={`/course/${params?.courseCode}/works`}>
          <Tab>Works</Tab>
        </Link>
      </TabGroup>
      <div className="w-full max-w-2xl">
        <ContentsIndex course={course} />
        {content?.map((c, i) => (
          <div id={`${i + 1}`} key={i} className="w-full">
            <hr className="border-p-4 my-5" />
            <h1 className="text-xl font-mono text-p-4 dark:text-p-6">
              Level {i + 1}
            </h1>
            <hr className="border-p-4 my-5" />
            <MarkdownRender content={c} />
          </div>
        ))}
      </div>
    </div>
  );
}
