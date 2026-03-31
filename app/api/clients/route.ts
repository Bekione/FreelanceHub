import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { projects: true, invoices: true } },
    },
  });

  return NextResponse.json(clients);
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
