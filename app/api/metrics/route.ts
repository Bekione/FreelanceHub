import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [
    totalClients,
    totalProjects,
    activeProjects,
    pendingInvoicesData,
    paidInvoicesData,
    recentInvoices,
    recentProjects,
  ] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.project.count({ where: { userId, status: "ACTIVE" } }),
    prisma.invoice.aggregate({
      where: { userId, status: { in: ["PENDING", "OVERDUE"] } },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { userId, status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.invoice.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
    prisma.project.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { client: { select: { name: true } } },
    }),
  ]);

  const recentActivity = [
    ...recentInvoices.map((i) => ({
      type: "invoice" as const,
      label: i.invoiceNumber,
      sub: i.client?.name ?? "—",
      status: i.status,
      date: i.createdAt,
    })),
    ...recentProjects.map((p) => ({
      type: "project" as const,
      label: p.title,
      sub: p.client?.name ?? "No client",
      status: p.status,
      date: p.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return NextResponse.json({
    totalRevenue: paidInvoicesData._sum.amount || 0,
    activeProjects,
    totalProjects,
    pendingInvoicesCount: pendingInvoicesData._count || 0,
    pendingInvoicesAmount: pendingInvoicesData._sum.amount || 0,
    totalClients,
    recentActivity,
  });
}
