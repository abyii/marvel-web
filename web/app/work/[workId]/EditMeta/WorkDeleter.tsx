"use client";
import { useRouter } from "next/navigation";
import { memo, useState, useTransition } from "react";
import { Button, Paper, TextField } from "@marvel/ui/ui";
import { deleteWork } from "../actions";

const confirmationText = "delete sim sim";

const WorkDeleter = ({ work }) => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      const response = await deleteWork(work.id);
      if (response.success) {
        alert("Work deleted successfully.");
        router.back();
      } else {
        setError(response.message);
      }
    });
  };

  return (
    <Paper
      border
      className={
        "p-5 w-full border-[red] flex gap-5 flex-col bg-p-10 dark:bg-p-0 mt-5 rounded-lg"
      }
    >
      <h3 className="text-2xl">Delete Work</h3>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <p>
        Deleting this work will also delete all of the reports in this work. Are
        you sure?. Type{" "}
        <span className="font-bold text-s-4 dark:text-s-5">
          {confirmationText}
        </span>{" "}
        to confirm.
      </p>
      <TextField
        fullWidth
        placeholder="Type here..."
        value={input}
        onChange={(e) => setInput(e)}
      />
      <Button
        variant="outlined"
        isDisabled={input !== confirmationText || isPending}
        onPress={handleDelete}
      >
        Delete this Work
      </Button>
    </Paper>
  );
};

export default memo(WorkDeleter);
