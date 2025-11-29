"use client";

import { StoreProvider } from "@/lib/store";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <StoreProvider>{children}</StoreProvider>;
}
