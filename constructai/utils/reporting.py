"""
Utility functions for report generation and data export.
"""

from typing import Dict, Any
import json
from datetime import datetime


def format_currency(amount: float) -> str:
    """Format currency with appropriate symbols."""
    return f"${amount:,.2f}"


def format_percentage(value: float) -> str:
    """Format percentage value."""
    return f"{value:.1f}%"


def format_duration(days: float) -> str:
    """Format duration in days."""
    if days < 1:
        return f"{days*24:.1f} hours"
    return f"{days:.1f} days"


def generate_audit_report(audit_result: Any) -> str:
    """
    Generate a formatted audit report.
    
    Args:
        audit_result: AuditResult object
        
    Returns:
        Formatted report string
    """
    summary = audit_result.generate_summary()
    
    report = []
    report.append("=" * 80)
    report.append("CONSTRUCTAI - PROJECT AUDIT REPORT")
    report.append("=" * 80)
    report.append("")
    report.append(f"Project: {summary['project_name']} (ID: {summary['project_id']})")
    report.append(f"Audit Date: {summary['audit_timestamp']}")
    report.append(f"Overall Score: {summary['overall_score']:.1f}/100")
    report.append("")
    
    report.append("-" * 80)
    report.append("EXECUTIVE SUMMARY")
    report.append("-" * 80)
    report.append(f"Total Risks Identified: {summary['summary']['total_risks']}")
    report.append(f"  - Critical Risks: {summary['summary']['critical_risks']}")
    report.append(f"Compliance Issues: {summary['summary']['compliance_issues']}")
    report.append(f"Bottlenecks: {summary['summary']['bottlenecks']}")
    report.append(f"Resource Conflicts: {summary['summary']['resource_conflicts']}")
    report.append("")
    
    if summary['risks']:
        report.append("-" * 80)
        report.append("RISKS")
        report.append("-" * 80)
        for i, risk in enumerate(summary['risks'], 1):
            report.append(f"{i}. [{risk['severity'].upper()}] {risk['category']}")
            report.append(f"   Task: {risk['task_id']}")
            report.append(f"   Description: {risk['description']}")
            if risk.get('mitigation'):
                report.append(f"   Mitigation: {risk['mitigation']}")
            report.append("")
    
    if summary['compliance_issues']:
        report.append("-" * 80)
        report.append("COMPLIANCE ISSUES")
        report.append("-" * 80)
        for i, issue in enumerate(summary['compliance_issues'], 1):
            report.append(f"{i}. {issue['standard']} - Task: {issue['task_id']}")
            report.append(f"   Description: {issue['description']}")
            report.append(f"   Requirement: {issue['requirement']}")
            report.append("")
    
    if summary['bottlenecks']:
        report.append("-" * 80)
        report.append("BOTTLENECKS")
        report.append("-" * 80)
        for i, bottleneck in enumerate(summary['bottlenecks'], 1):
            report.append(f"{i}. Task: {bottleneck['task_id']}")
            report.append(f"   Description: {bottleneck['description']}")
            report.append(f"   Impact: {bottleneck['impact']}")
            report.append("")
    
    if summary['recommendations']:
        report.append("-" * 80)
        report.append("RECOMMENDATIONS")
        report.append("-" * 80)
        for i, rec in enumerate(summary['recommendations'], 1):
            report.append(f"{i}. [{rec['priority'].upper()}] {rec['category']}")
            report.append(f"   {rec['recommendation']}")
            report.append("")
    
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)
    
    return "\n".join(report)


def generate_optimization_report(opt_result: Any) -> str:
    """
    Generate a formatted optimization report.
    
    Args:
        opt_result: OptimizationResult object
        
    Returns:
        Formatted report string
    """
    summary = opt_result.generate_summary()
    metrics = summary['metrics']
    
    report = []
    report.append("=" * 80)
    report.append("CONSTRUCTAI - WORKFLOW OPTIMIZATION REPORT")
    report.append("=" * 80)
    report.append("")
    report.append(f"Project: {summary['project_name']} (ID: {summary['project_id']})")
    report.append(f"Optimization Date: {summary['optimization_timestamp']}")
    report.append("")
    
    report.append("-" * 80)
    report.append("PERFORMANCE COMPARISON")
    report.append("-" * 80)
    
    orig = metrics['original']
    opt = metrics['optimized']
    imp = metrics['improvements']
    
    report.append("")
    report.append("SCHEDULE METRICS:")
    report.append(f"  Original Critical Path: {format_duration(orig['critical_path_duration'])}")
    report.append(f"  Optimized Critical Path: {format_duration(opt['critical_path_duration'])}")
    report.append(f"  Reduction: {format_duration(imp['duration_reduction_days'])} ({format_percentage(imp['duration_reduction_percent'])})")
    report.append("")
    
    report.append("COST METRICS:")
    report.append(f"  Original Estimated Cost: {format_currency(orig['total_cost'])}")
    report.append(f"  Optimized Estimated Cost: {format_currency(opt['total_cost'])}")
    report.append(f"  Savings: {format_currency(imp['cost_savings'])} ({format_percentage(imp['cost_savings_percent'])})")
    report.append("")
    
    report.append("TASK METRICS:")
    report.append(f"  Total Tasks: {orig['total_tasks']}")
    report.append(f"  Average Task Duration: {format_duration(opt['avg_task_duration'])}")
    report.append("")
    
    if summary['improvements']:
        report.append("-" * 80)
        report.append("OPTIMIZATIONS APPLIED")
        report.append("-" * 80)
        for i, improvement in enumerate(summary['improvements'], 1):
            report.append(f"{i}. {improvement['category'].upper()}")
            report.append(f"   Description: {improvement['description']}")
            report.append(f"   Impact: {improvement['impact']}")
            if improvement.get('metric_change'):
                report.append(f"   Metric Change: {improvement['metric_change']}")
            report.append("")
    
    report.append("-" * 80)
    report.append("RECOMMENDATION")
    report.append("-" * 80)
    report.append(summary['recommendation'])
    report.append("")
    
    report.append("=" * 80)
    report.append("END OF REPORT")
    report.append("=" * 80)
    
    return "\n".join(report)


def export_to_json(data: Dict, filename: str) -> None:
    """Export data to JSON file."""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def generate_project_summary(project: Any) -> str:
    """Generate a summary of project details."""
    lines = []
    lines.append(f"Project: {project.name}")
    lines.append(f"ID: {project.id}")
    lines.append(f"Description: {project.description}")
    lines.append(f"Start Date: {project.start_date}")
    if project.target_end_date:
        lines.append(f"Target End Date: {project.target_end_date}")
    lines.append(f"Budget: {format_currency(project.budget)}")
    lines.append(f"Total Tasks: {len(project.tasks)}")
    lines.append(f"Estimated Cost: {format_currency(project.calculate_total_cost())}")
    return "\n".join(lines)
