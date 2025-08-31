import { Metadata } from "next";
import { cache } from "react";
import dbClient from "../../../utils/dbConnector";
import { Chip, MarkdownRender, Paper, Window } from "@marvel/ui/ui";
import { Button } from "@marvel/ui/ui/";
import EventTimingText from "../../../components/EventTimingText";
import Link from "next/link";
import Image from "next/image";
import { getCroppedCloudinaryImage } from "@marvel/ui/utils";
import { IoMdInformationCircleOutline as InfoIcon } from "react-icons/io";
import { DATE_OPTIONS } from "../../../utils/DATE_OPTIONS";
import EventEditor from "./EventEditor";
import EventDeleter from "./EventDeleter";
import axios from "axios";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getEvent = cache(async (id: string) => {
  try {
    const event = await dbClient.event.findUnique({
      where: {
        id: id,
      },
    });
    if (event) {
      event.description = await (
        await axios.get(event?.description as string)
      ).data;
    }
    console.info({ info: "got event" });
    return event;
  } catch (error) {
    return null;
  }
});

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const event = await getEvent(params?.eventId);

  const og_url = new URL(`${process.env.NEXTAUTH_URL}/api/og/event`);
  og_url.searchParams.append("title", event?.title as string);
  og_url.searchParams.append("caption", event?.caption as string);
  og_url.searchParams.append("typeOfEvent", event?.typeOfEvent as string);
  og_url.searchParams.append(
    "startTime",
    event?.eventStartTime?.toLocaleDateString("en-IN", DATE_OPTIONS) as string
  );
  og_url.searchParams.append(
    "coverPhoto",
    getCroppedCloudinaryImage(
      event?.coverPhoto as string,
      event?.typeOfEvent as any
    )
  );

  return {
    title: `${
      event?.title
    } | ${event?.typeOfEvent?.toLowerCase()} at UVCE MARVEL`,
    description: event?.caption,
    openGraph: {
      type: "website",
      title: `${
        event?.title
      } | ${event?.typeOfEvent?.toLowerCase()} at UVCE MARVEL`,
      description: event?.caption,
      images: [
        {
          url: og_url,
          secureUrl: og_url,
          type: "image/jpeg",
          width: 800,
          height: 800,
        },
      ],
    },
  } as Metadata;
}

type TimeLineItemProps = {
  startTime: Date;
  endTime: Date;
  title: string;
  calendarTitle: string;
  calendarDescription: string;
};
const TimeLineItem: React.FC<TimeLineItemProps> = ({
  startTime,
  endTime,
  title,
  calendarTitle,
  calendarDescription,
}) => {
  const baseUrl = "https://www.google.com/calendar/render";
  const params = new URLSearchParams();

  params.append("action", "TEMPLATE");
  params.append("text", calendarTitle);
  params.append(
    "dates",
    `${startTime?.toISOString().replace(/-|:|\.\d+/g, "")}/${endTime
      ?.toISOString()
      .replace(/-|:|\.\d+/g, "")}`
  );
  params.append("details", calendarDescription);

  const link = `${baseUrl}?${params.toString()}`;
  return (
    <div className="flex flex-col gap-3 bg-p-9 dark:bg-p-1 rounded-lg p-5">
      <h5 className="font-medium text-lg">{title}</h5>
      <h6 className="text-sm">
        Starts at {startTime?.toLocaleDateString("en-IN", DATE_OPTIONS)} and
        ends at {endTime?.toLocaleDateString("en-IN", DATE_OPTIONS)}
      </h6>
      <Link href={link} target="_blank" rel="nofollow">
        <Button className="w-full">Add this to my Calendar</Button>
      </Link>
    </div>
  );
};

export default async function page(props) {
  const params = await props.params;
  const event = await getEvent(params?.eventId);
  const imageSrc = getCroppedCloudinaryImage(
    event?.coverPhoto as string,
    event?.typeOfEvent as any
  );

  return (
    <>
      <Window className="pt-10 py-40">
        <Image
          className="absolute w-full top-0  blur-3xl h-1/2 opacity-50"
          width={"1000"}
          height={"200"}
          alt={"cover photo"}
          src={imageSrc}
        />
        <div className="w-full max-w-5xl flex gap-5 flex-col md:flex-row mx-5">
          <Paper
            shadow
            border
            className="relative w-full md:max-w-xs flex flex-col max-h-min h-min bg-p-10 dark:bg-p-0"
          >
            <div className="absolute z-10 right-0 top-0 rounded-bl-lg py-2 px-5 bg-p-10 dark:bg-p-0 font-semibold">
              {event?.eventStartTime.toLocaleDateString("en-IN", DATE_OPTIONS)}
            </div>
            <Image
              alt={event?.title || "Event Cover Photo"}
              src={imageSrc}
              width={800}
              height={800}
              className="relative aspect-square w-full object-cover border-p-0 dark:border-p-6 border-b-[1.5px] dark:border-b"
            ></Image>
            <div className="flex flex-col gap-5 p-5">
              <Chip>{event?.typeOfEvent}</Chip>
              <h1 className="text-5xl">{event?.title}</h1>
              <p>{event?.caption}</p>
              {event?.actionLink && (
                <Link
                  href={event?.actionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outlined" className="w-full">
                    {event?.actionText}
                  </Button>
                </Link>
              )}
            </div>
            <EventTimingText
              data={JSON.parse(JSON.stringify(event))}
              className="w-full font-medium border-y-[1.5px] dark:border-y dark:border-p-6 dark:font-normal flex items-center px-5 py-3"
            >
              <InfoIcon className="w-8 h-8 mr-3" />
            </EventTimingText>
            <div className="relative p-5 flex flex-col gap-5">
              <div className="absolute border-dotted h-full left-5 w-[1px]" />
              <h3 className="text-2xl">Schedule:</h3>
              {event?.registrationStartTime && (
                <TimeLineItem
                  title="Registrations"
                  startTime={event?.registrationStartTime}
                  endTime={event?.registrationEndTime as Date}
                  calendarTitle={event?.title + " registrations"}
                  calendarDescription={
                    process?.env?.NEXTAUTH_URL + "/event/" + event?.id
                  }
                />
              )}
              <TimeLineItem
                title="Event"
                startTime={event?.eventStartTime as Date}
                endTime={event?.eventEndTime as Date}
                calendarTitle={event?.title as string}
                calendarDescription={
                  process?.env?.NEXTAUTH_URL + "/event/" + event?.id
                }
              />
            </div>
          </Paper>

          <div className="flex flex-col gap-5 w-full">
            <Paper
              shadow
              border
              className="p-5 h-min w-full z-10 bg-[rgba(255,255,255,0.8)] dark:bg-[rgba(0,0,0,0.8)]"
            >
              <MarkdownRender content={event?.description as string} />
            </Paper>
            <div className="z-10 w-full flex justify-end gap-5">
              <EventDeleter event={JSON.parse(JSON.stringify(event))} />
              <EventEditor event={JSON.parse(JSON.stringify(event))} />
            </div>
          </div>
        </div>
      </Window>
    </>
  );
}
