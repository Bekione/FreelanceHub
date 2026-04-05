"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}

export function Providers({ children, dir = "ltr" }: ProvidersProps) {
  return (
    <DirectionProvider dir={dir}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </DirectionProvider>
  );
}
