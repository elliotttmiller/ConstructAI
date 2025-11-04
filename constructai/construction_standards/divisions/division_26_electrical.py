"""
Division 26: Electrical Systems Intelligence.

Comprehensive electrical system understanding including power distribution,
lighting, grounding, and control systems per NEC and industry standards.
"""

from typing import Dict, List, Any
import re


# Electrical Equipment Types and Specifications
ELECTRICAL_EQUIPMENT = {
    "switchgear": {
        "keywords": ["switchgear", "medium voltage switchgear", "mv switchgear", "metal-clad switchgear"],
        "specifications": ["voltage", "amperage", "aic rating", "bus rating", "interrupting capacity"],
        "standards": ["IEEE C37.20.2", "IEEE C37.04", "ANSI C37.20.2", "UL 1558", "NEC Article 408"]
    },
    "switchboards": {
        "keywords": ["switchboard", "main switchboard", "distribution switchboard", "service switchboard"],
        "specifications": ["amperage", "voltage", "bus rating", "main breaker", "aic"],
        "standards": ["UL 891", "NEC Article 408", "NEMA PB 2"]
    },
    "panelboards": {
        "keywords": ["panelboard", "panel board", "distribution panel", "lighting panel", "power panel"],
        "specifications": ["amperage", "voltage", "circuits", "main breaker", "phases"],
        "standards": ["UL 67", "NEC Article 408", "NEMA PB 1"]
    },
    "transformers": {
        "keywords": ["transformer", "dry-type transformer", "liquid-filled transformer", "pad-mounted transformer"],
        "specifications": ["kva", "primary voltage", "secondary voltage", "impedance", "insulation class"],
        "standards": ["IEEE C57.12.01", "UL 1561", "UL 1562", "NEC Article 450"]
    },
    "generators": {
        "keywords": ["generator", "emergency generator", "standby generator", "diesel generator"],
        "specifications": ["kw", "kva", "voltage", "fuel type", "sound level"],
        "standards": ["NFPA 110", "IEEE 446", "UL 2200", "NEC Article 700"]
    },
    "ups_systems": {
        "keywords": ["ups", "uninterruptible power supply", "battery backup"],
        "specifications": ["kva", "kw", "runtime", "topology", "efficiency"],
        "standards": ["IEEE 446", "UL 1778", "NEC Article 645"]
    },
    "motor_control_centers": {
        "keywords": ["mcc", "motor control center", "motor starter"],
        "specifications": ["hp", "voltage", "nema size", "fla", "overload"],
        "standards": ["UL 845", "NEMA ICS 2", "NEC Article 430"]
    },
    "circuit_breakers": {
        "keywords": ["circuit breaker", "breaker", "molded case", "mcb", "mccb"],
        "specifications": ["amperage", "voltage", "poles", "aic", "interrupt rating"],
        "standards": ["UL 489", "UL 1066", "NEC Article 240"]
    },
    "conductors_cables": {
        "keywords": ["wire", "cable", "conductor", "feeder", "branch circuit"],
        "specifications": ["awg", "kcmil", "insulation type", "temperature rating", "ampacity"],
        "standards": ["UL 44", "UL 83", "ICEA", "NEC Article 310"]
    },
    "conduit_raceway": {
        "keywords": ["conduit", "emt", "rigid", "imc", "pvc", "cable tray", "raceway"],
        "specifications": ["size", "material", "type"],
        "standards": ["UL 6", "UL 797", "UL 651", "NEMA VE 1", "NEC Article 300"]
    },
    "lighting_fixtures": {
        "keywords": ["light fixture", "luminaire", "led fixture", "troffer", "downlight"],
        "specifications": ["lumens", "wattage", "cct", "cri", "distribution"],
        "standards": ["UL 1598", "UL 8750", "DLC", "Energy Star", "NEC Article 410"]
    },
    "lighting_controls": {
        "keywords": ["lighting control", "dimmer", "occupancy sensor", "daylight sensor", "lighting panel"],
        "specifications": ["protocol", "zones", "scenes", "dimming type"],
        "standards": ["NEMA 410", "ANSI C82.11", "ASHRAE 90.1", "NEC Article 410"]
    },
    "grounding_bonding": {
        "keywords": ["ground", "grounding", "bonding", "ground rod", "grounding electrode"],
        "specifications": ["resistance", "size", "material"],
        "standards": ["NEC Article 250", "IEEE 142", "UL 467"]
    },
    "fire_alarm": {
        "keywords": ["fire alarm", "smoke detector", "heat detector", "pull station", "facp"],
        "specifications": ["zones", "addressable", "devices", "notification"],
        "standards": ["NFPA 72", "UL 864", "UL 268", "NEC Article 760"]
    }
}


