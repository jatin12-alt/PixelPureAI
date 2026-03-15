"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Rocket, Users, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CareersPage() {
  const router = useRouter();
  const values = [
    { title: "Innovation First", icon: Rocket, desc: "We push the boundaries of what's possible with Generative AI." },
    { title: "User Obsessed", icon: Heart, desc: "Every feature we build starts with solving a real user problem." },
    { title: "Collaborative", icon: Users, desc: "We believe the best ideas come from diverse, open teams." },
  ];

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-dm pb-20 pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-12 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Go Back</span>
        </button>

        <h1 className="text-4xl sm:text-5xl font-display font-extrabold tracking-tight mb-4">
          Join PixelPureAI
        </h1>
        <p className="text-text-muted text-lg mb-12 leading-relaxed">
          Help us build the most powerful AI-driven image restoration platform in the world.
        </p>

        <div className="grid grid-cols-1 gap-6 mb-16">
          {values.map((val, i) => (
            <div key={i} className="flex gap-6 p-8 rounded-3xl bg-white/5 border border-white/10">
              <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                <val.icon className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-bold text-xl mb-2">{val.title}</h3>
                <p className="text-text-muted leading-relaxed">{val.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-white mb-8">Open Positions</h2>
        <div className="space-y-4 mb-16">
          <div className="p-6 rounded-2xl bg-bg-secondary border border-border hover:border-accent/50 transition-all cursor-pointer flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-lg">AI Research Engineer</h3>
              <p className="text-text-muted text-sm">Remote • Full-time</p>
            </div>
            <Sparkles className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="p-6 rounded-2xl bg-bg-secondary border border-border hover:border-accent/50 transition-all cursor-pointer flex justify-between items-center group">
            <div>
              <h3 className="font-bold text-lg">Senior Product Designer</h3>
              <p className="text-text-muted text-sm">Remote • Full-time</p>
            </div>
            <Sparkles className="h-5 w-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <section className="p-8 rounded-4xl bg-accent/10 border border-accent/20 text-center">
          <h2 className="text-xl font-display font-bold text-white mb-4">Don't see a fit?</h2>
          <p className="mb-8 text-text-muted">We're always looking for talented people. Send us your portfolio or resume.</p>
          <a href="mailto:PixelPureAI@image.com">
            <Button className="btn-primary h-12 px-8 rounded-full font-bold uppercase tracking-widest text-xs">
              General Application
            </Button>
          </a>
        </section>
      </div>
    </div>
  );
}
