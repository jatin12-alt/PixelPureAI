"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Image as ImageIcon, Sparkles, Upload, History, Zap, FolderOpen, Layout, Coins, Star, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConvexQuery, useConvexMutation, useConvexPaginatedQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { useCredits } from "@/hooks/use-credits";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SettingsModal } from "@/components/settings-modal";

// Dynamically import ProjectGrid to improve dashboard load speed
const ProjectGrid = dynamic(() => import("./_components/project-grid").then(mod => mod.ProjectGrid), {
  loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse bg-white/5 rounded-3xl h-96" />
});

export default function DashboardPage() {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Get user's projects (Paginated)
  const { 
    results: projects, 
    isLoading: isProjectsLoading, 
    loadMore, 
    isDone, 
    isMoreLoading 
  } = useConvexPaginatedQuery(
    api.projects.getUserProjects,
    isSignedIn ? {} : "skip",
    { initialNumItems: 12 }
  );

  // Get user profile for plan info
  const { data: convexUser } = useConvexQuery(api.users.getCurrentUser, isSignedIn ? undefined : "skip");

  // Credits hook
  const { balance: creditBalance, isLoading: isCreditsLoading } = useCredits();

  // Mutations
  const { mutate: createProject } = useConvexMutation(api.projects.create);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Max 10MB allowed.");
      return;
    }

    setIsCreating(true);
    const toastId = toast.loading("Creating project...");

    try {
      // 1. Upload to ImageKit
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);

      const uploadRes = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();

      // 2. Create project in Convex
      const projectId = await createProject({
        title: file.name.split(".")[0] || "Untitled Project",
        originalImageUrl: uploadData.url,
        currentImageUrl: uploadData.url,
        width: uploadData.width || 0,
        height: uploadData.height || 0,
        canvasState: {},
      });

      toast.success("Project created!", { id: toastId });
      router.push(`/studio?projectId=${projectId}`);
    } catch (err) {
      console.error("Project creation error:", err);
      toast.error(err.message || "Failed to create project", { id: toastId });
    } finally {
      setIsCreating(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pt-8 pb-[calc(80px+env(safe-area-inset-bottom))] font-dm text-text-primary">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center justify-between w-full md:w-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-1"
            >
              <h1 className="text-4xl font-display font-extrabold tracking-tight bg-linear-to-r from-white to-text-muted bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-text-muted text-sm font-medium">
                Manage and enhance your visual library
              </p>
            </motion.div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden rounded-full hover:bg-white/5 text-text-muted"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden md:flex rounded-full hover:bg-white/5 text-text-muted mr-2"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isCreating}
              className="btn-primary h-12 px-8 font-bold uppercase tracking-widest text-xs rounded-full shadow-lg shadow-accent/20"
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              New Project
            </Button>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="image/*" 
            className="hidden" 
          />
        </header>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-12"
        >
          <div className="bg-bg-secondary/50 backdrop-blur-md border border-border rounded-full px-6 py-2.5 flex items-center gap-3 hover:border-accent/30 transition-colors">
            <Layout className="h-4 w-4 text-accent" />
            <span className="text-sm font-bold">{projects?.length || 0}</span>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Projects</span>
          </div>

          <div className="bg-bg-secondary/50 backdrop-blur-md border border-border rounded-full px-6 py-2.5 flex items-center gap-3 hover:border-accent/30 transition-colors">
            <Coins className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold">{isCreditsLoading ? "..." : creditBalance}</span>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Credits</span>
          </div>

          <div className="bg-bg-secondary/50 backdrop-blur-md border border-border rounded-full px-6 py-2.5 flex items-center gap-3 hover:border-accent/30 transition-colors">
            <Star className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-bold capitalize">{convexUser?.plan || "Free"}</span>
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Plan</span>
          </div>
        </motion.div>

        {/* Projects Grid Section */}
        <section className="min-h-100 mb-20">
          {isProjectsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-4/3 rounded-2xl bg-bg-secondary/50 animate-pulse border border-border" />
              ))}
            </div>
          ) : projects?.length > 0 ? (
            <>
              <ProjectGrid projects={projects} />
              
              {!isDone && (
                <div className="mt-12 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => loadMore(12)}
                    disabled={isMoreLoading}
                    className="rounded-full border-border hover:bg-bg-secondary px-8 font-bold uppercase tracking-widest text-xs h-14"
                  >
                    {isMoreLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading More...
                      </>
                    ) : (
                      "Load More Projects"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-border rounded-3xl bg-bg-secondary/20"
            >
              <div className="w-24 h-24 rounded-full bg-bg-tertiary border border-border flex items-center justify-center mb-6 shadow-2xl">
                <FolderOpen className="h-10 w-10 text-text-muted" />
              </div>
              <h3 className="text-2xl font-display font-bold text-text-primary mb-3 tracking-tight">No projects yet</h3>
              <p className="text-text-muted text-sm max-w-xs mb-10 leading-relaxed">
                Upload your first photo to start your journey with professional AI enhancements.
              </p>
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isCreating}
                className="btn-primary h-14 px-10 font-bold uppercase tracking-widest text-xs rounded-full shadow-xl"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5 mr-2" />
                )}
                Create First Project
              </Button>
            </motion.div>
          )}
        </section>
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
