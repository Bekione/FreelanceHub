// ─── Query Key Factory ─────────────────────────────────────────────────────────
// Centralised query keys for consistent cache invalidation.
// Always use these instead of inline string arrays.
//
// IMPORTANT: invalidateQueries uses prefix matching by default.
// Pass only the base array (e.g. queryKeys.clients()) to invalidate ALL
// client queries regardless of params.

export const queryKeys = {
  metrics: () => ["metrics"] as const,
  clients: (params?: object) =>
    params !== undefined ? (["clients", params] as const) : (["clients"] as const),
  projects: (params?: object) =>
    params !== undefined ? (["projects", params] as const) : (["projects"] as const),
  invoices: (params?: object) =>
    params !== undefined ? (["invoices", params] as const) : (["invoices"] as const),
} as const;
