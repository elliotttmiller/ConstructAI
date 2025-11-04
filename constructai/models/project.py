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


# Conversion utilities for database integration
def dict_to_resource(data: Dict) -> Resource:
    """Convert dictionary to Resource object."""
    resource_type = data.get("type", "material")
    if isinstance(resource_type, str):
        try:
            resource_type = ResourceType[resource_type.upper()]
        except KeyError:
            resource_type = ResourceType.MATERIAL
    
    return Resource(
        id=data.get("id", ""),
        name=data.get("name", ""),
        type=resource_type,
        quantity=float(data.get("quantity", 0)),
        unit=data.get("unit", ""),
        cost_per_unit=float(data.get("cost_per_unit", 0)),
        availability=float(data.get("availability", 1.0))
    )


def dict_to_task(data: Dict) -> Task:
    """Convert dictionary to Task object."""
    status = data.get("status", "planned")
    if isinstance(status, str):
        try:
            status = TaskStatus[status.upper()]
        except KeyError:
            status = TaskStatus.PLANNED
    
    resources = []
    if "resources" in data and isinstance(data["resources"], list):
        for res in data["resources"]:
            if isinstance(res, dict):
                resources.append(dict_to_resource(res))
            elif isinstance(res, Resource):
                resources.append(res)
    
    start_date = data.get("start_date")
    if isinstance(start_date, str):
        try:
            start_date = datetime.fromisoformat(start_date)
        except (ValueError, TypeError):
            start_date = None
    
    end_date = data.get("end_date")
    if isinstance(end_date, str):
        try:
            end_date = datetime.fromisoformat(end_date)
        except (ValueError, TypeError):
            end_date = None
    
    return Task(
        id=data.get("id", ""),
        name=data.get("name", ""),
        description=data.get("description", ""),
        duration_days=float(data.get("duration_days", 0)),
        dependencies=data.get("dependencies", []),
        resources=resources,
        status=status,
        priority=int(data.get("priority", 1)),
        start_date=start_date,
        end_date=end_date,
        compliance_requirements=data.get("compliance_requirements", []),
        risk_level=float(data.get("risk_level", 0.0))
    )


def dict_to_project(data: Dict) -> Project:
    """Convert dictionary to Project object."""
    tasks = []
    if "tasks" in data and isinstance(data["tasks"], list):
        for task in data["tasks"]:
            if isinstance(task, dict):
                tasks.append(dict_to_task(task))
            elif isinstance(task, Task):
                tasks.append(task)
    
    start_date = data.get("start_date", datetime.now())
    if isinstance(start_date, str):
        try:
            start_date = datetime.fromisoformat(start_date)
        except (ValueError, TypeError):
            start_date = datetime.now()
    
    target_end_date = data.get("target_end_date")
    if isinstance(target_end_date, str):
        try:
            target_end_date = datetime.fromisoformat(target_end_date)
        except (ValueError, TypeError):
            target_end_date = None
    
    return Project(
        id=data.get("id", ""),
        name=data.get("name", data.get("project_name", "")),
        description=data.get("description", ""),
        tasks=tasks,
        start_date=start_date,
        target_end_date=target_end_date,
        budget=float(data.get("budget", 0)),
        project_metadata=data.get("project_metadata", {})
    )


def resource_to_dict(resource: Resource) -> Dict:
    """Convert Resource object to dictionary."""
    return {
        "id": resource.id,
        "name": resource.name,
        "type": resource.type.value if isinstance(resource.type, ResourceType) else resource.type,
        "quantity": resource.quantity,
        "unit": resource.unit,
        "cost_per_unit": resource.cost_per_unit,
        "availability": resource.availability
    }


def task_to_dict(task: Task) -> Dict:
    """Convert Task object to dictionary."""
    return {
        "id": task.id,
        "name": task.name,
        "description": task.description,
        "duration_days": task.duration_days,
        "dependencies": task.dependencies,
        "resources": [resource_to_dict(r) for r in task.resources],
        "status": task.status.value if isinstance(task.status, TaskStatus) else task.status,
        "priority": task.priority,
        "start_date": task.start_date.isoformat() if task.start_date else None,
        "end_date": task.end_date.isoformat() if task.end_date else None,
        "compliance_requirements": task.compliance_requirements,
        "risk_level": task.risk_level
    }


def project_to_dict(project: Project) -> Dict:
    """Convert Project object to dictionary."""
    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "tasks": [task_to_dict(t) for t in project.tasks],
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "target_end_date": project.target_end_date.isoformat() if project.target_end_date else None,
        "budget": project.budget,
        "project_metadata": project.project_metadata
    }
