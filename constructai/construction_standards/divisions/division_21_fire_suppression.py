"""
Division 21: Fire Suppression Systems Intelligence.

Comprehensive fire protection system understanding including sprinklers, standpipes,
and suppression systems per NFPA standards.
"""

from typing import Dict, List, Any
import re


# Fire Suppression Equipment
FIRE_SUPPRESSION_EQUIPMENT = {
    "sprinkler_systems": {
        "keywords": ["sprinkler", "fire sprinkler", "wet pipe", "dry pipe", "pre-action", "deluge"],
        "specifications": ["coverage area", "k-factor", "temperature rating", "response type"],
        "standards": ["NFPA 13", "NFPA 25", "UL 199", "FM Approved"]
    },
    "sprinkler_heads": {
        "keywords": ["sprinkler head", "spray", "pendant", "upright", "sidewall", "esfr"],
        "specifications": ["k-factor", "temperature", "response", "finish"],
        "standards": ["NFPA 13", "UL 199", "FM 2000"]
    },
    "fire_pumps": {
        "keywords": ["fire pump", "jockey pump", "booster pump"],
        "specifications": ["gpm", "pressure", "hp", "driver type"],
        "standards": ["NFPA 20", "UL 448", "FM"]
    },
    "standpipes": {
        "keywords": ["standpipe", "hose station", "fire department connection", "fdc"],
        "specifications": ["class", "type", "pressure", "flow"],
        "standards": ["NFPA 14", "IBC", "IFC"]
    },
    "fire_extinguishers": {
        "keywords": ["fire extinguisher", "portable extinguisher", "abc", "co2", "class k"],
        "specifications": ["rating", "agent type", "capacity"],
        "standards": ["NFPA 10", "UL 299"]
    },
    "clean_agent": {
        "keywords": ["clean agent", "fm-200", "novec 1230", "inergen", "gaseous suppression"],
        "specifications": ["agent type", "concentration", "discharge time"],
        "standards": ["NFPA 2001", "ISO 14520", "UL 2127"]
    },
    "foam_systems": {
        "keywords": ["foam", "afff", "foam concentrate", "foam proportioner"],
        "specifications": ["foam type", "concentration", "application rate"],
        "standards": ["NFPA 11", "NFPA 16", "UL 162"]
    },
    "kitchen_suppression": {
        "keywords": ["kitchen suppression", "ansul", "hood suppression", "appliance protection"],
        "specifications": ["nozzles", "agent", "detection"],
        "standards": ["NFPA 17A", "NFPA 96", "UL 300"]
    }
}


# Fire Suppression Extraction Patterns
FIRE_SUPPRESSION_PATTERNS = {
    "flow_rates": [
        r'(\d+(?:,\d{3})*)\s*gpm',
        r'flow[\s:=]*(\d+(?:,\d{3})*)',
        r'(\d+(?:,\d{3})*)\s*gallons\s*per\s*minute'
    ],
    "pressure_specs": [
        r'(\d+)\s*psi',
        r'pressure[\s:=]*(\d+)',
        r'(\d+)\s*to\s*(\d+)\s*psi'
    ],
    "coverage_area": [
        r'(\d+)\s*(?:square\s*feet|sq\s*ft|sf)',
        r'coverage[\s:=]*(\d+)',
        r'spacing[\s:=]*(\d+)\s*(?:feet|ft)'
    ],
    "k_factor": [
        r'k[\s-]?factor[\s:=]*(\d+(?:\.\d+)?)',
        r'k[\s=]*(\d+(?:\.\d+)?)',
        r'(\d+(?:\.\d+)?)\s*k[\s-]?factor'
    ],
    "temperature_rating": [
        r'(\d+)\s*°?f\s*(?:rated|rating)?',
        r'temperature[\s:=]*(\d+)\s*°?f',
        r'(\d+)\s*degree'
    ]
}


