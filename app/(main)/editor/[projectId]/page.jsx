"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Loader2, ArrowLeft, Download, Trash2, Sparkles, Share2, History, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import ComparisonSlider from "@/components/comparison-slider";
import { toast } from "sonner";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId;

  // Get project data
  const {
    data: project,
    isLoading,
    error,
  } = useConvexQuery(api.projects.getProject, { projectId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Analyzing pixels...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="bg-red-500/10 p-4 rounded-3xl inline-block">
            <Trash2 className="h-10 w-10 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Project Not Found</h1>
          <Button onClick={() => router.push("/dashboard")} variant="glass" className="rounded-full">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // ImageKit Restoration URL
  // specification: tr:e-restore,q-100,e-upscale-2
  const originalUrl = project.originalImageUrl;
  const restoredUrl = originalUrl.includes("ik.imagekit.io")
    ? `${originalUrl}?tr=e-restore,q-100,e-upscale-2`
    : originalUrl;

  const handleDownload = async () => {
    try {
      const response = await fetch(restoredUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `restored-${project.title || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("HD Image downloaded!");
    } catch (err) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-12">
          <Button 
            onClick={() => router.push("/dashboard")} 
            variant="ghost" 
            className="rounded-full text-slate-400 hover:text-white hover:bg-white/5 pr-6 transition-all"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="glass" size="icon" className="rounded-full border-white/5 hover:bg-white/10">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button 
              onClick={handleDownload}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full px-8 h-12 font-bold shadow-xl shadow-indigo-500/20 border-none transition-all hover:scale-105 active:scale-95"
            >
              <Download className="h-4 w-4 mr-2" />
              Download HD
            </Button>
          </div>
        </div>

        {/* Main Comparison Area */}
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-2 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              AI Restoration Engine
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              {project.title || "Untitled Restoration"}
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Drag the slider to compare the original photo with our AI-enhanced HD version.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <ComparisonSlider 
              before={originalUrl} 
              after={restoredUrl} 
            />
          </div>

          {/* Enhancement Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { label: "AI Detail Recovery", value: "Optimal", icon: Sparkles },
              { label: "HD Upscaling", value: "2.0x Scale", icon: Monitor },
              { label: "Processing History", value: "Saved", icon: History }
            ].map((stat, i) => (
              <div key={i} className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 flex flex-col items-center text-center group hover:border-indigo-500/30 transition-all duration-500">
                <div className="bg-indigo-500/10 p-3 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className="h-6 w-6 text-indigo-400" />
                </div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-white text-lg font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
