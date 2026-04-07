import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchInvoices } from "@/lib/actions";
import type { InvoicesParams } from "@/lib/server/invoices";

export function invoicesQueryOptions(params: InvoicesParams = {}) {
  return queryOptions({
    queryKey: queryKeys.invoices(params),
    queryFn: () => fetchInvoices(params),
    staleTime: 60 * 1000,
  });
}
