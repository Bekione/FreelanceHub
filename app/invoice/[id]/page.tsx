import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PrintButton } from "@/components/invoices/print-button";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const unresolvedParams = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id: unresolvedParams.id },
    include: { client: true },
  });

  if (!invoice) return { title: "Invoice Not Found" };

  const clientName = invoice.client?.name || "Client";
  return {
    title: `Invoice_${invoice.invoiceNumber}_${clientName.replace(/\s+/g, "_")}`,
  };
}

export default async function PublicInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unresolvedParams = await params;
  // This is a public route, accessed via a hard-to-guess CUID
  const invoice = await prisma.invoice.findUnique({
    where: { id: unresolvedParams.id },
    include: {
      client: true,
      project: true,
      user: { include: { profile: true } },
    },
  });

  if (!invoice) return notFound();

  const profile = invoice.user.profile;
  const currency = profile?.currency || "USD";
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  });

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-8">
      {/* 
        This style block actively hides the printing tools from the final PDF.
        We also strictly enforce padding and colors so that it doesn't inherit random browser print default margins.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .no-print { display: none !important; }
          html, body { 
            background: white !important; 
            color: black !important; 
            color-scheme: light !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          @page { margin: 10mm; }
        }
      `,
        }}
      />

      {/* Floating Action Bar (Hidden when printed) */}
      <div className="no-print fixed top-6 right-6 z-50 flex items-center gap-3">
        <PrintButton />
      </div>

      <div className="w-full max-w-[800px] bg-white text-black p-10 sm:p-16 shadow-none mx-auto relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            {profile?.brandLogoUrl ? (
              <img
                src={profile.brandLogoUrl}
                alt="Brand Logo"
                className="h-16 w-auto object-contain mb-4"
              />
            ) : (
              <h1 className="text-3xl font-bold font-heading text-neutral-900">
                {invoice.user.name}
              </h1>
            )}
            <div className="text-sm text-neutral-500 mt-2 space-y-1">
              <p>{invoice.user.email}</p>
              {profile?.phone && <p>{profile.phone}</p>}
              {profile?.website && <p>{profile.website}</p>}
              {profile?.location && <p>{profile.location}</p>}
            </div>
          </div>
          <div className="text-right">
            <h2
              className="text-4xl font-bold font-heading uppercase tracking-widest mb-4"
              style={{ color: profile?.brandColor || "rgb(229 229 229)" }}
            >
              Invoice
            </h2>
            <div className="text-sm">
              <p className="font-semibold text-neutral-800">
                Invoice #:{" "}
                <span className="font-mono text-neutral-600">
                  {invoice.invoiceNumber}
                </span>
              </p>
              <p className="text-neutral-500 mt-1">
                Date: {new Date(invoice.issueDate).toLocaleDateString()}
              </p>
              <p className="text-neutral-500">
                Due:{" "}
                <span className="font-medium text-neutral-800">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-12 border-t border-neutral-200 pt-8">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">
            Bill To
          </h3>
          <div className="text-sm text-neutral-800">
            <p className="font-semibold text-base">
              {invoice.client?.name || "N/A"}
            </p>
            {invoice.client?.company && <p>{invoice.client.company}</p>}
            {invoice.client?.email && (
              <p className="text-neutral-500 mt-1">{invoice.client.email}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-left mb-12 border-collapse">
          <thead>
            <tr
              className="border-b-2 text-sm font-semibold text-neutral-800"
              style={{ borderColor: profile?.brandColor || "#262626" }}
            >
              <th className="py-3 px-2">Description</th>
              <th className="py-3 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="text-sm text-neutral-700 divide-y divide-neutral-100">
            <tr>
              <td className="py-4 px-2">
                <p className="font-medium text-neutral-900">
                  {invoice.project
                    ? `Services rendered for: ${invoice.project.title}`
                    : "Professional Services"}
                </p>
                {invoice.notes && (
                  <p className="text-neutral-500 text-xs mt-1 max-w-sm">
                    {invoice.notes}
                  </p>
                )}
              </td>
              <td className="py-4 px-2 text-right font-medium text-neutral-900">
                {formatter.format(invoice.amount)}
              </td>
            </tr>
            {/* If there was a bonus included */}
            {Boolean(invoice.bonus) && invoice.bonus! > 0 && (
              <tr>
                <td className="py-4 px-2">
                  <p className="font-medium text-neutral-900">
                    Bonus / Additional Fees
                  </p>
                </td>
                <td className="py-4 px-2 text-right font-medium text-neutral-900">
                  {formatter.format(invoice.bonus!)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-16">
          <div className="w-64 space-y-3 text-sm">
            <div
              className="flex justify-between border-t-2 pt-3 font-bold text-base"
              style={{ borderColor: profile?.brandColor || "#262626" }}
            >
              <span>Total Due:</span>
              <span style={{ color: profile?.brandColor || "inherit" }}>
                {formatter.format(invoice.amount + (invoice.bonus || 0))}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Details Footer */}
        {profile?.paymentDetails && (
          <div className="mt-16 pt-6 border-t border-neutral-200">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-2">
              Payment Instructions
            </h3>
            <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">
              {profile.paymentDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
