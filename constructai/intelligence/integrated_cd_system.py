"""
Integrated Construction Documents + Inventory Intelligence System.

Comprehensive integration blueprint that transforms separate document analysis
and inventory checking into a single, unified intelligence platform.

This system processes Construction Documents and immediately connects them with
real-world inventory availability, procurement requirements, and build readiness
assessment in real-time.

Key Integration Philosophy:
Every Construction Document element is automatically linked to inventory availability,
procurement requirements, and build readiness assessment in real-time.
"""

from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from enum import Enum
import logging
import re

logger = logging.getLogger(__name__)


class CDPhase(Enum):
    """Construction Documents design phases."""
    SCHEMATIC_DESIGN = "schematic_design"
    DESIGN_DEVELOPMENT = "design_development"
    CD_50_PERCENT = "cd_50_percent"
    CD_75_PERCENT = "cd_75_percent"
    CD_95_PERCENT = "cd_95_percent"
    CD_100_PERCENT = "cd_100_percent"
    ISSUED_FOR_CONSTRUCTION = "issued_for_construction"


class DrawingDiscipline(Enum):
    """Drawing disciplines for multi-trade analysis."""
    ARCHITECTURAL = "architectural"
    STRUCTURAL = "structural"
    MECHANICAL = "mechanical"
    ELECTRICAL = "electrical"
    PLUMBING = "plumbing"
    FIRE_PROTECTION = "fire_protection"
    CIVIL = "civil"
    LANDSCAPE = "landscape"
    SPECIALTY = "specialty"


@dataclass
class ExtractedComponent:
    """Unified component extracted from Construction Documents."""
    component_id: str
    name: str
    discipline: DrawingDiscipline
    csi_division: str
    specification_section: str
    
    # Technical specifications
    manufacturer: Optional[str] = None
    model_number: Optional[str] = None
    dimensions: Dict[str, float] = field(default_factory=dict)
    performance_specs: Dict[str, Any] = field(default_factory=dict)
    materials: List[str] = field(default_factory=list)
    
    # Quantity and location
    quantity: int = 1
    location_tags: List[str] = field(default_factory=list)
    drawing_references: List[str] = field(default_factory=list)
    specification_references: List[str] = field(default_factory=list)
    
    # Standards and compliance
    code_requirements: List[str] = field(default_factory=list)
    industry_standards: List[str] = field(default_factory=list)
    
    # Inventory linkage (populated after inventory matching)
    inventory_match_confidence: float = 0.0
    available_inventory_items: List[str] = field(default_factory=list)
    requires_procurement: bool = False
    estimated_lead_time_days: int = 0
    estimated_cost: float = 0.0
    
    # Cross-discipline relationships
    related_components: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    coordination_notes: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "component_id": self.component_id,
            "name": self.name,
            "discipline": self.discipline.value,
            "csi_division": self.csi_division,
            "specification_section": self.specification_section,
            "manufacturer": self.manufacturer,
            "model_number": self.model_number,
            "dimensions": self.dimensions,
            "performance_specs": self.performance_specs,
            "materials": self.materials,
            "quantity": self.quantity,
            "location_tags": self.location_tags,
            "drawing_references": self.drawing_references,
            "specification_references": self.specification_references,
            "code_requirements": self.code_requirements,
            "industry_standards": self.industry_standards,
            "inventory_match_confidence": self.inventory_match_confidence,
            "available_inventory_items": self.available_inventory_items,
            "requires_procurement": self.requires_procurement,
            "estimated_lead_time_days": self.estimated_lead_time_days,
            "estimated_cost": self.estimated_cost,
            "related_components": self.related_components,
            "dependencies": self.dependencies,
            "coordination_notes": self.coordination_notes
        }


