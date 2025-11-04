"""
Division 23: HVAC (Heating, Ventilating, and Air Conditioning) Intelligence.

Comprehensive HVAC system understanding including equipment, ductwork,
piping, controls, and performance specifications.
"""

from typing import Dict, List, Any
import re


# HVAC Equipment Types and Specifications
HVAC_EQUIPMENT = {
    "air_handling_units": {
        "keywords": ["ahu", "air handling unit", "air handler", "makeup air unit", "mau"],
        "specifications": ["cfm", "airflow", "static pressure", "filter efficiency", "heat recovery"],
        "standards": ["ASHRAE 90.1", "AMCA 210", "AHRI 430"]
    },
    "chillers": {
        "keywords": ["chiller", "water-cooled chiller", "air-cooled chiller", "centrifugal chiller"],
        "specifications": ["tons", "tonnage", "cop", "eer", "kw/ton", "refrigerant"],
        "standards": ["ASHRAE 90.1", "AHRI 550/590", "ASME Section VIII"]
    },
    "boilers": {
        "keywords": ["boiler", "hot water boiler", "steam boiler", "condensing boiler"],
        "specifications": ["btu", "mbh", "efficiency", "afue", "thermal efficiency"],
        "standards": ["ASME Section IV", "ASHRAE 90.1", "UL 795"]
    },
    "cooling_towers": {
        "keywords": ["cooling tower", "evaporative cooler", "fluid cooler"],
        "specifications": ["tons", "gpm", "approach", "range", "wet bulb"],
        "standards": ["CTI", "ASHRAE 90.1"]
    },
    "pumps": {
        "keywords": ["pump", "circulator", "centrifugal pump", "end suction pump"],
        "specifications": ["gpm", "head", "hp", "efficiency", "npsh"],
        "standards": ["HI Standards", "ASME B73.1"]
    },
    "vav_boxes": {
        "keywords": ["vav", "variable air volume", "terminal unit", "vav box"],
        "specifications": ["cfm", "minimum cfm", "damper type", "reheat coil"],
        "standards": ["ASHRAE 90.1", "AMCA"]
    },
    "diffusers_grilles": {
        "keywords": ["diffuser", "grille", "register", "supply diffuser", "return grille"],
        "specifications": ["neck size", "throw", "nc", "pressure drop"],
        "standards": ["ASHRAE Fundamentals", "SMACNA"]
    },
    "ductwork": {
        "keywords": ["duct", "ductwork", "spiral duct", "rectangular duct", "flexible duct"],
        "specifications": ["gauge", "insulation", "pressure class", "reinforcement"],
        "standards": ["SMACNA", "ASHRAE 90.1", "IMC"]
    },
    "fans": {
        "keywords": ["fan", "exhaust fan", "supply fan", "return fan", "inline fan"],
        "specifications": ["cfm", "static pressure", "bhp", "rpm"],
        "standards": ["AMCA 210", "ASHRAE 90.1"]
    },
    "heat_exchangers": {
        "keywords": ["heat exchanger", "plate heat exchanger", "shell and tube"],
        "specifications": ["btu/hr", "approach", "effectiveness", "pressure drop"],
        "standards": ["ASME Section VIII", "AHRI"]
    },
    "controls": {
        "keywords": ["control", "thermostat", "sensor", "actuator", "controller", "bms", "ddc"],
        "specifications": ["accuracy", "range", "output", "protocol"],
        "standards": ["ASHRAE 135", "BACnet", "LONworks"]
    }
}


# HVAC Extraction Patterns
HVAC_PATTERNS = {
    "equipment_capacity": [
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:ton|tons|tr)',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:cfm|cubic feet per minute)',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:mbh|btu/hr|btuh)',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:gpm|gallons per minute)',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:hp|horsepower)'
    ],
    "efficiency_ratings": [
        r'(?:eer|energy efficiency ratio)[\s:=]*(\d+(?:\.\d+)?)',
        r'(?:cop|coefficient of performance)[\s:=]*(\d+(?:\.\d+)?)',
        r'(?:seer|seasonal energy efficiency ratio)[\s:=]*(\d+(?:\.\d+)?)',
        r'(?:afue|annual fuel utilization efficiency)[\s:=]*(\d+(?:\.\d+)?)\s*%?',
        r'thermal efficiency[\s:=]*(\d+(?:\.\d+)?)\s*%'
    ],
    "pressure_specs": [
        r'(\d+(?:\.\d+)?)\s*(?:in\.?\s*w\.?g\.?|inches water gauge|iwg)',
        r'(\d+(?:\.\d+)?)\s*(?:psig|psi)',
        r'static pressure[\s:=]*(\d+(?:\.\d+)?)'
    ],
    "temperature_specs": [
        r'(\d+(?:\.\d+)?)\s*°?[fF](?:ahrenheit)?',
        r'(\d+(?:\.\d+)?)\s*°?[cC](?:elsius)?',
        r'(?:supply|return|entering|leaving)\s+(?:air|water)\s+temp(?:erature)?[\s:=]*(\d+(?:\.\d+)?)'
    ],
    "duct_sizing": [
        r'(\d+)\s*(?:x|by)\s*(\d+)\s*(?:inch|in\.?)',
        r'(\d+)\s*(?:inch|in\.?)\s*diameter',
        r'gauge[\s:=]*(\d+)\s*ga'
    ]
}


