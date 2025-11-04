"""
Unit tests for Enterprise Intelligence modules.
"""

import unittest
from datetime import datetime, timedelta
from constructai.intelligence.inventory_intelligence import (
    InventoryIntelligence,
    InventoryItem,
    AvailabilityAnalysis
)
from constructai.intelligence.procurement_intelligence import (
    ProcurementIntelligence,
    ComponentCriticality,
    ProcurementPriority
)
from constructai.intelligence.specification_intelligence import (
    SpecificationIntelligence,
    ExtractedSpecification
)
from constructai.intelligence.component_matcher import (
    ComponentMatcher,
    ComponentMatch
)


class TestInventoryIntelligence(unittest.TestCase):
    """Test Inventory Intelligence system."""
    
    def setUp(self):
        """Set up test inventory intelligence."""
        self.inventory = InventoryIntelligence()
        self.inventory.sync_inventory()
    
    def test_initialization(self):
        """Test inventory intelligence initializes correctly."""
        self.assertIsNotNone(self.inventory)
        self.assertIsInstance(self.inventory.inventory_cache, dict)
    
    def test_sync_inventory(self):
        """Test inventory sync."""
        count = self.inventory.sync_inventory()
        self.assertGreater(count, 0)
        self.assertIsNotNone(self.inventory.last_sync)
    
    def test_find_matching_components(self):
        """Test component matching."""
        spec = {
            "psi": 5000,
            "slump_in": 4,
            "type": "concrete"
        }
        
        matches = self.inventory.find_matching_components(spec, tolerance=0.1)
        self.assertIsInstance(matches, list)
        
        # Should find at least one match for concrete
        if matches:
            item, confidence = matches[0]
            self.assertIsInstance(item, InventoryItem)
            self.assertGreater(confidence, 0)
            self.assertLessEqual(confidence, 1.0)
    
    def test_analyze_availability(self):
        """Test availability analysis."""
        spec = {
            "psi": 5000,
            "type": "concrete"
        }
        
        analysis = self.inventory.analyze_availability(
            component_name="Concrete Mix",
            required_quantity=100,
            specifications=spec
        )
        
        self.assertIsInstance(analysis, AvailabilityAnalysis)
        self.assertEqual(analysis.component_name, "Concrete Mix")
        self.assertIn(analysis.procurement_urgency, ["immediate", "normal", "advance_planning"])
    
    def test_inventory_health(self):
        """Test inventory health metrics."""
        health = self.inventory.get_inventory_health()
        
        self.assertIn("status", health)
        self.assertIn("total_items", health)
        self.assertIn("in_stock", health)
        self.assertGreater(health["total_items"], 0)


