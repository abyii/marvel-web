"use client";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, Paper, TextField } from "@marvel/ui/ui";

const confirmationText = "delete sim sim";

const WorkDeleter = ({ work }) => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const { isPending, mutate } = useMutation({
    mutationFn: async () =>
      (await axios.delete(`/api/work/delete?id=${work?.id}`)).data,
    onError: (e: AxiosError) =>
      alert(e?.response?.data?.["message"] || "Coundn't delete."),
    onSuccess: () => {
      alert("Work deleted successfully.");
      router.back();
    },
  });

  return (
    <Paper
      border
      className={
        "p-5 w-full border-[red] flex gap-5 flex-col bg-p-10 dark:bg-p-0 mt-5 rounded-lg"
      }
    >
      <h3 className="text-2xl">Delete Work</h3>
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
        onPress={() => mutate()}
      >
        Delete this Work
      </Button>
    </Paper>
  );
};

export default memo(WorkDeleter);
