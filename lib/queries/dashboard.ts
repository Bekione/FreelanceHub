import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { getDashboardMetrics } from "@/lib/actions";

export function metricsQueryOptions() {
  return queryOptions({
    queryKey: queryKeys.metrics(),
    queryFn: getDashboardMetrics,
    staleTime: 60 * 1000,
  });
}
