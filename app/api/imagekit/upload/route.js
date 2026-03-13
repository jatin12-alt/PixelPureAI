import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import ImageKit from "@imagekit/nodejs";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { userId } = await auth();
    // Allow guest uploads for the studio to function for non-logged-in users
    // We can still log the userId if available for analytics
    console.log("Upload request from:", userId || "guest");

    const imagekit = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY?.replace(/^"(.*)"$/, '$1'),
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY?.replace(/^"(.*)"$/, '$1'),
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT?.replace(/^"(.*)"$/, '$1'),
    });

    if (!process.env.IMAGEKIT_PRIVATE_KEY) {
      throw new Error("IMAGEKIT_PRIVATE_KEY is missing in environment variables");
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName =
      fileName?.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 50) || "upload";
    const uniqueFileName = `${timestamp}_${sanitizedFileName}`;

    console.log("Attempting ImageKit upload (base64)...", {
      fileName: uniqueFileName,
      fileSize: bytes.byteLength,
      folder: "/guest_uploads"
    });

    // Upload to ImageKit - Simple server-side upload
    const uploadResponse = await imagekit.upload({
      file: base64,
      fileName: uniqueFileName,
      folder: "/guest_uploads",
      useUniqueFileName: true,
    });

    if (!uploadResponse.url) {
      console.error("ImageKit upload response missing URL:", uploadResponse);
      throw new Error("Upload response missing URL");
    }

    return NextResponse.json({ success: true, url: uploadResponse.url });
  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
