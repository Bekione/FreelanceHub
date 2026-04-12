"use client"

import { useState, useEffect } from 'react'
import { RefreshCw, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncManager } from '@/lib/offline/sync/manager'
import { useNetworkStatus } from '@/lib/offline/network/detector'
import { toast } from 'sonner'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/offline/db/client'

/**
 * Sync Indicator
 * 
 * Displays sync progress and provides a manual sync button.
 * Shows:
 * - Sync progress (e.g., "Syncing 3 of 7 changes")
 * - Last sync timestamp
 * - Manual sync button
 */
export function SyncIndicator() {
  const { isOnline } = useNetworkStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)

  // Count pending mutations
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
      const status = await syncManager.getStatus()
      setIsSyncing(status.isProcessing)
      
      // Update last sync time when sync completes
      if (!status.isProcessing && status.pendingCount === 0) {
        setLastSyncTime(Date.now())
      }
    }

    checkSyncStatus()
    const interval = setInterval(checkSyncStatus, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleManualSync = async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline. Changes will sync automatically when you reconnect.')
      return
    }

    if (isSyncing) {
      toast.info('Sync already in progress')
      return
    }

    if (!pendingCount || pendingCount === 0) {
      toast.info('No changes to sync')
      return
    }

    try {
      await syncManager.manualSync()
    } catch (error) {
      toast.error('Sync failed. Will retry automatically.')
    }
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      {/* Sync progress */}
      {isSyncing && pendingCount && pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Syncing {pendingCount} change{pendingCount > 1 ? 's' : ''}...</span>
        </div>
      )}

      {/* Last sync time */}
      {!isSyncing && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Last sync: {formatLastSync(lastSyncTime)}</span>
        </div>
      )}

      {/* Manual sync button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isSyncing || !isOnline || !pendingCount || pendingCount === 0}
        className="h-8"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
        Sync Now
      </Button>
    </div>
  )
}
