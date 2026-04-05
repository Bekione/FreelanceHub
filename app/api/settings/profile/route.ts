import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hasLocale, freeLocales } from "@/lib/i18n/config";
import { isPro } from "@/lib/subscription/limits";
import type { FreeLocale } from "@/lib/i18n/config";

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
    "theme",
    "dateFormat",
    "paymentDetails",
    "language",
  ];
  const allowed = [...allowedBrandingFields, ...allowedPrefFields];

  // Pro gate: reject Pro locales for Free users
  if ("language" in body) {
    const lang = body.language;
    if (!hasLocale(lang)) {
      return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
    }
    const isProLocale = !(freeLocales as readonly string[]).includes(lang);
    if (isProLocale) {
      const user = session.user as { subscriptionStatus?: string };
      if (!isPro(user.subscriptionStatus)) {
        return NextResponse.json(
          { error: "UPGRADE_REQUIRED", code: "UPGRADE_REQUIRED" },
          { status: 403 },
        );
      }
    }
  }

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
