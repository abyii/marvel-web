"use client";

import { Paper } from "@marvel/ui/ui";
import { FullScreenDialog, Button } from "@marvel/ui/ui";

import { useSession } from "next-auth/react";
import { useState, useEffect, useTransition } from "react";
import { TextField } from "@marvel/ui/ui";
import { useRouter } from "next/navigation";
import { Course, TypeOfWork } from "@prisma/client";
import { getCourseList, spawnWork } from "../actions";

type FormData = {
  selectedCourse?: string;
  projectName?: string;
  authorSlug?: string;
};

const Spawner = ({ authorSlug }: { authorSlug: string }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const session = useSession();
  const sessionUser = session?.data?.user;
  const [formData, setFormData] = useState<FormData>({
    authorSlug,
  });
  const [formType, setFormType] = useState<TypeOfWork>("PROJECT");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCourseListLoading, startCourseListTransition] = useTransition();
  const [courseList, setCourseList] = useState<Course[]>([]);

  useEffect(() => {
    setFormData({ authorSlug });
  }, [formType, authorSlug]);

  useEffect(() => {
    if (formType === "COURSE") {
      startCourseListTransition(async () => {
        const response = await getCourseList();
        if (response.success) {
          setCourseList(response.courseList as Course[]);
        }
      });
    }
  }, [formType]);

  const handleSpawnWork = () => {
    startTransition(async () => {
      const response = await spawnWork(formType, formData);
      if (response.success) {
        router.refresh();
        setDialogOpen(false);
      } else {
        alert(response.message);
      }
    });
  };

  if (
    sessionUser?.scope?.map((s) => s.scope)?.includes("CRDN") ||
    sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN")
  ) {
    return (
      <>
        <div className="flex flex-wrap gap-5 flex-auto">
          <Button
            className="flex-1"
            variant="outlined"
            onPress={() => {
              setFormType("COURSE");
              setDialogOpen((p) => !p);
            }}
          >
            New Course Work
          </Button>
          {sessionUser?.slug !== authorSlug && (
            <Button
              className="flex-1"
              variant="outlined"
              onPress={() => {
                setFormType("PROJECT");
                setDialogOpen((p) => !p);
              }}
            >
              New Project Work
            </Button>
          )}
        </div>
        {dialogOpen && (
          <FullScreenDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            className="z-10"
          >
            <div className="w-full pb-24">
              <div className={isPending ? "opacity-60 pointer-events-none" : ""}>
                {(sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN") ||
                  sessionUser?.scope
                    ?.map((s) => s.scope)
                    ?.includes("CRDN")) && (
                  <div>
                    {formType == "COURSE" ? (
                      <>
                        <div className="flex gap-5 flex-wrap my-5">
                          {isCourseListLoading ? (
                            <>
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Paper
                                  key={i}
                                  className={`rounded-lg p-5 animate-pulse bg-p-2 flex-1 min-h-[150px] min-w-[200px]`}
                                ></Paper>
                              ))}
                            </>
                          ) : (
                            <>
                              {(courseList ? courseList : [])?.map(
                                (course, i) => (
                                  <Paper
                                    key={i}
                                    onClick={() =>
                                      setFormData((p) => ({
                                        ...p,
                                        selectedCourse: course?.courseCode,
                                      }))
                                    }
                                    border={
                                      course?.courseCode ===
                                      formData?.selectedCourse
                                    }
                                    className={`rounded-lg ${
                                      course?.courseCode ===
                                      formData?.selectedCourse
                                        ? "dark:bg-p-2 bg-p-9 border-2 dark:border-p-10"
                                        : "dark:bg-p-1 bg-p-9 border-2 border-transparent"
                                    } p-5 select-none cursor-pointer box-border`}
                                  >
                                    
                                    <h3 className="text-2xl">
                                      {course?.courseCode}
                                    </h3>
                                    <p>{course?.totalLevels} Levels</p>
                                  </Paper>
                                )
                              )}
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      formType === "PROJECT" && (
                        <>
                          <div className="flex flex-wrap mb-5">
                            <label
                              htmlFor="project-name"
                              className="text-xl my-5"
                            >
                              Project Name
                            </label>
                            <TextField
                              fullWidth
                              id="project-name"
                              placeholder="Enter Project Name"
                              type={"text"}
                              value={formData?.projectName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  projectName: e,
                                })
                              }
                            />
                          </div>
                        </>
                      )
                    )}
                  </div>
                )}
                <div className="w-full flex gap-5 justify-end pb-48">
                  <Button
                    onPress={handleSpawnWork}
                    isDisabled={
                      isPending ||
                      (formType === "COURSE" && !formData?.selectedCourse) ||
                      (formType === "PROJECT" &&
                        (formData?.projectName || "")?.trim()?.length < 4)
                    }
                  >
                    {formType === "COURSE"
                      ? "Spawn Course Work"
                      : "Spawn Project"}
                  </Button>
                </div>
              </div>
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <></>;
  }
};

export default Spawner;