"use client";

import React, { useState, useCallback, useEffect } from "react";
import { 
  Sparkles, 
  User as UserIcon, 
  Scissors, 
  Maximize, 
  Upload, 
  Download, 
  Share2, 
  ArrowLeft,
  Loader2,
  Trash2,
  Info,
  SlidersHorizontal,
  Sun,
  Contrast,
  Droplets,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ComparisonSlider from "@/components/comparison-slider";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const TOOLS = [
  { id: "enhance", icon: Sparkles, label: "Enhance", description: "AI Detail Restoration" },
  { id: "face", icon: UserIcon, label: "Face Sharpener", description: "HD Facial Features" },
  { id: "bg-remove", icon: Scissors, label: "BG Remover", description: "AI Masking" },
  { id: "upscale", icon: Maximize, label: "Upscale 4X", description: "Ultra HD Quality" },
];

export default function StudioPage() {
  const { isSignedIn } = useUser();
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [restoredUrl, setRestoredUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [activeTool, setActiveTool] = useState("enhance");
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0,
  });

  const PROCESSING_STEPS = [
    "Analyzing pixels...",
    "Applying neural restoration...",
    "Enhancing details...",
    "Finalizing HD result..."
  ];

  // Handle tool change and trigger reprocessing
  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    if (originalUrl) {
      applyAITransformation(originalUrl, toolId);
    }
  };

  const applyAITransformation = (url, toolId) => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    // Cycle through processing steps
    const interval = setInterval(() => {
      setProcessingStep(prev => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev));
    }, 400);

    let transformation = "e-restore,q-100";

    switch (toolId) {
      case "face":
        transformation = "e-restore,e-upscale-2,q-100";
        break;
      case "bg-remove":
        transformation = "e-bg_remove";
        break;
      case "upscale":
        transformation = "tr=w-2000,q-100,e-upscale-4";
        break;
      default:
        transformation = "e-restore,q-100";
    }

    // Apply adjustments on top
    const adjStr = `,e-brightness-${adjustments.brightness},e-contrast-${adjustments.contrast}`;
    
    setTimeout(() => {
      clearInterval(interval);
      setRestoredUrl(`${url}?tr=${transformation}${adjStr}`);
      setIsProcessing(false);
    }, 1600); // Shimmer effect delay
  };

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setSelectedFile(file);
    const localUrl = URL.createObjectURL(file);
    setOriginalUrl(localUrl);
    setRestoredUrl(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const response = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setOriginalUrl(data.url);
        applyAITransformation(data.url, activeTool);
        toast.success("AI Transformation Complete!");
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      toast.error("Processing failed. Please try again.");
      setOriginalUrl(null);
    } finally {
      setIsProcessing(false);
    }
  }, [activeTool, adjustments]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled: isProcessing
  });

  const handleDownload = () => {
    if (!isSignedIn) {
      toast.info("Please sign in to download HD images");
      return;
    }
    // Download logic
    const downloadUrl = restoredUrl.includes("?") 
      ? `${restoredUrl}&ik-attachment=true` 
      : `${restoredUrl}?ik-attachment=true`;
      
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `pixelpure-restored-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-[#020617] text-white overflow-hidden font-sans">
      {/* Main Sidebar */}
      <aside className="hidden md:flex w-80 border-r border-white/5 flex-col bg-slate-950/50 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5">
          <Link href="/">
            <div className="flex items-center gap-2 group">
              <div className="p-3 rounded-2xl bg-indigo-600/10 text-indigo-400 group-hover:scale-110 transition-all duration-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">PixelPureAI</h1>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-4">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                activeTool === tool.id 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
            >
              <tool.icon className="h-6 w-6" />
              <div className="text-left">
                <span className="font-bold text-sm">{tool.label}</span>
                <p className="text-xs text-slate-400 group-hover:text-slate-300">{tool.description}</p>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Studio Top Bar */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-950/20">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-bold tracking-tight text-slate-400 uppercase">
              {selectedFile ? selectedFile.name : "New Restoration"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:bg-white/5">
              <Share2 className="h-4 w-4" />
            </Button>
            
            {isSignedIn ? (
              <Button 
                onClick={handleDownload}
                disabled={!restoredUrl || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 font-bold shadow-xl shadow-indigo-600/20 h-11"
              >
                <Download className="h-4 w-4 mr-2" />
                Download HD
              </Button>
            ) : (
              <SignInButton mode="modal">
                <Button 
                  disabled={!restoredUrl || isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8 font-bold shadow-xl shadow-indigo-600/20 h-11"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Sign In to Download
                </Button>
              </SignInButton>
            )}
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-12 overflow-hidden relative">
            {!originalUrl ? (
              <div 
                {...getRootProps()} 
                className={`max-w-2xl w-full aspect-video rounded-[3rem] border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center gap-6 cursor-pointer group ${
                  isDragActive ? "border-indigo-500 bg-indigo-500/10 scale-105" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-24 h-24 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                  <Upload className="h-10 w-10 text-indigo-400" />
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Drop your image to start</h3>
                  <p className="text-slate-500 text-sm">PNG, JPG, WEBP up to 20MB</p>
                </div>
                <Button className="rounded-full px-10 h-12 bg-indigo-600 hover:bg-indigo-500 font-bold shadow-xl">
                  Browse Files
                </Button>
              </div>
            ) : (
              <div className="w-full h-full max-w-5xl flex items-center justify-center relative">
                {isProcessing && (
                  <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md rounded-[2.5rem]">
                    <div className="relative mb-8">
                      <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-400 animate-pulse" />
                    </div>
                    
                    <div className="space-y-4 text-center">
                      <p className="text-indigo-300 font-bold uppercase tracking-[0.2em] text-sm animate-pulse">
                        {PROCESSING_STEPS[processingStep]}
                      </p>
                      
                      {/* Progress bar effect */}
                      <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-500"
                          style={{ width: `${((processingStep + 1) / PROCESSING_STEPS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {restoredUrl ? (
                  <ComparisonSlider before={originalUrl} after={restoredUrl} />
                ) : (
                  <div className="relative w-full aspect-square md:aspect-video rounded-4xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    <img src={originalUrl} className="w-full h-full object-cover" alt="Original" />
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Original
                    </div>
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    setOriginalUrl(null);
                    setRestoredUrl(null);
                    setSelectedFile(null);
                    setAdjustments({ brightness: 0, contrast: 0, saturation: 0 });
                  }}
                  className="absolute -top-4 -right-4 w-10 h-10 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center border border-red-500/30 transition-all backdrop-blur-md z-10"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Right Sidebar - Adjustments */}
          {originalUrl && (
            <aside className="hidden lg:flex w-72 border-l border-white/5 bg-slate-950/30 backdrop-blur-xl flex-col p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-500/10 rounded-xl">
                  <SlidersHorizontal className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-sm uppercase tracking-widest">Adjustments</h3>
              </div>

              <div className="space-y-8">
                {/* Brightness */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sun className="h-3 w-3" />
                      Brightness
                    </Label>
                    <span className="text-[10px] font-bold text-indigo-400">{adjustments.brightness}</span>
                  </div>
                  <Slider 
                    value={[adjustments.brightness]} 
                    min={-100} 
                    max={100} 
                    step={1}
                    onValueChange={(val) => setAdjustments(prev => ({ ...prev, brightness: val[0] }))}
                    onValueCommit={() => applyAITransformation(originalUrl, activeTool)}
                    className="cursor-pointer"
                  />
                </div>

                {/* Contrast */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Contrast className="h-3 w-3" />
                      Contrast
                    </Label>
                    <span className="text-[10px] font-bold text-indigo-400">{adjustments.contrast}</span>
                  </div>
                  <Slider 
                    value={[adjustments.contrast]} 
                    min={-100} 
                    max={100} 
                    step={1}
                    onValueChange={(val) => setAdjustments(prev => ({ ...prev, contrast: val[0] }))}
                    onValueCommit={() => applyAITransformation(originalUrl, activeTool)}
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Droplets className="h-3 w-3" />
                      Saturation
                    </Label>
                    <span className="text-[10px] font-bold text-indigo-400">{adjustments.saturation}</span>
                  </div>
                  <Slider 
                    value={[adjustments.saturation]} 
                    min={-100} 
                    max={100} 
                    step={1}
                    onValueChange={(val) => setAdjustments(prev => ({ ...prev, saturation: val[0] }))}
                    onValueCommit={() => applyAITransformation(originalUrl, activeTool)}
                  />
                </div>

                <div className="pt-8 border-t border-white/5">
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-2xl text-slate-400 hover:text-white hover:bg-white/5 gap-2"
                    onClick={() => {
                      setAdjustments({ brightness: 0, contrast: 0, saturation: 0 });
                      applyAITransformation(originalUrl, activeTool);
                    }}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset All
                  </Button>
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-auto pt-8">
                <div className="bg-indigo-500/5 rounded-4xl p-6 border border-indigo-500/10">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Studio Tip
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use the comparison slider to check fine details restored by AI.
                  </p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
