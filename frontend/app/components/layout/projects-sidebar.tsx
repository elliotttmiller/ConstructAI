"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Button } from "../ui/button";

interface ProjectsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export function ProjectsSidebar({
  isCollapsed,
  onToggle,
  children,
}: ProjectsSidebarProps) {
  return (
    <aside
      className={cn(
        "relative flex flex-col bg-surface border-r border-neutral-200 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-0" : "w-80"
      )}
      style={{ flexShrink: 0 }}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-surface shadow-md hover:bg-neutral-50 transition-colors"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 text-neutral-600" />
        ) : (
          <ChevronLeft className="h-4 w-4 text-neutral-600" />
        )}
      </button>

      {/* Sidebar Content */}
      <div
        className={cn(
          "flex h-full flex-col overflow-hidden transition-opacity duration-300",
          isCollapsed ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Projects</h2>
            <Button size="sm" variant="ghost" aria-label="Create new project">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full rounded-lg border border-neutral-200 bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {/* Footer */}
        <div className="border-t border-neutral-200 p-4">
          <div className="rounded-lg bg-neutral-50 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600">Storage</span>
              <span className="font-medium text-neutral-900">2.4 GB / 10 GB</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div className="h-full w-1/4 bg-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
