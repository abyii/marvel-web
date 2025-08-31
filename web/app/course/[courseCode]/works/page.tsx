import { Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import { cache } from "react";
import dbClient from "../../../../utils/dbConnector";
import { WorkCard } from "../../../../components/Cards";

export const revalidate = 604800; //1 week

const getWorks = cache(async (courseCode: string) => {
  const works = await dbClient.work.findMany({
    where: {
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
    },
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
    take: 100,
    orderBy: {
      createdAt: 'desc'
    }
  });
  return works;
});

export default async function page(props) {
  const params = await props.params;
  const works = await getWorks(params?.courseCode as string);
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
        {works?.map((a, i) => (
          <WorkCard data={a} key={i} />
        ))}
      </div>
    </div>
  );
}
