// convex/credits.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Plan credit limits ─────────────────────────────────────────────────────
const PLAN_CREDITS = {
  free: 20,
  pro: 200,
};

// ── Helper: get next monthly reset timestamp ───────────────────────────────
function nextMonthReset() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 1st of next month
  return next.getTime();
}

// ─────────────────────────────────────────────────────────────────────────────
// QUERY: getCredits
// Returns the credit record for the current user.
// Call this in useCredits hook to get live balance.
// ─────────────────────────────────────────────────────────────────────────────
export const getCredits = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return null;

    const record = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return record ?? null;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION: initCredits
// Creates a credit record for a new user.
// Call this when a new user signs up (in your Clerk webhook or user sync).
// ─────────────────────────────────────────────────────────────────────────────
export const initCredits = mutation({
  args: {
    userId: v.string(),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"))),
  },
  handler: async (ctx, { userId, plan = "free" }) => {
    // Don't create duplicate records
    const existing = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existing) return existing._id;

    const startBalance = PLAN_CREDITS[plan] ?? PLAN_CREDITS.free;

    return await ctx.db.insert("credits", {
      userId,
      balance: startBalance,
      totalEarned: startBalance,
      totalConsumed: 0,
      resetDate: nextMonthReset(),
    });
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION: deductCredits
// Deducts `amount` credits from user balance.
// Throws if balance is insufficient.
// Call this AFTER a successful ImageKit transformation.
// ─────────────────────────────────────────────────────────────────────────────
export const deductCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    toolName: v.optional(v.string()), // for logging/debugging
  },
  handler: async (ctx, { userId, amount, toolName }) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!record) {
      throw new Error("Credit record not found. Please refresh and try again.");
    }

    if (record.balance < amount) {
      throw new Error(
        `Not enough credits. Need ${amount}, have ${record.balance}.`
      );
    }

    await ctx.db.patch(record._id, {
      balance: record.balance - amount,
      totalConsumed: record.totalConsumed + amount,
    });

    return {
      success: true,
      newBalance: record.balance - amount,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION: addCredits
// Adds credits to user balance (used after payment / plan upgrade).
// ─────────────────────────────────────────────────────────────────────────────
export const addCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, { userId, amount }) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!record) {
      throw new Error("Credit record not found.");
    }

    await ctx.db.patch(record._id, {
      balance: record.balance + amount,
      totalEarned: record.totalEarned + amount,
    });

    return { success: true, newBalance: record.balance + amount };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MUTATION: resetMonthlyCredits
// Resets balance to plan default on monthly reset date.
// Call this from a Convex scheduled function (cron).
// ─────────────────────────────────────────────────────────────────────────────
export const resetMonthlyCredits = mutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro")),
  },
  handler: async (ctx, { userId, plan }) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!record) return;

    const resetAmount = PLAN_CREDITS[plan] ?? PLAN_CREDITS.free;

    await ctx.db.patch(record._id, {
      balance: resetAmount,
      totalEarned: record.totalEarned + resetAmount,
      resetDate: nextMonthReset(),
    });

    return { success: true, newBalance: resetAmount };
  },
});
