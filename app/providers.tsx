'use client';

import { SessionProvider } from "next-auth/react";
import SessionSync from "./components/auth/SessionSync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionSync />
      {children}
    </SessionProvider>
  );
}