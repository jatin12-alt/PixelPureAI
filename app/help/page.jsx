"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, Book, MessageCircle, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HelpPage() {
  const router = useRouter();
  const categories = [
    { title: "Getting Started", icon: Zap, desc: "Learn the basics of AI photo enhancement." },
    { title: "Features", icon: Book, desc: "Deep dive into our AI restoration tools." },
    { title: "Billing & Credits", icon: MessageCircle, desc: "Manage your subscription and credits." },
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
          Help Center
        </h1>
        <p className="text-text-muted text-lg mb-12 leading-relaxed">
          Find answers to common questions and learn how to make the most of PixelPureAI.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {categories.map((cat, i) => (
            <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group cursor-pointer">
              <cat.icon className="h-8 w-8 text-accent mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="font-bold text-lg mb-2">{cat.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>

        <div className="space-y-12 leading-relaxed text-text-muted">
          <section>
            <h2 className="text-xl font-display font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white mb-2">How do I restore an old photo?</h4>
                <p>Simply upload your photo to the Studio, select the "AI Restore" tool, and click Apply. Our AI will automatically fix scratches, noise, and blur.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">What are credits?</h4>
                <p>Credits are used to download high-resolution versions of your restored photos. You get free credits when you sign up, and more can be purchased in the dashboard.</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Can I remove backgrounds?</h4>
                <p>Yes, use the "Remove BG" tool in the Studio to instantly remove backgrounds with high precision.</p>
              </div>
            </div>
          </section>

          <section className="p-8 rounded-4xl bg-accent/10 border border-accent/20 text-center">
            <h2 className="text-xl font-display font-bold text-white mb-4">Still need help?</h2>
            <p className="mb-8">Our support team is here to help you with any technical or billing issues.</p>
            <Link href="/contact">
              <Button className="btn-primary h-12 px-8 rounded-full font-bold uppercase tracking-widest text-xs">
                Contact Support
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
