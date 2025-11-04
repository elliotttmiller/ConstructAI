"use client";

import * as React from "react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Brain,
  AlertTriangle,
  DollarSign,
  Lightbulb,
  GitCompare,
  Sparkles,
  Shield,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/app/lib/utils";
import type {
  AutonomousAnalysisResult,
  PhaseResult,
} from "@/app/lib/types";

interface AutonomousAnalysisViewerProps {
  analysis: AutonomousAnalysisResult;
  className?: string;
}

export function AutonomousAnalysisViewer({
  analysis,
  className,
}: AutonomousAnalysisViewerProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());

  const togglePhase = (phase: string) => {
    setExpandedPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phase)) {
        next.delete(phase);
      } else {
        next.add(phase);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedPhases(
      new Set(analysis.phases.map((p) => p.phase))
    );
  };

  const collapseAll = () => {
    setExpandedPhases(new Set());
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Autonomous AI Analysis
              </h2>
              <p className="mt-1 text-sm text-neutral-600">
                Complete 10-phase autonomous intelligence analysis
              </p>
              <div className="mt-3 flex items-center gap-4 text-sm">
                <span className="text-neutral-600">
                  Analysis ID:{" "}
                  <span className="font-mono text-foreground">
                    {analysis.analysis_id.slice(0, 8)}...
                  </span>
                </span>
                <span className="text-neutral-600">
                  Duration:{" "}
                  <span className="font-medium text-foreground">
                    {analysis.execution_time_seconds.toFixed(1)}s
                  </span>
                </span>
                <span className="text-neutral-600">
                  LLM Calls:{" "}
                  <span className="font-medium text-foreground">
                    {analysis.ai_workflow.total_llm_calls}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Cards */}
      <div className="space-y-4">
        {analysis.document_understanding && (
          <PhaseCard
            phase="document_understanding"
            title="Document Understanding"
            icon={<FileText className="h-5 w-5" />}
            isExpanded={expandedPhases.has("document_understanding")}
            onToggle={() => togglePhase("document_understanding")}
            phaseResult={analysis.phases.find((p) => p.phase === "document_understanding")}
          >
            <DocumentUnderstandingView data={analysis.document_understanding} />
          </PhaseCard>
        )}

        {analysis.deep_analysis && (
          <PhaseCard
            phase="deep_analysis"
            title="Deep Analysis"
            icon={<Brain className="h-5 w-5" />}
            isExpanded={expandedPhases.has("deep_analysis")}
            onToggle={() => togglePhase("deep_analysis")}
            phaseResult={analysis.phases.find((p) => p.phase === "deep_analysis")}
          >
            <DeepAnalysisView data={analysis.deep_analysis} />
          </PhaseCard>
        )}

        {analysis.risk_assessment && (
          <PhaseCard
            phase="risk_assessment"
            title="Risk Assessment"
            icon={<AlertTriangle className="h-5 w-5" />}
            isExpanded={expandedPhases.has("risk_assessment")}
            onToggle={() => togglePhase("risk_assessment")}
            phaseResult={analysis.phases.find((p) => p.phase === "risk_assessment")}
          >
            <RiskAssessmentView data={analysis.risk_assessment} />
          </PhaseCard>
        )}

        {analysis.cost_intelligence && (
          <PhaseCard
            phase="cost_intelligence"
            title="Cost Intelligence"
            icon={<DollarSign className="h-5 w-5" />}
            isExpanded={expandedPhases.has("cost_intelligence")}
            onToggle={() => togglePhase("cost_intelligence")}
            phaseResult={analysis.phases.find((p) => p.phase === "cost_intelligence")}
          >
            <CostIntelligenceView data={analysis.cost_intelligence} />
          </PhaseCard>
        )}

        {analysis.compliance_validation && (
          <PhaseCard
            phase="compliance_validation"
            title="Compliance Validation"
            icon={<Shield className="h-5 w-5" />}
            isExpanded={expandedPhases.has("compliance_validation")}
            onToggle={() => togglePhase("compliance_validation")}
            phaseResult={analysis.phases.find((p) => p.phase === "compliance_validation")}
          >
            <ComplianceValidationView data={analysis.compliance_validation} />
          </PhaseCard>
        )}

        {analysis.strategic_planning && (
          <PhaseCard
            phase="strategic_planning"
            title="Strategic Planning"
            icon={<Lightbulb className="h-5 w-5" />}
            isExpanded={expandedPhases.has("strategic_planning")}
            onToggle={() => togglePhase("strategic_planning")}
            phaseResult={analysis.phases.find((p) => p.phase === "strategic_planning")}
          >
            <StrategicPlanningView data={analysis.strategic_planning} />
          </PhaseCard>
        )}

        {analysis.cross_validation && (
          <PhaseCard
            phase="cross_validation"
            title="Cross Validation"
            icon={<GitCompare className="h-5 w-5" />}
            isExpanded={expandedPhases.has("cross_validation")}
            onToggle={() => togglePhase("cross_validation")}
            phaseResult={analysis.phases.find((p) => p.phase === "cross_validation")}
          >
            <CrossValidationView data={analysis.cross_validation} />
          </PhaseCard>
        )}

        {analysis.synthesis && (
          <PhaseCard
            phase="synthesis"
            title="Executive Synthesis"
            icon={<Sparkles className="h-5 w-5" />}
            isExpanded={expandedPhases.has("synthesis")}
            onToggle={() => togglePhase("synthesis")}
            phaseResult={analysis.phases.find((p) => p.phase === "synthesis")}
          >
            <ExecutiveSynthesisView data={analysis.synthesis} />
          </PhaseCard>
        )}
      </div>
    </div>
  );
}

