import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FREE_LIMITS, isPro } from "@/lib/subscription/limits";

// Define max sizes for intents (in MB)
const INTENT_LIMITS = {
  avatar: 5,
  brandLogo: 5,
  clientPhoto: 5,
  attachment: FREE_LIMITS.maxAttachmentSizeMB,
};

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIsPro = isPro((session.user as any)?.subscriptionStatus);

    const url = new URL(req.url);
    const intentQuery = url.searchParams.get("intent");
    const contentLength = parseInt(
      req.headers.get("content-length") || "0",
      10,
    );

    // Early exit using headers to avoid crashing Next.js Body Parser
    if (intentQuery) {
      const earlyLimitMB =
        userIsPro && intentQuery === "attachment"
          ? 50
          : INTENT_LIMITS[intentQuery as keyof typeof INTENT_LIMITS] || 5;
      if (contentLength > earlyLimitMB * 1024 * 1024) {
        return NextResponse.json(
          {
            error: `File is too large. Maximum size for ${intentQuery} is ${earlyLimitMB}MB.`,
          },
          { status: 413 },
        );
      }
    }

    // Some huge files might crash here if over Next.js raw limits,
    // so clients should pre-validate or handle 413 responses.
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const intent = formData.get("intent") as string | null;

    if (!file || !intent) {
      return NextResponse.json(
        { error: "File and intent are required" },
        { status: 400 },
      );
    }

    const typeLimits = INTENT_LIMITS[intent as keyof typeof INTENT_LIMITS] || 5;

    // Type validation for images
    if (
      (intent === "avatar" ||
        intent === "brandLogo" ||
        intent === "clientPhoto") &&
      !file.type.startsWith("image/")
    ) {
      return NextResponse.json(
        { error: "This upload requires an image file (PNG, JPG, WebP)." },
        { status: 400 },
      );
    }

    // Single file size validation (applies to all users depending on limits context)
    // For attachments, Pro users have basically higher or no limits, but let's say 50MB hard limit for everyone
    const maxBytes =
      userIsPro && intent === "attachment"
        ? 50 * 1024 * 1024
        : typeLimits * 1024 * 1024;

    if (file.size > maxBytes) {
      return NextResponse.json(
        {
          error: `File is too large. Maximum size is ${userIsPro && intent === "attachment" ? 50 : typeLimits}MB.`,
        },
        { status: 400 },
      );
    }

    let cloudinaryFolder = "";
    let publicId = "";
    let resourceType: "auto" | "image" | "raw" = "auto";
    const baseFolder = process.env.CLOUDINARY_FOLDER || "freelance-hub";

    // ─── Attachment Validation Context ──────────────────────────────
    if (intent === "attachment") {
      const projectId = formData.get("projectId") as string | null;
      if (!projectId)
        return NextResponse.json(
          { error: "projectId is required" },
          { status: 400 },
        );

      const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.user.id },
        include: { attachments: true },
      });
      if (!project)
        return NextResponse.json(
          { error: "Project not found" },
          { status: 404 },
        );

      if (!userIsPro) {
        if (project.attachments.length >= FREE_LIMITS.attachmentsPerProject) {
          return NextResponse.json(
            {
              error: `Free limit reached: max ${FREE_LIMITS.attachmentsPerProject} attachments per project.`,
            },
            { status: 403 },
          );
        }

        const allAtt = await prisma.attachment.aggregate({
          where: { project: { userId: session.user.id } },
          _sum: { size: true },
        });
        const totalUsed = allAtt._sum.size || 0;
        if (totalUsed + file.size > FREE_LIMITS.totalStorageMB * 1024 * 1024) {
          return NextResponse.json(
            {
              error: `Vault storage limit reached (${FREE_LIMITS.totalStorageMB}MB max for Free tier).`,
            },
            { status: 403 },
          );
        }
      }

      cloudinaryFolder = `${baseFolder}/attachments/${projectId}`;
      resourceType = "auto";

      const nameParts = file.name.split(".");
      const ext = nameParts.length > 1 ? nameParts.pop() : "";
      const baseName = nameParts.join(".").replace(/[^a-zA-Z0-9_\-]/g, "_");
      publicId = `${baseName}_${Date.now()}${ext ? `.${ext}` : ""}`;
    }

    // ─── Avatar Context ─────────────────────────────────────────────
    if (intent === "avatar") {
      cloudinaryFolder = `${baseFolder}/user-avatars`;
      publicId = `user_${session.user.id}_avatar`;
      resourceType = "image";
    }

    // ─── Brand Logo Context ─────────────────────────────────────────
    if (intent === "brandLogo") {
      cloudinaryFolder = `${baseFolder}/brand-logos`;
      publicId = `brand_${session.user.id}_logo`;
      resourceType = "image";
    }

    // ─── Client Photo Context ────────────────────────────────────────
    if (intent === "clientPhoto") {
      const clientId = formData.get("clientId") as string | null;
      if (!clientId)
        return NextResponse.json(
          { error: "clientId is required for clientPhoto intent" },
          { status: 400 },
        );
      cloudinaryFolder = `${baseFolder}/client-photos`;
      publicId = `client_${clientId}_photo`;
      resourceType = "image";
    }

    // ─── Execute Cloudinary Upload ─────────────────────────────────
    const arrayBuffer = await file.arrayBuffer();
    const base64Data = `data:${file.type || "application/octet-stream"};base64,${Buffer.from(arrayBuffer).toString("base64")}`;

    const uploadOptions: Record<string, any> = {
      folder: cloudinaryFolder,
      resource_type: resourceType,
      overwrite: true,
    };
    if (publicId) uploadOptions.public_id = publicId;
    if (intent === "attachment") uploadOptions.original_filename = file.name;
    // Formatting tweaks
    if (intent === "avatar" || intent === "brandLogo") {
      uploadOptions.format = "webp";
      uploadOptions.quality = "auto";
    }
    if (intent === "avatar") {
      uploadOptions.gravity = "face";
      uploadOptions.crop = "fill";
      uploadOptions.width = 400;
      uploadOptions.height = 400;
    }

    const uploadResponse = await cloudinary.uploader.upload(
      base64Data,
      uploadOptions,
    );

    // ─── Persist to DB ─────────────────────────────────────────────
    if (intent === "avatar") {
      // Typically the client sends an update back to betterAuth, but we could enforce it here too
      // However the profile client handles auth update directly right after.
    } else if (intent === "brandLogo") {
      await prisma.profile.upsert({
        where: { userId: session.user.id },
        update: { brandLogoUrl: uploadResponse.secure_url },
        create: {
          userId: session.user.id,
          brandLogoUrl: uploadResponse.secure_url,
        },
      });
    } else if (intent === "clientPhoto") {
      const clientId = formData.get("clientId") as string;
      // Verify ownership before updating
      const client = await prisma.client.findFirst({
        where: { id: clientId, userId: session.user.id },
      });
      if (!client)
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404 },
        );
      await prisma.client.update({
        where: { id: clientId },
        data: { imageUrl: uploadResponse.secure_url },
      });
    } else if (intent === "attachment") {
      const projectId = formData.get("projectId") as string;
      const attachment = await prisma.attachment.create({
        data: {
          name: file.name,
          url: uploadResponse.secure_url,
          size: file.size,
          mimeType: file.type,
          projectId,
        },
      });
      return NextResponse.json(attachment, { status: 201 });
    }

    return NextResponse.json({ url: uploadResponse.secure_url });
  } catch (err: any) {
    console.error("Upload Error:", err);
    // Catch Next.js PayloadTooLargeError from body parser just in case
    if (
      err.name === "PayloadTooLargeError" ||
      err.message?.toLowerCase().includes("exceeded")
    ) {
      return NextResponse.json(
        { error: "File is completely too large for the server to process." },
        { status: 413 },
      );
    }

    return NextResponse.json(
      { error: "Failed to upload file due to an unexpected error." },
      { status: 500 },
    );
  }
}
