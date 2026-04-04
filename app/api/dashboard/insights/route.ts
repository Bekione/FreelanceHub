import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { startOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Pro
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, plan: true },
    });

    const isPro =
      user?.subscriptionStatus === "active" ||
      user?.subscriptionStatus === "past_due" ||
      user?.plan === "pro";

    // Revenue Over Time (last 6 months)
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    const paidInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: "PAID",
        issueDate: { gte: sixMonthsAgo },
      },
      select: { amount: true, issueDate: true, bonus: true },
    });

    const monthsMap = new Map<string, number>();
    // Initialize last 6 months to 0
    for (let i = 5; i >= 0; i--) {
      monthsMap.set(format(subMonths(new Date(), i), "MMM"), 0);
    }

    paidInvoices.forEach((inv) => {
      const m = format(inv.issueDate, "MMM");
      if (monthsMap.has(m)) {
        monthsMap.set(m, monthsMap.get(m)! + inv.amount + (inv.bonus || 0));
      }
    });

    const revenueOverTime = Array.from(monthsMap.entries()).map(
      ([month, revenue]) => ({
        month,
        revenue,
      }),
    );

    // Return limited data for non-pro users
    if (!isPro) {
      return NextResponse.json({
        isLocked: true,
        revenueOverTime,
        projectBreakdown: [],
        topClients: [],
      });
    }

    // 2. Project Breakdown (Pro Only)
    const projectCounts = await prisma.project.groupBy({
      by: ["status"],
      where: { userId: session.user.id },
      _count: { _all: true },
    });

    const projectBreakdown = projectCounts.map((pc) => ({
      status: pc.status,
      count: pc._count._all,
    }));

    // 3. Top Clients by Revenue (Pro Only)
    const clientRevenues = await prisma.invoice.groupBy({
      by: ["clientId"],
      where: {
        userId: session.user.id,
        status: "PAID",
        clientId: { not: null },
      },
      _sum: { amount: true, bonus: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    });

    const topClients = [];
    for (const cr of clientRevenues) {
      if (!cr.clientId) continue;
      const client = await prisma.client.findUnique({
        where: { id: cr.clientId },
        select: { name: true },
      });
      if (client) {
        topClients.push({
          name: client.name,
          revenue: (cr._sum.amount || 0) + (cr._sum.bonus || 0),
        });
      }
    }

    return NextResponse.json({
      isLocked: false,
      revenueOverTime,
      projectBreakdown,
      topClients,
    });
  } catch (error: any) {
    console.error("INSIGHTS API ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Internal Server Error", stack: error?.stack },
      { status: 500 },
    );
  }
}
