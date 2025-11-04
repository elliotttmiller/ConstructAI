"""
AI-powered risk prediction for construction projects.
Uses historical data and patterns to predict potential risks.
"""

import logging
from typing import Dict, List, Any
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

# Import AI manager for enhanced predictions
try:
    from .providers import AIModelManager
    AI_ENABLED = True
except ImportError:
    AI_ENABLED = False
    logger.warning("AI providers not available for enhanced risk prediction")


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
    Now integrates with AI model for enhanced predictions.
    """
    
    def __init__(self, use_ai: bool = True):
        self.logger = logging.getLogger(__name__)
        self.risk_patterns = self._load_risk_patterns()
        self.use_ai = use_ai and AI_ENABLED
        self.ai_manager = AIModelManager() if self.use_ai else None
        if self.use_ai:
            logger.info("RiskPredictor initialized with AI enhancement")
    
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
            # Get rule-based predictions
            predicted_risks = self._predict_risks_rule_based(project_data)
            
            # Enhance with AI if available
            if self.use_ai and self.ai_manager:
                try:
                    ai_risks = self._predict_risks_ai_enhanced(project_data)
                    # Merge and deduplicate
                    predicted_risks = self._merge_risk_predictions(predicted_risks, ai_risks)
                except Exception as e:
                    logger.warning(f"AI enhancement failed, using rule-based only: {e}")
            
            self.logger.info(f"Predicted {len(predicted_risks)} risks for project")
            return predicted_risks
            
        except Exception as e:
            self.logger.error(f"Error predicting risks: {e}")
            return []
    
    def _predict_risks_rule_based(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Rule-based risk prediction (original logic)."""
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
                        "mitigation": self._suggest_mitigation(category, pattern),
                        "source": "rule_based"
                    })
        
        # Sort by priority (probability * impact weight)
        impact_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        predicted_risks.sort(
            key=lambda x: x["probability"] * impact_weights.get(x["impact"], 1),
            reverse=True
        )
        
        return predicted_risks
    
    def _predict_risks_ai_enhanced(self, project_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Use AI model for enhanced risk prediction."""
        # Prepare context for AI
        context = {
            "project_name": project_data.get("name", "Unknown"),
            "budget": project_data.get("budget", 0),
            "duration_days": project_data.get("duration_days", 0),
            "task_count": len(project_data.get("tasks", [])),
            "resource_count": len(project_data.get("resources", [])),
            "project_context": self._format_project_context(project_data)
        }
        
        # Generate AI prediction with specialized prompt
        try:
            response = self.ai_manager.generate(
                prompt="",  # Will be filled by prompt engineer
                task_type="risk_prediction",
                context=context,
                temperature=0.6,
                max_tokens=2048
            )
            
            # Parse AI response (expecting structured output)
            ai_risks = self._parse_ai_risk_response(response.content)
            return ai_risks
            
        except Exception as e:
            logger.error(f"AI risk prediction failed: {e}")
            return []
    
    def _format_project_context(self, project_data: Dict[str, Any]) -> str:
        """Format project data for AI context."""
        tasks = project_data.get("tasks", [])
        resources = project_data.get("resources", [])
        
        context = []
        if tasks:
            context.append(f"Tasks: {len(tasks)} total")
            for task in tasks[:5]:  # Sample first 5
                context.append(f"  - {task.get('name', 'N/A')}")
        
        if resources:
            context.append(f"Resources: {len(resources)} total")
            for res in resources[:5]:
                context.append(f"  - {res.get('name', 'N/A')} ({res.get('type', 'N/A')})")
        
        return "\n".join(context)
    
    def _parse_ai_risk_response(self, content: str) -> List[Dict[str, Any]]:
        """Parse AI response into structured risk list."""
        import json
        import re
        
        risks = []
        
        # Try to extract JSON from response
        json_match = re.search(r'\{.*\}|\[.*\]', content, re.DOTALL)
        if json_match:
            try:
                data = json.loads(json_match.group())
                if isinstance(data, dict) and "risks" in data:
                    risks = data["risks"]
                elif isinstance(data, list):
                    risks = data
            except json.JSONDecodeError:
                logger.warning("Could not parse AI response as JSON")
        
        # Ensure proper format
        formatted_risks = []
        for risk in risks:
            if isinstance(risk, dict):
                formatted_risks.append({
                    "category": risk.get("category", "general"),
                    "pattern": risk.get("pattern", "ai_identified"),
                    "probability": float(risk.get("probability", 0.5)),
                    "impact": risk.get("impact", "medium"),
                    "description": risk.get("description", ""),
                    "mitigation": risk.get("mitigation", ""),
                    "source": "ai_enhanced"
                })
        
        return formatted_risks
    
    def _merge_risk_predictions(
        self,
        rule_based: List[Dict[str, Any]],
        ai_enhanced: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Merge rule-based and AI predictions, avoiding duplicates."""
        merged = list(rule_based)  # Start with rule-based
        
        # Add AI risks that don't overlap
        for ai_risk in ai_enhanced:
            is_duplicate = False
            for existing in merged:
                if (existing["category"] == ai_risk["category"] and 
                    existing.get("pattern") == ai_risk.get("pattern")):
                    is_duplicate = True
                    # Update with AI insights if probability is higher
                    if ai_risk["probability"] > existing["probability"]:
                        existing.update(ai_risk)
                    break
            
            if not is_duplicate:
                merged.append(ai_risk)
        
        # Re-sort by priority
        impact_weights = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        merged.sort(
            key=lambda x: x["probability"] * impact_weights.get(x["impact"], 1),
            reverse=True
        )
        
        return merged
    
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
