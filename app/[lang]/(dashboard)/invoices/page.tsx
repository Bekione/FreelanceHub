import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/get-query-client";
import { invoicesQueryOptions } from "@/lib/queries/invoices";
import { metricsQueryOptions } from "@/lib/queries/dashboard";
import { getInvoices } from "@/lib/server/invoices";
import { getMetrics } from "@/lib/server/dashboard";
import { InvoicesContent } from "./invoices-client";
import { InvoicesSkeleton } from "./invoices-skeleton";

export const metadata: Metadata = {
  title: "Invoices | FreelanceHub",
  description:
    "Track and manage your client invoices, payments, and overdue amounts.",
};

export default async function InvoicesPage() {
  const queryClient = getQueryClient();

  await Promise.all([
    queryClient
      .prefetchQuery({
        ...invoicesQueryOptions(),
        queryFn: () => getInvoices({}),
      })
      .catch(() => {}),
    queryClient
      .prefetchQuery({ ...metricsQueryOptions(), queryFn: getMetrics })
      .catch(() => {}),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<InvoicesSkeleton />}>
        <InvoicesContent />
      </Suspense>
    </HydrationBoundary>
  );
}
