"""
Unit tests for AI modules (risk predictor, cost estimator, recommender).
"""

import unittest
from constructai.ai.risk_predictor import RiskPredictor
from constructai.ai.cost_estimator import CostEstimator
from constructai.ai.recommender import RecommendationEngine


class TestRiskPredictor(unittest.TestCase):
    """Test RiskPredictor functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.predictor = RiskPredictor()
        self.sample_project = {
            "name": "Test Construction Project",
            "budget": 1000000,
            "duration_days": 180,
            "tasks": [
                {"id": "T1", "name": "Foundation", "dependencies": []},
                {"id": "T2", "name": "Framing", "dependencies": ["T1"]},
                {"id": "T3", "name": "Roofing", "dependencies": ["T2"]},
            ],
            "resources": [
                {"id": "R1", "type": "labor", "quantity": 10},
                {"id": "R2", "type": "material", "quantity": 100},
            ]
        }
    
    def test_predict_risks(self):
        """Test risk prediction returns results."""
        risks = self.predictor.predict_risks(self.sample_project)
        self.assertIsInstance(risks, list)
        # Should have at least some risks identified
        self.assertGreater(len(risks), 0)
    
    def test_risk_structure(self):
        """Test risk objects have required fields."""
        risks = self.predictor.predict_risks(self.sample_project)
        
        for risk in risks:
            self.assertIn("category", risk)
            self.assertIn("probability", risk)
            self.assertIn("impact", risk)
            self.assertIn("description", risk)
            self.assertIn("mitigation", risk)
    
    def test_high_risk_project(self):
        """Test high-risk project identification."""
        high_risk_project = {
            **self.sample_project,
            "duration_days": 30,  # Very tight deadline
            "tasks": [
                {"id": "T1", "name": "Task", "dependencies": [f"T{i}" for i in range(2, 10)]}
                for _ in range(20)
            ]  # Complex dependencies
        }
        
        risks = self.predictor.predict_risks(high_risk_project)
        # Should identify multiple risks
        self.assertGreater(len(risks), len(self.predictor.predict_risks(self.sample_project)))


class TestCostEstimator(unittest.TestCase):
    """Test CostEstimator functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.estimator = CostEstimator()
        self.sample_project = {
            "tasks": [
                {"id": "T1", "name": "Foundation", "resources": ["R1", "R2"]},
                {"id": "T2", "name": "Framing", "resources": ["R1", "R3"]},
            ],
            "resources": [
                {"id": "R1", "type": "labor", "quantity": 10, "skill_level": "skilled"},
                {"id": "R2", "type": "material", "quantity": 100, "cost_per_unit": 150},
                {"id": "R3", "type": "equipment", "quantity": 1, "cost_per_unit": 500},
            ],
            "duration_days": 90,
            "project_type": "residential"
        }
    
    def test_estimate_cost(self):
        """Test cost estimation returns results."""
        estimate = self.estimator.estimate_cost(self.sample_project)
        
        self.assertIsInstance(estimate, dict)
        self.assertIn("total_estimated_cost", estimate)
        self.assertIn("breakdown", estimate)
        self.assertIn("confidence_level", estimate)
    
    def test_cost_breakdown(self):
        """Test cost breakdown has all components."""
        estimate = self.estimator.estimate_cost(self.sample_project)
        breakdown = estimate["breakdown"]
        
        required_components = ["labor", "materials", "equipment", "overhead", "profit", "contingency"]
        for component in required_components:
            self.assertIn(component, breakdown)
            self.assertIsInstance(breakdown[component], (int, float))
            self.assertGreaterEqual(breakdown[component], 0)
    
    def test_confidence_level(self):
        """Test confidence level is in valid range."""
        estimate = self.estimator.estimate_cost(self.sample_project)
        confidence = estimate["confidence_level"]
        
        self.assertGreaterEqual(confidence, 0.0)
        self.assertLessEqual(confidence, 1.0)
    
    def test_larger_project_higher_confidence(self):
        """Test larger projects with more detail have higher confidence."""
        large_project = {
            **self.sample_project,
            "tasks": [{"id": f"T{i}", "name": f"Task {i}"} for i in range(20)],
            "resources": [{"id": f"R{i}", "type": "labor"} for i in range(10)]
        }
        
        small_estimate = self.estimator.estimate_cost(self.sample_project)
        large_estimate = self.estimator.estimate_cost(large_project)
        
        self.assertGreaterEqual(
            large_estimate["confidence_level"],
            small_estimate["confidence_level"]
        )


class TestRecommendationEngine(unittest.TestCase):
    """Test RecommendationEngine functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.engine = RecommendationEngine()
        self.sample_project = {
            "name": "Test Project",
            "budget": 2000000,
            "duration_days": 200,
            "tasks": [
                {"id": "T1", "name": "Foundation Work", "dependencies": []},
                {"id": "T2", "name": "Structural Framing", "dependencies": ["T1"]},
            ] * 10,  # 20 tasks
            "resources": [
                {"id": "R1", "type": "labor", "quantity": 15},
                {"id": "R2", "type": "material", "quantity": 200},
            ] * 5  # 10 resources
        }
    
    def test_generate_recommendations(self):
        """Test recommendation generation."""
        recommendations = self.engine.generate_recommendations(self.sample_project)
        
        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)
    
    def test_recommendation_structure(self):
        """Test recommendation objects have required fields."""
        recommendations = self.engine.generate_recommendations(self.sample_project)
        
        for rec in recommendations:
            self.assertIn("category", rec)
            self.assertIn("name", rec)
            self.assertIn("description", rec)
            self.assertIn("benefit", rec)
            self.assertIn("priority", rec)
            self.assertIn("implementation_steps", rec)
    
    def test_priority_ordering(self):
        """Test recommendations are ordered by priority."""
        recommendations = self.engine.generate_recommendations(self.sample_project)
        
        # Check that priorities are in descending order
        for i in range(len(recommendations) - 1):
            self.assertGreaterEqual(
                recommendations[i].get("priority", 0),
                recommendations[i + 1].get("priority", 0)
            )
    
    def test_implementation_steps(self):
        """Test implementation steps are provided."""
        recommendations = self.engine.generate_recommendations(self.sample_project)
        
        for rec in recommendations:
            steps = rec.get("implementation_steps", [])
            self.assertIsInstance(steps, list)
            self.assertGreater(len(steps), 0)
    
    def test_with_analysis_results(self):
        """Test recommendations with audit/optimization context."""
        analysis_results = {
            "audit": {
                "overall_score": 65,  # Low score
                "risks": [{"severity": "high"}]
            }
        }
        
        recommendations = self.engine.generate_recommendations(
            self.sample_project,
            analysis_results
        )
        
        # Should generate recommendations
        self.assertGreater(len(recommendations), 0)


if __name__ == '__main__':
    unittest.main()