# Electrical Extraction Patterns
ELECTRICAL_PATTERNS = {
    "voltage_ratings": [
        r'(\d+)\s*(?:volt|v|vac|vdc)\b',
        r'(\d+)/(\d+)\s*(?:volt|v)',
        r'(\d+)\s*kv\b'
    ],
    "amperage_ratings": [
        r'(\d+(?:,\d{3})*)\s*(?:amp|ampere|a|af)\b',
        r'(\d+(?:,\d{3})*)\s*a(?:mpere)?\s+(?:frame|rating)',
        r'(?:fla|full load ampere)[\s:=]*(\d+(?:\.\d+)?)'
    ],
    "power_ratings": [
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:kw|kilowatt)\b',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:kva|kilovolt-ampere)\b',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:hp|horsepower)\b',
        r'(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:watt|w)\b'
    ],
    "wire_sizing": [
        r'(\d+)\s*(?:awg|gauge)\b',
        r'(\d+)\s*(?:kcmil|mcm)\b',
        r'#(\d+)\s*(?:awg)?'
    ],
    "conduit_sizing": [
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?|")\s*(?:emt|rigid|imc|pvc)',
        r'(\d+)\s*(?:inch|in\.?)\s*conduit'
    ],
    "interrupting_capacity": [
        r'(\d+(?:,\d{3})*)\s*(?:aic|ampere interrupting capacity)',
        r'(\d+(?:,\d{3})*)\s*ka\s+(?:aic|interrupting)',
        r'short circuit rating[\s:=]*(\d+(?:,\d{3})*)'
    ],
    "lighting_specs": [
        r'(\d+(?:,\d{3})*)\s*(?:lumen|lumens|lm)\b',
        r'(\d+)\s*(?:kelvin|k)\b',
        r'cri[\s:=]*(\d+)',
        r'(\d+(?:\.\d+)?)\s*(?:watt|w)\s*per\s*(?:square\s*foot|sf)'
    ]
}


# NEC Code References
NEC_ARTICLES = {
    "90": "Introduction",
    "100": "Definitions",
    "110": "Requirements for Electrical Installations",
    "210": "Branch Circuits",
    "215": "Feeders",
    "220": "Branch-Circuit, Feeder, and Service Load Calculations",
    "225": "Outside Branch Circuits and Feeders",
    "230": "Services",
    "240": "Overcurrent Protection",
    "250": "Grounding and Bonding",
    "280": "Surge Protective Devices (SPDs)",
    "300": "Wiring Methods",
    "310": "Conductors for General Wiring",
    "312": "Cabinets, Cutout Boxes, and Meter Socket Enclosures",
    "314": "Outlet, Device, Pull, and Junction Boxes",
    "408": "Switchboards, Switchgear, and Panelboards",
    "409": "Industrial Control Panels",
    "410": "Luminaires, Lampholders, and Lamps",
    "411": "Lighting Systems Operating at 30 Volts or Less",
    "422": "Appliances",
    "424": "Fixed Electric Space-Heating Equipment",
    "430": "Motors, Motor Circuits, and Controllers",
    "440": "Air-Conditioning and Refrigerating Equipment",
    "445": "Generators",
    "450": "Transformers and Transformer Vaults",
    "480": "Storage Batteries",
    "517": "Health Care Facilities",
    "518": "Assembly Occupancies",
    "645": "Information Technology Equipment",
    "700": "Emergency Systems",
    "701": "Legally Required Standby Systems",
    "702": "Optional Standby Systems",
    "705": "Interconnected Electric Power Production Sources",
    "760": "Fire Alarm Systems",
    "770": "Optical Fiber Cables and Raceways",
    "800": "Communications Circuits"
}


# AI Prompts for Electrical Analysis
ELECTRICAL_AI_PROMPTS = {
    "equipment_extraction": """
    Extract electrical equipment specifications from the following text per NEC and industry standards.
    For each piece of equipment, identify:
    1. Equipment type (switchgear, panelboard, transformer, etc.)
    2. Manufacturer and model number
    3. Voltage rating (primary and secondary if applicable)
    4. Amperage rating and frame size
    5. Interrupting capacity (AIC rating)
    6. Number of poles/circuits
    7. Bus rating and material
    8. Enclosure type (NEMA rating)
    9. Applicable NEC articles and UL listings
    10. Short circuit coordination requirements
    
    Text: {text}
    
    Return structured data in JSON format following NEC terminology.
    """,
    "power_distribution_analysis": """
    Analyze the electrical power distribution system from the following specification.
    Identify:
    1. Service entrance configuration and voltage
    2. Main distribution equipment hierarchy
    3. Feeder and branch circuit organization
    4. Load calculations and demand factors per NEC Article 220
    5. Voltage drop calculations per NEC 210.19 and 215.2
    6. Fault current analysis and coordination
    7. Grounding and bonding per NEC Article 250
    8. Emergency and standby power systems per NEC Articles 700-702
    9. Energy code compliance (ASHRAE 90.1, IECC)
    
    Text: {text}
    
    Provide comprehensive system analysis with NEC article references.
    """,
    "lighting_system_analysis": """
    Analyze the lighting system design from the following specification.
    Identify:
    1. Fixture types, quantities, and specifications
    2. Lighting power density (LPD) per ASHRAE 90.1
    3. Control system type and zones
    4. Dimming and occupancy sensing requirements
    5. Emergency and exit lighting per NEC Articles 700/701
    6. Photometric requirements (footcandles, uniformity)
    7. Color temperature (CCT) and color rendering (CRI)
    8. Energy efficiency certifications (DLC, Energy Star)
    
    Text: {text}
    
    Return lighting design analysis with code compliance verification.
    """,
    "conductor_sizing_analysis": """
    Extract conductor and conduit sizing from the following specification.
    Identify per NEC requirements:
    1. Conductor size (AWG or kcmil)
    2. Insulation type and temperature rating
    3. Ampacity and adjustment factors per NEC 310.15
    4. Voltage drop calculations
    5. Conduit size and fill calculations per NEC Chapter 9
    6. Conduit material and type (EMT, rigid, IMC, PVC)
    7. Number of conductors and derating factors
    8. Grounding conductor sizing per NEC 250.122
    
    Text: {text}
    
    Provide conductor/conduit analysis with NEC article references.
    """
}


