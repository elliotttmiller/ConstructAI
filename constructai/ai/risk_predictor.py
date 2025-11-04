"""
AI-powered risk prediction for construction projects.
Uses historical data and patterns to predict potential risks.
"""

import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class RiskCategory:
    """Risk categories for construction projects."""
    SCHEDULE = "schedule"
    BUDGET = "budget"
    QUALITY = "quality"
    SAFETY = "safety"
    RESOURCE = "resource"
    COMPLIANCE = "compliance"


class RiskPredictor:
    """
    Predicts potential risks in construction projects using pattern analysis.
    
    This is a rule-based implementation that can be enhanced with ML models.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.risk_patterns = self._load_risk_patterns()
    
    def _load_risk_patterns(self) -> Dict[str, List[Dict]]:
        """
        Load risk patterns from historical data.
        In production, this would load from a trained ML model or database.
        """
        return {
            RiskCategory.SCHEDULE: [
                {
                    "pattern": "tight_deadline",
                    "indicators": ["duration_below_average", "complex_dependencies"],
                    "probability": 0.75,
                    "impact": "high"
                },
                {
                    "pattern": "resource_shortage",
                    "indicators": ["high_resource_demand", "limited_availability"],
                    "probability": 0.65,
                    "impact": "medium"
                }
            ],
            RiskCategory.BUDGET: [
                {
                    "pattern": "cost_overrun",
                    "indicators": ["incomplete_estimates", "volatile_materials"],
                    "probability": 0.70,
                    "impact": "high"
                },
                {
                    "pattern": "scope_creep",
                    "indicators": ["undefined_requirements", "frequent_changes"],
                    "probability": 0.60,
                    "impact": "medium"
                }
            ],
            RiskCategory.SAFETY: [
                {
                    "pattern": "high_risk_activities",
                    "indicators": ["height_work", "heavy_equipment", "confined_spaces"],
                    "probability": 0.55,
                    "impact": "critical"
                }
            ]
        }
    
    def predict_risks(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Predict risks for a construction project.
        
        Args:
            project_data: Dictionary containing project information
                - name: str
                - budget: float
                - duration_days: int
                - tasks: list
                - resources: list
                
        Returns:
            List of predicted risks with probability and impact
        """
        try:
            predicted_risks = []
            
            # Analyze project characteristics
            project_profile = self._analyze_project(project_data)
            
            # Match patterns and predict risks
            for category, patterns in self.risk_patterns.items():
                for pattern in patterns:
                    risk_score = self._calculate_risk_score(project_profile, pattern)
                    
                    if risk_score > 0.5:  # Threshold for reporting risk
                        predicted_risks.append({
                            "category": category,
                            "pattern": pattern["pattern"],
                            "probability": risk_score,
                            "impact": pattern["impact"],
                            "description": self._generate_risk_description(category, pattern),
                            "mitigation": self._suggest_mitigation(category, pattern)
                        })
            
            # Sort by priority (probability * impact weight)
            impact_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
            predicted_risks.sort(
                key=lambda x: x["probability"] * impact_weights.get(x["impact"], 1),
                reverse=True
            )
            
            self.logger.info(f"Predicted {len(predicted_risks)} risks for project")
            return predicted_risks
            
        except Exception as e:
            self.logger.error(f"Error predicting risks: {e}")
            return []
    
    def _analyze_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project characteristics to build a profile."""
        tasks = project_data.get("tasks", [])
        resources = project_data.get("resources", [])
        budget = project_data.get("budget", 0)
        duration = project_data.get("duration_days", 0)
        
        return {
            "total_tasks": len(tasks),
            "total_resources": len(resources),
            "budget": budget,
            "duration": duration,
            "budget_per_day": budget / duration if duration > 0 else 0,
            "tasks_per_day": len(tasks) / duration if duration > 0 else 0,
            "has_complex_dependencies": self._has_complex_dependencies(tasks),
            "resource_utilization": self._calculate_resource_utilization(tasks, resources),
        }
    
    def _has_complex_dependencies(self, tasks: List[Dict]) -> bool:
        """Check if project has complex task dependencies."""
        for task in tasks:
            if len(task.get("dependencies", [])) > 3:
                return True
        return False
    
    def _calculate_resource_utilization(self, tasks: List[Dict], resources: List[Dict]) -> float:
        """Calculate resource utilization score."""
        if not resources:
            return 0.0
        
        total_resource_demand = sum(
            len(task.get("resources", [])) for task in tasks
        )
        available_resources = len(resources)
        
        return total_resource_demand / available_resources if available_resources > 0 else 0.0
    
    def _calculate_risk_score(self, project_profile: Dict, pattern: Dict) -> float:
        """Calculate risk score based on project profile and pattern."""
        # Simple scoring: check how many indicators are present
        score = pattern["probability"]
        
        # Adjust based on project characteristics
        if pattern["pattern"] == "tight_deadline" and project_profile["tasks_per_day"] > 2:
            score += 0.1
        
        if pattern["pattern"] == "cost_overrun" and project_profile["budget_per_day"] < 10000:
            score += 0.05
        
        if pattern["pattern"] == "resource_shortage" and project_profile["resource_utilization"] > 1.5:
            score += 0.15
        
        return min(score, 1.0)  # Cap at 1.0
    
    def _generate_risk_description(self, category: str, pattern: Dict) -> str:
        """Generate human-readable risk description."""
        descriptions = {
            "tight_deadline": "Project timeline may be too aggressive given the complexity and dependencies.",
            "resource_shortage": "Insufficient resources may be available during peak demand periods.",
            "cost_overrun": "Budget estimates may not account for all project variables and contingencies.",
            "scope_creep": "Project scope may expand without proper control mechanisms.",
            "high_risk_activities": "Project includes activities with elevated safety concerns."
        }
        return descriptions.get(pattern["pattern"], f"{category.title()} risk detected")
    
    def _suggest_mitigation(self, category: str, pattern: Dict) -> str:
        """Suggest mitigation strategies for identified risks."""
        mitigations = {
            "tight_deadline": "Add buffer time to critical path tasks and consider fast-tracking opportunities.",
            "resource_shortage": "Secure backup resources and establish clear resource allocation priorities.",
            "cost_overrun": "Implement rigorous cost tracking and establish contingency reserves (10-15%).",
            "scope_creep": "Establish formal change control process and require sign-off on scope changes.",
            "high_risk_activities": "Develop detailed safety plans, provide specialized training, and ensure proper equipment."
        }
        return mitigations.get(pattern["pattern"], "Implement regular monitoring and controls.")
