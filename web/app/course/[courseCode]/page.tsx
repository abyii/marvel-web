import { Tab, TabGroup } from "@marvel/ui/ui";
import axios from "axios";
import fs from "fs";
import ContentsIndex from "./ContentsIndex";
import CourseLevelContent from "./CourseLevelContent";
import Link from "next/link";
import { getCourse } from "./getCourse";
import { getCourseLevelFiles } from "../../../utils/github";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

// totalLevels is synced from the repo by createCourse/updateCourseMeta, not here:
// a render can't invalidate the cached course data shown by the layout.
const getSyllabus = async (courseCode: string) => {
  const course = await getCourse(courseCode);
  const levels = await getCourseLevelFiles(course?.repoURL ?? "");
  return Promise.all(
    levels.map(async (l: any) => {
      if (l.localPath && fs.existsSync(l.localPath)) {
        return fs.readFileSync(l.localPath, "utf-8");
      }
      const headers: Record<string, string> = {};
      if (process.env.GITHUB_PAT && !process.env.GITHUB_PAT.startsWith("dummy")) {
        headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
      }
      return Buffer.from(
        (
          await axios.get(l.download_url, {
            headers,
          })
        ).data
      ).toString();
    })
  );
};

export default async function page(props) {
  const params = await props.params;
  const content = await getSyllabus(params?.courseCode);
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
        <ContentsIndex totalLevels={content.length} />
        {content?.map((c, i) => (
          <div id={`${i}`} key={i} className="w-full">
            <hr className="border-p-4 my-5" />
            <h1 className="text-xl font-mono text-p-4 dark:text-p-6">
              Level {i}
            </h1>
            <hr className="border-p-4 my-5" />
            <CourseLevelContent content={c} />
          </div>
        ))}
      </div>
    </div>
  );
}
