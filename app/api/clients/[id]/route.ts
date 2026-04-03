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
  const { name, email, company, phone, notes, imageUrl } = body;

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.client.update({
    where: { id },
    data: { name, email, company, phone, notes, imageUrl },
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

  const client = await prisma.client.findUnique({ where: { id } });
  if (!client || client.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Referential integrity check — cannot delete a client that has linked projects
  const linkedProjects = await prisma.project.count({
    where: { clientId: id },
  });
  if (linkedProjects > 0) {
    return NextResponse.json(
      {
        error: `This client has ${linkedProjects} linked project(s). Remove or reassign them first.`,
      },
      { status: 409 },
    );
  }

  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
