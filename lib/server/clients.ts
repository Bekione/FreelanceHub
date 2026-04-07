import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Client, PaginationMetadata } from "@/lib/types";

export interface ClientsParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface ClientsResult {
  data: Client[];
  metadata: PaginationMetadata;
}

/**
 * Server function — fetches paginated clients directly from Prisma.
 */
export async function getClients(
  params: ClientsParams = {},
): Promise<ClientsResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const page = params.page ?? 1;
  const limit = params.limit ?? 9;
  const q = params.q ?? "";
  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
    ];
  }

  const [clients, totalItems] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        _count: { select: { projects: true, invoices: true } },
      },
    }),
    prisma.client.count({ where }),
  ]);

  return {
    data: clients as unknown as Client[],
    metadata: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  };
}
