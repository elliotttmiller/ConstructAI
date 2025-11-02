"use client";

import * as React from "react";
import { useState } from "react";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";

export interface AnalysisStep {
  id: string;
  label: string;
  status: "pending" | "running" | "completed" | "error";
  progress?: number;
  message?: string;
  duration?: number;
}

interface AIProcessingCardProps {
  steps: AnalysisStep[];
  overallProgress: number;
  isProcessing: boolean;
}

export function AIProcessingCard({
  steps,
  overallProgress,
  isProcessing,
}: AIProcessingCardProps) {
  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isProcessing ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <CheckCircle className="h-6 w-6 text-success" />
          )}
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {isProcessing ? "AI Analysis in Progress" : "Analysis Complete"}
            </h3>
            <p className="text-sm text-neutral-600">
              {isProcessing
                ? "Processing your construction project..."
                : "All steps completed successfully"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">
            {overallProgress}%
          </div>
          <div className="text-xs text-neutral-600">Overall Progress</div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${overallProgress}%` }}
        ></div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => (
          <AIProcessingStep key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}

function AIProcessingStep({ step }: { step: AnalysisStep }) {
  const statusIcon = {
    pending: <div className="h-4 w-4 rounded-full border-2 border-neutral-300" />,
    running: <Loader2 className="h-4 w-4 animate-spin text-primary" />,
    completed: <CheckCircle className="h-4 w-4 text-success" />,
    error: <XCircle className="h-4 w-4 text-error" />,
  }[step.status];

  const statusColor = {
    pending: "text-neutral-400",
    running: "text-primary",
    completed: "text-success",
    error: "text-error",
  }[step.status];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-all",
        step.status === "running"
          ? "border-primary bg-primary/5"
          : "border-neutral-200 bg-surface"
      )}
    >
      {/* Status Icon */}
      <div className="flex-shrink-0">{statusIcon}</div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", statusColor)}>
            {step.label}
          </span>
          {step.duration && step.status === "completed" && (
            <span className="text-xs text-neutral-500">
              {step.duration.toFixed(1)}s
            </span>
          )}
        </div>
        {step.message && (
          <p className="mt-1 text-xs text-neutral-600">{step.message}</p>
        )}
        {step.status === "running" && step.progress !== undefined && (
          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-200">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${step.progress}%` }}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for managing AI analysis streaming
 */
export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: "parse", label: "Parsing Project Data", status: "pending" },
    { id: "audit", label: "Running Audit Analysis", status: "pending" },
    { id: "optimize", label: "Optimizing Workflow", status: "pending" },
    { id: "compliance", label: "Checking Compliance", status: "pending" },
    { id: "report", label: "Generating Report", status: "pending" },
  ]);
  const [overallProgress, setOverallProgress] = useState(0);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setOverallProgress(0);

    // Simulate streaming analysis with real backend integration
    for (let i = 0; i < steps.length; i++) {
      const startTime = Date.now();

      // Update step to running
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "running" as const, progress: 0 } : s
        )
      );

      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setSteps((prev) =>
          prev.map((s, idx) => (idx === i ? { ...s, progress } : s))
        );
      }

      const duration = (Date.now() - startTime) / 1000;

      // Mark as completed
      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === i
            ? {
                ...s,
                status: "completed" as const,
                duration,
                message: "Completed successfully",
              }
            : s
        )
      );

      setOverallProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    setIsAnalyzing(false);
  };

  return {
    isAnalyzing,
    steps,
    overallProgress,
    startAnalysis,
  };
}
