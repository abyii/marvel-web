import { Paper, Chip } from "@marvel/ui/ui/server";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { Event } from "@prisma/client";
import Image from "next/image";
import { getCroppedCloudinaryImage } from "@marvel/ui/utils";
import EventTimingText from "./EventTimingText";
import { DATE_OPTIONS } from "../utils/DATE_OPTIONS";
import clsx from "clsx";

export const PersonCard = ({ data: d }) => {
  return (
    <Link href={`/u/${d?.slug}`} prefetch={false} className="flex-1">
      <Paper
        border
        elevateOnHover
        className="rounded-lg p-5 flex gap-5 w-full h-full"
      >
        <Avatar className="w-10 h-10" src={d?.profilePic} alt={d?.name} />
        <h6 className="text-lg flex-1 self-center">{d?.name}</h6>
      </Paper>
    </Link>
  );
};

export const CourseCard = ({ data: d }) => {
  return (
    <Link href={`/course/${d?.courseCode}`} prefetch={false} className="flex-1">
      <Paper
        border
        elevateOnHover
        shadow={"hover"}
        className="rounded-lg p-5 w-full h-full"
      >
        <h3 className="text-3xl whitespace-nowrap">{d?.courseCode}</h3>
        <p className="text-sm text-p-3 dark:text-p-6 whitespace-nowrap">
          {d?.totalLevels} Levels &#183; {d?.courseDuration}
        </p>
        <hr className="border-p-4 my-2" />
        <p>{d?.caption}</p>
      </Paper>
    </Link>
  );
};

export const WorkCard = ({ data: d }) => {
  return (
    <Link href={`/work/${d?.id}`} prefetch={false} className="flex-1">
      <Paper border elevateOnHover className="rounded-lg p-5 w-full h-full">
        <p className="w-full text-p-4 dark:text-p-5 text-sm">
          {d?.typeOfWork} WORK
        </p>
        <h3 className="text-2xl mt-2">
          {d?.typeOfWork === "COURSE" ? (
            <>
              {d?.People?.map((a) => a?.person?.name?.split(" ")[0]).join(
                " and "
              )}
              &apos;s <span className="whitespace-nowrap">{d?.courseCode}</span>{" "}
              course work.{" "}
            </>
          ) : (
            d?.name
          )}
        </h3>
        {d?.typeOfWork === "PROJECT" && (
          <p className="w-full text-p-5 text-sm">
            By {d?.People?.map((p) => p?.person?.name)?.join(" ,")}
          </p>
        )}
      </Paper>
    </Link>
  );
};

export const ArticleCard = ({ data: d, className = null, ...props }: any) => {
  return (
    <Link
      href={`/article/${d?.id}`}
      prefetch={false}
      className={clsx("flex-1", className)}
      {...props}
    >
      <Paper border elevateOnHover className="rounded-lg p-5 w-full h-full">
        <p className="w-full text-p-4 dark:text-p-5 text-sm whitespace-nowrap">
          {d?.typeOfArticle && <>{d?.typeOfArticle} &#183;</>}
          {new Date(d?.createdAt).toLocaleDateString("en-IN")}
        </p>
        <h3 className="text-2xl mt-2">{d?.title}</h3>
        {d?.caption && (
          <p className="text-p-5 mt-2 max-h-24 overflow-hidden">{d?.caption}</p>
        )}
      </Paper>
    </Link>
  );
};

export const ReportCard = ({ data: d, className = null, ...props }: any) => {
  return (
    <Link
      href={`/work/${d?.workId}${d?.isOverview ? "" : `/${d?.id}`}`}
      prefetch={false}
      className={clsx("flex-1", className)}
      {...props}
    >
      <Paper border elevateOnHover className="rounded-lg p-5 w-full h-full">
        <p className="w-full text-p-4 dark:text-p-5 text-sm whitespace-nowrap">
          {new Date(d?.createdAt).toLocaleDateString("en-IN")}
        </p>
        <h3 className="text-2xl mt-2">{d?.title || "No Title"}</h3>
      </Paper>
    </Link>
  );
};

export const EventCard = ({ data: d }: { data: Event }) => {
  const imageSrc = getCroppedCloudinaryImage(
    d?.coverPhoto as string,
    d?.typeOfEvent
  );
  return (
    <Link href={`/event/${d?.id}`} prefetch={false} className="w-full">
      <Paper
        border
        elevateOnHover
        className="relative flex flex-col md:flex-row w-full dark:bg-p-1"
      >
        <Image
          alt={d?.title}
          src={imageSrc}
          width={800}
          height={800}
          className="relative aspect-square md:aspect-video w-full md:w-1/2 md:h-full object-cover border-p-0 md:border-r-[1.5px] md:dark:border-r dark:border-p-6 border-b-[1.5px] dark:border-b"
        ></Image>
        <div className="md:h-full relative p-5 flex flex-col gap-5 w-full md:w-1/2 h-min">
          <div className="absolute right-0 top-0 rounded-bl-lg p-2 bg-p-0 text-p-10 dark:bg-p-9 dark:text-p-0 dark:font-semibold">
            {new Date(d?.eventStartTime).toLocaleDateString(
              "en-IN",
              DATE_OPTIONS
            )}
          </div>
          <Chip>{d?.typeOfEvent}</Chip>
          <h2 className="text-4xl">{d?.title}</h2>
          <p className="dark:text-p-6 mb-16">{d?.caption}</p>
        </div>
        <EventTimingText
          data={d}
          className="absolute font-medium dark:font-normal border-t-[1.5px] dark:border-t dark:border-p-6 w-full bg-p-10 dark:bg-p-1 bottom-0 flex justify-center px-5 py-3"
        />
      </Paper>
    </Link>
  );
};
