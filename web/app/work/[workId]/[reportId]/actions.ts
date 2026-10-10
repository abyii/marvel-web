"use server";

import "server-only";

import { getServerSession } from "next-auth/next";
import { updateTag } from "next/cache";
import sanitize from "sanitize-html";
import { ReviewStatus } from "@prisma/client";

import { authOptions } from "../../../../pages/api/auth/[...nextauth]";
import dbClient from "../../../../utils/dbConnector";
import { supabaseStorageClient } from "../../../../utils/supabaseStorageClient";
import { SANITIZE_OPTIONS } from "../../../../utils";
import {
  cacheTags,
  revalidateGrads,
  revalidateWork,
} from "../../../../utils/cache";
import { ReportFormData } from "../../../../types";
import { MAX_PROJECT_REPORTS } from "../../../../utils/limits";

type ActionResponse<T = void> = {
  success: boolean;
  message: string;
  data?: T;
};

export async function createReport(
  workId: string,
  formData: ReportFormData
): Promise<ActionResponse<{ reportId: string }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const work = await dbClient.work.findFirst({
      where: { id: workId },
      select: {
        People: {
          where: { AND: [{ role: "AUTHOR" }, { status: "ACTIVE" }] },
        },
        courseCode: true,
        id: true,
        typeOfWork: true,
        totalLevels: true,
        Reports: { select: { id: true, reviewStatus: true } },
      },
    });

    if (!work) {
      return { success: false, message: "Work not found." };
    }

    const senderIsActiveAuthor = work?.People?.map((p) => p?.personId).includes(
      session?.user?.id as string
    );

    if (!senderIsActiveAuthor) {
      return { success: false, message: "Access denied" };
    }

    if (
      work?.typeOfWork === "COURSE" &&
      work?.Reports?.length + 1 > Number(work?.totalLevels)
    ) {
      return {
        success: false,
        message: "All the reports are already written",
      };
    }

    if (
      work?.typeOfWork === "PROJECT" &&
      work?.Reports?.length >= MAX_PROJECT_REPORTS
    ) {
      return {
        success: false,
        message: `A project can have at most ${MAX_PROJECT_REPORTS} reports`,
      };
    }

    if (
      ["PENDING", "FLAGGED"].some((e: ReviewStatus) =>
        work?.Reports?.map((r) => r?.reviewStatus).includes(e)
      )
    ) {
      return {
        success: false,
        message: "Check if all the previous reports are approved already",
      };
    }
    const cleanContent = sanitize(formData.content, SANITIZE_OPTIONS);

    if (formData?.title?.length > 60 || cleanContent?.length > 15_000) {
      return { success: false, message: "Invalid form data. too big." };
    }

    const createdReport = await dbClient.report.create({
      data: {
        title: formData?.title,
        content: "",
        reviewStatus: "PENDING",
        isOverview: work?.Reports?.length === 0 ? true : false,
        work: { connect: { id: work?.id } },
      },
      select: { id: true, isOverview: true },
    });

    const filePath = `report/${
      work?.typeOfWork == "PROJECT" ? "project" : work?.courseCode
    }/${createdReport?.id}.md`;
    await supabaseStorageClient.upload(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" })
    );
    const uploadedFileURL = await supabaseStorageClient.getPublicUrl(filePath);

    await dbClient.report.update({
      where: { id: createdReport?.id },
      data: { content: uploadedFileURL?.data.publicUrl },
    });

    revalidateWork(work.id, [
      ...work.Reports.map((r) => r.id),
      createdReport.id,
    ]);
    if (work.typeOfWork === "COURSE") {
      if (work.Reports.length === 0) {
        // first report: the work now shows up in the course's works list
        updateTag(cacheTags.courseWorks(work.courseCode as string));
      } else {
        // all previous reports were approved, so the work was listed as a grad
        revalidateGrads();
      }
    }

    return {
      success: true,
      message: `level report created successfully`,
      data: { reportId: createdReport?.isOverview ? "" : createdReport?.id },
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : `Couldn't create level report`,
    };
  }
}

