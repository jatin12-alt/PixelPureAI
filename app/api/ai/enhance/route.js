export async function POST(req) { 
  const { imageUrl } = await req.json() 
  const enhanced = imageUrl.split('?')[0] + '?tr=e-restore,q-100' 
  return Response.json({ success: true, url: enhanced }) 
 } 
