"""
Mechanical, Electrical, and Plumbing (MEP) Systems Analyzer.

Specialized analysis for HVAC and Plumbing specifications following:
- ASHRAE (American Society of Heating, Refrigerating and Air-Conditioning Engineers)
- SMACNA (Sheet Metal and Air Conditioning Contractors' National Association)
- IPC (International Plumbing Code)
- UPC (Uniform Plumbing Code)
- IMC (International Mechanical Code)

Industry-standard practices for MEP specification analysis.
"""

import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class HVACEquipment:
    """Represents HVAC equipment with industry-standard specifications."""
    equipment_type: str
    capacity: Optional[str] = None
    efficiency_rating: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    standards_compliance: List[str] = None
    
    def __post_init__(self):
        if self.standards_compliance is None:
            self.standards_compliance = []


@dataclass
class PlumbingFixture:
    """Represents plumbing fixture with code-compliant specifications."""
    fixture_type: str
    quantity: Optional[int] = None
    material: Optional[str] = None
    size: Optional[str] = None
    standards_compliance: List[str] = None
    
    def __post_init__(self):
        if self.standards_compliance is None:
            self.standards_compliance = []


class HVACAnalyzer:
    """
    Analyzes HVAC specifications following ASHRAE and IMC standards.
    
    Extracts:
    - Equipment types and capacities
    - Ductwork specifications
    - Ventilation requirements
    - Energy efficiency ratings (SEER, EER, COP)
    - Controls and automation
    """
    
    def __init__(self):
        """Initialize with industry-standard HVAC patterns."""
        
        # HVAC Equipment Patterns (ASHRAE nomenclature)
        self.equipment_patterns = {
            'air_handler': [
                r'\b(?:air\s+hand(?:ler|ling)\s+unit|AHU)s?\b',
                r'\b(?:make[- ]up\s+air|MAU)\s+unit\b',
            ],
            'chiller': [
                r'\b(?:water[- ]cooled|air[- ]cooled)\s+chiller\b',
                r'\bchiller\s+plant\b',
            ],
            'boiler': [
                r'\b(?:hot\s+water|steam)\s+boiler\b',
                r'\b(?:condensing|non[- ]condensing)\s+boiler\b',
            ],
            'heat_pump': [
                r'\b(?:heat\s+pump|VRF|VRV)\s+system\b',
                r'\bground[- ]source\s+heat\s+pump\b',
            ],
            'rooftop_unit': [
                r'\b(?:packaged|split)\s+(?:rooftop|RTU)\s+unit\b',
                r'\b(?:gas|electric)\s+rooftop\s+unit\b',
            ],
            'fan_coil': [
                r'\bfan[- ]coil\s+unit\b',
                r'\bFCU\b',
            ],
            'exhaust_fan': [
                r'\b(?:exhaust|supply|return)\s+(?:fan|blower)\b',
                r'\b(?:ceiling|inline|wall)[- ]mounted\s+fan\b',
            ],
            'vav_box': [
                r'\bVAV\s+(?:box|terminal)\b',
                r'\bvariable\s+air\s+volume\b',
            ],
            'cooling_tower': [
                r'\bcooling\s+tower\b',
                r'\bevaporative\s+cooler\b',
            ],
        }
        
        # Capacity Patterns (ASHRAE Standard 90.1 units)
        self.capacity_patterns = [
            r'\b\d+[\,\.]?\d*\s*(?:ton|TR)\b',  # Cooling tons
            r'\b\d+[\,\.]?\d*\s*(?:BTU|Btu|BTUH|MBH)\b',  # BTU/hour
            r'\b\d+[\,\.]?\d*\s*(?:CFM|cfm)\b',  # Airflow
            r'\b\d+[\,\.]?\d*\s*(?:GPM|gpm)\b',  # Water flow
            r'\b\d+[\,\.]?\d*\s*(?:kW|KW)\b',  # Electrical capacity
        ]
        
        # Efficiency Ratings (ASHRAE/AHRI standards)
        self.efficiency_patterns = [
            r'\bSEER[\s\-]?\d+(?:\.\d+)?\b',  # Seasonal Energy Efficiency Ratio
            r'\bEER[\s\-]?\d+(?:\.\d+)?\b',   # Energy Efficiency Ratio
            r'\bCOP[\s\-]?\d+(?:\.\d+)?\b',   # Coefficient of Performance
            r'\bHSPF[\s\-]?\d+(?:\.\d+)?\b',  # Heating Seasonal Performance Factor
            r'\bAFUE[\s\-]?\d+(?:\.\d+)?%?\b', # Annual Fuel Utilization Efficiency
        ]
        
        # Ductwork Specifications (SMACNA standards)
        self.ductwork_patterns = [
            r'\b\d+"\s*(?:x|by)\s*\d+"\s+duct\b',
            r'\b(?:rectangular|round|oval)\s+duct(?:work)?\b',
            r'\b(?:galvanized|stainless)\s+steel\s+duct\b',
            r'\b(?:rigid|flex(?:ible)?)\s+duct\b',
        ]
        
        # ASHRAE Standards References
        self.hvac_standards = [
            r'\bASHRAE\s+(?:Standard\s+)?\d+[\.\-]?\d*\b',
            r'\bSMACNA\b',
            r'\bAHRI\s+\d+\b',
            r'\bIMC\s+\d{4}\b',  # International Mechanical Code
        ]
        
        logger.info("HVACAnalyzer initialized with ASHRAE/SMACNA standards")
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze HVAC specifications from text.
        
        Args:
            text: Document text to analyze
            
        Returns:
            Dictionary with HVAC analysis results
        """
        results = {
            'equipment': [],
            'capacities': [],
            'efficiency_ratings': [],
            'ductwork': [],
            'standards': [],
            'summary': {}
        }
        
        # Extract equipment
        for equip_type, patterns in self.equipment_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    results['equipment'].append({
                        'type': equip_type.replace('_', ' ').title(),
                        'mention': match.group(0),
                        'position': match.start()
                    })
        
        # Extract capacities
        for pattern in self.capacity_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results['capacities'].append(match.group(0))
        
        # Extract efficiency ratings
        for pattern in self.efficiency_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results['efficiency_ratings'].append(match.group(0))
        
        # Extract ductwork specifications
        for pattern in self.ductwork_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results['ductwork'].append(match.group(0))
        
        # Extract standards references
        for pattern in self.hvac_standards:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                if match.group(0) not in results['standards']:
                    results['standards'].append(match.group(0))
        
        # Generate summary
        results['summary'] = {
            'total_equipment': len(results['equipment']),
            'equipment_types': len(set(e['type'] for e in results['equipment'])),
            'has_capacity_specs': len(results['capacities']) > 0,
            'has_efficiency_ratings': len(results['efficiency_ratings']) > 0,
            'has_ductwork_specs': len(results['ductwork']) > 0,
            'standards_referenced': len(results['standards']),
            'completeness_score': self._calculate_completeness(results)
        }
        
        return results
    
    def _calculate_completeness(self, results: Dict[str, Any]) -> float:
        """Calculate HVAC specification completeness score."""
        criteria = [
            len(results['equipment']) > 0,
            len(results['capacities']) > 0,
            len(results['efficiency_ratings']) > 0,
            len(results['ductwork']) > 0,
            len(results['standards']) > 0,
        ]
        return (sum(criteria) / len(criteria)) * 100


class PlumbingAnalyzer:
    """
    Analyzes plumbing specifications following IPC/UPC standards.
    
    Extracts:
    - Fixtures and equipment
    - Pipe sizes and materials
    - Water supply requirements
    - Drainage specifications
    - Code compliance
    """
    
    def __init__(self):
        """Initialize with industry-standard plumbing patterns."""
        
        # Plumbing Fixtures (IPC Chapter 4)
        self.fixture_patterns = {
            'water_closet': [
                r'\b(?:water\s+closet|toilet|WC)\b',
                r'\b(?:floor|wall)[- ]mounted\s+(?:toilet|water\s+closet)\b',
            ],
            'lavatory': [
                r'\b(?:lavatory|lav|sink)\b',
                r'\b(?:wall[- ]hung|counter[- ]top)\s+(?:lavatory|sink)\b',
            ],
            'urinal': [
                r'\burinal\b',
                r'\b(?:wall[- ]hung|floor[- ]mounted)\s+urinal\b',
            ],
            'shower': [
                r'\bshower\s+(?:head|stall|enclosure)\b',
                r'\bemergency\s+shower\b',
            ],
            'bathtub': [
                r'\b(?:bathtub|tub)\b',
            ],
            'water_heater': [
                r'\b(?:water\s+heater|tank(?:less)?\s+water\s+heater)\b',
                r'\b(?:gas|electric)\s+water\s+heater\b',
            ],
            'drinking_fountain': [
                r'\bdrinking\s+fountain\b',
                r'\bwater\s+cooler\b',
            ],
        }
        
        # Pipe Material and Size Patterns (IPC Chapter 6)
        self.pipe_patterns = [
            r'\b(?:copper|PVC|CPVC|PEX|cast\s+iron|galvanized)\s+pipe\b',
            r'\b\d+(?:\s*-?\s*\d+/\d+)?"\s+(?:copper|PVC|CPVC|PEX|CI|GI)\b',
            r'\bSchedule\s+(?:40|80)\s+(?:PVC|steel)\b',
            r'\bType\s+[KLM]\s+copper\b',
        ]
        
        # Water Supply Specifications (IPC Chapter 6)
        self.water_supply_patterns = [
            r'\b\d+\s*(?:GPM|gpm)\s+(?:flow|supply)\b',
            r'\b\d+\s*(?:PSI|psi)\s+(?:pressure|supply)\b',
            r'\bwater\s+(?:main|service|supply)\b',
            r'\b(?:hot|cold|domestic)\s+water\s+(?:supply|system)\b',
        ]
        
        # Drainage Patterns (IPC Chapter 7)
        self.drainage_patterns = [
            r'\b(?:sanitary|storm)\s+(?:sewer|drain)\b',
            r'\bfloor\s+drain\b',
            r'\b(?:waste|vent)\s+pipe\b',
            r'\b(?:cleanout|CO)\b',
        ]
        
        # Plumbing Standards
        self.plumbing_standards = [
            r'\bIPC\s+\d{4}\b',  # International Plumbing Code
            r'\bUPC\s+\d{4}\b',  # Uniform Plumbing Code
            r'\bASSE\s+\d+\b',   # American Society of Sanitary Engineering
            r'\bNSF\s+\d+\b',    # NSF International standards
            r'\bASTM\s+[A-Z]\s*\d+\b',  # ASTM plumbing materials
        ]
        
        logger.info("PlumbingAnalyzer initialized with IPC/UPC standards")
    
    def analyze(self, text: str) -> Dict[str, Any]:
        """
        Analyze plumbing specifications from text.
        
        Args:
            text: Document text to analyze
            
        Returns:
            Dictionary with plumbing analysis results
        """
        results = {
            'fixtures': [],
            'piping': [],
            'water_supply': [],
            'drainage': [],
            'standards': [],
            'summary': {}
        }
        
        # Extract fixtures
        for fixture_type, patterns in self.fixture_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    results['fixtures'].append({
                        'type': fixture_type.replace('_', ' ').title(),
                        'mention': match.group(0),
                        'position': match.start()
                    })
        
        # Extract piping specifications
        for pattern in self.pipe_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results['piping'].append(match.group(0))
        
        # Extract water supply specs
        for pattern in self.water_supply_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results['water_supply'].append(match.group(0))
        
        # Extract drainage specs
        for pattern in self.drainage_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                results['drainage'].append(match.group(0))
        
        # Extract standards references
        for pattern in self.plumbing_standards:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                if match.group(0) not in results['standards']:
                    results['standards'].append(match.group(0))
        
        # Generate summary
        results['summary'] = {
            'total_fixtures': len(results['fixtures']),
            'fixture_types': len(set(f['type'] for f in results['fixtures'])),
            'has_piping_specs': len(results['piping']) > 0,
            'has_water_supply_specs': len(results['water_supply']) > 0,
            'has_drainage_specs': len(results['drainage']) > 0,
            'standards_referenced': len(results['standards']),
            'completeness_score': self._calculate_completeness(results)
        }
        
        return results
    
    def _calculate_completeness(self, results: Dict[str, Any]) -> float:
        """Calculate plumbing specification completeness score."""
        criteria = [
            len(results['fixtures']) > 0,
            len(results['piping']) > 0,
            len(results['water_supply']) > 0,
            len(results['drainage']) > 0,
            len(results['standards']) > 0,
        ]
        return (sum(criteria) / len(criteria)) * 100


class MEPAnalyzer:
    """Unified MEP (Mechanical, Electrical, Plumbing) analyzer."""
    
    def __init__(self):
        """Initialize all MEP analyzers."""
        self.hvac_analyzer = HVACAnalyzer()
        self.plumbing_analyzer = PlumbingAnalyzer()
        logger.info("MEPAnalyzer initialized with HVAC and Plumbing modules")
    
    def analyze_mep_systems(self, text: str) -> Dict[str, Any]:
        """
        Analyze MEP systems in construction documents (alias for analyze_document).
        
        Args:
            text: Full document text
            
        Returns:
            Complete MEP analysis results
        """
        return self.analyze_document(text)
    
    def analyze_document(self, text: str) -> Dict[str, Any]:
        """
        Perform comprehensive MEP analysis on document.
        
        Args:
            text: Full document text
            
        Returns:
            Complete MEP analysis results
        """
        return {
            'hvac': self.hvac_analyzer.analyze(text),
            'plumbing': self.plumbing_analyzer.analyze(text),
            'overall_summary': self._generate_overall_summary(text)
        }
    
    def _generate_overall_summary(self, text: str) -> Dict[str, Any]:
        """Generate overall MEP summary."""
        hvac_results = self.hvac_analyzer.analyze(text)
        plumbing_results = self.plumbing_analyzer.analyze(text)
        
        return {
            'has_hvac_specs': hvac_results['summary']['total_equipment'] > 0,
            'has_plumbing_specs': plumbing_results['summary']['total_fixtures'] > 0,
            'hvac_completeness': hvac_results['summary']['completeness_score'],
            'plumbing_completeness': plumbing_results['summary']['completeness_score'],
            'overall_completeness': (
                hvac_results['summary']['completeness_score'] + 
                plumbing_results['summary']['completeness_score']
            ) / 2
        }
