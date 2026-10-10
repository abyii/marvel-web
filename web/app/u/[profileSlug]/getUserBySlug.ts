import "server-only";

import { cache } from "react";
import { unstable_cache } from "next/cache";

import dbClient from "../../../utils/dbConnector";
import { cacheTags } from "../../../utils/cache";

class ProfileNotFound extends Error {}

/**
 * Profile row shared by the profile layout and readMe page. Cached across
 * requests because the works/writings tabs are dynamic (`?page=`) and would
 * otherwise hit the DB on every request. Expired by `revalidateProfile`.
 *
 * A missing profile is thrown out of the cached function so it isn't cached:
 * the slug may be taken by a user who signs up later.
 */
export const getUserBySlug = cache(async (slug: string) => {
  try {
    return await unstable_cache(
      async () => {
        const person = await dbClient.people.findUnique({
          where: {
            slug: slug,
          },
          select: {
            slug: true,
            name: true,
            profilePic: true,
            readMe: true,
            scope: {
              select: {
                scope: true,
              },
            },
          },
        });
        if (!person) throw new ProfileNotFound();
        return person;
      },
      ["profile", slug],
      { tags: [cacheTags.profile(slug)] }
    )();
  } catch (error) {
    if (error instanceof ProfileNotFound) return null;
    throw error;
  }
});
