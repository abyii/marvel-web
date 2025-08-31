"use client";

import { FullScreenDialog, LoadingPulser, Button } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@marvel/ui/ui";
import { updateReadMe } from "./actions";

type ReadMeEditorProp = { profileSlug: string; content: string };

const ReadMeEditor = ({ profileSlug, content }: ReadMeEditorProp) => {
  const session = useSession();
  const sessionUser = session?.data?.user;
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);
  const [copy, setCopy] = useState(content);
  const [changed, setChanged] = useState<boolean>(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async () => {
    startTransition(async () => {
      const response = await updateReadMe(profileSlug, copy);
      if (response.success) {
        router.refresh();
        setChanged(false);
        setDialogOpen(false);
      } else {
        alert(response.message);
      }
    });
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
          />

          {/* action area */}
          <div className="w-full pb-48">
            <Button
              isDisabled={isPending || !changed}
              className={`float-right m-5 ${
                isPending ? "animate-pulse" : "animate-none"
              }`}
              onPress={handleUpdate}
            >
              <span className="flex items-center gap-3">
                {isPending && <LoadingPulser className="h-5" />}
                Submit
              </span>
            </Button>
          </div>
        </FullScreenDialog>
      )}
    </>
  );
};

export default ReadMeEditor;