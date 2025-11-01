"""
Project Auditor - Autonomous audit system for construction projects.

This module performs comprehensive analysis of construction project plans
to identify risks, compliance issues, and optimization opportunities.
"""

from typing import Dict, List, Tuple
from datetime import datetime, timedelta
from ..models.project import Project, Task, TaskStatus, ResourceType


class AuditResult:
    """Container for audit results."""
    
    def __init__(self, project: Project):
        self.project = project
        self.timestamp = datetime.now()
        self.risks: List[Dict] = []
        self.compliance_issues: List[Dict] = []
        self.efficiency_concerns: List[Dict] = []
        self.bottlenecks: List[Dict] = []
        self.resource_conflicts: List[Dict] = []
        self.overall_score: float = 0.0
        self.recommendations: List[Dict] = []
    
    def add_risk(self, severity: str, category: str, task_id: str, description: str, mitigation: str = ""):
        """Add a risk finding."""
        self.risks.append({
            "severity": severity,
            "category": category,
            "task_id": task_id,
            "description": description,
            "mitigation": mitigation
        })
    
    def add_compliance_issue(self, standard: str, task_id: str, description: str, requirement: str):
        """Add a compliance issue."""
        self.compliance_issues.append({
            "standard": standard,
            "task_id": task_id,
            "description": description,
            "requirement": requirement
        })
    
    def add_bottleneck(self, task_id: str, description: str, impact: str):
        """Add a bottleneck finding."""
        self.bottlenecks.append({
            "task_id": task_id,
            "description": description,
            "impact": impact
        })
    
    def add_resource_conflict(self, task_ids: List[str], resource_type: str, description: str):
        """Add a resource conflict."""
        self.resource_conflicts.append({
            "task_ids": task_ids,
            "resource_type": resource_type,
            "description": description
        })
    
    def calculate_overall_score(self) -> float:
        """Calculate overall project health score (0-100)."""
        # Start with perfect score
        score = 100.0
        
        # Deduct for risks
        score -= len(self.risks) * 5
        score -= sum(5 for r in self.risks if r["severity"] == "high")
        score -= sum(10 for r in self.risks if r["severity"] == "critical")
        
        # Deduct for compliance issues
        score -= len(self.compliance_issues) * 8
        
        # Deduct for bottlenecks
        score -= len(self.bottlenecks) * 6
        
        # Deduct for resource conflicts
        score -= len(self.resource_conflicts) * 7
        
        # Ensure score stays in valid range
        self.overall_score = max(0.0, min(100.0, score))
        return self.overall_score
    
    def generate_summary(self) -> Dict:
        """Generate a summary of the audit results."""
        return {
            "project_id": self.project.id,
            "project_name": self.project.name,
            "audit_timestamp": self.timestamp.isoformat(),
            "overall_score": self.overall_score,
            "summary": {
                "total_risks": len(self.risks),
                "critical_risks": sum(1 for r in self.risks if r["severity"] == "critical"),
                "compliance_issues": len(self.compliance_issues),
                "bottlenecks": len(self.bottlenecks),
                "resource_conflicts": len(self.resource_conflicts)
            },
            "risks": self.risks,
            "compliance_issues": self.compliance_issues,
            "bottlenecks": self.bottlenecks,
            "resource_conflicts": self.resource_conflicts,
            "recommendations": self.recommendations
        }


