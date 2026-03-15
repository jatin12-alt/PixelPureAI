// convex/credits.js
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ── Plan credit limits ─────────────────────────────────────────────────────
const PLAN_CREDITS = {
  free: 20,
  pro: 200,
  business: 1000,
};

// ── Helper: get next monthly reset timestamp ───────────────────────────────
function nextMonthReset() {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1); // 1st of next month
  return next.getTime();
}

/**
 * QUERY: getCredits
 * Returns the credit record for the current user.
 */
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

/**
 * QUERY: getCreditHistory
 * Returns history of credit transactions for the user.
 */
export const getCreditHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    if (!userId) return [];
    return await ctx.db
      .query("credit_history")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(10);
  },
});

/**
 * MUTATION: initCredits
 * Creates a credit record for a new user.
 */
export const initCredits = mutation({
  args: {
    userId: v.string(),
    plan: v.optional(v.union(v.literal("free"), v.literal("pro"), v.literal("business"))),
  },
  handler: async (ctx, { userId, plan = "free" }) => {
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

/**
 * MUTATION: deductCredits
 * Deducts credits from user balance.
 */
export const deductCredits = mutation({
  args: {
    userId: v.string(),
    amount: v.number(),
    toolName: v.optional(v.string()),
  },
  handler: async (ctx, { userId, amount, toolName }) => {
    const record = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!record || record.balance < amount) {
      throw new Error("Insufficient credits");
    }

    await ctx.db.patch(record._id, {
      balance: record.balance - amount,
      totalConsumed: record.totalConsumed + amount,
    });

    // Log to history
    await ctx.db.insert("credit_history", {
      userId,
      amount: -amount,
      type: "deduction",
      description: toolName || "AI Tool usage",
      createdAt: Date.now(),
    });

    return {
      success: true,
      newBalance: record.balance - amount,
    };
  },
});

/**
 * MUTATION: addCredits
 * Adds credits to user balance.
 */
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
      // If no record, initialize with plan default + extra
      const startBalance = PLAN_CREDITS.free + amount;
      await ctx.db.insert("credits", {
        userId,
        balance: startBalance,
        totalEarned: startBalance,
        totalConsumed: 0,
        resetDate: nextMonthReset(),
      });
    } else {
      await ctx.db.patch(record._id, {
        balance: record.balance + amount,
        totalEarned: record.totalEarned + amount,
      });
    }

    // Log to history
    await ctx.db.insert("credit_history", {
      userId,
      amount,
      type: "addition",
      description: "Credits added",
      createdAt: Date.now(),
    });

    const updatedRecord = await ctx.db
      .query("credits")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return { success: true, newBalance: updatedRecord.balance };
  },
});

/**
 * MUTATION: resetMonthlyCredits
 * Resets balance to plan default on monthly reset date.
 */
export const resetMonthlyCredits = mutation({
  args: {
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
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

    // Log to history
    await ctx.db.insert("credit_history", {
      userId,
      amount: resetAmount,
      type: "reset",
      description: "Monthly credit reset",
      createdAt: Date.now(),
    });

    return { success: true, newBalance: resetAmount };
  },
});

/**
 * MUTATION: checkAndResetAllUsers
 * Called by cron every day to check whose monthly reset is due.
 */
export const checkAndResetAllUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const overdue = await ctx.db
      .query("credits")
      .filter((q) => q.lt(q.field("resetDate"), now))
      .collect();

    for (const record of overdue) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", record.userId))
        .unique();

      const plan = user?.plan || "free";
      const resetAmount = PLAN_CREDITS[plan] || PLAN_CREDITS.free;

      await ctx.db.patch(record._id, {
        balance: resetAmount,
        resetDate: nextMonthReset(),
      });
    }

    return { success: true, count: overdue.length };
  },
});
