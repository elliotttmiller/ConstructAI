"""
Construction Standards modules for CSI MasterFormat intelligence.

Provides comprehensive understanding of all 50 CSI MasterFormat divisions
with division-specific extraction patterns, standards, and validation.
"""

from .masterformat import (
    MASTERFORMAT_DIVISIONS,
    get_division_info,
    get_all_divisions,
    is_mep_division,
    is_structural_division,
    is_architectural_division
)

__all__ = [
    'MASTERFORMAT_DIVISIONS',
    'get_division_info',
    'get_all_divisions',
    'is_mep_division',
    'is_structural_division',
    'is_architectural_division',
]
