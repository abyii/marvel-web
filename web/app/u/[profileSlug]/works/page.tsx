import { Paper, Tab, TabGroup } from "@marvel/ui/ui";
import Link from "next/link";
import { unstable_cache } from "next/cache";
import dbClient from "../../../../utils/dbConnector";
import { cacheTags } from "../../../../utils/cache";
import { getTotalPages, parsePage } from "../../../../utils/pagination";
import { Pagination } from "../../../../components/Pagination";
import Spawner from "./Spawner";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

export default async function page(props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const slug = params?.profileSlug as string;
  const currentPage = parsePage(searchParams?.page);
  // every role the person has on a work counts
  const where = { People: { some: { person: { slug: slug } } } };
  const cacheOptions = { tags: [cacheTags.profileWorks(slug)] };

  const totalPages = getTotalPages(
    currentPage,
    await unstable_cache(
      () => dbClient.work.count({ where }),
      ["profile-works-count", slug],
      cacheOptions
    )(),
    PAGE_SIZE
  );
  const works = await unstable_cache(
    () =>
      dbClient.work.findMany({
        where,
        select: {
          id: true,
          name: true,
          courseCode: true,
          typeOfWork: true,
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ["profile-works", slug, String(currentPage)],
    cacheOptions
  )();

  return (
    <div className="flex flex-col pb-36">
      {/* toggle buttons  */}
      <TabGroup className="self-center md:self-start">
        <Link href={`/u/${slug}/`}>
          <Tab>ReadMe</Tab>
        </Link>
        <Link href={`/u/${slug}/works`}>
          <Tab active>Works</Tab>
        </Link>
        <Link href={`/u/${slug}/writings`}>
          <Tab>Writings</Tab>
        </Link>
      </TabGroup>
      <Paper
        shadow
        border
        className="flex mt-5 p-5 rounded-lg gap-5 flex-wrap bg-p-9 dark:bg-p-0"
      >
        {works.length == 0 ? (
          <h1 className="text-4xl">No works</h1>
        ) : (
          <>
            {works.map((w, i) => (
              <Link className="flex-auto" key={i} href={`/work/${w?.id}`}>
                <Paper
                  border
                  shadow={"hover"}
                  elevateOnHover
                  className="p-5 bg-p-10 dark:bg-p-1 rounded-lg min-w-fit cursor-pointer"
                >
                  {w?.typeOfWork === "COURSE" ? (
                    <>
                      <h6 className="text-xs tracking-widest">COURSE WORK</h6>
                      <h1 className="text-2xl">{w?.courseCode} Course Work</h1>
                    </>
                  ) : (
                    <>
                      <h6 className="text-xs tracking-widest">PROJECT WORK</h6>
                      <h1 className="text-2xl">{w?.name}</h1>
                    </>
                  )}
                </Paper>
              </Link>
            ))}
          </>
        )}
        {/* keyed so form state doesn't carry over between profiles */}
        <Spawner key={slug} authorSlug={slug} />
      </Paper>
      <Pagination
        pathname={`/u/${slug}/works`}
        page={currentPage}
        totalPages={totalPages}
      />
    </div>
  );
}
