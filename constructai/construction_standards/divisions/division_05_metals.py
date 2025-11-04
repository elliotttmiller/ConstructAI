"""
Division 05: Metals (Structural Steel) Intelligence.

Comprehensive structural steel understanding including members, connections,
and fabrication per AISC standards.
"""

from typing import Dict, List, Any
import re


# Structural Steel Types
STEEL_TYPES = {
    "wide_flange": {
        "keywords": ["w-shape", "wide flange", "i-beam", "w-beam", "w12", "w14", "w16", "w18", "w21", "w24", "w27", "w30", "w33", "w36"],
        "specifications": ["depth", "weight_per_foot", "grade", "fy", "fu"],
        "standards": ["AISC 360", "ASTM A992", "ASTM A572"]
    },
    "hss": {
        "keywords": ["hss", "hollow structural section", "tube steel", "rectangular tube", "square tube"],
        "specifications": ["size", "wall thickness", "grade"],
        "standards": ["AISC 360", "ASTM A500", "ASTM A1085"]
    },
    "angles": {
        "keywords": ["angle", "l-shape", "steel angle"],
        "specifications": ["leg size", "thickness", "grade"],
        "standards": ["AISC 360", "ASTM A36"]
    },
    "channels": {
        "keywords": ["channel", "c-shape", "mc-shape"],
        "specifications": ["depth", "weight", "grade"],
        "standards": ["AISC 360", "ASTM A36"]
    },
    "plates": {
        "keywords": ["plate", "base plate", "gusset plate", "connection plate"],
        "specifications": ["thickness", "dimensions", "grade"],
        "standards": ["AISC 360", "ASTM A36", "ASTM A572"]
    },
    "joists": {
        "keywords": ["joist", "steel joist", "open web joist", "k-series", "lh-series", "dlh-series"],
        "specifications": ["depth", "span", "load capacity"],
        "standards": ["SJI", "AISC 360"]
    },
    "deck": {
        "keywords": ["metal deck", "steel deck", "roof deck", "floor deck", "composite deck"],
        "specifications": ["gauge", "depth", "span", "load capacity"],
        "standards": ["SDI", "AISI", "UL"]
    }
}


# Connection Types
CONNECTION_TYPES = {
    "bolted": {
        "keywords": ["bolt", "bolted connection", "high-strength bolt", "a325", "a490"],
        "specifications": ["bolt diameter", "grade", "pretension", "spacing"],
        "standards": ["AISC 360", "RCSC", "ASTM A325", "ASTM A490"]
    },
    "welded": {
        "keywords": ["weld", "welded", "fillet weld", "groove weld", "cjp", "pjp"],
        "specifications": ["weld size", "electrode", "process", "inspection"],
        "standards": ["AWS D1.1", "AISC 360", "AWS A5.1"]
    }
}


# Extraction Patterns
STEEL_PATTERNS = {
    "member_designation": [
        r'w(\d+)x(\d+)',
        r'hss(\d+)x(\d+)x(\d+(?:/\d+)?)',
        r'l(\d+)x(\d+)x(\d+(?:/\d+)?)',
        r'mc(\d+)x(\d+(?:\.\d+)?)'
    ],
    "steel_grade": [
        r'(?:astm\s+)?a(\d+)',
        r'grade\s+(\d+)',
        r'fy[\s=]*(\d+)',
        r'fu[\s=]*(\d+)'
    ],
    "bolt_specs": [
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?|")\s*(?:diameter\s+)?(?:a325|a490|bolt)',
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?)[\s-]?(?:dia|diameter|ø)'
    ],
    "weld_specs": [
        r'(\d+(?:/\d+)?)\s*(?:inch|in\.?)\s*(?:fillet|weld)',
        r'(\d+(?:/\d+)?)"?\s*(?:fillet|weld)',
        r'(?:cjp|pjp|complete\s+joint\s+penetration|partial\s+joint\s+penetration)'
    ]
}


# AISC Standards
AISC_STANDARDS = {
    "AISC 360": "Specification for Structural Steel Buildings",
    "AISC 341": "Seismic Provisions for Structural Steel Buildings",
    "AISC 358": "Prequalified Connections for Special and Intermediate Steel Moment Frames",
    "AISC 303": "Code of Standard Practice for Steel Buildings and Bridges"
}


# AI Prompts
STEEL_AI_PROMPTS = {
    "member_extraction": """
    Extract structural steel member specifications per AISC standards.
    Identify:
    1. Member designation (W12x45, HSS6x6x1/4, etc.)
    2. Steel grade (A992, A572 Gr 50, A36, etc.)
    3. Yield strength (Fy) and tensile strength (Fu)
    4. Member length and location
    5. Connection types and details
    6. Coating/finish requirements
    7. Camber requirements if applicable
    8. Fabrication tolerances per AISC 303
    
    Text: {text}
    """,
    "connection_extraction": """
    Extract structural steel connection details per AISC 360 and AWS D1.1.
    Identify:
    1. Connection type (bolted, welded, or hybrid)
    2. Bolt specifications (size, grade, quantity, pattern)
    3. Weld specifications (type, size, length)
    4. Plate sizes and thicknesses
    5. Edge distances and spacing per AISC J3
    6. Inspection requirements
    7. Shop vs field connections
    
    Text: {text}
    """
}


def extract_steel_specifications(text: str) -> Dict[str, Any]:
    """Extract structural steel specifications per AISC."""
    results = {
        "members": [],
        "connections": [],
        "grades": [],
        "bolts": [],
        "welds": [],
        "standards": []
    }
    
    # Extract member types
    for steel_type, info in STEEL_TYPES.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["members"].append({
                    "type": steel_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    # Extract member designations
    for pattern in STEEL_PATTERNS["member_designation"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["members"].extend([{"designation": m} for m in matches])
    
    # Extract steel grades
    for pattern in STEEL_PATTERNS["steel_grade"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["grades"].extend(matches)
    
    # Extract bolt specifications
    for pattern in STEEL_PATTERNS["bolt_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["bolts"].extend(matches)
    
    # Extract weld specifications
    for pattern in STEEL_PATTERNS["weld_specs"]:
        matches = re.findall(pattern, text, re.IGNORECASE)
        results["welds"].extend(matches)
    
    # Extract standards
    for standard in ["AISC 360", "AISC 341", "ASTM A992", "ASTM A572", "AWS D1.1", "ASTM A325", "ASTM A490"]:
        if standard in text:
            results["standards"].append(standard)
    
    return results


def get_steel_component_schema() -> Dict[str, Any]:
    """Get schema for structural steel components per AISC."""
    return {
        "type": "object",
        "properties": {
            "member": {
                "type": "object",
                "properties": {
                    "designation": {"type": "string"},
                    "grade": {"type": "string"},
                    "fy_ksi": {"type": "number"},
                    "fu_ksi": {"type": "number"},
                    "length_ft": {"type": "number"}
                }
            },
            "connections": {
                "type": "object",
                "properties": {
                    "type": {"type": "string"},
                    "bolts": {"type": "string"},
                    "welds": {"type": "string"}
                }
            },
            "aisc_compliance": {"type": "array", "items": {"type": "string"}},
            "specifications": {"type": "object"}
        }
    }
