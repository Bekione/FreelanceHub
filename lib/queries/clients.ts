import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { Client, PaginationMetadata } from "@/lib/types";

export interface ClientsParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface ClientsResult {
  data: Client[];
  metadata: PaginationMetadata;
}

async function fetchClients(
  params: ClientsParams = {},
): Promise<ClientsResult> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  const res = await fetch(`/api/clients?${search}`);
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export function clientsQueryOptions(params: ClientsParams = {}) {
  return queryOptions({
    queryKey: queryKeys.clients(params),
    queryFn: () => fetchClients(params),
    staleTime: 60 * 1000,
  });
}
