//  Cloudinary utility functions for handling file uploads and deletions

export const extractCloudinaryPublicId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");

    // Find the "upload" part
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1) return null;

    // Skip the version number (e.g., v1770289937) and join the rest
    const remainder = pathParts.slice(uploadIndex + 2).join("/");

    // Remove file extension to get public_id
    const publicId = remainder.replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch (error) {
    console.error("Error extracting Cloudinary public_id:", error);
    return null;
  }
};


 // Extract all Cloudinary URLs from markdown content

export const extractCloudinaryUrls = (markdown: string): string[] => {
  const cloudinaryUrlRegex = /https:\/\/res\.cloudinary\.com\/[^\s\)"\]]+/g;
  return markdown.match(cloudinaryUrlRegex) || [];
};

// Find URLs that were deleted by comparing old and new markdown

export const findDeletedUrls = (
  oldMarkdown: string,
  newMarkdown: string
): string[] => {
  const oldUrls = new Set(extractCloudinaryUrls(oldMarkdown));
  const newUrls = new Set(extractCloudinaryUrls(newMarkdown));

  return Array.from(oldUrls).filter((url) => !newUrls.has(url));
};


 // Delete a file from Cloudinary by public_id

export const deleteFromCloudinary = async (
  publicId: string
): Promise<boolean> => {
  try {
    if (!publicId) {
      console.warn("No publicId provided for deletion");
      return false;
    }

    console.log("Deleting from Cloudinary:", publicId);

    const response = await fetch("/api/upload", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Delete from Cloudinary failed:", data.error);
      return false;
    }

    console.log("Successfully deleted from Cloudinary:", publicId);
    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

export const deleteCloudinaryUrls = async (
  urls: string[]
): Promise<{ successCount: number; failureCount: number }> => {
  const uniqueUrls = Array.from(new Set(urls));
  const deletions = uniqueUrls
    .map((url) => extractCloudinaryPublicId(url))
    .filter((publicId): publicId is string => Boolean(publicId))
    .map((publicId) => deleteFromCloudinary(publicId));

  const results = await Promise.allSettled(deletions);
  let successCount = 0;
  let failureCount = 0;

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value) {
      successCount += 1;
    } else {
      failureCount += 1;
    }
  });

  return { successCount, failureCount };
};
