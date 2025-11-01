"""
Module 2: Specification Clause Extraction.

Identifies individual, atomic specification clauses from parsed text.
"""

import re
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)


class SpecificationClause:
    """Represents a single specification clause."""
    
    def __init__(self, text: str, clause_id: str = None):
        self.text = text
        self.clause_id = clause_id or self._generate_id()
        self.entities = {}
        self.masterformat_division = None
        self.clause_type = None
    
    def _generate_id(self) -> str:
        """Generate unique clause ID."""
        import hashlib
        return hashlib.md5(self.text.encode()).hexdigest()[:12]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "clause_id": self.clause_id,
            "text": self.text,
            "entities": self.entities,
            "masterformat_division": self.masterformat_division,
            "clause_type": self.clause_type
        }


class ClauseExtractor:
    """
    Extracts atomic specification clauses from text.
    
    A clause is a single, complete requirement or statement.
    """
    
    def __init__(self):
        # Patterns that indicate clause boundaries
        self.clause_terminators = ['.', ';', '\n']
        self.clause_starters = [
            r'^\d+\.\d+',  # 1.1, 2.3, etc.
            r'^[A-Z]\.',   # A., B., etc.
            r'^\([a-z]\)', # (a), (b), etc.
            r'^\d+\)',     # 1), 2), etc.
        ]
        
        logger.info("ClauseExtractor initialized")
    
    def extract_clauses(self, text: str) -> List[SpecificationClause]:
        """
        Extract specification clauses from text.
        
        Args:
            text: Text containing specifications
            
        Returns:
            List of SpecificationClause objects
        """
        clauses = []
        
        # Split into sentences
        sentences = self._split_into_sentences(text)
        
        for sentence in sentences:
            sentence = sentence.strip()
            
            if not sentence:
                continue
            
            # Check if this is a spec clause
            if self._is_specification_clause(sentence):
                clause = SpecificationClause(sentence)
                clause.clause_type = self._classify_clause(sentence)
                clauses.append(clause)
        
        logger.info(f"Extracted {len(clauses)} clauses")
        return clauses
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """Split text into sentences."""
        # Simple sentence splitting
        sentences = []
        current_sentence = []
        
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                if current_sentence:
                    sentences.append(' '.join(current_sentence))
                    current_sentence = []
                continue
            
            # Check for clause starters
            is_new_clause = False
            for pattern in self.clause_starters:
                if re.match(pattern, line):
                    is_new_clause = True
                    break
            
            if is_new_clause and current_sentence:
                sentences.append(' '.join(current_sentence))
                current_sentence = [line]
            else:
                current_sentence.append(line)
        
        if current_sentence:
            sentences.append(' '.join(current_sentence))
        
        return sentences
    
    def _is_specification_clause(self, text: str) -> bool:
        """Determine if text is a specification clause."""
        # Minimum length
        if len(text) < 20:
            return False
        
        # Should have action words or be descriptive
        action_words = ['shall', 'must', 'should', 'will', 'provide', 'submit', 'install', 'comply']
        has_action = any(word in text.lower() for word in action_words)
        
        # Should have technical content
        has_technical = any(char.isdigit() for char in text) or any(word.isupper() for word in text.split())
        
        return has_action or has_technical
    
    def _classify_clause(self, text: str) -> str:
        """Classify the type of clause."""
        text_lower = text.lower()
        
        if 'shall' in text_lower or 'must' in text_lower:
            return "mandatory_requirement"
        elif 'should' in text_lower or 'recommended' in text_lower:
            return "recommended_practice"
        elif 'submit' in text_lower or 'provide' in text_lower:
            return "submittal_requirement"
        elif 'test' in text_lower or 'inspect' in text_lower:
            return "quality_requirement"
        elif 'astm' in text_lower or 'aci' in text_lower or 'iso' in text_lower:
            return "standard_reference"
        else:
            return "general_requirement"
    
    def merge_related_clauses(self, clauses: List[SpecificationClause]) -> List[SpecificationClause]:
        """Merge clauses that belong together."""
        # Simple implementation - can be enhanced
        merged = []
        i = 0
        
        while i < len(clauses):
            current = clauses[i]
            
            # Check if next clause is a continuation
            if i + 1 < len(clauses):
                next_clause = clauses[i + 1]
                if self._is_continuation(current.text, next_clause.text):
                    # Merge
                    current.text = f"{current.text} {next_clause.text}"
                    i += 2
                else:
                    merged.append(current)
                    i += 1
            else:
                merged.append(current)
                i += 1
        
        return merged
    
    def _is_continuation(self, text1: str, text2: str) -> bool:
        """Check if text2 is a continuation of text1."""
        # If text2 starts with lowercase, it's likely a continuation
        if text2 and text2[0].islower():
            return True
        
        # If text1 doesn't end with proper termination
        if not text1.endswith(('.', ';', ':')):
            return True
        
        return False
