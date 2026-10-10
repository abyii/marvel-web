import { Window } from "@marvel/ui/ui";
import { unstable_cache } from "next/cache";
import EventCreatingForm from "./EventCreator";
import { EventCard } from "../../components/Cards";
import { Pagination } from "../../components/Pagination";
import dbClient from "../../utils/dbConnector";
import { cacheTags } from "../../utils/cache";
import { getTotalPages, parsePage } from "../../utils/pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 18;

const getEventsCount = unstable_cache(
  () => dbClient.event.count(),
  ["events-count"],
  { tags: [cacheTags.events] }
);

const getEvents = async (page: number) => {
  return await unstable_cache(
    () =>
      dbClient.event.findMany({
        orderBy: [{ eventStartTime: "desc" }, { id: "asc" }],
        select: {
          id: true,
          title: true,
          typeOfEvent: true,
          caption: true,
          coverPhoto: true,
          eventStartTime: true,
          eventEndTime: true,
          registrationStartTime: true,
          registrationEndTime: true,
        },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ["events", String(page)],
    { tags: [cacheTags.events] }
  )();
};

const Page = async ({ searchParams }: { searchParams: Promise<{ page?: string }> }) => {
  const currentPage = parsePage((await searchParams)?.page);
  const totalPages = getTotalPages(currentPage, await getEventsCount(), PAGE_SIZE);
  const events = await getEvents(currentPage);

  return (
    <Window className={"pt-5 md:pt-12 pb-40"}>
      <div className="w-full max-w-4xl flex flex-col p-5">
        {/* header  */}
        <div className="my-10">
          <h1 className="text-4xl md:text-6xl px-3">
            <span className="text-p-0 dark:text-p-9">events</span>
            <span className="text-p-4 dark:text-p-5">&nbsp;at marvel.</span>
          </h1>
          <p className="w-full max-w-2xl text-lg py-5 text-p-0 dark:text-p-6 px-3">
            Events, Workshops, Competitions and Talks at UVCE MARVEL.
          </p>
        </div>
        <EventCreatingForm />
        <div className="flex w-full gap-5 flex-wrap mt-5">
          {events.map((d, i) => (
            <EventCard data={d as any} key={i} />
          ))}
        </div>
        <Pagination pathname="/events" page={currentPage} totalPages={totalPages} />
      </div>
    </Window>
  );
};

export default Page;