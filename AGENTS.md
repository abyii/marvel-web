# marvel-web

Makerspace site (course/project work reports, articles, events, profiles). The app lives in `web/`.
Hosting must stay near-free: few DB queries, small payloads, aggressive Next.js caching.

## Stack
Next.js 16 App Router · React 19 · Prisma 6 (Postgres/Supabase) · NextAuth v4 (Google, `pages/api/auth`) · Tailwind 3 · bun.
Markdown bodies live in Supabase Storage (DB stores the URL); images on Cloudinary.

## Commands (run in `web/`)
- `bun install` · `bun run dev` (port 4200) · `bun run build` · `bun run lint`
- Type check: `bunx tsc --noEmit`
- No test suite. Verify with a production build (`next build && next start`): caching bugs don't show in `next dev`.
- `next build` prerenders static pages (e.g. `/courses`) by querying the DB in `.env.local`.

## Layout
- `app/<route>/actions.ts`: server actions (all writes). `app/actions.ts`: search.
- `prisma/schema.prisma`: data model. `utils/dbConnector.ts`: Prisma client.
- `ui/`: in-house design system, imported as `@marvel/ui/ui` (alias of `web/*`). Use it; don't add UI libraries.
- `components/`: app components (`Cards`, `Pagination`, `MenuDialog`).
- `utils/cache.ts`: cache tags and revalidation helpers. `utils/pagination.ts`, `utils/limits.ts`.

## Caching rules
- Detail pages are ISR forever: `revalidate = false` + `generateStaticParams() { return [] }`. They change only when a server action invalidates them.
- List pages read `?page=`, so they render per request (`force-dynamic`); their DB reads are wrapped in `unstable_cache` with a tag from `cacheTags` and no timer.
- Every mutation must invalidate everything that displays the changed data:
  - `revalidatePath("/concrete/url")` for ISR pages.
  - `updateTag(cacheTags.x)` for tagged data. Only works inside server actions.
  - Use the helpers in `utils/cache.ts`: `revalidateWork`, `revalidateProfile`, `revalidateGrads`.
- Cached HTML must not depend on the current time. Time-relative UI renders in the browser only (see `components/EventTimingText.tsx`).
- Layout output is baked into each child URL's cache entry. Data shown in a layout needs every child URL revalidated (see `revalidateWork`), or must come from a tagged `unstable_cache`.
- `revalidatePath("/x/123", "layout")` is a no-op: layout tags use the route pattern (`/x/[id]/layout`).
- Don't cache "not found" or errors inside `unstable_cache` when the row may appear later. Throw inside the cached fn and catch outside (see `getUserBySlug.ts`).
- `unstable_cache` returns JSON: `Date`s come back as strings.
- OG images (`opengraph-image.tsx`) are ISR too. They read through `unstable_cache` so a tag refreshes them.

## Query rules
- Every list is paginated (`take` + `orderBy` with an `id` tie-break) or provably small.
- Validate `?page=` with `parsePage`, then `getTotalPages` from a cached count, before fetching the page.
- `select` only what the UI renders.
- Limits: 20 reports and 10 members per project (`utils/limits.ts`), enforced server-side and mirrored in the UI.

## Auth
- Server actions re-check the session and role. Never trust client-side checks.
- Roles live in `Scope`: `PROFILE`, `CRDN` (coordinator), `ADMIN`. The session (`session.user`) is loaded from the DB in the NextAuth `session` callback.
- Search requires login. `/birdseye` and its actions need CRDN or ADMIN.

## Gotchas
- `prisma generate` fails with `EPERM` on Windows while `next dev` is running (engine DLL locked). Stop the dev server first.
- `tsconfig` has `strict: false`, so untyped modules type-check as `any`; check runtime exports when upgrading packages.
