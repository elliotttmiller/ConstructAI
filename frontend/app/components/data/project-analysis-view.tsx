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
  Upload as UploadIcon,
} from "lucide-react";
import type { Project, AuditResult, OptimizationResult, Risk, ComplianceIssue, Bottleneck, ResourceConflict } from "@/app/lib/types";
import { apiClient } from "@/app/lib/api/client";
import { DocumentUpload } from "./document-upload";

interface ProjectAnalysisViewProps {
  project: Project;
  onBack?: () => void;
}

export function ProjectAnalysisView({
  project,
  onBack,
}: ProjectAnalysisViewProps) {
  const { isAnalyzing, steps, overallProgress, startAnalysis } = useAIAnalysis();
  const [analysisResults, setAnalysisResults] = useState<{
    audit?: AuditResult;
    optimization?: OptimizationResult;
  } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleAnalyze = async () => {
    try {
      await startAnalysis();
      
      // Fetch real analysis results from API
      const result = await apiClient.analyzeProjectById(project.id, {
        tasks: [],
        resources: []
      });
      
      setAnalysisResults({
        audit: {
          overall_score: result.audit.overall_score,
          risks: result.audit.risks as Risk[],
          compliance_issues: result.audit.compliance_issues as ComplianceIssue[],
          bottlenecks: result.audit.bottlenecks as Bottleneck[],
          resource_conflicts: result.audit.resource_conflicts as ResourceConflict[],
        },
        optimization: {
          summary: {
            duration_reduction_days: result.optimization.duration_reduction_days,
            cost_savings: result.optimization.cost_savings,
            parallel_opportunities: result.optimization.parallel_opportunities,
            bottlenecks_resolved: result.optimization.bottlenecks_resolved,
          },
          optimized_project: project,
          optimizations_applied: result.optimization.optimizations_applied as Array<{
            type: "parallel_execution" | "bottleneck_removal" | "resource_balancing" | "cost_reduction";
            description: string;
            impact: string;
          }>
        }
      });
      
      alert(
        `Analysis Complete!\n\n` +
        `Overall Score: ${result.audit.overall_score}%\n` +
        `Cost Savings: $${result.optimization.cost_savings.toLocaleString()}\n` +
        `Time Reduction: ${result.optimization.duration_reduction_days} days`
      );
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const format = prompt("Choose export format:\n- json\n- pdf\n- excel", "json");
      
      if (!format || !["json", "pdf", "excel"].includes(format.toLowerCase())) {
        setIsExporting(false);
        return;
      }

      const result = await apiClient.exportProject(
        project.id, 
        format.toLowerCase() as "json" | "pdf" | "excel"
      );
      
      if (result.data) {
        // JSON export - download directly
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${project.name}-export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Export downloaded successfully!");
      } else if (result.download_url) {
        alert(`Export ready! Download URL: ${result.download_url}\n\n(Full file generation coming soon)`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export failed. Please try again.");
    } finally {
      setIsExporting(false);
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
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

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Project Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-neutral-600">
            Upload construction documents, contracts, or specifications to analyze with AI. Our system will automatically extract tasks, resources, and identify optimization opportunities.
          </p>
          <DocumentUpload
            projectId={project.id}
            onUploadComplete={(files) => {
              console.log("Upload complete:", files);
              alert(`${files.length} document(s) uploaded successfully! You can now analyze them.`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
