import { Suspense } from "react";
import type { Metadata } from "next";
import { getMetrics } from "@/lib/server/dashboard";
import { DashboardContent } from "./dashboard-client";
import { DashboardSkeleton } from "./dashboard-skeleton";
import type { DashboardMetrics } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard | FreelanceHub",
  description:
    "Overview of your freelance business metrics and recent activity.",
};

export default async function DashboardPage() {
  let initialMetrics: DashboardMetrics | null = null;
  try {
    initialMetrics = await getMetrics();
  } catch {
    // Degraded gracefully — client will fetch via /api/metrics
  }

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent initialMetrics={initialMetrics} />
    </Suspense>
  );
}
