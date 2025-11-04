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

interface DocumentAnalysis {
  sections: number;
  clauses_extracted: number;
  divisions_found: Record<string, number>;
  sample_clauses: unknown[];
  ner_analysis: unknown[];
  mep_analysis?: {
    hvac: {
      equipment: Array<{ type: string; mention: string }>;
      capacities: string[];
      efficiency_ratings: string[];
      ductwork: string[];
      standards: string[];
      summary: {
        total_equipment: number;
        equipment_types: number;
        has_capacity_specs: boolean;
        has_efficiency_ratings: boolean;
        completeness_score: number;
      };
    };
    plumbing: {
      fixtures: Array<{ type: string; mention: string }>;
      piping: string[];
      water_supply: string[];
      drainage: string[];
      standards: string[];
      summary: {
        total_fixtures: number;
        fixture_types: number;
        has_piping_specs: boolean;
        has_water_supply_specs: boolean;
        completeness_score: number;
      };
    };
    overall: {
      has_hvac_specs: boolean;
      has_plumbing_specs: boolean;
      hvac_completeness: number;
      plumbing_completeness: number;
      overall_completeness: number;
    };
  };
  insights?: {
    completeness_score: number;
    key_materials: string[];
    key_standards: string[];
    risk_indicators: Array<{
      type: string;
      severity: string;
      text: string;
    }>;
    recommendations: Array<{
      priority: string;
      category: string;
      message: string;
    }>;
    summary: {
      total_divisions: number;
      most_referenced_division: string;
      specification_density: number;
      has_mep_specifications?: boolean;
    };
  };
}

interface AIStudioProps {
  projectId?: string;
  projectName?: string;
}

