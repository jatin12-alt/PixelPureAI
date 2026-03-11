"use client";

import React from "react";
import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Ankit Sharma",
    platform: "Web user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ankit",
    review: "Incredible! It restored my grandfather's 50-year-old photo in seconds. Better than Remini! The detail is just mind-blowing.",
    rating: 5,
  },
  {
    name: "Sarah J.",
    platform: "iOS user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    review: "The upscaler is a lifesaver. I can finally use my old phone photos for my blog without them looking pixelated. Highly recommend!",
    rating: 5,
  },
  {
    name: "David Wilson",
    platform: "Web user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    review: "The background removal is cleaner than Photoshop's automated tools. Saves me hours of manual masking every single week.",
    rating: 5,
  },
  {
    name: "Priya Patel",
    platform: "Android user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    review: "The face enhancer is magic. My blurry selfies now look like professional portraits. Simply the best restoration app out there.",
    rating: 5,
  },
  {
    name: "Michael Ross",
    platform: "Web user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    review: "As a professional photographer, I was skeptical, but the AI detail recovery is top-notch. It's now part of my regular workflow.",
    rating: 5,
  },
  {
    name: "Elena G.",
    platform: "iOS user",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    review: "I restored all my childhood albums using PixelPure. The results are breathtaking. Thank you for making this possible!",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-24 bg-slate-950" id="testimonials">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            What our <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">users</span> say
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Join millions who trust PixelPure AI for their photo restoration needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((t, i) => (
            <div 
              key={i} 
              className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-500 group"
            >
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-indigo-500 text-indigo-500" />
                ))}
              </div>
              
              <p className="text-slate-300 mb-8 leading-relaxed font-medium">
                "{t.review}"
              </p>

              <div className="flex items-center gap-4 mt-auto">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-10 h-10 rounded-full bg-slate-800 border border-white/10"
                />
                <div>
                  <h4 className="text-white font-bold text-sm">{t.name}</h4>
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{t.platform}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
