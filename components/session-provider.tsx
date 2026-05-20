"use client";

import { createContext, useContext, type ReactNode } from "react";

export type ClientSession = {
  isConnected: boolean;
  type: "retail" | "pro" | null;
  name: string | null;
};

const SessionContext = createContext<ClientSession>({
  isConnected: false,
  type: null,
  name: null,
});

export function SessionProvider({
  value,
  children,
}: {
  value: ClientSession;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): ClientSession {
  return useContext(SessionContext);
}
