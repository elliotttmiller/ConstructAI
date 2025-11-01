"use client";

import * as React from "react";
import { cn, formatRelativeTime, formatCurrency } from "@/app/lib/utils";
import { MoreVertical, Folder } from "lucide-react";
import type { Project } from "@/app/lib/types";

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onClick?: () => void;
}

export function ProjectCard({ project, isSelected, onClick }: ProjectCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex h-20 w-full cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-surface p-3 transition-all hover:border-primary hover:shadow-md",
        isSelected && "border-primary bg-primary/5 shadow-md"
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* Left Accent Border for Selection */}
      {isSelected && (
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-primary"></div>
      )}

      {/* Avatar/Icon Section (20%) */}
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Folder className="h-6 w-6 text-primary" />
      </div>

      {/* Content Section (60%) */}
      <div className="flex flex-1 flex-col justify-center overflow-hidden">
        <h3 className="truncate text-sm font-semibold text-foreground">
          {project.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-neutral-600">
          <span>{project.total_tasks} tasks</span>
          <span>•</span>
          <span>{formatCurrency(project.budget)}</span>
        </div>
      </div>

      {/* Actions Section (20%) */}
      <div className="flex flex-shrink-0 items-center gap-2">
        <div
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            project.status === "in_progress" && "bg-info/10 text-info",
            project.status === "completed" && "bg-success/10 text-success",
            project.status === "planning" && "bg-warning/10 text-warning",
            project.status === "on_hold" && "bg-neutral-200 text-neutral-600"
          )}
        >
          {project.status.replace("_", " ")}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Handle actions menu
          }}
          className="opacity-0 transition-opacity group-hover:opacity-100"
          aria-label="More options"
        >
          <MoreVertical className="h-4 w-4 text-neutral-600" />
        </button>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for ProjectCard
 */
export function ProjectCardSkeleton() {
  return (
    <div className="flex h-20 w-full items-center gap-3 rounded-lg border border-neutral-200 bg-surface p-3">
      <div className="h-12 w-12 animate-pulse rounded-lg bg-neutral-200"></div>
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200"></div>
        <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-200"></div>
      </div>
      <div className="h-6 w-16 animate-pulse rounded-full bg-neutral-200"></div>
    </div>
  );
}
