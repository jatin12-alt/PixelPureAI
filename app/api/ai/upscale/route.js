import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { imageUrl, scale } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const output = await replicate.run(
      "nightmareai/real-esrgan:f121321de14595286b03330c05ca9afaa2f0528b74ef8ccf3aa43cd585bc6515",
      {
        input: {
          image: imageUrl,
          scale: scale || 2,
          face_enhance: false,
        },
      }
    );

    // Ensure output is a string URL
    const resultUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ success: true, url: resultUrl });
  } catch (error) {
    console.error("Replicate Upscale Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Upscaling failed" },
      { status: 500 }
    );
  }
}
