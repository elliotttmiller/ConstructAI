"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export default function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider
      // Reduce session polling to prevent excessive re-renders
      refetchInterval={5 * 60} // 5 minutes instead of default 0 (constant polling)
      refetchOnWindowFocus={false} // Don't refetch when window regains focus
    >
      {children}
    </NextAuthSessionProvider>
  );
}
