"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  Sparkles,
  User,
  Scissors,
  Maximize2,
  Upload,
  Download,
  ArrowLeft,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ComparisonSlider from "@/components/comparison-slider";
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

// ─── CORRECTED ImageKit Transform strings ────────────────────────────────────
// All transforms validated against ImageKit free-tier docs
const TOOLS = [
  {
    id: "enhance",
    name: "AI Enhance",
    icon: Sparkles,
    desc: "Fix blur, noise & compression",
    detail: ["Removes JPEG artefacts", "Sharpens edges", "Restores detail"],
    tr: null,
    provider: "replicate",
    credits: 1,
    color: "#8B5CF6",
  },
  {
    id: "faceRestore",
    name: "Face Restore",
    icon: User,
    desc: "Rebuild facial detail with AI",
    detail: [
      "Restores eyes & skin",
      "Works on old photos",
      "2× upscale included",
    ],
    tr: null,
    provider: "replicate",
    credits: 2,
    color: "#A78BFA",
  },
  {
    id: "upscale2x",
    name: "Upscale 2×",
    icon: ZoomIn,
    desc: "Double resolution, AI-sharp",
    detail: ["2× width & height", "AI fills missing detail", "No pixelation"],
    tr: "e-upscale-2",
    provider: "imagekit",
    credits: 2,
    color: "#06B6D4",
  },
  {
    id: "upscale4x",
    name: "Upscale 4×",
    icon: Maximize2,
    desc: "Ultra-high resolution boost",
    detail: [
      "4× resolution boost",
      "Perfect for printing",
      "AI-reconstructed pixels",
    ],
    tr: "e-upscale-4",
    provider: "imagekit",
    credits: 3,
    color: "#06B6D4",
  },
  {
    id: "bgRemove",
    name: "Remove BG",
    icon: Scissors,
    desc: "AI background removal",
    detail: [
      "Precise edge detection",
      "Transparent PNG output",
      "Works on hair & fur",
    ],
    tr: "e-bgremove,f-png",
    provider: "imagekit",
    credits: 2,
    color: "#10B981",
  },
  {
    id: "sharpen",
    name: "Sharpen",
    icon: Focus,
    desc: "Crisp edges & fine detail",
    detail: [
      "Unsharp mask algorithm",
      "Removes motion blur",
      "Preserves colours",
    ],
    tr: "e-sharpen-10",
    provider: "imagekit",
    credits: 1,
    color: "#F59E0B",
  },
  {
    id: "denoise",
    name: "Denoise",
    icon: Wind,
    desc: "Remove grain & noise",
    detail: [
      "Works on dark/night shots",
      "Preserves texture",
      "Smooth skin tones",
    ],
    tr: "e-denoise-10",
    provider: "imagekit",
    credits: 1,
    color: "#F59E0B",
  },
  {
    id: "bgBlur",
    name: "Blur Background",
    icon: Aperture,
    desc: "DSLR-style bokeh effect",
    detail: [
      "Subject stays sharp",
      "Natural depth of field",
      "Soft background blur",
    ],
    tr: "e-bgremove,e-bg-blur-10",
    provider: "imagekit",
    credits: 2,
    color: "#10B981",
  },
  {
    id: "contrast",
    name: "AI Vivid",
    icon: Sun,
    desc: "Pop colours & contrast",
    detail: [
      "Auto contrast boost",
      "Vibrant saturation",
      "Tone-mapped highlights",
    ],
    tr: "e-contrast-10",
    provider: "imagekit",
    credits: 1,
    color: "#EF4444",
  },
  {
    id: "grayscale",
    name: "Cinematic B&W",
    icon: Film,
    desc: "Professional black & white",
    detail: [
      "Film-grain aesthetic",
      "Tonal range preserved",
      "Classic cinema look",
    ],
    tr: "e-grayscale",
    provider: "imagekit",
    credits: 1,
    color: "#94A3B8",
  },
  {
    id: "smartCrop",
    name: "Smart Crop",
    icon: Crop,
    desc: "AI finds the best composition",
    detail: [
      "Face-aware cropping",
      "Rule-of-thirds",
      "Multiple ratios supported",
    ],
    tr: "c-at_max,fo-auto",
    provider: "imagekit",
    credits: 1,
    color: "#3B82F6",
  },
  {
    id: "trim",
    name: "Auto Trim",
    icon: Scissors,
    desc: "Remove solid-colour borders",
    detail: [
      "Removes white borders",
      "Removes black bars",
      "Precise edge detection",
    ],
    tr: "e-trim",
    provider: "imagekit",
    credits: 1,
    color: "#EC4899",
  },
];

