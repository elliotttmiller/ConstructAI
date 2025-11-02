"use client";

import * as React from "react";
import { Bell, Settings, User } from "lucide-react";
import { Button } from "../ui/button";

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 flex h-18 items-center justify-between border-b border-neutral-200 bg-surface px-6 shadow-sm">
      {/* Left Section - Logo & Navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">CA</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              ConstructAI
            </h1>
            <p className="text-xs text-neutral-600">
              Enterprise AI Construction Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Center Section - Status */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full bg-success/10 px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-success"></div>
          <span className="text-xs font-medium text-success">
            System Operational
          </span>
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" aria-label="User profile">
          <User className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
