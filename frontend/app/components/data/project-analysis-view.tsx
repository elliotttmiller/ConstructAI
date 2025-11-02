"use client";

import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  AIProcessingCard,
  useAIAnalysis,
} from "../data/ai-processing-card";
import { MetricCard } from "../data/metric-card";
import {
  Activity,
  DollarSign,
  Calendar,
  Users,
  Download,
  ArrowLeft,
  Play,
} from "lucide-react";
import type { Project, AuditResult, OptimizationResult } from "@/app/lib/types";

interface ProjectAnalysisViewProps {
  project: Project;
  onBack?: () => void;
}

export function ProjectAnalysisView({
  project,
  onBack,
}: ProjectAnalysisViewProps) {
  const { isAnalyzing, steps, overallProgress, startAnalysis } = useAIAnalysis();
  const [analysisResults] = useState<{
    audit?: AuditResult;
    optimization?: OptimizationResult;
  } | null>(null);

  const handleAnalyze = async () => {
    try {
      await startAnalysis();
      // TODO: Integrate with real API to fetch results
    } catch (error) {
      console.error("Analysis failed:", error);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-sm text-neutral-600">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            <Play className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Start Analysis"}
          </Button>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={DollarSign}
          label="Budget"
          value={`$${(project.budget / 1000000).toFixed(1)}M`}
          color="primary"
        />
        <MetricCard
          icon={Activity}
          label="Tasks"
          value={project.total_tasks}
          color="info"
        />
        <MetricCard
          icon={Calendar}
          label="Duration"
          value="365 days"
          color="warning"
        />
        <MetricCard
          icon={Users}
          label="Resources"
          value="24"
          color="success"
        />
      </div>

      {/* AI Processing */}
      {(isAnalyzing || overallProgress > 0) && (
        <AIProcessingCard
          steps={steps}
          overallProgress={overallProgress}
          isProcessing={isAnalyzing}
        />
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Audit Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {analysisResults.audit?.overall_score || 0}/100
                  </div>
                  <p className="text-sm text-neutral-600">Overall Score</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-error">
                      {analysisResults.audit?.risks.length || 0}
                    </div>
                    <div className="text-neutral-600">Risks</div>
                  </div>
                  <div>
                    <div className="font-medium text-warning">
                      {analysisResults.audit?.compliance_issues.length || 0}
                    </div>
                    <div className="text-neutral-600">Compliance Issues</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-success">
                      {analysisResults.optimization?.summary.duration_reduction_days || 0}
                    </div>
                    <div className="text-neutral-600">Days Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success">
                      ${(analysisResults.optimization?.summary.cost_savings || 0).toLocaleString()}
                    </div>
                    <div className="text-neutral-600">Cost Savings</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-neutral-600">
                Status
              </label>
              <p className="mt-1 text-sm text-foreground capitalize">
                {project.status.replace("_", " ")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-600">
                Budget
              </label>
              <p className="mt-1 text-sm text-foreground">
                ${project.budget.toLocaleString()}
              </p>
            </div>
            {project.start_date && (
              <div>
                <label className="text-sm font-medium text-neutral-600">
                  Start Date
                </label>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(project.start_date).toLocaleDateString()}
                </p>
              </div>
            )}
            {project.target_end_date && (
              <div>
                <label className="text-sm font-medium text-neutral-600">
                  Target End Date
                </label>
                <p className="mt-1 text-sm text-foreground">
                  {new Date(project.target_end_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
