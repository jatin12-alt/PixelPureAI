// hooks/use-credits.js
"use client";

import { useQuery, useMutation } from "convex/react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useCredits Hook
//
// Usage in studio/page.jsx:
//   const { balance, isLoading, deduct, canAfford } = useCredits()
//
// Replace all `credits` state and `setCredits` calls with this hook.
// ─────────────────────────────────────────────────────────────────────────────
export function useCredits() {
  const { userId, isLoaded } = useAuth(); // Clerk tokenIdentifier

  // Live Convex query — auto-updates when balance changes
  const creditRecord = useQuery(
    api.credits.getCredits,
    isLoaded && userId ? { userId } : "skip"
  );

  // Init credits if record doesn't exist yet (new user)
  const initCredits = useMutation(api.credits.initCredits);
  const deductMutation = useMutation(api.credits.deductCredits);

  // Auto-init: if user is logged in but has no credit record, create one
  useEffect(() => {
    if (isLoaded && userId && creditRecord === null) {
      initCredits({ userId, plan: "free" }).catch(console.error);
    }
  }, [isLoaded, userId, creditRecord]);

  // ── deduct function ──────────────────────────────────────────────────────
  // Call this AFTER successful ImageKit transformation.
  // Returns { success, newBalance } or throws on insufficient credits.
  const deduct = async (amount, toolName) => {
    if (!userId) throw new Error("Not signed in");
    return await deductMutation({ userId, amount, toolName });
  };

  // ── canAfford ────────────────────────────────────────────────────────────
  // Quick check before showing Apply button
  const canAfford = (amount) => {
    if (creditRecord === undefined) return true;  // still loading, optimistic
    if (creditRecord === null) return false;
    return creditRecord.balance >= amount;
  };

  return {
    balance: creditRecord?.balance ?? 0,
    totalEarned: creditRecord?.totalEarned ?? 0,
    totalConsumed: creditRecord?.totalConsumed ?? 0,
    resetDate: creditRecord?.resetDate ?? null,
    isLoading: !isLoaded || creditRecord === undefined,
    deduct,
    canAfford,
  };
}
