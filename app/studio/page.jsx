"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sparkles,
  User,
  Scissors,
  Maximize2,
  Upload,
  Download,
  Loader2,
  Trash2,
  Info,
  ZoomIn,
  Aperture,
  Focus,
  Wind,
  Film,
  Crop,
  ImageIcon,
  Sun,
  Settings,
  RotateCcw,
  Share2,
  Coins,
  Zap,
  MoreHorizontal,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useCredits } from "@/hooks/use-credits";

// Dynamically import heavy components
const ComparisonSlider = dynamic(() => import("@/components/comparison-slider"), {
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-bg-secondary rounded-3xl animate-pulse" />
});
const CreditDetailsModal = dynamic(() => import("@/components/credit-details-modal").then(mod => mod.CreditDetailsModal), {
  ssr: false
});

// ─── CORRECTED ImageKit Transform strings ────────────────────────────────────
const TOOLS = [
  {
    id: "enhance",
    name: "AI Enhance",
    icon: Sparkles,
    desc: "Fix blur, noise & compression",
    detail: ["Removes JPEG artefacts", "Sharpens edges", "Restores detail"],
    tr: "e-restore,q-100",
    color: "#8B5CF6",
  },
  {
    id: "faceRestore",
    name: "Face Restore",
    icon: User,
    desc: "Rebuild facial detail with AI",
    detail: ["Restores eyes & skin", "Works on old photos", "2× upscale included"],
    tr: "e-restore,q-100",
    color: "#A78BFA",
  },
  {
    id: "upscale2x",
    name: "Upscale 2×",
    icon: ZoomIn,
    desc: "Double resolution, AI-sharp",
    detail: ["2× width & height", "AI fills missing detail", "No pixelation"],
    tr: (val) => `e-upscale-2,q-${val || 100}`,
    params: { label: "Quality", min: 50, max: 100, step: 1, default: 100 },
    color: "#06B6D4",
  },
  {
    id: "upscale4x",
    name: "Upscale 4×",
    icon: Maximize2,
    desc: "Ultra-high resolution boost",
    detail: ["4× resolution boost", "Perfect for printing", "AI-reconstructed pixels"],
    tr: (val) => `e-upscale-4,q-${val || 100}`,
    params: { label: "Quality", min: 50, max: 100, step: 1, default: 100 },
    color: "#06B6D4",
  },
  {
    id: "bgRemove",
    name: "Remove BG",
    icon: Scissors,
    desc: "AI background removal",
    detail: ["Precise edge detection", "Transparent PNG output", "Works on hair & fur"],
    tr: "e-bgremove,f-png",
    color: "#10B981",
  },
  {
    id: "sharpen",
    name: "Sharpen",
    icon: Focus,
    desc: "Crisp edges & fine detail",
    detail: ["Unsharp mask algorithm", "Removes motion blur", "Preserves colours"],
    tr: (val) => `e-sharpen-${val || 10}`,
    params: { label: "Intensity", min: 1, max: 100, step: 1, default: 10 },
    color: "#F59E0B",
  },
  {
    id: "denoise",
    name: "Denoise",
    icon: Wind,
    desc: "Remove grain & noise",
    detail: ["Works on dark/night shots", "Preserves texture", "Smooth skin tones"],
    tr: (val) => `e-denoise-${val || 10}`,
    params: { label: "Smoothness", min: 1, max: 100, step: 1, default: 10 },
    color: "#F59E0B",
  },
  {
    id: "bgBlur",
    name: "Blur Background",
    icon: Aperture,
    desc: "DSLR-style bokeh effect",
    detail: ["Subject stays sharp", "Natural depth of field", "Soft background blur"],
    tr: (val) => `e-bgremove,e-bg-blur-${val || 10}`,
    params: { label: "Blur Amount", min: 1, max: 100, step: 1, default: 10 },
    color: "#10B981",
  },
  {
    id: "contrast",
    name: "AI Vivid",
    icon: Sun,
    desc: "Pop colours & contrast",
    detail: ["Auto contrast boost", "Vibrant saturation", "Tone-mapped highlights"],
    tr: (val) => `e-contrast-${val || 10}`,
    params: { label: "Vividness", min: 1, max: 100, step: 1, default: 10 },
    color: "#EF4444",
  },
  {
    id: "grayscale",
    name: "Cinematic B&W",
    icon: Film,
    desc: "Professional black & white",
    detail: ["Film-grain aesthetic", "Tonal range preserved", "Classic cinema look"],
    tr: (val) => `e-grayscale,q-${val || 100}`,
    params: { label: "Contrast", min: 1, max: 100, step: 1, default: 100 },
    color: "#94A3B8",
  },
  {
    id: "smartCrop",
    name: "Smart Crop",
    icon: Crop,
    desc: "AI finds the best composition",
    detail: ["Face-aware cropping", "Rule-of-thirds", "Multiple ratios supported"],
    tr: (val) => `c-at_max,fo-auto,w-${val || 1000},h-${val || 1000}`,
    params: { label: "Resolution", min: 500, max: 2000, step: 100, default: 1000 },
    color: "#3B82F6",
  },
  {
    id: "trim",
    name: "Auto Trim",
    icon: Scissors,
    desc: "Remove solid-colour borders",
    detail: ["Removes white borders", "Removes black bars", "Precise edge detection"],
    tr: "e-trim",
    color: "#EC4899",
  },
];

