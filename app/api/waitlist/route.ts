import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const waitlistSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = waitlistSchema.safeParse(json);

    if (!body.success) {
      return new NextResponse("Invalid email address", { status: 400 });
    }

    const { email } = body.data;

    // Check if email already exists
    const existing = await prisma.waitlist.findUnique({
      where: { email },
    });

    if (existing) {
      return new NextResponse("You are already on the waitlist!", {
        status: 400,
      });
    }

    // Save to database
    await prisma.waitlist.create({
      data: { email },
    });

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Waitlist error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
