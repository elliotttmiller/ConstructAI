"""
Division 03: Concrete Systems Intelligence.

Comprehensive concrete construction understanding including formwork, reinforcement,
cast-in-place, precast, and specialty concrete per ACI standards.
"""

from typing import Dict, List, Any
import re


# Concrete Types and Specifications
CONCRETE_TYPES = {
    "cast_in_place": {
        "keywords": ["cast-in-place", "cip", "sitecast", "poured concrete", "monolithic"],
        "specifications": ["psi", "slump", "aggregate size", "admixtures", "air content"],
        "standards": ["ACI 301", "ACI 318", "ASTM C94", "ASTM C150"]
    },
    "precast": {
        "keywords": ["precast", "prestressed", "post-tensioned", "pretensioned"],
        "specifications": ["psi", "strand size", "prestress force", "camber", "connections"],
        "standards": ["ACI 318", "PCI", "ASTM C1116", "ASTM A416"]
    },
    "high_strength": {
        "keywords": ["high strength", "high performance", "self-consolidating", "scc"],
        "specifications": ["psi", "w/c ratio", "admixtures", "curing"],
        "standards": ["ACI 363", "ACI 237", "ASTM C1856"]
    },
    "lightweight": {
        "keywords": ["lightweight concrete", "structural lightweight", "insulating concrete"],
        "specifications": ["density", "psi", "aggregate type"],
        "standards": ["ACI 213", "ASTM C330"]
    },
    "architectural": {
        "keywords": ["architectural concrete", "exposed concrete", "form liner", "finish"],
        "specifications": ["finish class", "color", "texture", "tolerance"],
        "standards": ["ACI 303", "ACI 117"]
    }
}


# Concrete Materials and Components
CONCRETE_MATERIALS = {
    "cement": {
        "keywords": ["portland cement", "type i", "type ii", "type iii", "type iv", "type v"],
        "specifications": ["type", "fineness", "strength class"],
        "standards": ["ASTM C150", "AASHTO M 85"]
    },
    "aggregates": {
        "keywords": ["aggregate", "coarse aggregate", "fine aggregate", "sand", "gravel", "crushed stone"],
        "specifications": ["size", "gradation", "absorption", "soundness"],
        "standards": ["ASTM C33", "AASHTO M 6", "AASHTO M 80"]
    },
    "admixtures": {
        "keywords": ["admixture", "water reducer", "plasticizer", "accelerator", "retarder", "air entraining"],
        "specifications": ["dosage", "type", "slump retention"],
        "standards": ["ASTM C494", "ASTM C260", "ASTM C1017"]
    },
    "reinforcing_steel": {
        "keywords": ["rebar", "reinforcing bar", "reinforcement", "dowel"],
        "specifications": ["size", "grade", "spacing", "cover", "lap length"],
        "standards": ["ASTM A615", "ASTM A706", "ACI 318", "CRSI"]
    },
    "welded_wire": {
        "keywords": ["wwf", "welded wire fabric", "wire mesh", "wire reinforcement"],
        "specifications": ["size", "spacing", "grade"],
        "standards": ["ASTM A185", "ASTM A497"]
    },
    "post_tensioning": {
        "keywords": ["post-tension", "pt", "tendon", "strand", "anchorage", "stressing"],
        "specifications": ["strand size", "jacking force", "elongation", "grout"],
        "standards": ["ACI 318", "PTI", "ASTM A416"]
    },
    "formwork": {
        "keywords": ["formwork", "forms", "shoring", "falsework", "deck"],
        "specifications": ["load capacity", "deflection", "surface finish", "release agent"],
        "standards": ["ACI 347", "OSHA", "APA"]
    },
    "fiber_reinforcement": {
        "keywords": ["fiber", "synthetic fiber", "steel fiber", "glass fiber"],
        "specifications": ["dosage", "aspect ratio", "tensile strength"],
        "standards": ["ACI 544", "ASTM C1116"]
    }
}


