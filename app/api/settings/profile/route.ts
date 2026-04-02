import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET: fetch current profile settings
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(profile ?? {});
}

// PATCH: update branding or preferences fields
export async function PATCH(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Allowlist the fields that can be updated through this route
  const allowedBrandingFields = ["brandLogoUrl", "brandColor", "invoicePrefix"];
  const allowedPrefFields = [
    "autoCreateInvoice",
    "defaultCurrency",
    "timezone",
    "emailNotifications",
    "bio",
    "website",
    "location",
    "phone",
    "hourlyRate",
    "currency",
  ];
  const allowed = [...allowedBrandingFields, ...allowedPrefFields];

  const data: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) data[key] = body[key];
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 },
    );
  }

  const profile = await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  });

  return NextResponse.json(profile);
}
