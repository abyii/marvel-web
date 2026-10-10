import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import dbClient from "../../../utils/dbConnector";
import slugify from "slugify";

export const authOptions: AuthOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      console.info("auth called");
      const existingUser = await dbClient.people.findUnique({
        where: {
          googleId: token?.sub,
        },
        select: {
          name: true,
          googleId: true,
          slug: true,
          scope: {
            select: {
              scope: true,
            },
          },
          id: true,
          profilePic: true,
        },
      });
      if (!existingUser) {
        // if no user, create slug and new user with the available data.
        const baseSlug = slugify(token?.name as string, {
          lower: true,
          strict: true,
          trim: true,
        });
        // one query for every taken `<base>` / `<base>-<n>` slug, then pick
        // the first free suffix
        const takenSlugs = new Set(
          (
            await dbClient.people.findMany({
              where: { slug: { startsWith: baseSlug } },
              select: { slug: true },
            })
          ).map((p) => p.slug)
        );
        let newSlug = baseSlug;
        for (let attempt = 1; takenSlugs.has(newSlug); attempt++) {
          newSlug = `${baseSlug}-${attempt}`;
        }

        //populate session with our data
        //@ts-ignore
        session.user = await dbClient.people.create({
          data: {
            slug: newSlug,
            googleId: token?.sub as string,
            name: token?.name as string,
            profilePic: token?.picture as string,
            email: token?.email as string,
          },
          select: {
            name: true,
            googleId: true,
            slug: true,
            scope: {
              select: {
                scope: true,
              },
            },
            id: true,
            profilePic: true,
          },
        });
      } else {
        //@ts-ignore
        session.user = existingUser;
      }
      //@ts-ignore
      session.accessToken = token.accessToken;
      //@ts-ignore
      session.error = token.error;
      return session;
    },
  },
  secret: process.env?.NEXTAUTH_SECRET as string,
};

export default NextAuth(authOptions);
