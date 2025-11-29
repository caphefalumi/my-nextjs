"use client";

import { StoreProvider } from "@/lib/store";
import { AuthProvider } from "@/lib/auth-context";
import { AIProvider } from "@/lib/ai-context";
import { AIDemoButton } from "@/components/ai-demo/ai-demo";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AIProvider>
        <StoreProvider>
          {children}
          <AIDemoButton />
        </StoreProvider>
      </AIProvider>
    </AuthProvider>
  );
}
