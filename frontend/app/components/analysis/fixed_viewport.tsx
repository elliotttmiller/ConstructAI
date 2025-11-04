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
  Download,
  Loader2
} from "lucide-react";
import { Button } from "../ui/button";
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

  if (!isOpen) return null;

  const currentPhaseInfo = PHASE_DETAILS[progress.phase - 1];
  const isComplete = progress.status === "completed";
  const isError = progress.status === "error";
  const isRunning = progress.status === "running";

  const visibleInsights = showAllInsights ? insights : insights.slice(-8);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-linear-to-br from-black/80 via-primary/20 to-purple-900/40 backdrop-blur-md animate-fade-in">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-6xl max-h-[92vh] mx-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex flex-col">
        {/* Modern Gradient Header */}
        <div className={cn(
          "relative px-8 py-6 overflow-hidden",
          isComplete && "bg-linear-to-r from-green-500 via-emerald-500 to-teal-500",
          isError && "bg-linear-to-r from-red-500 via-rose-500 to-pink-500",
          isRunning && "bg-linear-to-r from-blue-600 via-purple-600 to-pink-600"
        )}>
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 3s infinite' }} />
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className={cn(
                  "p-3 rounded-2xl backdrop-blur-sm shadow-lg",
                  isComplete && "bg-white/90",
                  isError && "bg-white/90",
                  isRunning && "bg-white/20 animate-pulse"
                )}>
                  {isComplete ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : isError ? (
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  ) : currentPhaseInfo ? (
                    <currentPhaseInfo.icon className="h-8 w-8 text-white" />
                  ) : (
                    <Sparkles className="h-8 w-8 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                    {isComplete 
                      ? "✨ Analysis Complete" 
                      : isError 
                      ? "⚠️ Analysis Failed" 
                      : currentPhaseInfo?.name || "AI Analysis"}
                  </h2>
                  <p className="text-sm text-white/90 mt-1 font-medium">
                    {isComplete 
                      ? "Your document has been fully analyzed and insights are ready" 
                      : isError
                      ? "An error occurred during analysis"
                      : currentPhaseInfo?.description || "Real-time AI processing"}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              {isRunning && (
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Clock className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {progress.elapsed.toFixed(1)}s
                    </span>
                    <span className="text-xs text-white/80">Elapsed</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Activity className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      {progress.phase}/{progress.totalPhases}
                    </span>
                    <span className="text-xs text-white/80">Current Phase</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Zap className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold text-white">
                      ~{progress.estimatedRemaining > 0 ? progress.estimatedRemaining.toFixed(0) : '-'}s
                    </span>
                    <span className="text-xs text-white/80">Est. Remaining</span>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={isComplete || isError ? onClose : onCancel}
              className="text-white/90 hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-xl"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Modern Progress Bar */}
          {!isError && (
            <div className="relative mt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-white/90">
                  Overall Progress
                </span>
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  {progress.progress}%
                </span>
              </div>
              <div className="relative h-3 bg-black/20 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                <div 
                  className={cn(
                    "h-full transition-all duration-700 ease-out rounded-full relative",
                    isComplete 
                      ? "bg-linear-to-r from-white to-white/80"
                      : "bg-linear-to-r from-white via-white/90 to-white/70"
                  )}
                  style={{ width: `${progress.progress}%` }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent" style={{ animation: 'shimmer 2s infinite' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-linear-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="p-8 space-y-6">
            {/* Completion Summary - Show when complete */}
            {isComplete && analysisResult && (
              <div className="space-y-8">
                {/* Modern Success Banner */}
                <div className="relative rounded-3xl bg-linear-to-br from-green-500 via-emerald-500 to-teal-500 p-px overflow-hidden shadow-2xl">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent" style={{ animation: 'shimmer 3s infinite' }} />
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-10 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-green-500 to-emerald-600 mb-6 shadow-xl" style={{ animation: 'bounce 2s infinite' }}>
                      <CheckCircle className="h-14 w-14 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                      Analysis Complete!
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Your document has been fully analyzed with AI-powered insights and is ready for review
                    </p>
                  </div>
                </div>

                {/* Modern Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Execution Time Card */}
                  <div className="group relative rounded-2xl bg-linear-to-br from-blue-500 to-cyan-500 p-px overflow-hidden hover:scale-105 transition-transform duration-300">
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-xl bg-linear-to-br from-blue-100 to-cyan-100 group-hover:scale-110 transition-transform">
                          <Clock className="h-7 w-7 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-4xl font-bold bg-linear-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {analysisResult.execution_time.toFixed(1)}s
                          </p>
                          <p className="text-sm font-semibold text-gray-600 mt-1">Execution Time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quality Score Card */}
                  <div className="group relative rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 p-px overflow-hidden hover:scale-105 transition-transform duration-300">
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-xl bg-linear-to-br from-purple-100 to-pink-100 group-hover:scale-110 transition-transform">
                          <TrendingUp className="h-7 w-7 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-4xl font-bold bg-linear-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {(analysisResult.quality_score * 100).toFixed(0)}%
                          </p>
                          <p className="text-sm font-semibold text-gray-600 mt-1">Quality Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI Decisions Card */}
                  <div className="group relative rounded-2xl bg-linear-to-br from-orange-500 to-red-500 p-px overflow-hidden hover:scale-105 transition-transform duration-300">
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-xl bg-linear-to-br from-orange-100 to-red-100 group-hover:scale-110 transition-transform">
                          <Brain className="h-7 w-7 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-4xl font-bold bg-linear-to-br from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {analysisResult.ai_decisions}
                          </p>
                          <p className="text-sm font-semibold text-gray-600 mt-1">AI Decisions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recommendations Card */}
                  <div className="group relative rounded-2xl bg-linear-to-br from-green-500 to-emerald-500 p-px overflow-hidden hover:scale-105 transition-transform duration-300">
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 h-full">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="p-3 rounded-xl bg-linear-to-br from-green-100 to-emerald-100 group-hover:scale-110 transition-transform">
                          <Sparkles className="h-7 w-7 text-green-600" />
                        </div>
                        <div>
                          <p className="text-4xl font-bold bg-linear-to-br from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {analysisResult.recommendations}
                          </p>
                          <p className="text-sm font-semibold text-gray-600 mt-1">Recommendations</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Insights */}
                <div className="relative rounded-2xl bg-linear-to-br from-primary to-purple-600 p-px overflow-hidden">
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 rounded-xl bg-linear-to-br from-primary/10 to-purple-600/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Document Intelligence Summary
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Document Type */}
                      <div className="group relative rounded-xl bg-linear-to-br from-gray-50 to-gray-100 p-5 border border-gray-200/50 hover:border-primary/50 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xl font-bold text-gray-900 truncate">
                              {analysisResult.document_type || "Construction Spec"}
                            </p>
                            <p className="text-xs font-medium text-gray-500">Document Type</p>
                          </div>
                        </div>
                      </div>
                      
                      {analysisResult.clauses_found !== undefined && (
                        <div className="group relative rounded-xl bg-linear-to-br from-green-50 to-emerald-100 p-5 border border-green-200/50 hover:border-green-500/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                              <Activity className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xl font-bold text-gray-900">
                                {analysisResult.clauses_found}
                              </p>
                              <p className="text-xs font-medium text-gray-500">Clauses Found</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {analysisResult.divisions_detected !== undefined && (
                        <div className="group relative rounded-xl bg-linear-to-br from-blue-50 to-cyan-100 p-5 border border-blue-200/50 hover:border-blue-500/50 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                              <Zap className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xl font-bold text-gray-900">
                                {analysisResult.divisions_detected}
                              </p>
                              <p className="text-xs font-medium text-gray-500">MasterFormat Divisions</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Metrics Row */}
                {(analysisResult.requirements !== undefined || analysisResult.entities_extracted !== undefined) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analysisResult.requirements !== undefined && (
                      <div className="relative rounded-2xl bg-linear-to-br from-amber-500 to-orange-500 p-px">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-linear-to-br from-amber-100 to-orange-100">
                              <AlertCircle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-3xl font-bold bg-linear-to-br from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                {analysisResult.requirements}
                              </p>
                              <p className="text-sm font-semibold text-gray-600">Requirements</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {analysisResult.entities_extracted !== undefined && (
                      <div className="relative rounded-2xl bg-linear-to-br from-indigo-500 to-purple-500 p-px">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6">
                          <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-linear-to-br from-indigo-100 to-purple-100">
                              <Brain className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-3xl font-bold bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {analysisResult.entities_extracted}
                              </p>
                              <p className="text-sm font-semibold text-gray-600">Entities Extracted</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* All Insights Discovered */}
                {insights.length > 0 && (
                  <div className="relative rounded-2xl bg-linear-to-br from-primary to-purple-600 p-px">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-linear-to-br from-primary/10 to-purple-600/10">
                            <Sparkles className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            All Discoveries ({insights.length})
                          </h3>
                        </div>
                        {insights.length > 8 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAllInsights(!showAllInsights)}
                            className="text-sm"
                          >
                            {showAllInsights ? "Show Less" : "Show All"}
                          </Button>
                        )}
                      </div>
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {visibleInsights.map((insight, idx) => (
                          <div
                            key={`${insight.timestamp}-${insight.type}-${idx}`}
                            className="group relative flex items-start gap-3 p-4 rounded-xl bg-linear-to-br from-gray-50 to-white border border-gray-200/50 hover:border-primary/30 hover:shadow-md transition-all"
                          >
                            <div className="shrink-0 w-3 h-3 bg-linear-to-br from-primary to-purple-600 rounded-full mt-1 group-hover:scale-125 transition-transform" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">{insight.type}:</span>
                                <span className="ml-2 text-gray-700">{insight.message}</span>
                                {insight.value !== undefined && (
                                  <span className="ml-2 font-bold text-gray-900">
                                    ({typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Steps CTA */}
                <div className="relative rounded-2xl bg-linear-to-br from-green-500 via-emerald-500 to-teal-500 p-px overflow-hidden">
                  <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-8">
                    <h4 className="text-2xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                      🎉 What&apos;s Next?
                    </h4>
                    <p className="text-gray-700 mb-6 text-lg">
                      Your analysis is complete and stored. You can now export the full report or continue analyzing more documents.
                    </p>
                    <div className="flex gap-4">
                      <Button 
                        className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all" 
                        onClick={onClose}
                        size="lg"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Export Report
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={onClose}
                        size="lg"
                        className="border-2 border-gray-300 hover:border-green-600 hover:bg-green-50"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Phase Pipeline - Show during analysis */}
            {!isComplete && !isError && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-linear-to-br from-primary/10 to-purple-600/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Analysis Pipeline
                  </h3>
                </div>

                <div className="space-y-3">
                  {PHASE_DETAILS.map((phase, index) => {
                    const phaseNum = index + 1;
                    const isCurrentPhase = phaseNum === progress.phase;
                    const isCompletedPhase = phaseNum < progress.phase;
                    const isFuturePhase = phaseNum > progress.phase;

                    return (
                      <div
                        key={phaseNum}
                        className={cn(
                          "relative rounded-2xl overflow-hidden transition-all duration-300",
                          isCurrentPhase && "ring-2 ring-primary shadow-lg scale-[1.02]",
                          isCompletedPhase && "opacity-75",
                          isFuturePhase && "opacity-50"
                        )}
                      >
                        <div className={cn(
                          "relative p-5 bg-linear-to-br",
                          isCompletedPhase && "from-green-50 to-emerald-50",
                          isCurrentPhase && `from-${phase.color.split(' ')[0].replace('from-', '')}/10 to-${phase.color.split(' ')[1].replace('to-', '')}/10`,
                          isFuturePhase && "from-gray-50 to-gray-100"
                        )}>
                          <div className="flex items-center gap-4">
                            {/* Phase Icon */}
                            <div className={cn(
                              "p-3 rounded-xl transition-all",
                              isCompletedPhase && "bg-green-500",
                              isCurrentPhase && `bg-linear-to-br ${phase.color}`,
                              isFuturePhase && "bg-gray-300"
                            )}>
                              {isCompletedPhase ? (
                                <CheckCircle className="h-6 w-6 text-white" />
                              ) : isCurrentPhase ? (
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                              ) : (
                                <phase.icon className="h-6 w-6 text-white" />
                              )}
                            </div>

                            {/* Phase Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn(
                                  "font-bold text-lg",
                                  isCompletedPhase && "text-green-700",
                                  isCurrentPhase && "text-gray-900",
                                  isFuturePhase && "text-gray-500"
                                )}>
                                  Phase {phaseNum}: {phase.name}
                                </h4>
                                {isCompletedPhase && (
                                  <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    ✓ Complete
                                  </span>
                                )}
                                {isCurrentPhase && (
                                  <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full animate-pulse">
                                    ⚡ In Progress
                                  </span>
                                )}
                              </div>
                              <p className={cn(
                                "text-sm",
                                isCurrentPhase && "text-gray-700 font-medium",
                                !isCurrentPhase && "text-gray-500"
                              )}>
                                {isCurrentPhase && progress.message ? progress.message : phase.description}
                              </p>

                              {/* Progress bar for current phase */}
                              {isCurrentPhase && (
                                <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full bg-linear-to-r ${phase.color} transition-all duration-500`}
                                    style={{ width: `${((progress.progress - ((phaseNum - 1) * (100 / progress.totalPhases))) / (100 / progress.totalPhases)) * 100}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Live Insights Feed */}
                {insights.length > 0 && (
                  <div className="relative rounded-2xl bg-linear-to-br from-primary to-purple-600 p-px">
                    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-xl bg-linear-to-br from-primary/10 to-purple-600/10">
                          <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          Live Discoveries ({insights.length})
                        </h3>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {insights.slice(-6).map((insight, idx) => (
                          <div
                            key={`${insight.timestamp}-${insight.type}-${idx}`}
                            className="flex items-start gap-3 p-3 rounded-xl bg-linear-to-br from-gray-50 to-white border border-gray-200/50 animate-fade-in"
                          >
                            <div className="shrink-0 w-2 h-2 bg-linear-to-br from-primary to-purple-600 rounded-full mt-1.5 animate-pulse" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm">
                                <span className="font-bold bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">{insight.type}:</span>
                                <span className="ml-2 text-gray-700">{insight.message}</span>
                                {insight.value !== undefined && (
                                  <span className="ml-2 font-bold text-gray-900">
                                    ({typeof insight.value === 'number' ? insight.value.toLocaleString() : insight.value})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
                  <AlertCircle className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis Failed
                </h3>
                <p className="text-gray-600 mb-6">
                  {progress.message || "An error occurred during the analysis process. Please try again."}
                </p>
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50/80 backdrop-blur-sm flex items-center justify-between">
          <div className="text-xs text-gray-600 flex items-center gap-2">
            {isRunning && (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                <span>AI analysis running with real-time streaming</span>
              </>
            )}
            {isComplete && (
              <>
                <CheckCircle className="h-3 w-3 text-green-600" />
                <span>Analysis complete • Ready for export</span>
              </>
            )}
            {isError && (
              <>
                <AlertCircle className="h-3 w-3 text-red-600" />
                <span>Analysis encountered an error</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isRunning && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Analysis
              </Button>
            )}
            {(isComplete || isError) && (
              <Button
                onClick={onClose}
                size="sm"
                className="bg-primary hover:bg-primary/90"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
