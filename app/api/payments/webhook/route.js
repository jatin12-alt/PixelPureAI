import { NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    const { payload } = event;

    // Handle events
    switch (event.event) {
      case "payment.captured": {
        const orderId = payload.payment.entity.order_id;
        const paymentId = payload.payment.entity.id;
        const notes = payload.payment.entity.notes;
        const userId = notes?.userId;
        const plan = notes?.plan;

        if (userId && plan) {
          // 1. Check if already processed
          const existingOrder = await convex.query(api.subscriptions.getOrderByOrderId, {
            razorpayOrderId: orderId,
          });

          if (existingOrder && existingOrder.status === "paid") {
            return NextResponse.json({ success: true, message: "Order already processed" });
          }

          // 2. Update order status
          await convex.mutation(api.subscriptions.updateOrder, {
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentId,
            status: "paid",
          });

          // 3. Activate subscription
          const resetAmount = plan === "pro" ? 200 : plan === "business" ? 1000 : 0;
          
          await convex.mutation(api.subscriptions.updateSubscription, {
            userId,
            plan,
            status: "active",
            currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
            cancelAtPeriodEnd: false,
          });

          // 4. Add credits for the new plan
          if (resetAmount > 0) {
            await convex.mutation(api.credits.addCredits, {
              userId,
              amount: resetAmount,
            });
          }
        }
        break;
      }
      
      case "subscription.activated": {
        // Handle subscription activation
        break;
      }

      case "subscription.cancelled": {
        // Handle cancellation
        break;
      }

      default:
        // Unhandled Razorpay event
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
