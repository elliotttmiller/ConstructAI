"""
Advanced Component Matching Engine for Inventory Intelligence.

Provides fuzzy matching, alternative component identification,
and compatibility validation for construction components.
"""

from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)


@dataclass
class ComponentMatch:
    """Represents a component match with scoring."""
    component_id: str
    component_name: str
    match_score: float
    match_type: str  # "exact", "fuzzy", "alternative"
    compatibility: Dict[str, bool]
    differences: List[str]
    recommendations: List[str]


class ComponentMatcher:
    """
    Advanced Component Matching Engine.
    
    Provides:
    - Fuzzy matching for manufacturer and model variations
    - Dimensional requirement validation with tolerances
    - Specification compliance checking
    - Alternative component identification
    - Compatibility validation
    """
    
    def __init__(self):
        """Initialize component matcher."""
        self.equivalence_database = self._build_equivalence_database()
        self.manufacturer_aliases = self._build_manufacturer_aliases()
        
    def find_matches(
        self,
        required_component: Dict[str, Any],
        available_components: List[Dict[str, Any]],
        tolerance: float = 0.1,
        include_alternatives: bool = True
    ) -> List[ComponentMatch]:
        """
        Find matching components from available inventory.
        
        Args:
            required_component: Required component specification
            available_components: List of available components
            tolerance: Acceptable deviation for numeric values
            include_alternatives: Whether to include alternative matches
            
        Returns:
            List of component matches sorted by score
        """
        matches = []
        
        for component in available_components:
            match_score, match_type = self._calculate_match_score(
                required_component,
                component,
                tolerance
            )
            
            if match_score > 0:
                compatibility = self._check_compatibility(required_component, component)
                differences = self._identify_differences(required_component, component)
                recommendations = self._generate_recommendations(differences, compatibility)
                
                matches.append(ComponentMatch(
                    component_id=component.get("id", ""),
                    component_name=component.get("name", ""),
                    match_score=match_score,
                    match_type=match_type,
                    compatibility=compatibility,
                    differences=differences,
                    recommendations=recommendations
                ))
        
        # Sort by match score (descending)
        matches.sort(key=lambda x: x.match_score, reverse=True)
        
        # Add alternatives if requested
        if include_alternatives:
            alternatives = self._find_alternatives(required_component, matches)
            matches.extend(alternatives)
        
        logger.info(f"Found {len(matches)} component matches")
        return matches
    
    def validate_dimensional_compatibility(
        self,
        required_dims: Dict[str, float],
        available_dims: Dict[str, float],
        tolerance: float = 0.1
    ) -> Tuple[bool, Dict[str, Any]]:
        """
        Validate dimensional compatibility with tolerance.
        
        Args:
            required_dims: Required dimensions
            available_dims: Available component dimensions
            tolerance: Acceptable deviation (default 10%)
            
        Returns:
            Tuple of (is_compatible, analysis_details)
        """
        is_compatible = True
        details = {
            "dimensions_checked": 0,
            "dimensions_compatible": 0,
            "deviations": {}
        }
        
        for dim_name, required_value in required_dims.items():
            if dim_name not in available_dims:
                is_compatible = False
                details["deviations"][dim_name] = {
                    "status": "missing",
                    "required": required_value,
                    "available": None
                }
                continue
            
            available_value = available_dims[dim_name]
            details["dimensions_checked"] += 1
            
            # Calculate deviation
            if required_value != 0:
                deviation = abs(available_value - required_value) / required_value
            else:
                deviation = 0 if available_value == 0 else 1.0
            
            if deviation <= tolerance:
                details["dimensions_compatible"] += 1
                details["deviations"][dim_name] = {
                    "status": "compatible",
                    "required": required_value,
                    "available": available_value,
                    "deviation_pct": deviation * 100
                }
            else:
                is_compatible = False
                details["deviations"][dim_name] = {
                    "status": "incompatible",
                    "required": required_value,
                    "available": available_value,
                    "deviation_pct": deviation * 100,
                    "exceeds_tolerance": True
                }
        
        return is_compatible, details
    
    def find_alternative_components(
        self,
        component_spec: Dict[str, Any],
        min_similarity: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Find alternative components that could substitute.
        
        Args:
            component_spec: Component specification
            min_similarity: Minimum similarity threshold
            
        Returns:
            List of alternative components
        """
        alternatives = []
        
        component_type = component_spec.get("type", "")
        
        # Check equivalence database
        if component_type in self.equivalence_database:
            equivalents = self.equivalence_database[component_type]
            
            for equiv in equivalents:
                similarity = self._calculate_similarity(component_spec, equiv)
                
                if similarity >= min_similarity:
                    alternatives.append({
                        **equiv,
                        "similarity_score": similarity,
                        "substitution_notes": self._generate_substitution_notes(
                            component_spec,
                            equiv
                        )
                    })
        
        # Sort by similarity
        alternatives.sort(key=lambda x: x.get("similarity_score", 0), reverse=True)
        
        return alternatives
    
    def normalize_manufacturer_name(self, manufacturer: str) -> str:
        """
        Normalize manufacturer name using aliases database.
        
        Args:
            manufacturer: Raw manufacturer name
            
        Returns:
            Normalized manufacturer name
        """
        manufacturer_lower = manufacturer.lower().strip()
        
        for canonical, aliases in self.manufacturer_aliases.items():
            if manufacturer_lower in [a.lower() for a in aliases]:
                return canonical
        
        return manufacturer
    
    def _calculate_match_score(
        self,
        required: Dict[str, Any],
        available: Dict[str, Any],
        tolerance: float
    ) -> Tuple[float, str]:
        """Calculate match score between required and available component."""
        score = 0.0
        match_type = "none"
        
        # Check exact name match
        if required.get("name", "").lower() == available.get("name", "").lower():
            score += 0.4
            match_type = "exact"
        # Check fuzzy name match
        elif self._fuzzy_name_match(required.get("name", ""), available.get("name", "")):
            score += 0.3
            match_type = "fuzzy"
        else:
            return 0.0, "none"
        
        # Check manufacturer match
        req_mfr = self.normalize_manufacturer_name(required.get("manufacturer", ""))
        avail_mfr = self.normalize_manufacturer_name(available.get("manufacturer", ""))
        
        if req_mfr == avail_mfr:
            score += 0.2
        
        # Check specifications match
        req_specs = required.get("specifications", {})
        avail_specs = available.get("specifications", {})
        
        if req_specs and avail_specs:
            spec_matches = 0
            total_specs = len(req_specs)
            
            for key, value in req_specs.items():
                if key in avail_specs:
                    avail_value = avail_specs[key]
                    
                    if isinstance(value, (int, float)) and isinstance(avail_value, (int, float)):
                        if value != 0:
                            deviation = abs(avail_value - value) / value
                            if deviation <= tolerance:
                                spec_matches += 1
                    elif str(value).lower() == str(avail_value).lower():
                        spec_matches += 1
            
            if total_specs > 0:
                score += 0.4 * (spec_matches / total_specs)
        
        return min(1.0, score), match_type
    
    def _check_compatibility(
        self,
        required: Dict[str, Any],
        available: Dict[str, Any]
    ) -> Dict[str, bool]:
        """Check various compatibility factors."""
        return {
            "standards_compatible": self._check_standards_compatibility(required, available),
            "dimensional_compatible": self._check_dimensional_compatibility(required, available),
            "performance_compatible": self._check_performance_compatibility(required, available),
            "installation_compatible": True  # Placeholder
        }
    
    def _check_standards_compatibility(
        self,
        required: Dict[str, Any],
        available: Dict[str, Any]
    ) -> bool:
        """Check if standards are compatible."""
        req_standards = set(required.get("standards", []))
        avail_standards = set(available.get("standards", []))
        
        if not req_standards:
            return True
        
        # Check if all required standards are met
        return req_standards.issubset(avail_standards)
    
    def _check_dimensional_compatibility(
        self,
        required: Dict[str, Any],
        available: Dict[str, Any]
    ) -> bool:
        """Check if dimensions are compatible."""
        req_dims = required.get("dimensions", {})
        avail_dims = available.get("dimensions", {})
        
        if not req_dims:
            return True
        
        compatible, _ = self.validate_dimensional_compatibility(req_dims, avail_dims)
        return compatible
    
    def _check_performance_compatibility(
        self,
        required: Dict[str, Any],
        available: Dict[str, Any]
    ) -> bool:
        """Check if performance criteria are met."""
        req_perf = required.get("performance", {})
        avail_perf = available.get("performance", {})
        
        if not req_perf:
            return True
        
        for key, value in req_perf.items():
            if key not in avail_perf:
                return False
            
            if isinstance(value, (int, float)) and isinstance(avail_perf[key], (int, float)):
                # Available must meet or exceed required
                if avail_perf[key] < value:
                    return False
        
        return True
    
    def _identify_differences(
        self,
        required: Dict[str, Any],
        available: Dict[str, Any]
    ) -> List[str]:
        """Identify differences between required and available."""
        differences = []
        
        # Check specifications
        req_specs = required.get("specifications", {})
        avail_specs = available.get("specifications", {})
        
        for key, value in req_specs.items():
            if key not in avail_specs:
                differences.append(f"Missing specification: {key}")
            elif value != avail_specs[key]:
                differences.append(f"{key}: required={value}, available={avail_specs[key]}")
        
        return differences
    
    def _generate_recommendations(
        self,
        differences: List[str],
        compatibility: Dict[str, bool]
    ) -> List[str]:
        """Generate recommendations based on differences and compatibility."""
        recommendations = []
        
        if not all(compatibility.values()):
            recommendations.append("Review compatibility issues before substitution")
        
        if differences:
            recommendations.append(f"Verify {len(differences)} specification differences")
        
        if not compatibility.get("standards_compatible", True):
            recommendations.append("Consult engineer for standards compatibility")
        
        return recommendations
    
    def _find_alternatives(
        self,
        required: Dict[str, Any],
        existing_matches: List[ComponentMatch]
    ) -> List[ComponentMatch]:
        """Find alternative components not in existing matches."""
        alternatives = []
        
        # This would query equivalence database in production
        # For now, return empty list
        return alternatives
    
    def _calculate_similarity(
        self,
        comp1: Dict[str, Any],
        comp2: Dict[str, Any]
    ) -> float:
        """Calculate similarity between two components."""
        similarity = 0.0
        
        # Name similarity
        if comp1.get("name", "").lower() == comp2.get("name", "").lower():
            similarity += 0.3
        
        # Category similarity
        if comp1.get("category", "").lower() == comp2.get("category", "").lower():
            similarity += 0.3
        
        # Specification similarity
        specs1 = comp1.get("specifications", {})
        specs2 = comp2.get("specifications", {})
        
        if specs1 and specs2:
            matching_specs = sum(1 for k in specs1 if k in specs2 and specs1[k] == specs2[k])
            total_specs = len(set(specs1.keys()) | set(specs2.keys()))
            
            if total_specs > 0:
                similarity += 0.4 * (matching_specs / total_specs)
        
        return min(1.0, similarity)
    
    def _fuzzy_name_match(self, name1: str, name2: str) -> bool:
        """Check if names match fuzzily."""
        name1_lower = name1.lower().strip()
        name2_lower = name2.lower().strip()
        
        # Check if one contains the other
        if name1_lower in name2_lower or name2_lower in name1_lower:
            return True
        
        # Check word overlap
        words1 = set(name1_lower.split())
        words2 = set(name2_lower.split())
        
        overlap = len(words1 & words2)
        total = len(words1 | words2)
        
        return (overlap / total) >= 0.6 if total > 0 else False
    
    def _generate_substitution_notes(
        self,
        original: Dict[str, Any],
        alternative: Dict[str, Any]
    ) -> List[str]:
        """Generate notes for component substitution."""
        notes = []
        
        notes.append(f"Alternative for: {original.get('name', 'unknown')}")
        notes.append(f"Similarity: {alternative.get('similarity_score', 0):.0%}")
        
        if original.get("manufacturer") != alternative.get("manufacturer"):
            notes.append(f"Different manufacturer: {alternative.get('manufacturer', 'unknown')}")
        
        return notes
    
    def _build_equivalence_database(self) -> Dict[str, List[Dict[str, Any]]]:
        """Build component equivalence database."""
        return {
            "structural_steel_beam": [
                {
                    "name": "Structural Steel Beam W12x45",
                    "type": "structural_steel_beam",
                    "manufacturer": "US Steel",
                    "category": "structural_steel"
                },
                {
                    "name": "Structural Steel Beam W12x50",
                    "type": "structural_steel_beam",
                    "manufacturer": "ArcelorMittal",
                    "category": "structural_steel"
                }
            ],
            "concrete_5000psi": [
                {
                    "name": "High Strength Concrete 5000PSI",
                    "type": "concrete_5000psi",
                    "manufacturer": "ReadyMix Corp",
                    "category": "concrete"
                }
            ]
        }
    
    def _build_manufacturer_aliases(self) -> Dict[str, List[str]]:
        """Build manufacturer name aliases."""
        return {
            "US Steel": ["US Steel", "United States Steel", "USS", "U.S. Steel"],
            "ArcelorMittal": ["ArcelorMittal", "Arcelor Mittal", "Arcelor-Mittal"],
            "Gypsum Board Co": ["Gypsum Board Co", "GBC", "Gypsum Board Company"],
            "ReadyMix Corp": ["ReadyMix Corp", "ReadyMix", "Ready Mix", "Ready Mix Corporation"]
        }
