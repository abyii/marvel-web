"use client";

import { Button, FullScreenDialog, IconButton, Paper } from "ui";
import { MarkdownEditor } from "../../../../components/MarkdownEditor";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { VscClose as CloseIcon } from "react-icons/vsc";
import { TextField } from "ui";
import { useMutation, useQuery } from "react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import ImageCompressor from "browser-image-compression";
import { ArticleFormData } from "../../../../types";
import { TypeOfArticle, ScopeEnum } from "@prisma/client";
import ImageUploader from "../../../../components/ImageUploader";

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

  useEffect(() => {
    setFormData({
      title: "",
      caption: "",
      content: "",
      courseIds: [],
      coverPhoto: "",
    });
  }, [formType]);

  const { data: courseList, isLoading: isCourseListLoading } = useQuery(
    ["course-list"],
    async () => (await axios.post(`/api/course/get-list`)).data?.courseList,
    { enabled: formType === "RESOURCE" }
  );

  const { mutate: sendMutation, isLoading: isCreateLoading } = useMutation(
    async () =>
      (
        await axios.post(`/api/article/create?type=${formType}`, {
          ...formData,
        })
      ).data,
    {
      onError: (e: AxiosError) =>
        alert(e?.response?.data?.["message"] || "Something went wrong."),
      onSuccess: () => {
        router.refresh();
        setDialogOpen(false);
      },
    }
  );

  const handleSubmit = () => {
    if (!formData?.title || formData?.title?.length < 4) {
      alert("title cannot be less than 4 characters long.");
      return;
    } else if (!formData?.content?.length) {
      alert("content cannot be empty");
      return;
    } else if (formType === "RESOURCE" && !formData?.courseIds?.length) {
      alert("Resource articles must target atleast one course.");
      return;
    } else {
      sendMutation();
    }
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
                onClick={() => {
                  setFormType("BLOG");
                  setDialogOpen((p) => !p);
                }}
              >
                New Blog Post
              </Button>
              <Button
                className="flex-1"
                variant="outlined"
                onClick={() => {
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
          <FullScreenDialog open={dialogOpen} className="z-10">
            <div className="w-full max-w-2xl py-24">
              <IconButton
                className="mb-5"
                onClick={() => setDialogOpen((p) => !p)}
              >
                <CloseIcon className="h-10 w-20" />
              </IconButton>

              <form onSubmit={(e) => e.preventDefault()}>
                <TextField
                  fullwidth
                  id="title"
                  placeholder="Title of the Article"
                  type={"text"}
                  value={formData?.title}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      title: e.target.value,
                    }))
                  }
                  maxLength={50}
                  required
                  minLength={3}
                />
                <TextField
                  className="mt-5"
                  fullwidth
                  id="caption"
                  placeholder="A short caption for your article..."
                  type={"text"}
                  value={formData?.caption}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      caption: e.target.value,
                    }))
                  }
                  maxLength={200}
                  required
                  minLength={3}
                />
                <MarkdownEditor
                  maxLength={15_000}
                  required
                  placeholder="Start writing..."
                  value={formData?.content}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, content: e?.target?.value }))
                  }
                />
                <hr className="w-full my-5" />
                <ImageUploader
                  value={formData?.coverPhoto}
                  onClick={() => {
                    setFormData({ ...formData, coverPhoto: "" });
                  }}
                  onChange={(photo) => {
                    setFormData({ ...formData, coverPhoto: photo });
                  }}
                />
                {/* tags  */}

                {formType == "RESOURCE" && (
                  <>
                    <label className="text-4xl my-5 mt-8 w-full block">
                      Target Courses
                    </label>
                    <div className="flex gap-5 flex-wrap">
                      {isCourseListLoading ? (
                        <>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Paper
                              key={i}
                              className={`rounded-lg p-5 animate-pulse bg-p-2 flex-1 h-10 w-24`}
                            ></Paper>
                          ))}
                        </>
                      ) : (
                        <>
                          {(courseList ? courseList : [])?.map((course, i) => (
                            <Paper
                              key={i}
                              onClick={() => {
                                setFormData((p) => ({
                                  ...p,
                                  courseIds: formData?.courseIds?.includes(
                                    course?.id
                                  )
                                    ? formData?.courseIds.filter(
                                        (i) => i !== course?.id
                                      )
                                    : [
                                        ...(formData?.courseIds
                                          ? formData?.courseIds
                                          : []),
                                        course?.id,
                                      ],
                                }));
                              }}
                              border={formData?.courseIds?.includes(course?.id)}
                              className={`rounded-lg ${
                                formData?.courseIds?.includes(course?.id)
                                  ? "bg-p-2 border-2 border-p-10"
                                  : "bg-p-1 border-2 border-transparent"
                              } p-5 select-none cursor-pointer box-border`}
                            >
                              <h3 className="text-2xl">{course?.courseCode}</h3>
                              <h6 className="text-xs tracking-wider">
                                {course?.totalLevels} Levels
                              </h6>
                            </Paper>
                          ))}
                        </>
                      )}
                    </div>
                  </>
                )}

                <div className="w-full flex gap-5 justify-end pb-48 mt-5">
                  <Button
                    onClick={() => handleSubmit()}
                    disabled={
                      isCreateLoading ||
                      !formData?.content ||
                      !formData?.title ||
                      (formType === "RESOURCE" && !formData?.courseIds)
                    }
                  >
                    Create Article
                  </Button>
                </div>
              </form>
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
