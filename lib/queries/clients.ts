import { queryOptions } from "@tanstack/react-query";
import { queryKeys } from "./keys";
import { fetchClients } from "@/lib/actions";
import type { ClientsParams } from "@/lib/server/clients";

export function clientsQueryOptions(params: ClientsParams = {}) {
  return queryOptions({
    queryKey: queryKeys.clients(params),
    queryFn: () => fetchClients(params),
    staleTime: 60 * 1000,
  });
}
