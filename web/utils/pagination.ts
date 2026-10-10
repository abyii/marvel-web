import "server-only";

import { notFound } from "next/navigation";

/**
 * Parses a `?page=` search param. Anything other than a positive integer is a
 * 404, so junk values never reach the DB or create cache entries.
 */
export function parsePage(raw: string | undefined): number {
  if (raw === undefined) return 1;
  const page = Number(raw);
  if (!Number.isInteger(page) || page < 1) notFound();
  return page;
}

/**
 * Returns the page count for `total` rows, or 404s when `page` is past the
 * last page. Call before fetching (and caching) the page itself, so the number
 * of cached pages per list is bounded by its real page count.
 */
export function getTotalPages(page: number, total: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (page > totalPages) notFound();
  return totalPages;
}
