"use client";
import React, { useEffect, useState, useTransition } from "react";
import { ArticleFormData } from "../../types";
import { Course, TypeOfArticle } from "@prisma/client";
import { Button, LoadingPulser, Paper, TextField } from "@marvel/ui/ui/";
import { MarkdownEditor } from "../MarkdownEditor";
import ImageUploader from "../ImageUploader";
import { getCourseList } from "../../app/u/[profileSlug]/actions";

type ArticleFormProps = {
  formData: ArticleFormData;
  setFormData: (args: any) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
  isSubmitLoading?: boolean;
  typeOfArticle: TypeOfArticle;
};

const ArticleForm = ({
  formData,
  setFormData,
  onSubmit,
  submitDisabled,
  submitLabel,
  isSubmitLoading,
  typeOfArticle,
}: ArticleFormProps) => {
  const [isCourseListLoading, startCourseListTransition] = useTransition();
  const [courseList, setCourseList] = useState<Course[]>([]);

  useEffect(() => {
    if (typeOfArticle === "RESOURCE") {
      startCourseListTransition(async () => {
        const response = await getCourseList();
        if (response.success) {
          setCourseList(response.courseList as Course[]);
        }
      });
    }
  }, [typeOfArticle]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <TextField
        fullWidth
        id="title"
        placeholder="Title of the Article"
        type={"text"}
        value={formData?.title}
        onChange={(e) =>
          setFormData((p: any) => ({
            ...p,
            title: e,
          }))
        }
        maxLength={50}
        isRequired
        minLength={3}
      />
      <TextField
        className="mt-5"
        fullWidth
        id="caption"
        placeholder="A short caption for your article..."
        type={"text"}
        value={formData?.caption}
        onChange={(e) =>
          setFormData((p: any) => ({
            ...p,
            caption: e,
          }))
        }
        maxLength={200}
        isRequired
        minLength={3}
      />
      <MarkdownEditor
        maxLength={15_000}
        required
        placeholder="Start writing..."
        value={formData?.content}
        onChange={(e) =>
          setFormData((p: any) => ({ ...p, content: e?.target?.value }))
        }
      />
      <hr className="w-full my-5" />
      <ImageUploader
        value={formData?.coverPhoto as string}
        onClick={() => {
          setFormData({ ...formData, coverPhoto: "" });
        }}
        onChange={(photo) => {
          setFormData({ ...formData, coverPhoto: photo });
        }}
      />
      {/* tags  */}

      {typeOfArticle == "RESOURCE" && (
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
                {(courseList ? courseList : [])?.map((course: any, i: any) => (
                  <Paper
                    key={i}
                    onClick={() => {
                      setFormData((p: any) => ({
                        ...p,
                        courseIds: formData?.courseIds?.includes(course?.id)
                          ? formData?.courseIds.filter((i) => i !== course?.id)
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
                        ? "dark:bg-p-2 bg-p-9 border-2 dark:border-p-10"
                        : "dark:bg-p-1 bg-p-9 border-2 border-transparent"
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
          onPress={() => onSubmit && onSubmit()}
          isDisabled={submitDisabled || isCourseListLoading}
          left={isSubmitLoading ? LoadingPulser : undefined}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ArticleForm;