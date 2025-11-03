"use client";

import * as React from "react";
import { useState } from "react";
import { Play, Download, Settings, Sparkles, CheckCircle2, Upload, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { apiClient } from "@/app/lib/api/client";
import { ConfigurationModal } from "../data/configuration-modal";
import { DocumentUpload } from "../data/document-upload";
import type { ProjectConfig } from "@/app/lib/types";

interface AIStudioProps {
  projectId?: string;
  projectName?: string;
}

export function AIStudio({ projectId, projectName }: AIStudioProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ProjectConfig | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ id: string; name: string; size: number }>>([]);
  const [analysisResults, setAnalysisResults] = useState<{
    audit: {
      overall_score: number;
      risks: unknown[];
      compliance_issues: unknown[];
      bottlenecks: unknown[];
      resource_conflicts: unknown[];
    };
    optimization: {
      duration_reduction_days: number;
      cost_savings: number;
      parallel_opportunities: number;
      bottlenecks_resolved: number;
      optimizations_applied: unknown[];
    };
  } | null>(null);

  const handleConfigure = async () => {
    if (!projectId) {
      alert("Please select a project first");
      return;
    }

    try {
      const config = await apiClient.getProjectConfig(projectId);
      console.log("Project configuration:", config);
      setCurrentConfig(config.config as ProjectConfig);
      setConfigModalOpen(true);
    } catch (error) {
      console.error("Failed to get configuration:", error);
      alert("Failed to load configuration");
    }
  };

  const handleConfigSubmit = async (config: ProjectConfig) => {
    if (!projectId) return;

    try {
      await apiClient.updateProjectConfig(projectId, { config });
      setCurrentConfig(config);
      alert("Configuration updated successfully!");
    } catch (error) {
      console.error("Failed to update configuration:", error);
      throw error; // Let modal handle the error
    }
  };

  const handleExport = async () => {
    if (!projectId) {
      alert("Please select a project first");
      return;
    }

    try {
      // Let user choose format
      const format = prompt("Choose export format:\n- json\n- pdf\n- excel", "json");
      
      if (!format || !["json", "pdf", "excel"].includes(format.toLowerCase())) {
        return;
      }

      const result = await apiClient.exportProject(
        projectId, 
        format.toLowerCase() as "json" | "pdf" | "excel"
      );
      console.log("Export result:", result);
      
      if (result.data) {
        // JSON export - download directly
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName || "project"}-export.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Export downloaded successfully!");
      } else if (result.download_url) {
        alert(`Export ready! Download URL: ${result.download_url}\n\n(Full file generation coming soon)`);
      }
    } catch (error) {
      console.error("Failed to export:", error);
      alert("Failed to export project");
    }
  };

  const handleAnalyze = async () => {
    if (!projectId) {
      alert("Please select a project first");
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log("Starting AI analysis for project:", projectId);
      
      const result = await apiClient.analyzeProjectById(projectId, {
        tasks: [],
        resources: []
      });
      
      console.log("Analysis complete:", result);
      setAnalysisResults(result);
      
      alert(
        `Analysis Complete!\n\n` +
        `Overall Score: ${result.audit.overall_score}%\n` +
        `Cost Savings: $${result.optimization.cost_savings.toLocaleString()}\n` +
        `Time Reduction: ${result.optimization.duration_reduction_days} days\n` +
        `Parallel Opportunities: ${result.optimization.parallel_opportunities}\n\n` +
        `Detailed results displayed in console.`
      );
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("AI Analysis failed. Please check console for details.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-neutral-200 bg-surface px-8 py-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/60 shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {projectName || "AI Project Studio"}
            </h2>
            <p className="text-sm text-neutral-600">
              {projectId
                ? "Analyze and optimize your construction workflow"
                : "Select a project to begin analysis"}
            </p>
          </div>
        </div>

        {projectId && (
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowUpload(true)}
              className="shadow-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleConfigure}
              className="shadow-sm"
            >
              <Settings className="mr-2 h-4 w-4" />
              Configure
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              className="shadow-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-linear-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-shadow"
            >
              <Play className="mr-2 h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        )}
      </div>

      {/* Studio Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {projectId ? (
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Analysis Results */}
            {analysisResults && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-lg border-success/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      Audit Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <p className="text-5xl font-bold text-success">
                          {analysisResults.audit.overall_score}%
                        </p>
                        <p className="mt-1 text-sm text-neutral-600">Overall Score</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {analysisResults.audit.risks.length}
                          </p>
                          <p className="text-xs text-neutral-600">Risks Found</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {analysisResults.audit.compliance_issues.length}
                          </p>
                          <p className="text-xs text-neutral-600">Compliance Issues</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-primary/20">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <Sparkles className="h-5 w-5" />
                      Optimization Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-3xl font-bold text-success">
                          {analysisResults.optimization.duration_reduction_days}
                        </p>
                        <p className="text-xs text-neutral-600">Days Saved</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-success">
                          ${analysisResults.optimization.cost_savings.toLocaleString()}
                        </p>
                        <p className="text-xs text-neutral-600">Cost Savings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {analysisResults.optimization.parallel_opportunities}
                        </p>
                        <p className="text-xs text-neutral-600">Parallel Tasks</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-primary">
                          {analysisResults.optimization.bottlenecks_resolved}
                        </p>
                        <p className="text-xs text-neutral-600">Bottlenecks Fixed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Analysis Workspace */}
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Project Analysis</span>
                  {!showUpload && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowUpload(true)}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Documents
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showUpload ? (
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        Upload Project Documents
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowUpload(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    <DocumentUpload
                      projectId={projectId}
                      onUploadComplete={(files) => {
                        console.log("Documents uploaded:", files);
                        // Add uploaded documents to the list
                        const newDocs = files.map((f) => ({
                          id: `${Date.now()}-${Math.random()}`,
                          name: f.name,
                          size: f.size,
                        }));
                        setUploadedDocs((prev) => [...prev, ...newDocs]);
                        alert(`${files.length} document(s) uploaded successfully!`);
                        setShowUpload(false);
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-16 text-center">
                    <div>
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/60">
                        <Sparkles className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-foreground">
                        Ready for AI Analysis
                      </h3>
                      <p className="mb-6 text-sm text-neutral-600 max-w-md mx-auto">
                        Upload project documents to analyze, or click &ldquo;Analyze&rdquo; to audit the current project
                      </p>
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setShowUpload(true)}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload Documents
                        </Button>
                        <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                          <Play className="mr-2 h-4 w-4" />
                          {isAnalyzing ? "Analyzing..." : "Analyze Project"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Uploaded Documents Section */}
            {uploadedDocs.length > 0 && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Documents ({uploadedDocs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uploadedDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between rounded-lg border border-neutral-200 bg-surface p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              {doc.name}
                            </p>
                            <p className="text-xs text-neutral-600">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
                <Sparkles className="h-12 w-12 text-neutral-400" />
              </div>
              <h3 className="mb-2 text-2xl font-semibold text-foreground">
                No Project Selected
              </h3>
              <p className="text-neutral-600">
                Select a project from the sidebar to begin AI-powered analysis
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {projectId && (
        <ConfigurationModal
          open={configModalOpen}
          onOpenChange={setConfigModalOpen}
          initialConfig={currentConfig || undefined}
          onSubmit={handleConfigSubmit}
        />
      )}
    </main>
  );
}
