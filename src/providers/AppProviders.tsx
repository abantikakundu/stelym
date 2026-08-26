"use client";

import { FreighterProvider } from "@/providers/FreighterProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <FreighterProvider>{children}</FreighterProvider>
    </ThemeProvider>
  );
}
