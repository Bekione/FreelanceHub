// THIS FILE IS SERVER-ONLY. Do not import from client components.
// It uses Prisma (Node.js runtime only).
import "server-only";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, isPro, type LimitResource } from "./limits";

// ─── checkLimit ───────────────────────────────────────────────────────────────
// Returns { allowed: true } if the user can create another resource,
// or { allowed: false, limit, current } if they've hit their Free cap.
export async function checkLimit(
  userId: string,
  resource: LimitResource,
  userSubscriptionStatus: string | null | undefined,
): Promise<
  | { allowed: true }
  | { allowed: false; limit: number; current: number; resource: LimitResource }
> {
  // Pro users are never restricted
  if (isPro(userSubscriptionStatus)) return { allowed: true };

  if (resource === "clients") {
    const count = await prisma.client.count({ where: { userId } });
    if (count >= FREE_LIMITS.clients) {
      return {
        allowed: false,
        limit: FREE_LIMITS.clients,
        current: count,
        resource,
      };
    }
  }

  if (resource === "projects") {
    const count = await prisma.project.count({ where: { userId } });
    if (count >= FREE_LIMITS.projects) {
      return {
        allowed: false,
        limit: FREE_LIMITS.projects,
        current: count,
        resource,
      };
    }
  }

  if (resource === "invoices") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const count = await prisma.invoice.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    });
    if (count >= FREE_LIMITS.invoicesPerMonth) {
      return {
        allowed: false,
        limit: FREE_LIMITS.invoicesPerMonth,
        current: count,
        resource,
      };
    }
  }

  return { allowed: true };
}
