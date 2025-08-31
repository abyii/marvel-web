"use client";

import { FullScreenDialog, Button } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EventFormData } from "../../types";
import { ScopeEnum } from "@prisma/client";
import EventForm from "../../components/forms/EventForm";
import { createEvent } from "./actions";

const EventCreatingForm = () => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const sessionUser = useSession()?.data?.user;
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    caption: "",
    description: "",
    coverPhoto: "",
    typeOfEvent: "EVENT",
    eventStartTime: new Date(),
    eventEndTime: new Date(),
    requiresRegistration: false,
    registrationStartTime: new Date(),
    registrationEndTime: new Date(new Date().setDate(new Date().getDate() + 2)),
    requiresActionButton: false,
    actionLink: "",
    actionText: "",
  });
  const router = useRouter();

  const handleSubmit = async () => {
    startTransition(async () => {
      const response = await createEvent(formData);
      if (response.success) {
        setDialogOpen(false);
        router.refresh();
      } else {
        alert(response.message);
      }
    });
  };

  if (
    ["CRDN", "ADMIN"].some((s) =>
      sessionUser?.scope?.map((s) => s.scope).includes(s as ScopeEnum)
    )
  ) {
    return (
      <>
        <div className="px-3 w-full flex justify-end">
          <Button
            onPress={() => {
              setDialogOpen((p) => !p);
            }}
          >
            Create New Event
          </Button>
        </div>
        {dialogOpen && (
          <FullScreenDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            className="z-10"
          >
            <div className="w-full pb-24">
              <EventForm
                mode="create"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                submitDisabled={isPending}
              />
            </div>
          </FullScreenDialog>
        )}
      </>
    );
  } else {
    return <></>;
  }
};

export default EventCreatingForm;