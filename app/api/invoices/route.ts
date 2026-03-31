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
  const limit = parseInt(searchParams.get("limit") || "10");
  const q = searchParams.get("q") || "";
  const status = searchParams.get("status") || "all";

  const skip = (page - 1) * limit;

  const where: any = { userId: session.user.id };
  if (status !== "all") {
    where.status = status;
  }
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

  return NextResponse.json({
    data: invoices,
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

  const body = await req.json();
  const { invoiceNumber, amount, dueDate, notes, clientId, projectId, items } =
    body;

  if (!invoiceNumber || !amount || !dueDate) {
    return NextResponse.json(
      { error: "Invoice number, amount, and due date are required" },
      { status: 400 },
    );
  }

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      amount: parseFloat(amount),
      dueDate: new Date(dueDate),
      notes,
      clientId: clientId || null,
      projectId: projectId || null,
      userId: session.user.id,
      items: items?.length
        ? {
            create: items.map(
              (item: {
                description: string;
                quantity: number;
                unitPrice: number;
              }) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
              }),
            ),
          }
        : undefined,
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
      project: { select: { id: true, title: true } },
      items: true,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
