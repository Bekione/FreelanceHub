import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Project, PaginationMetadata } from "@/lib/types";

export interface ProjectsParams {
  page?: number;
  limit?: number;
  q?: string;
  status?: string;
}

export interface ProjectsResult {
  data: Project[];
  metadata: PaginationMetadata;
}

/**
 * Server function — fetches paginated projects directly from Prisma.
 */
export async function getProjects(
  params: ProjectsParams = {},
): Promise<ProjectsResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const page = params.page ?? 1;
  const limit = params.limit ?? 9;
  const q = params.q ?? "";
  const status = params.status ?? "all";
  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [projects, totalItems] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        client: { select: { id: true, name: true, company: true } },
        attachments: true,
        _count: { select: { invoices: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    data: projects as unknown as Project[],
    metadata: {
      totalItems,
      totalPages: limit > 0 ? Math.ceil(totalItems / limit) : 1,
      currentPage: page,
    },
  };
}