interface PhaseCardProps {
  phase: string;
  title: string;
  icon: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  phaseResult?: PhaseResult;
  children: React.ReactNode;
}

function PhaseCard({
  title,
  icon,
  isExpanded,
  onToggle,
  phaseResult,
  children,
}: PhaseCardProps) {
  const statusColor = phaseResult
    ? {
        completed: "text-success",
        failed: "text-error",
        in_progress: "text-primary",
        pending: "text-neutral-400",
      }[phaseResult.status]
    : "text-neutral-400";

  return (
    <Card>
      <button
        onClick={onToggle}
        className="w-full text-left transition-colors hover:bg-neutral-50"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("shrink-0", statusColor)}>{icon}</div>
              <div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                {phaseResult && (
                  <div className="mt-1 flex items-center gap-3 text-xs text-neutral-600">
                    {phaseResult.confidence && (
                      <span>
                        Confidence:{" "}
                        <span className="font-medium text-foreground">
                          {Math.round(phaseResult.confidence * 100)}%
                        </span>
                      </span>
                    )}
                    {phaseResult.duration_seconds && (
                      <span>
                        Duration:{" "}
                        <span className="font-medium text-foreground">
                          {phaseResult.duration_seconds.toFixed(1)}s
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="shrink-0">
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-neutral-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-neutral-400" />
              )}
            </div>
          </div>
        </CardContent>
      </button>
      {isExpanded && (
        <CardContent className="border-t border-neutral-200 p-4">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

// Individual phase view components

function DocumentUnderstandingView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["document_understanding"]>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricItem label="Project Type" value={data.project_type} />
        <MetricItem label="Complexity" value={data.complexity} />
        <MetricItem label="Key Divisions" value={data.key_divisions.length.toString()} />
        <MetricItem label="Entities" value={data.entities_identified.toString()} />
      </div>
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">Summary</h4>
        <p className="text-sm text-neutral-700">{data.summary}</p>
      </div>
      {data.key_divisions.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">Key Divisions</h4>
          <div className="flex flex-wrap gap-2">
            {data.key_divisions.map((div, idx) => (
              <span
                key={idx}
                className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
              >
                {div}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DeepAnalysisView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["deep_analysis"]>;
}) {
  return (
    <div className="space-y-4">
      {data.structural_insights.length > 0 && (
        <ListSection title="Structural Insights" items={data.structural_insights} />
      )}
      {data.technical_requirements.length > 0 && (
        <ListSection title="Technical Requirements" items={data.technical_requirements} />
      )}
      {data.constraints_identified.length > 0 && (
        <ListSection
          title="Constraints Identified"
          items={data.constraints_identified}
          variant="warning"
        />
      )}
      {data.opportunities.length > 0 && (
        <ListSection title="Opportunities" items={data.opportunities} variant="success" />
      )}
    </div>
  );
}

function RiskAssessmentView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["risk_assessment"]>;
}) {
  const riskLevelColor = {
    low: "text-success",
    medium: "text-warning",
    high: "text-error",
    critical: "text-error",
  }[data.risk_level];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <MetricItem
          label="Risk Level"
          value={data.risk_level.toUpperCase()}
          valueClassName={riskLevelColor}
        />
        <MetricItem label="Risk Score" value={data.overall_risk_score.toFixed(2)} />
        <MetricItem label="Contingency" value={`${data.contingency_percentage}%`} />
      </div>
      {data.risk_categories.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Risk Categories</h4>
          <div className="space-y-3">
            {data.risk_categories.map((risk, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">{risk.category}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      {
                        low: "bg-success/10 text-success",
                        medium: "bg-warning/10 text-warning",
                        high: "bg-error/10 text-error",
                        critical: "bg-error/20 text-error",
                      }[risk.severity]
                    )}
                  >
                    {risk.severity.toUpperCase()}
                  </span>
                </div>
                <p className="mb-2 text-sm text-neutral-700">{risk.impact}</p>
                {risk.mitigation_strategies.length > 0 && (
                  <div className="mt-2 border-t border-neutral-200 pt-2">
                    <p className="mb-1 text-xs font-semibold text-neutral-600">
                      Mitigation Strategies:
                    </p>
                    <ul className="list-inside list-disc space-y-1 text-xs text-neutral-700">
                      {risk.mitigation_strategies.map((strategy, sIdx) => (
                        <li key={sIdx}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CostIntelligenceView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["cost_intelligence"]>;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricItem
          label="Total Cost"
          value={`$${data.total_cost_estimate.toLocaleString()}`}
        />
        <MetricItem label="Accuracy Class" value={data.accuracy_class} />
        <MetricItem
          label="Range"
          value={`$${data.accuracy_range.min.toLocaleString()} - $${data.accuracy_range.max.toLocaleString()}`}
        />
        <MetricItem label="Confidence" value={`${Math.round(data.confidence_level * 100)}%`} />
      </div>
      {data.cost_breakdown.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Cost Breakdown</h4>
          <div className="space-y-2">
            {data.cost_breakdown.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded bg-neutral-50 p-2"
              >
                <span className="text-sm text-foreground">{item.division}</span>
                <div className="text-right">
                  <div className="text-sm font-semibold text-foreground">
                    ${item.cost.toLocaleString()}
                  </div>
                  <div className="text-xs text-neutral-600">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.value_engineering_opportunities.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">
            Value Engineering Opportunities
          </h4>
          <div className="space-y-2">
            {data.value_engineering_opportunities.map((opp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-success/20 bg-success/5 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{opp.opportunity}</span>
                  <span className="text-sm font-bold text-success">
                    ${opp.potential_savings.toLocaleString()}
                  </span>
                </div>
                <span className="text-xs text-neutral-600">
                  Effort: <span className="font-medium">{opp.implementation_effort}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComplianceValidationView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["compliance_validation"]>;
}) {
  const statusColor = {
    compliant: "text-success",
    partial: "text-warning",
    non_compliant: "text-error",
  }[data.overall_compliance_status];

  return (
    <div className="space-y-4">
      <MetricItem
        label="Overall Status"
        value={data.overall_compliance_status.replace("_", " ").toUpperCase()}
        valueClassName={statusColor}
      />
      {data.compliance_checks.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Compliance Checks</h4>
          <div className="space-y-2">
            {data.compliance_checks.map((check, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">{check.standard}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      {
                        pass: "bg-success/10 text-success",
                        fail: "bg-error/10 text-error",
                        needs_review: "bg-warning/10 text-warning",
                      }[check.status]
                    )}
                  >
                    {check.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-neutral-700">{check.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StrategicPlanningView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["strategic_planning"]>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">Vision</h4>
        <p className="text-sm text-neutral-700">{data.vision}</p>
      </div>
      {data.strategic_options.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Strategic Options</h4>
          <div className="space-y-3">
            {data.strategic_options.map((option, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
              >
                <h5 className="mb-2 font-medium text-foreground">{option.option}</h5>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-xs font-semibold text-success">Pros:</p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-neutral-700">
                      {option.pros.map((pro, pIdx) => (
                        <li key={pIdx}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold text-error">Cons:</p>
                    <ul className="list-inside list-disc space-y-0.5 text-xs text-neutral-700">
                      {option.cons.map((con, cIdx) => (
                        <li key={cIdx}>{con}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-600">
                  Impact: <span className="font-medium">{option.estimated_impact}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.implementation_roadmap.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Implementation Roadmap</h4>
          <div className="space-y-2">
            {data.implementation_roadmap.map((phase, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-primary/20 bg-primary/5 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">{phase.phase}</span>
                  <span className="text-xs text-neutral-600">{phase.timeline}</span>
                </div>
                <div className="text-xs text-neutral-700">
                  <p className="mb-1 font-semibold">Key Activities:</p>
                  <ul className="list-inside list-disc space-y-0.5">
                    {phase.key_activities.map((activity, aIdx) => (
                      <li key={aIdx}>{activity}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CrossValidationView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["cross_validation"]>;
}) {
  return (
    <div className="space-y-4">
      <MetricItem
        label="Consistency Score"
        value={`${Math.round(data.consistency_score * 100)}%`}
      />
      <MetricItem
        label="Status"
        value={data.validation_status.replace("_", " ").toUpperCase()}
        valueClassName={
          data.validation_status === "validated" ? "text-success" : "text-warning"
        }
      />
      {data.inconsistencies_found.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Inconsistencies Found</h4>
          <div className="space-y-2">
            {data.inconsistencies_found.map((inc, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-warning/20 bg-warning/5 p-3"
              >
                <div className="mb-1 text-xs text-neutral-600">
                  {inc.component_1} ↔ {inc.component_2}
                </div>
                <p className="mb-2 text-sm text-foreground">{inc.issue}</p>
                <p className="text-xs text-neutral-700">
                  Recommendation: <span className="font-medium">{inc.recommendation}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ExecutiveSynthesisView({
  data,
}: {
  data: NonNullable<AutonomousAnalysisResult["synthesis"]>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold text-foreground">Executive Summary</h4>
        <p className="text-sm text-neutral-700">{data.executive_summary}</p>
      </div>
      <MetricItem
        label="Success Probability"
        value={`${Math.round(data.success_probability * 100)}%`}
      />
      {data.key_findings.length > 0 && (
        <ListSection title="Key Findings" items={data.key_findings} variant="info" />
      )}
      {data.critical_decisions.length > 0 && (
        <ListSection title="Critical Decisions" items={data.critical_decisions} variant="warning" />
      )}
      {data.recommended_actions.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Recommended Actions</h4>
          <div className="space-y-2">
            {data.recommended_actions.map((action, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-neutral-200 bg-neutral-50 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-foreground">{action.action}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-semibold",
                      {
                        critical: "bg-error/10 text-error",
                        high: "bg-warning/10 text-warning",
                        medium: "bg-primary/10 text-primary",
                        low: "bg-neutral-200 text-neutral-700",
                      }[action.priority]
                    )}
                  >
                    {action.priority.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-neutral-600">
                  <span>Timeline: {action.timeline}</span>
                  <span className="mx-2">•</span>
                  <span>Outcome: {action.expected_outcome}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components

function MetricItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <div className="text-xs text-neutral-600">{label}</div>
      <div className={cn("font-semibold text-foreground", valueClassName)}>{value}</div>
    </div>
  );
}

function ListSection({
  title,
  items,
  variant = "default",
}: {
  title: string;
  items: string[];
  variant?: "default" | "success" | "warning" | "info";
}) {
  const variantStyles = {
    default: "border-neutral-200 bg-neutral-50",
    success: "border-success/20 bg-success/5",
    warning: "border-warning/20 bg-warning/5",
    info: "border-primary/20 bg-primary/5",
  }[variant];

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{title}</h4>
      <ul className={cn("space-y-1.5 rounded-lg border p-3", variantStyles)}>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-neutral-700">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
