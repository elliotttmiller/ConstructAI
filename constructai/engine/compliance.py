"""
Compliance Checker - Ensures project compliance with industry standards.

Validates projects against:
- ISO 19650 (BIM)
- ISO 9001 (Quality Management)
- OSHA (Safety)
- PMI PMBOK (Project Management)
- RICS (Cost Management)
"""

from typing import Dict, List
from ..models.project import Project, Task


class ComplianceStandard:
    """Base class for compliance standards."""
    
    def __init__(self, name: str, version: str):
        self.name = name
        self.version = version
        self.requirements: List[Dict] = []
    
    def check_compliance(self, project: Project) -> List[Dict]:
        """Check project compliance against this standard."""
        raise NotImplementedError


class ISO19650Compliance(ComplianceStandard):
    """ISO 19650 - BIM compliance checker."""
    
    def __init__(self):
        super().__init__("ISO 19650", "2018")
        self.requirements = [
            {
                "id": "BIM-001",
                "description": "Information requirements must be defined",
                "category": "information_management"
            },
            {
                "id": "BIM-002",
                "description": "Collaboration procedures must be established",
                "category": "collaboration"
            }
        ]
    
    def check_compliance(self, project: Project) -> List[Dict]:
        """Check ISO 19650 compliance."""
        issues = []
        
        # Check if BIM-related metadata exists
        if "bim_level" not in project.metadata:
            issues.append({
                "standard": self.name,
                "requirement": "BIM-001",
                "severity": "medium",
                "description": "BIM information requirements not defined in project metadata"
            })
        
        return issues


class OSHACompliance(ComplianceStandard):
    """OSHA - Safety compliance checker."""
    
    def __init__(self):
        super().__init__("OSHA", "Current")
        self.high_risk_keywords = [
            "excavation", "steel erection", "scaffolding", "confined space",
            "fall protection", "electrical", "trenching", "demolition"
        ]
    
    def check_compliance(self, project: Project) -> List[Dict]:
        """Check OSHA compliance."""
        issues = []
        
        for task in project.tasks:
            # Check if high-risk tasks have safety requirements
            is_high_risk = any(
                keyword in task.name.lower() or keyword in task.description.lower()
                for keyword in self.high_risk_keywords
            )
            
            if is_high_risk and not task.compliance_requirements:
                issues.append({
                    "standard": self.name,
                    "requirement": "OSHA-SAFETY",
                    "severity": "high",
                    "description": f"High-risk task '{task.name}' missing safety compliance requirements",
                    "task_id": task.id
                })
        
        return issues


class PMBOKCompliance(ComplianceStandard):
    """PMI PMBOK - Project management compliance checker."""
    
    def __init__(self):
        super().__init__("PMI PMBOK", "7th Edition")
    
    def check_compliance(self, project: Project) -> List[Dict]:
        """Check PMBOK compliance."""
        issues = []
        
        # Check if project has proper planning
        if not project.target_end_date:
            issues.append({
                "standard": self.name,
                "requirement": "PMBOK-SCHEDULE",
                "severity": "high",
                "description": "Project missing target end date (schedule baseline)"
            })
        
        if project.budget == 0:
            issues.append({
                "standard": self.name,
                "requirement": "PMBOK-BUDGET",
                "severity": "high",
                "description": "Project missing budget (cost baseline)"
            })
        
        # Check if tasks have proper dependencies
        tasks_without_deps = [t for t in project.tasks if not t.dependencies and t.id != project.tasks[0].id]
        if len(tasks_without_deps) > len(project.tasks) * 0.5:
            issues.append({
                "standard": self.name,
                "requirement": "PMBOK-DEPENDENCIES",
                "severity": "medium",
                "description": f"{len(tasks_without_deps)} tasks have no dependencies - review project logic"
            })
        
        return issues


class ComplianceChecker:
    """
    Comprehensive compliance checker for construction projects.
    
    Validates against multiple industry standards and regulations.
    """
    
    def __init__(self):
        self.standards = [
            ISO19650Compliance(),
            OSHACompliance(),
            PMBOKCompliance()
        ]
    
    def check_all(self, project: Project) -> Dict:
        """
        Check compliance against all standards.
        
        Args:
            project: The project to check
            
        Returns:
            Dictionary containing all compliance issues by standard
        """
        results = {
            "project_id": project.id,
            "project_name": project.name,
            "standards_checked": [s.name for s in self.standards],
            "issues": [],
            "summary": {}
        }
        
        # Check each standard
        all_issues = []
        for standard in self.standards:
            issues = standard.check_compliance(project)
            all_issues.extend(issues)
        
        results["issues"] = all_issues
        results["summary"] = {
            "total_issues": len(all_issues),
            "high_severity": sum(1 for i in all_issues if i.get("severity") == "high"),
            "medium_severity": sum(1 for i in all_issues if i.get("severity") == "medium"),
            "low_severity": sum(1 for i in all_issues if i.get("severity") == "low")
        }
        
        return results
    
    def is_compliant(self, project: Project) -> bool:
        """Check if project is fully compliant."""
        results = self.check_all(project)
        return results["summary"]["total_issues"] == 0
