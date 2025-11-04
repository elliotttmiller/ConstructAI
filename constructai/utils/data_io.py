"""
Data import/export utilities for various construction project formats.
"""

import json
import yaml
from typing import Dict, Any, Optional
from datetime import datetime

from ..models.project import Project, Task, Resource, TaskStatus, ResourceType


class ProjectDataHandler:
    """Handles import/export of project data in various formats."""
    
    @staticmethod
    def export_to_json(project: Project, filepath: str) -> None:
        """
        Export project to JSON format.
        
        Args:
            project: Project to export
            filepath: Path to output file
        """
        data = ProjectDataHandler._project_to_dict(project)
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    @staticmethod
    def import_from_json(filepath: str) -> Project:
        """
        Import project from JSON format.
        
        Args:
            filepath: Path to JSON file
            
        Returns:
            Loaded Project object
        """
        with open(filepath, 'r') as f:
            data = json.load(f)
        return ProjectDataHandler._dict_to_project(data)
    
    @staticmethod
    def export_to_yaml(project: Project, filepath: str) -> None:
        """
        Export project to YAML format.
        
        Args:
            project: Project to export
            filepath: Path to output file
        """
        data = ProjectDataHandler._project_to_dict(project)
        with open(filepath, 'w') as f:
            yaml.dump(data, f, default_flow_style=False, sort_keys=False)
    
    @staticmethod
    def import_from_yaml(filepath: str) -> Project:
        """
        Import project from YAML format.
        
        Args:
            filepath: Path to YAML file
            
        Returns:
            Loaded Project object
        """
        with open(filepath, 'r') as f:
            data = yaml.safe_load(f)
        # Use centralized conversion from models module
        from ..models.project import dict_to_project
        return dict_to_project(data)
    
    @staticmethod
    def _project_to_dict(project: Project) -> Dict[str, Any]:
        """Convert Project to dictionary."""
        # Use centralized conversion from models module
        from ..models.project import project_to_dict
        return project_to_dict(project)
    
    @staticmethod
    def _dict_to_project(data: Dict[str, Any]) -> Project:
        """Convert dictionary to Project."""
        # Use centralized conversion from models module
        from ..models.project import dict_to_project
        return dict_to_project(data)


class MSProjectExporter:
    """Export to MS Project compatible format (simplified CSV)."""
    
    @staticmethod
    def export_to_csv(project: Project, filepath: str) -> None:
        """
        Export project to CSV format compatible with MS Project.
        
        Args:
            project: Project to export
            filepath: Path to output CSV file
        """
        import csv
        
        with open(filepath, 'w', newline='') as f:
            writer = csv.writer(f)
            
            # Header
            writer.writerow([
                "Task ID", "Task Name", "Duration (Days)", "Start Date", 
                "End Date", "Dependencies", "Status", "Priority", 
                "Cost", "Risk Level"
            ])
            
            # Tasks
            for task in project.tasks:
                writer.writerow([
                    task.id,
                    task.name,
                    task.duration_days,
                    task.start_date.strftime("%Y-%m-%d") if task.start_date else "",
                    task.end_date.strftime("%Y-%m-%d") if task.end_date else "",
                    ";".join(task.dependencies),
                    task.status.value,
                    task.priority,
                    task.calculate_cost(),
                    task.risk_level
                ])


class PrimaveraExporter:
    """Export to Primavera P6 compatible format (simplified)."""
    
    @staticmethod
    def export_to_xer_format(project: Project, filepath: str) -> None:
        """
        Export project to XER-like format (simplified).
        
        Args:
            project: Project to export
            filepath: Path to output file
        """
        lines = []
        lines.append("CONSTRUCTAI PRIMAVERA EXPORT")
        lines.append(f"PROJECT_ID\t{project.id}")
        lines.append(f"PROJECT_NAME\t{project.name}")
        lines.append(f"START_DATE\t{project.start_date.strftime('%Y-%m-%d')}")
        lines.append("")
        lines.append("TASKS")
        lines.append("ID\tNAME\tDURATION\tPREDECESSORS\tSTART\tFINISH")
        
        for task in project.tasks:
            lines.append(
                f"{task.id}\t{task.name}\t{task.duration_days}\t"
                f"{','.join(task.dependencies)}\t"
                f"{task.start_date.strftime('%Y-%m-%d') if task.start_date else ''}\t"
                f"{task.end_date.strftime('%Y-%m-%d') if task.end_date else ''}"
            )
        
        with open(filepath, 'w') as f:
            f.write("\n".join(lines))
