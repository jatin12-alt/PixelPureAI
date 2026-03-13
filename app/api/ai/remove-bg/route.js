export async function POST(req) { 
  const { imageUrl } = await req.json() 
  const url = imageUrl.split('?')[0] + '?tr=e-bgremove'
  return Response.json({ success: true, url }) 
 } 
