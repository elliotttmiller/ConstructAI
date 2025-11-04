"""
Test the complete object-based refactoring.

This test validates that Project objects flow correctly through the entire system:
- Database layer conversions
- API layer conversions  
- Engine processing (auditor, optimizer, compliance)
- Pydantic schema validation
"""

import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from constructai.models.project import (
    Project, Task, Resource, ResourceType, TaskStatus,
    dict_to_project, project_to_dict, dict_to_task, task_to_dict
)
from constructai.engine.auditor import ProjectAuditor
from constructai.engine.optimizer import WorkflowOptimizer
from constructai.engine.compliance import ComplianceChecker
from constructai.db.models import ProjectDB
from constructai.api.schemas import ProjectSchema, TaskSchema, ResourceSchema
from datetime import datetime, timedelta


def test_conversion_utilities():
    """Test dict <-> object conversions."""
    print("✓ Testing conversion utilities...")
    
    # Create a resource dict
    resource_dict = {
        "id": "r1",
        "name": "Concrete",
        "type": "material",
        "quantity": 100,
        "unit": "cubic yards",
        "cost_per_unit": 150.0
    }
    
    # Create a task dict with resources
    task_dict = {
        "id": "t1",
        "name": "Foundation Pour",
        "description": "Pour concrete foundation",
        "duration_days": 3,
        "resources": [resource_dict],
        "priority": 5
    }
    
    # Create project dict
    project_dict = {
        "id": "p1",
        "name": "Construction Project",
        "description": "Test project",
        "budget": 500000,
        "tasks": [task_dict]
    }
    
    # Convert to objects
    project = dict_to_project(project_dict)
    assert isinstance(project, Project)
    assert project.name == "Construction Project"
    assert len(project.tasks) == 1
    assert project.tasks[0].name == "Foundation Pour"
    assert len(project.tasks[0].resources) == 1
    assert project.tasks[0].resources[0].name == "Concrete"
    
    # Convert back to dict
    converted_back = project_to_dict(project)
    assert converted_back["name"] == project_dict["name"]
    assert len(converted_back["tasks"]) == 1
    
    print("  ✓ Conversion utilities work correctly")


def test_database_layer():
    """Test ProjectDB <-> Project conversions."""
    print("✓ Testing database layer conversions...")
    
    # Create a project object
    task = Task(
        id="t1",
        name="Site Preparation", 
        description="Clear and grade site",
        duration_days=5
    )
    
    project = Project(
        id="p1",
        name="Building Project",
        description="New office building",
        budget=1000000,
        tasks=[task]
    )
    
    # Convert to database model
    project_dict = project_to_dict(project)
    db_project = ProjectDB.from_domain(project)
    
    assert db_project.name == project.name
    assert db_project.budget == project.budget
    
    # Convert back to domain object
    restored_project = db_project.to_domain()
    assert isinstance(restored_project, Project)
    assert restored_project.name == project.name
    assert len(restored_project.tasks) == 1
    assert restored_project.tasks[0].name == "Site Preparation"
    
    print("  ✓ Database layer conversions work correctly")


def test_auditor_with_objects():
    """Test ProjectAuditor with Project objects."""
    print("✓ Testing ProjectAuditor with objects...")
    
    # Create a project with multiple tasks
    tasks = [
        Task(
            id="t1",
            name="Foundation",
            description="Excavation and foundation work",
            duration_days=10,
            priority=5
        ),
        Task(
            id="t2",
            name="Framing",
            description="Steel erection",
            duration_days=15,
            dependencies=["t1"],
            priority=4
        ),
        Task(
            id="t3",
            name="MEP Installation",
            description="Install mechanical, electrical, plumbing",
            duration_days=20,
            dependencies=["t2"],
            priority=3
        )
    ]
    
    project = Project(
        id="p1",
        name="Multi-phase Construction",
        description="Complex building project",
        budget=2000000,
        tasks=tasks,
        start_date=datetime.now(),
        target_end_date=datetime.now() + timedelta(days=60)
    )
    
    # Run audit
    auditor = ProjectAuditor()
    result = auditor.audit(project)
    
    assert result.overall_score > 0
    assert isinstance(result.risks, list)
    assert isinstance(result.compliance_issues, list)
    assert isinstance(result.recommendations, list)
    
    print(f"  ✓ Audit completed - Score: {result.overall_score}")
    print(f"  ✓ Found {len(result.risks)} risks")
    print(f"  ✓ Found {len(result.compliance_issues)} compliance issues")


