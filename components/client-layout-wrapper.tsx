"use client";

import { ReactNode } from "react";
import { NetworkStatusProvider } from "@/contexts/network-status-context";
import { OfflineBanner } from "@/components/offline-banner";

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

/**
 * Client-side wrapper for layout components that need access to NetworkStatusProvider.
 * This allows OfflineBanner and other components to access network status context.
 */
export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <NetworkStatusProvider>
      <OfflineBanner />
      {children}
    </NetworkStatusProvider>
  );
}