# NFPA Standards
NFPA_STANDARDS = {
    "NFPA 10": "Portable Fire Extinguishers",
    "NFPA 11": "Low-, Medium-, and High-Expansion Foam",
    "NFPA 12": "Carbon Dioxide Extinguishing Systems",
    "NFPA 13": "Installation of Sprinkler Systems",
    "NFPA 13D": "Installation of Sprinkler Systems in One- and Two-Family Dwellings",
    "NFPA 13R": "Installation of Sprinkler Systems in Low-Rise Residential Occupancies",
    "NFPA 14": "Installation of Standpipe and Hose Systems",
    "NFPA 15": "Water Spray Fixed Systems for Fire Protection",
    "NFPA 16": "Installation of Foam-Water Sprinkler and Foam-Water Spray Systems",
    "NFPA 17": "Dry Chemical Extinguishing Systems",
    "NFPA 17A": "Wet Chemical Extinguishing Systems",
    "NFPA 20": "Installation of Stationary Pumps for Fire Protection",
    "NFPA 24": "Installation of Private Fire Service Mains and Their Appurtenances",
    "NFPA 25": "Inspection, Testing, and Maintenance of Water-Based Fire Protection Systems",
    "NFPA 72": "National Fire Alarm and Signaling Code",
    "NFPA 96": "Ventilation Control and Fire Protection of Commercial Cooking Operations",
    "NFPA 750": "Standard on Water Mist Fire Protection Systems",
    "NFPA 2001": "Clean Agent Fire Extinguishing Systems"
}


# AI Prompts
FIRE_SUPPRESSION_AI_PROMPTS = {
    "system_extraction": """
    Extract fire suppression system specifications per NFPA standards.
    Identify:
    1. System type (wet pipe, dry pipe, pre-action, deluge, etc.)
    2. Hazard classification (light, ordinary, extra hazard)
    3. Design density and area of application per NFPA 13
    4. Sprinkler head specifications (k-factor, temperature, response)
    5. Pipe sizing and material (Schedule 10, 40, etc.)
    6. Water supply requirements (flow and pressure)
    7. Fire pump requirements if applicable
    8. Hydraulic calculations basis
    9. Seismic bracing per NFPA 13 Chapter 9
    10. Acceptance testing per NFPA 13 Chapter 10
    
    Text: {text}
    """,
    "hydraulic_analysis": """
    Analyze fire sprinkler hydraulic design per NFPA 13.
    Identify:
    1. Design area and density
    2. Most remote area calculations
    3. Water supply available vs required
    4. Hose stream allowance
    5. Fire pump characteristics if needed
    6. Pipe friction loss calculations
    7. Elevation adjustments
    8. Margin of safety
    
    Text: {text}
    """
}


def extract_fire_suppression_specifications(text: str) -> Dict[str, Any]:
    """Extract fire suppression specifications per NFPA."""
    results = {
        "equipment": [],
        "flow_rates": [],
        "pressure_specs": [],
        "coverage_area": [],
        "k_factors": [],
        "temperature_ratings": [],
        "nfpa_standards": [],
        "standards": []
    }
    
    # Extract equipment mentions
    for equipment_type, info in FIRE_SUPPRESSION_EQUIPMENT.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["equipment"].append({
                    "type": equipment_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract flow rates
    for pattern in FIRE_SUPPRESSION_PATTERNS["flow_rates"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["flow_rates"].extend(matches)
    
    # Extract pressure specifications
    for pattern in FIRE_SUPPRESSION_PATTERNS["pressure_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["pressure_specs"].extend(matches)
    
    # Extract coverage area
    for pattern in FIRE_SUPPRESSION_PATTERNS["coverage_area"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["coverage_area"].extend(matches)
    
    # Extract k-factors
    for pattern in FIRE_SUPPRESSION_PATTERNS["k_factor"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["k_factors"].extend(matches)
    
    # Extract temperature ratings
    for pattern in FIRE_SUPPRESSION_PATTERNS["temperature_rating"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["temperature_ratings"].extend(matches)
    
    # Extract NFPA standard references
    for nfpa_code, nfpa_title in NFPA_STANDARDS.items():
        if nfpa_code in text:
            results["nfpa_standards"].append({
                "code": nfpa_code,
                "title": nfpa_title
            })
    
    # Extract other standards
    for standard in ["UL 199", "FM Approved", "ISO 14520", "UL 300", "IBC", "IFC"]:
        if standard in text:
            results["standards"].append(standard)
    
    return results


def get_fire_suppression_component_schema() -> Dict[str, Any]:
    """Get schema for fire suppression components per NFPA."""
    return {
        "type": "object",
        "properties": {
            "system_type": {"type": "string"},
            "hazard_class": {"type": "string"},
            "sprinkler_head": {
                "type": "object",
                "properties": {
                    "k_factor": {"type": "number"},
                    "temperature_rating": {"type": "number"},
                    "response_type": {"type": "string"}
                }
            },
            "hydraulic_design": {
                "type": "object",
                "properties": {
                    "design_density_gpm_sf": {"type": "number"},
                    "design_area_sf": {"type": "number"},
                    "flow_gpm": {"type": "number"},
                    "pressure_psi": {"type": "number"}
                }
            },
            "nfpa_compliance": {"type": "array", "items": {"type": "string"}},
            "specifications": {"type": "object"}
        }
    }
