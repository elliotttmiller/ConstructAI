"""
Data models for construction projects, tasks, and resources.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Optional, Set
from datetime import datetime, timedelta
from enum import Enum


class TaskStatus(Enum):
    """Status of a construction task."""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    DELAYED = "delayed"


class ResourceType(Enum):
    """Types of construction resources."""
    LABOR = "labor"
    EQUIPMENT = "equipment"
    MATERIAL = "material"
    BUDGET = "budget"


@dataclass
class Resource:
    """Represents a construction resource."""
    id: str
    name: str
    type: ResourceType
    quantity: float
    unit: str
    cost_per_unit: float = 0.0
    availability: float = 1.0  # 0.0 to 1.0
    
    def total_cost(self) -> float:
        """Calculate total cost of this resource."""
        return self.quantity * self.cost_per_unit


@dataclass
class Task:
    """Represents a construction task."""
    id: str
    name: str
    description: str
    duration_days: float
    dependencies: List[str] = field(default_factory=list)
    resources: List[Resource] = field(default_factory=list)
    status: TaskStatus = TaskStatus.PLANNED
    priority: int = 1  # 1-5, 5 being highest
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    compliance_requirements: List[str] = field(default_factory=list)
    risk_level: float = 0.0  # 0.0 to 1.0
    
    def calculate_cost(self) -> float:
        """Calculate total cost of this task."""
        return sum(r.total_cost() for r in self.resources)
    
    def get_resource_by_type(self, resource_type: ResourceType) -> List[Resource]:
        """Get all resources of a specific type."""
        return [r for r in self.resources if r.type == resource_type]
    
    def is_ready(self, completed_tasks: Set[str]) -> bool:
        """Check if task is ready to start based on dependencies."""
        return all(dep in completed_tasks for dep in self.dependencies)


@dataclass
class Project:
    """Represents a construction project."""
    id: str
    name: str
    description: str
    tasks: List[Task] = field(default_factory=list)
    start_date: datetime = field(default_factory=datetime.now)
    target_end_date: Optional[datetime] = None
    budget: float = 0.0
    project_metadata: Dict = field(default_factory=dict)
    
    def add_task(self, task: Task) -> None:
        """Add a task to the project."""
        self.tasks.append(task)
    
    def get_task_by_id(self, task_id: str) -> Optional[Task]:
        """Get a task by its ID."""
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None
    
    def calculate_total_cost(self) -> float:
        """Calculate total project cost."""
        return sum(task.calculate_cost() for task in self.tasks)
    
    def get_critical_path(self) -> List[Task]:
        """Identify tasks on the critical path (simplified)."""
        # This is a simplified version; full implementation would use CPM
        return sorted(self.tasks, key=lambda t: t.priority, reverse=True)
    
    def get_tasks_by_status(self, status: TaskStatus) -> List[Task]:
        """Get all tasks with a specific status."""
        return [t for t in self.tasks if t.status == status]
    
    def validate_dependencies(self) -> List[str]:
        """Validate that all task dependencies exist."""
        errors = []
        task_ids = {task.id for task in self.tasks}
        for task in self.tasks:
            for dep in task.dependencies:
                if dep not in task_ids:
                    errors.append(f"Task '{task.id}' has invalid dependency '{dep}'")
        return errors
