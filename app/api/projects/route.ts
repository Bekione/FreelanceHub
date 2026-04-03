import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "9");
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";

  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (status !== "all") {
    where.status = status;
  }
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

  return NextResponse.json({
    data: projects,
    metadata: {
      totalItems,
      totalPages: limit > 0 ? Math.ceil(totalItems / limit) : 1,
      currentPage: page,
    },
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Free-tier hard gate ────────────────────────────────────────────────────
  const { checkLimit } = await import("@/lib/subscription/check-limit");
  const limitCheck = await checkLimit(
    session.user.id,
    "projects",
    session.user.subscriptionStatus,
  );
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: "UPGRADE_REQUIRED",
        resource: limitCheck.resource,
        limit: limitCheck.limit,
        current: limitCheck.current,
      },
      { status: 403 },
    );
  }

  const body = await req.json();
  const {
    title,
    description,
    status,
    deadline,
    budget,
    bonus,
    platform,
    category,
    clientId,
  } = body;

  if (!title)
    return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const project = await prisma.project.create({
    data: {
      title,
      description,
      status: status ?? "PENDING",
      deadline: deadline ? new Date(deadline) : null,
      budget: budget ? parseFloat(budget) : null,
      bonus: bonus ? parseFloat(bonus) : 0,
      platform: platform || null,
      category: category || "other",
      userId: session.user.id,
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
