"use client";

import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
  );
}
