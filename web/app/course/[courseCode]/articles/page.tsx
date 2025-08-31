import { Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import { cache } from "react";
import dbClient from "../../../../utils/dbConnector";
import { ArticleCard } from "../../../../components/Cards";

export const revalidate = 604800; //1 week

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
    orderBy: {
      createdAt: 'desc'
    },
    take:100
  });
  return JSON.parse(JSON.stringify(articles));
});

export default async function page(props) {
  const params = await props.params;
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
