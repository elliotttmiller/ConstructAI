"use client";

import * as React from "react";
import { useState } from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  Zap, 
  TrendingUp,
  AlertCircle,
  Brain,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
  Download
} from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/app/lib/utils";

interface AnalysisProgress {
  phase: number;
  totalPhases: number;
  message: string;
  progress: number;
  elapsed: number;
  estimatedRemaining: number;
  status: "idle" | "running" | "completed" | "error";
}

interface AnalysisInsight {
  type: string;
  value: number | string;
  message: string;
  timestamp: number;
}

interface RealTimeAnalysisViewportProps {
  isOpen: boolean;
  onClose: () => void;
  progress: AnalysisProgress;
  insights: AnalysisInsight[];
  onCancel?: () => void;
  analysisResult?: {
    execution_time: number;
    quality_score: number;
    ai_decisions: number;
    recommendations: number;
    requirements: number;
    document_type: string;
    clauses_found?: number;
    divisions_detected?: number;
    entities_extracted?: number;
  };
}

const PHASE_DETAILS = [
  {
    name: "Document Understanding",
    icon: FileText,
    description: "Parsing structure and extracting text",
    color: "from-blue-500 to-blue-600"
  },
  {
    name: "Classification",
    icon: Brain,
    description: "Identifying document type and standards",
    color: "from-purple-500 to-purple-600"
  },
  {
    name: "Clause Extraction",
    icon: Activity,
    description: "Extracting specifications and requirements",
    color: "from-green-500 to-green-600"
  },
  {
    name: "Compliance Analysis",
    icon: CheckCircle,
    description: "Verifying industry standards adherence",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    name: "Deep Analysis",
    icon: Zap,
    description: "AI-powered semantic understanding",
    color: "from-orange-500 to-orange-600"
  },
  {
    name: "Optimization",
    icon: TrendingUp,
    description: "Generating recommendations",
    color: "from-red-500 to-red-600"
  },
  {
    name: "Report Generation",
    icon: Sparkles,
    description: "Compiling comprehensive results",
    color: "from-pink-500 to-pink-600"
  }
];

