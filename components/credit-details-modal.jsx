"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useCredits } from "@/hooks/use-credits";
import { 
  CreditCard, 
  History, 
  Calendar, 
  ArrowUpRight, 
  Plus, 
  Zap,
  Clock,
  Coins
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function CreditDetailsModal({ isOpen, onClose }) {
  const { user } = useUser();
  const { 
    balance, 
    totalEarned, 
    resetDate, 
    isLoading 
  } = useCredits();

  // Get current user for plan info
  const convexUser = useQuery(api.users.getCurrentUser);
  
  // Get credit history
  const history = useQuery(api.credits.getCreditHistory, 
    user?.id ? { userId: user.id } : "skip"
  );

  const daysUntilReset = resetDate 
    ? Math.ceil((resetDate - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const currentPlan = convexUser?.plan || "free";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-slate-950 border-white/10 p-0 overflow-hidden rounded-3xl">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center shadow-lg shadow-accent/10">
                  <Coins className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-black text-white tracking-tight">
                    Your Credits
                  </DialogTitle>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest font-black">
                    Manage your balance & usage
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  currentPlan === 'pro' 
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                    : 'bg-accent/10 text-accent border-accent/20'
                }`}>
                  {currentPlan} Plan
                </span>
              </div>
            </div>
          </DialogHeader>

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/3 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="h-12 w-12 text-accent" />
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Available</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{balance}</span>
                <span className="text-xs text-text-muted font-bold">cr</span>
              </div>
            </div>
            <div className="bg-white/3 border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <History className="h-12 w-12 text-indigo-400" />
              </div>
              <p className="text-[10px] text-text-muted uppercase tracking-widest font-black mb-1">Lifetime</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-white">{totalEarned}</span>
                <span className="text-xs text-text-muted font-bold">cr</span>
              </div>
            </div>
          </div>

          {/* Reset Info */}
          <div className="bg-accent/5 border border-accent/10 p-5 rounded-3xl flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Monthly Reset</p>
                <p className="text-[10px] text-text-muted">Credits will refresh automatically</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-accent">{daysUntilReset || 0} Days</p>
              <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Remaining</p>
            </div>
          </div>

          {/* History Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-text-muted" />
                Recent Usage
              </h3>
              <Link href="/pricing" onClick={onClose}>
                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-accent hover:bg-accent/10 rounded-full">
                  Add Credits <Plus className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
              {history && history.length > 0 ? (
                history.map((item) => (
                  <div key={item._id} className="flex items-center justify-between p-3 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/4 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.type === 'deduction' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                      }`}>
                        {item.type === 'deduction' ? <ArrowUpRight className="h-4 w-4 rotate-180" /> : <Plus className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-white truncate max-w-[150px]">{item.description}</p>
                        <p className="text-[9px] text-text-muted uppercase tracking-tighter">
                          {formatDistanceToNow(item.createdAt)} ago
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs font-black ${
                      item.type === 'deduction' ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.amount > 0 ? '+' : ''}{item.amount}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-white/1 rounded-3xl border border-dashed border-white/5">
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">No transaction history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="p-6 bg-white/2 border-t border-white/5">
          <Link href="/pricing" onClick={onClose} className="w-full">
            <Button className="w-full btn-primary h-12 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-accent/20">
              Upgrade Your Plan
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