export function AIStudio({ projectId, projectName }: AIStudioProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ProjectConfig | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState<Array<{ 
    id: string; 
    documentId: string;
    name: string; 
    size: number;
    analysis?: DocumentAnalysis;
  }>>([]);
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
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);

  const handleDocumentUpload = (documentId: string, analysis: DocumentAnalysis) => {
    console.log("Document uploaded with analysis:", { documentId, analysis });
    setDocumentAnalysis(analysis);
    setUploadedDocs(prev => [...prev, {
      id: Date.now().toString(),
      documentId,
      name: "Uploaded document",
      size: 0,
      analysis
    }]);
    
    // Show analysis results immediately
    alert(
      `Document Analyzed!\n\n` +
      `Sections Found: ${analysis.sections}\n` +
      `Clauses Extracted: ${analysis.clauses_extracted}\n` +
      `MasterFormat Divisions: ${Object.keys(analysis.divisions_found || {}).length}\n\n` +
      `View detailed results in console.`
    );
  };

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
      // Let user choose format with better UI
      const format = prompt("Choose export format:\n\n• json - Complete data export\n• pdf - Professional report\n• excel - Spreadsheet format\n\nEnter format:", "pdf");
      
      if (!format || !["json", "pdf", "excel"].includes(format.toLowerCase())) {
        return;
      }

      const selectedFormat = format.toLowerCase() as "json" | "pdf" | "excel";
      
      // Show loading state
      const loadingMsg = selectedFormat === 'pdf' ? 'Generating PDF report...' : 'Preparing export...';
      console.log(loadingMsg);

      if (selectedFormat === "pdf") {
        // For PDF, we need to handle blob download differently
        const response = await fetch(
          `http://localhost:8000/api/projects/${projectId}/export?format=pdf`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/pdf',
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
          throw new Error(errorData.detail || `Export failed with status ${response.status}`);
        }

        // Get the blob
        const blob = await response.blob();
        
        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${projectName || "project"}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("PDF report downloaded successfully!");
      } else {
        // For JSON and Excel, use the API client
        const result = await apiClient.exportProject(projectId, selectedFormat);
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
      }
    } catch (error) {
      console.error("Failed to export:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to export project: ${errorMessage}\n\nPlease check the console for details.`);
    }
  };

  const handleAnalyze = async () => {
    if (!projectId) {
      alert("Please select a project first");
      return;
    }

    // If we have document analysis, show it
    if (documentAnalysis) {
      console.log("Showing document analysis:", documentAnalysis);
      alert(
        `Document Analysis Results:\n\n` +
        `Sections: ${documentAnalysis.sections}\n` +
        `Clauses Extracted: ${documentAnalysis.clauses_extracted}\n` +
        `MasterFormat Divisions Found: ${Object.keys(documentAnalysis.divisions_found || {}).length}\n\n` +
        `Sample Clauses: ${documentAnalysis.sample_clauses?.length || 0}\n` +
        `NER Analysis: ${documentAnalysis.ner_analysis?.length || 0} entities\n\n` +
        `Full details in console.`
      );
      return;
    }

    // Otherwise run project analysis
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
            {/* Document Analysis Results */}
            {documentAnalysis && (
              <div className="space-y-6">
                {/* Completeness Score Card */}
                {documentAnalysis.insights && (
                  <Card className="shadow-lg border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        Document Quality Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <p className="text-5xl font-bold text-primary">
                            {documentAnalysis.insights.completeness_score}%
                          </p>
                          <p className="text-sm text-neutral-600 mt-1">Completeness Score</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-foreground">
                            {documentAnalysis.insights.summary.specification_density}
                          </p>
                          <p className="text-xs text-neutral-600">Clauses per Section</p>
                        </div>
                      </div>

                      {/* Key Insights Grid */}
                      <div className="grid gap-4 md:grid-cols-3 mb-4">
                        <div className="rounded-lg bg-surface p-4 border border-neutral-200">
                          <p className="text-2xl font-bold text-primary">
                            {documentAnalysis.sections}
                          </p>
                          <p className="text-sm text-neutral-600">Sections Found</p>
                        </div>
                        <div className="rounded-lg bg-surface p-4 border border-neutral-200">
                          <p className="text-2xl font-bold text-primary">
                            {documentAnalysis.clauses_extracted}
                          </p>
                          <p className="text-sm text-neutral-600">Clauses Extracted</p>
                        </div>
                        <div className="rounded-lg bg-surface p-4 border border-neutral-200">
                          <p className="text-2xl font-bold text-primary">
                            {documentAnalysis.insights.summary.total_divisions}
                          </p>
                          <p className="text-sm text-neutral-600">MasterFormat Divisions</p>
                        </div>
                      </div>

                      {/* Key Standards & Materials */}
                      <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t border-neutral-200">
                        {documentAnalysis.insights.key_standards.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">
                              Industry Standards Found:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {documentAnalysis.insights.key_standards.slice(0, 6).map((std, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-medium">
                                  {std}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {documentAnalysis.insights.key_materials.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-foreground mb-2">
                              Key Materials:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {documentAnalysis.insights.key_materials.slice(0, 6).map((mat, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                  {mat}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* MasterFormat Divisions */}
                      {documentAnalysis.divisions_found && Object.keys(documentAnalysis.divisions_found).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-neutral-200">
                          <p className="text-sm font-semibold text-foreground mb-2">
                            MasterFormat Coverage (Most Referenced: Division {documentAnalysis.insights.summary.most_referenced_division}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(documentAnalysis.divisions_found).map(([div, count]) => (
                              <span 
                                key={div} 
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  div === documentAnalysis.insights?.summary.most_referenced_division
                                    ? 'bg-primary text-white'
                                    : 'bg-primary/10 text-primary'
                                }`}
                              >
                                {div}: {count}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations & Risk Indicators */}
                {documentAnalysis.insights && (
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Recommendations Card */}
                    {documentAnalysis.insights.recommendations.length > 0 && (
                      <Card className="shadow-lg border-primary/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-primary">
                            <CheckCircle2 className="h-5 w-5" />
                            Recommendations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {documentAnalysis.insights.recommendations.map((rec, idx) => (
                              <div 
                                key={idx} 
                                className={`p-3 rounded-lg border ${
                                  rec.priority === 'high' 
                                    ? 'bg-error/5 border-error/20' 
                                    : rec.priority === 'medium'
                                    ? 'bg-warning/5 border-warning/20'
                                    : 'bg-success/5 border-success/20'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                                    rec.priority === 'high'
                                      ? 'bg-error/10 text-error'
                                      : rec.priority === 'medium'
                                      ? 'bg-warning/10 text-warning'
                                      : 'bg-success/10 text-success'
                                  }`}>
                                    {rec.priority}
                                  </span>
                                  <span className="text-xs font-medium text-neutral-500 uppercase">
                                    {rec.category}
                                  </span>
                                </div>
                                <p className="text-sm text-foreground mt-2">{rec.message}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Risk Indicators Card */}
                    {documentAnalysis.insights.risk_indicators.length > 0 && (
                      <Card className="shadow-lg border-warning/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="flex items-center gap-2 text-warning">
                            <FileText className="h-5 w-5" />
                            Critical Requirements
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {documentAnalysis.insights.risk_indicators.map((risk, idx) => (
                              <div key={idx} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                                    risk.severity === 'high'
                                      ? 'bg-error/10 text-error'
                                      : 'bg-warning/10 text-warning'
                                  }`}>
                                    {risk.severity}
                                  </span>
                                  <span className="text-xs font-medium text-neutral-500 uppercase">
                                    {risk.type}
                                  </span>
                                </div>
                                <p className="text-xs text-foreground">{risk.text}</p>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* MEP Analysis Section */}
                {documentAnalysis.mep_analysis && (documentAnalysis.mep_analysis.overall.has_hvac_specs || documentAnalysis.mep_analysis.overall.has_plumbing_specs) && (
                  <div className="space-y-6">
                    <div className="border-t pt-6">
                      <h3 className="text-xl font-semibold text-primary mb-4">MEP Systems Analysis</h3>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      {/* HVAC Analysis */}
                      {documentAnalysis.mep_analysis.overall.has_hvac_specs && (
                        <Card className="shadow-lg border-primary/20">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-primary">
                              <Sparkles className="h-5 w-5" />
                              HVAC Systems
                            </CardTitle>
                            <p className="text-sm text-neutral-500 mt-1">
                              {documentAnalysis.mep_analysis.hvac.summary.completeness_score.toFixed(0)}% Complete
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Equipment List */}
                            {documentAnalysis.mep_analysis.hvac.equipment.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  Equipment ({documentAnalysis.mep_analysis.hvac.summary.total_equipment} items)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.hvac.equipment.slice(0, 8).map((equip, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md"
                                    >
                                      {equip.type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Capacities */}
                            {documentAnalysis.mep_analysis.hvac.capacities.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Capacities</h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.hvac.capacities.slice(0, 6).map((cap, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium"
                                    >
                                      {cap}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Efficiency Ratings */}
                            {documentAnalysis.mep_analysis.hvac.efficiency_ratings.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Efficiency Ratings</h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.hvac.efficiency_ratings.map((rating, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 bg-success/10 text-success rounded-md"
                                    >
                                      {rating}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Standards */}
                            {documentAnalysis.mep_analysis.hvac.standards.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Standards Compliance</h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.hvac.standards.map((std, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md"
                                    >
                                      {std}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Plumbing Analysis */}
                      {documentAnalysis.mep_analysis.overall.has_plumbing_specs && (
                        <Card className="shadow-lg border-primary/20">
                          <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-2 text-primary">
                              <Sparkles className="h-5 w-5" />
                              Plumbing Systems
                            </CardTitle>
                            <p className="text-sm text-neutral-500 mt-1">
                              {documentAnalysis.mep_analysis.plumbing.summary.completeness_score.toFixed(0)}% Complete
                            </p>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Fixtures */}
                            {documentAnalysis.mep_analysis.plumbing.fixtures.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  Fixtures ({documentAnalysis.mep_analysis.plumbing.summary.total_fixtures} items)
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.plumbing.fixtures.slice(0, 8).map((fixture, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-md"
                                    >
                                      {fixture.type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Piping */}
                            {documentAnalysis.mep_analysis.plumbing.piping.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Piping Materials</h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.plumbing.piping.slice(0, 6).map((pipe, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-medium"
                                    >
                                      {pipe}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Water Supply */}
                            {documentAnalysis.mep_analysis.plumbing.water_supply.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Water Supply Specs</h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.plumbing.water_supply.map((spec, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 bg-success/10 text-success rounded-md"
                                    >
                                      {spec}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Standards */}
                            {documentAnalysis.mep_analysis.plumbing.standards.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-foreground mb-2">Standards Compliance</h4>
                                <div className="flex flex-wrap gap-2">
                                  {documentAnalysis.mep_analysis.plumbing.standards.map((std, idx) => (
                                    <span 
                                      key={idx} 
                                      className="text-xs px-2 py-1 bg-warning/10 text-warning rounded-md"
                                    >
                                      {std}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                      onUploadComplete={handleDocumentUpload}
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
