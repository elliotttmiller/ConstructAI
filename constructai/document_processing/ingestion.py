"""
Module 1: Intelligent Document Ingestion & Parsing

Handles document type detection, OCR, and parsing of construction documents.
"""

import io
from typing import Dict, Any, List, Optional
from enum import Enum
from pathlib import Path
import logging

logger = logging.getLogger(__name__)


class DocumentType(Enum):
    """Types of construction documents."""
    RFP = "rfp"
    PROPOSAL = "proposal"
    SPECIFICATION = "specification"
    DRAWING = "drawing"
    BOQ = "boq"
    SCHEDULE = "schedule"
    UNKNOWN = "unknown"


class DocumentIngestor:
    """
    Intelligent document ingestion system.
    
    Handles multiple document formats and performs OCR when needed.
    """
    
    def __init__(self):
        self.supported_formats = ['.pdf', '.docx', '.doc', '.txt', '.xlsx']
        logger.info("DocumentIngestor initialized")
    
    def ingest_document(self, file_path: str) -> Dict[str, Any]:
        """
        Ingest a construction document.
        
        Args:
            file_path: Path to the document
            
        Returns:
            Dictionary with document metadata and content
        """
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                raise FileNotFoundError(f"Document not found: {file_path}")
            
            # Detect document type
            doc_type = self._detect_document_type(file_path)
            
            # Extract content based on format
            content = self._extract_content(file_path)
            
            return {
                "file_name": file_path.name,
                "file_path": str(file_path),
                "document_type": doc_type.value,
                "format": file_path.suffix.lower(),
                "content": content,
                "metadata": self._extract_metadata(file_path)
            }
            
        except Exception as e:
            logger.error(f"Error ingesting document {file_path}: {e}")
            raise
    
    def _detect_document_type(self, file_path: Path) -> DocumentType:
        """Detect the type of construction document."""
        # Simple heuristic-based detection
        name_lower = file_path.name.lower()
        
        if any(term in name_lower for term in ['rfp', 'request for proposal']):
            return DocumentType.RFP
        elif any(term in name_lower for term in ['proposal', 'bid']):
            return DocumentType.PROPOSAL
        elif any(term in name_lower for term in ['spec', 'specification']):
            return DocumentType.SPECIFICATION
        elif any(term in name_lower for term in ['drawing', 'dwg', 'plan']):
            return DocumentType.DRAWING
        elif any(term in name_lower for term in ['boq', 'bill of quantities', 'quantities']):
            return DocumentType.BOQ
        elif any(term in name_lower for term in ['schedule', 'timeline']):
            return DocumentType.SCHEDULE
        else:
            return DocumentType.UNKNOWN
    
    def _extract_content(self, file_path: Path) -> str:
        """Extract text content from document."""
        suffix = file_path.suffix.lower()
        
        try:
            if suffix == '.pdf':
                return self._extract_from_pdf(file_path)
            elif suffix in ['.docx', '.doc']:
                return self._extract_from_docx(file_path)
            elif suffix == '.txt':
                return file_path.read_text(encoding='utf-8')
            elif suffix == '.xlsx':
                return self._extract_from_excel(file_path)
            else:
                logger.warning(f"Unsupported format: {suffix}")
                return ""
        except Exception as e:
            logger.error(f"Error extracting content from {file_path}: {e}")
            return ""
    
    def _extract_from_pdf(self, file_path: Path) -> str:
        """Extract text from PDF using PyPDF2."""
        try:
            from PyPDF2 import PdfReader
            
            reader = PdfReader(str(file_path))
            text = []
            
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
            
            return "\n".join(text)
            
        except ImportError:
            logger.warning("PyPDF2 not installed. Install with: pip install pypdf2")
            return ""
        except Exception as e:
            logger.error(f"Error extracting PDF: {e}")
            return ""
    
    def _extract_from_docx(self, file_path: Path) -> str:
        """Extract text from DOCX."""
        try:
            from docx import Document
            
            doc = Document(str(file_path))
            text = []
            
            for para in doc.paragraphs:
                if para.text.strip():
                    text.append(para.text)
            
            return "\n".join(text)
            
        except ImportError:
            logger.warning("python-docx not installed. Install with: pip install python-docx")
            return ""
        except Exception as e:
            logger.error(f"Error extracting DOCX: {e}")
            return ""
    
    def _extract_from_excel(self, file_path: Path) -> str:
        """Extract text from Excel."""
        try:
            import pandas as pd
            
            # Read all sheets
            excel_file = pd.ExcelFile(file_path)
            text = []
            
            for sheet_name in excel_file.sheet_names:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                text.append(f"Sheet: {sheet_name}")
                text.append(df.to_string())
            
            return "\n\n".join(text)
            
        except Exception as e:
            logger.error(f"Error extracting Excel: {e}")
            return ""
    
    def _extract_metadata(self, file_path: Path) -> Dict[str, Any]:
        """Extract document metadata."""
        stat = file_path.stat()
        
        return {
            "size_bytes": stat.st_size,
            "created": stat.st_ctime,
            "modified": stat.st_mtime,
        }
    
    def perform_ocr(self, image_path: str) -> str:
        """
        Perform OCR on an image document.
        
        Args:
            image_path: Path to image file
            
        Returns:
            Extracted text
        """
        try:
            import pytesseract
            from PIL import Image
            
            image = Image.open(image_path)
            text = pytesseract.image_to_string(image)
            
            return text
            
        except ImportError:
            logger.warning("pytesseract not installed. Install with: pip install pytesseract")
            return ""
        except Exception as e:
            logger.error(f"OCR error: {e}")
            return ""
