import { Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import dbClient from "../../../../utils/dbConnector";
import { ArticleCard } from "../../../../components/Cards";
import { Pagination } from "../../../../components/Pagination";
import { unstable_cache } from "next/cache";
import { cacheTags } from "../../../../utils/cache";
import { getTotalPages, parsePage } from "../../../../utils/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

const getWhere = (courseCode: string) => ({
  Courses: {
    some: {
      course: {
        courseCode: courseCode,
      },
    },
  },
});

const getArticlesRaw = async (courseCode: string, page: number) => {
  console.log("get articles raw query: ", courseCode);

  const articles = await dbClient.article.findMany({
    where: getWhere(courseCode),
    select: {
      id: true,
      title: true,
      caption: true,
      createdAt: true,
      typeOfArticle: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return JSON.parse(JSON.stringify(articles));
};

const getArticles = async (courseCode: string, page: number) => {
  return await unstable_cache(
    async () => getArticlesRaw(courseCode, page),
    [`course-articles-${courseCode}-${page}`],
    { tags: [cacheTags.courseArticles(courseCode)] }
  )();
};

const getArticlesCount = async (courseCode: string) => {
  return await unstable_cache(
    async () => dbClient.article.count({ where: getWhere(courseCode) }),
    [`course-articles-count-${courseCode}`],
    { tags: [cacheTags.courseArticles(courseCode)] }
  )();
};

export default async function page(props: { params: Promise<{ courseCode: string }>, searchParams: Promise<{ page?: string }> }) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const currentPage = parsePage(searchParams?.page);
  const courseCode = params?.courseCode;

  const totalPages = getTotalPages(
    currentPage,
    await getArticlesCount(courseCode),
    PAGE_SIZE
  );
  const articles = await getArticles(courseCode, currentPage);

  return (
    <div className="flex flex-col w-full gap-5 items-center">
      <TabGroup className="self-center mt-5">
        <Link href={`/course/${params?.courseCode}/`}>
          <Tab>Syllabus</Tab>
        </Link>
        <Link href={`/course/${params?.courseCode}/articles`}>
          <Tab active>Articles</Tab>
        </Link>
        <Link href={`/course/${params?.courseCode}/works`}>
          <Tab>Works</Tab>
        </Link>
      </TabGroup>

      <div className="w-full flex gap-5 flex-wrap">
        {articles?.map((a: any, i: number) => (
          <ArticleCard data={a} key={i} />
        ))}
        {articles.length === 0 && (
          <div className="w-full text-center py-20 text-p-4">
            No articles found.
          </div>
        )}
      </div>

      <Pagination
        pathname={`/course/${courseCode}/articles`}
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
