"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthInitializer } from "@/components/auth/auth-initializer";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthInitializer />
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "glass-panel border-surface-border",
            },
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}
