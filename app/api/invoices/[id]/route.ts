import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { invoiceNumber, amount, status, dueDate, notes, clientId, projectId } =
    body;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      invoiceNumber,
      amount: amount !== undefined ? parseFloat(amount) : undefined,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      clientId: clientId !== undefined ? clientId || null : undefined,
      projectId: projectId !== undefined ? projectId || null : undefined,
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
      project: { select: { id: true, title: true } },
      items: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (!invoice || invoice.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.invoice.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