def test_optimizer_with_objects():
    """Test WorkflowOptimizer with Project objects."""
    print("✓ Testing WorkflowOptimizer with objects...")
    
    tasks = [
        Task(id="t1", name="Design", description="Architectural design", duration_days=20),
        Task(id="t2", name="Permits", description="Get permits", duration_days=10, dependencies=["t1"]),
        Task(id="t3", name="Foundation", description="Build foundation", duration_days=15, dependencies=["t2"]),
        Task(id="t4", name="Framing", description="Frame structure", duration_days=25, dependencies=["t3"]),
    ]
    
    project = Project(
        id="p1",
        name="Sequential Project",
        description="Project to optimize",
        budget=1500000,
        tasks=tasks
    )
    
    # Run optimizer
    optimizer = WorkflowOptimizer()
    result = optimizer.optimize(project)
    
    assert result.optimized_project is not None
    assert isinstance(result.optimized_project, Project)
    assert isinstance(result.improvements, list)
    assert isinstance(result.metrics_comparison, dict)
    
    print(f"  ✓ Optimization completed")
    print(f"  ✓ Applied {len(result.improvements)} improvements")


def test_compliance_with_objects():
    """Test ComplianceChecker with Project objects."""
    print("✓ Testing ComplianceChecker with objects...")
    
    tasks = [
        Task(
            id="t1",
            name="Excavation",
            description="Deep excavation work",
            duration_days=5
        ),
        Task(
            id="t2",
            name="Steel Erection",
            description="Erect steel structure",
            duration_days=10,
            compliance_requirements=["OSHA-STEEL"]
        )
    ]
    
    project = Project(
        id="p1",
        name="Safety Critical Project",
        description="High-risk construction",
        tasks=tasks,
        budget=800000
    )
    
    # Run compliance check
    checker = ComplianceChecker()
    results = checker.check_all(project)
    
    assert isinstance(results, dict)
    assert "standards_checked" in results
    assert "summary" in results
    assert "total_issues" in results["summary"]
    
    print(f"  ✓ Compliance check completed")
    print(f"  ✓ Checked {len(results.get('standards_checked', []))} standards")
    print(f"  ✓ Found {results['summary'].get('total_issues', 0)} issues")


def test_pydantic_schemas():
    """Test Pydantic schema conversions."""
    print("✓ Testing Pydantic schemas...")
    
    # Create from dict
    task_data = {
        "id": "t1",
        "name": "Test Task",
        "description": "A test task",
        "duration_days": 5,
        "status": "planned"
    }
    
    task_schema = TaskSchema(**task_data)
    assert task_schema.name == "Test Task"
    
    # Convert to domain
    domain_task = task_schema.to_domain()
    assert isinstance(domain_task, Task)
    assert domain_task.name == "Test Task"
    
    # Convert back from domain
    schema_from_domain = TaskSchema.from_domain(domain_task)
    assert schema_from_domain.name == "Test Task"
    
    print("  ✓ Pydantic schemas work correctly")


def test_end_to_end():
    """Test complete end-to-end flow."""
    print("✓ Testing end-to-end flow...")
    
    # 1. Create project from dict (as if from API request)
    project_dict = {
        "id": "p1",
        "name": "End-to-End Test Project",
        "description": "Complete workflow test",
        "budget": 1000000,
        "tasks": [
            {
                "id": "t1",
                "name": "Planning",
                "description": "Project planning",
                "duration_days": 10
            },
            {
                "id": "t2",
                "name": "Execution",
                "description": "Execute project",
                "duration_days": 30,
                "dependencies": ["t1"]
            }
        ]
    }
    
    # 2. Convert to Project object
    project = dict_to_project(project_dict)
    assert isinstance(project, Project)
    
    # 3. Run through engines
    auditor = ProjectAuditor()
    optimizer = WorkflowOptimizer()
    checker = ComplianceChecker()
    
    audit_result = auditor.audit(project)
    opt_result = optimizer.optimize(project)
    compliance_result = checker.check_all(project)
    
    # 4. Verify results
    assert audit_result.overall_score > 0
    assert opt_result.optimized_project is not None
    assert isinstance(compliance_result, dict)
    
    # 5. Convert back for API response
    optimized_dict = project_to_dict(opt_result.optimized_project)
    assert optimized_dict["name"] == project.name
    
    print("  ✓ End-to-end flow completed successfully")
    print("  ✓ Dict -> Project -> Process -> Dict conversion works")


def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("CONSTRUCTAI OBJECT-BASED REFACTORING TEST SUITE")
    print("="*80 + "\n")
    
    try:
        test_conversion_utilities()
        test_database_layer()
        test_auditor_with_objects()
        test_optimizer_with_objects()
        test_compliance_with_objects()
        test_pydantic_schemas()
        test_end_to_end()
        
        print("\n" + "="*80)
        print("✓ ALL TESTS PASSED - REFACTORING SUCCESSFUL!")
        print("="*80 + "\n")
        print("Summary:")
        print("  ✓ Conversion utilities working")
        print("  ✓ Database layer working")
        print("  ✓ ProjectAuditor using objects")
        print("  ✓ WorkflowOptimizer using objects")
        print("  ✓ ComplianceChecker using objects")
        print("  ✓ Pydantic schemas working")
        print("  ✓ End-to-end flow working")
        print("\nSystem is now using Project objects throughout!")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    exit(main())
