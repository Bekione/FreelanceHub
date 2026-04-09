import { Suspense } from "react";
import type { Metadata } from "next";
import { InvoicesContent } from "./invoices-client";
import { InvoicesSkeleton } from "./invoices-skeleton";

export const metadata: Metadata = {
  title: "Invoices | FreelanceHub",
  description:
    "Track and manage your client invoices, payments, and overdue amounts.",
};

export default function InvoicesPage() {
  return (
    <Suspense fallback={<InvoicesSkeleton />}>
      <InvoicesContent />
    </Suspense>
  );
}
