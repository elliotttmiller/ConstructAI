"use client";

import * as React from "react";
import { useState } from "react";
import { TopBar } from "./components/layout/top-bar";
import { ProjectsSidebar } from "./components/layout/projects-sidebar";
import { AIStudio } from "./components/layout/ai-studio";
import { ProjectCard, ProjectCardSkeleton } from "./components/data/project-card";
import { ProjectAnalysisView } from "./components/data/project-analysis-view";
import { EmptyState } from "./components/ui/empty-state";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { CreateProjectModal } from "./components/data/create-project-modal";
import { EditProjectModal } from "./components/data/edit-project-modal";
import { ConfirmationDialog } from "./components/ui/confirmation-dialog";
import { FolderPlus, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./lib/api/client";
import { useSidebarState } from "./lib/utils/responsive";
import { Button } from "./components/ui/button";
import type { Project } from "./lib/types";

export default function Home() {
  const { isCollapsed, setIsCollapsed, isMobile } = useSidebarState();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"overview" | "analysis">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  
  const queryClient = useQueryClient();

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

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: { name: string; description: string; budget: number }) => {
      return await apiClient.createProject({
        name: projectData.name,
        description: projectData.description,
        budget: projectData.budget,
        status: "planning",
        total_tasks: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: (newProject) => {
      // Invalidate and refetch projects
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      // Select the new project
      setSelectedProjectId(newProject.id);
      console.log("Project created successfully:", newProject);
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please make sure the backend is running.");
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      return await apiClient.updateProject(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
    onError: (error) => {
      console.error("Failed to update project:", error);
      throw error;
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.deleteProject(id);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      if (selectedProjectId === deletedId) {
        setSelectedProjectId(null);
      }
    },
    onError: (error) => {
      console.error("Failed to delete project:", error);
      throw error;
    },
  });

  // Duplicate project mutation
  const duplicateProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.duplicateProject(id);
    },
    onSuccess: (duplicatedProject) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedProjectId(duplicatedProject.id);
      alert(`Project duplicated: ${duplicatedProject.name}`);
    },
    onError: (error) => {
      console.error("Failed to duplicate project:", error);
      alert("Failed to duplicate project.");
    },
  });

  // Archive project mutation
  const archiveProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiClient.archiveProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      alert("Project archived successfully!");
    },
    onError: (error) => {
      console.error("Failed to archive project:", error);
      alert("Failed to archive project.");
    },
  });

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  // Filter projects based on search query
  const filteredProjects = React.useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    
    const query = searchQuery.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setViewMode("overview");
    // Auto-collapse sidebar on mobile after selection
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateProjectSubmit = async (projectData: {
    name: string;
    description: string;
    budget: number;
  }) => {
    await createProjectMutation.mutateAsync(projectData);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
  };

  const handleEditProjectSubmit = async (projectData: {
    name: string;
    description: string;
    budget: number;
  }) => {
    if (!editingProject) return;
    await updateProjectMutation.mutateAsync({
      id: editingProject.id,
      data: projectData,
    });
  };

  const handleDeleteProject = (project: Project) => {
    setDeletingProject(project);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProject) return;
    await deleteProjectMutation.mutateAsync(deletingProject.id);
  };

  const handleDuplicateProject = async (projectId: string) => {
    await duplicateProjectMutation.mutateAsync(projectId);
  };

  const handleArchiveProject = async (projectId: string) => {
    await archiveProjectMutation.mutateAsync(projectId);
  };

  const handleProjectOptions = (action: string, project: Project) => {
    switch (action) {
      case "edit":
        handleEditProject(project);
        break;
      case "duplicate":
        handleDuplicateProject(project.id);
        break;
      case "archive":
        handleArchiveProject(project.id);
        break;
      case "delete":
        handleDeleteProject(project);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  };

  return (
    <ErrorBoundary>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Application Bar */}
        <TopBar />

        {/* Create Project Modal */}
        <CreateProjectModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSubmit={handleCreateProjectSubmit}
        />

        {/* Edit Project Modal */}
        <EditProjectModal
          open={!!editingProject}
          onOpenChange={(open) => !open && setEditingProject(null)}
          project={editingProject || undefined}
          onSubmit={handleEditProjectSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={!!deletingProject}
          onOpenChange={(open) => !open && setDeletingProject(null)}
          title="Delete Project"
          description={`Are you sure you want to delete "${deletingProject?.name}"? This action cannot be undone.`}
          confirmLabel="Delete Project"
          onConfirm={handleConfirmDelete}
        />

        {/* Two-Panel Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Projects Sidebar */}
          <ProjectsSidebar
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed(!isCollapsed)}
            onCreateProject={handleCreateProject}
            onSearch={handleSearch}
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
                  onClick: handleCreateProject,
                }}
              />
            )}

            {/* Projects List */}
            {!isLoading && !error && projects && projects.length > 0 && (
              <div className="space-y-3">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      isSelected={selectedProjectId === project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      onAction={handleProjectOptions}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Search}
                    title="No Matches"
                    description={`No projects found matching "${searchQuery}"`}
                  />
                )}
              </div>
            )}
          </ProjectsSidebar>

          {/* Right Panel - AI Studio or Analysis View */}
          <main className="flex-1 overflow-y-auto bg-background p-6">
            {selectedProject && viewMode === "analysis" ? (
              <ProjectAnalysisView
                project={selectedProject}
                onBack={() => setViewMode("overview")}
              />
            ) : selectedProject ? (
              <AIStudio
                projectId={selectedProjectId || undefined}
                projectName={selectedProject?.name}
              />
            ) : (
              <div className="flex h-full items-center justify-center animate-fade-in">
                <div className="max-w-md text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-primary/10 to-primary/20 animate-pulse-soft">
                    <FolderPlus className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="mb-4 text-2xl font-bold text-foreground text-gradient">
                    Welcome to ConstructAI
                  </h2>
                  <p className="mb-8 text-neutral-600">
                    Create a new project to start analyzing construction documents, optimizing workflows, and managing your projects with AI-powered insights.
                  </p>
                  <Button size="lg" onClick={handleCreateProject} className="hover-lift">
                    <FolderPlus className="mr-2 h-5 w-5" />
                    Create New Project
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

