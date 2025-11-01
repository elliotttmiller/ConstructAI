"""
Example: Basic usage of ConstructAI
"""

from datetime import datetime, timedelta
from constructai.models.project import Project, Task, Resource, ResourceType
from constructai.engine.auditor import ProjectAuditor
from constructai.engine.optimizer import WorkflowOptimizer
from constructai.engine.compliance import ComplianceChecker
from constructai.utils.reporting import (
    generate_audit_report,
    generate_optimization_report
)


def create_sample_project():
    """Create a sample construction project."""
    project = Project(
        id="sample-001",
        name="Residential House Construction",
        description="Single-family home with 3 bedrooms, 2500 sq ft",
        start_date=datetime.now(),
        target_end_date=datetime.now() + timedelta(days=180),
        budget=350000.0,
        metadata={"location": "Suburban", "type": "residential", "sqft": 2500}
    )
    
    # Foundation tasks
    project.add_task(Task(
        id="T001",
        name="Site Preparation",
        description="Clear lot and prepare for construction",
        duration_days=5,
        resources=[
            Resource("R001", "Site Crew", ResourceType.LABOR, 4, "workers", 600),
            Resource("R002", "Equipment", ResourceType.EQUIPMENT, 1, "unit", 800),
        ],
        priority=5
    ))
    
    project.add_task(Task(
        id="T002",
        name="Foundation Excavation",
        description="Excavate for foundation and footings",
        duration_days=7,
        dependencies=["T001"],
        resources=[
            Resource("R003", "Excavation Crew", ResourceType.LABOR, 3, "workers", 700),
            Resource("R004", "Excavator", ResourceType.EQUIPMENT, 1, "unit", 1000),
        ],
        priority=5,
        risk_level=0.5,
        compliance_requirements=["OSHA excavation safety"]
    ))
    
    project.add_task(Task(
        id="T003",
        name="Foundation Pour",
        description="Pour concrete foundation and footings",
        duration_days=10,
        dependencies=["T002"],
        resources=[
            Resource("R005", "Concrete Crew", ResourceType.LABOR, 6, "workers", 800),
            Resource("R006", "Concrete", ResourceType.MATERIAL, 80, "cubic yards", 120),
            Resource("R007", "Rebar", ResourceType.MATERIAL, 2000, "lbs", 0.75),
        ],
        priority=5,
        compliance_requirements=["Concrete testing", "Structural inspection"]
    ))
    
    # Framing
    project.add_task(Task(
        id="T004",
        name="Framing",
        description="Frame walls, roof structure, and install sheathing",
        duration_days=21,
        dependencies=["T003"],
        resources=[
            Resource("R008", "Framing Crew", ResourceType.LABOR, 8, "workers", 750),
            Resource("R009", "Lumber", ResourceType.MATERIAL, 1, "lot", 25000),
        ],
        priority=5
    ))
    
    # Exterior
    project.add_task(Task(
        id="T005",
        name="Roofing",
        description="Install roofing shingles and flashing",
        duration_days=7,
        dependencies=["T004"],
        resources=[
            Resource("R010", "Roofing Crew", ResourceType.LABOR, 4, "workers", 850),
            Resource("R011", "Roofing Materials", ResourceType.MATERIAL, 2500, "sqft", 3.5),
        ],
        priority=4
    ))
    
    project.add_task(Task(
        id="T006",
        name="Siding and Exterior",
        description="Install siding, windows, and doors",
        duration_days=14,
        dependencies=["T004"],
        resources=[
            Resource("R012", "Exterior Crew", ResourceType.LABOR, 6, "workers", 800),
            Resource("R013", "Siding Materials", ResourceType.MATERIAL, 2500, "sqft", 5.5),
            Resource("R014", "Windows & Doors", ResourceType.MATERIAL, 1, "lot", 12000),
        ],
        priority=4
    ))
    
    # MEP
    project.add_task(Task(
        id="T007",
        name="MEP Rough-In",
        description="Install electrical, plumbing, and HVAC rough-in",
        duration_days=18,
        dependencies=["T004", "T005"],
        resources=[
            Resource("R015", "Electrician", ResourceType.LABOR, 2, "workers", 900),
            Resource("R016", "Plumber", ResourceType.LABOR, 2, "workers", 900),
            Resource("R017", "HVAC Tech", ResourceType.LABOR, 2, "workers", 950),
            Resource("R018", "MEP Materials", ResourceType.MATERIAL, 1, "lot", 35000),
        ],
        priority=5,
        compliance_requirements=["Electrical code", "Plumbing code"]
    ))
    
    # Interior
    project.add_task(Task(
        id="T008",
        name="Insulation",
        description="Install insulation in walls and attic",
        duration_days=5,
        dependencies=["T007"],
        resources=[
            Resource("R019", "Insulation Crew", ResourceType.LABOR, 3, "workers", 650),
            Resource("R020", "Insulation", ResourceType.MATERIAL, 2500, "sqft", 1.2),
        ],
        priority=3
    ))
    
    project.add_task(Task(
        id="T009",
        name="Drywall",
        description="Install and finish drywall",
        duration_days=12,
        dependencies=["T008"],
        resources=[
            Resource("R021", "Drywall Crew", ResourceType.LABOR, 4, "workers", 700),
            Resource("R022", "Drywall Materials", ResourceType.MATERIAL, 1, "lot", 8000),
        ],
        priority=3
    ))
    
    project.add_task(Task(
        id="T010",
        name="Interior Finishes",
        description="Flooring, painting, trim, and cabinets",
        duration_days=21,
        dependencies=["T009"],
        resources=[
            Resource("R023", "Finish Crew", ResourceType.LABOR, 6, "workers", 750),
            Resource("R024", "Finish Materials", ResourceType.MATERIAL, 1, "lot", 45000),
        ],
        priority=3
    ))
    
    project.add_task(Task(
        id="T011",
        name="MEP Final",
        description="Complete MEP installation and fixtures",
        duration_days=10,
        dependencies=["T009"],
        resources=[
            Resource("R025", "MEP Crews", ResourceType.LABOR, 4, "workers", 900),
            Resource("R026", "Fixtures", ResourceType.MATERIAL, 1, "lot", 15000),
        ],
        priority=4
    ))
    
    project.add_task(Task(
        id="T012",
        name="Final Inspection",
        description="Final walkthrough and inspection",
        duration_days=3,
        dependencies=["T010", "T011"],
        resources=[
            Resource("R027", "Inspector", ResourceType.LABOR, 1, "worker", 800),
        ],
        priority=5,
        compliance_requirements=["Building permit final", "Occupancy certificate"]
    ))
    
    return project


