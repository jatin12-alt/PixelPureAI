import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSubscription = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const updateSubscription = mutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    razorpaySubscriptionId: v.optional(v.string()),
    razorpayCustomerId: v.optional(v.string()),
    status: v.string(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("subscriptions", args);
    }

    // Also update the user's plan
    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", args.userId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, { plan: args.plan });
    }
  },
});

export const createOrder = mutation({
  args: {
    userId: v.string(),
    razorpayOrderId: v.string(),
    amount: v.number(),
    currency: v.string(),
    plan: v.union(v.literal("pro"), v.literal("business")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", {
      ...args,
      status: "created",
      createdAt: Date.now(),
    });
  },
});

export const updateOrder = mutation({
  args: {
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, { razorpayOrderId, razorpayPaymentId, status }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order", (q) => q.eq("razorpayOrderId", razorpayOrderId))
      .unique();

    if (order) {
      await ctx.db.patch(order._id, { razorpayPaymentId, status });
    }
  },
});
