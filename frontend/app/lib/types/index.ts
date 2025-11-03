/**
 * Type definitions for ConstructAI frontend
 * These types match the backend API contracts
 */

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "planning" | "in_progress" | "completed" | "on_hold" | "archived";
  budget: number;
  total_cost?: number;
  total_tasks: number;
  start_date?: string;
  target_end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  dependencies: string[];
  status: "pending" | "in_progress" | "completed";
  resources: Resource[];
  compliance_requirements?: string[];
}

export interface Resource {
  id: string;
  name: string;
  type: "LABOR" | "EQUIPMENT" | "MATERIAL" | "BUDGET";
  quantity: number;
  unit: string;
  cost_per_unit: number;
}

export interface AuditResult {
  overall_score: number;
  risks: Risk[];
  compliance_issues: ComplianceIssue[];
  bottlenecks: Bottleneck[];
  resource_conflicts: ResourceConflict[];
}

export interface Risk {
  id: string;
  category: "schedule" | "budget" | "resource" | "compliance";
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  mitigation?: string;
}

export interface ComplianceIssue {
  standard: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  recommendation: string;
}

export interface Bottleneck {
  task_id: string;
  task_name: string;
  impact: string;
  dependent_tasks: number;
}

export interface ResourceConflict {
  resource_id: string;
  resource_name: string;
  conflicting_tasks: string[];
  description: string;
}

export interface OptimizationResult {
  summary: OptimizationSummary;
  optimized_project: Project;
  optimizations_applied: Optimization[];
}

export interface OptimizationSummary {
  duration_reduction_days: number;
  cost_savings: number;
  parallel_opportunities: number;
  bottlenecks_resolved: number;
}

export interface Optimization {
  type: "parallel_execution" | "bottleneck_removal" | "resource_balancing" | "cost_reduction";
  description: string;
  impact: string;
}

export interface AnalysisProgress {
  status: "queued" | "analyzing" | "optimizing" | "completed" | "error";
  progress: number;
  message: string;
  current_step?: string;
}

export interface APIError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface ProjectConfig {
  analysis_settings: {
    enable_ai_suggestions: boolean;
    risk_threshold: "low" | "medium" | "high";
    optimization_level: "basic" | "standard" | "aggressive";
  };
  notification_settings: {
    email_alerts: boolean;
    slack_integration: boolean;
  };
  export_settings: {
    default_format: "json" | "pdf" | "excel";
    include_metadata: boolean;
  };
}
