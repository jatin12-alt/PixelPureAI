import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const output = await replicate.run(
      "xiankgx/saliency-crop:4efc9d7853241da40cbc41f11246908e070403f8a220256100741ad37b1da14d",
      {
        input: {
          image: imageUrl,
        },
      }
    );

    // Ensure output is a string URL
    const resultUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ success: true, url: resultUrl });
  } catch (error) {
    console.error("Replicate Smart Crop Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Smart crop failed" },
      { status: 500 }
    );
  }
}
