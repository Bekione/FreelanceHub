import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const p = await params;

    // Find attachment and verify ownership via project
    const attachment = await prisma.attachment.findUnique({
      where: { id: p.id },
      include: {
        project: { select: { userId: true } },
      },
    });

    if (!attachment)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (attachment.project.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to extract public_id from secure_url
    // Example: https://res.cloudinary.com/.../raw/upload/v1234/freelance-hub/attachments/USER/PROJECT/filename.ext
    // We basically need the part after "upload/v[0-9]+/"
    const urlMatches = attachment.url.match(/upload\/(?:v\d+\/)?(.+)$/);
    if (urlMatches && urlMatches[1]) {
      const publicId = urlMatches[1];
      // Note: for raw files, resource_type is strictly "raw" in Cloudinary delete
      await cloudinary.uploader
        .destroy(publicId, { resource_type: "raw" })
        .catch((e) => {
          // If it was actually an image (auto pushed to image), try image type safely
          cloudinary.uploader
            .destroy(publicId, { resource_type: "image" })
            .catch(() => {});
        });
    }

    await prisma.attachment.delete({ where: { id: p.id } });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Delete Attachment Error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
