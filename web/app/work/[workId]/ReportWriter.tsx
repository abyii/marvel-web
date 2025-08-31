"use client";
import { Button, LoadingPulser, TextField } from "@marvel/ui/ui";
import { FullScreenDialog } from "@marvel/ui/ui";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { MarkdownEditor } from "../../../components/MarkdownEditor";
import { useRouter } from "next/navigation";
import { createReport } from "./[reportId]/actions";
import { ReportFormData } from "../../../types";

const ReportWriter = ({ work }) => {
  const router = useRouter();
  const sessionUser = useSession().data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<ReportFormData>({
    title: "",
    content: "",
  });

  const handleCreate = () => {
    startTransition(async () => {
      const response = await createReport(work.id, formData);
      if (response.success) {
        setFormData({ title: "", content: "" });
        setModalOpen(false);
        router.replace(`/work/${work?.id}/${response.data?.reportId}`);
      } else {
        alert(response.message || "Something went wrong");
      }
    });
  };

  if (
    sessionUser &&
    work?.People?.map(
      (p) => p?.status == "ACTIVE" && p?.role == "AUTHOR" && p?.personId
    ).includes(sessionUser?.id)
  ) {
    return (
      <>
        <Button variant="standard" onPress={() => setModalOpen(true)}>
          Write Report!
        </Button>
        {modalOpen && (
          <FullScreenDialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <div className="w-full pb-24">
              <form onSubmit={(e) => e.preventDefault()} className="pt-10">
                {!(
                  work?.typeOfWork === "PROJECT" && work?._count?.Reports === 0
                ) && (
                  <TextField
                    id="title"
                    maxLength={190}
                    isRequired
                    fullWidth
                    placeholder="Title of the Report..."
                    value={formData?.title}
                    onChange={(e) => setFormData({ ...formData, title: e })}
                  />
                )}
                <MarkdownEditor
                  maxLength={15_000}
                  required
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e?.target?.value });
                  }}
                />
                {/* action area  */}
                <div className="w-full pb-48">
                  <Button
                    type="submit"
                    isDisabled={isPending}
                    className={`float-right m-5 ${
                      isPending ? "animate-pulse" : "animate-none"
                    }`}
                    onPress={handleCreate}
                  >
                    <span className="flex gap-3 items-center">
                      {isPending && <LoadingPulser className="h-5" />}
                      Submit
                    </span>
                  </Button>
                </div>
              </form>
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <div></div>;
  }
};

export default ReportWriter;
