"use client";
import { Button } from "@marvel/ui/ui";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import { deleteEvent } from "./actions";

const EventDeleter = ({ event }) => {
  const sessionUser = useSession().data?.user;
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      const response = await deleteEvent(event.id);
      if (response.success) {
        router.back();
      } else {
        setError(response.message);
        setConfirmDelete(0);
      }
    });
  };

  if (
    sessionUser?.scope?.map((s) => s.scope).includes("CRDN") ||
    sessionUser?.scope?.map((s) => s.scope)?.includes("ADMIN")
  ) {
    return (
      <>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <Button
          className="z-10 w-min"
          isDisabled={isPending}
          onPress={() =>
            confirmDelete === 2 ? handleDelete() : setConfirmDelete((p) => p + 1)
          }
        >
          {confirmDelete === 0
            ? "Delete this Event"
            : confirmDelete === 1
            ? "Are you sure?"
            : "Confirm."}
        </Button>
      </>
    );
  } else {
    return <div></div>;
  }
};

export default EventDeleter;
