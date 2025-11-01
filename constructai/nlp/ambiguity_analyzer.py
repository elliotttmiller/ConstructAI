"""
Service 3.1: Clarity & Ambiguity Analyzer

Flags subjective or vague language in specifications.
"""

import re
from typing import Dict, List, Any
import logging

logger = logging.getLogger(__name__)


class AmbiguityAnalyzer:
    """
    Analyzes specification clauses for ambiguous or vague language.
    
    Flags subjective terms that need specific, measurable criteria.
    """
    
    def __init__(self):
        # Ambiguous/subjective terms
        self.ambiguous_terms = [
            "high-quality", "good", "adequate", "sufficient", "appropriate",
            "reasonable", "suitable", "proper", "acceptable", "standard",
            "normal", "typical", "average", "best", "optimal", "as required",
            "as necessary", "where needed", "as applicable"
        ]
        
        # Terms indicating missing specificity
        self.vague_quantifiers = [
            "some", "several", "few", "many", "most", "approximately",
            "about", "around", "nearly", "almost"
        ]
        
        logger.info("AmbiguityAnalyzer initialized")
    
    def analyze(self, clause_text: str) -> Dict[str, Any]:
        """
        Analyze a clause for ambiguous language.
        
        Args:
            clause_text: Specification clause text
            
        Returns:
            Analysis result with flagged issues
        """
        issues = []
        
        # Check for ambiguous terms
        for term in self.ambiguous_terms:
            pattern = rf'\b{re.escape(term)}\b'
            matches = list(re.finditer(pattern, clause_text, re.IGNORECASE))
            
            if matches:
                for match in matches:
                    issues.append({
                        "type": "ambiguous_term",
                        "term": match.group(0),
                        "position": match.start(),
                        "severity": "high",
                        "message": f"'{match.group(0)}' is subjective and needs specific criteria",
                        "suggestion": self._get_suggestion(match.group(0).lower())
                    })
        
        # Check for vague quantifiers
        for term in self.vague_quantifiers:
            pattern = rf'\b{re.escape(term)}\b'
            matches = list(re.finditer(pattern, clause_text, re.IGNORECASE))
            
            if matches:
                for match in matches:
                    issues.append({
                        "type": "vague_quantifier",
                        "term": match.group(0),
                        "position": match.start(),
                        "severity": "medium",
                        "message": f"'{match.group(0)}' is imprecise - provide specific quantity",
                        "suggestion": "Specify exact number or measurable range"
                    })
        
        # Check for missing units
        if self._has_numbers_without_units(clause_text):
            issues.append({
                "type": "missing_units",
                "severity": "high",
                "message": "Numbers found without units of measurement",
                "suggestion": "Add appropriate units (psi, inches, sq ft, etc.)"
            })
        
        # Check for missing standard references
        if self._needs_standard_reference(clause_text) and not self._has_standard_reference(clause_text):
            issues.append({
                "type": "missing_standard",
                "severity": "medium",
                "message": "Material or method mentioned without standard reference",
                "suggestion": "Reference applicable ASTM, ACI, or other industry standard"
            })
        
        # Calculate clarity score
        base_score = 100
        for issue in issues:
            if issue["severity"] == "high":
                base_score -= 15
            elif issue["severity"] == "medium":
                base_score -= 10
            else:
                base_score -= 5
        
        clarity_score = max(0, base_score)
        
        return {
            "clause": clause_text,
            "clarity_score": clarity_score,
            "is_ambiguous": len(issues) > 0,
            "issues": issues,
            "issue_count": len(issues)
        }
    
    def _get_suggestion(self, term: str) -> str:
        """Get specific suggestion for ambiguous term."""
        suggestions = {
            "high-quality": "Specify measurable quality standards (compressive strength, R-value, etc.)",
            "adequate": "Define minimum acceptable criteria",
            "sufficient": "Specify exact quantity or capacity required",
            "appropriate": "List specific requirements or standards",
            "reasonable": "Define acceptable range or tolerance",
            "suitable": "Specify required characteristics or certifications",
            "as required": "List all requirements explicitly",
            "as necessary": "Define specific conditions and actions"
        }
        return suggestions.get(term, "Provide specific, measurable criteria")
    
    def _has_numbers_without_units(self, text: str) -> bool:
        """Check if text has numbers without units."""
        # Find numbers
        number_pattern = r'\d+\.?\d*'
        numbers = list(re.finditer(number_pattern, text))
        
        # Common units
        units = ['psi', 'psf', 'ksi', 'inches', 'feet', 'yards', 'sq', 'cubic', '%', 'degrees']
        
        for num_match in numbers:
            # Check if followed by a unit within 10 characters
            end_pos = num_match.end()
            following_text = text[end_pos:end_pos+15].lower()
            
            has_unit = any(unit in following_text for unit in units)
            if not has_unit:
                return True
        
        return False
    
    def _needs_standard_reference(self, text: str) -> bool:
        """Check if clause discusses materials/methods that need standards."""
        materials_methods = ['concrete', 'steel', 'weld', 'bolt', 'fastener', 'coating', 'paint']
        text_lower = text.lower()
        return any(term in text_lower for term in materials_methods)
    
    def _has_standard_reference(self, text: str) -> bool:
        """Check if text has standard references."""
        standard_pattern = r'\b(ASTM|ACI|ANSI|ISO|AISC|IBC|NEC)\s+[A-Z]?-?\d+\b'
        return bool(re.search(standard_pattern, text, re.IGNORECASE))
