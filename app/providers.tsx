"use client";

import { AuthProvider } from "@/app/contexts/AuthContext";
import { SportsProvider } from "@/app/contexts/SportsContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SportsProvider>{children}</SportsProvider>
    </AuthProvider>
  );
}
