"""
MasterFormat Classification System.

Classifies construction text blocks into CSI MasterFormat divisions.
"""

import re
from typing import Dict, List, Optional, Tuple, Any
import logging

logger = logging.getLogger(__name__)


class MasterFormatClassifier:
    """
    Classifies text into CSI MasterFormat divisions.
    
    MasterFormat is the standard for organizing specifications and other
    written information for commercial and institutional building projects.
    """
    
    # CSI MasterFormat 2016 Divisions
    MASTERFORMAT_DIVISIONS = {
        "00": "Procurement and Contracting Requirements",
        "01": "General Requirements",
        "02": "Existing Conditions",
        "03": "Concrete",
        "04": "Masonry",
        "05": "Metals",
        "06": "Wood, Plastics, and Composites",
        "07": "Thermal and Moisture Protection",
        "08": "Openings",
        "09": "Finishes",
        "10": "Specialties",
        "11": "Equipment",
        "12": "Furnishings",
        "13": "Special Construction",
        "14": "Conveying Equipment",
        "21": "Fire Suppression",
        "22": "Plumbing",
        "23": "Heating, Ventilating, and Air Conditioning (HVAC)",
        "25": "Integrated Automation",
        "26": "Electrical",
        "27": "Communications",
        "28": "Electronic Safety and Security",
        "31": "Earthwork",
        "32": "Exterior Improvements",
        "33": "Utilities",
        "34": "Transportation",
        "35": "Waterway and Marine Construction",
        "40": "Process Integration",
        "41": "Material Processing and Handling Equipment",
        "42": "Process Heating, Cooling, and Drying Equipment",
        "43": "Process Gas and Liquid Handling, Purification, and Storage Equipment",
        "44": "Pollution Control Equipment",
        "45": "Industry-Specific Manufacturing Equipment",
        "48": "Electrical Power Generation",
    }
    
    # Keywords for each division
    DIVISION_KEYWORDS = {
        "01": ["general", "requirements", "administrative", "quality", "submittal", "closeout"],
        "02": ["demolition", "site", "clearing", "existing", "removal", "hazardous"],
        "03": ["concrete", "formwork", "reinforcement", "cast-in-place", "precast", "grout"],
        "04": ["masonry", "brick", "block", "stone", "mortar"],
        "05": ["steel", "metal", "structural", "joists", "decking", "fabrications"],
        "06": ["wood", "lumber", "carpentry", "millwork", "plastic", "composite"],
        "07": ["waterproofing", "insulation", "roofing", "siding", "membrane", "flashing"],
        "08": ["doors", "windows", "glazing", "entrances", "storefronts", "hardware"],
        "09": ["finishes", "drywall", "plaster", "tile", "flooring", "painting", "ceiling"],
        "10": ["specialties", "toilet", "partitions", "signage", "lockers"],
        "11": ["equipment", "appliances", "machinery"],
        "12": ["furnishings", "furniture", "window", "treatments"],
        "13": ["special", "construction", "pools", "fountains"],
        "14": ["elevator", "escalator", "lift", "conveying"],
        "21": ["fire", "suppression", "sprinkler", "standpipe", "fire protection", "extinguisher"],
        "22": [
            # Plumbing fixtures (IPC Chapter 4)
            "plumbing", "piping", "fixtures", "water closet", "lavatory", "urinal", "toilet",
            "sink", "shower", "bathtub", "drinking fountain", "water heater",
            # Pipe materials (IPC Chapter 6)
            "PVC pipe", "CPVC", "PEX", "copper pipe", "cast iron", "galvanized pipe",
            # Plumbing systems
            "water supply", "drainage", "sanitary sewer", "storm drain", "domestic water",
            "hot water", "cold water", "waste pipe", "vent pipe", "cleanout",
            # Flow/Pressure specs
            "GPM", "PSI", "water pressure", "flow rate", "fixture units",
            # Standards
            "IPC", "UPC", "uniform plumbing code", "international plumbing code"
        ],
        "23": [
            # HVAC equipment (ASHRAE standards)
            "hvac", "heating", "ventilating", "air conditioning", "ductwork",
            "air handler", "AHU", "rooftop unit", "RTU", "fan coil", "FCU",
            "VAV", "variable air volume", "heat pump", "chiller", "boiler",
            "cooling tower", "exhaust fan", "supply fan", "return fan",
            # HVAC systems
            "mechanical system", "ventilation", "climate control", "temperature control",
            # Ductwork
            "duct", "supply duct", "return duct", "flex duct", "rigid duct",
            "galvanized duct", "rectangular duct", "round duct",
            # Capacity/Efficiency
            "tons", "CFM", "BTU", "SEER", "EER", "COP", "AFUE",
            # Standards
            "ASHRAE", "SMACNA", "IMC", "international mechanical code"
        ],
        "25": ["automation", "controls", "building management"],
        "26": ["electrical", "power", "lighting", "wiring"],
        "27": ["communications", "data", "telephone", "intercom"],
        "28": ["security", "alarm", "surveillance", "access control"],
        "31": ["earthwork", "excavation", "grading", "soil"],
        "32": ["paving", "landscaping", "planting", "irrigation"],
        "33": ["utilities", "water", "sewer", "storm"],
        "34": ["transportation", "roadway", "parking"],
    }
    
    def __init__(self):
        logger.info("MasterFormatClassifier initialized")
    
    def classify(self, text: str) -> List[Dict[str, any]]:
        """
        Classify text into MasterFormat divisions.
        
        Args:
            text: Text to classify
            
        Returns:
            List of division classifications with confidence scores
        """
        text_lower = text.lower()
        classifications = []
        
        # Check for explicit division references
        explicit_div = self._find_explicit_division(text)
        if explicit_div:
            classifications.append({
                "division": explicit_div,
                "name": self.MASTERFORMAT_DIVISIONS.get(explicit_div, "Unknown"),
                "confidence": 0.95,
                "method": "explicit"
            })
            return classifications
        
        # Keyword-based classification
        scores = {}
        for division, keywords in self.DIVISION_KEYWORDS.items():
            score = 0
            matched_keywords = []
            
            for keyword in keywords:
                if keyword in text_lower:
                    score += 1
                    matched_keywords.append(keyword)
            
            if score > 0:
                scores[division] = {
                    "score": score,
                    "keywords": matched_keywords
                }
        
        # Sort by score and create classifications
        sorted_divisions = sorted(scores.items(), key=lambda x: x[1]["score"], reverse=True)
        
        for division, data in sorted_divisions[:3]:  # Top 3 matches
            # Calculate confidence based on score
            max_possible = len(self.DIVISION_KEYWORDS.get(division, []))
            confidence = min(data["score"] / max(max_possible, 1), 1.0) * 0.8  # Max 80% for keyword matching
            
            if confidence > 0.2:  # Threshold
                classifications.append({
                    "division": division,
                    "name": self.MASTERFORMAT_DIVISIONS.get(division, "Unknown"),
                    "confidence": confidence,
                    "method": "keyword",
                    "matched_keywords": data["keywords"]
                })
        
        if not classifications:
            classifications.append({
                "division": "00",
                "name": "Unclassified",
                "confidence": 0.1,
                "method": "default"
            })
        
        return classifications
    
    def _find_explicit_division(self, text: str) -> Optional[str]:
        """Find explicit division references in text."""
        # Look for patterns like "Division 03", "DIVISION 03", "Div. 03", etc.
        patterns = [
            r'DIVISION\s+(\d{2})',
            r'DIV\.?\s+(\d{2})',
            r'SECTION\s+(\d{2})\s+\d{2}',  # e.g., "SECTION 03 30 00"
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                division = match.group(1)
                if division in self.MASTERFORMAT_DIVISIONS:
                    return division
        
        return None
    
    def classify_document_sections(self, sections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Classify multiple document sections.
        
        Args:
            sections: List of document sections
            
        Returns:
            Sections with MasterFormat classifications
        """
        classified_sections = []
        
        for section in sections:
            title = section.get("title", "")
            content = section.get("content", "")
            combined_text = f"{title} {content}"
            
            classifications = self.classify(combined_text)
            
            section_with_classification = section.copy()
            section_with_classification["masterformat_classifications"] = classifications
            section_with_classification["primary_division"] = classifications[0] if classifications else None
            
            classified_sections.append(section_with_classification)
        
        return classified_sections
    
    def get_division_summary(self, classifications: List[Dict[str, Any]]) -> Dict[str, int]:
        """
        Get summary of divisions in document.
        
        Args:
            classifications: List of classifications
            
        Returns:
            Dictionary of division counts
        """
        summary = {}
        
        for item in classifications:
            if isinstance(item, dict) and "masterformat_classifications" in item:
                for classification in item["masterformat_classifications"]:
                    division = classification["division"]
                    summary[division] = summary.get(division, 0) + 1
        
        return summary
