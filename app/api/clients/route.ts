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

  return NextResponse.json({
    data: clients,
    metadata: {
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    },
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, email, company, phone, notes } = body;

  if (!name)
    return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const client = await prisma.client.create({
    data: { name, email, company, phone, notes, userId: session.user.id },
  });

  return NextResponse.json(client, { status: 201 });
}
