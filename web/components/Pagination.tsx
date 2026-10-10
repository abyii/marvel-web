import Link from "next/link";

const linkClassName =
  "px-4 py-2 border rounded-full hover:bg-gray-100 dark:hover:bg-p-2 dark:border-p-6 transition-colors";

/**
 * Previous / Next links for `?page=` pagination. `pathname` may carry other
 * search params (e.g. `/projects?q=foo`); `page` is appended to it.
 */
export function Pagination({
  pathname,
  page,
  totalPages,
}: {
  pathname: string;
  page: number;
  totalPages: number;
}) {
  const href = (p: number) =>
    `${pathname}${pathname.includes("?") ? "&" : "?"}page=${p}`;
  return (
    <div className="w-full flex justify-center mt-10 gap-4 text-sm font-medium">
      {page > 1 && (
        <Link href={href(page - 1)} className={linkClassName}>
          Previous
        </Link>
      )}
      <span className="px-4 py-2 text-p-5">
        Page {page} of {totalPages}
      </span>
      {page < totalPages && (
        <Link href={href(page + 1)} className={linkClassName}>
          Next
        </Link>
      )}
    </div>
  );
}
