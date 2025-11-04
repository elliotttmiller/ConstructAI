"""
Named Entity Recognition for Construction Specifications.

Uses industry-standard regex patterns and entity extraction techniques
to identify critical construction-related entities from specification documents.

Standards compliance: CSI MasterFormat, ACI, ASTM, ISO patterns
"""

import re
from typing import Dict, List, Any, Tuple
import logging

logger = logging.getLogger(__name__)


class ConstructionEntity:
    """Represents an extracted construction entity."""
    
    def __init__(self, text: str, entity_type: str, confidence: float = 1.0, context: str = None):
        self.text = text
        self.entity_type = entity_type
        self.confidence = confidence
        self.context = context
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "text": self.text,
            "type": self.entity_type,
            "confidence": self.confidence,
            "context": self.context
        }


class ConstructionNER:
    """
    Named Entity Recognition for construction specifications.
    
    Implements industry-standard pattern matching for:
    - Building materials (concrete, steel, masonry, etc.)
    - Industry standards (ASTM, ACI, ISO, IBC, etc.)
    - Cost/budget information
    - Performance specifications
    - Construction methods
    """
    
    def __init__(self):
        """Initialize with industry-standard patterns."""
        
        # Industry Standard Patterns (ASTM, ACI, ISO, etc.)
        # Following official naming conventions for each organization
        self.standard_patterns = [
            # ASTM International standards (e.g., ASTM C150, ASTM D-1557)
            (r'\bASTM\s+[A-Z]\s*-?\s*\d+[A-Z\d\-]*\b', 'ASTM'),
            # American Concrete Institute (e.g., ACI 318, ACI 301-10)
            (r'\bACI\s+\d+[\.\-]?\d*[A-Z\d\-]*\b', 'ACI'),
            # ANSI standards (e.g., ANSI A58.1)
            (r'\bANSI\s+[A-Z]?\d+[\.\-]\d+[A-Z\d\-]*\b', 'ANSI'),
            # ISO standards (e.g., ISO 9001, ISO-14001)
            (r'\bISO\s*-?\s*\d+[\.\-:]?\d*[A-Z\d\-]*\b', 'ISO'),
            # American Institute of Steel Construction (e.g., AISC 360)
            (r'\bAISC\s+\d+[\.\-]?\d*[A-Z\d\-]*\b', 'AISC'),
            # International Building Code (e.g., IBC 2018)
            (r'\bIBC\s+\d{4}\b', 'IBC'),
            # National Electrical Code (e.g., NEC 2020)
            (r'\bNEC\s+\d{4}\b', 'NEC'),
            # National Fire Protection Association (e.g., NFPA 70)
            (r'\bNFPA\s+\d+[A-Z\d\-]*\b', 'NFPA'),
            # Underwriters Laboratories (e.g., UL 94)
            (r'\bUL\s+\d+[A-Z\d\-]*\b', 'UL'),
            # Factory Mutual (e.g., FM 4880)
            (r'\bFM\s+\d+[A-Z\d\-]*\b', 'FM'),
            # American Society of Civil Engineers (e.g., ASCE 7-16)
            (r'\bASCE\s+\d+[\.\-]\d*[A-Z\d\-]*\b', 'ASCE'),
            # Construction Specifications Institute (e.g., CSI MasterFormat)
            (r'\bCSI\s+\w+\b', 'CSI'),
        ]
        
        # Material Patterns - Comprehensive construction materials
        self.material_patterns = [
            # Concrete types
            (r'\b(?:reinforced\s+)?concrete(?:\s+(?:mix|slab|foundation|wall|column|beam))?\b', 'concrete'),
            (r'\b(?:ready[- ]mix|pre-?cast|cast[- ]in[- ]place)\s+concrete\b', 'concrete'),
            (r'\bcement(?:itious)?\b', 'concrete'),
            # Steel types
            (r'\b(?:structural|reinforcing|stainless|galvanized)?\s*steel(?:\s+(?:beam|column|plate|rebar|reinforcement))?\b', 'steel'),
            (r'\brebar(?:s)?\b', 'steel'),
            (r'\b(?:W|S|HP|WT)\d+[xX]\d+\b', 'steel'),  # Steel beam designations
            # Masonry
            (r'\b(?:concrete|clay|brick)\s+(?:masonry|block|unit)s?\b', 'masonry'),
            (r'\b(?:CMU|cmu)(?:\s+block)?s?\b', 'masonry'),
            (r'\bbrick(?:work)?\b', 'masonry'),
            # Wood/Lumber
            (r'\b(?:dimensional\s+)?lumber\b', 'lumber'),
            (r'\bplywood\b', 'lumber'),
            (r'\b(?:pressure[- ]treated|PT)\s+(?:wood|lumber)\b', 'lumber'),
            (r'\b\d+x\d+\s+(?:lumber|timber)\b', 'lumber'),
            # Insulation
            (r'\b(?:fiberglass|mineral\s+wool|spray\s+foam|rigid)\s+insulation\b', 'insulation'),
            (r'\bR-?\d+(?:\.\d+)?\s+insulation\b', 'insulation'),
            # Roofing
            (r'\b(?:asphalt|metal|TPO|EPDM|PVC)\s+roofing\b', 'roofing'),
            (r'\broof(?:ing)?\s+membrane\b', 'roofing'),
            # Drywall/Gypsum
            (r'\b(?:gypsum|drywall)\s+(?:board|panel)s?\b', 'drywall'),
            # Glass
            (r'\b(?:tempered|laminated|insulated)\s+glass\b', 'glass'),
            # Mechanical/HVAC Equipment (ASHRAE standards)
            (r'\bHVAC\s+(?:equipment|system|unit)s?\b', 'mechanical'),
            (r'\b(?:air\s+hand(?:ler|ling)\s+unit|AHU)s?\b', 'mechanical'),
            (r'\b(?:rooftop\s+unit|RTU)s?\b', 'mechanical'),
            (r'\b(?:fan[- ]coil\s+unit|FCU)s?\b', 'mechanical'),
            (r'\b(?:VAV|vav)\s+(?:box|terminal)s?\b', 'mechanical'),
            (r'\b(?:heat\s+pump|chiller|boiler|cooling\s+tower)s?\b', 'mechanical'),
            (r'\b(?:exhaust|supply|return)\s+(?:fan|blower)s?\b', 'mechanical'),
            (r'\b(?:water[- ]cooled|air[- ]cooled)\s+chiller\b', 'mechanical'),
            # HVAC Capacity/Performance
            (r'\b\d+[\,\.]?\d*\s*(?:ton|TR|CFM|GPM)\b', 'hvac_capacity'),
            (r'\b(?:SEER|EER|COP|HSPF|AFUE)[\s\-]?\d+(?:\.\d+)?%?\b', 'hvac_efficiency'),
            # Ductwork
            (r'\b(?:rectangular|round|oval)\s+duct(?:work)?\b', 'mechanical'),
            (r'\b(?:galvanized|stainless)\s+steel\s+duct\b', 'mechanical'),
            # Electrical
            (r'\b(?:electrical|power)\s+(?:panel|conduit|wire|cable)s?\b', 'electrical'),
            (r'\b\d+[\s\-]?(?:amp|A)\s+(?:panel|breaker|service)\b', 'electrical'),
            # Plumbing Fixtures (IPC standards)
            (r'\b(?:water\s+closet|WC|lavatory|lav|urinal)s?\b', 'plumbing_fixture'),
            (r'\b(?:shower|bathtub|tub)\s+(?:stall|enclosure)?\b', 'plumbing_fixture'),
            (r'\bdrinking\s+fountain\b', 'plumbing_fixture'),
            (r'\bwater\s+heater\b', 'plumbing_fixture'),
            # Plumbing Piping (IPC Chapter 6)
            (r'\b(?:PVC|CPVC|PEX|copper|cast\s+iron|galvanized)\s+(?:pipe|piping)\b', 'plumbing'),
            (r'\bSchedule\s+(?:40|80)\s+PVC\b', 'plumbing'),
            (r'\bType\s+[KLM]\s+copper\b', 'plumbing'),
            # Plumbing Specs
            (r'\b\d+\s*(?:GPM|gpm)\s+(?:flow|supply)\b', 'plumbing_flow'),
            (r'\b\d+\s*(?:PSI|psi)\s+(?:pressure|supply)\b', 'plumbing_pressure'),
            # Coatings/Paint
            (r'\b(?:epoxy|latex|oil[- ]based)\s+(?:paint|coating)\b', 'coating'),
            # Sealants
            (r'\b(?:silicone|polyurethane)\s+sealant\b', 'sealant'),
        ]
        
        # Cost/Budget Patterns - Industry-standard financial references
        self.cost_patterns = [
            # Dollar amounts with various formats
            (r'\$\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?\b', 'cost'),
            (r'\b\d{1,3}(?:,\d{3})*(?:\.\d{2})?\s+dollars?\b', 'cost'),
            # Budget keywords
            (r'\bbudget(?:\s+of)?\s+\$?\s*\d+[\d,\.]*\b', 'budget'),
            (r'\b(?:total|estimated|approximate)\s+cost\s+\$?\s*\d+[\d,\.]*\b', 'cost'),
            (r'\b(?:unit\s+price|lump\s+sum)\b', 'pricing_method'),
            # Financial terms
            (r'\b(?:allowance|contingency)\s+\$?\s*\d+[\d,\.]*\b', 'budget_item'),
        ]
        
        # Performance Specification Patterns
        self.performance_patterns = [
            # Strength specifications
            (r'\b\d+[\,\.]?\d*\s*(?:psi|PSI|ksi|KSI|MPa)\b', 'strength'),
            # Load specifications
            (r'\b\d+[\,\.]?\d*\s*(?:psf|PSF|plf|PLF|kip|lb)\b', 'load'),
            # Temperature specifications
            (r'\b\d+[\,\.]?\d*\s*(?:degrees?\s+)?(?:F|C|Fahrenheit|Celsius)\b', 'temperature'),
            # R-value for insulation
            (r'\bR-?\d+(?:\.\d+)?\b', 'thermal_resistance'),
            # Dimensions
            (r'\b\d+[\'\"]?\s*(?:x|by)\s*\d+[\'\"]?(?:\s*(?:x|by)\s*\d+[\'\"]?)?\b', 'dimension'),
        ]
        
        # Construction Method Patterns
        self.method_patterns = [
            (r'\b(?:cast[- ]in[- ]place|pre-?cast|tilt[- ]up)\b', 'construction_method'),
            (r'\b(?:welded|bolted|nailed|glued)\s+connection\b', 'connection_method'),
            (r'\b(?:spray|trowel|brush)\s+appli(?:ed|cation)\b', 'application_method'),
        ]
        
        logger.info("ConstructionNER initialized with comprehensive industry-standard patterns")
    
    def extract_entities(self, text: str) -> Dict[str, List[ConstructionEntity]]:
        """
        Extract construction entities from text using industry-standard patterns.
        
        Args:
            text: Input text to analyze
            
        Returns:
            Dictionary mapping entity types to lists of ConstructionEntity objects
        """
        entities = {
            "materials": [],
            "standards": [],
            "costs": [],
            "performance": [],
            "methods": []
        }
        
        # Extract standards with organization type
        for pattern, org_type in self.standard_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = ConstructionEntity(
                    text=match.group(0).strip(),
                    entity_type="standard",
                    confidence=0.95,
                    context=org_type
                )
                # Avoid duplicates
                if not any(e.text.upper() == entity.text.upper() for e in entities["standards"]):
                    entities["standards"].append(entity)
        
        # Extract materials with material type
        for pattern, material_type in self.material_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = ConstructionEntity(
                    text=match.group(0).strip(),
                    entity_type="material",
                    confidence=0.90,
                    context=material_type
                )
                # Avoid duplicates
                if not any(e.text.lower() == entity.text.lower() for e in entities["materials"]):
                    entities["materials"].append(entity)
        
        # Extract cost/budget information
        for pattern, cost_type in self.cost_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = ConstructionEntity(
                    text=match.group(0).strip(),
                    entity_type="cost",
                    confidence=0.98,
                    context=cost_type
                )
                entities["costs"].append(entity)
        
        # Extract performance specifications
        for pattern, perf_type in self.performance_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = ConstructionEntity(
                    text=match.group(0).strip(),
                    entity_type="performance",
                    confidence=0.92,
                    context=perf_type
                )
                entities["performance"].append(entity)
        
        # Extract construction methods
        for pattern, method_type in self.method_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                entity = ConstructionEntity(
                    text=match.group(0).strip(),
                    entity_type="method",
                    confidence=0.88,
                    context=method_type
                )
                entities["methods"].append(entity)
        
        return entities
    
    def get_entity_summary(self, entities: Dict[str, List[ConstructionEntity]]) -> Dict[str, Any]:
        """
        Generate a summary of extracted entities.
        
        Args:
            entities: Dictionary of entity lists
            
        Returns:
            Summary statistics
        """
        return {
            "total_entities": sum(len(v) for v in entities.values()),
            "standards_count": len(entities.get("standards", [])),
            "materials_count": len(entities.get("materials", [])),
            "costs_count": len(entities.get("costs", [])),
            "performance_specs_count": len(entities.get("performance", [])),
            "methods_count": len(entities.get("methods", [])),
        }
