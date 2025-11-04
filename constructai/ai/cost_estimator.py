"""
AI-powered cost estimation for construction projects.
Provides intelligent cost predictions based on project characteristics.
"""

import logging
from typing import Dict, List, Any

logger = logging.getLogger(__name__)


class CostEstimator:
    """
    Estimates construction project costs using pattern matching and historical data.
    
    Can be enhanced with machine learning models trained on historical projects.
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.cost_factors = self._load_cost_factors()
    
    def _load_cost_factors(self) -> Dict[str, Dict]:
        """
        Load cost factors for different project types and activities.
        In production, load from trained models or historical database.
        """
        return {
            "labor": {
                "skilled": 85.0,  # $ per hour
                "semi_skilled": 45.0,
                "unskilled": 25.0,
                "overhead_multiplier": 1.35  # Benefits, taxes, etc.
            },
            "materials": {
                "concrete": 150.0,  # $ per cubic yard
                "steel": 800.0,  # $ per ton
                "lumber": 450.0,  # $ per thousand board feet
                "drywall": 12.0,  # $ per sheet
                "contingency": 0.10  # 10% contingency
            },
            "equipment": {
                "excavator": 350.0,  # $ per day
                "crane": 800.0,
                "concrete_mixer": 150.0,
                "daily_mobilization": 0.15  # 15% daily cost
            },
            "overhead": {
                "general_conditions": 0.12,  # 12% of direct costs
                "profit_margin": 0.08,  # 8% profit margin
                "insurance": 0.03  # 3% insurance
            }
        }
    
    def estimate_cost(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Estimate total project cost with detailed breakdown.
        
        Args:
            project_data: Dictionary containing:
                - tasks: List of tasks with resources
                - resources: List of resources needed
                - project_type: Type of project (residential, commercial, etc.)
                - duration_days: Expected duration
                
        Returns:
            Dictionary with cost estimates and breakdown
        """
        try:
            tasks = project_data.get("tasks", [])
            resources = project_data.get("resources", [])
            duration = project_data.get("duration_days", 90)
            
            # Calculate component costs
            labor_cost = self._estimate_labor_cost(tasks, resources, duration)
            material_cost = self._estimate_material_cost(resources)
            equipment_cost = self._estimate_equipment_cost(resources, duration)
            
            # Calculate subtotal
            direct_cost = labor_cost + material_cost + equipment_cost
            
            # Add overheads
            overhead_cost = direct_cost * self.cost_factors["overhead"]["general_conditions"]
            insurance_cost = direct_cost * self.cost_factors["overhead"]["insurance"]
            profit = (direct_cost + overhead_cost + insurance_cost) * self.cost_factors["overhead"]["profit_margin"]
            
            # Calculate total
            total_estimated_cost = direct_cost + overhead_cost + insurance_cost + profit
            
            # Add contingency
            contingency = total_estimated_cost * self.cost_factors["materials"]["contingency"]
            total_with_contingency = total_estimated_cost + contingency
            
            self.logger.info(f"Estimated project cost: ${total_with_contingency:,.2f}")
            
            return {
                "total_estimated_cost": round(total_with_contingency, 2),
                "confidence_level": self._calculate_confidence(project_data),
                "breakdown": {
                    "labor": round(labor_cost, 2),
                    "materials": round(material_cost, 2),
                    "equipment": round(equipment_cost, 2),
                    "overhead": round(overhead_cost, 2),
                    "insurance": round(insurance_cost, 2),
                    "profit": round(profit, 2),
                    "contingency": round(contingency, 2)
                },
                "cost_per_day": round(total_with_contingency / duration, 2) if duration > 0 else 0,
                "recommendations": self._generate_cost_recommendations(project_data, total_with_contingency)
            }
            
        except Exception as e:
            self.logger.error(f"Error estimating cost: {e}")
            return {
                "total_estimated_cost": 0,
                "confidence_level": 0,
                "error": str(e)
            }
    
    def _estimate_labor_cost(self, tasks: List[Dict], resources: List[Dict], duration: int) -> float:
        """Estimate labor costs."""
        labor_cost = 0.0
        
        # Count labor resources
        labor_resources = [r for r in resources if r.get("type") == "labor"]
        
        for resource in labor_resources:
            quantity = resource.get("quantity", 1)
            skill_level = resource.get("skill_level", "semi_skilled")
            hourly_rate = self.cost_factors["labor"].get(skill_level, 45.0)
            hours_per_day = 8
            
            # Estimate: resource works for average of 75% of project duration
            estimated_days = duration * 0.75
            
            cost = quantity * hourly_rate * hours_per_day * estimated_days
            labor_cost += cost * self.cost_factors["labor"]["overhead_multiplier"]
        
        return labor_cost
    
    def _estimate_material_cost(self, resources: List[Dict]) -> float:
        """Estimate material costs."""
        material_cost = 0.0
        
        # Count material resources
        material_resources = [r for r in resources if r.get("type") == "material"]
        
        for resource in material_resources:
            quantity = resource.get("quantity", 1)
            unit_cost = resource.get("cost_per_unit", 0)
            
            if unit_cost > 0:
                material_cost += quantity * unit_cost
            else:
                # Use default rates if not specified
                material_type = resource.get("name", "").lower()
                if "concrete" in material_type:
                    material_cost += quantity * self.cost_factors["materials"]["concrete"]
                elif "steel" in material_type:
                    material_cost += quantity * self.cost_factors["materials"]["steel"]
                else:
                    material_cost += quantity * 100  # Default estimate
        
        return material_cost
    
    def _estimate_equipment_cost(self, resources: List[Dict], duration: int) -> float:
        """Estimate equipment costs."""
        equipment_cost = 0.0
        
        # Count equipment resources
        equipment_resources = [r for r in resources if r.get("type") == "equipment"]
        
        for resource in equipment_resources:
            daily_rate = resource.get("cost_per_unit", 300.0)
            
            # Estimate: equipment used for 50% of project duration
            estimated_days = duration * 0.5
            
            cost = daily_rate * estimated_days
            equipment_cost += cost * (1 + self.cost_factors["equipment"]["daily_mobilization"])
        
        return equipment_cost
    
    def _calculate_confidence(self, project_data: Dict) -> float:
        """Calculate confidence level for the estimate (0-1)."""
        confidence = 0.70  # Base confidence
        
        # Increase confidence if we have detailed resource information
        resources = project_data.get("resources", [])
        if len(resources) > 5:
            confidence += 0.10
        
        # Increase confidence if we have detailed tasks
        tasks = project_data.get("tasks", [])
        if len(tasks) > 10:
            confidence += 0.10
        
        # Decrease confidence for very short or very long projects
        duration = project_data.get("duration_days", 90)
        if duration < 30 or duration > 365:
            confidence -= 0.10
        
        return min(max(confidence, 0.0), 1.0)
    
    def _generate_cost_recommendations(self, project_data: Dict, estimated_cost: float) -> List[str]:
        """Generate recommendations for cost optimization."""
        recommendations = []
        
        budget = project_data.get("budget", 0)
        
        if budget > 0 and estimated_cost > budget:
            overage_percent = ((estimated_cost - budget) / budget) * 100
            recommendations.append(
                f"Estimated cost exceeds budget by {overage_percent:.1f}%. "
                f"Consider value engineering or scope adjustments."
            )
        
        resources = project_data.get("resources", [])
        material_count = len([r for r in resources if r.get("type") == "material"])
        
        if material_count > 20:
            recommendations.append(
                "Large number of material types detected. Consider bulk purchasing agreements "
                "and supplier consolidation to reduce costs."
            )
        
        duration = project_data.get("duration_days", 90)
        cost_per_day = estimated_cost / duration if duration > 0 else 0
        
        if cost_per_day > 50000:
            recommendations.append(
                f"High daily burn rate (${cost_per_day:,.2f}/day). Ensure robust cost tracking "
                f"and regular budget reviews."
            )
        
        if not recommendations:
            recommendations.append("Cost estimate appears reasonable. Ensure regular cost monitoring throughout project.")
        
        return recommendations
