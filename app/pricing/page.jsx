"use client";

import React from "react";
import PricingSection from "@/components/pricing";
import { Sparkles, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-bg-primary pt-20 pb-32 font-dm text-text-primary">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 text-center mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
        >
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Simple Pricing</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6"
        >
          Choose your <span className="text-accent">Power.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
        >
          From casual restoration to professional high-volume workflows, we have a plan that fits your creative needs.
        </motion.p>
      </div>

      {/* Pricing Grid */}
      <PricingSection />

      {/* Trust Section */}
      <div className="max-w-5xl mx-auto px-6 mt-32">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center mb-6 border border-border">
              <Zap className="h-6 w-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold mb-3">Instant Processing</h3>
            <p className="text-sm text-text-muted">Our AI models run on high-performance GPUs for lightning fast results.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center mb-6 border border-border">
              <ShieldCheck className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="text-lg font-bold mb-3">Secure Payments</h3>
            <p className="text-sm text-text-muted">All transactions are processed through Stripe/Razorpay with bank-grade security.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center mb-6 border border-border">
              <CheckCircle2 className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-bold mb-3">Cancel Anytime</h3>
            <p className="text-sm text-text-muted">No long-term contracts. Upgrade, downgrade or cancel your subscription anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
