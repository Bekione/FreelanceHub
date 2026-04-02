import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, isPro } from "@/lib/subscription/limits";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;
  const pro = isPro(session.user.subscriptionStatus);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [clientCount, projectCount, invoiceMonthCount] = await Promise.all([
    prisma.client.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
    prisma.invoice.count({
      where: { userId, createdAt: { gte: startOfMonth } },
    }),
  ]);

  return NextResponse.json({
    isPro: pro,
    limits: pro
      ? { clients: Infinity, projects: Infinity, invoicesPerMonth: Infinity }
      : FREE_LIMITS,
    usage: {
      clients: clientCount,
      projects: projectCount,
      invoicesThisMonth: invoiceMonthCount,
    },
  });
}
