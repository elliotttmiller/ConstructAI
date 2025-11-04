"""
Database models for persistent storage.
"""

from sqlalchemy import Column, String, Float, Integer, Text, DateTime, JSON, Enum
from sqlalchemy.sql import func
from datetime import datetime
import enum

from .database import Base


class ProjectStatus(str, enum.Enum):
    """Project status enum."""
    PLANNING = "planning"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    ARCHIVED = "archived"


class ProjectDB(Base):
    """Database model for projects."""
    
    __tablename__ = "projects"
    
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PLANNING, nullable=False)
    budget = Column(Float, default=0.0)
    total_tasks = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # JSON fields for flexible data storage
    project_metadata = Column(JSON, nullable=True)
    tasks = Column(JSON, nullable=True)
    resources = Column(JSON, nullable=True)
    
    def to_dict(self):
        """Convert model to dictionary with proper structure for exports."""
        base_dict = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "status": self.status.value if isinstance(self.status, ProjectStatus) else self.status,
            "budget": self.budget,
            "total_tasks": self.total_tasks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "tasks": self.tasks,
            "resources": self.resources,
        }
        
        # Extract analysis and MEP data from project_metadata if available
        if self.project_metadata and isinstance(self.project_metadata, dict):
            base_dict["analysis"] = self.project_metadata.get("analysis", {})
            base_dict["mep_analysis"] = self.project_metadata.get("mep_analysis", {})
        else:
            base_dict["analysis"] = {}
            base_dict["mep_analysis"] = {}
        
        return base_dict


class AnalysisResultDB(Base):
    """Database model for analysis results (for caching)."""
    
    __tablename__ = "analysis_results"
    
    id = Column(String(50), primary_key=True, index=True)
    project_id = Column(String(50), index=True, nullable=False)
    analysis_type = Column(String(50), nullable=False)  # 'audit', 'optimization', 'compliance'
    
    # Results stored as JSON
    result = Column(JSON, nullable=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    execution_time_ms = Column(Integer, nullable=True)  # Time taken for analysis
    
    def to_dict(self):
        """Convert model to dictionary."""
        return {
            "id": self.id,
            "project_id": self.project_id,
            "analysis_type": self.analysis_type,
            "result": self.result,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "execution_time_ms": self.execution_time_ms,
        }
