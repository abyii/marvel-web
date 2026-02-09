import { useCallback, useEffect, useRef } from "react";
import { extractCloudinaryUrls } from "./cloudinaryUtils";

export const useCloudinaryDeletionTracker = (markdown: string) => {
  const seenUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = extractCloudinaryUrls(String(markdown || ""));
    urls.forEach((url) => seenUrlsRef.current.add(url));
  }, [markdown]);

  const getDeletionCandidates = useCallback(() => {
    const currentUrls = new Set(
      extractCloudinaryUrls(String(markdown || ""))
    );
    return Array.from(seenUrlsRef.current).filter(
      (url) => !currentUrls.has(url)
    );
  }, [markdown]);

  const resetTracking = useCallback(() => {
    seenUrlsRef.current = new Set(
      extractCloudinaryUrls(String(markdown || ""))
    );
  }, [markdown]);

  return { getDeletionCandidates, resetTracking };
};
