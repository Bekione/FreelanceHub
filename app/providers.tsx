"use client";

import { DirectionProvider } from "@radix-ui/react-direction";

interface ProvidersProps {
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}

/**
 * Wraps children with Radix DirectionProvider for RTL support.
 * ThemeProvider and Toaster live in app/layout.tsx so they never
 * re-mount during client-side locale navigation.
 */
export function Providers({ children, dir = "ltr" }: ProvidersProps) {
  return <DirectionProvider dir={dir}>{children}</DirectionProvider>;
}
