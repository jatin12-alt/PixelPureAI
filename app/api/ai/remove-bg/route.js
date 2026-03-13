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
      "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
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
    console.error("Replicate RemoveBG Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Background removal failed" },
      { status: 500 }
    );
  }
}
