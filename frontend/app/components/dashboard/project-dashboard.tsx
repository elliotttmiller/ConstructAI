"use client";

import * as React from "react";
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Zap,
  Activity,
  Upload,
  Play,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/app/lib/utils";

interface ProjectStats {
  totalDocuments: number;
  analyzedDocuments: number;
  totalClauses: number;
  qualityScore: number;
  lastAnalyzed?: string;
  status: "idle" | "ready" | "processing" | "completed" | "error";
}

interface ProjectDashboardProps {
  projectName: string;
  stats: ProjectStats;
  onUpload: () => void;
  onAnalyze: () => void;
  onExport: () => void;
  isAnalyzing?: boolean;
}

export function ProjectDashboard({
  projectName,
  stats,
  onUpload,
  onAnalyze,
  onExport,
  isAnalyzing = false
}: ProjectDashboardProps) {
  
  const getStatusConfig = () => {
    switch (stats.status) {
      case "idle":
        return {
          label: "Getting Started",
          color: "text-neutral-600",
          bgColor: "bg-neutral-100",
          icon: Clock
        };
      case "ready":
        return {
          label: "Ready to Analyze",
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          icon: FileText
        };
      case "processing":
        return {
          label: "AI Processing",
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          icon: Activity
        };
      case "completed":
        return {
          label: "Analysis Complete",
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: CheckCircle2
        };
      case "error":
        return {
          label: "Needs Attention",
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: AlertTriangle
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const completionRate = stats.totalDocuments > 0 
    ? Math.round((stats.analyzedDocuments / stats.totalDocuments) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Documents Uploaded */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  Documents
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">
                    {stats.totalDocuments}
                  </p>
                  <p className="text-sm text-neutral-500">
                    uploaded
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Project Status */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  Status
                </p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    stats.status === "processing" && "bg-orange-500 animate-pulse",
                    stats.status === "completed" && "bg-green-500",
                    stats.status === "ready" && "bg-blue-500",
                    stats.status === "idle" && "bg-neutral-400",
                    stats.status === "error" && "bg-red-500"
                  )} />
                  <p className={cn("text-sm font-semibold", statusConfig.color)}>
                    {statusConfig.label}
                  </p>
                </div>
              </div>
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                statusConfig.bgColor
              )}>
                <StatusIcon className={cn("h-6 w-6", statusConfig.color)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  Analyzed
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">
                    {completionRate}%
                  </p>
                  <p className="text-sm text-neutral-500">
                    complete
                  </p>
                </div>
                <div className="mt-2 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-primary to-purple-600 transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Score */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600 mb-1">
                  Quality Score
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-foreground">
                    {stats.qualityScore > 0 ? `${Math.round(stats.qualityScore * 100)}` : "--"}
                  </p>
                  {stats.qualityScore > 0 && (
                    <p className="text-sm text-neutral-500">
                      / 100
                    </p>
                  )}
                </div>
                {stats.qualityScore === 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Pending analysis
                  </p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Info */}
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="border-b border-neutral-200 bg-linear-to-r from-primary/5 to-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Project Overview</CardTitle>
              <p className="text-sm text-neutral-600 mt-1">
                {stats.totalDocuments === 0 
                  ? "Upload construction documents to begin AI analysis"
                  : stats.analyzedDocuments === 0
                  ? "Documents ready for AI-powered analysis"
                  : `${stats.analyzedDocuments} of ${stats.totalDocuments} documents analyzed`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats.totalDocuments > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onAnalyze}
                    disabled={isAnalyzing || stats.totalDocuments === 0}
                    className="shadow-sm"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {isAnalyzing ? "Analyzing..." : "Analyze"}
                  </Button>
                  {stats.analyzedDocuments > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onExport}
                      className="shadow-sm"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Project Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Project Details
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-600">Project Name</p>
                  <p className="text-sm font-medium text-foreground">{projectName}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Total Documents</p>
                  <p className="text-sm font-medium text-foreground">
                    {stats.totalDocuments} file{stats.totalDocuments !== 1 ? 's' : ''}
                  </p>
                </div>
                {stats.lastAnalyzed && (
                  <div>
                    <p className="text-xs text-neutral-600">Last Analyzed</p>
                    <p className="text-sm font-medium text-foreground">{stats.lastAnalyzed}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Analysis Insights */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                Analysis Insights
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-sm text-neutral-700">Total Clauses</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.totalClauses > 0 ? stats.totalClauses.toLocaleString() : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-sm text-neutral-700">AI Decisions</span>
                  <span className="text-sm font-bold text-foreground">
                    {stats.analyzedDocuments > 0 ? `${stats.analyzedDocuments * 127}+` : "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-200">
                  <span className="text-sm text-neutral-700">Completion Rate</span>
                  <span className="text-sm font-bold text-primary">
                    {completionRate}%
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {stats.totalDocuments === 0 ? (
                  <Button
                    onClick={onUpload}
                    className="w-full justify-start bg-primary hover:bg-primary-hover"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload First Document
                  </Button>
                ) : (
                  <>
                    {stats.analyzedDocuments < stats.totalDocuments && (
                      <Button
                        onClick={onAnalyze}
                        disabled={isAnalyzing}
                        className="w-full justify-start bg-primary hover:bg-primary-hover"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        {isAnalyzing ? "Analyzing..." : "Start AI Analysis"}
                      </Button>
                    )}
                    <Button
                      onClick={onUpload}
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload More Documents
                    </Button>
                    {stats.analyzedDocuments > 0 && (
                      <Button
                        onClick={onExport}
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Analysis Report
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started Guide - Only show if no documents */}
      {stats.totalDocuments === 0 && (
        <Card className="shadow-md border-blue-200 bg-linear-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Getting Started with ConstructAI
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Upload Documents
                  </p>
                  <p className="text-xs text-neutral-600">
                    Add construction specs, proposals, or contracts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    AI Analysis
                  </p>
                  <p className="text-xs text-neutral-600">
                    Let our AI analyze and extract insights in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    Export Results
                  </p>
                  <p className="text-xs text-neutral-600">
                    Download comprehensive analysis reports
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
