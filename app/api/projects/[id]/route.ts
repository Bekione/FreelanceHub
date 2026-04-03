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

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      title,
      description,
      status,
      deadline: deadline ? new Date(deadline) : null,
      budget: budget !== undefined ? parseFloat(budget) : undefined,
      bonus: bonus !== undefined ? parseFloat(bonus) : undefined,
      platform,
      category,
      clientId: clientId || null,
    },
    include: {
      client: { select: { id: true, name: true, company: true } },
      attachments: true,
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

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Referential integrity check — cannot delete a project that has linked invoices
  const linkedInvoices = await prisma.invoice.count({
    where: { projectId: id },
  });
  if (linkedInvoices > 0) {
    return NextResponse.json(
      {
        error: `This project has ${linkedInvoices} linked invoice(s). Remove them first.`,
      },
      { status: 409 },
    );
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
