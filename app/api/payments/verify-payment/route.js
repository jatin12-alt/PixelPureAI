import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan, // Get plan from client if possible, or fetch from order
    } = await request.json();

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // 1. Initialize Convex Client
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

      // 2. Check if already processed
      const existingOrder = await convex.query(api.subscriptions.getOrderByOrderId, {
        razorpayOrderId: razorpay_order_id,
      });

      if (existingOrder && existingOrder.status === "paid") {
        return NextResponse.json({ success: true, message: "Order already processed" });
      }

      // 3. Update order status
      await convex.mutation(api.subscriptions.updateOrder, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "paid",
      });

      // 4. Activate subscription & Add credits
      // We determine reset amount based on plan
      const resetAmount = plan === "pro" ? 200 : plan === "business" ? 1000 : 0;
      
      if (plan) {
        await convex.mutation(api.subscriptions.updateSubscription, {
          userId,
          plan,
          status: "active",
          currentPeriodEnd: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
          cancelAtPeriodEnd: false,
        });

        if (resetAmount > 0) {
          await convex.mutation(api.credits.addCredits, {
            userId,
            amount: resetAmount,
          });
        }
      }

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    console.error("Payment Verification Error:", error);
    return NextResponse.json({ success: false, error: "Verification failed" }, { status: 500 });
  }
}
