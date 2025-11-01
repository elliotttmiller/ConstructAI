"""
FastAPI application for ConstructAI web interface.

Provides REST API and web dashboard for document analysis.
"""

from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


def create_app():
    """
    Create FastAPI application.
    
    Returns:
        FastAPI app instance
    """
    try:
        from fastapi import FastAPI, UploadFile, File
        from fastapi.middleware.cors import CORSMiddleware
        
    except ImportError:
        raise ImportError("FastAPI not installed. Install with: pip install fastapi uvicorn")
    
    app = FastAPI(
        title="ConstructAI API",
        description="AI-powered construction specification analysis and workflow optimization",
        version="0.2.0"
    )
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Import modules
    from ..document_processing import DocumentIngestor, DocumentParser, MasterFormatClassifier
    from ..nlp import ClauseExtractor, ConstructionNER, AmbiguityAnalyzer
    from ..engine.auditor import ProjectAuditor
    from ..engine.optimizer import WorkflowOptimizer
    
    # Initialize components
    doc_ingestor = DocumentIngestor()
    doc_parser = DocumentParser()
    masterformat = MasterFormatClassifier()
    clause_extractor = ClauseExtractor()
    ner = ConstructionNER()
    ambiguity_analyzer = AmbiguityAnalyzer()
    
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "service": "ConstructAI",
            "version": "0.2.0",
            "status": "operational",
            "features": [
                "document_ingestion",
                "masterformat_classification",
                "clause_extraction",
                "ner_analysis",
                "ambiguity_detection",
                "project_auditing",
                "workflow_optimization"
            ]
        }
    
    @app.post("/api/v2/analyze/document")
    async def analyze_document(file: UploadFile = File(...)):
        """
        Analyze a construction document.
        
        Performs:
        - Document ingestion
        - MasterFormat classification
        - Clause extraction
        - NER analysis
        - Ambiguity detection
        """
        try:
            # Save uploaded file temporarily
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name
            
            try:
                # Step 1: Ingest document
                ingested = doc_ingestor.ingest_document(tmp_path)
                
                # Step 2: Parse structure
                parsed = doc_parser.parse(ingested["content"])
                
                # Step 3: Classify with MasterFormat
                classified_sections = masterformat.classify_document_sections(parsed["structured_content"])
                
                # Step 4: Extract clauses
                all_clauses = []
                for section in classified_sections[:5]:  # Limit for demo
                    clauses = clause_extractor.extract_clauses(section.get("content", ""))
                    all_clauses.extend([c.to_dict() for c in clauses[:3]])  # Limit clauses
                
                # Step 5: NER analysis on sample clauses
                ner_results = []
                for clause in all_clauses[:5]:
                    entities = ner.extract_entities(clause["text"])
                    ner_results.append({
                        "clause_id": clause["clause_id"],
                        "entities": {k: [e.to_dict() for e in v] for k, v in entities.items()}
                    })
                
                # Step 6: Ambiguity analysis on sample clauses
                ambiguity_results = []
                for clause in all_clauses[:5]:
                    analysis = ambiguity_analyzer.analyze(clause["text"])
                    if analysis["is_ambiguous"]:
                        ambiguity_results.append(analysis)
                
                return {
                    "status": "success",
                    "document": {
                        "filename": file.filename,
                        "type": ingested["document_type"],
                        "format": ingested["format"]
                    },
                    "analysis": {
                        "sections": len(classified_sections),
                        "clauses_extracted": len(all_clauses),
                        "divisions_found": masterformat.get_division_summary(classified_sections),
                        "sample_clauses": all_clauses[:5],
                        "ner_analysis": ner_results,
                        "ambiguity_analysis": {
                            "total_analyzed": len(ambiguity_results),
                            "issues": ambiguity_results
                        }
                    }
                }
                
            finally:
                # Clean up temp file
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
                    
        except Exception as e:
            logger.error(f"Error analyzing document: {e}", exc_info=True)
            return {
                "status": "error",
                "message": "An error occurred during document analysis"
            }
    
    @app.get("/api/v2/health")
    async def health():
        """Health check endpoint."""
        return {
            "status": "healthy",
            "version": "0.2.0",
            "service": "ConstructAI Advanced"
        }
    
    logger.info("FastAPI app created successfully")
    return app


# For running with uvicorn
app = create_app()
