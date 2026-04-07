import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Avoid immediate refetching on client after SSR hydration
        staleTime: 60 * 1000,
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
