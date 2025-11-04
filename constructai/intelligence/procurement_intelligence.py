"""
Expert Procurement Intelligence System for Single-User Enterprise.

Provides strategic procurement analysis, build readiness assessment,
and automated workflow generation optimized for expert decision-making.
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class ProcurementPriority(Enum):
    """Procurement priority levels."""
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class ComponentCriticality(Enum):
    """Component criticality on project timeline."""
    BLOCKING = "blocking"  # Blocks multiple tasks
    CRITICAL_PATH = "critical_path"  # On critical path
    IMPORTANT = "important"  # Needed but not blocking
    OPTIONAL = "optional"  # Nice to have


@dataclass
class ProcurementItem:
    """Represents a procurement item with complete analysis."""
    component_name: str
    specification: Dict[str, Any]
    required_quantity: int
    required_date: datetime
    criticality: ComponentCriticality
    estimated_cost: float
    lead_time_days: int
    supplier_options: List[Dict[str, Any]]
    priority: ProcurementPriority
    risk_score: float
    dependencies: List[str] = field(default_factory=list)
    alternatives: List[str] = field(default_factory=list)
    
    def get_procurement_window(self) -> Tuple[datetime, datetime]:
        """Calculate ideal procurement window."""
        # Need to order by: required_date - lead_time - buffer
        buffer_days = 7 if self.criticality in [ComponentCriticality.BLOCKING, ComponentCriticality.CRITICAL_PATH] else 3
        
        latest_order_date = self.required_date - timedelta(days=self.lead_time_days + buffer_days)
        earliest_order_date = latest_order_date - timedelta(days=14)  # 2-week window
        
        return (earliest_order_date, latest_order_date)


@dataclass
class BuildReadinessAssessment:
    """Complete build readiness assessment for a project."""
    project_id: str
    readiness_score: float  # 0-100
    status: str  # "ready", "partial", "not_ready"
    components_ready: int
    components_pending: int
    components_at_risk: int
    critical_path_status: str
    estimated_start_date: datetime
    risk_factors: List[Dict[str, Any]]
    recommendations: List[str]
    procurement_timeline: Dict[str, Any]
    cost_summary: Dict[str, float]


@dataclass
class SupplierPerformance:
    """Supplier performance metrics."""
    supplier_id: str
    supplier_name: str
    on_time_delivery_rate: float
    quality_score: float
    cost_competitiveness: float
    reliability_score: float
    total_orders: int
    recent_issues: List[str]


class ProcurementIntelligence:
    """
    Expert Procurement Intelligence for single-user enterprise system.
    
    Provides:
    - Strategic procurement analysis
    - Component criticality assessment
    - Build readiness scoring
    - Automated purchase order generation
    - Supplier performance analytics
    - Cost optimization strategies
    """
    
    def __init__(self):
        """Initialize procurement intelligence system."""
        self.procurement_history: List[ProcurementItem] = []
        self.supplier_database: Dict[str, SupplierPerformance] = {}
        self._initialize_suppliers()
        
    def assess_component_criticality(
        self,
        component: str,
        project_timeline: Dict[str, Any],
        dependencies: List[str]
    ) -> ComponentCriticality:
        """
        Assess criticality of a component to project timeline.
        
        Args:
            component: Component identifier
            project_timeline: Project schedule data
            dependencies: List of dependent tasks/components
            
        Returns:
            Component criticality level
        """
        # Check if component blocks multiple tasks
        if len(dependencies) > 3:
            return ComponentCriticality.BLOCKING
        
        # Check if on critical path
        if project_timeline.get("critical_path_components", []):
            if component in project_timeline["critical_path_components"]:
                return ComponentCriticality.CRITICAL_PATH
        
        # Check importance based on dependencies
        if len(dependencies) > 0:
            return ComponentCriticality.IMPORTANT
        
        return ComponentCriticality.OPTIONAL
    
    def calculate_procurement_priority(
        self,
        criticality: ComponentCriticality,
        required_date: datetime,
        lead_time_days: int,
        availability_risk: str
    ) -> ProcurementPriority:
        """
        Calculate procurement priority based on multiple factors.
        
        Args:
            criticality: Component criticality level
            required_date: When component is needed
            lead_time_days: Supplier lead time
            availability_risk: Risk level from inventory analysis
            
        Returns:
            Procurement priority level
        """
        days_until_needed = (required_date - datetime.now()).days
        procurement_buffer = days_until_needed - lead_time_days
        
        # Critical components with tight timeline
        if criticality in [ComponentCriticality.BLOCKING, ComponentCriticality.CRITICAL_PATH]:
            if procurement_buffer < 7 or availability_risk == "high":
                return ProcurementPriority.CRITICAL
            elif procurement_buffer < 14:
                return ProcurementPriority.HIGH
        
        # Important components
        if criticality == ComponentCriticality.IMPORTANT:
            if procurement_buffer < 14:
                return ProcurementPriority.HIGH
            elif procurement_buffer < 30:
                return ProcurementPriority.MEDIUM
        
        return ProcurementPriority.LOW
    
    def optimize_procurement_sequence(
        self,
        items: List[ProcurementItem]
    ) -> List[ProcurementItem]:
        """
        Optimize procurement sequence for efficiency and cost.
        
        Args:
            items: List of items to procure
            
        Returns:
            Optimized procurement sequence
        """
        # Sort by priority, then by required date, then by cost
        def sort_key(item: ProcurementItem):
            priority_weight = {
                ProcurementPriority.CRITICAL: 0,
                ProcurementPriority.HIGH: 1,
                ProcurementPriority.MEDIUM: 2,
                ProcurementPriority.LOW: 3
            }
            return (
                priority_weight[item.priority],
                item.required_date.timestamp(),
                -item.estimated_cost  # Negative for descending (high-cost items first)
            )
        
        optimized = sorted(items, key=sort_key)
        
        logger.info(f"Optimized procurement sequence for {len(optimized)} items")
        return optimized
    
    def assess_build_readiness(
        self,
        project_id: str,
        required_components: List[Dict[str, Any]],
        availability_data: Dict[str, Any],
        project_start_date: datetime
    ) -> BuildReadinessAssessment:
        """
        Perform comprehensive build readiness assessment.
        
        Args:
            project_id: Project identifier
            required_components: List of required components
            availability_data: Current availability information
            project_start_date: Planned project start date
            
        Returns:
            Complete build readiness assessment
        """
        total_components = len(required_components)
        components_ready = 0
        components_pending = 0
        components_at_risk = 0
        risk_factors = []
        recommendations = []
        
        # Analyze each component
        for comp in required_components:
            comp_name = comp.get("name", "")
            availability = availability_data.get(comp_name, {})
            
            if availability.get("is_available", False):
                components_ready += 1
            elif availability.get("procurement_urgency") == "immediate":
                components_at_risk += 1
                risk_factors.append({
                    "component": comp_name,
                    "risk": "Immediate procurement needed",
                    "impact": "high"
                })
            else:
                components_pending += 1
        
        # Calculate readiness score (0-100)
        if total_components > 0:
            readiness_score = (
                (components_ready * 100 +
                 components_pending * 50 +
                 components_at_risk * 0) / total_components
            )
        else:
            readiness_score = 0
        
        # Determine status
        if readiness_score >= 90:
            status = "ready"
        elif readiness_score >= 60:
            status = "partial"
        else:
            status = "not_ready"
        
        # Critical path status
        critical_components_ready = components_ready >= (total_components * 0.7)
        critical_path_status = "clear" if critical_components_ready else "blocked"
        
        # Estimate realistic start date
        max_lead_time = max(
            (comp.get("lead_time_days", 0) for comp in required_components),
            default=0
        )
        buffer_days = 7 if components_at_risk > 0 else 3
        estimated_start_date = datetime.now() + timedelta(days=max_lead_time + buffer_days)
        
        # Generate recommendations
        if components_at_risk > 0:
            recommendations.append(f"Expedite procurement for {components_at_risk} at-risk components")
        
        if readiness_score < 90:
            recommendations.append("Begin procurement process immediately for pending components")
        
        if critical_path_status == "blocked":
            recommendations.append("Focus on critical path components to avoid project delays")
        
        # Procurement timeline
        procurement_timeline = {
            "immediate_actions_needed": components_at_risk,
            "short_term_procurement": components_pending,
            "ready_to_use": components_ready,
            "estimated_completion_date": (datetime.now() + timedelta(days=max_lead_time)).isoformat()
        }
        
        # Cost summary
        total_cost = sum(comp.get("estimated_cost", 0) * comp.get("quantity", 1) 
                        for comp in required_components)
        
        cost_summary = {
            "total_estimated_cost": total_cost,
            "components_budgeted": total_components,
            "average_cost_per_component": total_cost / total_components if total_components > 0 else 0
        }
        
        return BuildReadinessAssessment(
            project_id=project_id,
            readiness_score=round(readiness_score, 2),
            status=status,
            components_ready=components_ready,
            components_pending=components_pending,
            components_at_risk=components_at_risk,
            critical_path_status=critical_path_status,
            estimated_start_date=estimated_start_date,
            risk_factors=risk_factors,
            recommendations=recommendations,
            procurement_timeline=procurement_timeline,
            cost_summary=cost_summary
        )
    
    def generate_purchase_order(
        self,
        item: ProcurementItem,
        supplier_id: str,
        user_details: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate automated purchase order.
        
        Args:
            item: Procurement item
            supplier_id: Selected supplier
            user_details: User/company information
            
        Returns:
            Purchase order document
        """
        po_number = f"PO-{datetime.now().strftime('%Y%m%d')}-{str(id(item))[-6:]}"
        
        supplier = self.supplier_database.get(supplier_id, None)
        if not supplier:
            supplier_name = "Unknown Supplier"
        else:
            supplier_name = supplier.supplier_name
        
        purchase_order = {
            "po_number": po_number,
            "date_issued": datetime.now().isoformat(),
            "buyer": user_details.get("company_name", "Expert User"),
            "buyer_contact": user_details.get("contact", ""),
            "supplier": supplier_name,
            "supplier_id": supplier_id,
            "items": [
                {
                    "description": item.component_name,
                    "specification": item.specification,
                    "quantity": item.required_quantity,
                    "unit_cost": item.estimated_cost,
                    "total_cost": item.estimated_cost * item.required_quantity
                }
            ],
            "total_amount": item.estimated_cost * item.required_quantity,
            "required_delivery_date": item.required_date.isoformat(),
            "payment_terms": "Net 30",
            "special_instructions": f"Priority: {item.priority.value}, Criticality: {item.criticality.value}",
            "status": "draft"
        }
        
        logger.info(f"Generated purchase order: {po_number}")
        return purchase_order
    
    def analyze_supplier_performance(self, supplier_id: str) -> Optional[SupplierPerformance]:
        """
        Get detailed supplier performance analytics.
        
        Args:
            supplier_id: Supplier identifier
            
        Returns:
            Supplier performance metrics
        """
        return self.supplier_database.get(supplier_id)
    
    def recommend_supplier(
        self,
        component: str,
        requirements: Dict[str, Any]
    ) -> List[Tuple[str, float]]:
        """
        Recommend suppliers based on performance and requirements.
        
        Args:
            component: Component name
            requirements: Procurement requirements
            
        Returns:
            List of (supplier_id, score) tuples, sorted by score
        """
        recommendations = []
        
        for supplier_id, perf in self.supplier_database.items():
            # Calculate composite score
            score = (
                perf.on_time_delivery_rate * 0.35 +
                perf.quality_score * 0.25 +
                perf.cost_competitiveness * 0.25 +
                perf.reliability_score * 0.15
            )
            
            # Adjust for criticality
            if requirements.get("criticality") in ["blocking", "critical_path"]:
                # Prioritize reliability and on-time delivery
                score = (
                    perf.on_time_delivery_rate * 0.45 +
                    perf.reliability_score * 0.35 +
                    perf.quality_score * 0.15 +
                    perf.cost_competitiveness * 0.05
                )
            
            recommendations.append((supplier_id, score))
        
        # Sort by score (descending)
        recommendations.sort(key=lambda x: x[1], reverse=True)
        
        logger.info(f"Generated {len(recommendations)} supplier recommendations")
        return recommendations
    
    def _initialize_suppliers(self):
        """Initialize sample supplier database."""
        self.supplier_database = {
            "SUP-001": SupplierPerformance(
                supplier_id="SUP-001",
                supplier_name="Premier Steel & Materials",
                on_time_delivery_rate=0.95,
                quality_score=0.92,
                cost_competitiveness=0.85,
                reliability_score=0.94,
                total_orders=450,
                recent_issues=[]
            ),
            "SUP-002": SupplierPerformance(
                supplier_id="SUP-002",
                supplier_name="BuildRight Supplies",
                on_time_delivery_rate=0.88,
                quality_score=0.90,
                cost_competitiveness=0.92,
                reliability_score=0.87,
                total_orders=320,
                recent_issues=["Delayed delivery on 2024-10-15"]
            ),
            "SUP-003": SupplierPerformance(
                supplier_id="SUP-003",
                supplier_name="Industrial Equipment Co",
                on_time_delivery_rate=0.92,
                quality_score=0.95,
                cost_competitiveness=0.78,
                reliability_score=0.91,
                total_orders=280,
                recent_issues=[]
            ),
            "SUP-004": SupplierPerformance(
                supplier_id="SUP-004",
                supplier_name="FastTrack Materials",
                on_time_delivery_rate=0.85,
                quality_score=0.88,
                cost_competitiveness=0.95,
                reliability_score=0.83,
                total_orders=510,
                recent_issues=["Quality issue on order #12345"]
            )
        }
