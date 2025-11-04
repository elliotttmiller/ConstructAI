"use client";

import * as React from "react";
import { cn, formatCurrency } from "@/app/lib/utils";
import { MoreVertical, Folder, Edit, Copy, Archive, Trash2 } from "lucide-react";
import type { Project } from "@/app/lib/types";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onClick?: () => void;
  onAction?: (action: string, project: Project) => void;
}

export function ProjectCard({ project, isSelected, onClick, onAction }: ProjectCardProps) {
  const handleAction = (action: string) => {
    onAction?.(action, project);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex h-20 w-full cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 bg-white p-3 card-hover animate-fade-in-scale",
        isSelected && "border-primary bg-primary/5 shadow-md ring-2 ring-primary/20"
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
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-primary animate-fade-in"></div>
      )}

      {/* Avatar/Icon Section (20%) */}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-300">
        <Folder className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
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
      <div className="flex shrink-0 items-center gap-2">
        <div
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium transition-all duration-200 hover-scale-sm",
            project.status === "in_progress" && "bg-info/10 text-info",
            project.status === "completed" && "bg-success/10 text-success",
            project.status === "planning" && "bg-warning/10 text-warning",
            project.status === "on_hold" && "bg-neutral-200 text-neutral-600",
            project.status === "archived" && "bg-neutral-300 text-neutral-700"
          )}
        >
          {project.status.replace("_", " ")}
        </div>
        
        <DropdownMenu
          trigger={
            <button
              className="rounded p-1 hover:bg-neutral-100 hover-scale transition-all duration-200"
              aria-label="More options"
            >
              <MoreVertical className="h-4 w-4 text-neutral-600" />
            </button>
          }
        >
          <DropdownMenuItem onClick={() => handleAction("edit")}>
            <Edit className="h-4 w-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("duplicate")}>
            <Copy className="h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("archive")}>
            <Archive className="h-4 w-4" />
            Archive
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleAction("delete")} variant="danger">
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenu>
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
