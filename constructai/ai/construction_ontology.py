"""
Construction Industry Domain Ontology and Knowledge Base.

This module provides comprehensive construction-specific knowledge for AI prompt engineering:
- CSI MasterFormat complete taxonomy
- Building codes and standards references
- OSHA safety regulations
- Trade-specific terminology
- Project lifecycle knowledge
- Risk assessment matrices
- Cost estimation frameworks
- Quality standards

Enables retrieval-augmented generation (RAG) for context-aware AI responses.
"""

from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum


class ProjectPhase(str, Enum):
    """Construction project lifecycle phases."""
    PRECONSTRUCTION = "preconstruction"
    PROCUREMENT = "procurement"
    MOBILIZATION = "mobilization"
    CONSTRUCTION = "construction"
    CLOSEOUT = "closeout"
    WARRANTY = "warranty"


class DocumentClass(str, Enum):
    """Construction document classifications."""
    SPECIFICATIONS = "specifications"
    DRAWINGS = "drawings"
    CONTRACT = "contract"
    RFI = "rfi"
    SUBMITTAL = "submittal"
    CHANGE_ORDER = "change_order"
    SCHEDULE = "schedule"
    BUDGET = "budget"
    SAFETY_PLAN = "safety_plan"
    QUALITY_PLAN = "quality_plan"


@dataclass
class BuildingCode:
    """Building code reference."""
    name: str
    acronym: str
    jurisdiction: str
    year: int
    scope: str
    key_chapters: List[str]


@dataclass
class IndustryStandard:
    """Industry standard reference."""
    organization: str
    acronym: str
    standard_number: str
    title: str
    scope: str
    applicability: List[str]


