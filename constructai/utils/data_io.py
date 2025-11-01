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
        return ProjectDataHandler._dict_to_project(data)
    
    @staticmethod
    def _project_to_dict(project: Project) -> Dict[str, Any]:
        """Convert Project to dictionary."""
        return {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "start_date": project.start_date.isoformat() if project.start_date else None,
            "target_end_date": project.target_end_date.isoformat() if project.target_end_date else None,
            "budget": project.budget,
            "metadata": project.metadata,
            "tasks": [
                {
                    "id": task.id,
                    "name": task.name,
                    "description": task.description,
                    "duration_days": task.duration_days,
                    "dependencies": task.dependencies,
                    "status": task.status.value,
                    "priority": task.priority,
                    "start_date": task.start_date.isoformat() if task.start_date else None,
                    "end_date": task.end_date.isoformat() if task.end_date else None,
                    "compliance_requirements": task.compliance_requirements,
                    "risk_level": task.risk_level,
                    "resources": [
                        {
                            "id": res.id,
                            "name": res.name,
                            "type": res.type.value,
                            "quantity": res.quantity,
                            "unit": res.unit,
                            "cost_per_unit": res.cost_per_unit,
                            "availability": res.availability
                        }
                        for res in task.resources
                    ]
                }
                for task in project.tasks
            ]
        }
    
    @staticmethod
    def _dict_to_project(data: Dict[str, Any]) -> Project:
        """Convert dictionary to Project."""
        project = Project(
            id=data["id"],
            name=data["name"],
            description=data["description"],
            start_date=datetime.fromisoformat(data["start_date"]) if data.get("start_date") else datetime.now(),
            target_end_date=datetime.fromisoformat(data["target_end_date"]) if data.get("target_end_date") else None,
            budget=data.get("budget", 0.0),
            metadata=data.get("metadata", {})
        )
        
        for task_data in data.get("tasks", []):
            resources = [
                Resource(
                    id=res["id"],
                    name=res["name"],
                    type=ResourceType(res["type"]),
                    quantity=res["quantity"],
                    unit=res["unit"],
                    cost_per_unit=res.get("cost_per_unit", 0.0),
                    availability=res.get("availability", 1.0)
                )
                for res in task_data.get("resources", [])
            ]
            
            task = Task(
                id=task_data["id"],
                name=task_data["name"],
                description=task_data["description"],
                duration_days=task_data["duration_days"],
                dependencies=task_data.get("dependencies", []),
                resources=resources,
                status=TaskStatus(task_data.get("status", "planned")),
                priority=task_data.get("priority", 1),
                start_date=datetime.fromisoformat(task_data["start_date"]) if task_data.get("start_date") else None,
                end_date=datetime.fromisoformat(task_data["end_date"]) if task_data.get("end_date") else None,
                compliance_requirements=task_data.get("compliance_requirements", []),
                risk_level=task_data.get("risk_level", 0.0)
            )
            project.add_task(task)
        
        return project


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
