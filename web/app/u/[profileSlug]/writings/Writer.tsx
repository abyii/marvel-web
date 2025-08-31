"use client";

import { FullScreenDialog, Button } from "@marvel/ui/ui";

import { useSession } from "next-auth/react";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArticleFormData } from "../../../../types";
import { TypeOfArticle, ScopeEnum } from "@prisma/client";
import ArticleForm from "../../../../components/forms/ArticleForm";
import { createArticle } from "../actions";

const Writer = ({ authorSlug }: { authorSlug: string }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const sessionUser = useSession()?.data?.user;
  const [formData, setFormData] = useState<ArticleFormData>({
    title: "",
    caption: "",
    content: "",
    courseIds: [],
    coverPhoto: "",
  });
  const [formType, setFormType] = useState<TypeOfArticle>("BLOG");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setFormData({
      title: "",
      caption: "",
      content: "",
      courseIds: [],
      coverPhoto: "",
    });
  }, [formType]);

  const handleCreateArticle = () => {
    startTransition(async () => {
      const response = await createArticle(formType, formData);
      if (response.success) {
        router.refresh();
        setDialogOpen(false);
      } else {
        alert(response.message);
      }
    });
  };

  if (sessionUser?.slug == authorSlug) {
    return (
      <>
        <div className="flex flex-wrap gap-5 flex-auto">
          {["PROFILE", "ADMIN", "CRDN"].some((s) =>
            sessionUser?.scope?.map((s) => s.scope).includes(s as ScopeEnum)
          ) && (
            <>
              <Button
                className="flex-1"
                variant="outlined"
                onPress={() => {
                  setFormType("BLOG");
                  setDialogOpen((p) => !p);
                }}
              >
                New Blog Post
              </Button>
              <Button
                className="flex-1"
                variant="outlined"
                onPress={() => {
                  setFormType("RESOURCE");
                  setDialogOpen((p) => !p);
                }}
              >
                New Resource Article
              </Button>
            </>
          )}
        </div>
        {dialogOpen && (
          <FullScreenDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            className="z-10"
          >
            <div className="w-full pb-24">
              <ArticleForm
                formData={formData}
                setFormData={setFormData}
                typeOfArticle={formType}
                onSubmit={handleCreateArticle}
                submitDisabled={
                  isPending ||
                  (formType === "RESOURCE" && !formData?.courseIds?.length)
                }
                isSubmitLoading={isPending}
                submitLabel="Create Article"
              />
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <></>;
  }
};

export default Writer;