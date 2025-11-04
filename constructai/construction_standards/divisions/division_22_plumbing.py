"""
Division 22: Plumbing Systems Intelligence.

Comprehensive plumbing system understanding including piping, fixtures,
equipment, and water distribution per IPC/UPC and industry standards.
"""

from typing import Dict, List, Any
import re


# Plumbing Equipment Types and Specifications
PLUMBING_EQUIPMENT = {
    "water_closets": {
        "keywords": ["water closet", "toilet", "wc", "flush valve", "flushometer"],
        "specifications": ["gpf", "flush volume", "ada", "bowl type", "mounting"],
        "standards": ["ASME A112.19.2", "ASSE 1037", "ADA", "UPC", "IPC"]
    },
    "urinals": {
        "keywords": ["urinal", "wall hung urinal", "washout urinal"],
        "specifications": ["gpf", "flush volume", "mounting", "sensor type"],
        "standards": ["ASME A112.19.2", "ASSE 1037", "UPC", "IPC"]
    },
    "lavatories": {
        "keywords": ["lavatory", "sink", "lav", "wash basin", "hand sink"],
        "specifications": ["bowl size", "mounting type", "faucet holes", "material"],
        "standards": ["ASME A112.19.2", "ADA", "UPC", "IPC"]
    },
    "faucets_fixtures": {
        "keywords": ["faucet", "spout", "mixing valve", "trim"],
        "specifications": ["gpm", "flow rate", "finish", "valve type"],
        "standards": ["ASME A112.18.1", "NSF 61", "EPA WaterSense", "UPC", "IPC"]
    },
    "water_heaters": {
        "keywords": ["water heater", "hot water heater", "storage tank", "tankless", "instantaneous"],
        "specifications": ["gallons", "btu", "recovery rate", "efficiency", "fuel type"],
        "standards": ["ASHRAE 90.1", "DOE", "UL 174", "ANSI Z21.10.1", "UPC", "IPC"]
    },
    "water_pumps": {
        "keywords": ["pump", "booster pump", "circulating pump", "sump pump"],
        "specifications": ["gpm", "head", "hp", "impeller", "seal type"],
        "standards": ["HI Standards", "UL 778", "NSF 61", "UPC", "IPC"]
    },
    "backflow_preventers": {
        "keywords": ["backflow preventer", "rpz", "double check", "vacuum breaker"],
        "specifications": ["size", "pressure rating", "test cocks"],
        "standards": ["ASSE 1013", "ASSE 1015", "USC FCCCHR", "UPC", "IPC"]
    },
    "piping_materials": {
        "keywords": ["pipe", "piping", "copper", "pex", "cpvc", "cast iron", "pvc", "abs"],
        "specifications": ["size", "schedule", "type", "joining method", "insulation"],
        "standards": ["ASTM B88", "ASTM D2846", "ASTM D2665", "ASTM A74", "UPC", "IPC"]
    },
    "domestic_water": {
        "keywords": ["domestic water", "cold water", "hot water", "potable water"],
        "specifications": ["pressure", "flow rate", "temperature", "capacity"],
        "standards": ["NSF 61", "AWWA", "UPC", "IPC"]
    },
    "sanitary_waste": {
        "keywords": ["sanitary", "waste", "drain", "vent", "dwv"],
        "specifications": ["slope", "size", "material", "cleanout"],
        "standards": ["ASTM D2665", "ASTM D3034", "UPC", "IPC"]
    },
    "storm_drainage": {
        "keywords": ["storm drain", "roof drain", "area drain", "floor drain"],
        "specifications": ["size", "flow rate", "trap", "strainer"],
        "standards": ["ASME A112.6.4", "UPC", "IPC"]
    },
    "water_softeners": {
        "keywords": ["water softener", "water treatment", "filtration"],
        "specifications": ["capacity", "grain capacity", "regeneration", "flow rate"],
        "standards": ["NSF 44", "NSF 61", "WQA"]
    },
    "gas_piping": {
        "keywords": ["gas pipe", "gas piping", "natural gas", "propane", "csst"],
        "specifications": ["size", "pressure", "material", "capacity"],
        "standards": ["ANSI Z223.1", "NFPA 54", "IFGC", "UPC", "IPC"]
    },
    "medical_gas": {
        "keywords": ["medical gas", "oxygen", "medical air", "vacuum", "waste anesthetic"],
        "specifications": ["pressure", "purity", "alarm", "zone valve"],
        "standards": ["NFPA 99", "CGA", "HTM 02-01"]
    }
}


