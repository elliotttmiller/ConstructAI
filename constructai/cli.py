"""
Command-line interface for ConstructAI.
"""

import sys
import argparse
from datetime import datetime, timedelta

from constructai.models.project import Project, Task, Resource, TaskStatus, ResourceType
from constructai.engine.auditor import ProjectAuditor
from constructai.engine.optimizer import WorkflowOptimizer
from constructai.engine.compliance import ComplianceChecker
from constructai.utils.reporting import (
    generate_audit_report,
    generate_optimization_report,
    generate_project_summary,
    export_to_json
)


def create_demo_project() -> Project:
    """Create a demonstration construction project."""
    project = Project(
        id="demo-001",
        name="Commercial Office Building Construction",
        description="Multi-story commercial office building with underground parking",
        start_date=datetime.now(),
        target_end_date=datetime.now() + timedelta(days=365),
        budget=5000000.0,
        metadata={"location": "Downtown", "floors": 5, "area_sqft": 50000}
    )
    
    # Add tasks
    tasks = [
        Task(
            id="T001",
            name="Site Survey and Preparation",
            description="Initial site survey, clearing, and preparation",
            duration_days=14,
            dependencies=[],
            resources=[
                Resource("R001", "Survey Crew", ResourceType.LABOR, 3, "workers", 800),
                Resource("R002", "Excavator", ResourceType.EQUIPMENT, 1, "unit", 1200),
            ],
            priority=5,
            compliance_requirements=["Environmental clearance", "Site safety plan"]
        ),
        Task(
            id="T002",
            name="Excavation for Foundation",
            description="Excavate foundation and underground parking levels",
            duration_days=21,
            dependencies=["T001"],
            resources=[
                Resource("R003", "Excavation Crew", ResourceType.LABOR, 8, "workers", 850),
                Resource("R004", "Heavy Equipment", ResourceType.EQUIPMENT, 3, "units", 2500),
            ],
            priority=5,
            risk_level=0.6,
            compliance_requirements=["OSHA excavation safety", "Shoring requirements"]
        ),
        Task(
            id="T003",
            name="Foundation and Underground Structure",
            description="Pour foundation and construct underground parking structure",
            duration_days=45,
            dependencies=["T002"],
            resources=[
                Resource("R005", "Concrete Crew", ResourceType.LABOR, 12, "workers", 950),
                Resource("R006", "Concrete", ResourceType.MATERIAL, 500, "cubic yards", 150),
                Resource("R007", "Rebar", ResourceType.MATERIAL, 50000, "lbs", 0.85),
            ],
            priority=5,
            compliance_requirements=["Concrete testing", "Structural inspection"]
        ),
        Task(
            id="T004",
            name="Steel Structure Erection",
            description="Erect structural steel frame for all floors",
            duration_days=60,
            dependencies=["T003"],
            resources=[
                Resource("R008", "Steel Workers", ResourceType.LABOR, 15, "workers", 1200),
                Resource("R009", "Structural Steel", ResourceType.MATERIAL, 250, "tons", 2500),
                Resource("R010", "Crane", ResourceType.EQUIPMENT, 2, "units", 3500),
            ],
            priority=5,
            risk_level=0.8,
            compliance_requirements=["OSHA steel erection", "Fall protection", "Crane safety"]
        ),
        Task(
            id="T005",
            name="Floor Slabs and Decking",
            description="Install floor decking and pour concrete slabs",
            duration_days=50,
            dependencies=["T004"],
            resources=[
                Resource("R011", "Concrete Crew", ResourceType.LABOR, 10, "workers", 950),
                Resource("R012", "Concrete", ResourceType.MATERIAL, 400, "cubic yards", 150),
                Resource("R013", "Decking Material", ResourceType.MATERIAL, 40000, "sqft", 3.5),
            ],
            priority=4
        ),
        Task(
            id="T006",
            name="Exterior Envelope - Walls and Windows",
            description="Install exterior walls, insulation, and window systems",
            duration_days=55,
            dependencies=["T005"],
            resources=[
                Resource("R014", "Facade Crew", ResourceType.LABOR, 12, "workers", 1000),
                Resource("R015", "Curtain Wall System", ResourceType.MATERIAL, 35000, "sqft", 45),
                Resource("R016", "Windows", ResourceType.MATERIAL, 200, "units", 800),
            ],
            priority=4,
            compliance_requirements=["Energy code compliance", "Waterproofing standards"]
        ),
        Task(
            id="T007",
            name="Roofing System",
            description="Install roofing membrane and drainage system",
            duration_days=20,
            dependencies=["T005"],
            resources=[
                Resource("R017", "Roofing Crew", ResourceType.LABOR, 6, "workers", 900),
                Resource("R018", "Roofing Materials", ResourceType.MATERIAL, 12000, "sqft", 8.5),
            ],
            priority=4,
            compliance_requirements=["Roofing warranty", "Drainage testing"]
        ),
        Task(
            id="T008",
            name="MEP Rough-In",
            description="Install mechanical, electrical, and plumbing rough-in",
            duration_days=65,
            dependencies=["T005", "T006"],
            resources=[
                Resource("R019", "HVAC Crew", ResourceType.LABOR, 8, "workers", 1100),
                Resource("R020", "Electrical Crew", ResourceType.LABOR, 10, "workers", 1050),
                Resource("R021", "Plumbing Crew", ResourceType.LABOR, 6, "workers", 950),
                Resource("R022", "MEP Materials", ResourceType.MATERIAL, 1, "lot", 250000),
            ],
            priority=5,
            compliance_requirements=["Electrical code", "Plumbing code", "HVAC standards"]
        ),
        Task(
            id="T009",
            name="Interior Framing and Drywall",
            description="Frame interior walls and install drywall",
            duration_days=40,
            dependencies=["T008"],
            resources=[
                Resource("R023", "Framing Crew", ResourceType.LABOR, 12, "workers", 850),
                Resource("R024", "Drywall Crew", ResourceType.LABOR, 10, "workers", 800),
                Resource("R025", "Framing/Drywall Materials", ResourceType.MATERIAL, 1, "lot", 125000),
            ],
            priority=3
        ),
        Task(
            id="T010",
            name="Interior Finishes",
            description="Painting, flooring, ceiling tiles, and trim work",
            duration_days=45,
            dependencies=["T009"],
            resources=[
                Resource("R026", "Finish Crew", ResourceType.LABOR, 15, "workers", 750),
                Resource("R027", "Finish Materials", ResourceType.MATERIAL, 1, "lot", 180000),
            ],
            priority=3
        ),
        Task(
            id="T011",
            name="MEP Final Installation and Testing",
            description="Complete MEP installation, fixtures, and commissioning",
            duration_days=35,
            dependencies=["T009"],
            resources=[
                Resource("R028", "MEP Crews", ResourceType.LABOR, 15, "workers", 1100),
                Resource("R029", "Fixtures and Equipment", ResourceType.MATERIAL, 1, "lot", 200000),
            ],
            priority=4,
            compliance_requirements=["System commissioning", "Energy testing"]
        ),
        Task(
            id="T012",
            name="Final Inspections and Punch List",
            description="Complete all final inspections and punch list items",
            duration_days=20,
            dependencies=["T010", "T011"],
            resources=[
                Resource("R030", "Inspection Crew", ResourceType.LABOR, 5, "workers", 900),
            ],
            priority=5,
            compliance_requirements=["Building permit final", "Occupancy certificate"]
        ),
    ]
    
    for task in tasks:
        project.add_task(task)
    
    return project


