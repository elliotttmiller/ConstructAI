"""
Intelligence modules for single-user ConstructAI Enterprise system.

This package contains expert-grade intelligence engines for:
- Specification extraction and analysis
- Inventory management and matching
- Procurement optimization
- Component analysis and alternatives
"""

from .inventory_intelligence import InventoryIntelligence
from .procurement_intelligence import ProcurementIntelligence
from .specification_intelligence import SpecificationIntelligence
from .component_matcher import ComponentMatcher

__all__ = [
    'InventoryIntelligence',
    'ProcurementIntelligence',
    'SpecificationIntelligence',
    'ComponentMatcher',
]
