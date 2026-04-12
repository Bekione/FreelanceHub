"use client"

import { db, type DBMutation } from '../db/client'
import { getPendingMutations, updateMutation, removeMutation, clearOldMutations } from './mutation-queue'
import { calculateNextRetry, shouldRetry } from './retry-strategy'
import { toast } from 'sonner'

/**
 * Sync Manager
 * 
 * Manages background synchronization of offline mutations with the server.
 * Processes the mutation queue when online and handles retries with exponential backoff.
 */

class SyncManager {
  private isProcessing = false
  private syncInterval: NodeJS.Timeout | null = null
  private onlineListener: (() => void) | null = null
  private cleanupInterval: NodeJS.Timeout | null = null

  /**
   * Start the sync manager
   * Registers event listeners and starts periodic sync
   */
  start() {
    console.log('[SyncManager] Starting...')

    // Process queue when browser comes online
    this.onlineListener = () => {
      console.log('[SyncManager] Network online, processing queue...')
      this.processQueue()
    }
    window.addEventListener('online', this.onlineListener)

    // Periodic sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (navigator.onLine && !this.isProcessing) {
        console.log('[SyncManager] Periodic sync triggered')
        this.processQueue()
      }
    }, 5 * 60 * 1000)

    // Cleanup old completed mutations every hour
    this.cleanupInterval = setInterval(() => {
      clearOldMutations()
    }, 60 * 60 * 1000)

    // Initial sync if online
    if (navigator.onLine) {
      console.log('[SyncManager] Initial sync')
      this.processQueue()
    }
  }

  /**
   * Stop the sync manager
   * Removes event listeners and clears intervals
   */
  stop() {
    console.log('[SyncManager] Stopping...')

    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener)
      this.onlineListener = null
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }

  /**
   * Process the mutation queue
   * Syncs all pending mutations with the server
   */
  async processQueue() {
    if (this.isProcessing) {
      console.log('[SyncManager] Already processing, skipping')
      return
    }

    if (!navigator.onLine) {
      console.log('[SyncManager] Offline, skipping sync')
      return
    }

    this.isProcessing = true

    try {
      const mutations = await getPendingMutations()

      if (mutations.length === 0) {
        console.log('[SyncManager] No pending mutations')
        return
      }

      console.log(`[SyncManager] Processing ${mutations.length} mutations`)

      let successCount = 0
      let failCount = 0

      for (const mutation of mutations) {
        try {
          await this.processMutation(mutation)
          successCount++
        } catch (error) {
          failCount++
          console.error(`[SyncManager] Failed to process mutation ${mutation.id}:`, error)
        }
      }

      console.log(`[SyncManager] Sync complete: ${successCount} succeeded, ${failCount} failed`)

      if (successCount > 0) {
        toast.success(`Synced ${successCount} change${successCount > 1 ? 's' : ''}`)
      }

      if (failCount > 0) {
        toast.error(`Failed to sync ${failCount} change${failCount > 1 ? 's' : ''}`)
      }
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Process a single mutation
   * Sends the mutation to the server and updates IndexedDB with the response
   */
  private async processMutation(mutation: DBMutation) {
    if (!mutation.id) {
      throw new Error('Mutation ID is required')
    }

    console.log(`[SyncManager] Processing ${mutation.operation} ${mutation.entity}:${mutation.entityId}`)

    // Mark as processing
    await updateMutation(mutation.id, { status: 'processing' })

    try {
      // Determine API endpoint
      const entityPlural = `${mutation.entity}s`
      const baseUrl = `/api/${entityPlural}`

      let response: Response

      // Execute the mutation based on operation type
      switch (mutation.operation) {
        case 'create':
          response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mutation.payload)
          })
          break

        case 'update':
          response = await fetch(`${baseUrl}/${mutation.entityId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mutation.payload)
          })
          break

        case 'delete':
          response = await fetch(`${baseUrl}/${mutation.entityId}`, {
            method: 'DELETE'
          })
          break

        default:
          throw new Error(`Unknown operation: ${mutation.operation}`)
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`)
      }

      // Get server response
      const serverData = mutation.operation !== 'delete' ? await response.json() : null

      // Update IndexedDB with server response
      await this.updateLocalData(mutation, serverData)

      // Mark mutation as completed
      await updateMutation(mutation.id, { status: 'completed' })

      // Schedule deletion of completed mutation after 24 hours
      setTimeout(() => {
        if (mutation.id) {
          removeMutation(mutation.id)
        }
      }, 24 * 60 * 60 * 1000)

      console.log(`[SyncManager] Successfully synced ${mutation.operation} ${mutation.entity}:${mutation.entityId}`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[SyncManager] Error syncing mutation ${mutation.id}:`, errorMessage)

      // Increment retry count
      const newRetryCount = mutation.retryCount + 1

      // Check if we should retry
      if (shouldRetry(newRetryCount)) {
        const nextRetryAt = calculateNextRetry(newRetryCount)
        await updateMutation(mutation.id, {
          status: 'failed',
          retryCount: newRetryCount,
          nextRetryAt,
          lastError: errorMessage
        })
        console.log(`[SyncManager] Will retry mutation ${mutation.id} (attempt ${newRetryCount + 1})`)
      } else {
        // Max retries exceeded
        await updateMutation(mutation.id, {
          status: 'failed',
          retryCount: newRetryCount,
          nextRetryAt: null,
          lastError: `Max retries exceeded: ${errorMessage}`
        })
        console.error(`[SyncManager] Max retries exceeded for mutation ${mutation.id}`)
        toast.error('Sync failed after multiple retries. Please check your connection.')
      }

      throw error
    }
  }

  /**
   * Update local IndexedDB data with server response
   */
  private async updateLocalData(mutation: DBMutation, serverData: any) {
    const table = db[`${mutation.entity}s` as keyof typeof db] as any

    if (mutation.operation === 'create') {
      // Replace temporary ID with server ID
      await table.delete(mutation.entityId)
      if (serverData) {
        await table.add({
          ...serverData,
          _syncedAt: Date.now(),
          _isLocalOnly: false
        })
      }
    } else if (mutation.operation === 'update') {
      // Update with server response
      if (serverData) {
        await table.update(mutation.entityId, {
          ...serverData,
          _syncedAt: Date.now(),
          _isLocalOnly: false
        })
      }
    } else if (mutation.operation === 'delete') {
      // Remove from IndexedDB
      await table.delete(mutation.entityId)
    }
  }

  /**
   * Manually trigger sync
   * Useful for user-initiated sync
   */
  async manualSync() {
    console.log('[SyncManager] Manual sync triggered')
    await this.processQueue()
  }

  /**
   * Get sync status
   */
  async getStatus() {
    const pendingCount = await db.mutationQueue
      .where('status')
      .equals('pending')
      .or('status')
      .equals('failed')
      .count()

    return {
      isProcessing: this.isProcessing,
      pendingCount,
      isOnline: navigator.onLine
    }
  }
}

// Singleton instance
export const syncManager = new SyncManager()
