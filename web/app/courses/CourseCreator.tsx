"use client";
import { Button, FullScreenDialog, IconButton } from "@marvel/ui/ui/client";
import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { VscSettings as ManageIcon } from "react-icons/vsc";
import { useRouter } from "next/navigation";
import { CourseFormData } from "../../types";
import CourseForm from "../../components/forms/CourseForm";
import { createCourse } from "./actions";

const CourseCreator = () => {
  const sessionUser = useSession()?.data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseFormData>({
    courseCode: "",
    courseDuration: "",
    caption: "",
    coverPhoto: "",
    repoURL: "",
  });

  const handleCreate = async () => {
    setError(null);
    startTransition(async () => {
      const response = await createCourse(formData);
      if (response.success) {
        router.refresh();
        setModalOpen(false);
      } else {
        setError(response.message);
      }
    });
  };

  if (sessionUser?.scope?.map((s) => s.scope).includes("ADMIN")) {
    return (
      <>
        <Button
          onPress={() => setModalOpen((p) => !p)}
          variant="standard"
          className="top-3 right-2"
        >
          Create Course
        </Button>
        {modalOpen && (
          <FullScreenDialog
            className="z-10"
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <div className="w-full pb-56">
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <CourseForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleCreate}
                submitDisabled={isPending}
                submitLabel="Create Course"
                showCourseCode
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
export default CourseCreator;
