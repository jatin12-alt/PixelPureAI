"use client";

import { useRouter } from "next/navigation";
import ProjectCard from "./project-card";

export function ProjectGrid({ projects }) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {projects.map((project) => (
        <ProjectCard
          key={project._id}
          project={project}
          onEdit={() => router.push(`/editor/${project._id}`)}
        />
      ))}
    </div>
  );
}
