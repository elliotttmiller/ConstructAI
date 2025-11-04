"""
Comprehensive Inventory Intelligence System for Single-User Enterprise.

Provides deep inventory system integration, expert matching, and availability analysis
optimized for maximum precision for a single expert user.
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)


@dataclass
class InventoryItem:
    """Represents an inventory item with complete metadata."""
    item_id: str
    name: str
    manufacturer: str
    model_number: str
    category: str
    specifications: Dict[str, Any]
    quantity_available: int
    location: str
    unit_cost: float
    lead_time_days: int
    supplier: str
    last_updated: datetime
    compliance_standards: List[str] = field(default_factory=list)
    alternatives: List[str] = field(default_factory=list)
    
    def matches_specification(self, spec: Dict[str, Any], tolerance: float = 0.1) -> Tuple[bool, float]:
        """
        Check if this item matches a specification with tolerance.
        
        Args:
            spec: Specification dictionary with requirements
            tolerance: Acceptable deviation (default 10%)
            
        Returns:
            Tuple of (matches, confidence_score)
        """
        confidence = 1.0
        matches = True
        
        # Check critical specifications
        for key, value in spec.items():
            if key not in self.specifications:
                confidence *= 0.5
                continue
                
            item_value = self.specifications[key]
            
            # Numeric comparison with tolerance
            if isinstance(value, (int, float)) and isinstance(item_value, (int, float)):
                deviation = abs(item_value - value) / value if value != 0 else 0
                if deviation > tolerance:
                    matches = False
                    confidence *= 0.3
                else:
                    confidence *= (1.0 - deviation)
            # String comparison (case-insensitive)
            elif isinstance(value, str) and isinstance(item_value, str):
                if value.lower() != item_value.lower():
                    # Fuzzy match
                    similarity = self._fuzzy_string_match(value.lower(), item_value.lower())
                    if similarity < 0.8:
                        matches = False
                        confidence *= 0.4
                    else:
                        confidence *= similarity
        
        return matches, max(0.0, min(1.0, confidence))
    
    def _fuzzy_string_match(self, s1: str, s2: str) -> float:
        """Calculate fuzzy string similarity."""
        if s1 == s2:
            return 1.0
        if s1 in s2 or s2 in s1:
            return 0.9
        # Simple Levenshtein-inspired metric
        common = len(set(s1.split()) & set(s2.split()))
        total = len(set(s1.split()) | set(s2.split()))
        return common / total if total > 0 else 0.0


@dataclass
class AvailabilityAnalysis:
    """Complete availability analysis for a component."""
    component_name: str
    required_quantity: int
    available_quantity: int
    is_available: bool
    availability_locations: List[str]
    estimated_delivery: datetime
    procurement_urgency: str  # "immediate", "normal", "advance_planning"
    alternative_items: List[InventoryItem]
    cost_analysis: Dict[str, float]
    risk_assessment: Dict[str, str]


class InventoryIntelligence:
    """
    Comprehensive Inventory Intelligence for single-user enterprise system.
    
    Provides:
    - Deep inventory system integration
    - Expert fuzzy matching for components
    - Availability analysis across locations
    - Procurement urgency classification
    - Alternative component identification
    - Cost optimization recommendations
    """
    
    def __init__(self):
        """Initialize inventory intelligence system."""
        self.inventory_cache: Dict[str, InventoryItem] = {}
        self.last_sync: Optional[datetime] = None
        self.integration_connectors: List[Any] = []
        
    def sync_inventory(self, source: str = "primary") -> int:
        """
        Sync inventory data from integrated systems.
        
        Args:
            source: Source system identifier
            
        Returns:
            Number of items synced
        """
        logger.info(f"Syncing inventory from source: {source}")
        
        # In real implementation, this would connect to actual inventory systems
        # For now, create sample inventory for demonstration
        sample_items = self._create_sample_inventory()
        
        for item in sample_items:
            self.inventory_cache[item.item_id] = item
        
        self.last_sync = datetime.now()
        logger.info(f"Synced {len(sample_items)} inventory items")
        
        return len(sample_items)
    
    def find_matching_components(
        self,
        specification: Dict[str, Any],
        tolerance: float = 0.1,
        min_confidence: float = 0.7
    ) -> List[Tuple[InventoryItem, float]]:
        """
        Find inventory items matching specification with fuzzy matching.
        
        Args:
            specification: Component specification requirements
            tolerance: Acceptable deviation for numeric values
            min_confidence: Minimum confidence score for matches
            
        Returns:
            List of (InventoryItem, confidence_score) tuples, sorted by confidence
        """
        matches = []
        
        for item in self.inventory_cache.values():
            is_match, confidence = item.matches_specification(specification, tolerance)
            
            if confidence >= min_confidence:
                matches.append((item, confidence))
        
        # Sort by confidence (highest first)
        matches.sort(key=lambda x: x[1], reverse=True)
        
        logger.info(f"Found {len(matches)} matching components for specification")
        return matches
    
    def analyze_availability(
        self,
        component_name: str,
        required_quantity: int,
        specifications: Dict[str, Any],
        required_date: Optional[datetime] = None
    ) -> AvailabilityAnalysis:
        """
        Perform comprehensive availability analysis for a component.
        
        Args:
            component_name: Name of the component
            required_quantity: Quantity needed
            specifications: Technical specifications
            required_date: Date when component is needed
            
        Returns:
            Complete availability analysis
        """
        if required_date is None:
            required_date = datetime.now() + timedelta(days=30)
        
        # Find matching components
        matches = self.find_matching_components(specifications)
        
        # Calculate total available quantity
        total_available = sum(item.quantity_available for item, _ in matches)
        is_available = total_available >= required_quantity
        
        # Determine locations
        locations = list(set(item.location for item, _ in matches if item.quantity_available > 0))
        
        # Estimate delivery date
        if matches:
            min_lead_time = min(item.lead_time_days for item, _ in matches)
            estimated_delivery = datetime.now() + timedelta(days=min_lead_time)
        else:
            min_lead_time = 60  # Default lead time when no matches
            estimated_delivery = datetime.now() + timedelta(days=min_lead_time)
        
        # Determine urgency
        days_until_needed = (required_date - datetime.now()).days
        if days_until_needed < 7:
            urgency = "immediate"
        elif days_until_needed < 30:
            urgency = "normal"
        else:
            urgency = "advance_planning"
        
        # Find alternatives
        alternatives = [item for item, conf in matches if conf >= 0.6][:5]
        
        # Cost analysis
        if matches:
            costs = [item.unit_cost * required_quantity for item, _ in matches]
            cost_analysis = {
                "min_cost": min(costs),
                "max_cost": max(costs),
                "avg_cost": sum(costs) / len(costs),
                "optimal_cost": min(costs)  # Cheapest option
            }
        else:
            cost_analysis = {
                "min_cost": 0,
                "max_cost": 0,
                "avg_cost": 0,
                "optimal_cost": 0
            }
        
        # Risk assessment
        risk_assessment = {
            "availability_risk": "low" if is_available else "high",
            "lead_time_risk": "low" if min_lead_time < days_until_needed else "high",
            "supplier_risk": "low",  # Would be calculated from supplier performance data
            "cost_risk": "low" if len(matches) > 2 else "medium"
        }
        
        return AvailabilityAnalysis(
            component_name=component_name,
            required_quantity=required_quantity,
            available_quantity=total_available,
            is_available=is_available,
            availability_locations=locations,
            estimated_delivery=estimated_delivery,
            procurement_urgency=urgency,
            alternative_items=alternatives,
            cost_analysis=cost_analysis,
            risk_assessment=risk_assessment
        )
    
    def get_inventory_health(self) -> Dict[str, Any]:
        """
        Get overall inventory system health metrics.
        
        Returns:
            Health metrics dictionary
        """
        total_items = len(self.inventory_cache)
        in_stock = sum(1 for item in self.inventory_cache.values() if item.quantity_available > 0)
        low_stock = sum(1 for item in self.inventory_cache.values() if 0 < item.quantity_available < 10)
        out_of_stock = total_items - in_stock
        
        return {
            "status": "healthy" if self.last_sync else "not_synced",
            "last_sync": self.last_sync.isoformat() if self.last_sync else None,
            "total_items": total_items,
            "in_stock": in_stock,
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "stock_coverage": (in_stock / total_items * 100) if total_items > 0 else 0
        }
    
    def _create_sample_inventory(self) -> List[InventoryItem]:
        """Create sample inventory for demonstration."""
        now = datetime.now()
        
        return [
            InventoryItem(
                item_id="INV-001",
                name="Structural Steel Beam",
                manufacturer="US Steel",
                model_number="W12x45",
                category="structural_steel",
                specifications={
                    "length_ft": 20,
                    "weight_lb_ft": 45,
                    "grade": "A992",
                    "depth_in": 12.06,
                    "flange_width_in": 8.05
                },
                quantity_available=150,
                location="Warehouse A",
                unit_cost=850.00,
                lead_time_days=14,
                supplier="Steel Suppliers Inc",
                last_updated=now,
                compliance_standards=["ASTM A992", "AISC"]
            ),
            InventoryItem(
                item_id="INV-002",
                name="Concrete Mix",
                manufacturer="ReadyMix Corp",
                model_number="5000PSI-STD",
                category="concrete",
                specifications={
                    "psi": 5000,
                    "slump_in": 4,
                    "aggregate_size_in": 0.75,
                    "air_content_pct": 6.0
                },
                quantity_available=5000,
                location="Plant B",
                unit_cost=125.00,
                lead_time_days=3,
                supplier="ReadyMix Corp",
                last_updated=now,
                compliance_standards=["ACI 318", "ASTM C94"]
            ),
            InventoryItem(
                item_id="INV-003",
                name="Type X Drywall",
                manufacturer="Gypsum Board Co",
                model_number="5/8-TYPEX-4x8",
                category="drywall",
                specifications={
                    "thickness_in": 0.625,
                    "fire_rating_hr": 1,
                    "size_ft": "4x8",
                    "type": "X"
                },
                quantity_available=800,
                location="Warehouse C",
                unit_cost=18.50,
                lead_time_days=5,
                supplier="Building Materials Ltd",
                last_updated=now,
                compliance_standards=["ASTM C1396", "UL Fire Rated"]
            ),
            InventoryItem(
                item_id="INV-004",
                name="HVAC Air Handler",
                manufacturer="HVAC Systems Inc",
                model_number="AH-500-CFM",
                category="hvac",
                specifications={
                    "cfm": 5000,
                    "voltage": 230,
                    "phase": 3,
                    "efficiency": "MERV 13"
                },
                quantity_available=12,
                location="Equipment Yard",
                unit_cost=4500.00,
                lead_time_days=21,
                supplier="HVAC Systems Inc",
                last_updated=now,
                compliance_standards=["ASHRAE 90.1", "UL Listed"]
            ),
            InventoryItem(
                item_id="INV-005",
                name="Electrical Panel",
                manufacturer="ElectroPanel Corp",
                model_number="EP-200A-42C",
                category="electrical",
                specifications={
                    "amperage": 200,
                    "circuits": 42,
                    "voltage": 240,
                    "type": "Main Breaker"
                },
                quantity_available=25,
                location="Warehouse A",
                unit_cost=850.00,
                lead_time_days=10,
                supplier="Electrical Supply Co",
                last_updated=now,
                compliance_standards=["NEC 2020", "UL 67"]
            )
        ]
