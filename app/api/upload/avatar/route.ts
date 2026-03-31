import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the request
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate the file is an image
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    // 3. Convert File to base64 for Cloudinary upload capability in memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = `data:${file.type};base64,${buffer.toString("base64")}`;

    // 4. Upload to Cloudinary with the user's specific folder and optimization transformations
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "freelance-hub/user-avatars",
      public_id: `user_${session.user.id}_avatar`,
      overwrite: true,
      gravity: "face",
      crop: "fill",
      width: 400,
      height: 400,
      format: "webp",
      quality: "auto",
      fetch_format: "auto",
    });

    return NextResponse.json(
      { url: uploadResponse.secure_url },
      { status: 200 },
    );
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