// ─── Helper: build ImageKit transform URL ────────────────────────────────────
// BUG FIX: Always use the ORIGINAL uploaded URL as base, but chain transforms
// by combining all applied transform strings with colon separator.
// e.g. ?tr=e-restore,q-100:e-grayscale,q-100
function buildTransformUrl(baseImageKitUrl, transformStrings) {
  if (!transformStrings || transformStrings.length === 0) return baseImageKitUrl;
  // ImageKit chaining: multiple transforms separated by colon
  const chain = transformStrings.join(":");

  // 1. Separate URL and existing query params
  const [baseUrl, queryString] = baseImageKitUrl.split("?");

  // 2. Parse existing params
  const params = new URLSearchParams(queryString || "");

  // 3. Set or update the 'tr' parameter
  params.set("tr", chain);

  // 4. Reconstruct URL
  return `${baseUrl}?${params.toString()}`;
}

export default function StudioPage() {
  const { isSignedIn, user: clerkUser } = useUser();
  const { openSignIn } = useClerk();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");

  // Convex User Query & Mutations
  const { data: convexUser } = useConvexQuery(api.users.getCurrentUser);
  const { mutate: createProject, isLoading: isSavingProject } = useConvexMutation(api.projects.create);

  // ─── State ────────────────────────────────────────────────────────────────
  const [imagekitUrl, setImagekitUrl] = useState(null);   // The clean uploaded URL from ImageKit
  const [originalUrl, setOriginalUrl] = useState(null);   // Always the clean base for display "before"
  const [restoredUrl, setRestoredUrl] = useState(null);   // Current result with transforms applied
  const [appliedTransforms, setAppliedTransforms] = useState([]); // Array of applied tr strings — for chaining
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false); // Track if the new CDN image is loading
  const [activeTool, setActiveTool] = useState("enhance");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [toolParams, setToolParams] = useState({}); // Stores slider values for tools: { sharpen: 20, bgBlur: 15 }
  
  // Ref for local preview URL to safely revoke it
  const localPreviewRef = useRef(null);

  // ─── Credits Management ──────────────────────────────────────────────────
  const { balance: credits, isLoading: isCreditsLoading, deduct, canAfford } = useCredits();
  
  const [wasRestored, setWasRestored] = useState(false);

  const [selectedBgColor, setSelectedBgColor] = useState(null);
  const [selectedFrame, setSelectedFrame] = useState("none");

  const uploadInputRef = useRef(null);
  const selectedToolData = TOOLS.find((t) => t.id === activeTool) || TOOLS[0];

  // ─── Project Loading Logic ───────────────────────────────────────────────
  const { data: loadedProject, isLoading: isProjectLoading } = useConvexQuery(
    api.projects.getProject,
    projectId ? { projectId } : "skip"
  );

  useEffect(() => {
    if (loadedProject) {
      setIsImageLoading(true); // Image from project is loading
      setImagekitUrl(loadedProject.originalImageUrl);
      setOriginalUrl(loadedProject.originalImageUrl);
      setRestoredUrl(loadedProject.currentImageUrl);
      if (loadedProject.activeTransformations) {
        setAppliedTransforms(loadedProject.activeTransformations.split(":"));
      }
      toast.success("Project loaded!");
    }
  }, [loadedProject]);

  // ─── Persistence Logic ──────────────────────────────────────────────────
  // Load from localStorage on mount (only if no projectId in URL)
  useEffect(() => {
    if (projectId) return; // Don't load from storage if we're loading a specific project
    try {
      const saved = localStorage.getItem("pixelpure_studio");
      if (!saved) return;
      const data = JSON.parse(saved);
      if (data?.imagekitUrl && !data.imagekitUrl.startsWith("blob:")) {
        setIsImageLoading(true); // Image from session is loading
        setImagekitUrl(data.imagekitUrl);
        setOriginalUrl(data.imagekitUrl);
        setRestoredUrl(data.restoredUrl || null);
        setAppliedTransforms(data.appliedTransforms || []);
        setActiveTool(data.activeTool || "enhance");
        setWasRestored(true);
        toast.success("Session restored! Your work is saved.");
      }
    } catch (e) {
      console.error("Failed to restore session:", e);
      localStorage.removeItem("pixelpure_studio");
    }
  }, [projectId]);

  // Save to localStorage on change (only if no projectId in URL)
  useEffect(() => {
    if (projectId || !imagekitUrl || imagekitUrl.startsWith("blob:")) return;
    const data = {
      imagekitUrl,
      originalUrl: imagekitUrl,
      restoredUrl,
      appliedTransforms,
      activeTool,
    };
    localStorage.setItem("pixelpure_studio", JSON.stringify(data));
  }, [imagekitUrl, restoredUrl, appliedTransforms, activeTool, projectId]);

  // ─── Action Handlers ─────────────────────────────────────────────────────
  const handleSaveProject = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }

    if (!imagekitUrl) {
      toast.error("Nothing to save!");
      return;
    }

    if (!convexUser) {
      toast.error("User profile not found. Please try again.");
      return;
    }

    try {
      await createProject({
        title: "Untitled Project " + Date.now(),
        originalImageUrl: imagekitUrl,
        currentImageUrl: restoredUrl || imagekitUrl,
        activeTransformations: appliedTransforms.join(":"),
        canvasState: {},
        width: 0,
        height: 0,
      });
      toast.success("Project saved!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save project.");
    }
  };

  const handleDownloadClick = () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    
    // Existing download logic call (this function already exists below)
    handleDownload();
  };

  // Auto-dismiss restore banner
  useEffect(() => {
    if (wasRestored) {
      const t = setTimeout(() => setWasRestored(false), 4000);
      return () => clearTimeout(t);
    }
  }, [wasRestored]);

  // ─── Upload Handler ───────────────────────────────────────────────────────
  // BUG FIX: Upload sets imagekitUrl (clean CDN url). originalUrl = same (for "before").
  // restoredUrl starts null until user applies a tool.
  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB allowed.");
      return;
    }

    setIsUploading(true);
    setRestoredUrl(null);
    setAppliedTransforms([]);

    // Show local preview immediately while uploading
    const localPreview = URL.createObjectURL(file);
    localPreviewRef.current = localPreview;
    setOriginalUrl(localPreview);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const response = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.url) {
        // Replace local preview with real ImageKit URL
        setIsImageLoading(true); // The new CDN image is now loading
        setImagekitUrl(data.url);
        setOriginalUrl(data.url);
        setRestoredUrl(null);
        setAppliedTransforms([]);
        toast.success("Photo uploaded! Select a tool and click Apply.");
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error(`Upload failed: ${err.message}`);
      setOriginalUrl(null);
      setImagekitUrl(null);
      if (localPreviewRef.current) {
        URL.revokeObjectURL(localPreviewRef.current);
        localPreviewRef.current = null;
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleImageLoad = () => {
    // This is called when the new ImageKit URL successfully loads in the browser
    setIsImageLoading(false);
    // ONLY now is it safe to revoke the local blob URL
    if (localPreviewRef.current) {
      URL.revokeObjectURL(localPreviewRef.current);
      localPreviewRef.current = null;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    disabled: isUploading || isProcessing,
    noClick: true, // We handle click manually to avoid double-trigger bug
  });

  // ─── Apply Tool ───────────────────────────────────────────────────────────
  // BUG FIX 1: Use imagekitUrl (not originalUrl/restoredUrl) as the base.
  // BUG FIX 2: Chain transforms — don't replace, accumulate.
  // BUG FIX 3: Check if this transform is already applied (avoid duplicates).
  // BUG FIX 4: Deduct credits after successful apply.
  const applyAITransformation = useCallback(async () => {
    if (!imagekitUrl) {
      toast.error("Please upload a photo first.");
      return;
    }

    if (!canAfford(selectedToolData.credits)) {
      toast.error(`Not enough credits. Need ${selectedToolData.credits}, have ${credits}.`);
      return;
    }

    setIsProcessing(true);
    setIsSheetOpen(false);

    try {
      let resultUrl = null;

      // 1. Route based on provider
      if (selectedToolData.provider === "replicate") {
        // --- REPLICATE FLOW ---
        if (selectedToolData.id === "enhance" || selectedToolData.id === "faceRestore") {
          const res = await fetch("/api/ai/enhance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imagekitUrl }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Enhancement failed");
          resultUrl = data.url;
        } else if (selectedToolData.id === "upscale2x" || selectedToolData.id === "upscale4x") {
          const scale = selectedToolData.id === "upscale4x" ? 4 : 2;
          const res = await fetch("/api/ai/upscale", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imagekitUrl, scale }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Upscale failed");
          resultUrl = data.url;
        } else if (selectedToolData.id === "bgRemove" || selectedToolData.id === "bgBlur") {
          const res = await fetch("/api/ai/remove-bg", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imagekitUrl }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Background removal failed");
          resultUrl = data.url;
        } else if (selectedToolData.id === "sharpen" || selectedToolData.id === "denoise") {
          const res = await fetch("/api/ai/reconstruct", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imagekitUrl, type: selectedToolData.id }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Reconstruction failed");
          resultUrl = data.url;
        } else if (selectedToolData.id === "smartCrop") {
          const res = await fetch("/api/ai/smart-crop", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imagekitUrl }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || "Smart crop failed");
          resultUrl = data.url;
        } else if (selectedToolData.id === "contrast" || selectedToolData.id === "grayscale" || selectedToolData.id === "trim") {
          const res = await fetch("/api/ai/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl: imagekitUrl, tool: selectedToolData.id }),
          });
          const data = await res.json();
          if (!data.success) throw new Error(data.error || `${selectedToolData.name} failed`);
          resultUrl = data.url;
        }
      } else {
        // --- IMAGEKIT FLOW ---
        let finalTr = selectedToolData.tr;
        if (selectedToolData.params) {
          const val = toolParams[selectedToolData.id] ?? selectedToolData.params.default;
          finalTr = `${selectedToolData.tr}-${val}`;
        }

        // Check if this exact tool transform is already in chain
        if (appliedTransforms.includes(finalTr)) {
          toast.info(`${selectedToolData.name} is already applied.`);
          setIsProcessing(false);
          return;
        }

        const newTransforms = [...appliedTransforms, finalTr];
        resultUrl = buildTransformUrl(imagekitUrl, newTransforms);
        setAppliedTransforms(newTransforms);
      }

      // 2. Success - update state and deduct credits
      if (resultUrl) {
        // Safeguard: Ensure resultUrl is a string (Replicate sometimes returns arrays or objects)
        let finalUrl = resultUrl;
        if (Array.isArray(resultUrl)) finalUrl = resultUrl[0];
        if (typeof finalUrl === "object" && finalUrl !== null) {
          finalUrl = finalUrl.url || finalUrl.src || String(finalUrl);
        }
        
        setRestoredUrl(finalUrl);
        setAppliedTransforms(prev => [...new Set([...prev, selectedToolData.id])]);
        await deduct(selectedToolData.credits, selectedToolData.name);
        toast.success(`${selectedToolData.name} applied!`);
      }
    } catch (err) {
      console.error("AI Error:", err);
      toast.error(err.message || "Failed to apply transformation.");
    } finally {
      setIsProcessing(false);
    }
  }, [imagekitUrl, appliedTransforms, selectedToolData, credits, deduct, canAfford, toolParams]);

  // ─── Reset All Enhancements ───────────────────────────────────────────────
  const handleReset = () => {
    setRestoredUrl(null);
    setAppliedTransforms([]);
    setSelectedBgColor(null);
    setSelectedFrame("none");
    toast.info("All enhancements cleared.");
  };

  // ─── Clear Everything ─────────────────────────────────────────────────────
  const handleClear = () => {
    setOriginalUrl(null);
    setImagekitUrl(null);
    setRestoredUrl(null);
    setAppliedTransforms([]);
    setSelectedBgColor(null);
    setSelectedFrame("none");
    localStorage.removeItem("pixelpure_studio");
  };

  // ─── Download ─────────────────────────────────────────────────────────────
  const handleDownload = () => {
    if (!restoredUrl) return;
    if (!isSignedIn) {
      toast.info("Please sign in to download HD images.");
      return;
    }
    const downloadUrl = restoredUrl.includes("?")
      ? `${restoredUrl}&ik-attachment=true`
      : `${restoredUrl}?ik-attachment=true`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `pixelpure-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── Tool change ──────────────────────────────────────────────────────────
  const handleToolChange = (toolId) => {
    setActiveTool(toolId);
    if (typeof window !== "undefined" && window.innerWidth <= 768 && imagekitUrl) {
      setIsSheetOpen(true);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary overflow-hidden font-dm">
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent2) 50%, var(--accent) 100%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite linear;
        }
      `}</style>

      {/* ── TOP PROCESSING TOAST ── */}
      <AnimatePresence>
        {(isProcessing || isUploading) && (
          <motion.div
            initial={{ y: -20, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: -20, opacity: 0, x: "-50%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 left-1/2 z-100 flex items-center gap-3 px-5 py-2.5 rounded-full bg-[rgba(8,8,15,0.92)] backdrop-blur-xl border border-[rgba(139,92,246,0.4)] shadow-[0_0_20px_rgba(139,92,246,0.2)]"
          >
            <div className="w-1.5 h-4 rounded-full animate-shimmer" />
            <span className="text-xs font-bold tracking-wide text-text-primary">
              {isUploading ? "Uploading to cloud..." : `Applying ${selectedToolData.name}...`}
            </span>
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <header className="h-16 border-b border-border px-4 sm:px-6 flex items-center justify-between bg-bg-primary/80 backdrop-blur-xl z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="h-5 w-5 text-accent" />
            <span className="font-display font-bold text-lg tracking-tight">PixelPureAI</span>
          </Link>
          <div className="hidden sm:block h-4 w-px bg-border mx-1" />
          <span className="hidden sm:block text-xs font-bold text-text-muted uppercase tracking-widest">
            AI Studio
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Credits badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${
            credits <= 5
              ? "border-red-500/40 text-red-400 bg-red-500/10"
              : credits <= 10
              ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
              : "border-border text-text-muted bg-bg-tertiary"
          }`}>
            🪙 {credits} credits
          </div>

          {/* Reset enhancements */}
          {appliedTransforms.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="rounded-full border-border text-text-muted hover:text-white text-xs h-8"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">Reset</span> ({appliedTransforms.length})
            </Button>
          )}

          {/* Clear photo */}
          {originalUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="rounded-full border-border text-text-muted hover:text-red-400 hover:border-red-500/40 text-xs h-8"
            >
              <Trash2 className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}

          {/* Save project */}
          {imagekitUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveProject}
              disabled={isSavingProject}
              className="rounded-full border-accent/40 text-accent hover:bg-accent/10 text-xs h-9 px-5 font-bold uppercase tracking-widest"
            >
              {isSavingProject ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              {isSavingProject ? "Saving..." : "Save Project"}
            </Button>
          )}

          {/* BUG FIX: Upload button — standalone input, not wrapped in getRootProps */}
          {/* Using a dedicated ref avoids the double-trigger / no-click bug */}
          <Button
            className="btn-primary h-9 px-4 sm:px-5 text-xs font-bold uppercase tracking-widest rounded-full"
            disabled={isUploading}
            onClick={() => uploadInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {isUploading ? "Uploading..." : <><span>Upload</span><span className="hidden sm:inline"> Photo</span></>}
          </Button>
          {/* Hidden input for header upload button */}
          <input
            ref={uploadInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onDrop([file]);
              e.target.value = ""; // reset so same file can be re-uploaded
            }}
          />
        </div>
      </header>

      {/* ── RESTORE BANNER ── */}
      <AnimatePresence>
        {wasRestored && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="w-full bg-accent/8 border-b border-accent/20 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
              <div className="flex-1 text-center text-[10px] sm:text-xs text-accent font-medium">
                ✦ Previous session restored — your enhancements are intact
              </div>
              <button 
                onClick={() => setWasRestored(false)}
                className="p-1 hover:bg-accent/10 rounded-full transition-colors"
              >
                <Settings className="h-3 w-3 rotate-45" /> {/* Using Settings as a cross-like icon since X might not be imported */}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN BODY ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* ── LEFT PANEL — Tool Cards (Desktop) ──────────────────────── */}
        <aside className="hidden lg:flex w-[280px] xl:w-[300px] border-r border-border flex-col bg-bg-secondary overflow-y-auto p-4 gap-2 custom-scrollbar shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1 mb-1">
            AI Tools
          </p>
          {TOOLS.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => handleToolChange(tool.id)}
              className={`p-3.5 rounded-md border cursor-pointer transition-all duration-150 group relative ${
                activeTool === tool.id
                  ? "bg-accent/10 border-accent shadow-[0_0_0_1px_var(--accent)]"
                  : "bg-bg-tertiary border-border hover:border-text-subtle"
              }`}
            >
              {/* Applied indicator dot */}
              {appliedTransforms.includes(tool.id) && (
                <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-success" title="Applied" />
              )}
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    activeTool === tool.id
                      ? "bg-accent/20 text-accent"
                      : "bg-bg-secondary text-text-muted group-hover:text-text-primary"
                  }`}
                >
                  <tool.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3
                      className={`font-bold text-[13px] truncate ${
                        activeTool === tool.id
                          ? "text-text-primary"
                          : "text-text-muted group-hover:text-text-primary"
                      }`}
                    >
                      {tool.name}
                    </h3>
                    {tool.provider === "replicate" ? (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-accent/10 text-accent border border-accent/20 uppercase tracking-tighter shrink-0">
                        ⚡ AI
                      </span>
                    ) : (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-tighter shrink-0">
                        ⚡ Fast
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-text-muted leading-tight truncate">
                      {tool.desc}
                    </p>
                    <span className="text-[9px] font-bold text-text-muted/60 shrink-0 ml-2">
                      {tool.credits}cr
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </aside>

        {/* ── CENTER CANVAS ───────────────────────────────────────────── */}
        <main
          {...getRootProps()}
          className="flex-1 bg-[#05050E] relative flex items-center justify-center p-4 sm:p-6 overflow-hidden pb-24 lg:pb-6"
        >
          {/* Hidden dropzone input (for drag-drop only, not click) */}
          <input {...getInputProps()} />

          <AnimatePresence mode="wait">
            {/* ── No image: Drop Zone ── */}
            {!originalUrl ? (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`max-w-lg w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 sm:p-12 transition-all duration-300 ${
                  isDragActive
                    ? "border-accent bg-accent/10 scale-105 shadow-[0_0_40px_rgba(139,92,246,0.1)]"
                    : "border-accent/20 bg-bg-secondary/50 hover:border-accent/40"
                }`}
              >
                <div className="w-16 h-16 rounded-3xl bg-bg-tertiary flex items-center justify-center mb-5 shadow-2xl">
                  <ImageIcon className="h-8 w-8 text-accent" />
                </div>
                <h2 className="font-display font-bold text-xl sm:text-2xl mb-2 text-center">
                  {isDragActive ? "Drop it!" : "Drop your photo here"}
                </h2>
                <p className="text-text-muted text-sm mb-6 text-center">
                  JPG, PNG, WEBP up to 10MB — or click Upload Photo above
                </p>
                <Button
                  variant="outline"
                  className="rounded-full px-8 border-accent/50 text-accent hover:bg-accent font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    uploadInputRef.current?.click();
                  }}
                >
                  Browse Files
                </Button>
              </motion.div>
            ) : (
              /* ── Image loaded ── */
              <motion.div
                key="canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex items-center justify-center relative rounded-lg overflow-hidden"
              >
                {restoredUrl ? (
                  /* Before/After slider - use key to force re-render on image change */
                  <ComparisonSlider 
                    key={restoredUrl} 
                    before={originalUrl} 
                    after={restoredUrl} 
                  />
                ) : originalUrl ? (
                  /* Original preview - only render img if originalUrl is valid */
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img
                      src={originalUrl}
                      alt="Original"
                      onLoad={handleImageLoad}
                      className={`max-w-full max-h-full object-contain rounded-md transition-opacity duration-300 ${isImageLoading ? 'opacity-50' : 'opacity-100'}`}
                    />
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      Original
                    </div>
                  </div>
                ) : null}

                {/* Applied transforms badge */}
                {appliedTransforms.length > 0 && !isProcessing && (
                  <div className="absolute top-4 right-4 bg-success/20 border border-success/40 text-success text-[10px] font-bold px-3 py-1 rounded-full">
                    {appliedTransforms.length} enhancement{appliedTransforms.length > 1 ? "s" : ""} applied
                  </div>
                )}

                {/* ── BG REMOVE OPTIONS PANEL ── */}
                <AnimatePresence>
                  {activeTool === "bgRemove" && restoredUrl && !isProcessing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-md bg-bg-tertiary/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4"
                    >
                      <div className="flex gap-4 mb-4 border-b border-border pb-2">
                        {["colors", "frames"].map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setSelectedFrame(tab === "colors" ? "none" : selectedFrame)}
                            className={`text-[10px] font-bold uppercase tracking-widest pb-1 transition-all ${
                              (tab === "colors" && selectedFrame === "none") || (tab === "frames" && selectedFrame !== "none")
                                ? "text-accent border-b-2 border-accent"
                                : "text-text-muted hover:text-text-primary"
                            }`}
                          >
                            {tab === "colors" ? "Background Color" : "Frames"}
                          </button>
                        ))}
                      </div>

                      {/* Tab 1: Colors */}
                      {selectedFrame === "none" ? (
                        <div className="flex flex-wrap items-center gap-2.5">
                          {[
                            { name: "Transparent", hex: null, icon: true },
                            { name: "White", hex: "ffffff" },
                            { name: "Black", hex: "000000" },
                            { name: "Gray", hex: "f0f0f0" },
                            { name: "Navy", hex: "1a1a2e" },
                            { name: "Pink", hex: "ffd6e0" },
                            { name: "Blue", hex: "c8e6ff" },
                            { name: "Green", hex: "1b4332" },
                          ].map((c) => (
                            <button
                              key={c.hex || "transparent"}
                              onClick={() => {
                                setSelectedBgColor(c.hex);
                                const tr = c.hex ? `e-bgremove,bg-${c.hex}` : "e-bgremove,f-png";
                                // FIX: Only ImageKit transforms should go into buildTransformUrl
                                const ikTransforms = [tr]; 
                                const resultUrl = buildTransformUrl(imagekitUrl, ikTransforms);
                                setAppliedTransforms(prev => [...prev.filter(t => !t.includes("e-bgremove")), tr]);
                                setRestoredUrl(resultUrl);
                              }}
                              className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                                selectedBgColor === c.hex ? "border-accent scale-110 shadow-[0_0_10px_var(--accent-glow)]" : "border-white/10"
                              }`}
                              style={{ 
                                backgroundColor: c.hex ? `#${c.hex}` : "transparent",
                                backgroundImage: c.icon ? "conic-gradient(#333 0.25turn, #555 0.25turn 0.5turn, #333 0.5turn 0.75turn, #555 0.75turn)" : "none",
                                backgroundSize: c.icon ? "8px 8px" : "auto"
                              }}
                              title={c.name}
                            />
                          ))}
                          <div className="relative w-7 h-7">
                            <input 
                              type="color" 
                              onChange={(e) => {
                                const hex = e.target.value.replace("#", "");
                                setSelectedBgColor(hex);
                                const tr = `e-bgremove,bg-${hex}`;
                                const ikTransforms = [tr];
                                const resultUrl = buildTransformUrl(imagekitUrl, ikTransforms);
                                setAppliedTransforms(prev => [...prev.filter(t => !t.includes("e-bgremove")), tr]);
                                setRestoredUrl(resultUrl);
                              }}
                              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                            />
                            <div className="w-7 h-7 rounded-full border-2 border-accent bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500" />
                          </div>
                        </div>
                      ) : (
                        /* Tab 2: Frames */
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: "Polaroid", tr: "e-bgremove,w-900,h-1100,bg-ffffff,p-60" },
                            { name: "Shadow", tr: "e-bgremove,e-shadow-40,bg-f8f8f8" },
                            { name: "Cinema", tr: "e-bgremove,bg-08080f,w-1200,h-800,p-40" },
                            { name: "Gradient", tr: "e-bgremove,bg-8B5CF6_to_06B6D4" },
                            { name: "Soft Blur", tr: "e-bgremove,e-bg-blur-15,bg-e0e0e0" },
                            { name: "None", tr: "e-bgremove,f-png" },
                          ].map((f) => (
                            <button
                              key={f.name}
                              onClick={() => {
                                setSelectedFrame(f.name);
                                const ikTransforms = [f.tr];
                                const resultUrl = buildTransformUrl(imagekitUrl, ikTransforms);
                                setAppliedTransforms(prev => [...prev.filter(t => !t.includes("e-bgremove")), f.tr]);
                                setRestoredUrl(resultUrl);
                              }}
                              className={`p-2 rounded-lg border text-[9px] font-bold uppercase text-center transition-all ${
                                selectedFrame === f.name.toLowerCase() 
                                  ? "border-accent bg-accent/10 text-accent shadow-[0_0_10px_var(--accent-glow)]" 
                                  : "border-border bg-bg-secondary text-text-muted hover:text-text-primary"
                              }`}
                            >
                              <div className="h-1 w-full bg-white/10 rounded-full mb-1 mx-auto" />
                              {f.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Processing Overlay */}
                <AnimatePresence>
                  {(isProcessing || isUploading) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#08080F]/85 backdrop-blur-md rounded-lg"
                    >
                      <div className="relative mb-5">
                        <Loader2 className="h-14 w-14 text-accent animate-spin" />
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-accent2 animate-pulse" />
                      </div>
                      <h3 className="font-display font-bold text-lg text-text-primary animate-pulse">
                        {isUploading ? "Uploading photo..." : "Enhancing with AI..."}
                      </h3>
                      <p className="text-text-muted text-sm mt-1">
                        {isUploading ? "Sending to ImageKit CDN" : "Applying ImageKit transformation"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ── RIGHT PANEL — Tool Detail (Desktop xl+) ─────────────────── */}
        <aside className="hidden xl:flex w-[280px] border-l border-border flex-col bg-bg-secondary p-5 overflow-y-auto shrink-0">
          {imagekitUrl ? (
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col h-full"
            >
              {/* Tool info */}
              <div className="mb-auto">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-accent/10 text-accent">
                    <selectedToolData.icon className="h-5 w-5" />
                  </div>
                  <h2 className="font-display font-bold text-xl text-text-primary">
                    {selectedToolData.name}
                  </h2>
                </div>

                <p className="text-text-muted text-sm leading-relaxed mb-5">
                  {selectedToolData.desc}
                </p>

                <div className="space-y-2 mb-5">
                  {selectedToolData.detail.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-text-primary">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>

                {/* Tool Parameters (Sliders) */}
                {selectedToolData.params && (
                  <div className="mb-6 p-4 rounded-xl bg-bg-tertiary border border-border">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                        {selectedToolData.params.label}
                      </span>
                      <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                        {toolParams[selectedToolData.id] ?? selectedToolData.params.default}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={selectedToolData.params.min}
                      max={selectedToolData.params.max}
                      step={selectedToolData.params.step}
                      value={toolParams[selectedToolData.id] ?? selectedToolData.params.default}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setToolParams(prev => ({ ...prev, [selectedToolData.id]: val }));
                      }}
                      className="w-full h-1.5 bg-bg-primary rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-[9px] text-text-muted font-bold">{selectedToolData.params.min}%</span>
                      <span className="text-[9px] text-text-muted font-bold">{selectedToolData.params.max}%</span>
                    </div>
                  </div>
                )}

                <div className="p-3.5 rounded-md bg-bg-tertiary border border-border flex items-center justify-between mb-5">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    Cost
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-base font-bold text-text-primary">
                      {selectedToolData.credits}
                    </span>
                    <span className="text-[10px] text-text-muted uppercase">credits</span>
                  </div>
                </div>

                {/* Extension required warning */}
                {selectedToolData.extension && (
                  <div className="text-[10px] text-amber-400 font-medium p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 mb-4">
                    ✦ Requires <strong>{selectedToolData.extension}</strong> extension to be enabled in your ImageKit dashboard.
                  </div>
                )}

                {/* Already applied indicator */}
                {appliedTransforms.includes(selectedToolData.id) && (
                  <div className="flex items-center gap-2 text-success text-xs font-bold mb-4 p-2.5 rounded-lg bg-success/10 border border-success/20">
                    <div className="w-2 h-2 rounded-full bg-success" />
                    Already applied to this image
                  </div>
                )}

                {/* Low credits warning */}
                {!canAfford(selectedToolData.credits) && (
                  <div className="text-xs text-red-400 font-bold p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 mb-4">
                    ⚠ Not enough credits ({credits} left, need {selectedToolData.credits})
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="space-y-3 mt-4">
                <Button
                  disabled={isProcessing || isUploading || !canAfford(selectedToolData.credits)}
                  onClick={applyAITransformation}
                  className="btn-primary w-full h-12 font-bold text-xs uppercase tracking-widest"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Processing...</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /> Apply Enhancement</>
                  )}
                </Button>

                {restoredUrl && (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="w-full h-10 rounded-md border-border text-text-muted font-bold text-xs uppercase tracking-widest hover:text-white"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-2" />
                      Reset All ({appliedTransforms.length})
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleDownloadClick}
                      className="w-full h-10 rounded-md border-border text-text-primary font-bold text-xs uppercase tracking-widest hover:bg-bg-tertiary"
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Download Result
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          ) : (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="p-4 rounded-full bg-bg-tertiary mb-4">
                <Info className="h-6 w-6 text-text-muted" />
              </div>
              <h3 className="font-display font-bold text-base text-text-primary mb-2">
                Ready to edit?
              </h3>
              <p className="text-text-muted text-xs leading-relaxed">
                Upload a photo to unlock all AI tools.
              </p>
            </div>
          )}
        </aside>
      </div>

      {/* ── BOTTOM TOOL STRIP (Mobile / Tablet) ────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[rgba(8,8,15,0.97)] backdrop-blur-2xl border-t border-border px-3 pt-3 pb-4 z-30 shrink-0">
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleToolChange(tool.id)}
              className="flex flex-col items-center gap-1 min-w-[56px] relative shrink-0"
            >
              <div
                className={`p-2.5 rounded-xl transition-all relative ${
                  activeTool === tool.id
                    ? "bg-accent text-white shadow-[0_0_14px_var(--accent-glow)]"
                    : "text-text-muted hover:bg-bg-tertiary"
                }`}
              >
                <tool.icon className="h-5 w-5" />
                {appliedTransforms.includes(tool.id) && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-success border border-bg-primary" />
                )}
              </div>
              <span
                className={`text-[9px] font-bold uppercase tracking-tight text-center leading-tight w-full ${
                  activeTool === tool.id
                    ? "text-accent"
                    : "text-text-muted"
                }`}
              >
                {tool.name.length > 8 ? tool.name.split(" ").pop() : tool.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── MOBILE TOOL SHEET ── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="bottom"
          className="bg-bg-secondary border-border h-[50vh] rounded-t-lg"
        >
          <SheetHeader className="text-left mb-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-accent/10 text-accent">
                <selectedToolData.icon className="h-5 w-5" />
              </div>
              <SheetTitle className="font-display font-bold text-xl text-text-primary">
                {selectedToolData.name}
              </SheetTitle>
            </div>
            <SheetDescription className="text-text-muted text-sm">
              {selectedToolData.desc}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              {selectedToolData.detail.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs text-text-primary font-medium"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 rounded-md bg-bg-tertiary border border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
                Credits Required
              </span>
              <span className="text-sm font-bold text-text-primary">
                {selectedToolData.credits}
              </span>
            </div>

            <Button
              onClick={applyAITransformation}
              disabled={isProcessing || isUploading || !canAfford(selectedToolData.credits)}
              className="btn-primary w-full h-12 font-bold uppercase tracking-widest text-xs"
            >
              {isProcessing ? "Processing..." : "Apply Enhancement"}
            </Button>

            {restoredUrl && (
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => { handleReset(); setIsSheetOpen(false); }}
                  className="h-10 border-border text-text-muted font-bold text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { handleDownloadClick(); setIsSheetOpen(false); }}
                  className="h-10 border-border text-text-primary font-bold text-xs"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}