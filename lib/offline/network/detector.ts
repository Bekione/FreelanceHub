"use client"

import { useState, useEffect } from 'react'

/**
 * Network status detector
 * 
 * Monitors online/offline status using browser events and periodic health checks.
 * Provides a React hook for components to subscribe to network status changes.
 */

export interface NetworkStatus {
  isOnline: boolean
  lastChecked: number
}

// Health check endpoint to verify true connectivity
const HEALTH_CHECK_URL = '/api/health'
const HEALTH_CHECK_INTERVAL = 30000 // 30 seconds

/**
 * Check if the browser has network connectivity
 * Uses both navigator.onLine and a health check ping
 */
export async function checkNetworkStatus(): Promise<boolean> {
  // First check browser's online status
  if (!navigator.onLine) {
    return false
  }
  
  // Then verify with health check
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    const response = await fetch(HEALTH_CHECK_URL, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    // Network error or timeout means we're offline
    return false
  }
}

/**
 * React hook for monitoring network status
 * 
 * @returns NetworkStatus object with isOnline flag and lastChecked timestamp
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isOnline } = useNetworkStatus()
 *   return <div>{isOnline ? 'Online' : 'Offline'}</div>
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    lastChecked: Date.now()
  })

  useEffect(() => {
    // Update status when browser online/offline events fire
    const handleOnline = () => {
      setStatus({
        isOnline: true,
        lastChecked: Date.now()
      })
    }

    const handleOffline = () => {
      setStatus({
        isOnline: false,
        lastChecked: Date.now()
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Periodic health check to verify true connectivity
    const healthCheckInterval = setInterval(async () => {
      const isOnline = await checkNetworkStatus()
      setStatus(prev => ({
        isOnline,
        lastChecked: Date.now()
      }))
    }, HEALTH_CHECK_INTERVAL)

    // Initial health check
    checkNetworkStatus().then(isOnline => {
      setStatus({
        isOnline,
        lastChecked: Date.now()
      })
    })

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(healthCheckInterval)
    }
  }, [])

  return status
}
