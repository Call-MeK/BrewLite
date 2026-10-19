"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LoginResponse, User } from "@/lib/api";

type Session = { accessToken: string; user: User; expiresAt: number };
const AuthContext = createContext<{
  session: Session | null;
  startSession: (response: LoginResponse) => void;
  endSession: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!session) return;
    const timer = setTimeout(() => setSession(null), Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session]);

  function startSession(response: LoginResponse) {
    setSession({ accessToken: response.accessToken, user: response.user, expiresAt: Date.now() + response.expiresIn * 1000 });
  }

  return (
    <AuthContext.Provider value={{ session, startSession, endSession: () => setSession(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
}