export async function updateReport(
  reportId: string,
  formData: ReportFormData
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const existingReport = await dbClient.report.findFirst({
      where: { id: reportId },
      select: {
        id: true,
        workId: true,
        title: true,
        reviewStatus: true,
        isOverview: true,
        work: {
          select: {
            typeOfWork: true,
            courseCode: true,
            People: {
              where: { status: "ACTIVE" },
              select: { personId: true, role: true, status: true },
            },
            Reports: { select: { id: true } },
          },
        },
      },
    });

    if (!existingReport?.id) {
      return { success: false, message: "That report does not exist" };
    }

    const condition =
      session?.user?.scope?.map((s) => s.scope).includes("ADMIN") ||
      existingReport?.work?.People?.map((p) => p.personId).includes(
        session?.user?.id as string
      );

    if (!condition) {
      return { success: false, message: "Access denied" };
    }

    const cleanContent = sanitize(formData.content, SANITIZE_OPTIONS);

    if (formData?.title?.length > 60 || cleanContent?.length > 15_000) {
      return { success: false, message: "Invalid form data. too big." };
    }

    const filePath = `report/${
      existingReport.work?.typeOfWork == "PROJECT"
        ? "project"
        : existingReport.work?.courseCode
    }/${existingReport?.id}.md`;
    await supabaseStorageClient.update(
      filePath,
      new Blob([cleanContent], { type: "text/markdown" }),
      { upsert: true }
    );

    await dbClient.report.update({
      where: { id: existingReport.id },
      data: { title: formData?.title, reviewStatus: "PENDING" },
    });

    revalidateWork(
      existingReport.workId,
      existingReport.work.Reports.map((r) => r.id)
    );
    if (
      existingReport.work.typeOfWork === "COURSE" &&
      existingReport.reviewStatus === "APPROVED"
    ) {
      // back to PENDING: the work may drop out of the grads list
      revalidateGrads();
    }

    return { success: true, message: `level report updated successfully` };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : `Couldn't updated level report`,
    };
  }
}

export async function reviewReport(
  reportId: string,
  action: "approve" | "feedback",
  feedbackContent?: string
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return { success: false, message: "Authentication required." };
    }

    const existingReport = await dbClient.report.findFirst({
      where: { id: reportId },
      select: {
        id: true,
        workId: true,
        reviewStatus: true,
        feedback: true,
        isOverview: true,
        work: {
          select: {
            typeOfWork: true,
            People: {
              where: { AND: [{ role: "COORDINATOR" }, { status: "ACTIVE" }] },
              select: { personId: true, role: true, status: true },
            },
            Reports: { select: { id: true, reviewStatus: true } },
          },
        },
      },
    });

    if (!existingReport?.id || existingReport?.reviewStatus !== "PENDING") {
      return {
        success: false,
        message:
          "That report does not exist or it is not supposed to be reviewed.",
      };
    }

    const condition =
      (existingReport?.work?.typeOfWork === "PROJECT" &&
        existingReport?.work?.People.map((p) => p?.personId).includes(
          session?.user?.id as string
        )) ||
      (existingReport?.work?.typeOfWork === "COURSE" &&
        session?.user?.scope?.map((s) => s.scope).includes("CRDN")) ||
      session?.user?.scope?.map((s) => s.scope)?.includes("ADMIN");

    if (!condition) {
      return { success: false, message: "Access denied." };
    }

    if (action === "approve") {
      await dbClient.report.update({
        where: { id: existingReport?.id },
        data: { reviewStatus: "APPROVED", feedback: "" },
      });
    } else if (action === "feedback") {
      if (!feedbackContent || feedbackContent.length > 500) {
        return { success: false, message: "Feedback too big." };
      }
      await dbClient.report.update({
        where: { id: existingReport?.id },
        data: { reviewStatus: "FLAGGED", feedback: feedbackContent },
      });
    }

    revalidateWork(
      existingReport.workId,
      existingReport.work.Reports.map((r) => r.id)
    );
    if (
      action === "approve" &&
      existingReport.work.typeOfWork === "COURSE" &&
      existingReport.work.Reports.every(
        (r) => r.id === existingReport.id || r.reviewStatus === "APPROVED"
      )
    ) {
      // last pending report approved: the work joins the grads list
      revalidateGrads();
    }

    return { success: true, message: `level report updated successfully` };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : `Couldn't review level report`,
    };
  }
}