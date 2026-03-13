"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Instagram, Facebook, Twitter } from "lucide-react";

import { usePathname } from "next/navigation";

export default function Footer() {
  const path = usePathname();

  if (path.includes("/studio")) {
    return null; // Hide footer on studio page
  }

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 mb-20">
          {/* Col 1: Brand */}
          <div className="col-span-2 lg:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex items-center">
                <span className="text-xl font-bold bg-linear-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent tracking-tight">PixelPureAI</span>
              </div>
              <Sparkles className="h-5 w-5 text-indigo-400 group-hover:rotate-12 transition-transform duration-300" />
            </Link>
            <p className="text-slate-500 text-xs font-medium leading-relaxed">
              Copyright © 2024 PixelPureAI. <br /> All rights reserved.
            </p>
            <button className="text-slate-400 text-xs font-bold hover:text-white transition-colors border border-white/10 rounded-full px-4 py-2 hover:bg-white/5">
              Cookies Preferences
            </button>
          </div>

          {/* Col 2: Enhance */}
          <div>
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Enhance</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Unblur</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Sharpener</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Old Photo Restorer</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Face Enhancer</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Colorizer</Link></li>
            </ul>
          </div>

          {/* Col 3: Generative AI */}
          <div>
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Generative AI</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">AI Photos</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">AI Avatars</Link></li>
            </ul>
          </div>

          {/* Col 4: Resources */}
          <div>
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Resources</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Contact Us</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Col 5: Legal */}
          <div>
            <h4 className="text-white font-bold text-sm mb-6 uppercase tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Privacy Notice</Link></li>
              <li><Link href="#" className="text-slate-400 hover:text-indigo-400 text-sm font-medium transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Social Bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 text-xs text-slate-500 font-bold uppercase tracking-widest">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
              </svg>
            </Link>
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-indigo-500/20 hover:text-indigo-400 transition-all">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
