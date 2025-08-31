import { MarkdownRender, Paper } from "@marvel/ui/ui";
import dbClient from "../../../utils/dbConnector";
import ReportWriter from "./ReportWriter";
import ReportReviewer from "./ReportReviewer";
import ReportEditor from "./ReportEditor";
import Image from "next/image";
import axios from "axios";

export const revalidate = false; // cache the page forever, will only be revalidated by revalidatePath()

const getReport = async (workId: string) => {
  const work = await dbClient.work.findUnique({
    where: {
      id: workId,
    },
    select: {
      courseCode: true,
      id: true,
      People: {
        select: {
          personId: true,
          role: true,
          status: true,
        },
      },
      _count: {
        select: {
          Reports: true,
        },
      },
      typeOfWork: true,
      totalLevels: true,
    },
  });
  const report = await dbClient.report.findFirst({
    where: {
      workId: workId,
    },
    take: 1,
    orderBy: {
      createdAt: "asc",
    },
    select: {
      title: true,
      content: true,
      id: true,
      reviewStatus: true,
      feedback: true,
      createdAt: true,
      isOverview: true,
      updatedAt: true,
    },
  });
  if (report?.content) {
    report.content = (await axios.get(report.content)).data;
  }
  return JSON.parse(JSON.stringify({ report, work }));
};

export default async function page(props) {
  const params = await props.params;
  const { report, work } = await getReport(params?.workId);
  return (
    <div className="flex flex-col w-full gap-5 items-center">
      {!report ? (
        <div className="w-full flex flex-col items-center mx-5 max-w-3xl gap-5">
          <>
            <h1 className="text-2xl">
              {work?.typeOfWork === "PROJECT" ? "Overview" : "Level 1 report"}{" "}
              is yet to be written.
            </h1>

            <Image
              className="aspect-video rounded-lg max-w-full"
              src="https://media.tenor.com/w-L80nXWEjoAAAAd/pen-in-flames-umineko.gif"
              alt="Level report is yet to be written"
              width={"700"}
              height={"500"}
            />
            <ReportWriter work={work} />
          </>
        </div>
      ) : (
        <div className="w-full max-w-2xl">
          {report?.reviewStatus === "PENDING" ? (
            <Paper
              border
              className="rounded-lg p-5 mb-5 bg-[#ffdf7f] text-[#4b4b00] dark:bg-[#3a3a00] dark:text-[#ffd262]"
            >
              This Report is yet to be approved by a Coordinator.
            </Paper>
          ) : (
            report?.reviewStatus == "FLAGGED" && (
              <Paper
                border
                className="rounded-lg p-5 mb-5 bg-[#ff7f7f] text-[#4b0000] dark:bg-[#3a0000] dark:text-[#ff6a6a]"
              >
                This Report is flagged by a Coordinator and it probably requires
                some changes to be approved.
              </Paper>
            )
          )}
          {!(work?.typeOfWork === "PROJECT" && report?.isOverview) && (
            <>
              <h2 className="text-4xl mb-5">{report?.title}</h2>
              <p className="text-p-3 dark:text-p-6">
                {new Date(report?.createdAt)
                  ?.toLocaleDateString("en-IN")
                  .split("/")
                  .join(" / ")}
              </p>
              <hr className="my-5 border-p-3" />
            </>
          )}
          <MarkdownRender content={report?.content} />
          <div className="w-full flex justify-end gap-5 flex-wrap my-5">
            <ReportReviewer report={report} work={work} />
            <ReportEditor report={report} work={work} />
          </div>
        </div>
      )}
    </div>
  );
}
