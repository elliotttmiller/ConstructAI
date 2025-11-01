"""
Named Entity Recognition for Construction Specifications.

Extracts key entities: Materials, Standards, Performance Criteria, Methods.
"""

import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class ConstructionEntity:
    """Represents an extracted construction entity."""
    
    def __init__(self, text: str, entity_type: str, confidence: float = 1.0):
        self.text = text
        self.entity_type = entity_type
        self.confidence = confidence
        self.context = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "text": self.text,
            "type": self.entity_type,
            "confidence": self.confidence,
            "context": self.context
        }


class ConstructionNER:
    """Named Entity Recognition for construction specifications."""
    
    def __init__(self):
        self.standard_patterns = [
            r'\b(ASTM|ACI|ANSI|ISO|AISC|ASCE|IBC|NEC|UL|FM|NFPA|CSI)\s+[A-Z]?-?\d+[A-Z\d\-]*\b',
        ]
        self.materials = ["concrete", "steel", "aluminum", "brick", "drywall"]
        logger.info("ConstructionNER initialized")
    
    def extract_entities(self, text: str) -> Dict[str, List[ConstructionEntity]]:
        """Extract construction entities from text."""
        entities = {"materials": [], "standards": [], "performance": [], "methods": []}
        
        # Extract standards
        for pattern in self.standard_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = ConstructionEntity(text=match.group(0), entity_type="standard", confidence=0.95)
                entities["standards"].append(entity)
        
        return entities
