"use client";

import React, { useState, useCallback } from "react";
import { X, Upload, Image as ImageIcon, Loader2, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useDropzone } from "react-dropzone";
import { useConvexMutation, useConvexQuery } from "@/hooks/use-convex-query";
import { usePlanAccess } from "@/hooks/use-plan-access";
import { UpgradeModal } from "@/components/upgrade-modal";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NewProjectModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const { mutate: createProject } = useConvexMutation(api.projects.create);
  const { data: projects } = useConvexQuery(api.projects.getUserProjects);
  const { canCreateProject, isFree } = usePlanAccess();
  const router = useRouter();

  // Check if user can create new project
  const currentProjectCount = projects?.length || 0;
  const canCreate = canCreateProject(currentProjectCount);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));

      // Auto-generate title from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setProjectTitle(nameWithoutExt || "Untitled Project");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024, // 20MB limit
  });

  // Handle create project with plan limit check
  const handleCreateProject = async () => {
    // Check project limits first
    if (!canCreate) {
      setShowUpgradeModal(true);
      return;
    }

    if (!selectedFile || !projectTitle.trim()) {
      toast.error("Please select an image and enter a project title");
      return;
    }

    setIsUploading(true);

    try {
      // Upload to ImageKit via our API route
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("fileName", selectedFile.name);

      const uploadResponse = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error(uploadData.error || "Failed to upload image");
      }

      // Create project in Convex
      const projectId = await createProject({
        title: projectTitle.trim(),
        originalImageUrl: uploadData.url,
        currentImageUrl: uploadData.url,
        thumbnailUrl: uploadData.thumbnailUrl,
        width: uploadData.width || 800,
        height: uploadData.height || 600,
        canvasState: null,
      });

      toast.success("Project created successfully!");

      // Navigate to editor
      router.push(`/editor/${projectId}`);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error(
        error.message || "Failed to create project. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // Reset modal state
  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProjectTitle("");
    setIsUploading(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-xl bg-slate-900 border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <DialogTitle className="text-3xl font-bold text-white tracking-tight">
                    New Restoration
                  </DialogTitle>
                  <p className="text-slate-400 text-sm">
                    Upload a photo to restore it to HD quality
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleClose} 
                  className="rounded-full hover:bg-white/5 text-slate-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Title Input */}
              <div className="space-y-3">
                <Label htmlFor="title" className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">
                  Project Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g. My Old Photo"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="bg-white/5 border-white/10 rounded-2xl h-14 text-white focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all px-6"
                />
              </div>

              {/* Upload Area */}
              <div className="space-y-3">
                <Label className="text-slate-300 text-xs font-bold uppercase tracking-widest ml-1">
                  Upload Image
                </Label>
                <div
                  {...getRootProps()}
                  className={`relative cursor-pointer rounded-[2rem] border-2 border-dashed transition-all duration-500 min-h-[220px] flex flex-col items-center justify-center p-8 group/upload ${
                    isDragActive
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                  } ${!canCreate ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <input {...getInputProps()} />

                  {previewUrl ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover/upload:opacity-100 transition-all duration-300 backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-2">
                          <Upload className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-white text-sm font-bold">Change Image</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-5">
                      <div className="w-20 h-20 rounded-3xl bg-slate-800 flex items-center justify-center mx-auto shadow-2xl group-hover/upload:scale-110 group-hover/upload:bg-indigo-500/20 transition-all duration-500">
                        <Upload className="h-10 w-10 text-indigo-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-white text-lg font-bold">Click or drag image</p>
                        <p className="text-slate-500 text-sm">PNG, JPG, WEBP up to 20MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Plan limit warning */}
              {!canCreate && (
                <Alert className="bg-amber-500/10 border-amber-500/20 rounded-2xl border-none shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/20 p-2 rounded-xl">
                      <Crown className="h-4 w-4 text-amber-500" />
                    </div>
                    <AlertDescription className="text-amber-200/90 text-sm font-medium">
                      Free limit reached (3/3). <button onClick={() => setShowUpgradeModal(true)} className="text-white font-bold underline hover:text-amber-400 transition-colors">Upgrade to Pro</button>
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          </div>

          <div className="p-8 bg-slate-950/50 border-t border-white/5 flex flex-col sm:flex-row justify-end gap-4">
            <Button 
              variant="ghost" 
              onClick={handleClose} 
              className="rounded-full px-8 text-slate-400 hover:text-white hover:bg-white/5 font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateProject}
              disabled={isUploading || !selectedFile || !projectTitle.trim() || !canCreate}
              className="rounded-full px-12 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-xl shadow-indigo-500/20 min-w-[180px] border-none transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isUploading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Restore Image</span>
                </div>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        restrictedTool="projects"
        reason="Free plan is limited to 3 projects. Upgrade to Pro for unlimited projects and access to all AI editing tools."
      />
    </>
  );
}
