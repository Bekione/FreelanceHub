import { Suspense } from "react";
import type { Metadata } from "next";
import { getInvoices } from "@/lib/server/invoices";
import { InvoicesContent } from "./invoices-client";
import { InvoicesSkeleton } from "./invoices-skeleton";
import type { InvoicesResult } from "@/lib/queries/invoices";

export const metadata: Metadata = {
  title: "Invoices | FreelanceHub",
  description:
    "Track and manage your client invoices, payments, and overdue amounts.",
};

export default async function InvoicesPage() {
  let initialData: InvoicesResult | null = null;
  try {
    initialData = (await getInvoices({})) as unknown as InvoicesResult;
  } catch {
    // Client will fetch via /api/invoices
  }

  return (
    <Suspense fallback={<InvoicesSkeleton />}>
      <InvoicesContent initialData={initialData} />
    </Suspense>
  );
}
