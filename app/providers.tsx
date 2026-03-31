"use client";

import { ThemeProvider, useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={(theme as any) || "system"}
      richColors
      position="bottom-right"
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <ThemedToaster />
    </ThemeProvider>
  );
}
