// ─── Query Key Factory ─────────────────────────────────────────────────────────
// Centralised query keys for consistent cache invalidation.
// Always use these instead of inline string arrays.

export const queryKeys = {
  metrics: () => ["metrics"] as const,
  clients: (params?: object) => ["clients", params] as const,
  projects: (params?: object) => ["projects", params] as const,
  invoices: (params?: object) => ["invoices", params] as const,
} as const;
