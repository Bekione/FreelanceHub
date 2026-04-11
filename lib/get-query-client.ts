import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import { isNetworkError } from "./network-error";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid immediate refetching on client after SSR hydration
        staleTime: 60 * 1000,
        // Pause queries instead of erroring when offline; auto-resume on reconnect
        networkMode: "offlineFirst",
        // Don't retry when offline — wait for reconnect event instead
        retry: (failureCount, error) => {
          // Don't retry on network errors when offline
          if (isNetworkError(error)) return false;
          
          if (typeof navigator !== "undefined" && !navigator.onLine)
            return false;
          // Don't retry on 4xx client errors (auth, not found, etc.)
          if (error instanceof Error && "status" in error) {
            const status = (error as { status: number }).status;
            if (status >= 400 && status < 500) return false;
          }
          return failureCount < 2;
        },
        retryDelay: (attemptIndex) =>
          Math.min(1000 * 2 ** attemptIndex, 30_000),
      },
      mutations: {
        // "online" = TanStack Query pauses the mutation until the browser is online.
        // This prevents the "Failed to fetch" error from ever reaching onError while offline.
        networkMode: "online",
        retry: false,
      },
      dehydrate: {
        // Include pending queries so streaming works without double-fetching
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
        // Never redact errors — Next.js handles that automatically
        shouldRedactErrors: () => false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client (no shared state between requests)
    return makeQueryClient();
  } else {
    // Browser: reuse the same client to preserve cache across renders
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