export function RealTimeAnalysisViewport({
  isOpen,
  onClose,
  progress,
  insights,
  onCancel,
  analysisResult
}: RealTimeAnalysisViewportProps) {
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([progress.phase]));

  if (!isOpen) return null;

  const currentPhaseInfo = PHASE_DETAILS[progress.phase - 1];
  const isComplete = progress.status === "completed";
  const isError = progress.status === "error";
  const isRunning = progress.status === "running";

  const visibleInsights = showAllInsights ? insights : insights.slice(-8);

  const togglePhase = (phaseNum: number) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseNum)) {
        next.delete(phaseNum);
      } else {
        next.add(phaseNum);
      }
      return next;
    });
  };

  // Check if phase is expanded (includes current phase auto-expansion)
  const isPhaseExpanded = (phaseNum: number) => {
    return expandedPhases.has(phaseNum) || phaseNum === progress.phase;
  };

  // Use the function to check expansion
  console.log("Phase expansion check:", isPhaseExpanded(progress.phase));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[90vh] mx-4 bg-surface rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className={cn(
          "relative px-8 py-6 border-b border-neutral-200",
          isComplete && "bg-linear-to-r from-green-50 to-emerald-50",
          isError && "bg-linear-to-r from-red-50 to-rose-50",
          isRunning && "bg-linear-to-r from-primary/5 to-purple-50"
        )}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {isComplete ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : isError ? (
                  <AlertCircle className="h-8 w-8 text-red-600" />
                ) : (
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                )}
                <h2 className="text-2xl font-bold text-foreground">
                  {isComplete 
                    ? "Analysis Complete" 
                    : isError 
                    ? "Analysis Failed" 
                    : "AI Analysis in Progress"}
                </h2>
              </div>
              <p className="text-sm text-neutral-600 ml-11">
                {isComplete 
                  ? "Your document has been fully analyzed and insights are ready" 
                  : isError
                  ? "An error occurred during analysis"
                  : "Real-time AI processing with full observability"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={isComplete || isError ? onClose : onCancel}
              className="text-neutral-500 hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Main Progress Bar */}
          {!isError && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">
                  Overall Progress
                </span>
                <span className="text-lg font-bold text-primary">
                  {progress.progress}%
                </span>
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    isComplete 
                      ? "bg-linear-to-r from-green-500 to-emerald-600"
                      : "bg-linear-to-r from-primary to-purple-600"
                  )}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-6">
            {/* Completion Summary - Show when complete */}
            {isComplete && analysisResult && (
              <div className="space-y-6">
                {/* Success Banner */}
                <div className="rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-green-500 to-emerald-600 mb-4 shadow-lg">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-green-800 mb-2">
                    Analysis Complete!
                  </h3>
                  <p className="text-lg text-green-700">
                    Your document has been fully analyzed with AI-powered insights
                  </p>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-xl bg-linear-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-900">
                      {analysisResult.execution_time.toFixed(1)}s
                    </p>
                    <p className="text-sm text-blue-700 mt-1">Execution Time</p>
                  </div>
                  
                  <div className="rounded-xl bg-linear-to-br from-purple-50 to-purple-100 border border-purple-200 p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-purple-900">
                      {(analysisResult.quality_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-purple-700 mt-1">Quality Score</p>
                  </div>
                  
                  <div className="rounded-xl bg-linear-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 text-center">
                    <Brain className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-orange-900">
                      {analysisResult.ai_decisions}
                    </p>
                    <p className="text-sm text-orange-700 mt-1">AI Decisions</p>
                  </div>
                  
                  <div className="rounded-xl bg-linear-to-br from-green-50 to-green-100 border border-green-200 p-6 text-center">
                    <Sparkles className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-green-900">
                      {analysisResult.recommendations}
                    </p>
                    <p className="text-sm text-green-700 mt-1">Recommendations</p>
                  </div>
                </div>

                {/* Document Insights */}
                <Card className="shadow-lg border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Document Intelligence Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {analysisResult.document_type || "Construction Spec"}
                          </p>
                          <p className="text-xs text-neutral-600">Document Type</p>
                        </div>
                      </div>
                      
                      {analysisResult.clauses_found !== undefined && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                          <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                            <Activity className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {analysisResult.clauses_found}
                            </p>
                            <p className="text-xs text-neutral-600">Clauses Found</p>
                          </div>
                        </div>
                      )}
                      
                      {analysisResult.divisions_detected !== undefined && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Zap className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {analysisResult.divisions_detected}
                            </p>
                            <p className="text-xs text-neutral-600">MasterFormat Divisions</p>
                          </div>
                        </div>
                      )}
                      
                      {analysisResult.requirements !== undefined && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-neutral-50 border border-neutral-200">
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {analysisResult.requirements}
                            </p>
                            <p className="text-xs text-neutral-600">Critical Requirements</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* All Insights Discovered */}
                {insights.length > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        All Discoveries ({insights.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {insights.map((insight, idx) => (
                          <div
                            key={`${insight.timestamp}-${insight.type}-${idx}`}
                            className="flex items-start gap-3 p-3 rounded-lg bg-neutral-50 border border-neutral-200"
                          >
                            <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-semibold text-primary">{insight.type}:</span>
                                <span className="ml-2 text-neutral-700">{insight.message}</span>
                                {insight.value !== undefined && (
                                  <span className="ml-2 font-bold text-foreground">
                                    ({typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Next Steps CTA */}
                <div className="rounded-xl bg-linear-to-r from-primary/10 to-purple-50 border border-primary/20 p-6">
                  <h4 className="text-lg font-bold text-foreground mb-2">
                    🎉 What&apos;s Next?
                  </h4>
                  <p className="text-sm text-neutral-700 mb-4">
                    Your analysis is complete and stored. You can now export the full report or continue analyzing more documents.
                  </p>
                  <div className="flex gap-3">
                    <Button className="bg-primary hover:bg-primary-hover" onClick={onClose}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Report
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Running/Error States - Time Metrics */}
            {!isComplete && !isError && (
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-600">Elapsed Time</p>
                    <p className="text-lg font-bold text-foreground">{progress.elapsed}s</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-xs text-neutral-600">Current Phase</p>
                    <p className="text-lg font-bold text-foreground">{progress.phase}/{progress.totalPhases}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <Zap className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-neutral-600">Est. Remaining</p>
                    <p className="text-lg font-bold text-primary">~{progress.estimatedRemaining}s</p>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Timeline */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Analysis Pipeline
              </h3>
              <div className="space-y-2">
                {PHASE_DETAILS.map((phase, index) => {
                  const phaseNum = index + 1;
                  const isCurrentPhase = phaseNum === progress.phase && isRunning;
                  const isCompletedPhase = phaseNum < progress.phase || isComplete;
                  const isFuturePhase = phaseNum > progress.phase && !isComplete;
                  const isExpanded = expandedPhases.has(phaseNum) || phaseNum === progress.phase;
                  const PhaseIcon = phase.icon;

                  return (
                    <div
                      key={phaseNum}
                      className={cn(
                        "rounded-xl border transition-all duration-300",
                        isCurrentPhase && "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20",
                        isCompletedPhase && "border-green-200 bg-green-50",
                        isFuturePhase && "border-neutral-200 bg-neutral-50 opacity-60"
                      )}
                    >
                      <button
                        onClick={() => togglePhase(phaseNum)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-black/5 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={cn(
                            "flex items-center justify-center w-10 h-10 rounded-lg",
                            isCurrentPhase && "bg-linear-to-br from-primary to-purple-600 shadow-md",
                            isCompletedPhase && "bg-linear-to-br from-green-500 to-emerald-600",
                            isFuturePhase && "bg-neutral-300"
                          )}>
                            {isCompletedPhase ? (
                              <CheckCircle className="h-5 w-5 text-white" />
                            ) : (
                              <PhaseIcon className={cn(
                                "h-5 w-5",
                                isCurrentPhase ? "text-white animate-pulse" : "text-white"
                              )} />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className={cn(
                              "font-semibold",
                              isCurrentPhase && "text-primary",
                              isCompletedPhase && "text-green-700",
                              isFuturePhase && "text-neutral-500"
                            )}>
                              Phase {phaseNum}: {phase.name}
                            </p>
                            <p className="text-xs text-neutral-600">{phase.description}</p>
                          </div>
                          {isCurrentPhase && (
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                            </div>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-neutral-400" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-neutral-400" />
                        )}
                      </button>

                      {/* Expanded Phase Details */}
                      {isExpanded && (isCurrentPhase || isCompletedPhase) && (
                        <div className="px-4 pb-4 pt-2 border-t border-neutral-200 animate-fade-in">
                          <div className="text-xs text-neutral-600 space-y-1">
                            {isCurrentPhase && (
                              <>
                                <p className="font-medium text-primary">{progress.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-linear-to-r from-primary to-purple-600 transition-all duration-300"
                                      style={{ width: `${((progress.phase - phaseNum + 1) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                            {isCompletedPhase && (
                              <p className="text-green-700 font-medium flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Completed successfully
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Live Insights Feed */}
            {insights.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Live Discoveries ({insights.length})
                  </h3>
                  {insights.length > 8 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllInsights(!showAllInsights)}
                      className="text-xs"
                    >
                      {showAllInsights ? "Show Less" : "Show All"}
                    </Button>
                  )}
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {visibleInsights.map((insight, idx) => (
                    <div
                      key={`${insight.timestamp}-${insight.type}-${idx}`}
                      className="flex items-start gap-3 p-3 rounded-lg bg-linear-to-r from-primary/5 to-purple-50 border border-primary/10 animate-fade-in"
                    >
                      <div className="shrink-0 w-2 h-2 bg-primary rounded-full mt-1.5 animate-pulse" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold text-primary">{insight.type}:</span>
                          <span className="ml-2 text-neutral-700">{insight.message}</span>
                          {insight.value !== undefined && (
                            <span className="ml-2 font-bold text-foreground">
                              ({typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Status Message */}
            {isRunning && currentPhaseInfo && (
              <div className="rounded-xl bg-linear-to-br from-primary/10 to-purple-50 border border-primary/20 p-6">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-linear-to-br flex items-center justify-center shadow-lg",
                      currentPhaseInfo.color
                    )}>
                      {React.createElement(currentPhaseInfo.icon, {
                        className: "h-8 w-8 text-white"
                      })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-foreground mb-1">
                      {currentPhaseInfo.name}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {progress.message || currentPhaseInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-neutral-200 px-8 py-4 bg-neutral-50 flex items-center justify-between">
          <div className="text-xs text-neutral-600">
            {isRunning && "AI analysis running with real-time streaming"}
            {isComplete && "Analysis complete • Ready for export"}
            {isError && "Analysis encountered an error"}
          </div>
          <div className="flex items-center gap-3">
            {isRunning && onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Analysis
              </Button>
            )}
            {(isComplete || isError) && (
              <Button
                onClick={onClose}
                className="bg-primary hover:bg-primary-hover"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