# Concrete Extraction Patterns
CONCRETE_PATTERNS = {
    "compressive_strength": [
        r'(\d+(?:,\d{3})*)\s*(?:psi|pound[s]?\s+per\s+square\s+inch)',
        r"f'c[\s=]*(\d+(?:,\d{3})*)",
        r'(\d+)\s*mpa',
        r'compressive strength[\s:=]*(\d+(?:,\d{3})*)'
    ],
    "slump_specs": [
        r'(\d+)\s*(?:inch|in\.?)\s*slump',
        r'slump[\s:=]*(\d+(?:\s*to\s*\d+)?)',
        r'(\d+)\s*(?:\+|-)\s*(\d+)\s*(?:inch|in\.?)'
    ],
    "water_cement_ratio": [
        r'w/c[\s=]*(\d+\.\d+)',
        r'water[- ]cement ratio[\s:=]*(\d+\.\d+)',
        r'water to cement[\s:=]*(\d+\.\d+)'
    ],
    "air_content": [
        r'(\d+(?:\.\d+)?)\s*%\s*air',
        r'air content[\s:=]*(\d+(?:\.\d+)?)\s*%',
        r'(\d+)\s*to\s*(\d+)\s*%\s*air'
    ],
    "rebar_sizing": [
        r'#(\d+)\s*(?:bar|rebar)?',
        r'(\d+)\s*(?:mm|millimeter)\s*(?:bar|rebar)',
        r'(\d+)\s*bar\s*@\s*(\d+)',
        r'grade\s*(\d+)'
    ],
    "concrete_cover": [
        r'(\d+(?:\.\d+)?)\s*(?:inch|in\.?)\s*cover',
        r'cover[\s:=]*(\d+(?:\.\d+)?)',
        r'(\d+(?:\.\d+)?)\s*(?:inch|in\.?)\s*clear'
    ],
    "aggregate_size": [
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?)\s*(?:maximum|max)\s*(?:aggregate|size)',
        r'aggregate size[\s:=]*(\d+(?:/\d+)?)',
        r'(\d+)\s*mm\s*aggregate'
    ]
}


# ACI Code References
ACI_STANDARDS = {
    "ACI 301": "Specifications for Structural Concrete",
    "ACI 318": "Building Code Requirements for Structural Concrete",
    "ACI 117": "Specifications for Tolerances for Concrete Construction",
    "ACI 211": "Standard Practice for Selecting Proportions for Normal, Heavyweight, and Mass Concrete",
    "ACI 212": "Report on Chemical Admixtures for Concrete",
    "ACI 213": "Guide for Structural Lightweight-Aggregate Concrete",
    "ACI 214": "Guide to Evaluation of Strength Test Results of Concrete",
    "ACI 228": "Report on Nondestructive Test Methods for Evaluation of Concrete in Structures",
    "ACI 301": "Specifications for Structural Concrete",
    "ACI 302": "Guide for Concrete Floor and Slab Construction",
    "ACI 303": "Guide to Cast-in-Place Architectural Concrete Practice",
    "ACI 304": "Guide for Measuring, Mixing, Transporting, and Placing Concrete",
    "ACI 305": "Guide to Hot Weather Concreting",
    "ACI 306": "Guide to Cold Weather Concreting",
    "ACI 308": "Guide to Curing Concrete",
    "ACI 309": "Guide for Consolidation of Concrete",
    "ACI 315": "Details and Detailing of Concrete Reinforcement",
    "ACI 318": "Building Code Requirements for Structural Concrete",
    "ACI 332": "Residential Code Requirements for Structural Concrete",
    "ACI 336": "Design and Construction of Drilled Piers",
    "ACI 347": "Guide to Formwork for Concrete",
    "ACI 363": "Report on High-Strength Concrete",
    "ACI 544": "Guide for Specifying, Proportioning, and Production of Fiber-Reinforced Concrete"
}


# AI Prompts for Concrete Analysis
CONCRETE_AI_PROMPTS = {
    "mix_design_extraction": """
    Extract concrete mix design specifications from the following text per ACI standards.
    For each mix design, identify:
    1. Specified compressive strength (f'c) at 28 days
    2. Slump or slump flow requirements
    3. Water-cement ratio (w/c)
    4. Maximum aggregate size
    5. Air content percentage
    6. Cement type and content
    7. Admixtures (water reducers, air entraining, etc.)
    8. Special requirements (high strength, self-consolidating, etc.)
    9. Exposure class per ACI 318 Table 19.3.1.1
    10. Quality control testing requirements
    
    Text: {text}
    
    Return structured mix design data per ACI 301 and ACI 318.
    """,
    "reinforcement_extraction": """
    Extract reinforcing steel specifications from the following text per ACI 318.
    Identify:
    1. Rebar sizes (e.g., #4, #5, #6, etc.)
    2. Grade (Grade 60, Grade 75, etc.)
    3. Spacing and layout
    4. Concrete cover requirements
    5. Lap splice and development lengths per ACI 318 Chapter 25
    6. Anchorage details
    7. Stirrup/tie spacing
    8. Welded wire fabric specifications
    9. Post-tensioning requirements if applicable
    10. ASTM specifications (A615, A706, etc.)
    
    Text: {text}
    
    Provide reinforcement details with ACI 318 section references.
    """,
    "formwork_analysis": """
    Analyze formwork and falsework specifications from the following text.
    Identify per ACI 347:
    1. Form materials (wood, steel, aluminum, etc.)
    2. Load capacity and design loads
    3. Deflection limits
    4. Shoring and reshoring requirements
    5. Removal times per strength requirements
    6. Surface finish requirements per ACI 301
    7. Form release agents
    8. Chamfer strips and rustication
    9. Tie and anchor systems
    10. Safety requirements per OSHA
    
    Text: {text}
    
    Return formwork specification analysis.
    """,
    "placement_curing_analysis": """
    Extract concrete placement and curing requirements from the following text.
    Identify per ACI standards:
    1. Placement methods and equipment
    2. Consolidation requirements (vibration, etc.)
    3. Construction joints and cold joints
    4. Hot weather concreting provisions (ACI 305)
    5. Cold weather concreting provisions (ACI 306)
    6. Curing methods and duration (ACI 308)
    7. Protection requirements
    8. Strength testing schedule
    9. Acceptance criteria per ACI 318 Section 26.12
    10. Surface finishing requirements
    
    Text: {text}
    
    Provide placement/curing analysis with ACI references.
    """
}


