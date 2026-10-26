"use client";

import { useMemo, useState } from "react";
import { MarkdownRender } from "@marvel/ui/ui";
import { FiChevronDown, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import clsx from "clsx";

type Block =
  | { type: "markdown"; content: string }
  | { type: "task"; title: string; content: string; id: string };

function isTaskHeader(trimmed: string): boolean {
  if (
    /^(?:#{1,3}\s+(\*\*)?|\*\*)(?:Task\s+(?:Description|Overview|Objectives|Deliverables|Outcomes|Prerequisites|Submission)|Your\s+Task|Tasks\s*:?)/i.test(
      trimmed
    )
  ) {
    return false;
  }
  return /^(?:#{1,3}\s+(\*\*)?|\*\*)(?:(TASK|Task)\s*#?\d+[a-z]?|[A-Z]{1,2}\d+\.\s*\*{0,2}[A-Za-z0-9]|\d+[\.\)]\s*[\u00a0\s]*\*{0,2}[A-Za-z0-9])/i.test(
    trimmed
  );
}

function isSectionBreak(trimmed: string): boolean {
  if (isTaskHeader(trimmed)) return false;
  return (
    /^---+\s*$/.test(trimmed) ||
    /^#{1,2}\s+/.test(trimmed) ||
    /^###\s+(\*\*)?[^*#\n]*(Path|Track|Domain|Module|Cybersecurity|Cloud)/i.test(
      trimmed
    )
  );
}

function parseLevelMarkdown(md: string): Block[] {
  if (!md) return [];
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let currentTask: { title: string; content: string[]; id: string } | null = null;
  let currentIntro: string[] = [];
  let taskCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (isTaskHeader(trimmed)) {
      if (currentIntro.length > 0) {
        blocks.push({ type: "markdown", content: currentIntro.join("\n") });
        currentIntro = [];
      }
      if (currentTask) {
        blocks.push({
          type: "task",
          title: currentTask.title,
          content: currentTask.content.join("\n"),
          id: currentTask.id,
        });
      }
      taskCount++;
      const cleanTitle = trimmed
        .replace(/^[#\s*]+/, "")
        .replace(/[*#]+$/, "")
        .replace(/\*\*/g, "")
        .trim();
      currentTask = {
        title: cleanTitle,
        content: [],
        id: `task-${taskCount}`,
      };
    } else if (currentTask) {
      if (isSectionBreak(trimmed)) {
        blocks.push({
          type: "task",
          title: currentTask.title,
          content: currentTask.content.join("\n"),
          id: currentTask.id,
        });
        currentTask = null;
        currentIntro.push(line);
      } else {
        currentTask.content.push(line);
      }
    } else {
      currentIntro.push(line);
    }
  }

  if (currentTask) {
    blocks.push({
      type: "task",
      title: currentTask.title,
      content: currentTask.content.join("\n"),
      id: currentTask.id,
    });
  }
  if (currentIntro.length > 0) {
    blocks.push({ type: "markdown", content: currentIntro.join("\n") });
  }

  return blocks;
}

export default function CourseLevelContent({ content }: { content: string }) {
  const blocks = useMemo(() => parseLevelMarkdown(content), [content]);
  const hasTasks = useMemo(() => blocks.some((b) => b.type === "task"), [blocks]);

  // Keep track of which tasks are expanded
  const [openTasks, setOpenTasks] = useState<Record<string, boolean>>({});

  const allTaskIds = useMemo(
    () => blocks.filter((b): b is Extract<Block, { type: "task" }> => b.type === "task").map((b) => b.id),
    [blocks]
  );

  const areAllOpen = allTaskIds.length > 0 && allTaskIds.every((id) => openTasks[id]);

  const toggleTask = (id: string) => {
    setOpenTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (areAllOpen) {
      setOpenTasks({});
    } else {
      const next: Record<string, boolean> = {};
      allTaskIds.forEach((id) => {
        next[id] = true;
      });
      setOpenTasks(next);
    }
  };

  // If no task headings detected, fall back to default Markdown rendering
  if (!hasTasks) {
    return <MarkdownRender content={content} />;
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {allTaskIds.length > 1 && (
        <div className="flex justify-end my-2">
          <button
            type="button"
            onClick={toggleAll}
            className="flex items-center gap-1.5 text-xs font-mono text-s-4 dark:text-s-6 hover:underline px-2.5 py-1 rounded bg-p-10 dark:bg-p-1 border border-p-8 dark:border-p-3 transition-colors cursor-pointer shadow-sm"
          >
            {areAllOpen ? (
              <>
                <FiMinimize2 className="w-3.5 h-3.5" /> Collapse all tasks
              </>
            ) : (
              <>
                <FiMaximize2 className="w-3.5 h-3.5" /> Expand all tasks ({allTaskIds.length})
              </>
            )}
          </button>
        </div>
      )}

      {blocks.map((block, idx) => {
        if (block.type === "markdown") {
          return <MarkdownRender key={`md-${idx}`} content={block.content} />;
        }

        const isOpen = Boolean(openTasks[block.id]);

        return (
          <div
            key={block.id}
            id={block.id}
            className="w-full rounded-lg border border-p-8 dark:border-p-2 bg-p-10 dark:bg-p-1/60 overflow-hidden transition-all shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleTask(block.id)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer hover:bg-p-9 dark:hover:bg-p-2/60 transition-colors select-none"
              aria-expanded={isOpen}
            >
              <div className="flex items-center gap-2.5 pr-3">
                <span className="text-base md:text-lg font-medium text-p-0 dark:text-p-10 leading-snug">
                  {block.title}
                </span>
              </div>
              <FiChevronDown
                className={clsx(
                  "w-5 h-5 shrink-0 text-p-4 dark:text-p-6 transition-transform duration-200",
                  isOpen && "rotate-180 text-s-4 dark:text-s-6"
                )}
              />
            </button>

            {isOpen && (
              <div className="px-5 py-4 border-t border-p-8 dark:border-p-2 bg-p-10 dark:bg-p-1">
                <MarkdownRender content={block.content} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
