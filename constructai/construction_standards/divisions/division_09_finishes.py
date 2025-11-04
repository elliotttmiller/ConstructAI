"""
Division 09: Finishes Intelligence.

Interior and exterior finishes including drywall, flooring, painting, and ceilings.
"""

from typing import Dict, List, Any
import re


# Finish Types
FINISH_TYPES = {
    "gypsum_board": {
        "keywords": ["gypsum board", "drywall", "sheetrock", "type x", "fire-rated", "moisture-resistant"],
        "specifications": ["thickness", "fire rating", "type"],
        "standards": ["ASTM C1396", "GA-216", "UL Fire Rated"]
    },
    "ceramic_tile": {
        "keywords": ["ceramic tile", "porcelain tile", "wall tile", "floor tile"],
        "specifications": ["size", "pei rating", "cof", "absorption"],
        "standards": ["ANSI A137.1", "TCNA", "ISO 10545"]
    },
    "resilient_flooring": {
        "keywords": ["vinyl", "lvt", "vct", "sheet vinyl", "luxury vinyl"],
        "specifications": ["thickness", "wear layer", "class"],
        "standards": ["ASTM F1700", "FloorScore"]
    },
    "carpet": {
        "keywords": ["carpet", "carpet tile", "broadloom"],
        "specifications": ["pile height", "face weight", "density"],
        "standards": ["CRI Green Label Plus", "ASTM D5252"]
    },
    "paint_coatings": {
        "keywords": ["paint", "coating", "primer", "latex", "acrylic", "epoxy"],
        "specifications": ["sheen", "voc", "mil thickness", "coverage"],
        "standards": ["MPI", "Green Seal GS-11", "SCAQMD", "LEED"]
    },
    "acoustic_ceiling": {
        "keywords": ["ceiling tile", "acoustic ceiling", "suspended ceiling", "t-bar"],
        "specifications": ["nrc", "cac", "light reflectance"],
        "standards": ["ASTM E1264", "ASTM C423"]
    }
}


# Extraction Patterns
FINISH_PATTERNS = {
    "thickness": [r'(\d+/\d+)\s*(?:inch|in\.?)'],
    "fire_rating": [r'(\d+)\s*hour\s*fire', r'type\s*x'],
    "nrc_cac": [r'(?:nrc|cac)[\s:=]*(\d+\.\d+)'],
    "voc": [r'(\d+)\s*g/l\s*voc']
}


def extract_finish_specifications(text: str) -> Dict[str, Any]:
    """Extract finish specifications."""
    results = {"finishes": [], "standards": []}
    
    for finish_type, info in FINISH_TYPES.items():
        for keyword in info["keywords"]:
            if keyword.lower() in text.lower():
                results["finishes"].append({
                    "type": finish_type,
                    "keyword": keyword,
                    "standards": info["standards"]
                })
    
    return results
