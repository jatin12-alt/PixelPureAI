"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();

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
          Get in Touch
        </h1>
        <p className="text-text-muted text-lg mb-12 leading-relaxed">
          Have a question, feedback, or a partnership idea? We'd love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group">
            <Mail className="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xl mb-3">Email Support</h3>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">For general inquiries and technical support, email us anytime.</p>
            <a href="mailto:PixelPureAI@image.com" className="text-accent font-bold hover:underline">PixelPureAI@image.com</a>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-accent/50 transition-all group">
            <MessageSquare className="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-xl mb-3">Community</h3>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">Join our community for tips and shared restorations.</p>
            <div className="flex gap-4">
              <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="p-10 rounded-4xl bg-bg-secondary border border-border">
          <h2 className="text-2xl font-display font-bold text-white mb-8">Send us a message</h2>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Full Name</label>
                <input type="text" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent/50" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Email Address</label>
                <input type="email" className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-accent/50" placeholder="john@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Message</label>
              <textarea className="w-full h-32 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent/50 resize-none" placeholder="How can we help?"></textarea>
            </div>
            <Button className="btn-primary w-full h-14 rounded-full font-bold uppercase tracking-widest text-xs">
              Send Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
