'use client';

import { SessionProvider } from 'next-auth/react'; //session context.
import { ThemeProvider } from 'next-themes'; //provides theme context. not related to tailwind
import { Session } from 'next-auth'; //type of session object

function Context({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session;
}) {
  return (
    <SessionProvider
      session={session}
      refetchOnWindowFocus={false}
      refetchInterval={60 * 20}
    >
      <ThemeProvider
        attribute="class"
        enableSystem={false}
        defaultTheme={'dark'}
        themes={['light', 'dark']}
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}

export default Context;
