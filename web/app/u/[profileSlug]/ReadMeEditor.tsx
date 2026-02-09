"use client";

import { FullScreenDialog, LoadingPulser, Button, Dialog } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@marvel/ui/ui";
import { updateReadMe } from "./actions";
import { deleteCloudinaryUrls } from "../../../utils/cloudinaryUtils";
import { useCloudinaryDeletionTracker } from "../../../utils/useCloudinaryDeletionTracker";
import { scrollToDialogTop } from "../../../utils/scrollUtils";
import { useFileUpload } from "../../../utils/useFileUpload";

type ReadMeEditorProp = { profileSlug: string; content: string };

const ReadMeEditor = ({ profileSlug, content }: ReadMeEditorProp) => {
  const session = useSession();
  const sessionUser = session?.data?.user;
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [copy, setCopy] = useState(content);
  const [changed, setChanged] = useState<boolean>(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { uploadFile } = useFileUpload({ maxSize: 50 * 1024 * 1024 });
  const { getDeletionCandidates, resetTracking } =
    useCloudinaryDeletionTracker(copy);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteUrls, setPendingDeleteUrls] = useState<string[]>([]);

  const handleUpdate = () =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const response = await updateReadMe(profileSlug, copy);
        if (response.success) {
          router.refresh();
          setChanged(false);
          setDialogOpen(false);
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

  return (
    <>
      {((sessionUser?.slug === profileSlug &&
        sessionUser?.scope?.map((s) => s.scope)?.includes("PROFILE")) ||
        sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN")) && (
        <Button
          onPress={() => setDialogOpen((p) => !p)}
          variant="outlined"
          className="w-max mt-5 self-end"
        >
          Edit ReadMe
        </Button>
      )}
      {isDialogOpen && (
        <FullScreenDialog
          open={isDialogOpen}
          onClose={() => setDialogOpen(false)}
        >
          <MarkdownEditor
            className="min-w-full"
            value={copy}
            onChange={(e) => {
              setCopy(e?.target?.value);
              setChanged(true);
            }}
            onFileSelected={uploadFile}
          />

          {/* action area */}
          <div className="w-full pb-48">
            <Button
              isDisabled={isPending || !changed}
              className={`float-right m-5 ${
                isPending ? "animate-pulse" : "animate-none"
              }`}
              onPress={handleSubmit}
            >
              <span className="flex items-center gap-3">
                {isPending && <LoadingPulser className="h-5" />}
                Submit
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
              {pendingDeleteUrls.length === 1 ? "" : "s"} will be permanently
              deleted as you removed url.
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
        </FullScreenDialog>
      )}
    </>
  );
};

export default ReadMeEditor;
