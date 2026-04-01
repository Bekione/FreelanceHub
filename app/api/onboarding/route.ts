import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, role, companySize, themePreference } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || session.user.name, // Update name if provided
        role,
        companySize,
        themePreference,
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[ONBOARDING_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
