"use client";

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck, Heart, Camera, Cpu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const highlights = [
    {
      title: "AI Powered",
      desc: "State-of-the-art neural networks trained on millions of images to understand texture and detail.",
      icon: Cpu,
      color: "text-accent"
    },
    {
      title: "Fast Processing",
      desc: "High-performance GPU infrastructure ensures your photos are restored in seconds, not minutes.",
      icon: Zap,
      color: "text-amber-400"
    },
    {
      title: "Privacy First",
      desc: "Your photos are processed securely and never shared with third parties. You own your data.",
      icon: ShieldCheck,
      color: "text-green-400"
    }
  ];

  return (
    <div className="min-h-screen bg-bg-primary pt-20 pb-32 font-dm text-text-primary">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 text-center mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8"
        >
          <Heart className="h-4 w-4 text-accent fill-accent" />
          <span className="text-xs font-bold uppercase tracking-widest text-accent">Our Mission</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-8xl font-display font-extrabold tracking-tighter mb-8 leading-[0.9]"
        >
          Built for <span className="text-accent">photo lovers.</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed mb-12"
        >
          PixelPureAI was born from a simple idea: everyone deserves to see their memories in high definition. We use cutting-edge AI to breathe new life into old, blurry, or low-quality photos.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden aspect-video border border-border bg-bg-secondary/50 flex items-center justify-center group"
        >
          <div className="absolute inset-0 bg-linear-to-tr from-accent/20 via-transparent to-accent2/20" />
          <Camera className="h-20 w-24 text-text-muted opacity-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute bottom-8 left-8 text-left">
            <p className="text-sm font-bold uppercase tracking-widest text-accent mb-1">PixelPureAI Studio</p>
            <p className="text-2xl font-display font-bold">The future of image editing.</p>
          </div>
        </motion.div>
      </section>

      {/* Highlights Grid */}
      <section className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid md:grid-cols-3 gap-8">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.4 }}
              className="p-10 rounded-[2.5rem] bg-bg-secondary/40 border border-border hover:border-accent/30 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl bg-bg-tertiary flex items-center justify-center mb-8 border border-border group-hover:scale-110 transition-transform`}>
                <item.icon className={`h-7 w-7 ${item.color}`} />
              </div>
              <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
              <p className="text-text-muted leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-accent rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-accent/20"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white mb-8 tracking-tight">
            Ready to see the difference?
          </h2>
          <Link href="/studio">
            <Button className="bg-white text-accent hover:bg-white/90 h-16 px-12 rounded-full font-bold text-lg shadow-xl hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 mr-2" />
              Try PixelPureAI Now
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
