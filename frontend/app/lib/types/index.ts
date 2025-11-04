/**
 * Type definitions for ConstructAI frontend
 * These types match the backend API contracts
 */

export interface DocumentMetadata {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  document_type: string;
  uploaded_at: string;
  analysis_status: string;
  analysis_result?: Record<string, unknown>;
}

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
  documents?: DocumentMetadata[];
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

// ============================================================================
// AUTONOMOUS AI TYPES
// ============================================================================

/**
 * Analysis phase in the autonomous AI workflow
 */
export type AnalysisPhase =
  | "initialization"
  | "document_understanding"
  | "deep_analysis"
  | "risk_assessment"
  | "cost_intelligence"
  | "compliance_validation"
  | "strategic_planning"
  | "cross_validation"
  | "synthesis"
  | "quality_assurance";

/**
 * Quality metrics from autonomous AI analysis
 */
export interface QualityMetrics {
  quality_score: number;        // Overall quality score (0-1)
  confidence_score: number;     // AI confidence in analysis (0-1)
  completeness_score: number;   // Analysis completeness (0-1)
  ai_iterations: number;        // Number of AI iterations performed
  ai_decisions_made: number;    // Number of AI decisions made
}

/**
 * Individual phase result in autonomous workflow
 */
export interface PhaseResult {
  phase: AnalysisPhase;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: unknown;             // Phase-specific result data
  confidence?: number;          // AI confidence for this phase
  timestamp?: string;           // Phase completion timestamp
  duration_seconds?: number;    // Phase execution duration
  error?: string;              // Error message if phase failed
}

/**
 * Document understanding analysis result
 */
export interface DocumentUnderstanding {
  project_type: string;
  complexity: "low" | "medium" | "high" | "very_high";
  key_divisions: string[];
  entities_identified: number;
  confidence_score: number;
  summary: string;
}

/**
 * Deep analysis result with structural insights
 */
export interface DeepAnalysis {
  structural_insights: string[];
  technical_requirements: string[];
  constraints_identified: string[];
  opportunities: string[];
  complexity_factors: string[];
}

/**
 * Quantitative risk assessment result
 */
export interface RiskAssessment {
  overall_risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  risk_categories: {
    category: string;
    severity: "low" | "medium" | "high" | "critical";
    probability: number;
    impact: string;
    mitigation_strategies: string[];
  }[];
  contingency_percentage: number;
  monitoring_plan: string[];
}

/**
 * Quantitative cost intelligence result
 */
export interface CostIntelligence {
  total_cost_estimate: number;
  accuracy_class: "Class 1" | "Class 2" | "Class 3" | "Class 4" | "Class 5";
  accuracy_range: {
    min: number;
    max: number;
  };
  cost_breakdown: {
    division: string;
    cost: number;
    percentage: number;
  }[];
  value_engineering_opportunities: {
    opportunity: string;
    potential_savings: number;
    implementation_effort: "low" | "medium" | "high";
  }[];
  confidence_level: number;
  assumptions: string[];
}

/**
 * Compliance validation result
 */
export interface ComplianceValidation {
  overall_compliance_status: "compliant" | "partial" | "non_compliant";
  compliance_checks: {
    standard: string;
    status: "pass" | "fail" | "needs_review";
    description: string;
    recommendations?: string[];
  }[];
  safety_requirements: string[];
  regulatory_requirements: string[];
}

/**
 * Strategic planning recommendations
 */
export interface StrategicPlanning {
  vision: string;
  strategic_options: {
    option: string;
    pros: string[];
    cons: string[];
    estimated_impact: string;
  }[];
  implementation_roadmap: {
    phase: string;
    timeline: string;
    key_activities: string[];
    dependencies: string[];
  }[];
  success_metrics: string[];
}

/**
 * Cross-validation result ensuring consistency
 */
export interface CrossValidation {
  consistency_score: number;
  inconsistencies_found: {
    component_1: string;
    component_2: string;
    issue: string;
    recommendation: string;
  }[];
  validation_status: "validated" | "needs_review";
}

/**
 * Executive synthesis combining all analysis
 */
export interface ExecutiveSynthesis {
  executive_summary: string;
  key_findings: string[];
  critical_decisions: string[];
  recommended_actions: {
    action: string;
    priority: "critical" | "high" | "medium" | "low";
    timeline: string;
    expected_outcome: string;
  }[];
  success_probability: number;
}

/**
 * Complete autonomous AI analysis result
 */
export interface AutonomousAnalysisResult {
  analysis_id: string;
  project_id: string;
  timestamp: string;
  execution_time_seconds: number;
  
  // Phase-by-phase results
  phases: PhaseResult[];
  
  // Detailed analysis results
  document_understanding?: DocumentUnderstanding;
  deep_analysis?: DeepAnalysis;
  risk_assessment?: RiskAssessment;
  cost_intelligence?: CostIntelligence;
  compliance_validation?: ComplianceValidation;
  strategic_planning?: StrategicPlanning;
  cross_validation?: CrossValidation;
  synthesis?: ExecutiveSynthesis;
  
  // Quality metrics
  quality_metrics: QualityMetrics;
  
  // AI workflow metadata
  ai_workflow: {
    reasoning_patterns_used: string[];
    task_types_executed: string[];
    total_llm_calls: number;
    context_windows_used: number;
  };
}

/**
 * Response from autonomous document upload endpoint
 */
export interface AutonomousUploadResult {
  status: "success" | "error";
  message?: string;
  analysis_type: "fully_autonomous_ai";
  
  // The complete autonomous analysis
  autonomous_result: AutonomousAnalysisResult;
  
  // Quality metrics (also in autonomous_result, but top-level for convenience)
  quality_metrics: QualityMetrics;
  
  // Upload metadata
  document_id?: string;
  filename?: string;
  processing_time_seconds?: number;
}

/**
 * Progress update for autonomous analysis (for real-time tracking)
 */
export interface AutonomousAnalysisProgress {
  current_phase: AnalysisPhase;
  phase_number: number;
  total_phases: number;
  progress_percentage: number;
  phase_status: "pending" | "in_progress" | "completed" | "failed";
  message: string;
  estimated_time_remaining_seconds?: number;
}
