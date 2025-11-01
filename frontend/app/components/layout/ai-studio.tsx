"use client";

import * as React from "react";
import { cn } from "@/app/lib/utils";
import { Play, Download, Settings, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AIStudioProps {
  projectId?: string;
  projectName?: string;
}

export function AIStudio({ projectId, projectName }: AIStudioProps) {
  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-surface px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {projectName || "AI Project Studio"}
            </h2>
            <p className="text-xs text-neutral-600">
              {projectId
                ? "Analyze and optimize your construction workflow"
                : "Select a project to begin analysis"}
            </p>
          </div>
        </div>

        {projectId && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
              Configure
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4" />
              Analyze
            </Button>
          </div>
        )}
      </div>

      {/* Studio Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {projectId ? (
          <div className="space-y-6">
            {/* Analysis Workspace */}
            <Card>
              <CardHeader>
                <CardTitle>Project Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-center">
                  <div>
                    <Sparkles className="mx-auto mb-4 h-12 w-12 text-primary" />
                    <h3 className="mb-2 text-lg font-semibold">
                      Ready for AI Analysis
                    </h3>
                    <p className="mb-4 text-sm text-neutral-600">
                      Click "Analyze" to start comprehensive project audit and
                      optimization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Project Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-success">95%</div>
                  <p className="text-xs text-neutral-600">Overall Score</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Schedule Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">On Track</div>
                  <p className="text-xs text-neutral-600">No delays detected</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Budget Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">87%</div>
                  <p className="text-xs text-neutral-600">Utilized</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Sparkles className="mx-auto mb-4 h-16 w-16 text-neutral-300" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">
                No Project Selected
              </h3>
              <p className="text-sm text-neutral-600">
                Select a project from the sidebar to begin AI-powered analysis
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
