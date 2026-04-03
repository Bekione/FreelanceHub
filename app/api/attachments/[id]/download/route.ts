import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const p = await params;
    const attachment = await prisma.attachment.findUnique({
      where: { id: p.id },
    });

    if (!attachment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const response = await fetch(attachment.url);
    if (!response.ok) {
      return new NextResponse("Failed to fetch file from storage", {
        status: 500,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${attachment.name}"`,
        "Content-Type": attachment.mimeType || "application/octet-stream",
      },
    });
  } catch (err: any) {
    console.error("Download Error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
