"use client";

import { DirectionProvider } from "@radix-ui/react-direction";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "@/lib/get-query-client";

interface ProvidersProps {
  children: React.ReactNode;
  dir?: "ltr" | "rtl";
}

/**
 * Wraps children with Radix DirectionProvider for RTL support and
 * QueryClientProvider for TanStack Query.
 * ThemeProvider and Toaster live in app/layout.tsx so they never
 * re-mount during client-side locale navigation.
 * NetworkStatusProvider lives in ClientLayoutWrapper at the root layout level.
 */
export function Providers({ children, dir = "ltr" }: ProvidersProps) {
  // NOTE: Do NOT use useState here — getQueryClient() handles the singleton
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <DirectionProvider dir={dir}>{children}</DirectionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
