"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Play, FileDown, Settings, Sparkles, CheckCircle2, UploadCloud, Upload, FileText, X, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { apiClient } from "@/app/lib/api/client";
import { ConfigurationModal } from "../data/configuration-modal";
import { DocumentUpload } from "../data/document-upload";
import { RealTimeAnalysisViewport } from "../analysis/real-time-analysis-viewport";
import { PostAnalysisDashboard } from "../analysis/post-analysis-dashboard";
import { ProjectDashboard } from "../dashboard/project-dashboard";
import { UniversalDomainViewer } from "../analysis/universal-domain-viewer";
import { useToast } from "../ui/toast";
import type { ProjectConfig, DocumentMetadata } from "@/app/lib/types";

// Universal, extensible document analysis interface
interface DocumentAnalysis {
  // Core metrics - applicable to all document types
  sections: number;
  clauses_extracted: number;
  divisions_found: Record<string, number>;
  sample_clauses: unknown[];
  ner_analysis: unknown[];
  
  // Domain-specific analysis - flexible structure for any specialty
  domain_analysis?: {
    [domain: string]: {
      // Generic items structure - works for equipment, fixtures, materials, etc.
      items?: Array<{
        type: string;
        mention: string;
        category?: string;
        specifications?: string[];
      }>;
      
      // Generic specifications array - adaptable to any domain
      specifications?: Array<{
        category: string;
        values: string[];
        standards?: string[];
      }>;
      
      // Standards applicable to this domain
      standards?: string[];
      
      // Summary metrics - generic enough for any domain
      summary?: {
        total_items: number;
        item_types: number;
        has_specifications: boolean;
        completeness_score: number;
        [key: string]: unknown; // Allow additional custom metrics
      };
      
      // Allow any additional domain-specific fields
      [key: string]: unknown;
    };
  };
  
  // Overall analysis insights - universal across all domains
  insights?: {
    completeness_score: number;
    key_materials: string[];
    key_standards: string[];
    risk_indicators: Array<{
      type: string;
      severity: "low" | "medium" | "high" | "critical";
      text: string;
      location?: string;
    }>;
    recommendations: Array<{
      priority: "low" | "medium" | "high" | "critical";
      category: string;
      message: string;
      impact?: string;
    }>;
    summary: {
      total_divisions: number;
      most_referenced_division: string;
      specification_density: number;
      document_type?: string;
      detected_domains?: string[]; // e.g., ["hvac", "plumbing", "electrical", "structural"]
      [key: string]: unknown; // Allow additional custom metrics
    };
  };
  
  // Metadata - universal document information
  metadata?: {
    document_type?: string;
    confidence_score?: number;
    processing_time?: number;
    ai_model_version?: string;
    [key: string]: unknown;
  };
}


interface AIStudioProps {
  projectId?: string;
  projectName?: string;
}

