import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { metricsQueryOptions } from "@/lib/queries/dashboard";
import { invoicesQueryOptions } from "@/lib/queries/invoices";
import { getMetrics } from "@/lib/server/dashboard";
import { getInvoices } from "@/lib/server/invoices";
import { DashboardContent } from "./dashboard-client";
import { DashboardSkeleton } from "./dashboard-skeleton";

export const metadata: Metadata = {
  title: "Dashboard | FreelanceHub",
  description:
    "Overview of your freelance business metrics and recent activity.",
};

export default async function DashboardPage() {
  const queryClient = getQueryClient();

  // Prefetch directly from DB on the server — no HTTP round-trip
  // try/catch: if session unavailable during SSR, client will fetch via Server Action
  await Promise.all([
    queryClient
      .prefetchQuery({ ...metricsQueryOptions(), queryFn: getMetrics })
      .catch(() => {}),
    queryClient
      .prefetchQuery({
        ...invoicesQueryOptions(),
        queryFn: () => getInvoices({}),
      })
      .catch(() => {}),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </HydrationBoundary>
  );
}
