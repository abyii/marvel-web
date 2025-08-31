"use client";

import React, { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  FullScreenDialog,
  TextField,
  LoadingPulser,
  Button,
} from "@marvel/ui/ui";

import { MarkdownEditor } from "../../../components/MarkdownEditor";
import { updateReport } from "./[reportId]/actions";
import { ReportFormData } from "../../../types";

const ReportEditor = ({ report, work }) => {
  const sessionUser = useSession().data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const [changed, setChanged] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<ReportFormData>({
    title: report?.title,
    content: report?.content,
  });

  const handleUpdate = () => {
    startTransition(async () => {
      const response = await updateReport(report.id, formData);
      if (response.success) {
        setChanged(false);
        setModalOpen(false);
      } else {
        alert(response.message);
      }
    });
  };

  if (
    work?.People?.filter((p) => p?.status === "ACTIVE")
      .map((p) => p?.personId)
      .includes(sessionUser?.id) ||
    sessionUser?.scope?.map((s) => s.scope).includes("ADMIN")
  ) {
    return (
      <>
        <Button variant="standard" onPress={() => setModalOpen(true)}>
          Edit Report
        </Button>
        {modalOpen && (
          <FullScreenDialog
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          >
            <div className="w-full pb-24">
              <form onSubmit={(e) => e.preventDefault()} className="pt-10">
                {!(work?.typeOfWork === "PROJECT" && report?.isOverview) && (
                  <TextField
                    isRequired
                    id="title"
                    fullWidth
                    placeholder="Title of the Report..."
                    value={formData?.title}
                    onChange={(e) => {
                      setFormData({ ...formData, title: e });
                      setChanged(true);
                    }}
                    maxLength={190}
                  />
                )}
                <MarkdownEditor
                  required
                  maxLength={15_000}
                  value={formData.content}
                  onChange={(e) => {
                    setFormData({ ...formData, content: e?.target?.value });
                    setChanged(true);
                  }}
                />
                {/* action area  */}
                <div className="w-full pb-48">
                  <Button
                    type="submit"
                    isDisabled={isPending || !changed}
                    className={`float-right m-5 ${
                      isPending ? "animate-pulse" : "animate-none"
                    }`}
                    onPress={handleUpdate}
                  >
                    <span className="flex items-center gap-3">
                      {isPending && <LoadingPulser className="h-5" />}
                      Update
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

export default ReportEditor;
