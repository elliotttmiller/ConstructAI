"""
Unit tests for ConstructAI models.
"""

import unittest
from datetime import datetime, timedelta
from constructai.models.project import Project, Task, Resource, TaskStatus, ResourceType


class TestResource(unittest.TestCase):
    """Test Resource model."""
    
    def test_resource_creation(self):
        """Test creating a resource."""
        resource = Resource(
            id="R001",
            name="Concrete Crew",
            type=ResourceType.LABOR,
            quantity=10,
            unit="workers",
            cost_per_unit=800
        )
        self.assertEqual(resource.id, "R001")
        self.assertEqual(resource.name, "Concrete Crew")
        self.assertEqual(resource.type, ResourceType.LABOR)
        self.assertEqual(resource.quantity, 10)
        self.assertEqual(resource.unit, "workers")
        self.assertEqual(resource.cost_per_unit, 800)
    
    def test_total_cost(self):
        """Test total cost calculation."""
        resource = Resource(
            id="R001",
            name="Concrete",
            type=ResourceType.MATERIAL,
            quantity=100,
            unit="cubic yards",
            cost_per_unit=150
        )
        self.assertEqual(resource.total_cost(), 15000)


class TestTask(unittest.TestCase):
    """Test Task model."""
    
    def test_task_creation(self):
        """Test creating a task."""
        task = Task(
            id="T001",
            name="Foundation Pour",
            description="Pour concrete foundation",
            duration_days=10,
            dependencies=[]
        )
        self.assertEqual(task.id, "T001")
        self.assertEqual(task.name, "Foundation Pour")
        self.assertEqual(task.duration_days, 10)
        self.assertEqual(task.status, TaskStatus.PLANNED)
    
    def test_calculate_cost(self):
        """Test task cost calculation."""
        task = Task(
            id="T001",
            name="Test Task",
            description="Test",
            duration_days=5,
            resources=[
                Resource("R001", "Labor", ResourceType.LABOR, 5, "workers", 800),
                Resource("R002", "Material", ResourceType.MATERIAL, 100, "units", 10),
            ]
        )
        expected_cost = 5 * 800 + 100 * 10
        self.assertEqual(task.calculate_cost(), expected_cost)
    
    def test_get_resource_by_type(self):
        """Test filtering resources by type."""
        task = Task(
            id="T001",
            name="Test Task",
            description="Test",
            duration_days=5,
            resources=[
                Resource("R001", "Labor", ResourceType.LABOR, 5, "workers", 800),
                Resource("R002", "Material", ResourceType.MATERIAL, 100, "units", 10),
                Resource("R003", "Equipment", ResourceType.EQUIPMENT, 1, "unit", 500),
            ]
        )
        labor_resources = task.get_resource_by_type(ResourceType.LABOR)
        self.assertEqual(len(labor_resources), 1)
        self.assertEqual(labor_resources[0].name, "Labor")
    
    def test_is_ready(self):
        """Test checking if task is ready to start."""
        task = Task(
            id="T002",
            name="Test Task",
            description="Test",
            duration_days=5,
            dependencies=["T001"]
        )
        self.assertFalse(task.is_ready(set()))
        self.assertTrue(task.is_ready({"T001"}))


class TestProject(unittest.TestCase):
    """Test Project model."""
    
    def test_project_creation(self):
        """Test creating a project."""
        project = Project(
            id="P001",
            name="Office Building",
            description="5-story office building",
            budget=5000000
        )
        self.assertEqual(project.id, "P001")
        self.assertEqual(project.name, "Office Building")
        self.assertEqual(project.budget, 5000000)
        self.assertEqual(len(project.tasks), 0)
    
    def test_add_task(self):
        """Test adding tasks to project."""
        project = Project(
            id="P001",
            name="Test Project",
            description="Test"
        )
        task = Task(
            id="T001",
            name="Task 1",
            description="Test task",
            duration_days=5
        )
        project.add_task(task)
        self.assertEqual(len(project.tasks), 1)
        self.assertEqual(project.tasks[0].id, "T001")
    
    def test_get_task_by_id(self):
        """Test retrieving task by ID."""
        project = Project(
            id="P001",
            name="Test Project",
            description="Test"
        )
        task = Task(
            id="T001",
            name="Task 1",
            description="Test task",
            duration_days=5
        )
        project.add_task(task)
        
        retrieved = project.get_task_by_id("T001")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.id, "T001")
        
        not_found = project.get_task_by_id("T999")
        self.assertIsNone(not_found)
    
    def test_calculate_total_cost(self):
        """Test calculating total project cost."""
        project = Project(
            id="P001",
            name="Test Project",
            description="Test"
        )
        
        task1 = Task(
            id="T001",
            name="Task 1",
            description="Test",
            duration_days=5,
            resources=[
                Resource("R001", "Labor", ResourceType.LABOR, 5, "workers", 800),
            ]
        )
        task2 = Task(
            id="T002",
            name="Task 2",
            description="Test",
            duration_days=5,
            resources=[
                Resource("R002", "Material", ResourceType.MATERIAL, 100, "units", 10),
            ]
        )
        
        project.add_task(task1)
        project.add_task(task2)
        
        expected_cost = 5 * 800 + 100 * 10
        self.assertEqual(project.calculate_total_cost(), expected_cost)
    
    def test_get_tasks_by_status(self):
        """Test filtering tasks by status."""
        project = Project(
            id="P001",
            name="Test Project",
            description="Test"
        )
        
        task1 = Task(
            id="T001",
            name="Task 1",
            description="Test",
            duration_days=5,
            status=TaskStatus.PLANNED
        )
        task2 = Task(
            id="T002",
            name="Task 2",
            description="Test",
            duration_days=5,
            status=TaskStatus.COMPLETED
        )
        
        project.add_task(task1)
        project.add_task(task2)
        
        planned = project.get_tasks_by_status(TaskStatus.PLANNED)
        self.assertEqual(len(planned), 1)
        self.assertEqual(planned[0].id, "T001")
        
        completed = project.get_tasks_by_status(TaskStatus.COMPLETED)
        self.assertEqual(len(completed), 1)
        self.assertEqual(completed[0].id, "T002")
    
    def test_validate_dependencies(self):
        """Test validating task dependencies."""
        project = Project(
            id="P001",
            name="Test Project",
            description="Test"
        )
        
        task1 = Task(
            id="T001",
            name="Task 1",
            description="Test",
            duration_days=5
        )
        task2 = Task(
            id="T002",
            name="Task 2",
            description="Test",
            duration_days=5,
            dependencies=["T001"]
        )
        task3 = Task(
            id="T003",
            name="Task 3",
            description="Test",
            duration_days=5,
            dependencies=["T999"]  # Invalid dependency
        )
        
        project.add_task(task1)
        project.add_task(task2)
        project.add_task(task3)
        
        errors = project.validate_dependencies()
        self.assertEqual(len(errors), 1)
        self.assertIn("T003", errors[0])
        self.assertIn("T999", errors[0])


if __name__ == '__main__':
    unittest.main()