# Plumbing Extraction Patterns
PLUMBING_PATTERNS = {
    "fixture_flow_rates": [
        r'(\d+(?:\.\d+)?)\s*(?:gpm|gallons per minute)',
        r'(\d+(?:\.\d+)?)\s*(?:gpf|gallons per flush)',
        r'flow rate[\s:=]*(\d+(?:\.\d+)?)',
        r'(\d+(?:\.\d+)?)\s*liter[s]?\s*per\s*flush'
    ],
    "pipe_sizing": [
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?|")\s*(?:copper|pex|cpvc|pvc|cast iron|pipe)',
        r'(\d+)\s*(?:inch|in\.?)\s*schedule\s*(\d+)',
        r'type\s+([lmk])\s*copper'
    ],
    "water_pressure": [
        r'(\d+)\s*(?:psi|psig)\b',
        r'pressure[\s:=]*(\d+)\s*(?:psi)?',
        r'(\d+)\s*to\s*(\d+)\s*psi'
    ],
    "water_temperature": [
        r'(\d+)\s*°?[fF](?:ahrenheit)?',
        r'hot water[\s:=]*(\d+)',
        r'temperature[\s:=]*(\d+)\s*(?:°?[fF])?'
    ],
    "heater_capacity": [
        r'(\d+)\s*(?:gallon|gal)\b',
        r'(\d+(?:,\d{3})*)\s*(?:btu/hr|btuh|mbh)',
        r'recovery rate[\s:=]*(\d+)'
    ],
    "drainage_slope": [
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?)\s*per\s*(?:foot|ft)',
        r'slope[\s:=]*(\d+)%',
        r'grade[\s:=]*(\d+(?:/\d+)?)'
    ]
}


# Plumbing Code References
PLUMBING_CODE_SECTIONS = {
    "IPC": {
        "Chapter 3": "General Regulations",
        "Chapter 4": "Fixtures, Faucets and Fixture Fittings",
        "Chapter 5": "Water Heaters",
        "Chapter 6": "Water Supply and Distribution",
        "Chapter 7": "Sanitary Drainage",
        "Chapter 8": "Indirect and Special Waste",
        "Chapter 9": "Vents",
        "Chapter 10": "Traps, Interceptors and Separators",
        "Chapter 11": "Storm Drainage",
        "Chapter 12": "Special Piping and Storage Systems",
        "Chapter 13": "Referenced Standards"
    },
    "UPC": {
        "Chapter 4": "Plumbing Fixtures and Fixture Fittings",
        "Chapter 5": "Water Heaters",
        "Chapter 6": "Water Supply and Distribution",
        "Chapter 7": "Sanitary Drainage",
        "Chapter 8": "Indirect Wastes",
        "Chapter 9": "Vents",
        "Chapter 10": "Traps and Interceptors",
        "Chapter 11": "Storm Drainage",
        "Chapter 12": "Special Waste and Special Piping Systems"
    }
}


# AI Prompts for Plumbing Analysis
PLUMBING_AI_PROMPTS = {
    "equipment_extraction": """
    Extract plumbing equipment and fixture specifications from the following text per IPC/UPC standards.
    For each fixture or piece of equipment, identify:
    1. Type (water closet, lavatory, urinal, etc.)
    2. Manufacturer and model number
    3. Flow rate (GPM) or flush volume (GPF)
    4. Mounting type (wall-hung, floor-mounted, etc.)
    5. ADA compliance requirements
    6. Rough-in dimensions
    7. Finish and material
    8. Applicable plumbing code sections (IPC/UPC)
    9. Standards compliance (ASME, ASSE, NSF)
    10. Water efficiency certifications (WaterSense, etc.)
    
    Text: {text}
    
    Return structured data in JSON format following plumbing industry terminology.
    """,
    "water_distribution_analysis": """
    Analyze the domestic water distribution system from the following specification.
    Identify per IPC/UPC requirements:
    1. Water service size and pressure
    2. Piping materials and sizing per fixture units
    3. Hot water generation and distribution
    4. Recirculation system requirements
    5. Pressure reducing valves and zones
    6. Backflow prevention devices and locations
    7. Water treatment and filtration
    8. Fixture unit calculations per IPC Table 604.3/UPC Table 6-3
    9. Pipe sizing calculations
    10. Water conservation measures
    
    Text: {text}
    
    Provide comprehensive water distribution analysis with code references.
    """,
    "drainage_system_analysis": """
    Analyze the sanitary drainage and vent system from the following specification.
    Identify per IPC/UPC requirements:
    1. Drainage piping materials and sizing
    2. Fixture unit loads and drainage calculations
    3. Vent sizing and configuration
    4. Slope requirements (minimum 1/4" per foot for 3" and larger)
    5. Cleanout locations and spacing
    6. Trap requirements and seal protection
    7. Interceptors and separators
    8. Building drain and building sewer sizing
    9. Vent terminal locations and heights
    10. Special waste systems
    
    Text: {text}
    
    Return drainage/vent system analysis with IPC/UPC article references.
    """,
    "storm_drainage_analysis": """
    Analyze the storm drainage system from the following specification.
    Identify:
    1. Roof drain sizing and locations
    2. Storm piping materials and sizing
    3. Flow rate calculations per rainfall intensity
    4. Primary and secondary (overflow) drainage
    5. Area drains and floor drains
    6. Conductor and leader sizing
    7. Storm sewer connection details
    8. Cleanout requirements
    9. Overflow protection measures
    
    Text: {text}
    
    Provide storm drainage analysis per IPC Chapter 11/UPC Chapter 11.
    """
}


