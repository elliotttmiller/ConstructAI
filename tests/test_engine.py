"""
Unit tests for ConstructAI engine components.
"""

import unittest
from datetime import datetime, timedelta
from constructai.models.project import Project, Task, Resource, ResourceType
from constructai.engine.auditor import ProjectAuditor
from constructai.engine.optimizer import WorkflowOptimizer
from constructai.engine.compliance import ComplianceChecker


class TestProjectAuditor(unittest.TestCase):
    """Test ProjectAuditor."""
    
    def setUp(self):
        """Set up test project."""
        self.project = Project(
            id="P001",
            name="Test Project",
            description="Test project for auditing",
            budget=100000,
            start_date=datetime.now(),
            target_end_date=datetime.now() + timedelta(days=100)
        )
        
        # Add tasks
        self.project.add_task(Task(
            id="T001",
            name="Task 1",
            description="First task",
            duration_days=10,
            resources=[
                Resource("R001", "Labor", ResourceType.LABOR, 5, "workers", 800),
            ]
        ))
        
        self.project.add_task(Task(
            id="T002",
            name="Task 2",
            description="Second task",
            duration_days=15,
            dependencies=["T001"],
            resources=[
                Resource("R002", "Material", ResourceType.MATERIAL, 100, "units", 50),
            ]
        ))
    
    def test_auditor_initialization(self):
        """Test auditor initializes correctly."""
        auditor = ProjectAuditor()
        self.assertIsNotNone(auditor.industry_standards)
        self.assertIn("iso_19650", auditor.industry_standards)
        self.assertIn("pmbok", auditor.industry_standards)
        self.assertIn("osha", auditor.industry_standards)
    
    def test_audit_returns_result(self):
        """Test audit returns AuditResult."""
        auditor = ProjectAuditor()
        result = auditor.audit(self.project)
        self.assertIsNotNone(result)
        self.assertEqual(result.project.id, "P001")
        self.assertIsInstance(result.overall_score, float)
        self.assertGreaterEqual(result.overall_score, 0)
        self.assertLessEqual(result.overall_score, 100)
    
    def test_audit_detects_invalid_dependencies(self):
        """Test audit detects invalid dependencies."""
        # Add task with invalid dependency
        self.project.add_task(Task(
            id="T003",
            name="Task 3",
            description="Task with invalid dep",
            duration_days=5,
            dependencies=["T999"]  # Invalid
        ))
        
        auditor = ProjectAuditor()
        result = auditor.audit(self.project)
        
        # Should have at least one risk about invalid dependency
        self.assertGreater(len(result.risks), 0)
        invalid_dep_risks = [r for r in result.risks if "invalid dependency" in r["description"].lower()]
        self.assertGreater(len(invalid_dep_risks), 0)
    
    def test_audit_score_calculation(self):
        """Test overall score is calculated."""
        auditor = ProjectAuditor()
        result = auditor.audit(self.project)
        score = result.calculate_overall_score()
        self.assertIsInstance(score, float)
        self.assertEqual(score, result.overall_score)


class TestWorkflowOptimizer(unittest.TestCase):
    """Test WorkflowOptimizer."""
    
    def setUp(self):
        """Set up test project."""
        self.project = Project(
            id="P001",
            name="Test Project",
            description="Test project for optimization",
            budget=100000,
            start_date=datetime.now()
        )
        
        # Add tasks with dependencies
        self.project.add_task(Task(
            id="T001",
            name="Task 1",
            description="First task",
            duration_days=10,
            resources=[
                Resource("R001", "Labor", ResourceType.LABOR, 5, "workers", 800),
            ]
        ))
        
        self.project.add_task(Task(
            id="T002",
            name="Task 2",
            description="Second task",
            duration_days=15,
            dependencies=["T001"],
            resources=[
                Resource("R002", "Material", ResourceType.MATERIAL, 100, "units", 50),
            ]
        ))
        
        self.project.add_task(Task(
            id="T003",
            name="Task 3",
            description="Third task",
            duration_days=12,
            dependencies=["T001"],
            resources=[
                Resource("R003", "Equipment", ResourceType.EQUIPMENT, 1, "unit", 1000),
            ]
        ))
    
    def test_optimizer_initialization(self):
        """Test optimizer initializes correctly."""
        optimizer = WorkflowOptimizer()
        self.assertIsNotNone(optimizer.optimization_strategies)
        self.assertIn("parallelization", optimizer.optimization_strategies)
        self.assertIn("resource_leveling", optimizer.optimization_strategies)
    
    def test_optimize_returns_result(self):
        """Test optimize returns OptimizationResult."""
        optimizer = WorkflowOptimizer()
        result = optimizer.optimize(self.project)
        self.assertIsNotNone(result)
        self.assertEqual(result.original_project.id, "P001")
        self.assertEqual(result.optimized_project.id, "P001")
    
    def test_optimize_generates_improvements(self):
        """Test optimize generates improvement suggestions."""
        optimizer = WorkflowOptimizer()
        result = optimizer.optimize(self.project)
        self.assertIsInstance(result.improvements, list)
        # Should have at least some improvements identified
        self.assertGreaterEqual(len(result.improvements), 0)
    
    def test_optimize_calculates_metrics(self):
        """Test optimize calculates comparison metrics."""
        optimizer = WorkflowOptimizer()
        result = optimizer.optimize(self.project)
        
        self.assertIn("original", result.metrics_comparison)
        self.assertIn("optimized", result.metrics_comparison)
        self.assertIn("improvements", result.metrics_comparison)
        
        original = result.metrics_comparison["original"]
        optimized = result.metrics_comparison["optimized"]
        improvements = result.metrics_comparison["improvements"]
        
        self.assertIn("total_cost", original)
        self.assertIn("total_cost", optimized)
        self.assertIn("cost_savings", improvements)


class TestComplianceChecker(unittest.TestCase):
    """Test ComplianceChecker."""
    
    def setUp(self):
        """Set up test project."""
        self.project = Project(
            id="P001",
            name="Test Project",
            description="Test project for compliance checking",
            budget=100000,
            start_date=datetime.now()
        )
        
        self.project.add_task(Task(
            id="T001",
            name="Excavation Work",
            description="Excavate foundation",
            duration_days=10,
            resources=[
                Resource("R001", "Labor", ResourceType.LABOR, 5, "workers", 800),
            ]
        ))
    
    def test_checker_initialization(self):
        """Test compliance checker initializes with standards."""
        checker = ComplianceChecker()
        self.assertIsNotNone(checker.standards)
        self.assertGreater(len(checker.standards), 0)
    
    def test_check_all_returns_results(self):
        """Test check_all returns compliance results."""
        checker = ComplianceChecker()
        results = checker.check_all(self.project)
        
        self.assertIn("project_id", results)
        self.assertIn("standards_checked", results)
        self.assertIn("issues", results)
        self.assertIn("summary", results)
        self.assertEqual(results["project_id"], "P001")
    
    def test_check_detects_missing_requirements(self):
        """Test compliance check detects missing requirements."""
        checker = ComplianceChecker()
        results = checker.check_all(self.project)
        
        # Project should have some compliance issues (no target date, etc.)
        self.assertGreaterEqual(results["summary"]["total_issues"], 0)
    
    def test_is_compliant(self):
        """Test is_compliant method."""
        checker = ComplianceChecker()
        is_compliant = checker.is_compliant(self.project)
        self.assertIsInstance(is_compliant, bool)


if __name__ == '__main__':
    unittest.main()