def extract_concrete_specifications(text: str) -> Dict[str, Any]:
    """
    Extract concrete specifications from text per ACI standards.
    
    Args:
        text: Specification text
        
    Returns:
        Dictionary of extracted specifications
    """
    results = {
        "concrete_types": [],
        "materials": [],
        "compressive_strength": [],
        "slump": [],
        "water_cement_ratio": [],
        "air_content": [],
        "rebar_sizing": [],
        "concrete_cover": [],
        "aggregate_size": [],
        "aci_standards": [],
        "astm_standards": []
    }
    
    # Extract concrete types
    for concrete_type, info in CONCRETE_TYPES.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["concrete_types"].append({
                    "type": concrete_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract materials
    for material_type, info in CONCRETE_MATERIALS.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["materials"].append({
                    "material": material_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract compressive strength
    for pattern in CONCRETE_PATTERNS["compressive_strength"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["compressive_strength"].extend(matches)
    
    # Extract slump specifications
    for pattern in CONCRETE_PATTERNS["slump_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["slump"].extend(matches)
    
    # Extract water-cement ratio
    for pattern in CONCRETE_PATTERNS["water_cement_ratio"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["water_cement_ratio"].extend(matches)
    
    # Extract air content
    for pattern in CONCRETE_PATTERNS["air_content"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["air_content"].extend(matches)
    
    # Extract rebar sizing
    for pattern in CONCRETE_PATTERNS["rebar_sizing"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["rebar_sizing"].extend(matches)
    
    # Extract concrete cover
    for pattern in CONCRETE_PATTERNS["concrete_cover"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["concrete_cover"].extend(matches)
    
    # Extract aggregate size
    for pattern in CONCRETE_PATTERNS["aggregate_size"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["aggregate_size"].extend(matches)
    
    # Extract ACI standard references
    for aci_code, aci_title in ACI_STANDARDS.items():
        if aci_code in text:
            results["aci_standards"].append({
                "code": aci_code,
                "title": aci_title
            })
    
    # Extract ASTM standard references
    astm_standards = [
        "ASTM C94", "ASTM C150", "ASTM C33", "ASTM C494",
        "ASTM C260", "ASTM A615", "ASTM A706", "ASTM A416",
        "ASTM C1116", "ASTM C39", "ASTM C31"
    ]
    for standard in astm_standards:
        if standard in text:
            results["astm_standards"].append(standard)
    
    return results


def get_concrete_component_schema() -> Dict[str, Any]:
    """Get the schema for concrete component data per ACI."""
    return {
        "type": "object",
        "properties": {
            "mix_design": {
                "type": "object",
                "properties": {
                    "compressive_strength_psi": {"type": "number"},
                    "slump_inches": {"type": "number"},
                    "water_cement_ratio": {"type": "number"},
                    "max_aggregate_size_inches": {"type": "number"},
                    "air_content_percent": {"type": "number"},
                    "cement_type": {"type": "string"},
                    "admixtures": {"type": "array", "items": {"type": "string"}}
                }
            },
            "reinforcement": {
                "type": "object",
                "properties": {
                    "bar_sizes": {"type": "array", "items": {"type": "string"}},
                    "grade": {"type": "string"},
                    "spacing_inches": {"type": "number"},
                    "cover_inches": {"type": "number"},
                    "lap_length_inches": {"type": "number"}
                }
            },
            "placement": {
                "type": "object",
                "properties": {
                    "method": {"type": "string"},
                    "consolidation": {"type": "string"},
                    "curing_method": {"type": "string"},
                    "curing_duration_days": {"type": "number"}
                }
            },
            "quality_control": {
                "type": "object",
                "properties": {
                    "testing_frequency": {"type": "string"},
                    "acceptance_criteria": {"type": "string"},
                    "cylinder_tests": {"type": "boolean"}
                }
            },
            "aci_compliance": {"type": "array", "items": {"type": "string"}},
            "astm_standards": {"type": "array", "items": {"type": "string"}},
            "specifications": {"type": "object"}
        }
    }