class ProjectAuditor:
    """
    Autonomous project auditor that analyzes construction plans.
    
    Performs comprehensive analysis following industry best practices:
    - ISO 19650 (BIM)
    - PMI PMBOK (Project Management)
    - OSHA (Safety)
    - RICS standards
    """
    
    def __init__(self):
        self.industry_standards = self._load_industry_standards()
    
    def _load_industry_standards(self) -> Dict:
        """Load industry standards and best practices."""
        return {
            "iso_19650": {
                "min_planning_buffer": 0.1,  # 10% buffer recommended
                "required_compliance_checks": ["safety", "quality", "environmental"]
            },
            "pmbok": {
                "max_critical_path_tasks": 0.3,  # 30% of tasks on critical path is high
                "recommended_float_days": 5
            },
            "osha": {
                "required_safety_requirements": ["fall_protection", "ppe", "hazard_assessment"],
                "high_risk_activities": ["excavation", "steel_erection", "confined_spaces"]
            },
            "rics": {
                "cost_contingency_min": 0.05,  # 5% minimum contingency
                "cost_contingency_max": 0.15   # 15% maximum contingency
            }
        }
    
    def audit(self, project: Project) -> AuditResult:
        """
        Perform comprehensive audit of construction project.
        
        Args:
            project: The project to audit
            
        Returns:
            AuditResult containing all findings and recommendations
        """
        result = AuditResult(project)
        
        # Run all audit checks
        self._check_dependencies(project, result)
        self._check_schedule_feasibility(project, result)
        self._check_resource_allocation(project, result)
        self._check_compliance(project, result)
        self._identify_bottlenecks(project, result)
        self._check_budget_alignment(project, result)
        self._analyze_risk_levels(project, result)
        
        # Calculate overall score
        result.calculate_overall_score()
        
        # Generate recommendations
        self._generate_recommendations(project, result)
        
        return result
    
    def _check_dependencies(self, project: Project, result: AuditResult):
        """Check for circular dependencies and invalid references."""
        errors = project.validate_dependencies()
        for error in errors:
            result.add_risk(
                severity="high",
                category="dependencies",
                task_id="project",
                description=error,
                mitigation="Verify all task dependencies reference valid task IDs"
            )
        
        # Check for circular dependencies
        visited = set()
        rec_stack = set()
        
        def has_cycle(task_id: str) -> bool:
            visited.add(task_id)
            rec_stack.add(task_id)
            
            task = project.get_task_by_id(task_id)
            if task:
                for dep in task.dependencies:
                    if dep not in visited:
                        if has_cycle(dep):
                            return True
                    elif dep in rec_stack:
                        return True
            
            rec_stack.remove(task_id)
            return False
        
        for task in project.tasks:
            if task.id not in visited:
                if has_cycle(task.id):
                    result.add_risk(
                        severity="critical",
                        category="dependencies",
                        task_id=task.id,
                        description=f"Circular dependency detected involving task '{task.id}'",
                        mitigation="Remove circular dependencies to allow proper task sequencing"
                    )
    
    def _check_schedule_feasibility(self, project: Project, result: AuditResult):
        """Analyze schedule for feasibility and realistic timelines."""
        total_duration = sum(task.duration_days for task in project.tasks)
        
        # Check for unrealistic durations
        for task in project.tasks:
            if task.duration_days < 0.5:
                result.add_risk(
                    severity="medium",
                    category="schedule",
                    task_id=task.id,
                    description=f"Task '{task.name}' has very short duration ({task.duration_days} days)",
                    mitigation="Review if duration is realistic for the scope of work"
                )
            elif task.duration_days > 60:
                result.add_risk(
                    severity="medium",
                    category="schedule",
                    task_id=task.id,
                    description=f"Task '{task.name}' has very long duration ({task.duration_days} days)",
                    mitigation="Consider breaking into smaller, manageable subtasks"
                )
        
        # Check if project has target end date and if it's achievable
        if project.target_end_date:
            available_days = (project.target_end_date - project.start_date).days
            if total_duration > available_days * 0.9:  # Using 90% as threshold
                result.add_risk(
                    severity="high",
                    category="schedule",
                    task_id="project",
                    description=f"Project timeline is tight: {total_duration} days of work for {available_days} calendar days",
                    mitigation="Add schedule buffer or parallelize more tasks"
                )
    
    def _check_resource_allocation(self, project: Project, result: AuditResult):
        """Check for resource conflicts and imbalances."""
        # Track resource usage by task
        resource_usage = {}
        
        for task in project.tasks:
            for resource in task.resources:
                key = f"{resource.type.value}_{resource.name}"
                if key not in resource_usage:
                    resource_usage[key] = []
                resource_usage[key].append(task.id)
        
        # Check for over-allocation (simplified - assumes parallel execution)
        for resource_key, task_ids in resource_usage.items():
            if len(task_ids) > 3:  # More than 3 tasks using same resource
                result.add_resource_conflict(
                    task_ids=task_ids,
                    resource_type=resource_key,
                    description=f"Resource '{resource_key}' is allocated to {len(task_ids)} tasks"
                )
        
        # Check for tasks with no resources
        for task in project.tasks:
            if not task.resources:
                result.add_risk(
                    severity="medium",
                    category="resources",
                    task_id=task.id,
                    description=f"Task '{task.name}' has no resources allocated",
                    mitigation="Assign appropriate labor, equipment, and materials"
                )
    
    def _check_compliance(self, project: Project, result: AuditResult):
        """Check compliance with industry standards."""
        standards = self.industry_standards
        
        # Check OSHA compliance
        high_risk_tasks = [
            t for t in project.tasks 
            if any(keyword in t.name.lower() or keyword in t.description.lower() 
                   for keyword in standards["osha"]["high_risk_activities"])
        ]
        
        for task in high_risk_tasks:
            if not task.compliance_requirements:
                result.add_compliance_issue(
                    standard="OSHA",
                    task_id=task.id,
                    description=f"High-risk task '{task.name}' missing safety compliance requirements",
                    requirement="Document required safety measures and compliance checks"
                )
        
        # Check for quality management compliance
        if not any("quality" in req.lower() for task in project.tasks for req in task.compliance_requirements):
            result.add_compliance_issue(
                standard="ISO 9001",
                task_id="project",
                description="No quality management requirements specified",
                requirement="Define quality control and assurance processes"
            )
    
    def _identify_bottlenecks(self, project: Project, result: AuditResult):
        """Identify potential bottlenecks in the project plan."""
        # Find tasks with many dependencies (potential bottlenecks)
        dependency_count = {}
        for task in project.tasks:
            for dep in task.dependencies:
                dependency_count[dep] = dependency_count.get(dep, 0) + 1
        
        for task_id, count in dependency_count.items():
            if count >= 3:  # Task is blocking 3+ other tasks
                task = project.get_task_by_id(task_id)
                if task:
                    result.add_bottleneck(
                        task_id=task_id,
                        description=f"Task '{task.name}' is blocking {count} other tasks",
                        impact="Delays in this task will cascade to multiple dependent tasks"
                    )
        
        # Find tasks with no dependencies that could be started in parallel
        no_dep_tasks = [t for t in project.tasks if not t.dependencies]
        if len(no_dep_tasks) > 10:
            result.add_risk(
                severity="low",
                category="optimization",
                task_id="project",
                description=f"{len(no_dep_tasks)} tasks have no dependencies",
                mitigation="Review if some tasks should have dependencies or can be parallelized"
            )
    
    def _check_budget_alignment(self, project: Project, result: AuditResult):
        """Check budget and cost allocation."""
        total_cost = project.calculate_total_cost()
        
        if project.budget > 0:
            cost_ratio = total_cost / project.budget
            
            if cost_ratio > 0.95:  # Using more than 95% of budget with no contingency
                result.add_risk(
                    severity="high",
                    category="budget",
                    task_id="project",
                    description=f"Estimated costs (${total_cost:,.2f}) are {cost_ratio*100:.1f}% of budget",
                    mitigation=f"Add {self.industry_standards['rics']['cost_contingency_min']*100}%-{self.industry_standards['rics']['cost_contingency_max']*100}% contingency per RICS guidelines"
                )
            elif cost_ratio > 1.0:
                result.add_risk(
                    severity="critical",
                    category="budget",
                    task_id="project",
                    description=f"Estimated costs (${total_cost:,.2f}) exceed budget (${project.budget:,.2f})",
                    mitigation="Reduce scope, negotiate costs, or secure additional funding"
                )
    
    def _analyze_risk_levels(self, project: Project, result: AuditResult):
        """Analyze task-level risks."""
        high_risk_tasks = [t for t in project.tasks if t.risk_level > 0.7]
        
        for task in high_risk_tasks:
            result.add_risk(
                severity="high",
                category="risk",
                task_id=task.id,
                description=f"Task '{task.name}' has high risk level ({task.risk_level:.2f})",
                mitigation="Develop risk mitigation plan and allocate additional contingency"
            )
    
    def _generate_recommendations(self, project: Project, result: AuditResult):
        """Generate actionable recommendations based on audit findings."""
        recommendations = []
        
        if result.risks:
            recommendations.append({
                "priority": "high",
                "category": "risk_management",
                "recommendation": f"Address {len(result.risks)} identified risks, prioritizing {sum(1 for r in result.risks if r['severity'] in ['critical', 'high'])} critical/high severity items"
            })
        
        if result.bottlenecks:
            recommendations.append({
                "priority": "high",
                "category": "schedule_optimization",
                "recommendation": f"Resolve {len(result.bottlenecks)} identified bottlenecks to prevent schedule delays"
            })
        
        if result.compliance_issues:
            recommendations.append({
                "priority": "critical",
                "category": "compliance",
                "recommendation": f"Address {len(result.compliance_issues)} compliance issues before project start"
            })
        
        if result.resource_conflicts:
            recommendations.append({
                "priority": "medium",
                "category": "resource_management",
                "recommendation": f"Resolve {len(result.resource_conflicts)} resource conflicts through better scheduling or additional resources"
            })
        
        # Add optimization recommendations
        recommendations.append({
            "priority": "medium",
            "category": "optimization",
            "recommendation": "Run the Workflow Optimizer to generate an optimized execution strategy"
        })
        
        result.recommendations = recommendations
