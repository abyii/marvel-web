"use client";
import {
  Button,
  IconButton,
  NumberField,
  TextField,
  FullScreenDialog,
} from "@marvel/ui/ui/client";

import { useSession } from "next-auth/react";
import React, { useState, useTransition } from "react";
import { VscSettings as ManageIcon } from "react-icons/vsc";
import ManagePeople from "./ManagePeople";
import { useRouter } from "next/navigation";
import { WorkFormData } from "../../../../types";
import WorkDeleter from "./WorkDeleter";
import ImageUploader from "../../../../components/ImageUploader";
import { ScopeEnum } from "@prisma/client";
import { updateWorkMeta } from "../actions";

const EditMeta = ({ work }) => {
  const sessionUser = useSession()?.data?.user;
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [copy, setCopy] = useState<WorkFormData & { totalLevels?: number }>(() => ({
    name: work?.name ?? "",
    note: work?.note ?? "",
    coverPhoto: work?.coverPhoto ?? "",
    totalLevels: work?.totalLevels ?? 1,
  }));
  const [changed, setChanged] = useState(false);

  const handleUpdate = async () => {
    setError(null);
    startTransition(async () => {
      const response = await updateWorkMeta(work.id, copy);
      if (response.success) {
        router.refresh();
        setModalOpen(false);
      } else {
        setError(response.message);
        alert(response.message)
      }
    });
  };

  //button will be visible to:
  //those who are active members of the work.
  //if its a coursework, then to regular coordinators
  //and admins
  if (
    work?.People?.filter((p) => p?.status == "ACTIVE")
      ?.map((p) => p?.personId)
      .includes(sessionUser?.id) ||
    //work is coursework and session user is a coordinator
    (work?.typeOfWork === "COURSE" &&
      sessionUser?.scope?.map((s) => s.scope).includes("CRDN")) ||
    //session user is an admin
    sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN")
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
            <div className="w-full pb-24">
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <form
                className="my-5 flex flex-col pb-56 gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdate();
                }}
              >
                {work?.typeOfWork === "PROJECT" && (
                  <>
                    <label htmlFor="name" className="text-3xl py-3">
                      Project Name
                    </label>
                    <TextField
                      fullWidth
                      id="name"
                      value={copy?.name}
                      onChange={(e) => {
                        setCopy({ ...copy, name: e });
                        setChanged(true);
                      }}
                      placeholder="Project name"
                      maxLength={60}
                    />
                  </>
                )}
                <label htmlFor="caption" className="text-3xl py-3">
                  Caption
                </label>
                <TextField
                  fullWidth
                  id="caption"
                  value={copy?.note}
                  onChange={(e) => {
                    setCopy({ ...copy, note: e });
                    setChanged(true);
                  }}
                  placeholder="(Optional). A short caption..."
                  maxLength={200}
                />
                <ImageUploader
                  value={copy?.coverPhoto as any}
                  onClick={() => {
                    setCopy({ ...copy, coverPhoto: "" });
                    setChanged(true);
                  }}
                  onChange={(photo) => {
                    setCopy({ ...copy, coverPhoto: photo as string });
                    setChanged(true);
                  }}
                />
                {work?.typeOfWork == "COURSE" &&
                  ["ADMIN", "CRDN"].some((s: ScopeEnum) =>
                    sessionUser?.scope?.map((s) => s.scope)?.includes(s)
                  ) && (
                    <>
                      <div>
                        <label htmlFor="totalLevels" className="text-3xl py-3">
                          No. of levels
                        </label>
                        <p className="text-p-4 dark:text-p-5">
                          The number of reports authors can write in this course
                          work is equal to the number of levels.
                        </p>
                      </div>

                      <NumberField
                        id="totalLevels"
                        value={copy?.totalLevels}
                        fullWidth
                        minValue={1}
                        maxValue={6}
                        onChange={(e) => {
                          setCopy({
                            ...copy,
                            totalLevels: Number(e),
                          });
                          setChanged(true);
                        }}
                      />
                    </>
                  )}
                <Button
                  className="max-w-max self-end"
                  isDisabled={isPending || !changed}
                  type="submit"
                >
                  Update
                </Button>
                <hr className="my-5 border-r-p-4 dark:border-p-4" />
                {/* amoung the conditions valid till here, exclude work authors. 
                and include admins
                */}
                {(!work?.People?.filter((p) => p?.role == "AUTHOR")
                  ?.map((p) => p?.personId)
                  ?.includes(sessionUser?.id) ||
                  sessionUser?.scope
                    ?.map((s) => s.scope)
                    ?.includes("ADMIN")) && <ManagePeople work={work} />}

                <WorkDeleter work={work} />
              </form>
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <div className="absolute"></div>;
  }
};
export default EditMeta;