def extract_plumbing_specifications(text: str) -> Dict[str, Any]:
    """
    Extract plumbing specifications from text per IPC/UPC standards.
    
    Args:
        text: Specification text
        
    Returns:
        Dictionary of extracted specifications
    """
    results = {
        "fixtures": [],
        "flow_rates": [],
        "pipe_sizing": [],
        "water_pressure": [],
        "water_temperature": [],
        "heater_capacity": [],
        "drainage_slope": [],
        "code_sections": [],
        "standards": []
    }
    
    # Extract fixture mentions
    for equipment_type, info in PLUMBING_EQUIPMENT.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["fixtures"].append({
                    "type": equipment_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract flow rates
    for pattern in PLUMBING_PATTERNS["fixture_flow_rates"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["flow_rates"].extend(matches)
    
    # Extract pipe sizing
    for pattern in PLUMBING_PATTERNS["pipe_sizing"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["pipe_sizing"].extend(matches)
    
    # Extract water pressure
    for pattern in PLUMBING_PATTERNS["water_pressure"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["water_pressure"].extend(matches)
    
    # Extract water temperature
    for pattern in PLUMBING_PATTERNS["water_temperature"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["water_temperature"].extend(matches)
    
    # Extract heater capacity
    for pattern in PLUMBING_PATTERNS["heater_capacity"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["heater_capacity"].extend(matches)
    
    # Extract drainage slope
    for pattern in PLUMBING_PATTERNS["drainage_slope"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["drainage_slope"].extend(matches)
    
    # Extract code references
    if "IPC" in text or "International Plumbing Code" in text:
        results["code_sections"].append("IPC")
    if "UPC" in text or "Uniform Plumbing Code" in text:
        results["code_sections"].append("UPC")
    
    # Extract plumbing standards
    standards = [
        "ASME A112", "ASSE", "NSF 61", "NSF 44", "EPA WaterSense",
        "ASTM B88", "ASTM D2846", "ASTM D2665", "ASTM A74",
        "AWWA", "HI", "UL 174", "ADA", "NFPA 99", "IFGC"
    ]
    for standard in standards:
        if standard in text:
            results["standards"].append(standard)
    
    return results


def get_plumbing_component_schema() -> Dict[str, Any]:
    """Get the schema for plumbing component data per IPC/UPC."""
    return {
        "type": "object",
        "properties": {
            "fixture_type": {"type": "string"},
            "manufacturer": {"type": "string"},
            "model_number": {"type": "string"},
            "flow_specifications": {
                "type": "object",
                "properties": {
                    "gpm": {"type": "number"},
                    "gpf": {"type": "number"},
                    "pressure_range_psi": {
                        "type": "object",
                        "properties": {
                            "min": {"type": "number"},
                            "max": {"type": "number"}
                        }
                    }
                }
            },
            "mounting": {
                "type": "object",
                "properties": {
                    "type": {"type": "string"},
                    "height": {"type": "number"},
                    "ada_compliant": {"type": "boolean"}
                }
            },
            "piping": {
                "type": "object",
                "properties": {
                    "material": {"type": "string"},
                    "size_inches": {"type": "number"},
                    "schedule": {"type": "string"},
                    "insulation": {"type": "string"}
                }
            },
            "code_compliance": {
                "type": "object",
                "properties": {
                    "ipc_sections": {"type": "array", "items": {"type": "string"}},
                    "upc_sections": {"type": "array", "items": {"type": "string"}}
                }
            },
            "standards": {"type": "array", "items": {"type": "string"}},
            "certifications": {"type": "array", "items": {"type": "string"}},
            "specifications": {"type": "object"}
        }
    }
