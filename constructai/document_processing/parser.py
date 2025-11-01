"""
Document Parser with advanced structure understanding.

Uses layout analysis to preserve document hierarchy.
"""

import re
from typing import Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)


class DocumentSection:
    """Represents a section of a document."""
    
    def __init__(self, title: str, content: str, level: int = 1):
        self.title = title
        self.content = content
        self.level = level
        self.subsections: List['DocumentSection'] = []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "title": self.title,
            "content": self.content,
            "level": self.level,
            "subsections": [s.to_dict() for s in self.subsections]
        }


class DocumentParser:
    """
    Advanced document parser that preserves hierarchical structure.
    
    Identifies sections, subsections, bullet points, and maintains
    document structure for better analysis.
    """
    
    def __init__(self):
        self.section_patterns = [
            # Common section headers
            r'^(\d+\.?\s+[A-Z][^\n]+)$',  # "1. SECTION NAME" or "1 SECTION NAME"
            r'^([A-Z][A-Z\s]+)$',  # "SECTION NAME"
            r'^(SECTION\s+\d+[:\s]+[^\n]+)$',  # "SECTION 1: Name"
            r'^(DIVISION\s+\d+[:\s]+[^\n]+)$',  # "DIVISION 01: General Requirements"
        ]
        
        logger.info("DocumentParser initialized")
    
    def parse(self, document_content: str) -> Dict[str, Any]:
        """
        Parse document into structured format.
        
        Args:
            document_content: Raw document text
            
        Returns:
            Structured document with sections and hierarchy
        """
        try:
            # Split into lines
            lines = document_content.split('\n')
            
            # Identify sections
            sections = self._identify_sections(lines)
            
            # Build hierarchy
            structured_doc = self._build_hierarchy(sections)
            
            # Extract key information
            metadata = self._extract_document_metadata(lines)
            
            return {
                "structured_content": structured_doc,
                "metadata": metadata,
                "total_sections": len(sections),
                "line_count": len(lines)
            }
            
        except Exception as e:
            logger.error(f"Error parsing document: {e}")
            raise
    
    def _identify_sections(self, lines: List[str]) -> List[Tuple[str, str, int]]:
        """Identify sections in the document."""
        sections = []
        current_section = None
        current_content = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            
            if not line:
                continue
            
            # Check if this is a section header
            is_header, level = self._is_section_header(line, i, lines)
            
            if is_header:
                # Save previous section
                if current_section:
                    sections.append((
                        current_section,
                        '\n'.join(current_content),
                        level
                    ))
                
                # Start new section
                current_section = line
                current_content = []
            else:
                # Add to current section content
                if current_section is None:
                    current_section = "Preamble"
                current_content.append(line)
        
        # Save last section
        if current_section:
            sections.append((
                current_section,
                '\n'.join(current_content),
                1
            ))
        
        return sections
    
    def _is_section_header(self, line: str, index: int, lines: List[str]) -> Tuple[bool, int]:
        """Determine if a line is a section header."""
        # Check against patterns
        for pattern in self.section_patterns:
            if re.match(pattern, line.strip(), re.MULTILINE):
                return True, 1
        
        # Check if all caps and short (likely a header)
        if line.isupper() and len(line) < 80 and len(line.split()) <= 8:
            return True, 1
        
        # Check if followed by underline or equals signs
        if index + 1 < len(lines):
            next_line = lines[index + 1].strip()
            if re.match(r'^[=\-_]{3,}$', next_line):
                return True, 1
        
        return False, 0
    
    def _build_hierarchy(self, sections: List[Tuple[str, str, int]]) -> List[Dict[str, Any]]:
        """Build hierarchical structure from flat sections."""
        hierarchy = []
        
        for title, content, level in sections:
            section = {
                "title": title,
                "content": content,
                "level": level,
                "subsections": []
            }
            hierarchy.append(section)
        
        return hierarchy
    
    def _extract_document_metadata(self, lines: List[str]) -> Dict[str, Any]:
        """Extract metadata from document."""
        metadata = {
            "project_number": None,
            "date": None,
            "revision": None,
            "author": None
        }
        
        # Look for common metadata patterns in first 50 lines
        for line in lines[:50]:
            line_lower = line.lower()
            
            if 'project' in line_lower and 'number' in line_lower:
                # Try to extract project number
                match = re.search(r'project\s*(?:number|no\.?|#)[\s:]*([A-Z0-9\-]+)', line, re.IGNORECASE)
                if match:
                    metadata['project_number'] = match.group(1)
            
            if 'date' in line_lower:
                # Try to extract date
                match = re.search(r'date[\s:]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', line, re.IGNORECASE)
                if match:
                    metadata['date'] = match.group(1)
            
            if 'revision' in line_lower or 'rev' in line_lower:
                # Try to extract revision
                match = re.search(r'rev(?:ision)?[\s:]*([A-Z0-9]+)', line, re.IGNORECASE)
                if match:
                    metadata['revision'] = match.group(1)
        
        return metadata
    
    def extract_tables(self, content: str) -> List[Dict[str, Any]]:
        """Extract table-like structures from content."""
        tables = []
        
        # Simple table detection (rows with consistent delimiters)
        lines = content.split('\n')
        potential_table = []
        
        for line in lines:
            # Check if line has tab or multiple spaces (table indicators)
            if '\t' in line or re.search(r'\s{2,}', line):
                potential_table.append(line)
            else:
                if len(potential_table) > 2:  # Minimum table size
                    tables.append({
                        "rows": potential_table,
                        "row_count": len(potential_table)
                    })
                potential_table = []
        
        return tables
