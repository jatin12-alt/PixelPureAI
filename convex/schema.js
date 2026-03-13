// convex/schema.js
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - synced with Clerk authentication
  users: defineTable({
    name: v.string(),
    email: v.string(),
    tokenIdentifier: v.string(),
    imageUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    projectsUsed: v.number(),
    exportsThisMonth: v.number(),
    createdAt: v.number(),
    lastActiveAt: v.number(),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_email", ["email"])
    .searchIndex("search_name", { searchField: "name" })
    .searchIndex("search_email", { searchField: "email" }),

  // Projects table
  projects: defineTable({
    title: v.string(),
    userId: v.id("users"),
    canvasState: v.any(),
    width: v.number(),
    height: v.number(),
    originalImageUrl: v.optional(v.string()),
    currentImageUrl: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    activeTransformations: v.optional(v.string()),
    backgroundRemoved: v.optional(v.boolean()),
    folderId: v.optional(v.id("folders")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"])
    .index("by_folder", ["folderId"]),

  // Folders table
  folders: defineTable({
    name: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ── NEW: Credits table ─────────────────────────────────────────────────
  // Tracks per-user credit balance and usage history
  credits: defineTable({
    userId: v.string(),          // Clerk tokenIdentifier (string, not v.id)
    balance: v.number(),         // Current available credits
    totalEarned: v.number(),     // Lifetime credits earned (for analytics)
    totalConsumed: v.number(),   // Lifetime credits spent
    resetDate: v.number(),       // Unix timestamp of next monthly reset
  }).index("by_user", ["userId"]),

  // ── NEW: Credit History table ──────────────────────────────────────────
  credit_history: defineTable({
    userId: v.string(),
    amount: v.number(),
    type: v.union(v.literal("deduction"), v.literal("addition"), v.literal("reset")),
    description: v.string(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // ── NEW: Subscriptions table ───────────────────────────────────────────
  subscriptions: defineTable({
    userId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("business")),
    razorpaySubscriptionId: v.optional(v.string()),
    razorpayCustomerId: v.optional(v.string()),
    status: v.string(), // active, cancelled, expired, etc.
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  }).index("by_user", ["userId"]).index("by_subscription", ["razorpaySubscriptionId"]),

  // ── NEW: Orders table ──────────────────────────────────────────────────
  orders: defineTable({
    userId: v.string(),
    razorpayOrderId: v.string(),
    razorpayPaymentId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    status: v.string(), // created, paid, failed
    plan: v.union(v.literal("pro"), v.literal("business")),
    createdAt: v.number(),
  }).index("by_order", ["razorpayOrderId"]).index("by_user", ["userId"]),
});