def extract_electrical_specifications(text: str) -> Dict[str, Any]:
    """
    Extract electrical specifications from text per NEC standards.
    
    Args:
        text: Specification text
        
    Returns:
        Dictionary of extracted specifications
    """
    results = {
        "equipment": [],
        "voltage_ratings": [],
        "amperage_ratings": [],
        "power_ratings": [],
        "wire_sizing": [],
        "conduit_sizing": [],
        "interrupting_capacity": [],
        "lighting_specs": [],
        "nec_articles": [],
        "standards": []
    }
    
    # Extract equipment mentions
    for equipment_type, info in ELECTRICAL_EQUIPMENT.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["equipment"].append({
                    "type": equipment_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract voltage ratings
    for pattern in ELECTRICAL_PATTERNS["voltage_ratings"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["voltage_ratings"].extend(matches)
    
    # Extract amperage ratings
    for pattern in ELECTRICAL_PATTERNS["amperage_ratings"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["amperage_ratings"].extend(matches)
    
    # Extract power ratings
    for pattern in ELECTRICAL_PATTERNS["power_ratings"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["power_ratings"].extend(matches)
    
    # Extract wire sizing
    for pattern in ELECTRICAL_PATTERNS["wire_sizing"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["wire_sizing"].extend(matches)
    
    # Extract conduit sizing
    for pattern in ELECTRICAL_PATTERNS["conduit_sizing"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["conduit_sizing"].extend(matches)
    
    # Extract interrupting capacity
    for pattern in ELECTRICAL_PATTERNS["interrupting_capacity"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["interrupting_capacity"].extend(matches)
    
    # Extract lighting specifications
    for pattern in ELECTRICAL_PATTERNS["lighting_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["lighting_specs"].extend(matches)
    
    # Extract NEC article references
    for article_num, article_title in NEC_ARTICLES.items():
        patterns = [
            f"NEC {article_num}",
            f"Article {article_num}",
            f"NEC Article {article_num}",
            f"{article_num}\\.\\d+"  # Sub-sections like 250.122
        ]
        for pattern in patterns:
            if re.search(pattern, text, re.IGNORECASE):
                results["nec_articles"].append({
                    "article": article_num,
                    "title": article_title
                })
                break
    
    # Extract electrical standards
    standards = [
        "NEC", "NFPA 70", "UL 67", "UL 489", "UL 891", "UL 1558",
        "IEEE C37", "IEEE 142", "IEEE 446", "NEMA", "NFPA 110",
        "ASHRAE 90.1", "IECC", "Title 24", "DLC", "Energy Star"
    ]
    for standard in standards:
        if standard in text:
            results["standards"].append(standard)
    
    return results


def get_electrical_component_schema() -> Dict[str, Any]:
    """Get the schema for electrical component data per NEC."""
    return {
        "type": "object",
        "properties": {
            "equipment_type": {"type": "string"},
            "manufacturer": {"type": "string"},
            "model_number": {"type": "string"},
            "electrical_ratings": {
                "type": "object",
                "properties": {
                    "voltage": {"type": "number"},
                    "amperage": {"type": "number"},
                    "phases": {"type": "integer"},
                    "poles": {"type": "integer"},
                    "interrupting_capacity_aic": {"type": "number"}
                }
            },
            "power_capacity": {
                "type": "object",
                "properties": {
                    "kw": {"type": "number"},
                    "kva": {"type": "number"},
                    "power_factor": {"type": "number"}
                }
            },
            "enclosure": {
                "type": "object",
                "properties": {
                    "nema_rating": {"type": "string"},
                    "material": {"type": "string"}
                }
            },
            "ul_listing": {"type": "string"},
            "nec_articles": {"type": "array", "items": {"type": "string"}},
            "standards": {"type": "array", "items": {"type": "string"}},
            "specifications": {"type": "object"}
        }
    }
