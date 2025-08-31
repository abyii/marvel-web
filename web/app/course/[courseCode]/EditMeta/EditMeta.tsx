"use client";
import { FullScreenDialog, IconButton } from "@marvel/ui/ui/client";
import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { VscSettings as ManageIcon } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import { CourseFormData } from "../../../../types";
import CourseForm from "../../../../components/forms/CourseForm";
import CourseDeleter from "./CourseDeleter";
import { ScopeEnum } from "@prisma/client";
import { updateCourseMeta } from "../actions";

const EditMeta = ({ course }) => {
  const sessionUser = useSession()?.data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [copy, setCopy] = useState<CourseFormData>({
    courseDuration: course?.courseDuration,
    caption: course?.caption,
    coverPhoto: course?.coverPhoto,
    repoURL: course?.repoURL,
  });

  const handleUpdate = async () => {
    setError(null);
    startTransition(async () => {
      const response = await updateCourseMeta(course.id, copy);
      if (response.success) {
        router.refresh();
        setModalOpen(false);
      } else {
        setError(response.message);
      }
    });
  };

  //button will be visible to:
  //admins and coordinators
  if (
    ["ADMIN", "CRDN"].some((s: ScopeEnum) =>
      sessionUser?.scope?.map((s) => s?.scope)?.includes(s)
    )
  ) {
    return (
      <>
        <IconButton
          onPress={() => setModalOpen((p) => !p)}
          variant="standard"
          className="absolute top-3 right-2 text-sm"
        >
          <ManageIcon className="h-5 w-5" />
        </IconButton>
        {modalOpen && (
          <FullScreenDialog
            className="z-10"
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <div className="w-full pb-56">
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <CourseForm
                formData={copy}
                setFormData={setCopy}
                onSubmit={handleUpdate}
                submitDisabled={isPending}
                submitLabel="Update Course"
              />
              <hr className="border-p-0 dark:border-p-6 my-5" />
              {sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN") && (
                <CourseDeleter course={course} />
              )}
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <div></div>;
  }
};
export default EditMeta;
