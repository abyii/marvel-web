"use client";

import { SessionProvider } from "next-auth/react"; //session context.
import { ThemeProvider } from "next-themes"; //provides theme context. not related to tailwind
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Suppress React 19 false-positive warning for next-themes script tag in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag")
    ) {
      return;
    }
    origError.apply(console, args);
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: Infinity,
      retry: false,
      retryOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
});

function Context({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false}>
      <ThemeProvider
        attribute="data-theme"
        defaultTheme={"dark"}
        themes={["light", "dark"]}
      >
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

export default Context;