class ConstructionOntology:
    """
    Comprehensive construction industry knowledge base.
    
    Provides domain-specific context for AI prompt engineering with:
    - Complete CSI MasterFormat taxonomy
    - Building codes and regulations
    - Industry standards and best practices
    - Trade-specific terminology
    - Project management frameworks
    - Risk and safety knowledge
    """
    
    # CSI MasterFormat 2016 - Complete Division Structure
    MASTERFORMAT_DIVISIONS = {
        "00": {
            "title": "Procurement and Contracting Requirements",
            "description": "Non-technical project-specific requirements",
            "sections": ["Solicitation", "Contracting Requirements", "Project Forms"],
            "keywords": ["bid", "proposal", "contract", "bonding", "insurance", "qualification"]
        },
        "01": {
            "title": "General Requirements",
            "description": "Administrative and procedural requirements",
            "sections": ["Project Management", "Quality Requirements", "Temporary Facilities", "Product Requirements"],
            "keywords": ["submittals", "closeout", "maintenance", "warranties", "commissioning"]
        },
        "02": {
            "title": "Existing Conditions",
            "description": "Site survey, demolition, structure moving",
            "sections": ["Assessment", "Demolition and Structure Moving", "Site Remediation"],
            "keywords": ["demolition", "hazmat", "remediation", "site survey", "selective demolition"]
        },
        "03": {
            "title": "Concrete",
            "description": "Concrete formwork, reinforcement, cast-in-place",
            "sections": ["Concrete Forming", "Concrete Reinforcing", "Cast-In-Place Concrete", "Precast Concrete"],
            "keywords": ["reinforced concrete", "formwork", "rebar", "post-tensioning", "grout"]
        },
        "04": {
            "title": "Masonry",
            "description": "Brick, block, stone, masonry assemblies",
            "sections": ["Mortar and Masonry Grout", "Unit Masonry", "Stone Assemblies", "Masonry Restoration"],
            "keywords": ["brick", "CMU", "stone", "mortar", "masonry units"]
        },
        "05": {
            "title": "Metals",
            "description": "Structural steel, metal joists, metal decking",
            "sections": ["Structural Metal Framing", "Metal Joists", "Metal Decking", "Cold-Formed Metal Framing"],
            "keywords": ["structural steel", "steel framing", "metal deck", "joists", "welding"]
        },
        "06": {
            "title": "Wood, Plastics, and Composites",
            "description": "Rough carpentry, finish carpentry, architectural woodwork",
            "sections": ["Rough Carpentry", "Finish Carpentry", "Architectural Woodwork", "Plastic Fabrications"],
            "keywords": ["lumber", "framing", "millwork", "cabinetry", "wood trusses"]
        },
        "07": {
            "title": "Thermal and Moisture Protection",
            "description": "Waterproofing, insulation, roofing, siding",
            "sections": ["Dampproofing and Waterproofing", "Thermal Protection", "Roofing", "Wall Finishes"],
            "keywords": ["roofing", "insulation", "waterproofing", "siding", "flashing"]
        },
        "08": {
            "title": "Openings",
            "description": "Doors, windows, hardware, glazing",
            "sections": ["Doors and Frames", "Windows", "Hardware", "Glazing"],
            "keywords": ["doors", "windows", "hardware", "glass", "frames"]
        },
        "09": {
            "title": "Finishes",
            "description": "Gypsum board, tile, flooring, painting, acoustics",
            "sections": ["Plaster and Gypsum Board", "Tiling", "Flooring", "Wall Finishes", "Ceiling Finishes", "Painting"],
            "keywords": ["drywall", "tile", "flooring", "paint", "acoustical ceiling"]
        },
        "10": {
            "title": "Specialties",
            "description": "Visual display units, lockers, partitions, signage",
            "sections": ["Visual Display Units", "Compartments and Cubicles", "Scales", "Storage Assemblies", "Protective Covers"],
            "keywords": ["toilet partitions", "lockers", "signage", "specialties", "accessories"]
        },
        "11": {
            "title": "Equipment",
            "description": "Fixed equipment for specific spaces",
            "sections": ["Mercantile Equipment", "Residential Equipment", "Healthcare Equipment", "Laboratory Equipment"],
            "keywords": ["appliances", "equipment", "furnishings", "fixtures"]
        },
        "12": {
            "title": "Furnishings",
            "description": "Artwork, casework, furniture, window treatments",
            "sections": ["Art", "Fabrics", "Furniture", "Furnishing Accessories"],
            "keywords": ["furniture", "window treatments", "casework", "furnishings"]
        },
        "13": {
            "title": "Special Construction",
            "description": "Pre-engineered structures, special purpose rooms",
            "sections": ["Special Facilities", "Special Structures", "Integrated Construction"],
            "keywords": ["pools", "special structures", "integrated construction"]
        },
        "14": {
            "title": "Conveying Equipment",
            "description": "Elevators, escalators, lifts, conveyors",
            "sections": ["Dumbwaiters", "Elevators", "Escalators and Moving Walks", "Lifts", "Material Handling"],
            "keywords": ["elevators", "escalators", "lifts", "conveyors"]
        },
        "21": {
            "title": "Fire Suppression",
            "description": "Fire suppression systems and equipment",
            "sections": ["Fire Extinguishing Systems", "Fire Pumps", "Fire-Suppression Water Storage"],
            "keywords": ["fire sprinkler", "fire suppression", "standpipe", "fire protection"]
        },
        "22": {
            "title": "Plumbing",
            "description": "Plumbing systems, fixtures, equipment",
            "sections": ["Plumbing Piping", "Plumbing Equipment", "Plumbing Fixtures", "Pool and Fountain Plumbing Systems"],
            "keywords": ["plumbing", "water supply", "drainage", "fixtures", "piping", "sanitary", "storm drain"]
        },
        "23": {
            "title": "Heating, Ventilating, and Air Conditioning (HVAC)",
            "description": "HVAC systems and equipment",
            "sections": ["HVAC Piping", "HVAC Pumps", "HVAC Air Distribution", "HVAC Equipment", "HVAC Controls"],
            "keywords": ["HVAC", "heating", "cooling", "ventilation", "air conditioning", "ductwork", "AHU", "chiller", "boiler"]
        },
        "25": {
            "title": "Integrated Automation",
            "description": "Building automation and control systems",
            "sections": ["Control Systems Integration", "Integrated Automation Facility Controls", "Integrated Automation Instrumentation"],
            "keywords": ["BMS", "BAS", "automation", "controls", "DDC", "building management"]
        },
        "26": {
            "title": "Electrical",
            "description": "Electrical systems, power distribution, lighting",
            "sections": ["Basic Electrical Materials", "Facility Electrical Power Generating", "Electrical Power Transmission", "Electrical Distribution", "Lighting"],
            "keywords": ["electrical", "power", "lighting", "panels", "wiring", "conduit"]
        },
        "27": {
            "title": "Communications",
            "description": "Communications systems and infrastructure",
            "sections": ["Structured Cabling", "Data Communications", "Audio-Video Communications", "Mass Notification"],
            "keywords": ["communications", "data", "telephone", "network", "AV", "security"]
        },
        "28": {
            "title": "Electronic Safety and Security",
            "description": "Security and safety electronic systems",
            "sections": ["Electronic Surveillance", "Electronic Detection and Alarm", "Electronic Access Control", "Electronic Monitoring"],
            "keywords": ["security", "access control", "CCTV", "alarm", "fire alarm"]
        },
        "31": {
            "title": "Earthwork",
            "description": "Site clearing, excavation, earth moving",
            "sections": ["Site Clearing", "Earth Moving", "Excavation Support", "Soil Stabilization"],
            "keywords": ["excavation", "grading", "earthwork", "backfill", "compaction"]
        },
        "32": {
            "title": "Exterior Improvements",
            "description": "Paving, landscaping, site improvements",
            "sections": ["Paving", "Planting", "Site Improvements", "Storm Drainage Utilities"],
            "keywords": ["paving", "landscaping", "site work", "parking", "sidewalks"]
        },
        "33": {
            "title": "Utilities",
            "description": "Site utilities and infrastructure",
            "sections": ["Water Utilities", "Sanitary Sewerage Utilities", "Storm Drainage Utilities", "Electrical Utilities", "Communications Utilities"],
            "keywords": ["utilities", "water main", "sewer", "electrical service", "storm drain"]
        },
        "34": {
            "title": "Transportation",
            "description": "Transportation systems and roadways",
            "sections": ["Guideways", "Roadway Construction", "Bridges", "Pedestrian Bridges"],
            "keywords": ["roadway", "transportation", "bridges", "guideways"]
        },
        "40": {
            "title": "Process Integration",
            "description": "Process manufacturing and integration",
            "sections": ["Process Piping", "Process Equipment", "Process Integration"],
            "keywords": ["process", "industrial", "manufacturing"]
        },
        "41": {
            "title": "Material Processing and Handling Equipment",
            "description": "Industrial material handling",
            "sections": ["Bulk Material Processing Equipment", "Container Material Processing Equipment"],
            "keywords": ["material handling", "industrial equipment"]
        },
        "44": {
            "title": "Pollution Control Equipment",
            "description": "Pollution and environmental control",
            "sections": ["Air Pollution Control", "Water Process Equipment"],
            "keywords": ["pollution control", "environmental"]
        },
        "48": {
            "title": "Electrical Power Generation",
            "description": "Power generation systems",
            "sections": ["Electrical Power Generation Equipment"],
            "keywords": ["power generation", "generators", "renewable energy"]
        }
    }
    
    # Major Building Codes - United States
    BUILDING_CODES = [
        BuildingCode(
            name="International Building Code",
            acronym="IBC",
            jurisdiction="International (US Model Code)",
            year=2021,
            scope="Commercial buildings, structural, fire/life safety, accessibility",
            key_chapters=["General", "Definitions", "Use and Occupancy Classification", "Special Detailed Requirements", 
                         "Fire and Life Safety", "Structural Design", "Exterior Walls", "Roof Assemblies and Rooftop Structures"]
        ),
        BuildingCode(
            name="International Residential Code",
            acronym="IRC",
            jurisdiction="International (US Model Code)",
            year=2021,
            scope="One and two-family dwellings, townhouses",
            key_chapters=["Building Planning", "Foundations", "Floors", "Wall Construction", "Roof-Ceiling Construction", 
                         "Mechanical", "Fuel Gas", "Plumbing", "Electrical"]
        ),
        BuildingCode(
            name="International Mechanical Code",
            acronym="IMC",
            jurisdiction="International (US Model Code)",
            year=2021,
            scope="HVAC systems, ventilation, combustion air",
            key_chapters=["General Regulations", "Ventilation", "Exhaust Systems", "Duct Systems", 
                         "Combustion Air", "Chimneys and Vents", "Specific Appliances"]
        ),
        BuildingCode(
            name="International Plumbing Code",
            acronym="IPC",
            jurisdiction="International (US Model Code)",
            year=2021,
            scope="Plumbing systems, fixtures, water supply, drainage",
            key_chapters=["General Regulations", "Fixtures, Faucets and Fixture Fittings", "Water Heaters", 
                         "Water Supply and Distribution", "Sanitary Drainage", "Vents", "Storm Drainage"]
        ),
        BuildingCode(
            name="International Energy Conservation Code",
            acronym="IECC",
            jurisdiction="International (US Model Code)",
            year=2021,
            scope="Energy efficiency for buildings",
            key_chapters=["Residential", "Commercial", "Building Envelope", "Mechanical", "Lighting", "Power"]
        ),
        BuildingCode(
            name="National Fire Protection Association",
            acronym="NFPA",
            jurisdiction="National (US)",
            year=2020,
            scope="Fire protection, life safety, electrical safety",
            key_chapters=["Life Safety Code (NFPA 101)", "National Electrical Code (NFPA 70)", 
                         "Building Construction (NFPA 220)", "Fire Protection Systems"]
        ),
        BuildingCode(
            name="National Electrical Code",
            acronym="NEC",
            jurisdiction="National (US - NFPA 70)",
            year=2020,
            scope="Electrical installations, safety requirements",
            key_chapters=["General", "Wiring and Protection", "Wiring Methods", "Equipment", "Special Occupancies", 
                         "Special Equipment", "Special Conditions", "Communication Systems"]
        )
    ]
    
    # Industry Standards Organizations
    STANDARDS = [
        IndustryStandard(
            organization="ASTM International",
            acronym="ASTM",
            standard_number="Various (12,000+ standards)",
            title="Materials, Products, Systems, and Services",
            scope="Testing methods, specifications, guides for construction materials",
            applicability=["Concrete", "Steel", "Masonry", "Coatings", "Geotechnical", "Testing"]
        ),
        IndustryStandard(
            organization="American Concrete Institute",
            acronym="ACI",
            standard_number="318",
            title="Building Code Requirements for Structural Concrete",
            scope="Design and construction of concrete structures",
            applicability=["Concrete", "Structural Design", "Reinforcement", "Formwork"]
        ),
        IndustryStandard(
            organization="American Institute of Steel Construction",
            acronym="AISC",
            standard_number="360",
            title="Specification for Structural Steel Buildings",
            scope="Design, fabrication, and erection of steel structures",
            applicability=["Structural Steel", "Connections", "Welding", "Bolting"]
        ),
        IndustryStandard(
            organization="American Society of Heating, Refrigerating and Air-Conditioning Engineers",
            acronym="ASHRAE",
            standard_number="90.1",
            title="Energy Standard for Buildings Except Low-Rise Residential Buildings",
            scope="Energy efficiency requirements for HVAC, lighting, power",
            applicability=["HVAC", "Energy Efficiency", "Mechanical Systems", "Building Envelope"]
        ),
        IndustryStandard(
            organization="Sheet Metal and Air Conditioning Contractors' National Association",
            acronym="SMACNA",
            standard_number="Various",
            title="HVAC Duct Construction Standards",
            scope="Ductwork design, fabrication, installation standards",
            applicability=["HVAC", "Ductwork", "Sheet Metal", "Air Distribution"]
        ),
        IndustryStandard(
            organization="American Society of Sanitary Engineering",
            acronym="ASSE",
            standard_number="Various",
            title="Plumbing System Components and Performance Standards",
            scope="Plumbing fixtures, devices, and systems",
            applicability=["Plumbing", "Water Supply", "Drainage", "Fixtures"]
        ),
        IndustryStandard(
            organization="American Institute of Architects",
            acronym="AIA",
            standard_number="A101, A201, etc.",
            title="Standard Form of Agreement Between Owner and Contractor",
            scope="Contract documents and project delivery",
            applicability=["Contracts", "Project Management", "Administration", "General Conditions"]
        ),
        IndustryStandard(
            organization="Construction Specifications Institute",
            acronym="CSI",
            standard_number="MasterFormat",
            title="Standard for Organizing Specifications and Other Written Information",
            scope="Classification system for construction specifications",
            applicability=["Specifications", "Documentation", "Procurement", "Organization"]
        )
    ]
    
    # OSHA Safety Regulations - Top 10 Most Cited
    OSHA_REGULATIONS = {
        "1926.501": {
            "title": "Fall Protection - Duty to have fall protection",
            "scope": "Requirements for fall protection systems in construction",
            "penalty_range": "$7,000 - $70,000+",
            "key_requirements": ["6-foot rule", "Personal fall arrest systems", "Guardrail systems", "Safety nets", "Training"]
        },
        "1926.1053": {
            "title": "Ladders - General requirements",
            "scope": "Safe use and inspection of ladders",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["3-point contact", "Proper angle", "Inspection", "Load capacity", "Securing"]
        },
        "1926.451": {
            "title": "Scaffolding - General requirements",
            "scope": "Scaffolding design, erection, and use",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["Competent person", "Capacity", "Access", "Fall protection", "Stability"]
        },
        "1926.1060": {
            "title": "Stairways and ladders",
            "scope": "Requirements for stairways and ladders in construction",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["Stair rails and handrails", "Landings", "Riser/tread dimensions"]
        },
        "1910.1200": {
            "title": "Hazard Communication Standard (HazCom)",
            "scope": "Chemical hazard communication and safety data sheets",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["Written program", "SDS availability", "Container labeling", "Training"]
        },
        "1926.102": {
            "title": "Eye and Face Protection",
            "scope": "Requirements for protective eyewear",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["ANSI Z87.1 compliance", "Side shields", "Face shields for grinding"]
        },
        "1926.100": {
            "title": "Head Protection",
            "scope": "Hard hat requirements",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["ANSI Z89.1 compliance", "Type and Class", "Inspection", "Replacement"]
        },
        "1926.503": {
            "title": "Fall Protection - Training requirements",
            "scope": "Training for employees exposed to fall hazards",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["Nature of hazards", "Procedures", "Equipment use", "Rescue procedures"]
        },
        "1926.454": {
            "title": "Scaffolding - Training requirements",
            "scope": "Training for scaffold users and erectors",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["Competent person training", "Hazard recognition", "Capacity limits"]
        },
        "1926.95": {
            "title": "Criteria for personal protective equipment",
            "scope": "General PPE requirements",
            "penalty_range": "$7,000 - $70,000",
            "key_requirements": ["Hazard assessment", "PPE selection", "Training", "Maintenance"]
        }
    }
    
    # Trade-Specific Terminology
    TRADE_TERMINOLOGY = {
        "general_contractor": [
            "GC", "general conditions", "prime contractor", "CM", "construction manager", 
            "project manager", "superintendent", "schedule of values", "pay application", "AIA G702/G703"
        ],
        "structural": [
            "moment frame", "shear wall", "lateral system", "seismic design", "wind load",
            "dead load", "live load", "load combinations", "deflection", "buckling"
        ],
        "concrete": [
            "slump", "admixture", "water-cement ratio", "curing", "consolidation",
            "form pressure", "rebar spacing", "lap splice", "development length", "strength test"
        ],
        "steel": [
            "shop drawings", "mill cert", "weld inspection", "NDT", "bolt torque",
            "base plate", "moment connection", "braced frame", "crane beam", "embed plate"
        ],
        "mechanical": [
            "BTU", "ton", "CFM", "static pressure", "duct sizing", "air balance",
            "commissioning", "TAB", "hydronic", "glycol", "VFD", "economizer"
        ],
        "electrical": [
            "amp", "voltage", "watt", "load calculation", "voltage drop", "short circuit",
            "arc flash", "panelboard", "switchgear", "transformer", "conduit fill", "wire sizing"
        ],
        "plumbing": [
            "fixture unit", "DFU", "trap", "vent stack", "soil stack", "cleanout",
            "backflow preventer", "pressure reducing valve", "expansion tank", "water hammer"
        ]
    }
    
    # Risk Assessment Matrix
    RISK_CATEGORIES = {
        "schedule": {
            "description": "Time-related risks affecting project duration",
            "indicators": ["aggressive timeline", "weather dependency", "long lead items", "sequential dependencies"],
            "mitigation": ["float analysis", "fast-tracking", "procurement planning", "weather contingencies"]
        },
        "cost": {
            "description": "Budget and financial risks",
            "indicators": ["incomplete design", "market volatility", "change order potential", "inadequate contingency"],
            "mitigation": ["value engineering", "cost tracking", "contingency management", "escalation clauses"]
        },
        "quality": {
            "description": "Workmanship and materials quality risks",
            "indicators": ["inexperienced trades", "substitutions", "inadequate QC", "complex details"],
            "mitigation": ["mock-ups", "inspection protocols", "testing requirements", "shop drawings"]
        },
        "safety": {
            "description": "Worker safety and OSHA compliance risks",
            "indicators": ["fall hazards", "confined spaces", "hazardous materials", "heavy equipment"],
            "mitigation": ["safety plans", "training programs", "PPE requirements", "site inspections"]
        },
        "compliance": {
            "description": "Code and regulatory compliance risks",
            "indicators": ["complex code requirements", "jurisdictional issues", "permit delays", "inspection failures"],
            "mitigation": ["code review", "pre-submittal meetings", "third-party reviews", "jurisdictional research"]
        }
    }
    
    @classmethod
    def get_division_context(cls, division_number: str) -> Dict[str, Any]:
        """Get comprehensive context for a specific CSI division."""
        division = cls.MASTERFORMAT_DIVISIONS.get(division_number)
        if not division:
            return {}
        
        return {
            "division": division_number,
            "title": division["title"],
            "description": division["description"],
            "sections": division["sections"],
            "keywords": division["keywords"],
            "related_codes": cls._get_related_codes(division_number),
            "related_standards": cls._get_related_standards(division_number),
            "common_risks": cls._get_division_risks(division_number)
        }
    
    @classmethod
    def _get_related_codes(cls, division: str) -> List[str]:
        """Get building codes applicable to specific division."""
        code_mapping = {
            "03": ["IBC", "ACI 318", "ASTM C150"],
            "04": ["IBC", "ASTM C90", "ASTM C270"],
            "05": ["IBC", "AISC 360", "AWS D1.1"],
            "07": ["IBC", "IECC", "ASTM D1970"],
            "22": ["IPC", "UPC", "ASSE", "NSF"],
            "23": ["IMC", "ASHRAE 90.1", "SMACNA"],
            "26": ["NEC", "NFPA 70", "NFPA 110"]
        }
        return code_mapping.get(division, ["IBC"])
    
    @classmethod
    def _get_related_standards(cls, division: str) -> List[str]:
        """Get industry standards for specific division."""
        return [std.standard_number for std in cls.STANDARDS if division in getattr(std, 'applicability', [])]
    
    @classmethod
    def _get_division_risks(cls, division: str) -> List[str]:
        """Get common risks for specific division."""
        risk_mapping = {
            "01": ["Schedule delays", "Inadequate documentation", "Quality control gaps"],
            "03": ["Concrete strength failures", "Formwork collapses", "Cold weather issues"],
            "05": ["Welding defects", "Erection accidents", "Material delivery delays"],
            "22": ["Fixture damage", "Pressure test failures", "Code violations"],
            "23": ["Duct leakage", "Inadequate capacity", "Noise/vibration issues"],
            "26": ["Short circuits", "Code violations", "Inadequate capacity"]
        }
        return risk_mapping.get(division, ["General construction risks"])
    
    @classmethod
    def get_project_phase_context(cls, phase: ProjectPhase) -> Dict[str, Any]:
        """Get context for specific project phase."""
        phase_contexts = {
            ProjectPhase.PRECONSTRUCTION: {
                "focus": ["Planning", "Design review", "Estimating", "Scheduling"],
                "deliverables": ["Cost estimate", "Schedule", "Constructability review", "Value engineering"],
                "risks": ["Incomplete design", "Budget limitations", "Permit delays"],
                "key_activities": ["Bid package preparation", "Subcontractor prequalification", "Long lead procurement"]
            },
            ProjectPhase.PROCUREMENT: {
                "focus": ["Subcontractor selection", "Materials procurement", "Contract negotiation"],
                "deliverables": ["Subcontracts", "Purchase orders", "Insurance certificates", "Bonds"],
                "risks": ["Price escalation", "Material shortages", "Lead time delays"],
                "key_activities": ["Bid solicitation", "Bid evaluation", "Contract award", "Submittals"]
            },
            ProjectPhase.CONSTRUCTION: {
                "focus": ["Field execution", "Quality control", "Safety management", "Schedule tracking"],
                "deliverables": ["Daily reports", "Progress photos", "Test reports", "Pay applications"],
                "risks": ["Weather delays", "Labor shortages", "Design conflicts", "Safety incidents"],
                "key_activities": ["Field coordination", "RFI management", "Change orders", "Inspections"]
            },
            ProjectPhase.CLOSEOUT: {
                "focus": ["Punch list completion", "Commissioning", "Documentation", "Training"],
                "deliverables": ["O&M manuals", "As-built drawings", "Warranties", "Final lien releases"],
                "risks": ["Incomplete punch list", "Missing documentation", "Warranty claims"],
                "key_activities": ["Substantial completion", "Final acceptance", "Turnover", "Final payment"]
            }
        }
        return phase_contexts.get(phase, {})
    
    @classmethod
    def get_safety_context(cls, activity: str) -> Dict[str, Any]:
        """Get OSHA safety requirements for specific activity."""
        # Return relevant OSHA regulations based on activity
        relevant_regs = []
        for reg_id, reg_data in cls.OSHA_REGULATIONS.items():
            if any(keyword in activity.lower() for keyword in reg_data["title"].lower().split()):
                relevant_regs.append({
                    "regulation": reg_id,
                    **reg_data
                })
        return {
            "activity": activity,
            "applicable_regulations": relevant_regs,
            "general_ppe_required": ["Hard hat", "Safety glasses", "Work boots", "High-visibility vest"]
        }
