import { Download, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function ProjectCard({ project, onEdit }) {
  const { mutate: deleteProject, isLoading: isDeleting } = useConvexMutation(
    api.projects.deleteProject
  );

  const lastUpdated = formatDistanceToNow(new Date(project.updatedAt), {
    addSuffix: true,
  });

  const originalUrl = project.originalImageUrl;
  const restoredUrl = originalUrl.includes("ik.imagekit.io")
    ? `${originalUrl}?tr=e-restore,q-100,e-upscale-2`
    : originalUrl;

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

  return (
    <Card 
      onClick={onEdit}
      className="group relative bg-slate-900/40 border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10"
    >
      {/* Thumbnail Area */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {project.thumbnailUrl || project.originalImageUrl ? (
          <img
            src={project.thumbnailUrl || project.originalImageUrl}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <Eye className="h-10 w-10 text-slate-700" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <div className="flex gap-3">
            <Button 
              variant="primary" 
              size="icon" 
              onClick={handleDownload} 
              className="rounded-2xl h-12 w-12 bg-white text-slate-900 hover:bg-indigo-50 shadow-xl"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={handleDelete}
              className="rounded-2xl h-12 w-12 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white shadow-xl"
              disabled={isDeleting}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-white text-xs font-bold uppercase tracking-widest">Click to View</p>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-indigo-500 text-white border-none px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
            HD Restored
          </Badge>
        </div>
      </div>

      {/* Project Info */}
      <CardContent className="p-6">
        <h3 className="font-bold text-white text-lg mb-2 truncate group-hover:text-indigo-400 transition-colors">
          {project.title}
        </h3>

        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
          <Calendar className="h-3 w-3" />
          <span>{lastUpdated}</span>
        </div>
      </CardContent>
    </Card>
  );
}

