"use client";

import { FullScreenDialog, Button } from "@marvel/ui/ui";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { EventFormData } from "../../../types";
import { Event, ScopeEnum } from "@prisma/client";
import EventForm from "../../../components/forms/EventForm";

const EventEditor = ({ event }: { event: Event }) => {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const sessionUser = useSession()?.data?.user;
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
  const queryClient = useQueryClient();

  const { mutate: sendMutation, isPending: isUpdateLoading } = useMutation({
    mutationFn: async () =>
      (
        await axios.post(`/api/event/edit?id=${event?.id}`, {
          ...formData,
        })
      ).data,
    onError: (e: AxiosError) =>
      alert(e?.response?.data?.["message"] || "Something went wrong."),
    onSuccess: () => {
      router.refresh();
      queryClient.invalidateQueries(["event_list"] as any);
      setDialogOpen(false);
    },
  });

  if (
    ["CRDN", "ADMIN"].some((s) =>
      sessionUser?.scope?.map((s) => s.scope).includes(s as ScopeEnum)
    )
  ) {
    return (
      <>
        <div>
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
                onSubmit={sendMutation}
                submitDisabled={isUpdateLoading}
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
