import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

/**
 * Server function — fetches paginated invoices directly from Prisma.
 */
export async function getInvoices(
  params: InvoicesParams = {},
): Promise<InvoicesResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const q = params.q ?? "";
  const status = params.status ?? "all";
  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { client: { name: { contains: q, mode: "insensitive" } } },
    ];
  }

  const [invoices, totalItems] = await Promise.all([
    prisma.invoice.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, name: true, company: true } },
        project: { select: { id: true, title: true } },
        items: true,
      },
    }),
    prisma.invoice.count({ where }),
  ]);

  return {
    data: invoices as unknown as Invoice[],
    metadata: {
      totalItems,
      totalPages: limit > 0 ? Math.ceil(totalItems / limit) : 1,
      currentPage: page,
    },
  };
}
