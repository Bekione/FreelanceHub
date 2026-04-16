"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
  justReconnected: boolean;
}

const RECONNECT_FLASH_MS = 3000;
const PING_INTERVAL_MS = 10000; // Ping every 10s when offline (reduced from 5s)
const SLOW_PING_INTERVAL_MS = 60000; // Ping every 60s when solidly online (reduced from 30s)

export function useNetworkStatus(): NetworkStatus {
  // Initialize with navigator.onLine instead of assuming online
  const [isOnline, setIsOnline] = useState(() => 
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const setOnlineState = useCallback((online: boolean) => {
    setIsOnline((prev) => {
      // Always update state, don't skip if same value
      // This ensures proper state transitions
      
      if (online && !prev) {
        // We just came back online
        setWasOffline(true);
        setJustReconnected(true);
        
        // Clear any existing timer
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
        }
        
        // Set timer to hide reconnection banner after 3 seconds
        reconnectTimer.current = setTimeout(() => {
          setJustReconnected(false);
        }, RECONNECT_FLASH_MS);
      } else if (!online && prev) {
        // We just went offline
        setWasOffline(true);
        setJustReconnected(false);
        
        // Clear reconnection timer if it exists
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current);
          reconnectTimer.current = null;
        }
      }
      
      return online;
    });
  }, []);

  const checkConnection = useCallback(async () => {
    // 1. If native API says offline, trust it immediately
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setOnlineState(false);
      return false;
    }

    // 2. Native API says online, but it might be lying (localhost, virtual adapters). Ping to verify.
    try {
      // Use a fast, cache-busted ping to Google or our own lightweight endpoint
      // A simple HEAD request to our own API is safest for CORS.
      const res = await fetch("/api/ping", {
        method: "HEAD",
        cache: "no-store",
        // Abort timeout so it doesn't hang forever
        signal: AbortSignal.timeout(3000),
      });
      const online = res.ok;
      setOnlineState(online);
      return online;
    } catch (err) {
      // Fetch failed -> offline
      setOnlineState(false);
      return false;
    }
  }, [setOnlineState]);

  useEffect(() => {
    // Initial check
    checkConnection();

    // Setup active polling
    const startPolling = (interval: number) => {
      if (pingTimer.current) clearInterval(pingTimer.current);
      pingTimer.current = setInterval(checkConnection, interval);
    };

    // Poll faster if we are offline to detect reconnects quickly
    startPolling(isOnline ? SLOW_PING_INTERVAL_MS : PING_INTERVAL_MS);

    // Native event listeners as a fallback to trigger immediate checks
    const handleNativeEvent = () => checkConnection();
    window.addEventListener("online", handleNativeEvent);
    window.addEventListener("offline", handleNativeEvent);

    return () => {
      window.removeEventListener("online", handleNativeEvent);
      window.removeEventListener("offline", handleNativeEvent);
      if (pingTimer.current) clearInterval(pingTimer.current);
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [isOnline, checkConnection]);

  return { isOnline, wasOffline, justReconnected };
}
