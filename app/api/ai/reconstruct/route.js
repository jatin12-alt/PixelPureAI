import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { imageUrl, type } = await request.json(); // type: 'sharpen' or 'denoise'

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // Parameters based on type
    const fidelity = type === "denoise" ? 0.9 : 0.5; // High fidelity for denoise, lower for sharpen
    
    const output = await replicate.run(
      "sczhou/codeformer:cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2",
      {
        input: {
          image: imageUrl,
          upscale: 1,
          face_upsample: true,
          background_enhance: true,
          codeformer_fidelity: fidelity,
        },
      }
    );

    // Ensure output is a string URL
    const resultUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ success: true, url: resultUrl });
  } catch (error) {
    console.error("Replicate Reconstruct Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Reconstruction failed" },
      { status: 500 }
    );
  }
}
