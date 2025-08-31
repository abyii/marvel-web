"use client";

import { FullScreenDialog, Button } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EventFormData } from "../../../types";
import { Event, ScopeEnum } from "@prisma/client";
import EventForm from "../../../components/forms/EventForm";
import { updateEvent } from "./actions";

const EventEditor = ({ event }: { event: Event }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const sessionUser = useSession()?.data?.user;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: event.title || "",
    caption: event.caption || "",
    description: event.description || "",
    coverPhoto: event.coverPhoto || "",
    typeOfEvent: event.typeOfEvent || "EVENT",
    eventStartTime: new Date(event.eventStartTime) || new Date(),
    eventEndTime: event?.eventEndTime
      ? new Date(event?.eventEndTime)
      : new Date(),
    requiresRegistration: !!event.registrationStartTime || false,
    registrationStartTime: event?.registrationStartTime
      ? new Date(event.registrationStartTime)
      : new Date(),
    registrationEndTime: event?.registrationEndTime
      ? new Date(event.registrationEndTime)
      : new Date(new Date().setDate(new Date().getDate() + 2)),
    requiresActionButton: !!event.actionLink || false,
    actionLink: event.actionLink || "",
    actionText: event.actionText || "",
  });
  const router = useRouter();

  const handleUpdate = async () => {
    setError(null);
    startTransition(async () => {
      const response = await updateEvent(event.id, formData);
      if (response.success) {
        router.refresh();
        setDialogOpen(false);
      } else {
        setError(response.message);
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
        <div>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <Button
            variant="outlined"
            onPress={() => {
              setDialogOpen((p) => !p);
            }}
          >
            Edit this Event
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
                mode="edit"
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleUpdate}
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

export default EventEditor;
