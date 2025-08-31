import { Paper, Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import dbClient from "../../../../utils/dbConnector";
import Writer from "./Writer";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getUserWritingsBySlug = async (slug: string) => {
  const writings = await dbClient.article.findMany({
    where: {
      People: {
        some: {
          person: {
            slug: slug,
          },
        },
      },
    },
    select: {
      id: true,
      title: true,
      coverPhoto: true,
      typeOfArticle: true,
      reviewStatus: true,
    },
  });
  console.log({ info: "find() on articles" });
  return writings;
};

export default async function page(props) {
  const params = await props.params;
  const writings = await getUserWritingsBySlug(params?.profileSlug as string);
  return (
    <div className="flex flex-col pb-36">
      {/* toggle buttons  */}
      <TabGroup className="self-center md:self-start">
        <Link href={`/u/${params?.profileSlug}/`}>
          <Tab>ReadMe</Tab>
        </Link>
        <Link href={`/u/${params?.profileSlug}/works`}>
          <Tab>Works</Tab>
        </Link>
        <Link href={`/u/${params?.profileSlug}/writings`}>
          <Tab active>Writings</Tab>
        </Link>
      </TabGroup>
      <Paper
        shadow
        border
        className="flex mt-5 p-5 rounded-lg gap-5 flex-wrap bg-p-9 dark:bg-p-0"
      >
        {writings.length == 0 ? (
          <h1 className="text-4xl text-p-4 dark:text-p-6 ">No writings</h1>
        ) : (
          <>
            {writings.map((w, i) => (
              <Link className="flex-auto" key={i} href={`/article/${w?.id}`}>
                <Paper
                  border
                  shadow={"hover"}
                  elevateOnHover
                  className="p-5 bg-p-10 dark:bg-p-1 rounded-lg min-w-fit cursor-pointer"
                >
                  {w?.typeOfArticle === "BLOG" ? (
                    <>
                      <h6 className="text-xs tracking-widest">BLOG POST</h6>
                      <h1 className="text-2xl">{w?.title}</h1>
                    </>
                  ) : (
                    <>
                      <h6 className="text-xs tracking-widest">
                        RESOURCE ARTICLE
                      </h6>
                      <h1 className="text-2xl">{w?.title}</h1>
                    </>
                  )}
                </Paper>
              </Link>
            ))}
          </>
        )}
        <Writer authorSlug={params?.profileSlug} />
      </Paper>
    </div>
  );
}
