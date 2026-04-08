import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import type { Invoice, PaginationMetadata } from "@/lib/types";

export interface InvoicesParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

export interface InvoicesResult {
  data: Invoice[];
  metadata: PaginationMetadata;
}

async function fetchInvoices(
  params: InvoicesParams = {},
): Promise<InvoicesResult> {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.q) search.set("q", params.q);
  if (params.status && params.status !== "all")
    search.set("status", params.status);
  const res = await fetch(`/api/invoices?${search}`);
  if (!res.ok) throw new Error("Failed to fetch invoices");
  return res.json();
}

export function invoicesQueryOptions(params: InvoicesParams = {}) {
  return queryOptions({
    queryKey: queryKeys.invoices(params),
    queryFn: () => fetchInvoices(params),
    staleTime: 60 * 1000,
  });
}
