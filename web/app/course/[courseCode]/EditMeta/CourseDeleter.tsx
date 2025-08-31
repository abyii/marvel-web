"use client";
import { useRouter } from "next/navigation";
import { memo, useState, useTransition } from "react";
import { Paper } from "@marvel/ui/ui";
import { TextField, Button } from "@marvel/ui/ui/client";
import { deleteCourse } from "../actions";

const confirmationText = "delete sim sim";

const WorkDeleter = ({ course }) => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);
    startTransition(async () => {
      const response = await deleteCourse(course.id);
      if (response.success) {
        alert("Course deleted successfully.");
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
      <h3 className="text-2xl">Delete Course</h3>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <p>
        !!!IMPORTANT!!! Deleting this course will also delete ALL COURSE WORKS,
        and ALL RESOURCE ARTICLES. It&apos;ll be a CATASTROPHE if you don&apos;t
        know what you&apos;re doing. Are you sure? type&nbsp;
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
        Delete this Course
      </Button>
    </Paper>
  );
};

export default memo(WorkDeleter);
