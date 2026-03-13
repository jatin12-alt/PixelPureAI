export async function POST(req) { 
  const { imageUrl, scale } = await req.json() 
  const scaleParam = scale === 4 ? 'e-upscale-4' : 'e-upscale-2' 
  const upscaled = imageUrl.split('?')[0] + '?tr=' + scaleParam + ',q-100' 
  return Response.json({ success: true, url: upscaled }) 
 } 
