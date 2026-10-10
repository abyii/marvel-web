import { Paper, Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import dbClient from "../../../../utils/dbConnector";
import { cacheTags } from "../../../../utils/cache";
import { getTotalPages, parsePage } from "../../../../utils/pagination";
import { Pagination } from "../../../../components/Pagination";
import Writer from "./Writer";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function page(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params?.profileSlug as string;
  const currentPage = parsePage(searchParams?.page);
  const where = { People: { some: { person: { slug: slug } } } };
  const cacheOptions = { tags: [cacheTags.profileWritings(slug)] };

  const totalPages = getTotalPages(
    currentPage,
    await unstable_cache(
      () => dbClient.article.count({ where }),
      ["profile-writings-count", slug],
      cacheOptions
    )(),
    PAGE_SIZE
  );
  const writings = await unstable_cache(
    () =>
      dbClient.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          typeOfArticle: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ["profile-writings", slug, String(currentPage)],
    cacheOptions
  )();

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
      <Pagination
        pathname={`/u/${slug}/writings`}
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
