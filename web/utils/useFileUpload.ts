import { useState } from "react";

export type UseFileUploadOptions = {
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  onProgress?: (progress: number) => void;
};

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(
          `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`
        );
      }

      // Validate file type
      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const fileType = file.type || "";
        const isAllowed = options.allowedTypes.some(
          (type) =>
            fileType.match(type.replace(/\*/g, ".*")) ||
            file.name.endsWith(type.replace(".", ""))
        );
        if (!isAllowed) {
          throw new Error(`File type not allowed: ${file.type || "unknown"}`);
        }
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", file);

      console.log("Uploading file to /api/upload:", file.name);

      // Upload to API endpoint (which uploads to Cloudinary)
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || response.statusText || "Upload failed";
        console.error("Upload error:", errorMessage);
        throw new Error(errorMessage);
      }

      if (!data.url) {
        console.error("No URL returned from server:", data);
        throw new Error("No URL returned from server");
      }

      console.log("File uploaded successfully:", data.url);
      return data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("File upload error:", errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFileAsDataURL = async (file: File): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(
          `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`
        );
      }

      // For local/inline files, convert to data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.onerror = () => {
          reject(new Error("Failed to read file"));
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("File upload error:", errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    uploadFile,
    uploadFileAsDataURL,
    isLoading,
    error,
  };
};
