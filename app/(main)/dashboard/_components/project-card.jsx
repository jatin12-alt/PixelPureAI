import React from "react";
import { Download, Trash2, Eye, Calendar, MoreHorizontal, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function ProjectCard({ project, onEdit }) {
  const { mutate: deleteProject, isLoading: isDeleting } = useConvexMutation(
    api.projects.deleteProject
  );

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const originalUrl = (typeof project.originalImageUrl === 'string' ? project.originalImageUrl : project.originalImageUrl?.url) || null;
  const thumbnailUrl = (typeof project.thumbnailUrl === 'string' ? project.thumbnailUrl : project.thumbnailUrl?.url) || null;
  
  // Robust URL reconstruction to avoid double question marks
  let restoredUrl = originalUrl;
  if (originalUrl && originalUrl.includes("ik.imagekit.io")) {
    const [baseUrl, queryString] = originalUrl.split("?");
    const params = new URLSearchParams(queryString || "");
    params.set("tr", "e-restore,q-100,e-upscale-2");
    restoredUrl = `${baseUrl}?${params.toString()}`;
  }

  const handleDownload = async (e) => {
    e.stopPropagation();
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

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = confirm(
      `Are you sure you want to delete "${project.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      try {
        await deleteProject({ projectId: project._id });
        toast.success("Project deleted successfully");
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.error("Failed to delete project. Please try again.");
      }
    }
  };

  // Logic preserved ✓ | UI updated ✓
  return (
    <motion.div 
      onClick={onEdit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-bg-secondary border border-border rounded-2xl overflow-hidden hover:border-accent transition-all duration-300 cursor-pointer shadow-lg"
    >
      {/* Thumbnail Area */}
      <div className="aspect-4/3 relative overflow-hidden bg-bg-tertiary">
        {thumbnailUrl || originalUrl ? (
          <img
            src={thumbnailUrl || originalUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-bg-tertiary to-bg-secondary">
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="h-10 w-10 text-text-subtle" />
              <span className="text-[10px] text-text-subtle uppercase tracking-widest font-bold">No Preview</span>
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-xs flex items-center justify-center gap-4">
          <Button 
            size="sm"
            onClick={onEdit}
            className="rounded-full bg-accent text-white font-bold px-6 border-none shadow-xl hover:scale-105 transition-transform"
          >
            Open in Studio
          </Button>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 bg-bg-secondary border-t border-border">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-bold text-sm text-text-primary truncate mb-1.5 group-hover:text-accent transition-colors">
              {project.title || "Untitled Project"}
            </h3>
            <div className="flex items-center gap-1.5 text-text-muted">
              <Calendar className="h-3 w-3" />
              <span className="text-[11px] font-medium">{lastUpdated}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 rounded-full text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
