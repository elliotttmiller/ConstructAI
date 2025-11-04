"""
Pydantic schemas for API request/response validation.

These models provide type safety at API boundaries and map to domain objects.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum


class TaskStatusEnum(str, Enum):
    """Task status enum for API."""
    PLANNED = "planned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    DELAYED = "delayed"


class ResourceTypeEnum(str, Enum):
    """Resource type enum for API."""
    LABOR = "labor"
    EQUIPMENT = "equipment"
    MATERIAL = "material"
    BUDGET = "budget"


class ResourceSchema(BaseModel):
    """Resource schema for API requests/responses."""
    id: str
    name: str
    type: ResourceTypeEnum
    quantity: float = Field(ge=0)
    unit: str
    cost_per_unit: float = Field(ge=0, default=0.0)
    availability: float = Field(ge=0, le=1, default=1.0)

    class Config:
        use_enum_values = True

    def to_domain(self):
        """Convert to domain Resource object."""
        from ..models.project import Resource, ResourceType
        return Resource(
            id=self.id,
            name=self.name,
            type=ResourceType[self.type.upper()],
            quantity=self.quantity,
            unit=self.unit,
            cost_per_unit=self.cost_per_unit,
            availability=self.availability
        )

    @classmethod
    def from_domain(cls, resource):
        """Create from domain Resource object."""
        return cls(
            id=resource.id,
            name=resource.name,
            type=resource.type.value if hasattr(resource.type, 'value') else resource.type,
            quantity=resource.quantity,
            unit=resource.unit,
            cost_per_unit=resource.cost_per_unit,
            availability=resource.availability
        )


class TaskSchema(BaseModel):
    """Task schema for API requests/responses."""
    id: str
    name: str
    description: str = ""
    duration_days: float = Field(gt=0)
    dependencies: List[str] = Field(default_factory=list)
    resources: List[ResourceSchema] = Field(default_factory=list)
    status: TaskStatusEnum = TaskStatusEnum.PLANNED
    priority: int = Field(ge=1, le=5, default=1)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    compliance_requirements: List[str] = Field(default_factory=list)
    risk_level: float = Field(ge=0, le=1, default=0.0)

    class Config:
        use_enum_values = True

    def to_domain(self):
        """Convert to domain Task object."""
        from ..models.project import Task, TaskStatus
        return Task(
            id=self.id,
            name=self.name,
            description=self.description,
            duration_days=self.duration_days,
            dependencies=self.dependencies,
            resources=[r.to_domain() for r in self.resources],
            status=TaskStatus[self.status.upper()],
            priority=self.priority,
            start_date=self.start_date,
            end_date=self.end_date,
            compliance_requirements=self.compliance_requirements,
            risk_level=self.risk_level
        )

    @classmethod
    def from_domain(cls, task):
        """Create from domain Task object."""
        return cls(
            id=task.id,
            name=task.name,
            description=task.description,
            duration_days=task.duration_days,
            dependencies=task.dependencies,
            resources=[ResourceSchema.from_domain(r) for r in task.resources],
            status=task.status.value if hasattr(task.status, 'value') else task.status,
            priority=task.priority,
            start_date=task.start_date,
            end_date=task.end_date,
            compliance_requirements=task.compliance_requirements,
            risk_level=task.risk_level
        )


class ProjectSchema(BaseModel):
    """Project schema for API requests/responses."""
    id: Optional[str] = None
    name: str
    description: str = ""
    tasks: List[TaskSchema] = Field(default_factory=list)
    start_date: datetime = Field(default_factory=datetime.now)
    target_end_date: Optional[datetime] = None
    budget: float = Field(ge=0, default=0.0)
    project_metadata: Dict[str, Any] = Field(default_factory=dict)

    @validator('target_end_date')
    def validate_end_date(cls, v, values):
        """Ensure target end date is after start date."""
        if v and 'start_date' in values and v < values['start_date']:
            raise ValueError('target_end_date must be after start_date')
        return v

    def to_domain(self):
        """Convert to domain Project object."""
        from ..models.project import Project
        import uuid
        
        project_id = self.id or str(uuid.uuid4())
        
        return Project(
            id=project_id,
            name=self.name,
            description=self.description,
            tasks=[t.to_domain() for t in self.tasks],
            start_date=self.start_date,
            target_end_date=self.target_end_date,
            budget=self.budget,
            project_metadata=self.project_metadata
        )

    @classmethod
    def from_domain(cls, project):
        """Create from domain Project object."""
        return cls(
            id=project.id,
            name=project.name,
            description=project.description,
            tasks=[TaskSchema.from_domain(t) for t in project.tasks],
            start_date=project.start_date,
            target_end_date=project.target_end_date,
            budget=project.budget,
            project_metadata=project.project_metadata
        )


class AnalyzeProjectRequest(BaseModel):
    """Request schema for project analysis."""
    tasks: Optional[List[TaskSchema]] = None
    resources: Optional[List[ResourceSchema]] = None
    include_optimization: bool = True
    include_compliance: bool = True


class RiskSchema(BaseModel):
    """Risk finding schema."""
    severity: str
    category: str
    task_id: str
    description: str
    mitigation: str = ""


class ComplianceIssueSchema(BaseModel):
    """Compliance issue schema."""
    standard: str
    task_id: str
    description: str
    requirement: str


class BottleneckSchema(BaseModel):
    """Bottleneck finding schema."""
    task_id: str
    description: str
    impact: str


class AuditResultSchema(BaseModel):
    """Audit result schema."""
    overall_score: float
    risks: List[RiskSchema]
    compliance_issues: List[ComplianceIssueSchema]
    efficiency_concerns: List[Dict[str, Any]]
    bottlenecks: List[BottleneckSchema]
    resource_conflicts: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]
    timestamp: datetime


class OptimizationResultSchema(BaseModel):
    """Optimization result schema."""
    improvements: List[Dict[str, Any]]
    metrics_comparison: Dict[str, Any]
    optimized_project: ProjectSchema
    timestamp: datetime


class AnalysisResultSchema(BaseModel):
    """Complete analysis result schema."""
    status: str
    project_id: str
    audit: AuditResultSchema
    optimization: OptimizationResultSchema