def cmd_audit(args):
    """Run project audit."""
    print("\n" + "="*80)
    print("CONSTRUCTAI - PROJECT AUDITOR")
    print("="*80 + "\n")
    
    # Create demo project
    project = create_demo_project()
    
    print("Loading project...")
    print(generate_project_summary(project))
    print("\n" + "-"*80 + "\n")
    
    # Run audit
    print("Running comprehensive audit...")
    auditor = ProjectAuditor()
    result = auditor.audit(project)
    
    # Generate report
    report = generate_audit_report(result)
    print("\n" + report)
    
    # Export if requested
    if args.output:
        export_to_json(result.generate_summary(), args.output)
        print(f"\nAudit results exported to: {args.output}")


def cmd_optimize(args):
    """Run workflow optimization."""
    print("\n" + "="*80)
    print("CONSTRUCTAI - WORKFLOW OPTIMIZER")
    print("="*80 + "\n")
    
    # Create demo project
    project = create_demo_project()
    
    print("Loading project...")
    print(generate_project_summary(project))
    print("\n" + "-"*80 + "\n")
    
    # Run optimization
    print("Generating optimized execution strategy...")
    optimizer = WorkflowOptimizer()
    result = optimizer.optimize(project)
    
    # Generate report
    report = generate_optimization_report(result)
    print("\n" + report)
    
    # Export if requested
    if args.output:
        export_to_json(result.generate_summary(), args.output)
        print(f"\nOptimization results exported to: {args.output}")


