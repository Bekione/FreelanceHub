import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const projects = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, company: true } },
      _count: { select: { invoices: true } },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    title,
    description,
    status,
    deadline,
    budget,
    bonus,
    platform,
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
      platform,
      clientId: clientId || null,
      userId: session.user.id,
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
