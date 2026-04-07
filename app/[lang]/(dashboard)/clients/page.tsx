import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { clientsQueryOptions } from "@/lib/queries/clients";
import { getClients } from "@/lib/server/clients";
import { ClientsContent } from "./clients-client";
import { ClientsSkeleton } from "./clients-skeleton";

export const metadata: Metadata = {
  title: "Clients | FreelanceHub",
  description:
    "Keep track of your clients, their contact info, and associated companies.",
};

export default async function ClientsPage() {
  const queryClient = getQueryClient();

  await queryClient
    .prefetchQuery({ ...clientsQueryOptions(), queryFn: () => getClients({}) })
    .catch(() => {});

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<ClientsSkeleton />}>
        <ClientsContent />
      </Suspense>
    </HydrationBoundary>
  );
}
