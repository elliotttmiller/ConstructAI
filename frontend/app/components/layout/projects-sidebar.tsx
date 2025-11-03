"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { ChevronLeft, ChevronRight, Search, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { useIsMobile } from "@/app/lib/utils/responsive";

interface ProjectsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
  onCreateProject?: () => void;
  onSearch?: (query: string) => void;
}

export function ProjectsSidebar({
  isCollapsed,
  onToggle,
  children,
  onCreateProject,
  onSearch,
}: ProjectsSidebarProps) {
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}

      {/* Floating Toggle Button - Visible when collapsed */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className={cn(
            "fixed left-4 top-24 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-surface shadow-lg hover:bg-neutral-50 hover:shadow-xl transition-all",
            isMobile && "top-20"
          )}
          aria-label="Open sidebar"
        >
          <ChevronRight className="h-5 w-5 text-neutral-600" />
        </button>
      )}

      <aside
        className={cn(
          "relative flex flex-col bg-surface border-r border-neutral-200 transition-all duration-300 ease-in-out",
          // Desktop behavior
          "lg:relative lg:z-auto",
          isCollapsed ? "w-0" : "w-80",
          // Mobile behavior - overlay
          isMobile && !isCollapsed && "fixed inset-y-0 left-0 z-50 w-80 shadow-xl"
        )}
        style={{ flexShrink: 0 }}
      >
        {/* Toggle Button - Inside sidebar when open */}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className={cn(
              "absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-surface shadow-md hover:bg-neutral-50 transition-colors",
              isMobile && "right-4 top-4"
            )}
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4 text-neutral-600" />
          </button>
        )}

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
              <Button 
                size="sm" 
                variant="ghost" 
                aria-label="Create new project"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateProject?.();
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
                className="w-full rounded-lg border border-neutral-200 bg-background py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Projects List */}
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </div>
      </aside>
    </>
  );
}
