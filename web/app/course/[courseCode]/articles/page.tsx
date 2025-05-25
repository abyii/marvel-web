import { Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import { cache } from "react";
import dbClient from "../../../../utils/dbConnector";
import { ArticleCard } from "../../../../components/Cards";

// Change this line:
// export const revalidate = 60 * 60 * 24 * 7; //1 week
// To this:
export const revalidate = 604800; // 1 week (60 * 60 * 24 * 7)

const getArticles = cache(async (courseCode: string) => {
  const articles = await dbClient.article.findMany({
    where: {
      Courses: {
        some: {
          course: {
            courseCode: courseCode,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      caption: true,
      createdAt: true,
      typeOfArticle: true,
    },
  });
  return JSON.parse(JSON.stringify(articles));
});

export default async function page({ params }) {
  const articles = await getArticles(params?.courseCode as string);
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
        {articles?.map((a, i) => (
          <ArticleCard data={a} key={i} />
        ))}
      </div>
    </div>
  );
}
