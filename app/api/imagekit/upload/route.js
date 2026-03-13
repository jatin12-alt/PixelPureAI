import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    });

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName =
      fileName?.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50) || "upload";
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    // Upload to ImageKit - Simple server-side upload
    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder: "/guest_uploads",
    });

    if (!uploadResponse.url) throw new Error("Upload response missing URL");

    return NextResponse.json({ success: true, url: uploadResponse.url });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    );
  }
}
