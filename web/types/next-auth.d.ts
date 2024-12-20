import { People, ScopeEnum } from '@prisma/client';
import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: People & { scope: { scope: ScopeEnum }[] };
  }
}
