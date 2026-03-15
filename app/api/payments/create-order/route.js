import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { userId } = await auth();
    console.log("Create order request for userId:", userId);
    
    if (!userId) {
      console.warn("Unauthorized order creation attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      console.error("RAZORPAY ERROR: Missing API keys in environment variables");
      return NextResponse.json({ success: false, error: "Razorpay keys not configured" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: key_id.trim(),
      key_secret: key_secret.trim(),
    });

    const { plan, amount } = await request.json();
    console.log("Order request data:", { plan, amount });

    if (!plan || !amount) {
      return NextResponse.json({ error: "Missing plan or amount" }, { status: 400 });
    }

    const options = {
      amount: Math.round(amount * 100), // Ensure it's an integer
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        userId,
        plan,
      },
    };

    console.log("Creating Razorpay order with options:", JSON.stringify(options));

    const order = await razorpay.orders.create(options);

    console.log("Razorpay order created successfully:", order.id);

    // Save order in Convex
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    await convex.mutation(api.subscriptions.createOrder, {
      userId,
      razorpayOrderId: order.id,
      amount: order.amount / 100, // Store in actual currency unit
      currency: order.currency,
      plan: plan,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("RAZORPAY ORDER FULL ERROR:", JSON.stringify(error, null, 2));
    
    let errorMessage = "Failed to create order";
    
    // Safely extract error description from Razorpay error object
    if (error && typeof error === 'object') {
      if (error.error && error.error.description) {
        errorMessage = error.error.description;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
