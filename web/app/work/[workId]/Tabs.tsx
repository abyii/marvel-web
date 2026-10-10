"use client";
import { Tab, TabGroup } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import React, { useLayoutEffect, useRef } from "react";
import { MAX_PROJECT_REPORTS } from "../../../utils/limits";

const Tabs = ({ work }) => {
  const reportId = useSelectedLayoutSegment();
  const groupRef = useRef<HTMLDivElement>(null);

  // A project can have up to MAX_PROJECT_REPORTS + 1 tabs, more than fit on
  // screen: keep the active one scrolled into view, before paint so it
  // doesn't visibly jump.
  useLayoutEffect(() => {
    const group = groupRef.current;
    const active = group?.querySelector<HTMLElement>("[data-active=true]");
    if (!group || !active) return;
    const groupRect = group.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    group.scrollLeft +=
      activeRect.left -
      groupRect.left -
      (groupRect.width - activeRect.width) / 2;
  }, [reportId]);

  const allPreviousReportsAreApproved = !work?.Reports?.some(
    (r) => r?.reviewStatus === "PENDING" || r?.reviewStatus === "FLAGGED"
  );
  const startIndexOfDisabledButtons = allPreviousReportsAreApproved
    ? work?.Reports?.length + 1
    : work?.Reports?.length;

  const workTabs = work?.Reports?.map((r) => r?.id);
  const sessionUser = useSession()?.data?.user;

  // `!max-w-full` overrides TabGroup's `max-w-min`, so a long row scrolls
  // inside the group instead of widening the page.
  const groupClassName = "!max-w-full";

  if (work?.typeOfWork === "COURSE") {
    if (allPreviousReportsAreApproved) {
      workTabs?.push("new");
    }
    return (
      <div className="w-full flex justify-center my-10">
        <TabGroup ref={groupRef} className={groupClassName}>
          <>
            {Array.from({ length: work?.totalLevels }).map((_, i) => {
              const active =
                reportId === workTabs?.[i] || (!reportId && i == 0);
              return i >= startIndexOfDisabledButtons ? (
                <Tab key={i} disabled>
                  Level {i + 1}
                </Tab>
              ) : (
                <Link
                  key={i}
                  href={`/work/${work?.id}/${
                    i === 0 ? "" : workTabs?.[i] || ""
                  }`}
                >
                  <Tab active={active} data-active={active}>
                    Level {i + 1}
                  </Tab>
                </Link>
              );
            })}
          </>
        </TabGroup>
      </div>
    );
  } else if (work?.typeOfWork === "PROJECT") {
    if (workTabs?.length === 0) {
      workTabs?.push("overview");
    }
    if (
      work?.People?.filter(
        (p) => p?.status === "ACTIVE" && p?.role === "AUTHOR"
      )
        ?.map((p) => p?.personId)
        .includes(sessionUser?.id) &&
      allPreviousReportsAreApproved &&
      work?.Reports?.length < MAX_PROJECT_REPORTS
    ) {
      workTabs?.push("new");
    }
    return (
      <div className="w-full flex justify-center my-10">
        <TabGroup ref={groupRef} className={groupClassName}>
          <>
            {Array.from({ length: workTabs?.length }).map((_, i) => {
              const active =
                reportId === workTabs?.[i] || (!reportId && i == 0);
              return (
                <Link
                  key={i}
                  href={`/work/${work?.id}/${
                    i === 0 ? "" : workTabs?.[i] || ""
                  }`}
                >
                  <Tab active={active} data-active={active}>
                    {i === 0
                      ? "Overview"
                      : workTabs[i] === "new"
                      ? "New"
                      : `Stage ${i}`}
                  </Tab>
                </Link>
              );
            })}
          </>
        </TabGroup>
      </div>
    );
  } else {
    return <></>;
  }
};

export default Tabs;
