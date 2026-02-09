"use client";

import React, { useTransition } from "react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  FullScreenDialog,
  TextField,
  LoadingPulser,
  Button,
  Dialog,
} from "@marvel/ui/ui";

import { MarkdownEditor } from "../../../components/MarkdownEditor";
import { updateReport } from "./[reportId]/actions";
import { ReportFormData } from "../../../types";
import { deleteCloudinaryUrls } from "../../../utils/cloudinaryUtils";
import { useCloudinaryDeletionTracker } from "../../../utils/useCloudinaryDeletionTracker";
import { scrollToDialogTop } from "../../../utils/scrollUtils";

const ReportEditor = ({ report, work }) => {
  const sessionUser = useSession().data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const [changed, setChanged] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<ReportFormData>({
    title: report?.title,
    content: report?.content,
  });
  const { getDeletionCandidates, resetTracking } =
    useCloudinaryDeletionTracker(formData.content || "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteUrls, setPendingDeleteUrls] = useState<string[]>([]);

  const handleUpdate = () =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const response = await updateReport(report.id, formData);
        if (response.success) {
          setChanged(false);
          setModalOpen(false);
        } else {
          alert(response.message);
        }
        resolve(Boolean(response.success));
      });
    });

  const submitWithCleanup = async (urlsToDelete: string[]) => {
    const success = await handleUpdate();
    if (success) {
      if (urlsToDelete.length > 0) {
        await deleteCloudinaryUrls(urlsToDelete);
      }
      resetTracking();
    }
  };

  const handleSubmit = async () => {
    const toDelete = getDeletionCandidates();
    if (toDelete.length > 0) {
      scrollToDialogTop();
      setPendingDeleteUrls(toDelete);
      setDeleteDialogOpen(true);
      return;
    }
    await submitWithCleanup([]);
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
                    onPress={handleSubmit}
                  >
                    <span className="flex items-center gap-3">
                      {isPending && <LoadingPulser className="h-5" />}
                      Update
                    </span>
                  </Button>
                </div>
                <Dialog
                  open={deleteDialogOpen}
                  onClose={() => setDeleteDialogOpen(false)}
                >
                  <h3 className="text-2xl mb-2">Delete unused images?</h3>
                  <p className="text-sm mb-5">
                    {pendingDeleteUrls.length} image
                    {pendingDeleteUrls.length === 1 ? "" : "s"} will be
                    permanently deleted as you removed url.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outlined"
                      onPress={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onPress={async () => {
                        setDeleteDialogOpen(false);
                        await submitWithCleanup(pendingDeleteUrls);
                        setPendingDeleteUrls([]);
                      }}
                    >
                      Submit and Delete
                    </Button>
                  </div>
                </Dialog>
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
