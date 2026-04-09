import { Suspense } from "react";
import type { Metadata } from "next";
import { ClientsContent } from "./clients-client";
import { ClientsSkeleton } from "./clients-skeleton";

export const metadata: Metadata = {
  title: "Clients | FreelanceHub",
  description:
    "Keep track of your clients, their contact info, and associated companies.",
};

export default function ClientsPage() {
  return (
    <Suspense fallback={<ClientsSkeleton />}>
      <ClientsContent />
    </Suspense>
  );
}
