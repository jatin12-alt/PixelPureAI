"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { Sparkles, PlayCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Dynamically import ComparisonSlider to improve page load speed
const ComparisonSlider = dynamic(() => import("@/components/comparison-slider"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-bg-secondary rounded-4xl animate-pulse" />
});

export default function DemoPage() {
  // Sample images for demo - Using reliable Unsplash images
  const sampleBefore = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop&blur=50";
  const sampleAfter = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop";

  return (
    <div className="min-h-screen bg-bg-primary pt-20 pb-32 font-dm text-text-primary">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent2/10 border border-accent2/20 mb-6"
          >
            <PlayCircle className="h-4 w-4 text-accent2" />
            <span className="text-xs font-bold uppercase tracking-widest text-accent2">Interactive Demo</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-display font-extrabold tracking-tight mb-6"
          >
            See the <span className="text-accent2">magic</span> yourself.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text-muted max-w-2xl mx-auto leading-relaxed"
          >
            Drag the slider to see how our AI reconstructs details, removes noise, and enhances clarity in real-time.
          </motion.p>
        </div>

        {/* Demo Slider */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-5xl mx-auto aspect-video rounded-4xl overflow-hidden border border-border shadow-2xl shadow-accent2/10 relative"
        >
          <ComparisonSlider before={sampleBefore} after={sampleAfter} />
        </motion.div>

        {/* Action Section */}
        <div className="mt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex flex-col items-center gap-8"
          >
            <div className="flex items-center gap-12">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted font-bold text-lg">1</div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Upload</span>
              </div>
              <ArrowRight className="h-5 w-5 text-text-subtle" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted font-bold text-lg">2</div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Enhance</span>
              </div>
              <ArrowRight className="h-5 w-5 text-text-subtle" />
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-muted font-bold text-lg">3</div>
                <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Download</span>
              </div>
            </div>

            <Link href="/studio">
              <Button className="btn-primary h-16 px-12 rounded-full font-bold text-lg shadow-xl shadow-accent/20 hover:scale-105 transition-transform">
                <Sparkles className="h-5 w-5 mr-2" />
                Try with your own photo
              </Button>
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
