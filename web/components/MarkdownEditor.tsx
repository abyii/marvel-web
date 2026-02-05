"use client";

import { TabGroup, Tab, MarkdownRender } from "@marvel/ui/ui/server";
import { useState, type JSX, useRef } from "react";
import { useFileUpload } from "../utils/useFileUpload";

type MarkdownEditorProps = JSX.IntrinsicElements["textarea"] & {
  onFileSelected?: (file: File) => Promise<string | null>;
};

export const MarkdownEditor = ({
  value = "",
  onChange,
  className,
  onFileSelected,
  ...props
}: MarkdownEditorProps) => {
  // Use the upload hook internally - always use it to upload to Cloudinary
  const { uploadFile: hookUploadFile } = useFileUpload({ maxSize: 500 * 1024 * 1024 });
  
  console.log("=== MarkdownEditor Render ===");
  console.log("Upload handler ready:", !!hookUploadFile);
  
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write");
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertTextAtCursor = (text: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value;
    const newValue =
      currentValue.substring(0, start) + text + currentValue.substring(end);

    // Update the value
    const event = new Event("change", { bubbles: true });
    Object.defineProperty(event, "target", {
      value: { ...textarea, value: newValue },
      enumerable: true,
    });
    textarea.value = newValue;
    textarea.dispatchEvent(event);
    onChange?.(event as any);

    // Reset cursor position
    textarea.selectionStart = textarea.selectionEnd = start + text.length;
    textarea.focus();
  };

  const isImageFile = (filename: string): boolean => {
    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
      ".ico",
    ];
    const lowerName = filename.toLowerCase();
    return imageExtensions.some((ext) => lowerName.endsWith(ext));
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      console.log("=== File Selected ===", file.name, file.type, file.size);
      console.log("Uploading to Cloudinary via hookUploadFile...");
      
      // Always use the hook to upload to Cloudinary
      const fileUrl = await hookUploadFile(file);
      console.log("Upload result:", fileUrl);
      
      if (fileUrl) {
        // Use image syntax for image files, link syntax for others
        // Encode URL to handle spaces and special characters
        const encodedUrl = encodeURI(fileUrl);
        const fileMarkdown = isImageFile(file.name)
          ? `![${file.name}](${encodedUrl})`
          : `[${file.name}](${encodedUrl})`;
        console.log("Inserting markdown:", fileMarkdown);
        insertTextAtCursor(fileMarkdown);
      } else {
        console.error("Upload failed - no URL returned");
        alert("File upload failed. Check browser console for details.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileInput = () => {
    console.log("triggerFileInput called");
    fileInputRef.current?.click();
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center my-5">
        <TabGroup>
          <Tab
            active={editorMode === "write"}
            onClick={() => setEditorMode("write")}
          >
            write
          </Tab>
          <Tab
            active={editorMode === "preview"}
            onClick={() => setEditorMode("preview")}
          >
            preview
          </Tab>
        </TabGroup>
        {editorMode === "write" && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={triggerFileInput}
              disabled={isUploading}
              className="px-3 py-1 text-sm bg-p-1 hover:bg-p-2 dark:bg-p-2 dark:hover:bg-p-3 text-p-10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              title="Add file link to markdown"
            >
              {isUploading ? "Uploading..." : "📎 Attach File"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*"
            />
          </div>
        )}
      </div>
      {editorMode == "write" ? (
        <textarea
          ref={textareaRef}
          className="bg-p-9 dark:bg-p-2 p-5 pb-10 rounded-lg w-full min-h-[300px]"
          onChange={onChange}
          value={value}
          {...props}
        />
      ) : (
        <MarkdownRender content={value as string} />
      )}
    </div>
  );
};