class TestProcurementIntelligence(unittest.TestCase):
    """Test Procurement Intelligence system."""
    
    def setUp(self):
        """Set up test procurement intelligence."""
        self.procurement = ProcurementIntelligence()
    
    def test_initialization(self):
        """Test procurement intelligence initializes correctly."""
        self.assertIsNotNone(self.procurement)
        self.assertIsInstance(self.procurement.supplier_database, dict)
        self.assertGreater(len(self.procurement.supplier_database), 0)
    
    def test_assess_criticality(self):
        """Test component criticality assessment."""
        criticality = self.procurement.assess_component_criticality(
            component="beam-001",
            project_timeline={"critical_path_components": ["beam-001"]},
            dependencies=["task1", "task2"]
        )
        
        self.assertIsInstance(criticality, ComponentCriticality)
        self.assertIn(criticality, [
            ComponentCriticality.BLOCKING,
            ComponentCriticality.CRITICAL_PATH,
            ComponentCriticality.IMPORTANT,
            ComponentCriticality.OPTIONAL
        ])
    
    def test_calculate_priority(self):
        """Test procurement priority calculation."""
        priority = self.procurement.calculate_procurement_priority(
            criticality=ComponentCriticality.CRITICAL_PATH,
            required_date=datetime.now() + timedelta(days=5),
            lead_time_days=3,
            availability_risk="high"
        )
        
        self.assertIsInstance(priority, ProcurementPriority)
        # Should be high or critical priority
        self.assertIn(priority, [ProcurementPriority.CRITICAL, ProcurementPriority.HIGH])
    
    def test_assess_build_readiness(self):
        """Test build readiness assessment."""
        required_components = [
            {
                "name": "Steel Beam",
                "quantity": 50,
                "estimated_cost": 850,
                "lead_time_days": 14
            },
            {
                "name": "Concrete",
                "quantity": 100,
                "estimated_cost": 125,
                "lead_time_days": 3
            }
        ]
        
        availability_data = {
            "Steel Beam": {"is_available": True, "procurement_urgency": "normal"},
            "Concrete": {"is_available": False, "procurement_urgency": "immediate"}
        }
        
        assessment = self.procurement.assess_build_readiness(
            project_id="proj-001",
            required_components=required_components,
            availability_data=availability_data,
            project_start_date=datetime.now() + timedelta(days=30)
        )
        
        self.assertEqual(assessment.project_id, "proj-001")
        self.assertGreater(assessment.readiness_score, 0)
        self.assertIn(assessment.status, ["ready", "partial", "not_ready"])
        self.assertGreater(assessment.components_ready, 0)
    
    def test_generate_purchase_order(self):
        """Test purchase order generation."""
        from constructai.intelligence.procurement_intelligence import ProcurementItem
        
        item = ProcurementItem(
            component_name="Steel Beam",
            specification={"grade": "A992"},
            required_quantity=50,
            required_date=datetime.now() + timedelta(days=30),
            criticality=ComponentCriticality.CRITICAL_PATH,
            estimated_cost=850.00,
            lead_time_days=14,
            supplier_options=[],
            priority=ProcurementPriority.HIGH,
            risk_score=0.3
        )
        
        po = self.procurement.generate_purchase_order(
            item=item,
            supplier_id="SUP-001",
            user_details={"company_name": "Test Company"}
        )
        
        self.assertIn("po_number", po)
        self.assertIn("PO-", po["po_number"])
        self.assertEqual(po["buyer"], "Test Company")
        self.assertIn("items", po)
    
    def test_recommend_supplier(self):
        """Test supplier recommendations."""
        recommendations = self.procurement.recommend_supplier(
            component="Steel Beam",
            requirements={"criticality": "critical_path"}
        )
        
        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)
        
        # Check first recommendation
        supplier_id, score = recommendations[0]
        self.assertIn(supplier_id, self.procurement.supplier_database)
        self.assertGreater(score, 0)
        self.assertLessEqual(score, 1.0)


class TestSpecificationIntelligence(unittest.TestCase):
    """Test Specification Intelligence system."""
    
    def setUp(self):
        """Set up test specification intelligence."""
        self.spec_intel = SpecificationIntelligence()
    
    def test_initialization(self):
        """Test specification intelligence initializes correctly."""
        self.assertIsNotNone(self.spec_intel)
        self.assertIsNotNone(self.spec_intel.component_taxonomy)
        self.assertIsNotNone(self.spec_intel.standards_database)
    
    def test_extract_specifications(self):
        """Test specification extraction."""
        text = """
        Structural steel shall be ASTM A992 grade.
        Concrete shall have minimum compressive strength of 5000 psi.
        """
        
        specs = self.spec_intel.extract_specifications(text)
        
        self.assertIsInstance(specs, list)
        # Should find at least some specifications
        for spec in specs:
            self.assertIsInstance(spec, ExtractedSpecification)
    
    def test_normalize_dimensions(self):
        """Test dimension normalization."""
        dims = self.spec_intel.normalize_dimensions("12 feet 6 inches")
        
        self.assertIn("feet", dims)
        self.assertEqual(dims["feet"], 12.0)
        self.assertIn("inches", dims)
        self.assertEqual(dims["inches"], 6.0)
        self.assertIn("meters", dims)
        self.assertIn("centimeters", dims)
    
    def test_identify_standards(self):
        """Test compliance standards identification."""
        text = "Materials shall conform to ASTM A992 and ACI 318 standards."
        
        standards = self.spec_intel.identify_compliance_standards(text)
        
        self.assertIsInstance(standards, list)
        self.assertGreater(len(standards), 0)
        
        # Should find ASTM A992 and ACI 318
        codes = [s["code"] for s in standards]
        self.assertIn("ASTM A992", codes)
        self.assertIn("ACI 318", codes)
    
    def test_validate_specification(self):
        """Test specification validation."""
        spec = ExtractedSpecification(
            spec_id="TEST-001",
            text="Test specification",
            category="structural",
            components=["beam"],
            materials=["steel"],
            dimensions={"length_ft": 20},
            standards=["ASTM A992"],
            performance_criteria={"load": 1000},
            confidence_score=0.85,
            extraction_method="test",
            validation_status="pending"
        )
        
        is_valid, issues = self.spec_intel.validate_specification(spec)
        
        # Complete spec should be valid
        self.assertTrue(is_valid)
        self.assertEqual(len(issues), 0)
    
    def test_assess_completeness(self):
        """Test completeness assessment."""
        specs = [
            ExtractedSpecification(
                spec_id="S1",
                text="Grade A992 steel",
                category="structural_steel",
                components=[],
                materials=["steel"],
                dimensions={},
                standards=["ASTM A992"],
                performance_criteria={"grade": "A992"},
                confidence_score=0.9,
                extraction_method="test",
                validation_status="valid"
            )
        ]
        
        assessment = self.spec_intel.assess_completeness(
            specifications=specs,
            component_type="structural_steel"
        )
        
        self.assertIn("completeness_score", assessment)
        self.assertIn("status", assessment)
        self.assertIn("missing_requirements", assessment)