// ─── Helper: build ImageKit transform URL ────────────────────────────────────
function buildTransformUrl(baseImageKitUrl, transformStrings) {
  if (!transformStrings || transformStrings.length === 0) return baseImageKitUrl;
  const chain = transformStrings.join(":");
  const [baseUrl, queryString] = baseImageKitUrl.split("?");
  const params = new URLSearchParams(queryString || "");
  params.set("tr", chain);
  return `${baseUrl}?${params.toString()}`;
}

function StudioContent() {
  const { isSignedIn, user: clerkUser } = useUser();
  const { openSignIn } = useClerk();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");

  // Convex User Query & Mutations
  const { data: convexUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: createProject, isLoading: isSavingProject } = useConvexMutation(api.projects.create);

  // ─── State ────────────────────────────────────────────────────────────────
  const [imagekitUrl, setImagekitUrl] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [restoredUrl, setRestoredUrl] = useState(null);
  const [appliedTransforms, setAppliedTransforms] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [activeTool, setActiveTool] = useState("enhance");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [toolParams, setToolParams] = useState({});
  const [wasRestored, setWasRestored] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState(null);
  const [toolApplied, setToolApplied] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const localPreviewRef = useRef(null);
  const uploadInputRef = useRef(null);
  const { balance: credits, isLoading: isCreditsLoading, deduct, canAfford } = useCredits();
  
  const selectedToolData = TOOLS.find((t) => t.id === activeTool) || TOOLS[0];

  useEffect(() => {
    setToolApplied(false);
  }, [activeTool]);

  // ─── Load Project ───────────────────────────────────────────────
  const { data: loadedProject } = useConvexQuery(api.projects.getProject, projectId && isSignedIn ? { projectId } : "skip");

  useEffect(() => {
    if (loadedProject) {
      setIsImageLoading(true);
      setImagekitUrl(loadedProject.originalImageUrl);
      setOriginalUrl(loadedProject.originalImageUrl);
      setRestoredUrl(loadedProject.currentImageUrl);
      if (loadedProject.activeTransformations) {
        setAppliedTransforms(loadedProject.activeTransformations.split(":"));
      }
      toast.success("Project loaded!");
    }
  }, [loadedProject]);

  // ─── Live Preview Logic (ImageKit) ──────────────────────────────────────
  useEffect(() => {
    if (!imagekitUrl) {
      setLivePreviewUrl(null);
      return;
    }

    const timer = setTimeout(() => {
      let currentTr = selectedToolData.tr;
      if (typeof selectedToolData.tr === "function") {
        const val = toolParams[selectedToolData.id] ?? selectedToolData.params?.default;
        currentTr = selectedToolData.tr(val);
      }

      // Build preview URL: current applied chain + new adjustment
      const previewTransforms = [...appliedTransforms];
      // Only add if not already in chain (to avoid duplicates during preview)
      if (currentTr && !previewTransforms.includes(currentTr)) {
        previewTransforms.push(currentTr);
      }
      
      let previewUrl = buildTransformUrl(imagekitUrl, previewTransforms);
      // Cache buster
      previewUrl += (previewUrl.includes("?") ? "&" : "?") + `preview=${Date.now()}`;
      
      setLivePreviewUrl(previewUrl);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [imagekitUrl, toolParams, selectedToolData, appliedTransforms]);

  // ─── Action Handlers ─────────────────────────────────────────────────────
  const handleSaveProject = async () => {
    if (!isSignedIn) { openSignIn(); return; }
    if (!imagekitUrl) { toast.error("Nothing to save!"); return; }
    try {
      await createProject({
        title: "Untitled Project " + Date.now(),
        originalImageUrl: imagekitUrl,
        currentImageUrl: restoredUrl || imagekitUrl,
        activeTransformations: appliedTransforms.join(":"),
        canvasState: {},
        width: 0, height: 0,
      });
      toast.success("Project saved!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err.message || "Failed to save project.");
    }
  };

  const handleShare = async () => {
    const targetUrl = restoredUrl || originalUrl;
    if (!targetUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PixelPureAI', url: targetUrl });
      } else {
        await navigator.clipboard.writeText(targetUrl);
        toast.success("Link copied!");
      }
    } catch (err) { toast.error("Failed to share."); }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Max 10MB allowed."); return; }

    setIsUploading(true);
    const localPreview = URL.createObjectURL(file);
    localPreviewRef.current = localPreview;
    setOriginalUrl(localPreview);

    const upload = async (file, retries = 2) => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("fileName", file.name);
        const res = await fetch("/api/imagekit/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          setIsImageLoading(true);
          setImagekitUrl(data.url);
          setOriginalUrl(data.url);
          setRestoredUrl(null);
          setAppliedTransforms([]);
          setToolApplied(false);
          toast.success("Uploaded!");

          // ─── Change 1: Auto Enhance ───
          setIsProcessing(true);
          try {
            const enhanceRes = await fetch("/api/ai/enhance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl: data.url }),
            });
            const enhanceData = await enhanceRes.json();
            if (enhanceData.success) {
              setRestoredUrl(enhanceData.url);
              setAppliedTransforms(["auto-enhanced"]);
              toast.success("Photo enhanced automatically!");
            }
          } catch (err) {
            // Silently fallback on auto-enhance failure
          } finally {
            setIsProcessing(false);
          }
        } else throw new Error(data.error);
      } catch (err) {
        if (retries > 0) return upload(file, retries - 1);
        toast.error("Upload failed.");
        setOriginalUrl(null);
      } finally { setIsUploading(false); }
    };
    upload(file);
  }, []);

  const handleImageLoad = () => {
    setIsImageLoading(false);
    if (localPreviewRef.current) { URL.revokeObjectURL(localPreviewRef.current); localPreviewRef.current = null; }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] }, maxFiles: 1,
    disabled: isUploading || isProcessing || !!originalUrl, noClick: true,
  });

  const applyAITransformation = useCallback(async () => {
    if (!imagekitUrl) return toast.error("Upload a photo first.");

    setIsProcessing(true);
    try {
      // Show 300ms quick flash overlay for feedback
      await new Promise(r => setTimeout(r, 300));
      
      let finalTr = selectedToolData.tr;
      if (typeof selectedToolData.tr === "function") {
        const val = toolParams[selectedToolData.id] ?? selectedToolData.params?.default;
        finalTr = selectedToolData.tr(val);
      }
      
      const newTransforms = [...appliedTransforms];
      if (finalTr && !newTransforms.includes(finalTr)) {
        newTransforms.push(finalTr);
      }
      
      let resultUrl = buildTransformUrl(imagekitUrl, newTransforms);
      setAppliedTransforms(newTransforms);

      if (resultUrl) {
        // Add cache-buster to ensure browser reloads the image
        const separator = resultUrl.includes("?") ? "&" : "?";
        resultUrl = `${resultUrl}${separator}v=${Date.now()}`;
        
        setRestoredUrl(resultUrl);
        setToolApplied(true);
        toast.success(`${selectedToolData.name} applied successfully!`);
      }
    } catch (err) { 
      toast.error(err.message || "Failed to apply magic."); 
    }
    finally { setIsProcessing(false); }
  }, [imagekitUrl, appliedTransforms, selectedToolData, toolParams]);

  const handleReset = () => { setRestoredUrl(null); setAppliedTransforms([]); setToolApplied(false); toast.info("Reset!"); };
  const handleClear = () => { setOriginalUrl(null); setImagekitUrl(null); setRestoredUrl(null); setAppliedTransforms([]); setToolApplied(false); };

  const handleDownload = async () => {
    const targetUrl = livePreviewUrl || restoredUrl || originalUrl;
    if (!targetUrl) return;
    
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    // Change 2: Credits on download
    const cost = appliedTransforms.length > 0 ? appliedTransforms.length : 1;
    if (!canAfford(cost)) {
      toast.error("Not enough credits to download. Please upgrade.");
      return;
    }

    try {
      await deduct(cost, "download");
      toast.success(`Downloaded! Used ${cost} credits.`);
    } catch (err) {
      toast.error("Failed to deduct credits.");
      return;
    }

    let finalUrl = targetUrl;
    if (convexUser?.plan === "free") {
      const watermark = "l-text,i-PixelPureAI,fs-30,co-FFFFFF,pa-20,tg-b";
      const [base, query] = targetUrl.split("?");
      const params = new URLSearchParams(query || "");
      const tr = params.get("tr") || "";
      params.set("tr", tr ? `${tr}:${watermark}` : watermark);
      finalUrl = `${base}?${params.toString()}`;
    }

    const downloadUrl = finalUrl + (finalUrl.includes("?") ? "&" : "?") + "ik-attachment=true";
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `pixelpure-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToolChange = (id) => { setActiveTool(id); if (window.innerWidth <= 768 && imagekitUrl) setIsSheetOpen(true); };

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary overflow-hidden font-dm">
      <AnimatePresence>
        {(isProcessing || isUploading) && (
          <motion.div initial={{ y: -20, opacity: 0, x: "-50%" }} animate={{ y: 0, opacity: 1, x: "-50%" }} exit={{ y: -20, opacity: 0, x: "-50%" }} className="fixed top-4 left-1/2 z-100 flex items-center gap-3 px-5 py-2.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-accent/40 shadow-xl">
            <span className="text-xs font-bold">{isUploading ? "Uploading..." : "Processing..."}</span>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      <header className="h-16 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-bg-primary/80 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-3">
          {imagekitUrl && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-text-muted hover:text-white"
                onClick={() => {
                  if (restoredUrl) setShowLeaveDialog(true);
                  else router.push("/dashboard");
                }}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 text-text-muted hover:text-white rounded-full px-4"
                onClick={() => {
                  if (restoredUrl) setShowLeaveDialog(true);
                  else router.push("/dashboard");
                }}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
              </Button>
            </>
          )}
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-display font-bold text-lg tracking-tight">PixelPureAI</span>
          </Link>
        </div>

        {/* Desktop Header Buttons (md:flex) */}
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-[10px] font-black uppercase tracking-tighter cursor-pointer hover:bg-white/5 transition-colors" onClick={() => setIsCreditsModalOpen(true)}>
            <Coins className="h-3 w-3 text-amber-400" />
            {credits} remaining
          </div>
          <CreditDetailsModal isOpen={isCreditsModalOpen} onClose={() => setIsCreditsModalOpen(false)} />
          {appliedTransforms.length > 0 && <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full text-xs h-8 px-4 font-bold"><RotateCcw className="h-3.5 w-3.5 mr-1.5" />Reset</Button>}
          {(restoredUrl || originalUrl) && <Button variant="outline" size="sm" onClick={handleShare} className="rounded-full text-xs h-8 px-4 font-bold"><Share2 className="h-3.5 w-3.5 mr-1.5" />Share</Button>}
          {originalUrl && <Button variant="outline" size="sm" onClick={handleClear} className="rounded-full text-xs h-8 px-4 font-bold hover:text-red-400 hover:border-red-400/50"><Trash2 className="h-3.5 w-3.5 mr-1.5" />Clear</Button>}
          {imagekitUrl && <Button variant="outline" size="sm" onClick={handleSaveProject} disabled={isSavingProject} className="rounded-full text-xs h-9 px-5 font-bold uppercase tracking-widest bg-white/5">{isSavingProject ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4 mr-2" />}Save</Button>}
          <Button 
            className="btn-primary h-9 px-5 text-xs font-bold uppercase tracking-widest rounded-full shadow-lg shadow-accent/20" 
            disabled={isUploading || !!originalUrl} 
            onClick={() => uploadInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Upload
          </Button>
          <input ref={uploadInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onDrop([f]); e.target.value = ""; }} />
        </div>

        {/* Mobile Header Buttons (md:hidden) */}
        <div className="flex md:hidden items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-9 w-9 border-border bg-white/5" 
            disabled={isUploading || !!originalUrl} 
            onClick={() => uploadInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full h-9 w-9 border-border bg-white/5">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-white/10 rounded-2xl p-2 shadow-2xl">
              <DropdownMenuItem className="rounded-xl py-3 focus:bg-white/5 cursor-pointer" onClick={() => setIsCreditsModalOpen(true)}>
                <Coins className="h-4 w-4 mr-3 text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">Credits</span>
                  <span className="text-[10px] text-text-muted">{credits} remaining</span>
                </div>
              </DropdownMenuItem>
              <div className="h-px bg-white/5 my-1" />
              {originalUrl && (
                <DropdownMenuItem className="rounded-xl py-3 focus:bg-white/5 cursor-pointer text-red-400 focus:text-red-400" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-3" />
                  <span className="text-xs font-bold">Clear Photo</span>
                </DropdownMenuItem>
              )}
              {appliedTransforms.length > 0 && (
                <DropdownMenuItem className="rounded-xl py-3 focus:bg-white/5 cursor-pointer" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4 mr-3" />
                  <span className="text-xs font-bold">Reset Enhancements</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Leave Confirmation Dialog */}
      <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <DialogContent className="bg-slate-900 border-white/10 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Save your work?</DialogTitle>
            <DialogDescription className="text-text-muted">
              You have unsaved enhancements. Save your project before leaving?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" className="rounded-full font-bold" onClick={() => setShowLeaveDialog(false)}>Cancel</Button>
            <Button 
              variant="ghost"
              className="rounded-full bg-white/5 hover:bg-white/10 text-white border-white/10 font-bold"
              onClick={() => router.push("/dashboard")}
            >
              Leave anyway
            </Button>
            <Button 
              className="btn-primary rounded-full font-bold"
              onClick={handleSaveProject}
            >
              Save & Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL */}
        <aside className="w-72 border-r border-border bg-bg-primary overflow-y-auto hidden lg:flex flex-col p-4 gap-2 custom-scrollbar">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-4">AI Power Tools</h2>
          {TOOLS.map((tool) => (
            <div key={tool.id} onClick={() => handleToolChange(tool.id)} className={`p-3.5 rounded-xl border cursor-pointer transition-all ${activeTool === tool.id ? "bg-accent/10 border-accent" : "bg-bg-tertiary border-border hover:border-white/20"}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${activeTool === tool.id ? "bg-accent/20 text-accent" : "bg-bg-secondary text-text-muted"}`}><tool.icon className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <h3 className={`font-bold text-[13px] ${activeTool === tool.id ? "text-white" : "text-text-muted"}`}>{tool.name}</h3>
                  <p className="text-[11px] text-text-muted truncate">{tool.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </aside>

        {/* CENTER CANVAS */}
        <main {...getRootProps()} className="flex-1 bg-[#05050E] relative flex items-center justify-center p-4 sm:p-10 overflow-hidden canvas-container touch-action-none" style={{ touchAction: 'none' }}>
          <input {...getInputProps()} />
          <AnimatePresence mode="wait">
            {!originalUrl ? (
              <motion.div key="upload-zone" className={`max-w-lg w-full aspect-video rounded-4xl border-2 border-dashed flex flex-col items-center justify-center p-12 transition-all ${isDragActive ? "border-accent bg-accent/10" : "border-white/10 bg-white/2"}`}>
                <ImageIcon className="h-12 w-12 text-accent mb-4" />
                <h2 className="font-bold text-xl mb-2">Drop photo here</h2>
                <Button variant="outline" className="rounded-full px-8" onClick={(e) => { e.stopPropagation(); uploadInputRef.current?.click(); }}>Select File</Button>
              </motion.div>
            ) : (
              <motion.div key="canvas" className="w-full h-full max-w-5xl mx-auto flex items-center justify-center">
                <ComparisonSlider 
                  key={`${originalUrl}-${restoredUrl}-${livePreviewUrl}`}
                  before={originalUrl} 
                  after={livePreviewUrl || restoredUrl || originalUrl} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* RIGHT PANEL - Adjustments */}
        <aside className="w-80 border-l border-border bg-bg-primary overflow-y-auto hidden xl:flex flex-col p-6 custom-scrollbar shrink-0">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-6">Adjust Features</h2>
          {imagekitUrl ? (
            <div className="flex flex-col h-full">
              <div className="p-4 rounded-2xl bg-white/3 border border-white/5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent"><selectedToolData.icon className="h-5 w-5" /></div>
                  <h3 className="font-bold text-sm">{selectedToolData.name}</h3>
                </div>
                <div className="space-y-2">
                  {selectedToolData.detail.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-text-muted">
                      <div className="w-1 h-1 rounded-full bg-accent" />{d}
                    </div>
                  ))}
                </div>
              </div>

              {selectedToolData.params && (
                <div className="space-y-6 mb-8 relative group">
                  {/* Live Preview Indicator */}
                  <div className="absolute -top-4 right-0">
                    <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter text-accent bg-accent/5 px-2 py-0.5 rounded-full border border-accent/10">
                      <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                      Live Preview
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest">{selectedToolData.params.label}</label>
                    <span className="text-xs font-black text-accent">{toolParams[selectedToolData.id] ?? selectedToolData.params.default}%</span>
                  </div>
                  <Slider
                    value={[toolParams[selectedToolData.id] ?? selectedToolData.params.default]}
                    min={selectedToolData.params.min} max={selectedToolData.params.max} step={selectedToolData.params.step}
                    onValueChange={([val]) => setToolParams(prev => ({ ...prev, [selectedToolData.id]: val }))}
                  />
                </div>
              )}

              <div className="mt-auto space-y-4">
                {!toolApplied ? (
                  <Button onClick={applyAITransformation} disabled={isProcessing || !originalUrl} className="w-full h-14 btn-primary rounded-2xl font-black uppercase tracking-widest text-xs">
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Applying instantly...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Apply Magic
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-[var(--success)] text-sm font-bold py-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                    Applied successfully
                  </div>
                )}
                {restoredUrl && <Button onClick={handleDownload} variant="outline" className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-xs"><Download className="h-4 w-4 mr-2" />Download HD</Button>}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-text-muted">
              <Info className="h-8 w-8 mb-4 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">Upload to adjust</p>
            </div>
          )}
        </aside>
      </div>

      {/* MOBILE BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-slate-950/90 backdrop-blur-2xl border-t border-white/10 p-4 pb-[calc(12px+env(safe-area-inset-bottom))] z-30">
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {TOOLS.map((t) => (
            <button key={t.id} onClick={() => handleToolChange(t.id)} className={`flex flex-col items-center gap-1 min-w-[60px] ${activeTool === t.id ? "text-accent" : "text-text-muted"}`}>
              <div className={`p-2.5 rounded-xl ${activeTool === t.id ? "bg-accent text-white shadow-lg" : "bg-white/5"}`}><t.icon className="h-5 w-5" /></div>
              <span className="text-[9px] font-bold uppercase tracking-tighter">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="bg-slate-950 border-white/10 rounded-t-3xl">
          <SheetHeader className="text-left mb-6">
            <SheetTitle className="text-xl font-bold">{selectedToolData.name}</SheetTitle>
            <SheetDescription>{selectedToolData.desc}</SheetDescription>
          </SheetHeader>
          <div className="space-y-6">
            {selectedToolData.params && (
              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span>{selectedToolData.params.label}</span>
                  <span className="text-accent">{toolParams[selectedToolData.id] ?? selectedToolData.params.default}%</span>
                </div>
                <Slider value={[toolParams[selectedToolData.id] ?? selectedToolData.params.default]} min={selectedToolData.params.min} max={selectedToolData.params.max} onValueChange={([v]) => setToolParams(p => ({...p, [selectedToolData.id]: v}))} />
              </div>
            )}
            {!toolApplied ? (
              <Button onClick={applyAITransformation} disabled={isProcessing} className="w-full h-12 btn-primary font-bold uppercase tracking-widest text-xs">Apply</Button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 text-[var(--success)] font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-[var(--success)]" />
                Applied! Select another tool
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default function StudioPage() {
  return (
    <React.Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-bg-primary"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>}>
      <StudioContent />
    </React.Suspense>
  );
}
