"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { Button } from "@marvel/ui/ui";
import { FullScreenDialog } from "@marvel/ui/ui";
import { useRouter } from "next/navigation";
import { ArticleFormData } from "../../../types";
import ArticleForm from "../../../components/forms/ArticleForm";
import { deleteArticle, updateArticle } from "./actions";

const ArticleEditor = ({ article }: { article: any }) => {
  const router = useRouter();
  const sessionUser = useSession().data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title,
    caption: article?.caption,
    content: article?.content,
    courseIds: article?.Courses?.map((c: any) => c?.courseId),
    coverPhoto: article?.coverPhoto,
  });

  const handleUpdate = async () => {
    setError(null);
    startTransition(async () => {
      const response = await updateArticle(article.id, formData);
      if (response.success) {
        router.refresh();
        setModalOpen(false);
      } else {
        setError(response.message);
      }
    });
  };

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      const response = await deleteArticle(article.id);
      if (response.success) {
        router.refresh();
        router.back();
      } else {
        setError(response.message);
      }
    });
  };

  if (
    article?.People?.filter((p: any) => p?.status !== "PENDING")
      .map((p: any) => p?.personId)
      .includes(sessionUser?.id) ||
    sessionUser?.scope?.map((s) => s?.scope)?.includes("ADMIN")
  ) {
    return (
      <>
        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}
        <Button variant="standard" onPress={() => setModalOpen(true)}>
          Edit Article
        </Button>
        <Button
          variant="outlined"
          className="border border-[red]"
          isDisabled={isPending}
          onPress={() =>
            confirmDelete === 2 ? handleDelete() : setConfirmDelete((p) => p + 1)
          }
        >
          {confirmDelete === 0
            ? "Delete Article"
            : confirmDelete === 1
            ? "Are you sure?"
            : "Confirm."}
        </Button>
        {modalOpen && (
          <FullScreenDialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <div className="w-full p-5">
              <ArticleForm
                formData={formData}
                setFormData={setFormData}
                typeOfArticle={article?.typeOfArticle}
                onSubmit={handleUpdate}
                submitDisabled={
                  isPending ||
                  (article?.typeOfArticle === "RESOURCE" &&
                    !formData?.courseIds?.length)
                }
                isSubmitLoading={isPending}
                submitLabel="Update Article"
              />
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <div></div>;
  }
};

export default ArticleEditor;