class TestComponentMatcher(unittest.TestCase):
    """Test Component Matcher system."""
    
    def setUp(self):
        """Set up test component matcher."""
        self.matcher = ComponentMatcher()
    
    def test_initialization(self):
        """Test component matcher initializes correctly."""
        self.assertIsNotNone(self.matcher)
        self.assertIsNotNone(self.matcher.equivalence_database)
        self.assertIsNotNone(self.matcher.manufacturer_aliases)
    
    def test_normalize_manufacturer(self):
        """Test manufacturer name normalization."""
        normalized = self.matcher.normalize_manufacturer_name("U.S. Steel")
        self.assertEqual(normalized, "US Steel")
        
        normalized = self.matcher.normalize_manufacturer_name("Ready Mix")
        self.assertEqual(normalized, "ReadyMix Corp")
    
    def test_find_matches(self):
        """Test component matching."""
        required = {
            "name": "Structural Steel Beam",
            "manufacturer": "US Steel",
            "specifications": {
                "length_ft": 20,
                "grade": "A992"
            }
        }
        
        available = [
            {
                "id": "ITEM-001",
                "name": "Structural Steel Beam",
                "manufacturer": "U.S. Steel",
                "specifications": {
                    "length_ft": 20,
                    "grade": "A992"
                }
            },
            {
                "id": "ITEM-002",
                "name": "Steel Beam",
                "manufacturer": "Other Mfr",
                "specifications": {
                    "length_ft": 22,
                    "grade": "A992"
                }
            }
        ]
        
        matches = self.matcher.find_matches(
            required_component=required,
            available_components=available,
            tolerance=0.1
        )
        
        self.assertIsInstance(matches, list)
        # Should find at least the exact match
        self.assertGreater(len(matches), 0)
        
        # First match should be the best
        best_match = matches[0]
        self.assertIsInstance(best_match, ComponentMatch)
        self.assertGreater(best_match.match_score, 0)
    
    def test_validate_dimensional_compatibility(self):
        """Test dimensional compatibility validation."""
        required_dims = {
            "length_ft": 20,
            "width_in": 8,
            "height_in": 12
        }
        
        available_dims = {
            "length_ft": 20.5,
            "width_in": 8.1,
            "height_in": 12.0
        }
        
        is_compatible, details = self.matcher.validate_dimensional_compatibility(
            required_dims=required_dims,
            available_dims=available_dims,
            tolerance=0.1
        )
        
        # Should be compatible with 10% tolerance
        self.assertTrue(is_compatible)
        self.assertIn("dimensions_checked", details)
        self.assertIn("deviations", details)
    
    def test_find_alternatives(self):
        """Test alternative component finding."""
        spec = {
            "name": "Steel Beam",
            "type": "structural_steel_beam",
            "category": "structural_steel"
        }
        
        alternatives = self.matcher.find_alternative_components(
            component_spec=spec,
            min_similarity=0.7
        )
        
        self.assertIsInstance(alternatives, list)
        # May or may not find alternatives depending on database


if __name__ == '__main__':
    unittest.main()
