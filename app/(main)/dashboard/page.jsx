"use client";

import React, { useState } from "react";
import { Plus, Image, Sparkles, Upload, History, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConvexQuery } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { NewProjectModal } from "./_components/new-project-modal";
import { ProjectGrid } from "./_components/project-grid";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const { user } = useUser();

  // Get user's projects
  const { data: projects, isLoading } = useConvexQuery(
    api.projects.getUserProjects
  );

  // Mock credit balance for now
  const creditBalance = 10;

  return (
    <div className="min-h-screen bg-slate-950 pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Hello, <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">{user?.firstName || "Creator"}</span>!
            </h1>
            <p className="text-slate-400 text-lg">
              Ready to restore your memories today?
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl">
            <div className="bg-indigo-500/10 p-2 rounded-xl">
              <Zap className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase font-bold tracking-wider">Credits Remaining</p>
              <p className="text-2xl font-bold text-white">{creditBalance}</p>
            </div>
            <Button variant="primary" size="sm" className="ml-4 rounded-full px-4 h-9 text-xs">
              Refill
            </Button>
          </div>
        </div>

        {/* Upload Zone Section */}
        <div className="mb-20">
          <div 
            onClick={() => setShowNewProjectModal(true)}
            className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-slate-900/40 border-2 border-dashed border-white/10 hover:border-indigo-500/50 transition-all duration-500"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-24 h-24 rounded-3xl bg-slate-800 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500 shadow-2xl">
                <Upload className="h-10 w-10 text-indigo-400" />
              </div>
              
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors">
                Drop your photo here
              </h3>
              
              <p className="text-slate-400 text-lg max-w-md mb-8">
                Or click to browse from your device. Support for PNG, JPG up to 20MB.
              </p>
              
              <Button size="xl" className="rounded-full px-12 bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-500/20">
                <Sparkles className="h-5 w-5 mr-2" />
                Restore Now
              </Button>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/10 p-2 rounded-xl">
                <History className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Recent Projects</h2>
            </div>
            {projects?.length > 0 && (
              <p className="text-slate-500 text-sm font-medium">{projects.length} files found</p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square rounded-3xl bg-slate-900/50 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <ProjectGrid projects={projects} />
          ) : (
            <EmptyState />
          )}
        </div>

        {/* New Project Modal */}
        <NewProjectModal
          isOpen={showNewProjectModal}
          onClose={() => setShowNewProjectModal(false)}
        />
      </div>
    </div>
  );
}

// Empty state when user has no projects
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
        <Image className="h-10 w-10 text-slate-700" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">
        No projects yet
      </h3>

      <p className="text-slate-500 mb-8 max-w-xs">
        Your restored photos will appear here once you upload them.
      </p>
    </div>
  );
}

