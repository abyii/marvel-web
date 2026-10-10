import { Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import dbClient from "../../../../utils/dbConnector";
import { WorkCard } from "../../../../components/Cards";
import { Pagination } from "../../../../components/Pagination";
import { unstable_cache } from "next/cache";
import { cacheTags } from "../../../../utils/cache";
import { getTotalPages, parsePage } from "../../../../utils/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

// only works that have at least one report are listed
const getWhere = (courseCode: string) => ({
  AND: [
    { courseCode: courseCode },
    {
      NOT: {
        Reports: {
          none: {},
        },
      },
    },
  ],
});

const getWorksRaw = async (courseCode: string, page: number) => {
  console.log("get works raw query: ", courseCode);

  const works = await dbClient.work.findMany({
    where: getWhere(courseCode),
    select: {
      id: true,
      typeOfWork: true,
      courseCode: true,
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
    take: PAGE_SIZE,
    skip: (page - 1) * PAGE_SIZE,
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
  });

  return JSON.parse(JSON.stringify(works));
};

const getWorks = async (courseCode: string, page: number) => {
  return await unstable_cache(
    async () => getWorksRaw(courseCode, page),
    [`course-works-${courseCode}-${page}`],
    { tags: [cacheTags.courseWorks(courseCode)] }
  )();
};

const getWorksCount = async (courseCode: string) => {
  return await unstable_cache(
    async () => dbClient.work.count({ where: getWhere(courseCode) }),
    [`course-works-count-${courseCode}`],
    { tags: [cacheTags.courseWorks(courseCode)] }
  )();
};

export default async function page(props: { params: Promise<{ courseCode: string }>, searchParams: Promise<{ page?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const currentPage = parsePage(searchParams?.page);
  const courseCode = params?.courseCode;

  const totalPages = getTotalPages(
    currentPage,
    await getWorksCount(courseCode),
    PAGE_SIZE
  );
  const works = await getWorks(courseCode, currentPage);

  return (
    <div className="flex flex-col w-full gap-5 items-center">
      <TabGroup className="self-center mt-5">
        <Link href={`/course/${params?.courseCode}/`}>
          <Tab>Syllabus</Tab>
        </Link>
        <Link href={`/course/${params?.courseCode}/articles`}>
          <Tab>Articles</Tab>
        </Link>
        <Link href={`/course/${params?.courseCode}/works`}>
          <Tab active>Works</Tab>
        </Link>
      </TabGroup>

      <div className="w-full flex gap-5 flex-wrap">
        {works?.map((a: any, i: number) => (
          <WorkCard data={a} key={i} />
        ))}
        {works.length === 0 && (
          <div className="w-full text-center py-20 text-p-4">
            No works found.
          </div>
        )}
      </div>

      <Pagination
        pathname={`/course/${courseCode}/works`}
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
