import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { isPro } from "@/lib/subscription/limits";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body; // "ENABLE" or "DISABLE"

    if (action !== "ENABLE" && action !== "DISABLE") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Verify ownership of the client
    const client = await prisma.client.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    if (action === "DISABLE") {
      const updated = await prisma.client.update({
        where: { id },
        data: { hasPortal: false },
      });
      return NextResponse.json(updated);
    }

    // --- Action is ENABLE ---

    // 1. Fetch user to check sub status
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true },
    });

    // 2. Fetch profile to check lifetime limit
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 500 });
    }

    const _isPro = isPro(user?.subscriptionStatus);

    // If they aren't Pro, check if they've used their 1 lifetime free portal
    if (!_isPro && profile.freePortalUsed) {
      // Allow re-enabling if this exact client was the one that consumed the free limit?
      // Wait, if it's 1-time lifetime, let's keep it extremely strict or fair:
      // they get 1 lifetime generation. If they used it and this client doesn't already have a portalToken, block them.
      // Easiest fair logic: If this specific client already has a token, they are just turning it back on. We allow that.
      if (!client.portalToken) {
        return NextResponse.json(
          {
            error: "Free portal generation limit reached",
            code: "UPGRADE_REQUIRED",
          },
          { status: 403 },
        );
      }
    }

    // 3. Generate token if needed
    const portalToken = client.portalToken || randomBytes(16).toString("hex");

    // 4. Update the client
    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        hasPortal: true,
        portalToken,
      },
    });

    // 5. If this was their first ever portal generation, mark it as consumed for free users
    if (!_isPro && !profile.freePortalUsed && !client.portalToken) {
      await prisma.profile.update({
        where: { userId: session.user.id },
        data: { freePortalUsed: true },
      });
    }

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error("Portal API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
