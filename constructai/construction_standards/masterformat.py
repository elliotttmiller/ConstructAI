"""
CSI MasterFormat Division Definitions and Hierarchical Structure.

Comprehensive coverage of all 50 CSI MasterFormat divisions with
subsection hierarchy, common components, and technical specifications.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field


@dataclass
class MasterFormatSection:
    """Represents a MasterFormat section with full hierarchy."""
    code: str  # e.g., "23 05 00"
    title: str
    division: int
    parent_code: Optional[str] = None
    keywords: List[str] = field(default_factory=list)
    common_components: List[str] = field(default_factory=list)
    standards: List[str] = field(default_factory=list)
    description: str = ""


# Complete MasterFormat Division Definitions
MASTERFORMAT_DIVISIONS = {
    "00": {
        "title": "Procurement and Contracting Requirements",
        "description": "Administrative and contractual requirements",
        "major_sections": [
            "Procurement Requirements",
            "Contracting Requirements",
            "Bidding Requirements",
            "Contract Forms",
            "Conditions of the Contract"
        ]
    },
    "01": {
        "title": "General Requirements",
        "description": "Administrative, procedural, and temporary work requirements",
        "major_sections": [
            "Summary",
            "Price and Payment Procedures",
            "Administrative Requirements",
            "Quality Requirements",
            "Temporary Facilities and Controls",
            "Product Requirements",
            "Execution Requirements",
            "Performance Requirements",
            "Facility Commissioning",
            "Life Cycle Activities"
        ]
    },
    "02": {
        "title": "Existing Conditions",
        "description": "Assessment, demolition, and site remediation",
        "major_sections": [
            "Assessment",
            "Subsurface Investigation",
            "Existing Conditions Assessment",
            "Demolition",
            "Site Remediation",
            "Hazardous Material Remediation"
        ]
    },
    "03": {
        "title": "Concrete",
        "description": "Concrete work including formwork, reinforcement, and placement",
        "major_sections": [
            "Concrete Forming and Accessories",
            "Concrete Reinforcing",
            "Cast-in-Place Concrete",
            "Precast Concrete",
            "Cementitious Decks and Underlayment",
            "Grouting",
            "Mass Concrete"
        ]
    },
    "04": {
        "title": "Masonry",
        "description": "Masonry units, mortar, and assemblies",
        "major_sections": [
            "Mortar and Masonry Grout",
            "Unit Masonry",
            "Stone Assemblies",
            "Manufactured Masonry",
            "Masonry Restoration and Cleaning"
        ]
    },
    "05": {
        "title": "Metals",
        "description": "Structural and architectural metals",
        "major_sections": [
            "Structural Metal Framing",
            "Metal Joists",
            "Metal Decking",
            "Cold-Formed Metal Framing",
            "Metal Fabrications",
            "Decorative Metal"
        ]
    },
    "06": {
        "title": "Wood, Plastics, and Composites",
        "description": "Carpentry, wood treatment, and composite materials",
        "major_sections": [
            "Rough Carpentry",
            "Finish Carpentry",
            "Wood Treatment",
            "Architectural Woodwork",
            "Structural Panels",
            "Plastic Fabrications"
        ]
    },
    "07": {
        "title": "Thermal and Moisture Protection",
        "description": "Insulation, roofing, waterproofing, and weather barriers",
        "major_sections": [
            "Dampproofing and Waterproofing",
            "Thermal Protection",
            "Weather Barriers",
            "Roofing",
            "Roof Specialties and Accessories",
            "Sheet Metal Flashing and Trim",
            "Wall Specialties",
            "Joint Protection"
        ]
    },
    "08": {
        "title": "Openings",
        "description": "Doors, windows, glazing, and hardware",
        "major_sections": [
            "Doors and Frames",
            "Specialty Doors and Frames",
            "Entrances, Storefronts, and Curtain Walls",
            "Windows",
            "Hardware",
            "Glazing",
            "Louvers and Vents"
        ]
    },
    "09": {
        "title": "Finishes",
        "description": "Interior finishes including flooring, walls, and ceilings",
        "major_sections": [
            "Plaster and Gypsum Board",
            "Tiling",
            "Ceilings",
            "Flooring",
            "Wall Finishes",
            "Acoustic Treatment",
            "Painting and Coating"
        ]
    },
    "10": {
        "title": "Specialties",
        "description": "Miscellaneous specialty items and equipment",
        "major_sections": [
            "Information Specialties",
            "Compartments and Cubicles",
            "Louvers and Vents",
            "Service Wall Systems",
            "Wall and Door Protection",
            "Fireplaces and Stoves",
            "Storage Shelving"
        ]
    },
    "11": {
        "title": "Equipment",
        "description": "Fixed equipment for various facilities",
        "major_sections": [
            "Vehicle and Pedestrian Equipment",
            "Security and Vault Equipment",
            "Detention Equipment",
            "Water Supply and Treatment Equipment",
            "Foodservice Equipment",
            "Residential Equipment",
            "Laboratory Equipment",
            "Medical Equipment"
        ]
    },
    "12": {
        "title": "Furnishings",
        "description": "Movable and built-in furnishings",
        "major_sections": [
            "Art",
            "Window Treatments",
            "Casework",
            "Furniture",
            "Multiple Seating",
            "Interior Plants and Planters"
        ]
    },
    "13": {
        "title": "Special Construction",
        "description": "Specialized construction systems",
        "major_sections": [
            "Special Facility Components",
            "Integrated Construction",
            "Special Function Rooms",
            "Pre-Engineered Structures",
            "Sound, Vibration, and Seismic Control"
        ]
    },
    "14": {
        "title": "Conveying Equipment",
        "description": "Elevators, escalators, and material handling",
        "major_sections": [
            "Dumbwaiters",
            "Elevators",
            "Escalators and Moving Walks",
            "Lifts",
            "Material Handling",
            "Hoists and Cranes"
        ]
    },
    "21": {
        "title": "Fire Suppression",
        "description": "Fire protection systems and equipment",
        "major_sections": [
            "Fire Suppression System Requirements",
            "Fire-Suppression Standpipes",
            "Fire-Suppression Water Service Piping",
            "Fire Pumps",
            "Fire-Suppression Sprinkler Systems",
            "Fire Hose Equipment",
            "Fire-Extinguishing Systems"
        ]
    },
    "22": {
        "title": "Plumbing",
        "description": "Plumbing systems, fixtures, and equipment",
        "major_sections": [
            "Plumbing Piping and Pumps",
            "Plumbing Equipment",
            "Domestic Water Piping",
            "Sanitary Waste and Vent Piping",
            "Plumbing Fixtures",
            "Water Heaters",
            "Pool and Fountain Plumbing"
        ]
    },
    "23": {
        "title": "Heating, Ventilating, and Air Conditioning (HVAC)",
        "description": "HVAC systems, equipment, and controls",
        "major_sections": [
            "HVAC Piping and Pumps",
            "HVAC Air Distribution",
            "Central Heating Equipment",
            "Central Cooling Equipment",
            "Central HVAC Equipment",
            "Decentralized HVAC Equipment",
            "HVAC Controls and Instrumentation"
        ]
    },
    "25": {
        "title": "Integrated Automation",
        "description": "Building automation and control systems",
        "major_sections": [
            "Integrated Automation Network Equipment",
            "Integrated Automation Instrumentation and Terminal Devices",
            "Integrated Automation Control and Monitoring",
            "Integrated Automation Facility Controls",
            "Integrated Automation Graphic Workstation"
        ]
    },
    "26": {
        "title": "Electrical",
        "description": "Electrical systems, power distribution, and lighting",
        "major_sections": [
            "Electrical Service and Distribution",
            "Low-Voltage Distribution",
            "Facility Electrical Power Generating",
            "Electrical and Cathodic Protection",
            "Lighting",
            "Electrical Testing"
        ]
    },
    "27": {
        "title": "Communications",
        "description": "Communications systems and infrastructure",
        "major_sections": [
            "Structured Cabling",
            "Data Communications",
            "Voice Communications",
            "Audio-Video Communications",
            "Distributed Communications and Monitoring"
        ]
    },
    "28": {
        "title": "Electronic Safety and Security",
        "description": "Security, surveillance, and access control systems",
        "major_sections": [
            "Electronic Access Control and Intrusion Detection",
            "Electronic Surveillance",
            "Electronic Detection and Alarm",
            "Electronic Monitoring and Control"
        ]
    },
    "31": {
        "title": "Earthwork",
        "description": "Site clearing, excavation, and grading",
        "major_sections": [
            "Clearing and Grubbing",
            "Earth Moving",
            "Earthwork Methods",
            "Shoring and Underpinning",
            "Excavation Support and Protection",
            "Soil Stabilization"
        ]
    },
    "32": {
        "title": "Exterior Improvements",
        "description": "Paving, landscaping, and site improvements",
        "major_sections": [
            "Paving",
            "Turf and Grasses",
            "Planting",
            "Exterior Improvements",
            "Site Restoration and Rehabilitation"
        ]
    },
    "33": {
        "title": "Utilities",
        "description": "Site utilities including water, sewer, and electrical",
        "major_sections": [
            "Water Utilities",
            "Sanitary Sewerage Utilities",
            "Storm Drainage Utilities",
            "Site Electrical Utilities",
            "Communications Utilities",
            "Fuel Distribution"
        ]
    },
    "34": {
        "title": "Transportation",
        "description": "Transportation systems and infrastructure",
        "major_sections": [
            "Guideways",
            "Rails",
            "Transportation Signaling and Control Equipment"
        ]
    },
    "35": {
        "title": "Waterway and Marine Construction",
        "description": "Marine and waterway structures",
        "major_sections": [
            "Waterway and Marine Construction and Equipment",
            "Coastal Construction",
            "Waterway Construction and Equipment"
        ]
    },
    "40": {
        "title": "Process Integration",
        "description": "Industrial process integration",
        "major_sections": [
            "Process Piping",
            "Process Piping and Equipment",
            "Industrial Process Control"
        ]
    },
    "41": {
        "title": "Material Processing and Handling Equipment",
        "description": "Industrial material handling systems",
        "major_sections": [
            "Bulk Material Processing Equipment",
            "Piece Material Handling Equipment"
        ]
    },
    "42": {
        "title": "Process Heating, Cooling, and Drying Equipment",
        "description": "Industrial process equipment",
        "major_sections": [
            "Process Heating Equipment",
            "Process Cooling Equipment",
            "Process Drying Equipment"
        ]
    },
    "43": {
        "title": "Process Gas and Liquid Handling",
        "description": "Gas and liquid processing equipment",
        "major_sections": [
            "Gas Handling Equipment",
            "Liquid Handling Equipment",
            "Gas and Liquid Storage"
        ]
    },
    "44": {
        "title": "Pollution Control Equipment",
        "description": "Environmental control systems",
        "major_sections": [
            "Air Pollution Control Equipment",
            "Water Treatment Equipment",
            "Solid Waste Control Equipment"
        ]
    },
    "45": {
        "title": "Industry-Specific Manufacturing Equipment",
        "description": "Specialized manufacturing equipment",
        "major_sections": [
            "Petroleum and Petrochemical Equipment",
            "Food and Beverage Processing Equipment",
            "Manufacturing Equipment"
        ]
    },
    "46": {
        "title": "Water and Wastewater Equipment",
        "description": "Water treatment and distribution",
        "major_sections": [
            "Water Treatment Equipment",
            "Wastewater Treatment Equipment",
            "Sludge Process Equipment"
        ]
    },
    "48": {
        "title": "Electrical Power Generation",
        "description": "Power generation systems",
        "major_sections": [
            "Electrical Power Generation Equipment",
            "Hydroelectric Plant Electrical Power Generation Equipment",
            "Wind Energy Electrical Power Generation Equipment"
        ]
    }
}


def get_division_info(division_code: str) -> Optional[Dict[str, Any]]:
    """
    Get information about a specific MasterFormat division.
    
    Args:
        division_code: Two-digit division code (e.g., "23", "03")
        
    Returns:
        Division information dictionary or None
    """
    division_code = division_code.zfill(2)  # Pad to 2 digits
    return MASTERFORMAT_DIVISIONS.get(division_code)


def get_all_divisions() -> Dict[str, Dict[str, Any]]:
    """Get all MasterFormat divisions."""
    return MASTERFORMAT_DIVISIONS


def is_mep_division(division_code: str) -> bool:
    """
    Check if division is MEP (Mechanical, Electrical, Plumbing).
    
    Args:
        division_code: Two-digit division code
        
    Returns:
        True if MEP division
    """
    mep_divisions = {"21", "22", "23", "25", "26", "27", "28"}
    return division_code.zfill(2) in mep_divisions


def is_structural_division(division_code: str) -> bool:
    """
    Check if division is structural.
    
    Args:
        division_code: Two-digit division code
        
    Returns:
        True if structural division
    """
    structural_divisions = {"03", "04", "05", "06"}
    return division_code.zfill(2) in structural_divisions


def is_architectural_division(division_code: str) -> bool:
    """
    Check if division is architectural.
    
    Args:
        division_code: Two-digit division code
        
    Returns:
        True if architectural division
    """
    architectural_divisions = {"07", "08", "09", "10", "12"}
    return division_code.zfill(2) in architectural_divisions
