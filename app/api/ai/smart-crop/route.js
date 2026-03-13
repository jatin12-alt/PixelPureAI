export async function POST(req) { 
  const { imageUrl } = await req.json() 
  const url = imageUrl.split('?')[0] + '?tr=c-at_max,fo-auto,w-1000,h-1000'
  return Response.json({ success: true, url }) 
 } 
