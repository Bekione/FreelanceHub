import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { DashboardMetrics } from "@/lib/types";

async function fetchMetrics(): Promise<DashboardMetrics> {
  const res = await fetch("/api/metrics");
  if (!res.ok) throw new Error("Failed to fetch metrics");
  return res.json();
}

export function metricsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.metrics(),
    queryFn: fetchMetrics,
    staleTime: 60 * 1000,
  });
}
