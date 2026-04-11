"use client";

import { createContext, useContext, ReactNode } from "react";
import { useNetworkStatus, NetworkStatus } from "@/hooks/use-network-status";

const NetworkStatusContext = createContext<NetworkStatus | undefined>(undefined);

export function NetworkStatusProvider({ children }: { children: ReactNode }) {
  const networkStatus = useNetworkStatus();
  
  return (
    <NetworkStatusContext.Provider value={networkStatus}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

export function useNetworkStatusContext(): NetworkStatus {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error("useNetworkStatusContext must be used within a NetworkStatusProvider");
  }
  return context;
}