# AI Prompts for HVAC Analysis
HVAC_AI_PROMPTS = {
    "equipment_extraction": """
    Extract HVAC equipment specifications from the following text.
    For each piece of equipment, identify:
    1. Equipment type (chiller, boiler, AHU, etc.)
    2. Manufacturer and model number
    3. Capacity specifications (tons, CFM, BTU, etc.)
    4. Efficiency ratings (EER, COP, SEER, AFUE)
    5. Electrical requirements (voltage, phase, amperage)
    6. Physical dimensions and weight
    7. Applicable standards and certifications
    
    Text: {text}
    
    Return structured data in JSON format.
    """,
    "system_analysis": """
    Analyze the HVAC system design from the following specification.
    Identify:
    1. System type (VAV, CAV, VRF, chilled water, etc.)
    2. Heating and cooling sources
    3. Distribution system (ductwork, piping)
    4. Control strategy
    5. Energy recovery systems
    6. Ventilation requirements
    7. Code compliance (ASHRAE 90.1, IMC, etc.)
    
    Text: {text}
    
    Provide a comprehensive system analysis.
    """,
    "sequence_of_operations": """
    Extract the sequence of operations for the HVAC control system.
    Identify:
    1. Operating modes (cooling, heating, economizer, etc.)
    2. Setpoints and control ranges
    3. Interlocks and safety controls
    4. Start/stop sequences
    5. Alarm conditions
    
    Text: {text}
    """
}


def extract_hvac_specifications(text: str) -> Dict[str, Any]:
    """
    Extract HVAC specifications from text.
    
    Args:
        text: Specification text
        
    Returns:
        Dictionary of extracted specifications
    """
    results = {
        "equipment": [],
        "capacities": [],
        "efficiency_ratings": [],
        "pressure_specs": [],
        "temperature_specs": [],
        "duct_sizing": [],
        "standards": []
    }
    
    # Extract equipment mentions
    for equipment_type, info in HVAC_EQUIPMENT.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["equipment"].append({
                    "type": equipment_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract capacity specifications
    for pattern in HVAC_PATTERNS["equipment_capacity"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["capacities"].extend(matches)
    
    # Extract efficiency ratings
    for pattern in HVAC_PATTERNS["efficiency_ratings"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["efficiency_ratings"].extend(matches)
    
    # Extract pressure specifications
    for pattern in HVAC_PATTERNS["pressure_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["pressure_specs"].extend(matches)
    
    # Extract temperature specifications
    for pattern in HVAC_PATTERNS["temperature_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["temperature_specs"].extend(matches)
    
    # Extract duct sizing
    for pattern in HVAC_PATTERNS["duct_sizing"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["duct_sizing"].extend(matches)
    
    # Extract standards
    for standard in ["ASHRAE 90.1", "ASHRAE 62.1", "IMC", "AMCA", "AHRI", "SMACNA"]:
        if standard in text:
            results["standards"].append(standard)
    
    return results


def get_hvac_component_schema() -> Dict[str, Any]:
    """Get the schema for HVAC component data."""
    return {
        "type": "object",
        "properties": {
            "equipment_type": {"type": "string"},
            "manufacturer": {"type": "string"},
            "model_number": {"type": "string"},
            "capacity": {
                "type": "object",
                "properties": {
                    "value": {"type": "number"},
                    "unit": {"type": "string"}
                }
            },
            "efficiency": {
                "type": "object",
                "properties": {
                    "rating_type": {"type": "string"},
                    "value": {"type": "number"}
                }
            },
            "electrical": {
                "type": "object",
                "properties": {
                    "voltage": {"type": "number"},
                    "phase": {"type": "integer"},
                    "amperage": {"type": "number"}
                }
            },
            "dimensions": {
                "type": "object",
                "properties": {
                    "length": {"type": "number"},
                    "width": {"type": "number"},
                    "height": {"type": "number"},
                    "weight": {"type": "number"}
                }
            },
            "standards": {"type": "array", "items": {"type": "string"}},
            "specifications": {"type": "object"}
        }
    }
