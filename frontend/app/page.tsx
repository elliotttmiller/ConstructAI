"use client";

import * as React from "react";
import { useState } from "react";
import { TopBar } from "./components/layout/top-bar";
import { ProjectsSidebar } from "./components/layout/projects-sidebar";
import { AIStudio } from "./components/layout/ai-studio";
import { ProjectCard, ProjectCardSkeleton } from "./components/data/project-card";
import { EmptyState } from "./components/ui/empty-state";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { FolderPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./lib/api/client";

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Fetch projects from API - ZERO MOCK DATA
  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      try {
        return await apiClient.getProjects();
      } catch (err) {
        // Return empty array if API is not available yet
        console.warn("Projects API not available:", err);
        return [];
      }
    },
  });

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Application Bar */}
        <TopBar />

        {/* Two-Panel Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Projects Sidebar */}
          <ProjectsSidebar
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <EmptyState
                title="Unable to Load Projects"
                description="There was an error loading your projects. Please check your connection and try again."
                action={{
                  label: "Retry",
                  onClick: () => window.location.reload(),
                }}
              />
            )}

            {/* Empty State */}
            {!isLoading && !error && projects?.length === 0 && (
              <EmptyState
                icon={FolderPlus}
                title="No Projects Yet"
                description="Create your first project to start optimizing your construction workflow with AI."
                action={{
                  label: "Create Project",
                  onClick: () => {
                    // TODO: Implement create project flow
                    console.log("Create project");
                  },
                }}
              />
            )}

            {/* Projects List */}
            {!isLoading && !error && projects && projects.length > 0 && (
              <div className="space-y-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProjectId === project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                  />
                ))}
              </div>
            )}
          </ProjectsSidebar>

          {/* Right Panel - AI Studio */}
          <AIStudio
            projectId={selectedProjectId || undefined}
            projectName={selectedProject?.name}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

