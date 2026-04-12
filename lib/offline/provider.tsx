"use client"

import { useEffect } from 'react'
import { syncManager } from './sync/manager'

/**
 * Offline Provider
 * 
 * Initializes and manages the offline infrastructure for the application.
 * Starts the sync manager and provides offline capabilities to child components.
 * 
 * This should be mounted once at the app level (e.g., in dashboard layout).
 */
export function OfflineProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start sync manager on mount
    syncManager.start()

    // Cleanup on unmount
    return () => {
      syncManager.stop()
    }
  }, [])

  return <>{children}</>
}
