"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import ComparisonSlider from "@/components/comparison-slider";

const DEMO_CLIPS = [
  {
    title: "Old Photo Restoration",
    description: "Watch how we bring back colors and details to a 1950s family photo.",
    before: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop&tr=e-restore,q-100,e-upscale-2",
  },
  {
    title: "Portrait Unblur",
    description: "Fixing motion blur and enhancing facial features instantly.",
    before: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop&tr=e-restore,q-100,e-upscale-2",
  },
  {
    title: "Landscape Sharpening",
    description: "Enhancing the clarity and vibrancy of travel memories.",
    before: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop",
    after: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop&tr=e-restore,q-100,e-upscale-2",
  }
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center justify-between mb-16">
          <Link href="/">
            <Button variant="ghost" className="rounded-full text-slate-400 hover:text-white hover:bg-white/5 pr-6">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </Button>
          </Link>

          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-indigo-500/20">
            <Play className="h-3 w-3 fill-current" />
            Watch AI in Action
          </div>
        </div>

        <div className="text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            See the <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent tracking-tighter">Magic</span> of PixelPure
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Explore our AI engine's power through these real-world restoration examples. 
            No manual editing, just pure AI magic.
          </p>
        </div>

        <div className="space-y-32">
          {DEMO_CLIPS.map((clip, i) => (
            <div key={i} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
              <div className="flex-1 w-full max-w-2xl">
                <ComparisonSlider before={clip.before} after={clip.after} />
              </div>
              
              <div className="flex-1 space-y-6 text-center lg:text-left max-w-lg">
                <div className="inline-flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-widest">
                  <Sparkles className="h-4 w-4" />
                  Restoration {i + 1}
                </div>
                <h2 className="text-4xl font-bold text-white tracking-tight">{clip.title}</h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                  {clip.description}
                </p>
                <Link href="/dashboard">
                  <Button className="rounded-full px-8 h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xl shadow-indigo-500/20 border-none transition-all hover:scale-105">
                    Try this on your photo
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-40 text-center bg-indigo-600/5 rounded-[3rem] p-16 border border-white/5">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">Ready to see your own photos in HD?</h2>
          <Link href="/dashboard">
            <Button size="xl" className="rounded-full px-16 h-16 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-2xl shadow-indigo-500/40 border-none transition-all hover:scale-105">
              🚀 Try PixelPure Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
