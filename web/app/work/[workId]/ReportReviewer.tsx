"use client";
import { Button } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { ScopeEnum } from "@prisma/client";
import { reviewReport } from "./[reportId]/actions";

const ReportReviewer = ({ report, work }) => {
  const sessionUser = useSession().data?.user;
  const [feedback, setFeedback] = useState({ isOpen: false, content: "" });
  const [confirmApprove, setConfirmApprove] = useState(0);
  const [isPending, startTransition] = useTransition();

  const handleReview = (action: "approve" | "feedback") => {
    startTransition(async () => {
      const response = await reviewReport(
        report.id,
        action,
        feedback.content
      );
      if (response.success) {
        setConfirmApprove(0);
        setFeedback({ isOpen: false, content: "" });
      } else {
        alert(response.message);
      }
    });
  };

  if (
    //work is project and session user is one of the coordinators
    ((work?.typeOfWork === "PROJECT" &&
      work?.People?.filter(
        (p) => p?.role == "COORDINATOR" && p?.status == "ACTIVE"
      )
        ?.map((p) => p?.personId)
        .includes(sessionUser?.id)) ||
      //work is coursework and session user is a coordinator
      (work?.typeOfWork === "COURSE" &&
        sessionUser?.scope?.map((s) => s.scope).includes("CRDN")) ||
      //session user is an admin
      sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN")) &&
    //with report status being PENDING
    report?.reviewStatus === "PENDING"
  ) {
    return (
      <>
        {!feedback.isOpen && (
          <Button
            isDisabled={isPending}
            onPress={() =>
              confirmApprove === 2
                ? handleReview("approve")
                : setConfirmApprove((p) => p + 1)
            }
          >
            {confirmApprove === 0
              ? "Approve Report"
              : confirmApprove === 1
              ? "Are you sure?"
              : "Confirm."}
          </Button>
        )}
        <Button
          onPress={() => {
            setFeedback({ ...feedback, isOpen: !feedback.isOpen });
            setConfirmApprove(0);
          }}
          isDisabled={feedback.isOpen || isPending}
        >
          Flag and give feedback
        </Button>
        {feedback.isOpen && (
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <textarea
              className="w-full p-3 rounded"
              placeholder="Enter your feedback"
              value={feedback.content}
              onChange={(e) =>
                setFeedback({ ...feedback, content: e.target.value })
              }
              maxLength={225}
              required
            ></textarea>
            <div className="flex gap-5">
              <Button
                onPress={() => handleReview("feedback")}
                className="mt-5"
                isDisabled={isPending}
                type="submit"
              >
                Submit Feedback
              </Button>
              <Button
                isDisabled={isPending}
                className="mt-5 "
                onPress={() => setFeedback({ ...feedback, isOpen: false })}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </>
    );
  } else if (
    report?.reviewStatus === "FLAGGED" &&
    (work?.People?.map((p) => p?.personId).includes(sessionUser?.id) ||
      ["CRDN", "ADMIN"].some((s) =>
        sessionUser?.scope?.map((s) => s.scope).includes(s as ScopeEnum)
      ))
  ) {
    return (
      <div className="w-full p-5 rounded-lg border border-[#ff5959]">
        {report?.feedback}
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default ReportReviewer;
