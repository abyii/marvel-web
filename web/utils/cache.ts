import "server-only";

import { revalidatePath, updateTag } from "next/cache";

/**
 * Tags for `unstable_cache` entries. Cached data never expires on a timer;
 * server actions expire it with `updateTag` when the underlying data changes.
 *
 * Tags used by an `unstable_cache` call are also attached to the ISR entry of
 * the page/route that rendered it, which is how OG image routes get refreshed.
 */
export const cacheTags = {
  /** `/projects` list pages and the featured projects strip */
  projects: "projects",
  /** course layout data and the course OG image */
  course: (courseCode: string) => `course-${courseCode}`,
  /** `/course/<code>/works` list pages */
  courseWorks: (courseCode: string) => `course-works-${courseCode}`,
  /** `/course/<code>/articles` list pages */
  courseArticles: (courseCode: string) => `course-articles-${courseCode}`,
  /** work OG image */
  work: (workId: string) => `work-${workId}`,
  /** article OG image */
  article: (articleId: string) => `article-${articleId}`,
  /** event OG image */
  event: (eventId: string) => `event-${eventId}`,
  /** `/events` list pages */
  events: "events",
  /** `/grads` list pages */
  grads: "grads",
  /** profile layout data (name, picture, scope, readMe URL) */
  profile: (slug: string) => `profile-${slug}`,
  /** `/u/<slug>/works` list pages */
  profileWorks: (slug: string) => `profile-works-${slug}`,
  /** `/u/<slug>/writings` list pages */
  profileWritings: (slug: string) => `profile-writings-${slug}`,
};

/**
 * Invalidates every cached URL of a single work, plus its OG image.
 *
 * The work layout (tabs, people, report statuses) is baked into each page's
 * full-route-cache entry, so all URLs under `/work/<id>` must be revalidated
 * when any of that data changes. `revalidatePath("/work/<id>", "layout")` does
 * NOT do this: layout tags are derived from the route pattern
 * (`/work/[workId]/layout`), so a concrete path + "layout" matches nothing.
 */
export function revalidateWork(workId: string, reportIds: string[]) {
  revalidatePath(`/work/${workId}`);
  revalidatePath(`/work/${workId}/new`);
  for (const reportId of reportIds) {
    revalidatePath(`/work/${workId}/${reportId}`);
  }
  updateTag(cacheTags.work(workId));
}

/**
 * Invalidates the profile data shared by every profile tab (layout: name,
 * picture, coordinator badge; readMe page: readMe URL).
 */
export function revalidateProfile(slug: string) {
  revalidatePath(`/u/${slug}`);
  updateTag(cacheTags.profile(slug));
}

/** `/grads` lists COURSE works whose reports are all APPROVED. */
export function revalidateGrads() {
  updateTag(cacheTags.grads);
}
