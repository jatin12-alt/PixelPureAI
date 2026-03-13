export async function POST(req) { 
  const { imageUrl, tool } = await req.json() 
  let transform = ""
  switch (tool) {
    case "bgBlur": transform = "e-bg-blur-10"; break;
    case "contrast": transform = "e-contrast-10"; break;
    case "grayscale": transform = "e-grayscale"; break;
    case "trim": transform = "e-trim"; break;
    default: transform = "e-restore"; break;
  }
  const url = imageUrl.split('?')[0] + `?tr=${transform}`
  return Response.json({ success: true, url }) 
 } 
