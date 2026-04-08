import { Suspense } from "react";
import type { Metadata } from "next";
import { getClients } from "@/lib/server/clients";
import { ClientsContent } from "./clients-client";
import { ClientsSkeleton } from "./clients-skeleton";
import type { ClientsResult } from "@/lib/queries/clients";

export const metadata: Metadata = {
  title: "Clients | FreelanceHub",
  description:
    "Keep track of your clients, their contact info, and associated companies.",
};

export default async function ClientsPage() {
  let initialData: ClientsResult | null = null;
  try {
    initialData = (await getClients({})) as unknown as ClientsResult;
  } catch {
    // Client will fetch via /api/clients
  }

  return (
    <Suspense fallback={<ClientsSkeleton />}>
      <ClientsContent initialData={initialData} />
    </Suspense>
  );
}
