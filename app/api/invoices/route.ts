import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, name: true, company: true } },
      project: { select: { id: true, title: true } },
      items: true,
    },
  });

  return NextResponse.json(invoices);
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
