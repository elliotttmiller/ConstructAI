"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Loader2, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/app/lib/utils";
import type { AnalysisPhase } from "@/app/lib/types";

interface AutonomousProgressTrackerProps {
  isProcessing: boolean;
  currentPhase?: AnalysisPhase;
  progress?: number;
  onComplete?: () => void;
}

const PHASES: AnalysisPhase[] = [
  "initialization",
  "document_understanding",
  "deep_analysis",
  "risk_assessment",
  "cost_intelligence",
  "compliance_validation",
  "strategic_planning",
  "cross_validation",
  "synthesis",
  "quality_assurance",
];

export function AutonomousProgressTracker({
  isProcessing,
  currentPhase,
  progress = 0,
  onComplete,
}: AutonomousProgressTrackerProps) {
  // Calculate phase progress based on current phase
  const getPhaseStatus = (phase: AnalysisPhase): "pending" | "in_progress" | "completed" => {
    if (!currentPhase) return "pending";
    
    const currentIndex = PHASES.indexOf(currentPhase);
    const phaseIndex = PHASES.indexOf(phase);
    
    if (phaseIndex < currentIndex) return "completed";
    if (phaseIndex === currentIndex) return "in_progress";
    return "pending";
  };

  // Estimate time remaining
  const estimatedTimeRemaining = useMemo(() => {
    if (!currentPhase || !isProcessing) return null;
    const currentIndex = PHASES.indexOf(currentPhase);
    const remainingPhases = PHASES.length - currentIndex;
    const avgTimePerPhase = 5;
    return remainingPhases * avgTimePerPhase;
  }, [currentPhase, isProcessing]);

  // Complete callback
  useEffect(() => {
    if (!isProcessing && progress === 100 && onComplete) {
      onComplete();
    }
  }, [isProcessing, progress, onComplete]);

  const getPhaseLabel = (phase: AnalysisPhase): string => {
    const labels: Record<AnalysisPhase, string> = {
      initialization: "Initializing AI System",
      document_understanding: "Understanding Document",
      deep_analysis: "Deep Structural Analysis",
      risk_assessment: "Risk Assessment",
      cost_intelligence: "Cost Intelligence",
      compliance_validation: "Compliance Validation",
      strategic_planning: "Strategic Planning",
      cross_validation: "Cross Validation",
      synthesis: "Executive Synthesis",
      quality_assurance: "Quality Assurance",
    };
    return labels[phase];
  };

  const getPhaseIcon = (status: "pending" | "in_progress" | "completed") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "pending":
        return <Clock className="h-4 w-4 text-neutral-300" />;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className={cn("h-6 w-6", isProcessing ? "animate-pulse text-primary" : "text-success")} />
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {isProcessing ? "Autonomous AI Analysis" : "Analysis Complete"}
              </h3>
              <p className="text-sm text-neutral-600">
                {isProcessing
                  ? `Processing 10-phase autonomous workflow...`
                  : "All phases completed successfully"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{Math.round(progress)}%</div>
            {isProcessing && estimatedTimeRemaining !== null && (
              <div className="text-xs text-neutral-600">~{estimatedTimeRemaining}s remaining</div>
            )}
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-6 h-3 w-full overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full bg-linear-to-r from-primary to-success transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Phase List */}
        <div className="space-y-2">
          {PHASES.map((phase) => {
            const status = getPhaseStatus(phase);
            const isActive = currentPhase === phase;

            return (
              <div
                key={phase}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 transition-all",
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : status === "completed"
                    ? "border-success/20 bg-success/5"
                    : "border-neutral-200 bg-surface"
                )}
              >
                <div className="shrink-0">{getPhaseIcon(status)}</div>
                <div className="flex-1">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isActive
                        ? "text-primary"
                        : status === "completed"
                        ? "text-success"
                        : "text-neutral-400"
                    )}
                  >
                    {getPhaseLabel(phase)}
                  </div>
                  {isActive && (
                    <div className="mt-1 text-xs text-neutral-600">
                      AI is analyzing construction intelligence...
                    </div>
                  )}
                </div>
                {status === "completed" && (
                  <div className="shrink-0 text-xs text-success">✓</div>
                )}
              </div>
            );
          })}
        </div>

        {/* AI Activity Indicator */}
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>AI is making decisions and generating insights...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Hook for managing autonomous analysis progress
 */
export function useAutonomousProgress() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase | undefined>();
  const [progress, setProgress] = useState(0);

  const startProgress = async () => {
    setIsProcessing(true);
    setProgress(0);

    // Simulate progress through phases
    for (let i = 0; i < PHASES.length; i++) {
      setCurrentPhase(PHASES[i]);
      
      // Simulate phase duration (2-8 seconds per phase)
      const phaseDuration = Math.random() * 6000 + 2000;
      const steps = 20;
      const stepDuration = phaseDuration / steps;

      for (let step = 0; step < steps; step++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
        const phaseProgress = ((i + step / steps) / PHASES.length) * 100;
        setProgress(phaseProgress);
      }
    }

    setProgress(100);
    setIsProcessing(false);
  };

  const resetProgress = () => {
    setIsProcessing(false);
    setCurrentPhase(undefined);
    setProgress(0);
  };

  return {
    isProcessing,
    currentPhase,
    progress,
    startProgress,
    resetProgress,
  };
}
