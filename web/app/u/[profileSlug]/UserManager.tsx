"use client";

import { Paper } from "@marvel/ui/ui";
import { FullScreenDialog, Button } from "@marvel/ui/ui";

import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import {
  AiOutlineMinusCircle as MinusIcon,
  AiOutlinePlusCircle as PlusIcon,
} from "react-icons/ai";
import { useRouter } from "next/navigation";
import { Scope, ScopeEnum } from "@prisma/client";
import { manageScope } from "./actions";

const Manager = ({ dude }: { dude: any }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const session = useSession();
  const sessionUser = session?.data?.user;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleAction = async (action: "add" | "remove", scope: ScopeEnum) => {
    startTransition(async () => {
      const response = await manageScope(dude?.slug, action, scope);
      if (response.success) {
        router.refresh();
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
        <div className="w-full">
          <Button onPress={() => setDialogOpen((p) => !p)}>Manage User</Button>
        </div>
        {dialogOpen && (
          <FullScreenDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            className="z-10"
          >
            <div className="w-full pb-24">
              <div
                className={isPending ? "opacity-60 pointer-events-none" : ""}
              >
                {(sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN") ||
                  sessionUser?.scope
                    ?.map((s) => s.scope)
                    ?.includes("CRDN")) && (
                  <div>
                    <Paper
                      border
                      shadow
                      className="rounded-lg pl-5 pt-5 min-h-[60px] mt-5"
                    >
                      {dude?.scope?.map((s: Scope, i: number) => (
                        <Button
                          key={i}
                          onPress={() => handleAction("remove", s?.scope)}
                          variant="outlined"
                          className="mr-5 mb-5 inline-flex items-center gap-2"
                        >
                          <MinusIcon />
                          {s.scope}
                        </Button>
                      ))}
                    </Paper>
                    <div className="pl-5 pt-5">
                      {[
                        "PROFILE",
                        ...(sessionUser?.scope
                          ?.map((s) => s.scope)
                          ?.includes("ADMIN")
                          ? ["CRDN", "ADMIN"]
                          : []),
                      ].map(
                        (s: ScopeEnum, i: number) =>
                          !dude?.scope?.map((s: any) => s.scope)?.includes(s) && (
                            <Button
                              key={i}
                              onPress={() => handleAction("add", s)}
                              variant="outlined"
                              className="mr-5 mb-5 inline-flex items-center gap-2"
                            >
                              <PlusIcon />
                              {s}
                            </Button>
                          )
                      )}
                    </div>
                  </div>
                )}
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

export default Manager;