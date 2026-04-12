"use client"

/**
 * Retry Strategy for Sync Operations
 * 
 * Implements exponential backoff for retrying failed sync operations.
 * Delays: 1s, 2s, 4s, 8s, 16s, 32s, max 60s
 * Max retries: 10 attempts
 */

const INITIAL_DELAY_MS = 1000 // 1 second
const MAX_DELAY_MS = 60000 // 60 seconds
const MAX_RETRIES = 10

/**
 * Calculate the next retry timestamp using exponential backoff
 * 
 * @param retryCount - Current retry count (0-indexed)
 * @returns Timestamp (in milliseconds) when the next retry should occur, or null if max retries exceeded
 * 
 * @example
 * ```ts
 * const nextRetry = calculateNextRetry(3) // Returns timestamp for 8 seconds from now
 * ```
 */
export function calculateNextRetry(retryCount: number): number | null {
  // Check if max retries exceeded
  if (retryCount >= MAX_RETRIES) {
    return null
  }

  // Calculate delay with exponential backoff: 2^retryCount * INITIAL_DELAY_MS
  const delay = Math.min(
    Math.pow(2, retryCount) * INITIAL_DELAY_MS,
    MAX_DELAY_MS
  )

  // Return timestamp for next retry
  return Date.now() + delay
}

/**
 * Get human-readable delay description
 * 
 * @param retryCount - Current retry count
 * @returns Human-readable string describing the delay
 */
export function getRetryDelayDescription(retryCount: number): string {
  if (retryCount >= MAX_RETRIES) {
    return 'Max retries exceeded'
  }

  const delay = Math.min(
    Math.pow(2, retryCount) * INITIAL_DELAY_MS,
    MAX_DELAY_MS
  )

  if (delay < 1000) {
    return `${delay}ms`
  } else if (delay < 60000) {
    return `${Math.round(delay / 1000)}s`
  } else {
    return `${Math.round(delay / 60000)}m`
  }
}

/**
 * Check if a mutation should be retried based on its retry count
 * 
 * @param retryCount - Current retry count
 * @returns True if the mutation should be retried, false if max retries exceeded
 */
export function shouldRetry(retryCount: number): boolean {
  return retryCount < MAX_RETRIES
}

/**
 * Check if it's time to retry a mutation
 * 
 * @param nextRetryAt - Timestamp when the next retry should occur (or null)
 * @returns True if it's time to retry, false otherwise
 */
export function isRetryDue(nextRetryAt: number | null): boolean {
  if (nextRetryAt === null) {
    return true // No retry scheduled, can retry immediately
  }
  
  return Date.now() >= nextRetryAt
}