def cmd_compliance(args):
    """Run compliance check."""
    print("\n" + "="*80)
    print("CONSTRUCTAI - COMPLIANCE CHECKER")
    print("="*80 + "\n")
    
    # Create demo project
    project = create_demo_project()
    
    print("Loading project...")
    print(generate_project_summary(project))
    print("\n" + "-"*80 + "\n")
    
    # Run compliance check
    print("Checking compliance against industry standards...")
    checker = ComplianceChecker()
    results = checker.check_all(project)
    
    # Print results
    print(f"\nStandards Checked: {', '.join(results['standards_checked'])}")
    print(f"\nCompliance Summary:")
    print(f"  Total Issues: {results['summary']['total_issues']}")
    print(f"  High Severity: {results['summary']['high_severity']}")
    print(f"  Medium Severity: {results['summary']['medium_severity']}")
    print(f"  Low Severity: {results['summary']['low_severity']}")
    
    if results['issues']:
        print(f"\n{'-'*80}")
        print("COMPLIANCE ISSUES")
        print("-"*80)
        for i, issue in enumerate(results['issues'], 1):
            print(f"\n{i}. {issue['standard']} - Severity: {issue.get('severity', 'N/A').upper()}")
            print(f"   {issue['description']}")
    else:
        print("\n✓ Project is fully compliant with all checked standards!")
    
    # Export if requested
    if args.output:
        export_to_json(results, args.output)
        print(f"\nCompliance results exported to: {args.output}")


def cmd_full(args):
    """Run full analysis (audit + optimize + compliance)."""
    print("\n" + "="*80)
    print("CONSTRUCTAI - FULL PROJECT ANALYSIS")
    print("="*80 + "\n")
    
    # Create demo project
    project = create_demo_project()
    
    print("Loading project...")
    print(generate_project_summary(project))
    print("\n" + "-"*80 + "\n")
    
    # Run all analyses
    print("Running comprehensive analysis...\n")
    
    # 1. Audit
    print("[1/3] Running project audit...")
    auditor = ProjectAuditor()
    audit_result = auditor.audit(project)
    print(f"  → Audit Score: {audit_result.overall_score:.1f}/100")
    print(f"  → Risks: {len(audit_result.risks)}, Compliance Issues: {len(audit_result.compliance_issues)}")
    
    # 2. Compliance
    print("\n[2/3] Checking compliance...")
    checker = ComplianceChecker()
    compliance_results = checker.check_all(project)
    print(f"  → Total Issues: {compliance_results['summary']['total_issues']}")
    
    # 3. Optimization
    print("\n[3/3] Generating optimized plan...")
    optimizer = WorkflowOptimizer()
    opt_result = optimizer.optimize(project)
    metrics = opt_result.metrics_comparison['improvements']
    print(f"  → Schedule Reduction: {metrics['duration_reduction_days']:.1f} days ({metrics['duration_reduction_percent']:.1f}%)")
    print(f"  → Cost Savings: ${metrics['cost_savings']:,.2f} ({metrics['cost_savings_percent']:.1f}%)")
    
    # Generate full report
    print("\n" + "="*80)
    print("COMPREHENSIVE ANALYSIS COMPLETE")
    print("="*80 + "\n")
    
    print(generate_audit_report(audit_result))
    print("\n\n")
    print(generate_optimization_report(opt_result))
    
    # Export if requested
    if args.output:
        full_results = {
            "audit": audit_result.generate_summary(),
            "compliance": compliance_results,
            "optimization": opt_result.generate_summary()
        }
        export_to_json(full_results, args.output)
        print(f"\nFull analysis exported to: {args.output}")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="ConstructAI - AI-Powered Construction Workflow Optimization",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  constructai audit                    # Run project audit
  constructai optimize                 # Generate optimized plan
  constructai compliance               # Check compliance
  constructai full                     # Run full analysis
  constructai audit -o audit.json      # Export audit results
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Audit command
    audit_parser = subparsers.add_parser('audit', help='Run project audit')
    audit_parser.add_argument('-o', '--output', help='Export results to JSON file')
    audit_parser.set_defaults(func=cmd_audit)
    
    # Optimize command
    opt_parser = subparsers.add_parser('optimize', help='Generate optimized workflow')
    opt_parser.add_argument('-o', '--output', help='Export results to JSON file')
    opt_parser.set_defaults(func=cmd_optimize)
    
    # Compliance command
    comp_parser = subparsers.add_parser('compliance', help='Check compliance')
    comp_parser.add_argument('-o', '--output', help='Export results to JSON file')
    comp_parser.set_defaults(func=cmd_compliance)
    
    # Full analysis command
    full_parser = subparsers.add_parser('full', help='Run full analysis')
    full_parser.add_argument('-o', '--output', help='Export results to JSON file')
    full_parser.set_defaults(func=cmd_full)
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return 1
    
    try:
        args.func(args)
        return 0
    except Exception as e:
        print(f"\nError: {e}", file=sys.stderr)
        return 1


if __name__ == '__main__':
    sys.exit(main())