export function AIStudio({ projectId, projectName }: AIStudioProps) {
  const { showToast } = useToast();
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
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis | null>(null);
  
  // 🌊 Real-time streaming progress state
  const [streamController, setStreamController] = useState<{ close: () => void } | null>(null);
  const [showAnalysisViewport, setShowAnalysisViewport] = useState(false);
  const [showPostAnalysisDashboard, setShowPostAnalysisDashboard] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({
    phase: 0,
    totalPhases: 7,
    message: "",
    progress: 0,
    elapsed: 0,
    estimatedRemaining: 0,
    status: "idle" as "idle" | "running" | "completed" | "error"
  });
  const [analysisInsights, setAnalysisInsights] = useState<Array<{
    type: string;
    value: number | string;
    message: string;
    timestamp: number;
  }>>([]);
  const [analysisResultSummary, setAnalysisResultSummary] = useState<{
    execution_time: number;
    quality_score: number;
    ai_decisions: number;
    recommendations: number;
    requirements: number;
    document_type: string;
    clauses_found?: number;
    divisions_detected?: number;
    entities_extracted?: number;
  } | null>(null);

  // Load existing documents when project changes
  useEffect(() => {
    const loadProjectDocuments = async () => {
      if (!projectId) return;
      
      try {
        const project = await apiClient.getProject(projectId);
        
        if (project.documents && Array.isArray(project.documents)) {
          const docs = project.documents.map((doc: DocumentMetadata) => ({
            id: doc.id,
            documentId: doc.id,
            name: doc.filename || 'Unknown',
            size: doc.file_size || 0,
            analysis: doc.analysis_result as DocumentAnalysis | undefined
          }));
          
          setUploadedDocs(docs);
          console.log(`✅ Loaded ${docs.length} existing documents from project`);
        }
      } catch (error) {
        console.error('Failed to load project documents:', error);
        showToast('Failed to load existing documents', 'error');
      }
    };

    if (projectId) {
      loadProjectDocuments();
    }
  }, [projectId, showToast]);

  const handleDeleteDocument = async (documentId: string, documentName: string) => {
    if (!projectId) return;
    
    try {
      console.log(`🗑️ Deleting document: ${documentId}`);
      
      await apiClient.deleteDocument(projectId, documentId);
      
      // Remove from local state
      setUploadedDocs(prev => prev.filter(doc => doc.documentId !== documentId));
      
      showToast(`Document "${documentName}" deleted successfully`, "success");
      console.log(`✅ Document deleted: ${documentId}`);
    } catch (error) {
      console.error('Failed to delete document:', error);
      showToast(`Failed to delete document: ${error}`, 'error');
    }
  };

  const handleDocumentUpload = (
    documentId: string, 
    analysis?: DocumentAnalysis, 
    uploadResult?: { file_size?: number; filename?: string }
  ) => {
    console.log("Document uploaded:", { documentId, analysis, uploadResult });
    
    // Track the uploaded document with actual file size
    setUploadedDocs(prev => [...prev, {
      id: Date.now().toString(),
      documentId,
      name: uploadResult?.filename || "Uploaded document",
      size: uploadResult?.file_size || 0,
      analysis: analysis || undefined
    }]);
    
    // Notify upload complete - user must click Analyze button
    showToast(
      `✅ Document uploaded successfully!\n\nDocument ID: ${documentId}\n\nClick the "Analyze" button to run AI analysis.`,
      "success",
      6000
    );
  };

  const handleConfigure = async () => {
    if (!projectId) {
      showToast("Please select a project first", "warning");
      return;
    }

    try {
      const config = await apiClient.getProjectConfig(projectId);
      console.log("Project configuration:", config);
      setCurrentConfig(config.config as ProjectConfig);
      setConfigModalOpen(true);
    } catch (error) {
      console.error("Failed to get configuration:", error);
      showToast("Failed to load configuration", "error");
    }
  };

  const handleConfigSubmit = async (config: ProjectConfig) => {
    if (!projectId) return;

    try {
      await apiClient.updateProjectConfig(projectId, { config });
      setCurrentConfig(config);
      showToast("Configuration updated successfully!", "success");
    } catch (error) {
      console.error("Failed to update configuration:", error);
      throw error; // Let modal handle the error
    }
  };

  const handleExport = async () => {
    if (!projectId) {
      showToast("Please select a project first", "warning");
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
        
        showToast("PDF report downloaded successfully!", "success");
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
          showToast("Export downloaded successfully!", "success");
        } else if (result.download_url) {
          showToast(`Export ready! Download URL: ${result.download_url}\n\n(Full file generation coming soon)`, "info", 7000);
        }
      }
    } catch (error) {
      console.error("Failed to export:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      showToast(`Failed to export project: ${errorMessage}\n\nPlease check the console for details.`, "error");
    }
  };

  const handleCancelAnalysis = () => {
    if (streamController) {
      streamController.close();
      setStreamController(null);
      setIsAnalyzing(false);
      setShowAnalysisViewport(false);
      setAnalysisProgress({
        phase: 0,
        totalPhases: 7,
        message: "Analysis cancelled by user",
        progress: 0,
        elapsed: 0,
        estimatedRemaining: 0,
        status: "idle"
      });
      setAnalysisInsights([]);
    }
  };

  const handleAnalyze = async () => {
    if (!projectId) {
      showToast("Please select a project first", "warning");
      return;
    }

    // Get the most recently uploaded document
    if (uploadedDocs.length === 0) {
      showToast("Please upload a document first before analyzing", "warning");
      return;
    }

    const lastDoc = uploadedDocs[uploadedDocs.length - 1];
    if (!lastDoc.documentId) {
      showToast("No valid document to analyze", "error");
      return;
    }

    setIsAnalyzing(true);
    setShowAnalysisViewport(true);
    setAnalysisInsights([]);
    setAnalysisProgress({
      phase: 0,
      totalPhases: 7,
      message: "Initializing analysis...",
      progress: 0,
      elapsed: 0,
      estimatedRemaining: 0,
      status: "running"
    });
    
    try {
      console.log(`🤖 Starting AI analysis stream for document ${lastDoc.documentId}...`);
      
      // Use STREAMING endpoint for real-time progress
      const controller = apiClient.analyzeDocumentStream(
        projectId,
        lastDoc.documentId,
        {
          onProgress: (data) => {
            console.log("📊 Progress update:", data);
            setAnalysisProgress({
              phase: data.phase,
              totalPhases: data.total_phases,
              message: data.message,
              progress: data.progress,
              elapsed: data.elapsed,
              estimatedRemaining: data.estimated_remaining,
              status: data.status as "running" | "completed"
            });
          },
          
          onInsight: (data) => {
            console.log("💡 Insight:", data);
            setAnalysisInsights(prev => [...prev, {
              ...data,
              timestamp: Date.now()
            }]);
          },
          
          onComplete: (data) => {
            console.log("✅ Analysis complete:", data);
            setAnalysisProgress(prev => ({
              ...prev,
              status: "completed",
              progress: 100
            }));
            setIsAnalyzing(false);
            setStreamController(null);
            
            // Store completion data
            setDocumentAnalysis(data as unknown as DocumentAnalysis);
            
            // Extract summary for viewport display
            setAnalysisResultSummary({
              execution_time: data.execution_time || 0,
              quality_score: data.quality_score || 0,
              ai_decisions: data.ai_decisions || 0,
              recommendations: data.recommendations || 0,
              requirements: data.requirements || 0,
              document_type: data.document_type || "Construction Specification",
              clauses_found: (data as {clauses_found?: number}).clauses_found,
              divisions_detected: (data as {divisions_detected?: number}).divisions_detected,
              entities_extracted: (data as {entities_extracted?: number}).entities_extracted
            });
            
            // Auto-transition to post-analysis dashboard after 1.5 seconds
            setTimeout(() => {
              setShowAnalysisViewport(false);
              setShowPostAnalysisDashboard(true);
            }, 1500);
          },
          
          onError: (data) => {
            console.error("❌ Analysis error:", data);
            setAnalysisProgress(prev => ({
              ...prev,
              status: "error",
              message: `Error: ${data.error}`
            }));
            setIsAnalyzing(false);
            setStreamController(null);
            // Keep viewport open to show error - user will close it
          }
        }
      );
      
      setStreamController(controller);
      
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysisProgress(prev => ({
        ...prev,
        status: "error",
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
      setIsAnalyzing(false);
      setStreamController(null);
      // Keep viewport open to show error
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
              onClick={() => {
                console.log("Upload button clicked, showUpload:", showUpload);
                setShowUpload(true);
                console.log("setShowUpload(true) called");
              }}
              className="shadow-sm h-9 w-9 p-0"
              title="Upload Document"
            >
              <UploadCloud className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleConfigure}
              className="shadow-sm h-9 w-9 p-0"
              title="Configure Project"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExport}
              className="shadow-sm h-9 w-9 p-0"
              title="Export Results"
            >
              <FileDown className="h-4 w-4" />
            </Button>
            <Button 
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="bg-linear-to-r from-primary to-primary/80 shadow-md hover:shadow-lg transition-shadow h-9 w-9 p-0"
              title={isAnalyzing ? "Analyzing..." : "Analyze Document"}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Studio Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {projectId ? (
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Project Dashboard */}
            {!documentAnalysis && (
              <ProjectDashboard
                projectName={projectName || "Unnamed Project"}
                stats={{
                  totalDocuments: uploadedDocs.length,
                  analyzedDocuments: documentAnalysis ? 1 : 0,
                  totalClauses: (documentAnalysis as unknown as {clauses_extracted?: number})?.clauses_extracted || 0,
                  qualityScore: analysisResultSummary?.quality_score || 0,
                  lastAnalyzed: documentAnalysis ? "Just now" : undefined,
                  status: isAnalyzing 
                    ? "processing" 
                    : documentAnalysis 
                    ? "completed" 
                    : uploadedDocs.length > 0 
                    ? "ready" 
                    : "idle"
                }}
                onUpload={() => setShowUpload(true)}
                onAnalyze={handleAnalyze}
                onExport={handleExport}
                isAnalyzing={isAnalyzing}
              />
            )}

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

                {/* Universal Domain Analysis Section */}
                {documentAnalysis.domain_analysis && Object.keys(documentAnalysis.domain_analysis).length > 0 && (
                  <UniversalDomainViewer domainAnalysis={documentAnalysis.domain_analysis} />
                )}
              </div>
            )}

            {/* Streamlined Upload Section - Only shown when no analysis yet */}
            {!documentAnalysis && uploadedDocs.length === 0 && !showUpload && (
              <div className="flex items-center justify-center py-20">
                <div className="text-center max-w-lg">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-linear-to-br from-primary to-primary/60 shadow-lg">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-foreground">
                    Ready for AI Analysis
                  </h3>
                  <p className="mb-8 text-neutral-600">
                    Upload construction documents and let our AI analyze them with deep intelligence
                  </p>
                  <Button
                    size="lg"
                    onClick={() => {
                      console.log("Upload First Document button clicked");
                      setShowUpload(true);
                    }}
                    className="bg-primary hover:bg-primary-hover shadow-md"
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Your First Document
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Modal - Fixed Overlay */}
            {(() => {
              console.log("Render - showUpload state:", showUpload);
              return showUpload && (
                <div 
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  onClick={(e) => {
                    // Close modal if clicking on backdrop (not the card)
                    if (e.target === e.currentTarget) {
                      console.log("Backdrop clicked, closing modal");
                      setShowUpload(false);
                    }
                  }}
                >
                  <Card className="shadow-xl border-primary/20 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                    <CardHeader className="border-b border-neutral-200">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-primary" />
                          Upload Document
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            console.log("Closing upload modal");
                            setShowUpload(false);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <DocumentUpload
                        projectId={projectId}
                        onUploadComplete={(docId, _analysis, uploadResult) => {
                          console.log("Upload complete callback:", { docId, uploadResult });
                          const fileInfo = uploadResult && 'file_size' in uploadResult ? {
                            file_size: (uploadResult as { file_size: number }).file_size,
                            filename: (uploadResult as { filename: string }).filename
                          } : undefined;
                          handleDocumentUpload(docId, undefined, fileInfo);
                          setShowUpload(false);
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              );
            })()}

            {/* Uploaded Documents - Compact List */}
            {uploadedDocs.length > 0 && !documentAnalysis && (
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Documents Ready ({uploadedDocs.length})
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowUpload(true)}
                      className="text-xs"
                    >
                      <Upload className="mr-1 h-3 w-3" />
                      Add More
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {uploadedDocs.slice(-3).map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3 group hover:border-red-200 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {doc.name}
                          </p>
                          <p className="text-xs text-neutral-600">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteDocument(doc.documentId, doc.name);
                          }}
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600"
                          title="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {uploadedDocs.length > 3 && (
                      <p className="text-xs text-neutral-500 text-center pt-2">
                        +{uploadedDocs.length - 3} more documents
                      </p>
                    )}
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

      {/* Real-Time Analysis Viewport Modal */}
      <RealTimeAnalysisViewport
        isOpen={showAnalysisViewport}
        onClose={() => setShowAnalysisViewport(false)}
        progress={analysisProgress}
        insights={analysisInsights}
        onCancel={handleCancelAnalysis}
        analysisResult={analysisResultSummary || undefined}
      />

      {/* Post-Analysis Dashboard Modal */}
      {analysisResultSummary && (
        <PostAnalysisDashboard
          isOpen={showPostAnalysisDashboard}
          onClose={() => setShowPostAnalysisDashboard(false)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          documentAnalysis={documentAnalysis as any}
          resultSummary={analysisResultSummary}
          insights={analysisInsights}
        />
      )}
    </main>
  );
}
