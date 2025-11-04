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
import type { Project, AuditResult, OptimizationResult, Risk, ComplianceIssue, Bottleneck, ResourceConflict, AutonomousUploadResult } from "@/app/lib/types";
import { apiClient } from "@/app/lib/api/client";
import { DocumentUpload } from "./document-upload";
import { AutonomousAnalysisViewer } from "./autonomous-analysis-viewer";

interface DocumentAnalysis {
  sections: number;
  clauses_extracted: number;
  divisions_found: Record<string, number>;
  sample_clauses: unknown[];
  ner_analysis: unknown[];
}

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
  const [autonomousResult, setAutonomousResult] = useState<AutonomousUploadResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ documentId: string; filename: string }>>([]);
  const [isAnalyzingDocuments, setIsAnalyzingDocuments] = useState(false);

  const handleAnalyze = async () => {
    try {
      await startAnalysis();
      
      // Fetch real analysis results from API
      const result = await apiClient.analyzeProjectById(project.id, {
        tasks: [],
        resources: []
      });
      
      // Extract metrics from new structure
      const metrics = result.optimization?.metrics_comparison?.improvements || {
        duration_reduction_days: 0,
        cost_savings: 0,
        duration_reduction_percent: 0,
        cost_savings_percent: 0
      };
      
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
            duration_reduction_days: metrics.duration_reduction_days,
            cost_savings: metrics.cost_savings,
            parallel_opportunities: result.optimization.improvements?.length || 0,
            bottlenecks_resolved: result.audit.bottlenecks?.length || 0,
          },
          optimized_project: project,
          optimizations_applied: (result.optimization.improvements || []).map(imp => ({
            type: "parallel_execution" as const,
            description: imp.description || "",
            impact: imp.impact || ""
          }))
        }
      });
      
      alert(
        `Analysis Complete!\n\n` +
        `Overall Score: ${result.audit.overall_score}%\n` +
        `Cost Savings: $${metrics.cost_savings.toLocaleString()}\n` +
        `Time Reduction: ${metrics.duration_reduction_days} days`
      );
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try again.");
    }
  };

  const handleAnalyzeDocuments = async () => {
    if (uploadedDocuments.length === 0) {
      alert("Please upload documents first before analyzing.");
      return;
    }

    setIsAnalyzingDocuments(true);
    
    try {
      // Analyze each uploaded document
      for (const doc of uploadedDocuments) {
        console.log(`Starting AI analysis for document ${doc.documentId}...`);
        
        const result = await apiClient.analyzeDocument(project.id, doc.documentId);
        
        console.log(`Analysis complete for ${doc.filename}:`, result);
        
        // Store the latest analysis result
        if (result.autonomous_result) {
          setAutonomousResult({
            status: "success",
            analysis_type: "fully_autonomous_ai",
            document_id: doc.documentId,
            filename: doc.filename,
            quality_metrics: result.quality_metrics,
            autonomous_result: result.autonomous_result
          });
        }
      }
      
      const lastResult = autonomousResult;
      alert(
        `Document Analysis Complete!\n\n` +
        `${uploadedDocuments.length} document(s) analyzed successfully.\n\n` +
        `Quality Score: ${lastResult ? Math.round(lastResult.quality_metrics.quality_score * 100) : 0}%\n` +
        `View comprehensive results below.`
      );
    } catch (error) {
      console.error("Document analysis failed:", error);
      alert("Document analysis failed. Please try again.");
    } finally {
      setIsAnalyzingDocuments(false);
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
    <div className="flex flex-col gap-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between card-hover rounded-lg border border-transparent p-4 -m-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="hover-scale">
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
            className="hover-lift"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
          <Button
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="hover-scale bg-primary text-white hover:bg-primary-hover"
          >
            <Play className="h-4 w-4" />
            {isAnalyzing ? "Analyzing..." : "Start Analysis"}
          </Button>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-1">
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
          qualityMetrics={autonomousResult?.quality_metrics}
        />
      )}

      {/* Autonomous Analysis Results */}
      {autonomousResult && (
        <AutonomousAnalysisViewer analysis={autonomousResult.autonomous_result} />
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

      {/* Document Upload - Modern Card with Animation */}
      <Card className="card-hover animate-fade-in-up stagger-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5 text-primary" />
              <span>Project Documents</span>
              {uploadedDocuments.length > 0 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary animate-fade-in-scale">
                  {uploadedDocuments.length} uploaded
                </span>
              )}
            </div>
            {uploadedDocuments.length > 0 && (
              <Button
                size="sm"
                onClick={handleAnalyzeDocuments}
                disabled={isAnalyzingDocuments}
                className="hover-scale bg-primary text-white hover:bg-primary-hover"
              >
                <Play className="h-4 w-4" />
                {isAnalyzingDocuments ? "Analyzing..." : `Analyze ${uploadedDocuments.length} Document${uploadedDocuments.length !== 1 ? 's' : ''}`}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-neutral-600">
            Upload construction documents, contracts, or specifications. Click &ldquo;Analyze Documents&rdquo; when ready to process them with AI.
          </p>
          <DocumentUpload
            projectId={project.id}
            onUploadComplete={(documentId: string, analysis?: DocumentAnalysis, autonomousResult?: AutonomousUploadResult) => {
              console.log("Upload complete:", documentId);
              
              // Track uploaded documents (no analysis yet)
              if (documentId) {
                setUploadedDocuments(prev => [
                  ...prev,
                  { documentId, filename: `Document ${documentId.slice(0, 8)}` }
                ]);
              }
              
              // If analysis results are provided (shouldn't happen with new upload-only flow)
              if (autonomousResult) {
                setAutonomousResult(autonomousResult);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
