// ─── Free Tier Limits ─────────────────────────────────────────────────────────
// These constants are safe to import on both server and client.
export const FREE_LIMITS = {
  clients: 10,
  projects: 15,
  invoicesPerMonth: 20,
  attachmentsPerProject: 5,
  maxAttachmentSizeMB: 5,
  totalStorageMB: 50,
} as const;

export type LimitResource = "clients" | "projects" | "invoices" | "attachments";

// ─── isPro ────────────────────────────────────────────────────────────────────
// A user is Pro when their Stripe subscription is active.
// past_due is given a grace period — they still see Pro features.
export function isPro(subscriptionStatus: string | null | undefined): boolean {
  return subscriptionStatus === "active" || subscriptionStatus === "past_due";
}
