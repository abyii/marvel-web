import { Window, Paper } from "@marvel/ui/ui/server";
import { Avatar } from "../../../components/Avatar";
import dbClient from "../../../utils/dbConnector";
import EditMeta from "./EditMeta/EditMeta";
import Tabs from "./Tabs";
import Image from "next/image";
import Link from "next/link";
import { getCroppedCloudinaryImage } from "@marvel/ui/utils";
import { cache } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getWork = cache(async (id: string) => {
  try {
    const work = await dbClient.work.findUniqueOrThrow({
      where: {
        id: id,
      },
      select: {
        id: true,
        name: true,
        coverPhoto: true,
        note: true,
        courseCode: true,
        People: {
          select: {
            personId: true,
            person: {
              select: {
                slug: true,
                name: true,
                profilePic: true,
              },
            },
            role: true,
            status: true,
          },
        },
        Reports: {
          select: {
            id: true,
            reviewStatus: true,
            updatedAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        totalLevels: true,
        typeOfWork: true,
      },
    });
    console.info({ info: "got work" });
    return work;
  } catch (error) {
    return null;
  }
});

export async function generateStaticParams() {
  return [];
}
export const dynamicParams = true;

export async function generateMetadata(props): Promise<Metadata> {
  const params = await props.params;
  const work = await getWork(params?.workId);

  const title = `${
    work?.typeOfWork === "COURSE"
      ? `${work?.People?.map((p) => p?.person?.name?.split(" ")[0])?.join(
          " and "
        )}'s ${work?.courseCode} course work.`
      : work?.name
  }`;

  return {
    title: title + " | UVCE MARVEL",
    description: work?.note,
    openGraph: {
      type: "book",
      title: title + " | UVCE MARVEL",
      description: work?.note || title,
    },
  };
}

export default async function layout(props) {
  const params = await props.params;

  const {
    children
  } = props;

  const work = await getWork(params?.workId);
  if (!work) {
    notFound();
  }
  const title =
    work?.typeOfWork === "COURSE" ? (
      <>
        {work.People.filter((p) => p?.role === "AUTHOR")
          .map((a) => a?.person?.name?.split(" ")[0])
          .join(" and ")}
        &apos;s <span className="whitespace-nowrap">{work?.courseCode}</span>{" "}
        course work.{" "}
        <span className="text-sm bg-p-8 dark:bg-p-2 rounded-lg p-2">
          {`Lv ${work?.Reports?.length}`}
        </span>
      </>
    ) : (
      work?.name
    );

  const coverPhotoSrc = getCroppedCloudinaryImage(
    work?.coverPhoto as string,
    work?.typeOfWork
  );

  return (
    <Window className={"pt-12 pb-40"}>
      {/* whole thing  */}
      <div className="w-full max-w-5xl flex flex-col items-center px-5 z-10">
        <Image
          className="absolute w-full top-0 -z-10 blur-3xl h-1/2 opacity-50"
          width={"1000"}
          height={"200"}
          alt={"cover photo"}
          src={coverPhotoSrc}
        />

        {/* hero box  */}
        <Paper
          shadow
          border
          className="w-full flex flex-col md:flex-row mx-5 min-h-[250px] h-min"
        >
          {/* left box  */}
          <Paper className="relative flex flex-col justify-between bg-p-10 dark:bg-p-1 bg-opacity-50 w-full md:w-1/2 p-5 ">
            <div>
              <p className="text-p-3 dark:text-p-6 tracking-widest">
                {work?.typeOfWork}
                {work?.typeOfWork === "COURSE" ? "WORK" : ""}
              </p>
              <h1 className="text-4xl my-2">{title}</h1>
              <p className="text-p-2 dark:text-p-8 mt-5">{work?.note}</p>
            </div>
            <div className="overflow-x-auto pt-5 -mx-5 flex-grow-0 -mb-5">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <tbody className="border-b-[1.5px] border-p-0 dark:border-p-6 dark:border-b md:border-none">
                  {work?.People?.sort((p) =>
                    p?.role === "AUTHOR" ? -1 : 1
                  )?.map((p, i) => (
                    <tr
                      key={i}
                      className="border-t-[1.5px] dark:border-t p-5 border-p-3 dark:border-p-6"
                    >
                      <td className="py-3 px-5">
                        <Link 
                          key={i} 
                          href={`/u/${p?.person?.slug}`}
                          className="flex gap-3 items-center text-base"
                        >
                          <Avatar
                            className="w-5"
                            alt={p?.person?.name}
                            src={p?.person?.profilePic}
                          />
                          {p?.person?.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-xs">{p?.role}</td>
                      <td className="px-5 py-3 text-xs">{p?.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <EditMeta work={work} />
          </Paper>
          <Paper className="w-full md:w-1/2 md:h-full flex-1">
            <Image
              width={"1000"}
              height={"1000"}
              className="object-cover w-full h-full"
              src={coverPhotoSrc}
              alt={"work cover photo"}
            />
          </Paper>
        </Paper>
        <Tabs work={work} />

        <div className="w-full">{children}</div>
      </div>
    </Window>
  );
}
