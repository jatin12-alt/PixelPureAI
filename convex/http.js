import { httpRouter } from "convex/server"; 
 import { httpAction } from "./_generated/server"; 
 import { Webhook } from "svix"; 
 import { api } from "./_generated/api"; 
 
 const http = httpRouter(); 
 
 http.route({ 
   path: "/clerk-webhook", 
   method: "POST", 
   handler: httpAction(async (ctx, request) => { 
     const webhookSecret = process.env.CLERK_WEBHOOK_SECRET; 
     if (!webhookSecret) { 
       throw new Error("CLERK_WEBHOOK_SECRET missing"); 
     } 
 
     const svix_id = request.headers.get("svix-id"); 
     const svix_timestamp = request.headers.get("svix-timestamp"); 
     const svix_signature = request.headers.get("svix-signature"); 
 
     if (!svix_id || !svix_timestamp || !svix_signature) { 
       return new Response("Missing svix headers", { status: 400 }); 
     } 
 
     const payload = await request.json(); 
     const body = JSON.stringify(payload); 
 
     const wh = new Webhook(webhookSecret); 
     let evt; 
 
     try { 
       evt = wh.verify(body, { 
         "svix-id": svix_id, 
         "svix-timestamp": svix_timestamp, 
         "svix-signature": svix_signature, 
       }); 
     } catch (err) { 
       return new Response("Webhook verification failed", { status: 400 }); 
     } 
 
     const eventType = evt.type; 
     const { id, email_addresses, first_name, last_name, image_url } = evt.data; 
 
     if (eventType === "user.created") { 
       await ctx.runMutation(api.users.createUser, { 
         tokenIdentifier: id, 
         name: `${first_name || ""} ${last_name || ""}`.trim() || "User", 
         email: email_addresses[0]?.email_address || "", 
         imageUrl: image_url || "", 
         plan: "free", 
         projectsUsed: 0, 
         exportsThisMonth: 0, 
         createdAt: Date.now(), 
         lastActiveAt: Date.now(), 
       }); 
 
       await ctx.runMutation(api.credits.initCredits, { 
         userId: id, 
         plan: "free", 
       }); 
     } 
 
     if (eventType === "user.updated") { 
       await ctx.runMutation(api.users.updateUser, { 
         tokenIdentifier: id, 
         name: `${first_name || ""} ${last_name || ""}`.trim() || "User", 
         email: email_addresses[0]?.email_address || "", 
         imageUrl: image_url || "", 
         lastActiveAt: Date.now(), 
       }); 
     } 
 
     if (eventType === "user.deleted") { 
       await ctx.runMutation(api.users.deleteUser, { 
         tokenIdentifier: id, 
       }); 
     } 
 
     return new Response(null, { status: 200 }); 
   }), 
 }); 
 
 export default http; 
