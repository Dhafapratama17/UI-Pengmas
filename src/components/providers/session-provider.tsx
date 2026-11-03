"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { AuthSession } from "@/types/auth";

interface SessionContextValue {
  session: AuthSession | null;
  setSession: (session: AuthSession | null) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  initialSession,
  children,
}: {
  initialSession: AuthSession | null;
  children: ReactNode;
}) {
  const [session, setSession] = useState<AuthSession | null>(initialSession);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession harus dipakai di dalam SessionProvider");
  }
  return ctx;
}