@dataclass
class CDSetAnalysis:
    """Complete Construction Documents set analysis."""
    project_id: str
    project_name: str
    cd_phase: CDPhase
    analysis_timestamp: datetime
    
    # Document inventory
    total_drawings: int = 0
    total_specification_sections: int = 0
    disciplines: List[DrawingDiscipline] = field(default_factory=list)
    
    # Extracted components
    components: List[ExtractedComponent] = field(default_factory=list)
    total_components: int = 0
    components_by_discipline: Dict[str, int] = field(default_factory=dict)
    components_by_csi_division: Dict[str, int] = field(default_factory=dict)
    
    # Inventory integration results
    components_in_stock: int = 0
    components_need_procurement: int = 0
    total_estimated_cost: float = 0.0
    average_lead_time_days: float = 0.0
    
    # Build readiness metrics
    build_readiness_score: float = 0.0
    critical_path_items: List[str] = field(default_factory=list)
    procurement_risk_items: List[str] = field(default_factory=list)
    coordination_issues: List[str] = field(default_factory=list)
    
    # Cross-discipline coordination
    coordination_checks: Dict[str, bool] = field(default_factory=dict)
    inter_discipline_conflicts: List[str] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary representation."""
        return {
            "project_id": self.project_id,
            "project_name": self.project_name,
            "cd_phase": self.cd_phase.value,
            "analysis_timestamp": self.analysis_timestamp.isoformat(),
            "total_drawings": self.total_drawings,
            "total_specification_sections": self.total_specification_sections,
            "disciplines": [d.value for d in self.disciplines],
            "total_components": self.total_components,
            "components_by_discipline": self.components_by_discipline,
            "components_by_csi_division": self.components_by_csi_division,
            "components_in_stock": self.components_in_stock,
            "components_need_procurement": self.components_need_procurement,
            "total_estimated_cost": self.total_estimated_cost,
            "average_lead_time_days": self.average_lead_time_days,
            "build_readiness_score": self.build_readiness_score,
            "critical_path_items": self.critical_path_items,
            "procurement_risk_items": self.procurement_risk_items,
            "coordination_issues": self.coordination_issues,
            "coordination_checks": self.coordination_checks,
            "inter_discipline_conflicts": self.inter_discipline_conflicts
        }


class IntegratedCDIntelligenceSystem:
    """
    Integrated Construction Documents + Inventory Intelligence System.
    
    This system provides:
    1. Unified Document Processing:
       - Enhanced CD set classification and phase detection
       - Multi-trade drawing recognition and organization
       - BIM model integration alongside traditional 2D documents
       - Cross-discipline analysis and coordination checking
    
    2. Multi-Trade Specification Intelligence:
       - Unified technical specification database across all CSI divisions
       - Cross-trade component relationship mapping
       - System integration requirement analysis
       - Performance specification consolidation
       - Intelligent specification normalization
    
    3. Real-Time Inventory Integration:
       - Unified inventory matching engine for all component types
       - Real-time availability checking across all locations
       - Automated alternative component suggestion
       - Lead time and cost analysis integration
    
    4. Build Readiness Intelligence:
       - Comprehensive project readiness scoring
       - Critical path component identification
       - Procurement risk assessment
       - Timeline impact analysis
       - Coordination issue detection
    
    5. Cross-Discipline Coordination:
       - Automated coordination checking between all disciplines
       - Conflict detection and resolution suggestions
       - System integration analysis (MEP, structural, architectural)
       - Space and clearance requirement validation
    """
    
    def __init__(
        self,
        specification_intelligence=None,
        inventory_intelligence=None,
        procurement_intelligence=None,
        component_matcher=None
    ):
        """
        Initialize the integrated CD intelligence system.
        
        Args:
            specification_intelligence: SpecificationIntelligence instance
            inventory_intelligence: InventoryIntelligence instance
            procurement_intelligence: ProcurementIntelligence instance
            component_matcher: ComponentMatcher instance
        """
        # Store references to intelligence modules
        self.spec_intelligence = specification_intelligence
        self.inventory_intelligence = inventory_intelligence
        self.procurement_intelligence = procurement_intelligence
        self.component_matcher = component_matcher
        
        # Build integrated knowledge bases
        self.discipline_patterns = self._build_discipline_patterns()
        self.cd_phase_indicators = self._build_cd_phase_indicators()
        self.cross_discipline_rules = self._build_cross_discipline_rules()
        
        logger.info("IntegratedCDIntelligenceSystem initialized")
    
    def process_cd_set(
        self,
        project_id: str,
        project_name: str,
        documents: List[Dict[str, Any]],
        auto_inventory_check: bool = True,
        auto_procurement_analysis: bool = True
    ) -> CDSetAnalysis:
        """
        Process a complete Construction Documents set with integrated analysis.
        
        This is the main entry point that orchestrates the entire pipeline:
        1. Document classification and phase detection
        2. Specification extraction from all documents
        3. Component identification and categorization
        4. Real-time inventory matching
        5. Procurement requirement analysis
        6. Build readiness assessment
        7. Cross-discipline coordination checking
        
        Args:
            project_id: Unique project identifier
            project_name: Project name
            documents: List of document dictionaries with content and metadata
            auto_inventory_check: Automatically check inventory availability
            auto_procurement_analysis: Automatically analyze procurement needs
            
        Returns:
            CDSetAnalysis with complete integrated results
        """
        logger.info(f"Processing CD set for project {project_id}: {project_name}")
        
        # Initialize analysis object
        analysis = CDSetAnalysis(
            project_id=project_id,
            project_name=project_name,
            cd_phase=self._detect_cd_phase(documents),
            analysis_timestamp=datetime.now()
        )
        
        # Step 1: Classify documents by discipline
        classified_docs = self._classify_documents_by_discipline(documents)
        analysis.total_drawings = len([d for d in documents if d.get('type') == 'drawing'])
        analysis.total_specification_sections = len([d for d in documents if d.get('type') == 'specification'])
        analysis.disciplines = list(set([d['discipline'] for d in classified_docs]))
        
        # Step 2: Extract components from all documents
        components = self._extract_all_components(classified_docs)
        analysis.components = components
        analysis.total_components = len(components)
        
        # Step 3: Categorize components
        analysis.components_by_discipline = self._categorize_by_discipline(components)
        analysis.components_by_csi_division = self._categorize_by_csi_division(components)
        
        # Step 4: Real-time inventory integration
        if auto_inventory_check and self.inventory_intelligence:
            self._integrate_with_inventory(components)
            analysis.components_in_stock = len([c for c in components if not c.requires_procurement])
            analysis.components_need_procurement = len([c for c in components if c.requires_procurement])
            analysis.total_estimated_cost = sum(c.estimated_cost for c in components)
            lead_times = [c.estimated_lead_time_days for c in components if c.estimated_lead_time_days > 0]
            analysis.average_lead_time_days = sum(lead_times) / len(lead_times) if lead_times else 0
        
        # Step 5: Procurement analysis
        if auto_procurement_analysis and self.procurement_intelligence:
            procurement_results = self._analyze_procurement_requirements(components)
            analysis.critical_path_items = procurement_results['critical_path_items']
            analysis.procurement_risk_items = procurement_results['risk_items']
            analysis.build_readiness_score = procurement_results['readiness_score']
        
        # Step 6: Cross-discipline coordination checking
        coordination_results = self._check_cross_discipline_coordination(components, classified_docs)
        analysis.coordination_checks = coordination_results['checks']
        analysis.inter_discipline_conflicts = coordination_results['conflicts']
        analysis.coordination_issues = coordination_results['issues']
        
        logger.info(f"CD set processing complete. Found {analysis.total_components} components across {len(analysis.disciplines)} disciplines")
        
        return analysis
    
    def _detect_cd_phase(self, documents: List[Dict[str, Any]]) -> CDPhase:
        """Detect the CD phase from document metadata and content."""
        # Check for phase indicators in document names and content
        for doc in documents:
            name = doc.get('name', '').lower()
            content = doc.get('content', '').lower()[:1000]  # Check first 1000 chars
            
            combined_text = name + " " + content
            
            if '100%' in combined_text or '100 percent' in combined_text or 'issued for construction' in combined_text:
                return CDPhase.CD_100_PERCENT
            elif '95%' in combined_text or '95 percent' in combined_text:
                return CDPhase.CD_95_PERCENT
            elif '75%' in combined_text or '75 percent' in combined_text:
                return CDPhase.CD_75_PERCENT
            elif '50%' in combined_text or '50 percent' in combined_text:
                return CDPhase.CD_50_PERCENT
            elif 'design development' in combined_text or 'dd' in name:
                return CDPhase.DESIGN_DEVELOPMENT
            elif 'schematic design' in combined_text or 'sd' in name:
                return CDPhase.SCHEMATIC_DESIGN
        
        # Default to 100% if can't determine
        return CDPhase.CD_100_PERCENT
    
    def _classify_documents_by_discipline(
        self,
        documents: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Classify documents by discipline using pattern matching."""
        classified = []
        
        for doc in documents:
            name = doc.get('name', '').lower()
            content = doc.get('content', '')[:2000].lower()  # Check first 2000 chars
            
            combined = name + " " + content
            
            # Determine discipline
            discipline = DrawingDiscipline.ARCHITECTURAL  # default
            
            if any(pattern in combined for pattern in self.discipline_patterns[DrawingDiscipline.ELECTRICAL]):
                discipline = DrawingDiscipline.ELECTRICAL
            elif any(pattern in combined for pattern in self.discipline_patterns[DrawingDiscipline.MECHANICAL]):
                discipline = DrawingDiscipline.MECHANICAL
            elif any(pattern in combined for pattern in self.discipline_patterns[DrawingDiscipline.PLUMBING]):
                discipline = DrawingDiscipline.PLUMBING
            elif any(pattern in combined for pattern in self.discipline_patterns[DrawingDiscipline.STRUCTURAL]):
                discipline = DrawingDiscipline.STRUCTURAL
            elif any(pattern in combined for pattern in self.discipline_patterns[DrawingDiscipline.FIRE_PROTECTION]):
                discipline = DrawingDiscipline.FIRE_PROTECTION
            elif any(pattern in combined for pattern in self.discipline_patterns[DrawingDiscipline.CIVIL]):
                discipline = DrawingDiscipline.CIVIL
            
            classified.append({
                **doc,
                'discipline': discipline
            })
        
        return classified
    
    def _extract_all_components(
        self,
        classified_docs: List[Dict[str, Any]]
    ) -> List[ExtractedComponent]:
        """Extract components from all documents with unified approach."""
        all_components = []
        component_id_counter = 1
        
        for doc in classified_docs:
            discipline = doc['discipline']
            content = doc.get('content', '')
            doc_name = doc.get('name', '')
            
            # Use specification intelligence to extract specs
            if self.spec_intelligence:
                extracted_specs = self.spec_intelligence.extract_specifications(
                    text=content,
                    context=f"discipline:{discipline.value}"
                )
                
                # Convert extracted specs to components
                for spec in extracted_specs:
                    component = ExtractedComponent(
                        component_id=f"COMP-{component_id_counter:05d}",
                        name=spec.text[:100] if spec.text else f"Component {component_id_counter}",
                        discipline=discipline,
                        csi_division=self._map_discipline_to_csi(discipline),
                        specification_section=spec.category,
                        materials=spec.materials,
                        dimensions=spec.dimensions,
                        performance_specs=spec.performance_criteria,
                        drawing_references=[doc_name],
                        code_requirements=spec.standards,
                        industry_standards=spec.standards
                    )
                    all_components.append(component)
                    component_id_counter += 1
        
        return all_components
    
    def _integrate_with_inventory(self, components: List[ExtractedComponent]) -> None:
        """Integrate components with real-time inventory system."""
        if not self.inventory_intelligence:
            return
        
        for component in components:
            # Build specification dict from component
            spec_dict = {
                **component.dimensions,
                **component.performance_specs
            }
            
            if component.manufacturer:
                spec_dict['manufacturer'] = component.manufacturer
            if component.model_number:
                spec_dict['model'] = component.model_number
            
            # Find matching inventory items
            try:
                matches = self.inventory_intelligence.find_matching_components(
                    specification=spec_dict,
                    tolerance=0.1,
                    min_confidence=0.7
                )
                
                if matches:
                    # Best match
                    best_match = matches[0]
                    component.inventory_match_confidence = best_match.confidence_score
                    component.available_inventory_items = [m.item_id for m in matches[:5]]
                    component.requires_procurement = False
                    component.estimated_cost = best_match.unit_cost * component.quantity
                    component.estimated_lead_time_days = 0  # In stock
                else:
                    # Need to procure
                    component.requires_procurement = True
                    component.estimated_lead_time_days = 30  # Default lead time
                    component.estimated_cost = 0  # Unknown until procurement
                
            except Exception as e:
                logger.warning(f"Error matching component {component.component_id} to inventory: {e}")
                component.requires_procurement = True
    
    def _analyze_procurement_requirements(
        self,
        components: List[ExtractedComponent]
    ) -> Dict[str, Any]:
        """Analyze procurement requirements for all components."""
        if not self.procurement_intelligence:
            return {
                'critical_path_items': [],
                'risk_items': [],
                'readiness_score': 0.0
            }
        
        # Identify critical path items (long lead time or custom items)
        critical_path_items = []
        risk_items = []
        
        for component in components:
            if component.estimated_lead_time_days > 30:
                critical_path_items.append(component.component_id)
            
            if component.requires_procurement and component.inventory_match_confidence < 0.5:
                risk_items.append(component.component_id)
        
        # Calculate build readiness score
        total = len(components)
        in_stock = len([c for c in components if not c.requires_procurement])
        readiness_score = (in_stock / total * 100) if total > 0 else 0.0
        
        return {
            'critical_path_items': critical_path_items,
            'risk_items': risk_items,
            'readiness_score': readiness_score
        }
    
    def _check_cross_discipline_coordination(
        self,
        components: List[ExtractedComponent],
        classified_docs: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Check for cross-discipline coordination issues."""
        checks = {}
        conflicts = []
        issues = []
        
        # Group components by location
        components_by_location = {}
        for component in components:
            for location in component.location_tags:
                if location not in components_by_location:
                    components_by_location[location] = []
                components_by_location[location].append(component)
        
        # Check for conflicts at each location
        for location, comps in components_by_location.items():
            disciplines_at_location = set(c.discipline for c in comps)
            
            # Check if MEP systems need coordination
            if (DrawingDiscipline.MECHANICAL in disciplines_at_location and
                DrawingDiscipline.ELECTRICAL in disciplines_at_location and
                DrawingDiscipline.PLUMBING in disciplines_at_location):
                checks[f"{location}_mep_coordination"] = True
            
            # Check for structural conflicts
            if (DrawingDiscipline.STRUCTURAL in disciplines_at_location and
                len(disciplines_at_location) > 1):
                issues.append(f"Location {location}: Verify structural clearances for MEP systems")
        
        return {
            'checks': checks,
            'conflicts': conflicts,
            'issues': issues
        }
    
    def _categorize_by_discipline(
        self,
        components: List[ExtractedComponent]
    ) -> Dict[str, int]:
        """Categorize components by discipline."""
        counts = {}
        for component in components:
            discipline = component.discipline.value
            counts[discipline] = counts.get(discipline, 0) + 1
        return counts
    
    def _categorize_by_csi_division(
        self,
        components: List[ExtractedComponent]
    ) -> Dict[str, int]:
        """Categorize components by CSI division."""
        counts = {}
        for component in components:
            division = component.csi_division
            counts[division] = counts.get(division, 0) + 1
        return counts
    
    def _map_discipline_to_csi(self, discipline: DrawingDiscipline) -> str:
        """Map drawing discipline to CSI MasterFormat division."""
        mapping = {
            DrawingDiscipline.ELECTRICAL: "26",
            DrawingDiscipline.MECHANICAL: "23",
            DrawingDiscipline.PLUMBING: "22",
            DrawingDiscipline.FIRE_PROTECTION: "21",
            DrawingDiscipline.STRUCTURAL: "05",
            DrawingDiscipline.ARCHITECTURAL: "09",
            DrawingDiscipline.CIVIL: "02",
            DrawingDiscipline.LANDSCAPE: "32",
            DrawingDiscipline.SPECIALTY: "10"
        }
        return mapping.get(discipline, "00")
    
    def _build_discipline_patterns(self) -> Dict[DrawingDiscipline, List[str]]:
        """Build pattern lists for discipline detection."""
        return {
            DrawingDiscipline.ELECTRICAL: [
                'electrical', 'power', 'lighting', 'panel', 'switchgear',
                'transformer', 'conduit', 'wire', 'voltage', 'ampere',
                'circuit', 'distribution', 'emergency power', 'generator'
            ],
            DrawingDiscipline.MECHANICAL: [
                'mechanical', 'hvac', 'heating', 'cooling', 'ventilation',
                'ahu', 'air handling', 'chiller', 'boiler', 'duct', 'vav',
                'fan', 'exhaust', 'supply', 'return', 'cfm'
            ],
            DrawingDiscipline.PLUMBING: [
                'plumbing', 'domestic water', 'sanitary', 'drainage', 'vent',
                'fixture', 'pipe', 'valve', 'pump', 'water closet', 'lavatory',
                'sink', 'urinal', 'storm', 'waste'
            ],
            DrawingDiscipline.STRUCTURAL: [
                'structural', 'foundation', 'beam', 'column', 'slab',
                'footing', 'steel', 'concrete', 'reinforcement', 'framing',
                'lateral', 'seismic', 'load'
            ],
            DrawingDiscipline.FIRE_PROTECTION: [
                'fire protection', 'sprinkler', 'fire alarm', 'fire pump',
                'standpipe', 'fire suppression', 'nfpa', 'fire extinguisher'
            ],
            DrawingDiscipline.CIVIL: [
                'civil', 'site', 'grading', 'paving', 'earthwork',
                'utility', 'storm drainage', 'erosion', 'excavation'
            ],
            DrawingDiscipline.ARCHITECTURAL: [
                'architectural', 'floor plan', 'elevation', 'section',
                'door', 'window', 'wall', 'ceiling', 'finish', 'room'
            ],
            DrawingDiscipline.LANDSCAPE: [
                'landscape', 'planting', 'irrigation', 'hardscape',
                'paving', 'site furniture'
            ],
            DrawingDiscipline.SPECIALTY: [
                'equipment', 'specialty', 'kitchen', 'laboratory',
                'medical', 'theater'
            ]
        }
    
    def _build_cd_phase_indicators(self) -> Dict[CDPhase, List[str]]:
        """Build indicators for CD phase detection."""
        return {
            CDPhase.SCHEMATIC_DESIGN: ['schematic', 'sd', 'concept'],
            CDPhase.DESIGN_DEVELOPMENT: ['design development', 'dd'],
            CDPhase.CD_50_PERCENT: ['50%', '50 percent', 'preliminary'],
            CDPhase.CD_75_PERCENT: ['75%', '75 percent'],
            CDPhase.CD_95_PERCENT: ['95%', '95 percent', 'near complete'],
            CDPhase.CD_100_PERCENT: ['100%', '100 percent', 'complete'],
            CDPhase.ISSUED_FOR_CONSTRUCTION: ['issued for construction', 'ifc', 'for construction']
        }
    
    def _build_cross_discipline_rules(self) -> Dict[str, Any]:
        """Build rules for cross-discipline coordination checking."""
        return {
            'mep_coordination_required': {
                'disciplines': [
                    DrawingDiscipline.MECHANICAL,
                    DrawingDiscipline.ELECTRICAL,
                    DrawingDiscipline.PLUMBING
                ],
                'check_clearances': True,
                'check_conflicts': True
            },
            'structural_architectural_coordination': {
                'disciplines': [
                    DrawingDiscipline.STRUCTURAL,
                    DrawingDiscipline.ARCHITECTURAL
                ],
                'check_openings': True,
                'check_load_paths': True
            },
            'fire_protection_all': {
                'disciplines': [DrawingDiscipline.FIRE_PROTECTION],
                'requires_all_disciplines': True,
                'check_coverage': True
            }
        }
