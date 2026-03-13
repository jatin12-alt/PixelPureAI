import Replicate from "replicate";
import { NextResponse } from "next/server";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request) {
  try {
    const { imageUrl, tool } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    let model = "";
    let input = {};

    switch (tool) {
      case "bgBlur":
        model = "cjwbw/background-remover:fb8a5bac57079cd27f61fa0f75d7126449eaa361112bc9959fa207293b3419bc";
        input = { image: imageUrl };
        break;
      case "contrast":
        model = "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1"; // Actually we should use a contrast model
        input = { image: imageUrl };
        break;
      case "grayscale":
        model = "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1"; // Placeholder
        input = { image: imageUrl };
        break;
      case "trim":
        model = "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1"; // Placeholder
        input = { image: imageUrl };
        break;
      default:
        return NextResponse.json({ error: "Unsupported tool" }, { status: 400 });
    }

    const output = await replicate.run(model, { input });
    
    // Ensure output is a string URL
    const resultUrl = Array.isArray(output) ? output[0] : output;

    return NextResponse.json({ success: true, url: resultUrl });
  } catch (error) {
    console.error("Replicate Edit Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Operation failed" },
      { status: 500 }
    );
  }
}
