import { Window } from "@marvel/ui/ui";
import EventCreatingForm from "./EventCreator";
import { EventCard } from "../../components/Cards";
import dbClient from "../../utils/dbConnector";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getEvents = async () => {
  const events = await dbClient.event.findMany({
    orderBy: {
      eventStartTime: "desc",
    },
    select:{
        id: true,
        title: true,
        typeOfEvent: true,
        caption: true,
        coverPhoto: true,
        eventStartTime: true,
        eventEndTime: true,
        registrationStartTime: true,
        registrationEndTime: true,
    }
  });
  return events;
};

const Page = async () => {
  const events = await getEvents();

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
      </div>
    </Window>
  );
};

export default Page;