def main():
    """Run the example."""
    print("\n" + "="*80)
    print("CONSTRUCTAI EXAMPLE - Residential Construction Project")
    print("="*80 + "\n")
    
    # Create project
    print("Creating sample project...")
    project = create_sample_project()
    print(f"✓ Project created: {project.name}")
    print(f"  - Total tasks: {len(project.tasks)}")
    print(f"  - Budget: ${project.budget:,.2f}")
    print(f"  - Estimated cost: ${project.calculate_total_cost():,.2f}")
    
    # Run audit
    print("\n" + "-"*80)
    print("STEP 1: Running Project Audit")
    print("-"*80 + "\n")
    auditor = ProjectAuditor()
    audit_result = auditor.audit(project)
    
    print(f"Audit completed!")
    print(f"  - Overall Score: {audit_result.overall_score:.1f}/100")
    print(f"  - Risks: {len(audit_result.risks)}")
    print(f"  - Compliance Issues: {len(audit_result.compliance_issues)}")
    print(f"  - Bottlenecks: {len(audit_result.bottlenecks)}")
    
    # Run compliance check
    print("\n" + "-"*80)
    print("STEP 2: Checking Compliance")
    print("-"*80 + "\n")
    checker = ComplianceChecker()
    compliance_results = checker.check_all(project)
    
    print(f"Compliance check completed!")
    print(f"  - Standards checked: {', '.join(compliance_results['standards_checked'])}")
    print(f"  - Total issues: {compliance_results['summary']['total_issues']}")
    
    # Run optimization
    print("\n" + "-"*80)
    print("STEP 3: Generating Optimized Plan")
    print("-"*80 + "\n")
    optimizer = WorkflowOptimizer()
    opt_result = optimizer.optimize(project)
    
    metrics = opt_result.metrics_comparison
    print(f"Optimization completed!")
    print(f"  - Original duration: {metrics['original']['critical_path_duration']:.1f} days")
    print(f"  - Optimized duration: {metrics['optimized']['critical_path_duration']:.1f} days")
    print(f"  - Reduction: {metrics['improvements']['duration_reduction_days']:.1f} days ({metrics['improvements']['duration_reduction_percent']:.1f}%)")
    print(f"  - Cost savings: ${metrics['improvements']['cost_savings']:,.2f} ({metrics['improvements']['cost_savings_percent']:.1f}%)")
    print(f"  - Improvements applied: {len(opt_result.improvements)}")
    
    # Summary
    print("\n" + "="*80)
    print("ANALYSIS COMPLETE")
    print("="*80)
    print("\nKey Findings:")
    print(f"  ✓ Identified {len(audit_result.risks)} risks for mitigation")
    print(f"  ✓ Found {len(audit_result.bottlenecks)} bottlenecks to address")
    print(f"  ✓ Can reduce schedule by {metrics['improvements']['duration_reduction_days']:.1f} days")
    print(f"  ✓ Can save ${metrics['improvements']['cost_savings']:,.2f} through optimization")
    print(f"  ✓ {len(opt_result.improvements)} optimization strategies identified")
    
    print("\n✨ ConstructAI has transformed your construction workflow!")
    print("   Review the detailed reports for actionable insights.\n")


if __name__ == "__main__":
    main()
