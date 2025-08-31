"use client";
import { Button } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { reviewArticle } from "./actions";

const ArticleReviewer = ({ article }: { article: any }) => {
  const sessionUser = useSession().data?.user;
  const router = useRouter();
  const [feedback, setFeedback] = useState({ isOpen: false, content: "" });
  const [confirmApprove, setConfirmApprove] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleReview = (action: "approve" | "feedback") => {
    setError(null);
    startTransition(async () => {
      const response = await reviewArticle(
        article.id,
        action,
        feedback.content
      );
      
      if (response.success) {
        setConfirmApprove(0);
        setFeedback({ isOpen: false, content: "" });
        router.refresh();
      } else {
        setError(response.message);
      }
    });
  };

  if (
    (sessionUser?.scope?.map((s) => s.scope).includes("CRDN") ||
      sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN")) &&
    article?.reviewStatus === "PENDING"
  ) {
    return (
      <>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleReview("feedback");
            }}
            className="w-full"
          >
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
                className="mt-5"
                isDisabled={isPending}
                type="submit"
              >
                Submit Feedback
              </Button>
              <Button
                isDisabled={isPending}
                className="mt-5"
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
    article?.reviewStatus === "FLAGGED" &&
    article?.People?.filter((p: any) => p?.status !== "PENDING")
      ?.map((p: any) => p?.personId)
      .includes(sessionUser?.id)
  ) {
    return (
      <div className="w-full p-5 rounded-lg border border-[#ff5959]">
        {article?.feedback}
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default ArticleReviewer;
