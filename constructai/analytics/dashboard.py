"""
Expert Dashboard Analytics for Single-User Enterprise System.

Provides comprehensive metrics, insights, and visualizations for
expert decision-making across all intelligence modules.
"""

from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, field
import logging

logger = logging.getLogger(__name__)


@dataclass
class DashboardMetrics:
    """Comprehensive dashboard metrics."""
    timestamp: datetime
    inventory_health: Dict[str, Any]
    procurement_status: Dict[str, Any]
    project_readiness: Dict[str, Any]
    cost_summary: Dict[str, float]
    performance_indicators: Dict[str, float]
    recent_activities: List[Dict[str, Any]]
    alerts: List[Dict[str, str]]
    trends: Dict[str, List[float]]


class ExpertDashboard:
    """
    Expert Dashboard Analytics System.
    
    Provides:
    - Real-time status across all intelligence modules
    - Key performance indicators (KPIs)
    - Trend analysis and forecasting
    - Critical alerts and notifications
    - Activity timeline
    - Cost optimization insights
    """
    
    def __init__(self):
        """Initialize expert dashboard."""
        self.activity_log: List[Dict[str, Any]] = []
        self.metrics_history: List[DashboardMetrics] = []
        
    def get_dashboard_metrics(
        self,
        inventory_health: Optional[Dict[str, Any]] = None,
        procurement_data: Optional[Dict[str, Any]] = None,
        project_data: Optional[Dict[str, Any]] = None
    ) -> DashboardMetrics:
        """
        Get comprehensive dashboard metrics.
        
        Args:
            inventory_health: Current inventory health data
            procurement_data: Procurement status data
            project_data: Project readiness data
            
        Returns:
            Complete dashboard metrics
        """
        timestamp = datetime.now()
        
        # Default values if not provided
        if inventory_health is None:
            inventory_health = self._get_default_inventory_health()
        
        if procurement_data is None:
            procurement_data = self._get_default_procurement_data()
        
        if project_data is None:
            project_data = self._get_default_project_data()
        
        # Calculate cost summary
        cost_summary = self._calculate_cost_summary(procurement_data, project_data)
        
        # Calculate performance indicators
        performance_indicators = self._calculate_kpis(
            inventory_health,
            procurement_data,
            project_data
        )
        
        # Get recent activities
        recent_activities = self._get_recent_activities(limit=10)
        
        # Generate alerts
        alerts = self._generate_alerts(
            inventory_health,
            procurement_data,
            project_data,
            performance_indicators
        )
        
        # Calculate trends
        trends = self._calculate_trends()
        
        metrics = DashboardMetrics(
            timestamp=timestamp,
            inventory_health=inventory_health,
            procurement_status=procurement_data,
            project_readiness=project_data,
            cost_summary=cost_summary,
            performance_indicators=performance_indicators,
            recent_activities=recent_activities,
            alerts=alerts,
            trends=trends
        )
        
        # Store in history
        self.metrics_history.append(metrics)
        
        # Keep only last 100 entries
        if len(self.metrics_history) > 100:
            self.metrics_history = self.metrics_history[-100:]
        
        return metrics
    
    def log_activity(
        self,
        activity_type: str,
        description: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Log an activity for the activity timeline.
        
        Args:
            activity_type: Type of activity (procurement, analysis, etc.)
            description: Human-readable description
            metadata: Additional metadata
        """
        activity = {
            "timestamp": datetime.now().isoformat(),
            "type": activity_type,
            "description": description,
            "metadata": metadata or {}
        }
        
        self.activity_log.append(activity)
        
        # Keep only last 1000 activities
        if len(self.activity_log) > 1000:
            self.activity_log = self.activity_log[-1000:]
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """
        Get performance summary across all systems.
        
        Returns:
            Performance summary with key metrics
        """
        if not self.metrics_history:
            return {
                "status": "no_data",
                "message": "No metrics available yet"
            }
        
        latest = self.metrics_history[-1]
        
        # Calculate averages over last 24 hours
        cutoff = datetime.now() - timedelta(hours=24)
        recent_metrics = [
            m for m in self.metrics_history
            if m.timestamp >= cutoff
        ]
        
        if recent_metrics:
            avg_readiness = sum(
                m.project_readiness.get("readiness_score", 0)
                for m in recent_metrics
            ) / len(recent_metrics)
            
            avg_stock_coverage = sum(
                m.inventory_health.get("stock_coverage", 0)
                for m in recent_metrics
            ) / len(recent_metrics)
        else:
            avg_readiness = latest.project_readiness.get("readiness_score", 0)
            avg_stock_coverage = latest.inventory_health.get("stock_coverage", 0)
        
        return {
            "status": "operational",
            "timestamp": latest.timestamp.isoformat(),
            "summary": {
                "inventory_status": latest.inventory_health.get("status", "unknown"),
                "stock_coverage_pct": round(avg_stock_coverage, 1),
                "project_readiness_pct": round(avg_readiness, 1),
                "active_alerts": len(latest.alerts),
                "critical_alerts": len([a for a in latest.alerts if a.get("severity") == "critical"])
            },
            "kpis": latest.performance_indicators,
            "trends": {
                "direction": self._analyze_trend_direction(latest.trends),
                "data": latest.trends
            }
        }
    
    def _get_default_inventory_health(self) -> Dict[str, Any]:
        """Get default inventory health data."""
        return {
            "status": "healthy",
            "total_items": 0,
            "in_stock": 0,
            "low_stock": 0,
            "out_of_stock": 0,
            "stock_coverage": 0
        }
    
    def _get_default_procurement_data(self) -> Dict[str, Any]:
        """Get default procurement data."""
        return {
            "active_procurements": 0,
            "critical_items": 0,
            "high_priority_items": 0,
            "pending_pos": 0,
            "total_value": 0
        }
    
    def _get_default_project_data(self) -> Dict[str, Any]:
        """Get default project data."""
        return {
            "readiness_score": 0,
            "status": "not_ready",
            "components_ready": 0,
            "components_pending": 0,
            "components_at_risk": 0
        }
    
    def _calculate_cost_summary(
        self,
        procurement_data: Dict[str, Any],
        project_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate cost summary."""
        return {
            "total_procurement_value": procurement_data.get("total_value", 0),
            "projected_savings": procurement_data.get("total_value", 0) * 0.03,  # 3% savings target
            "budget_utilization": 0.75,  # Placeholder
            "cost_per_component": 0
        }
    
    def _calculate_kpis(
        self,
        inventory_health: Dict[str, Any],
        procurement_data: Dict[str, Any],
        project_data: Dict[str, Any]
    ) -> Dict[str, float]:
        """Calculate key performance indicators."""
        return {
            "inventory_availability_rate": inventory_health.get("stock_coverage", 0) / 100,
            "procurement_efficiency": 0.85,  # Placeholder
            "build_readiness_score": project_data.get("readiness_score", 0) / 100,
            "cost_optimization_rate": 0.03,  # 3% savings
            "supplier_reliability_rate": 0.90,  # Placeholder
            "specification_accuracy": 0.95  # Placeholder
        }
    
    def _get_recent_activities(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get recent activities from log."""
        return self.activity_log[-limit:] if self.activity_log else []
    
    def _generate_alerts(
        self,
        inventory_health: Dict[str, Any],
        procurement_data: Dict[str, Any],
        project_data: Dict[str, Any],
        kpis: Dict[str, float]
    ) -> List[Dict[str, str]]:
        """Generate alerts based on current status."""
        alerts = []
        
        # Inventory alerts
        if inventory_health.get("out_of_stock", 0) > 0:
            alerts.append({
                "severity": "high",
                "category": "inventory",
                "message": f"{inventory_health['out_of_stock']} items out of stock"
            })
        
        if inventory_health.get("low_stock", 0) > 5:
            alerts.append({
                "severity": "medium",
                "category": "inventory",
                "message": f"{inventory_health['low_stock']} items low on stock"
            })
        
        # Procurement alerts
        if procurement_data.get("critical_items", 0) > 0:
            alerts.append({
                "severity": "critical",
                "category": "procurement",
                "message": f"{procurement_data['critical_items']} critical procurement items need immediate attention"
            })
        
        # Project readiness alerts
        if project_data.get("components_at_risk", 0) > 0:
            alerts.append({
                "severity": "high",
                "category": "project",
                "message": f"{project_data['components_at_risk']} components at risk affecting project timeline"
            })
        
        # KPI alerts
        if kpis.get("build_readiness_score", 1.0) < 0.7:
            alerts.append({
                "severity": "medium",
                "category": "kpi",
                "message": "Build readiness below 70% threshold"
            })
        
        return alerts
    
    def _calculate_trends(self) -> Dict[str, List[float]]:
        """Calculate trends from historical data."""
        if len(self.metrics_history) < 2:
            return {
                "readiness_trend": [],
                "inventory_trend": [],
                "cost_trend": []
            }
        
        # Get last 30 data points or all available
        recent = self.metrics_history[-30:]
        
        return {
            "readiness_trend": [
                m.project_readiness.get("readiness_score", 0)
                for m in recent
            ],
            "inventory_trend": [
                m.inventory_health.get("stock_coverage", 0)
                for m in recent
            ],
            "cost_trend": [
                m.cost_summary.get("total_procurement_value", 0)
                for m in recent
            ]
        }
    
    def _analyze_trend_direction(self, trends: Dict[str, List[float]]) -> Dict[str, str]:
        """Analyze trend directions."""
        directions = {}
        
        for key, values in trends.items():
            if len(values) < 2:
                directions[key] = "stable"
            else:
                # Compare last value to average of previous values
                last = values[-1]
                avg_previous = sum(values[:-1]) / len(values[:-1])
                
                if last > avg_previous * 1.05:
                    directions[key] = "improving"
                elif last < avg_previous * 0.95:
                    directions[key] = "declining"
                else:
                    directions[key] = "stable"
        
        return directions
