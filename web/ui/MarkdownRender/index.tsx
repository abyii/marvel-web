import { memo, type JSX } from "react";
import Markdown from "react-markdown";
import { decode } from "he";
import sanitizer from "sanitize-html";
import { SANITIZE_OPTIONS } from "@marvel/ui/utils";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

type MarkdownRenderType = JSX.IntrinsicElements["div"] & { content: string };

export const MarkdownRender = memo(
  ({ content, className, ...props }: MarkdownRenderType) => {
    return (
      <Markdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[[remarkGfm, { singleTilde: false }]]}
        components={{
          h1: ({ children }) => <h1 className="text-5xl my-5">{children}</h1>,
          h2: ({ children }) => <h2 className="text-4xl my-5">{children}</h2>,
          h3: ({ children }) => <h3 className="text-3xl my-5">{children}</h3>,
          h4: ({ children }) => <h4 className="text-2xl my-5">{children}</h4>,
          h5: ({ children }) => <h5 className="text-xl my-5">{children}</h5>,
          h6: ({ children }) => <h6 className="text-xl my-5">{children}</h6>,
          blockquote: ({ children }) => (
            <blockquote className="p-5 my-5 bg-p-9 dark:bg-p-2 border-l-2 shadow-2xl shadow-p-2">
              {children}
            </blockquote>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1.5 list-decimal list-outside pl-6 my-3">
              {children}
            </ol>
          ),
          ul: ({ children, className, ...props }: any) => {
            const isTaskList = className?.includes("contains-task-list");
            return (
              <ul
                className={clsx(
                  "space-y-1.5 my-3",
                  isTaskList
                    ? "list-none pl-1 space-y-2"
                    : "list-disc list-outside pl-6"
                )}
                {...props}
              >
                {children}
              </ul>
            );
          },
          li: ({ children, className, ...props }: any) => {
            const isTask = className?.includes("task-list-item");
            return (
              <li
                className={clsx(
                  "leading-relaxed",
                  isTask
                    ? "flex items-start gap-2.5 list-none my-1.5"
                    : "my-1"
                )}
                {...props}
              >
                {children}
              </li>
            );
          },
          input: ({ type, checked, ...props }: any) => {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="mt-1 h-4 w-4 shrink-0 rounded accent-s-4 dark:accent-s-6 cursor-default"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },
          details: ({ children, ...props }: any) => (
            <details
              className="group border border-p-8 dark:border-p-2 rounded-lg my-3 overflow-hidden bg-p-10 dark:bg-p-1/60 transition-all shadow-sm"
              {...props}
            >
              {children}
            </details>
          ),
          summary: ({ children, ...props }: any) => (
            <summary
              className="cursor-pointer select-none px-4 py-3 font-medium flex items-center justify-between hover:bg-p-9 dark:hover:bg-p-2/60 list-none transition-colors"
              {...props}
            >
              <span className="flex-1">{children}</span>
              <span className="transition-transform duration-200 group-open:rotate-180 text-p-4 dark:text-p-6 ml-2 text-xs">
                ▼
              </span>
            </summary>
          ),
          code: ({ children }) => (
            <code className={clsx("rounded-none px-1", "font-mono")}>
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="border-[1.5px] dark:border border-p-0 dark:border-p-6 rounded-lg my-5 p-5 whitespace-pre-wrap break-words">
              {children}
            </pre>
          ),
          a: ({ children, ...props }) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-s-4 dark:text-s-6 hover:underline break-words"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ ...props }) => (
            <img className="my-5 rounded-lg w-full" {...props} />
          ),
          iframe: ({ ...props }) => (
            <iframe
              className="w-full max-h-[500px] rounded-lg bg-p-0"
              {...props}
            />
          ),
        }}
      >
        {decode(sanitizer(content, SANITIZE_OPTIONS))}
      </Markdown>
    );
  }
);
MarkdownRender.displayName = "MarkdownRender";
