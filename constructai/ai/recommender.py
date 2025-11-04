"""
AI-powered recommendation engine for construction best practices.
Provides intelligent suggestions for project improvement.
"""

import logging
from typing import Dict, List, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class RecommendationEngine:
    """
    Generates intelligent recommendations for construction projects.
    Based on best practices, industry standards, and project analysis.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.best_practices = self._load_best_practices()
    
    def _load_best_practices(self) -> Dict[str, List[Dict]]:
        """Load best practices database."""
        return {
            "schedule_optimization": [
                {
                    "name": "fast_tracking",
                    "description": "Overlap dependent activities to compress schedule",
                    "conditions": ["critical_path_length > 180", "parallel_opportunities > 3"],
                    "benefit": "10-20% schedule reduction",
                    "risk": "Medium - requires careful coordination"
                },
                {
                    "name": "resource_leveling",
                    "description": "Smooth resource usage to avoid peaks and valleys",
                    "conditions": ["resource_conflicts > 2", "resource_utilization_variance > 0.3"],
                    "benefit": "Improved resource efficiency",
                    "risk": "Low - may extend schedule slightly"
                }
            ],
            "cost_optimization": [
                {
                    "name": "value_engineering",
                    "description": "Review materials and methods for cost reduction without quality loss",
                    "conditions": ["budget_pressure > 0.05"],
                    "benefit": "3-8% cost savings",
                    "risk": "Low - systematic approach"
                },
                {
                    "name": "bulk_purchasing",
                    "description": "Negotiate volume discounts with suppliers",
                    "conditions": ["material_diversity > 15"],
                    "benefit": "2-5% material cost savings",
                    "risk": "Low - standard practice"
                }
            ],
            "risk_mitigation": [
                {
                    "name": "contingency_planning",
                    "description": "Develop detailed contingency plans for high-risk activities",
                    "conditions": ["high_risk_activities > 0"],
                    "benefit": "Reduced impact of issues",
                    "risk": "None - proactive approach"
                },
                {
                    "name": "weather_buffer",
                    "description": "Add weather delay buffers for outdoor activities",
                    "conditions": ["outdoor_activities > 5", "season == 'winter' or season == 'spring'"],
                    "benefit": "Realistic schedule expectations",
                    "risk": "None - protective measure"
                }
            ],
            "quality_improvement": [
                {
                    "name": "quality_checkpoints",
                    "description": "Implement staged quality inspections",
                    "conditions": ["project_complexity > 'medium'"],
                    "benefit": "Reduced rework costs",
                    "risk": "None - standard practice"
                },
                {
                    "name": "prefabrication",
                    "description": "Use prefabricated components for consistency",
                    "conditions": ["repetitive_elements > 10"],
                    "benefit": "Improved quality and speed",
                    "risk": "Low - requires planning"
                }
            ],
            "technology_adoption": [
                {
                    "name": "bim_integration",
                    "description": "Implement Building Information Modeling for coordination",
                    "conditions": ["project_size > 'large'", "multiple_disciplines"],
                    "benefit": "Better coordination, fewer conflicts",
                    "risk": "Medium - requires training"
                },
                {
                    "name": "project_management_software",
                    "description": "Use dedicated PM software for tracking and reporting",
                    "conditions": ["tasks > 50"],
                    "benefit": "Improved visibility and control",
                    "risk": "Low - widely adopted"
                }
            ]
        }
    
    def generate_recommendations(self, project_data: Dict[str, Any], analysis_results: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Generate personalized recommendations for a project.
        
        Args:
            project_data: Dictionary with project information
            analysis_results: Optional audit and optimization results
            
        Returns:
            List of prioritized recommendations
        """
        try:
            recommendations = []
            
            # Analyze project characteristics
            project_profile = self._analyze_project_profile(project_data)
            
            # Check each category of best practices
            for category, practices in self.best_practices.items():
                for practice in practices:
                    if self._should_recommend(practice, project_profile, analysis_results):
                        recommendation = {
                            "category": category,
                            "name": practice["name"],
                            "description": practice["description"],
                            "benefit": practice["benefit"],
                            "risk_level": practice["risk"],
                            "priority": self._calculate_priority(practice, project_profile, analysis_results),
                            "implementation_steps": self._generate_implementation_steps(practice),
                            "estimated_effort": self._estimate_implementation_effort(practice),
                        }
                        recommendations.append(recommendation)
            
            # Sort by priority
            recommendations.sort(key=lambda x: x["priority"], reverse=True)
            
            # Add general recommendations
            general_recs = self._generate_general_recommendations(project_profile, analysis_results)
            recommendations.extend(general_recs)
            
            self.logger.info(f"Generated {len(recommendations)} recommendations")
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return []
    
    def _analyze_project_profile(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze project to build profile."""
        tasks = project_data.get("tasks", [])
        resources = project_data.get("resources", [])
        budget = project_data.get("budget", 0)
        duration = project_data.get("duration_days", 90)
        
        return {
            "tasks_count": len(tasks),
            "resources_count": len(resources),
            "budget": budget,
            "duration": duration,
            "complexity": self._assess_complexity(tasks, resources),
            "material_diversity": len([r for r in resources if r.get("type") == "material"]),
            "outdoor_activities": self._count_outdoor_activities(tasks),
            "repetitive_elements": self._count_repetitive_elements(tasks),
            "project_size": self._assess_project_size(budget, duration),
        }
    
    def _should_recommend(self, practice: Dict, profile: Dict, analysis: Dict = None) -> bool:
        """Check if practice should be recommended."""
        # Simple condition checking - can be enhanced with ML
        conditions = practice.get("conditions", [])
        
        for condition in conditions:
            # Parse simple conditions
            if ">" in condition:
                key, threshold = condition.split(">")
                key = key.strip()
                threshold = threshold.strip()
                
                if key in profile:
                    try:
                        if isinstance(profile[key], (int, float)):
                            if not profile[key] > float(threshold):
                                return False
                    except (ValueError, TypeError):
                        # String comparison
                        if not str(profile[key]) > threshold:
                            return False
        
        return True
    
    def _calculate_priority(self, practice: Dict, profile: Dict, analysis: Dict = None) -> float:
        """Calculate recommendation priority score (0-1)."""
        base_priority = 0.5
        
        # Increase priority based on risk level
        risk_map = {"None": 0.1, "Low": 0.2, "Medium": 0.3, "High": 0.4}
        base_priority += risk_map.get(practice["risk"], 0.2)
        
        # Increase priority if project has issues
        if analysis:
            audit_score = analysis.get("audit", {}).get("overall_score", 100)
            if audit_score < 70:
                base_priority += 0.2
        
        # Adjust based on project characteristics
        if profile["complexity"] == "high" and "risk" in practice["name"]:
            base_priority += 0.15
        
        return min(base_priority, 1.0)
    
    def _generate_implementation_steps(self, practice: Dict) -> List[str]:
        """Generate implementation steps for a practice."""
        steps_map = {
            "fast_tracking": [
                "Identify activities that can safely overlap",
                "Assess risk of overlapping activities",
                "Update project schedule with overlaps",
                "Establish communication protocols for overlapping teams"
            ],
            "value_engineering": [
                "Assemble cross-functional review team",
                "Review each major cost component",
                "Identify alternative materials or methods",
                "Evaluate alternatives against quality requirements",
                "Implement approved changes"
            ],
            "bim_integration": [
                "Select appropriate BIM software",
                "Train project team on BIM tools",
                "Develop BIM execution plan",
                "Create coordination workflows",
                "Implement clash detection processes"
            ]
        }
        
        return steps_map.get(practice["name"], [
            "Review current practices",
            "Develop implementation plan",
            "Execute changes",
            "Monitor results"
        ])
    
    def _estimate_implementation_effort(self, practice: Dict) -> str:
        """Estimate effort required to implement practice."""
        effort_map = {
            "fast_tracking": "Medium - 2-3 weeks",
            "resource_leveling": "Low - 1 week",
            "value_engineering": "High - 4-6 weeks",
            "bulk_purchasing": "Low - 1-2 weeks",
            "contingency_planning": "Medium - 2-3 weeks",
            "quality_checkpoints": "Low - 1 week",
            "bim_integration": "High - 8-12 weeks"
        }
        
        return effort_map.get(practice["name"], "Medium - 2-4 weeks")
    
    def _assess_complexity(self, tasks: List[Dict], resources: List[Dict]) -> str:
        """Assess project complexity."""
        task_count = len(tasks)
        resource_count = len(resources)
        
        # Count dependencies
        total_dependencies = sum(len(t.get("dependencies", [])) for t in tasks)
        
        if task_count > 100 or resource_count > 50 or total_dependencies > 150:
            return "high"
        elif task_count > 50 or resource_count > 25 or total_dependencies > 75:
            return "medium"
        else:
            return "low"
    
    def _count_outdoor_activities(self, tasks: List[Dict]) -> int:
        """Count outdoor activities."""
        outdoor_keywords = ["excavation", "foundation", "site", "exterior", "outdoor", "grading"]
        count = 0
        
        for task in tasks:
            name = task.get("name", "").lower()
            desc = task.get("description", "").lower()
            if any(keyword in name or keyword in desc for keyword in outdoor_keywords):
                count += 1
        
        return count
    
    def _count_repetitive_elements(self, tasks: List[Dict]) -> int:
        """Count repetitive task patterns."""
        task_names = [t.get("name", "") for t in tasks]
        repetitive = 0
        
        # Simple check for similar names
        seen = {}
        for name in task_names:
            base_name = name.split()[0] if name else ""
            if base_name in seen:
                repetitive += 1
            seen[base_name] = True
        
        return repetitive
    
    def _assess_project_size(self, budget: float, duration: int) -> str:
        """Assess project size category."""
        if budget > 5000000 or duration > 365:
            return "large"
        elif budget > 1000000 or duration > 180:
            return "medium"
        else:
            return "small"
    
    def _generate_general_recommendations(self, profile: Dict, analysis: Dict = None) -> List[Dict]:
        """Generate general recommendations."""
        general = []
        
        # Duration-based recommendation
        if profile["duration"] > 365:
            general.append({
                "category": "project_management",
                "name": "milestone_tracking",
                "description": "Implement quarterly milestone reviews for long-term project",
                "benefit": "Better progress visibility and control",
                "risk_level": "None",
                "priority": 0.7,
                "implementation_steps": [
                    "Define key project milestones",
                    "Schedule quarterly review meetings",
                    "Establish reporting metrics"
                ],
                "estimated_effort": "Low - 1 week"
            })
        
        return general
