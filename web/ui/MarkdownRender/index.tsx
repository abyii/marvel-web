import { memo, type JSX } from "react";
import Markdown from "react-markdown";
import he from "he";
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
            <ol className="space-y-1 list-decimal list-inside">{children}</ol>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 list-disc list-inside">{children}</ul>
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
          img: ({ ...props }) => {
            // Only render img if src is provided and not empty
            if (!props.src) {
              return null;
            }
            return <img className="my-5 rounded-lg w-full" {...props} />;
          },
          iframe: ({ ...props }) => (
            <iframe
              className="w-full max-h-[500px] rounded-lg bg-p-0"
              {...props}
            />
          ),
        }}
      >
        {he.decode(sanitizer(content, SANITIZE_OPTIONS))}
      </Markdown>
    );
  }
);
