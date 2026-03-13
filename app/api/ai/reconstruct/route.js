export async function POST(req) { 
  const { imageUrl, type } = await req.json() 
  const transform = type === "denoise" ? "e-denoise-10" : "e-sharpen-10"
  const url = imageUrl.split('?')[0] + `?tr=${transform}`
  return Response.json({ success: true, url }) 
 } 
