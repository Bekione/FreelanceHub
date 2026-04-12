"use client"

import { useState, useEffect } from 'react'
import { WifiOff, Wifi, Loader2 } from 'lucide-react'
import { useNetworkStatus } from '@/lib/offline/network/detector'
import { db } from '@/lib/offline/db/client'
import { useLiveQuery } from 'dexie-react-hooks'

/**
 * Offline Banner
 * 
 * Displays the current network status and sync state to the user.
 * Shows:
 * - Online/Offline indicator
 * - Pending sync count
 * - Syncing animation
 */
export function OfflineBanner() {
  const { isOnline } = useNetworkStatus()
  const [isSyncing, setIsSyncing] = useState(false)

  // Count pending mutations using Dexie's reactive query
  const pendingCount = useLiveQuery(async () => {
    const count = await db.mutationQueue
      .where('status')
      .equals('pending')
      .or('status')
      .equals('failed')
      .filter(m => !m.nextRetryAt || m.nextRetryAt <= Date.now())
      .count()
    return count
  }, [])

  // Monitor sync status
  useEffect(() => {
    const checkSyncStatus = async () => {
      const status = await import('@/lib/offline/sync/manager').then(m => m.syncManager.getStatus())
      setIsSyncing(status.isProcessing)
    }

    // Check immediately
    checkSyncStatus()

    // Check periodically
    const interval = setInterval(checkSyncStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  // Don't show banner if online and no pending changes
  if (isOnline && !pendingCount && !isSyncing) {
    return null
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium text-center transition-colors ${
        isOnline
          ? 'bg-blue-500 text-white'
          : 'bg-amber-500 text-white'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Syncing changes...</span>
              </>
            ) : pendingCount && pendingCount > 0 ? (
              <span>{pendingCount} change{pendingCount > 1 ? 's' : ''} pending sync</span>
            ) : (
              <span>All changes synced</span>
            )}
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            <span>You're offline</span>
            {pendingCount && pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {pendingCount} pending
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
