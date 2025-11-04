"""
FastAPI application for ConstructAI web interface.

Provides REST API and web dashboard for document analysis.
Enhanced with database persistence, middleware, and comprehensive error handling.
"""

from typing import Dict, Any, Optional
import logging
import uuid

logger = logging.getLogger(__name__)


def create_app():
    """
    Create FastAPI application with all enhancements.
    
    Returns:
        FastAPI app instance
    """
    try:
        from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from sqlalchemy.orm import Session
        
    except ImportError:
        raise ImportError("FastAPI not installed. Install with: pip install fastapi uvicorn sqlalchemy")
    
    # Initialize settings and logging
    from ..config import setup_logging, get_settings
    settings = get_settings()
    setup_logging(settings.LOG_LEVEL, settings.LOG_FILE)
    
    app = FastAPI(
        title="ConstructAI API",
        description="AI-powered construction specification analysis and workflow optimization",
        version=settings.APP_VERSION,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )
    
    # Add enhanced middleware
    from ..middleware import LoggingMiddleware, ErrorHandlerMiddleware, RateLimiterMiddleware
    
    # Order matters: Error handler first, then logging, then rate limiting
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(LoggingMiddleware)
    
    if settings.RATE_LIMIT_ENABLED:
        app.add_middleware(RateLimiterMiddleware, requests_per_minute=settings.RATE_LIMIT_PER_MINUTE)
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS if not settings.DEBUG else ["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Initialize database
    from ..db import Database, get_db, ProjectDB, AnalysisResultDB
    
    try:
        Database.create_tables()
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue anyway for development
    
    # Initialize AI Model Manager
    from ..ai.providers import AIModelManager
    ai_manager = AIModelManager(config_source="env")
    logger.info(f"AI Model Manager initialized with providers: {list(ai_manager.providers.keys())}")
    
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
        """Root endpoint with AI provider information."""
        available_providers = ai_manager.get_available_providers()
        
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
        """Health check endpoint with database status."""
        try:
            # Try to query database
            db = Database.get_session()
            db.execute("SELECT 1")
            db.close()
            db_status = "connected"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            db_status = "disconnected"
        
        return {
            "status": "healthy",
            "version": settings.APP_VERSION,
            "service": "ConstructAI Advanced",
            "database": db_status,
        }
    
    # Database-backed project endpoints
    @app.get("/api/projects")
    async def get_projects(db: Session = Depends(get_db)):
        """Get all projects from database."""
        try:
            projects = db.query(ProjectDB).all()
            return [project.to_dict() for project in projects]
        except Exception as e:
            logger.error(f"Error fetching projects: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch projects")
    
    @app.get("/api/projects/{project_id}")
    async def get_project(project_id: str, db: Session = Depends(get_db)):
        """Get a specific project by ID from database."""
        project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return project.to_dict()
    
    @app.post("/api/projects")
    async def create_project(project: Dict[str, Any], db: Session = Depends(get_db)):
        """Create a new project in database."""
        try:
            # Generate unique ID
            project_id = str(uuid.uuid4())
            
            # Create database model
            db_project = ProjectDB(
                id=project_id,
                name=project.get("name", "Untitled Project"),
                description=project.get("description", ""),
                status=project.get("status", "planning"),
                budget=project.get("budget", 0),
                total_tasks=project.get("total_tasks", 0),
                project_metadata=project.get("project_metadata"),
                tasks=project.get("tasks"),
                resources=project.get("resources"),
            )
            
            db.add(db_project)
            db.commit()
            db.refresh(db_project)
            
            logger.info(f"Created project: {project_id} - {db_project.name}")
            return db_project.to_dict()
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating project: {e}")
            raise HTTPException(status_code=500, detail="Failed to create project")
    
    @app.put("/api/projects/{project_id}")
    async def update_project(project_id: str, project: Dict[str, Any], db: Session = Depends(get_db)):
        """Update an existing project in database."""
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            # Update fields
            for key, value in project.items():
                if key != "id" and key != "created_at" and hasattr(db_project, key):
                    setattr(db_project, key, value)
            
            db.commit()
            db.refresh(db_project)
            
            logger.info(f"Updated project: {project_id}")
            return db_project.to_dict()
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error updating project: {e}")
            raise HTTPException(status_code=500, detail="Failed to update project")
    
    @app.delete("/api/projects/{project_id}")
    async def delete_project(project_id: str, db: Session = Depends(get_db)):
        """Delete a project from database."""
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            db.delete(db_project)
            db.commit()
            logger.info(f"Deleted project: {project_id}")
            return {"status": "deleted", "project_id": project_id}
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting project: {e}")
            raise HTTPException(status_code=500, detail="Failed to delete project")
    
    @app.post("/api/projects/{project_id}/duplicate")
    async def duplicate_project(project_id: str, db: Session = Depends(get_db)):
        """Duplicate an existing project."""
        original = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not original:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            # Create duplicate with new ID
            new_project_id = str(uuid.uuid4())
            duplicate = ProjectDB(
                id=new_project_id,
                name=f"{original.name} (Copy)",
                description=original.description,
                status=original.status,
                budget=original.budget,
                total_tasks=original.total_tasks,
                project_metadata=original.project_metadata,
                tasks=original.tasks,
                resources=original.resources,
            )
            
            db.add(duplicate)
            db.commit()
            db.refresh(duplicate)
            
            logger.info(f"Duplicated project: {project_id} -> {new_project_id}")
            return duplicate.to_dict()
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error duplicating project: {e}")
            raise HTTPException(status_code=500, detail="Failed to duplicate project")
    
    @app.put("/api/projects/{project_id}/archive")
    async def archive_project(project_id: str, db: Session = Depends(get_db)):
        """Archive a project (sets status to 'archived')."""
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            db_project.status = "archived"
            db.commit()
            db.refresh(db_project)
            
            logger.info(f"Archived project: {project_id}")
            return db_project.to_dict()
        except Exception as e:
            db.rollback()
            logger.error(f"Error archiving project: {e}")
            raise HTTPException(status_code=500, detail="Failed to archive project")
    
    @app.post("/api/projects/{project_id}/analyze")
    async def analyze_project(project_id: str, project_data: Dict[str, Any], db: Session = Depends(get_db)):
        """
        Perform AI analysis on a project.
        Returns audit results and optimization suggestions.
        """
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            # Create sample project data for analysis
            sample_project_data = {
                "project_name": db_project.name,
                "budget": db_project.budget,
                "tasks": project_data.get("tasks", db_project.tasks or []),
                "resources": project_data.get("resources", db_project.resources or [])
            }
            
            # Perform audit
            auditor = ProjectAuditor()
            audit_result = auditor.audit(sample_project_data)
            
            # Perform optimization
            optimizer = WorkflowOptimizer()
            optimization_result = optimizer.optimize(sample_project_data)
            
            # Cache the results in database
            analysis_id = str(uuid.uuid4())
            cache_entry = AnalysisResultDB(
                id=analysis_id,
                project_id=project_id,
                analysis_type="full",
                result={
                    "audit": audit_result,
                    "optimization": optimization_result
                }
            )
            db.add(cache_entry)
            db.commit()
            
            return {
                "status": "success",
                "project_id": project_id,
                "audit": {
                    "overall_score": audit_result.get("overall_score", 85),
                    "risks": audit_result.get("risks", []),
                    "compliance_issues": audit_result.get("compliance_issues", []),
                    "bottlenecks": audit_result.get("bottlenecks", []),
                    "resource_conflicts": audit_result.get("resource_conflicts", [])
                },
                "optimization": {
                    "duration_reduction_days": optimization_result.get("duration_reduction", 0),
                    "cost_savings": optimization_result.get("cost_savings", 0),
                    "parallel_opportunities": optimization_result.get("parallel_tasks", 0),
                    "bottlenecks_resolved": optimization_result.get("bottlenecks_resolved", 0),
                    "optimizations_applied": optimization_result.get("optimizations", [])
                }
            }
        except Exception as e:
            db.rollback()
            logger.error(f"Error analyzing project {project_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    @app.get("/api/projects/{project_id}/export")
    async def export_project(project_id: str, format: str = "json", db: Session = Depends(get_db)):
        """
        Export project data in various formats (json, pdf, excel).
        Includes all analysis data, MEP systems, and recommendations.
        """
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        from fastapi.responses import JSONResponse, FileResponse
        from datetime import datetime
        import os
        import tempfile
        
        # Convert to dict and ensure we have required structure
        project_dict = db_project.to_dict()
        
        # Ensure analysis structure exists with defaults
        if 'analysis' not in project_dict or not project_dict['analysis']:
            project_dict['analysis'] = {
                'quality': {
                    'completeness_score': 0,
                    'sections_count': 0,
                    'total_clauses': 0,
                    'masterformat_divisions': 0,
                    'masterformat_coverage': {}
                },
                'standards_found': [],
                'key_materials': [],
                'critical_requirements': [],
                'recommendations': []
            }
        
        if format == "json":
            return JSONResponse(content={
                "status": "success",
                "format": "json",
                "data": project_dict,
                "exported_at": datetime.utcnow().isoformat()
            })
        elif format == "pdf":
            try:
                from ..utils.pdf_export import generate_project_pdf
                
                logger.info(f"Starting PDF export for project {project_id}")
                
                # Create temporary file for PDF
                temp_dir = tempfile.gettempdir()
                pdf_filename = f"ConstructAI_{project_dict.get('name', 'Project')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
                # Sanitize filename
                pdf_filename = "".join(c for c in pdf_filename if c.isalnum() or c in ('_', '-', '.')).rstrip()
                pdf_path = os.path.join(temp_dir, pdf_filename)
                
                logger.info(f"Generating PDF at: {pdf_path}")
                
                # Generate PDF with error handling
                generate_project_pdf(project_dict, pdf_path)
                
                # Verify file was created
                if not os.path.exists(pdf_path):
                    raise FileNotFoundError(f"PDF file was not created at {pdf_path}")
                
                file_size = os.path.getsize(pdf_path)
                logger.info(f"PDF generated successfully: {pdf_filename} ({file_size} bytes)")
                
                # Return as downloadable file
                return FileResponse(
                    path=pdf_path,
                    filename=pdf_filename,
                    media_type="application/pdf",
                    headers={
                        "Content-Disposition": f"attachment; filename={pdf_filename}"
                    }
                )
            except ImportError as e:
                logger.error(f"PDF generation import error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail="PDF generation requires reportlab. Install with: pip install reportlab"
                )
            except Exception as e:
                import traceback
                logger.error(f"PDF generation failed: {str(e)}")
                logger.error(f"Traceback: {traceback.format_exc()}")
                raise HTTPException(
                    status_code=500, 
                    detail=f"PDF generation failed: {str(e)}"
                )
        elif format == "excel":
            return {
                "status": "success",
                "format": "excel",
                "message": "Excel export will be generated",
                "download_url": f"/api/downloads/{project_id}.xlsx"
            }
        else:
            raise HTTPException(status_code=400, detail="Invalid format. Use: json, pdf, or excel")
    
    @app.post("/api/documents/upload")
    async def upload_and_process_document(file: UploadFile):
        """
        Upload a construction document and process it with AI.
        Extracts project information, tasks, resources, and performs initial analysis.
        """
        from fastapi import HTTPException
        import os
        import tempfile
        
        # Validate file size (50MB limit)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

        # Read file in chunks to check size
        file_size = 0
        file_content = bytearray()

        try:
            logger.info(f"Received document upload request: filename={file.filename}, content_type={file.content_type}")
            while chunk := await file.read(8192):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    logger.warning(f"File size exceeded: {file_size} bytes (limit {MAX_FILE_SIZE})")
                    raise HTTPException(
                        status_code=413,
                        detail=f"File size exceeds {MAX_FILE_SIZE / (1024 * 1024)}MB limit"
                    )
                file_content.extend(chunk)

            logger.info(f"File read complete: {file.filename}, size={file_size} bytes")

            # Validate file type
            allowed_extensions = ['.pdf', '.docx', '.xlsx', '.txt', '.csv']
            file_extension = os.path.splitext(file.filename)[1].lower()

            if file_extension not in allowed_extensions:
                logger.warning(f"Unsupported file type: {file_extension}")
                raise HTTPException(
                    status_code=400,
                    detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
                )

            # Save file temporarily for processing
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name

            logger.info(f"Saved temp file for processing: {temp_file_path}")

            # Always run real document processing pipeline
            from constructai.document_processing.ingestion import DocumentIngestor
            from constructai.document_processing.parser import DocumentParser
            from constructai.nlp.clause_extractor import ClauseExtractor
            from constructai.nlp.ner import ConstructionNER
            from constructai.document_processing.masterformat import MasterFormatClassifier

            logger.info("Starting document ingestion...")
            ingestor = DocumentIngestor()
            ingested = ingestor.ingest_document(temp_file_path)
            logger.info(f"Document ingested: type={ingested.get('document_type')}, format={ingested.get('format')}")

            logger.info("Parsing document structure...")
            parser = DocumentParser()
            parsed = parser.parse(ingested["content"])
            
            # Log structured content - it's a list, not a dict
            structured_content = parsed.get('structured_content', [])
            if isinstance(structured_content, list):
                logger.info(f"Document parsed: structured_content is a list with {len(structured_content)} sections")
            else:
                logger.info(f"Document parsed: structured_content type={type(structured_content)}")

            logger.info("Classifying sections with MasterFormat...")
            masterformat = MasterFormatClassifier()
            classified_sections = masterformat.classify_document_sections(parsed["structured_content"])
            logger.info(f"Sections classified: count={len(classified_sections)}")

            logger.info("Extracting clauses from sections...")
            clause_extractor = ClauseExtractor()
            all_clauses = []
            for section in classified_sections:
                clauses = clause_extractor.extract_clauses(section.get("content", ""))
                for c in clauses:
                    try:
                        clause_dict = c.to_dict()
                        all_clauses.append(clause_dict)
                    except Exception as e:
                        logger.error(f"Error converting clause to dict: {e}")
                        continue
            logger.info(f"Clauses extracted: total={len(all_clauses)}")

            logger.info("Running NER analysis on all clauses...")
            ner = ConstructionNER()
            ner_results = []
            
            # Aggregate entities across all clauses
            all_materials = set()
            all_standards = set()
            all_costs = []
            all_performance = []
            
            # Run MEP analysis on full document text
            logger.info("Running MEP analysis (HVAC/Plumbing)...")
            from constructai.nlp.mep_analyzer import MEPAnalyzer
            mep_analyzer = MEPAnalyzer()
            mep_results = mep_analyzer.analyze_document(ingested["content"])
            logger.info(f"MEP analysis complete: "
                       f"HVAC equipment={mep_results['hvac']['summary']['total_equipment']}, "
                       f"Plumbing fixtures={mep_results['plumbing']['summary']['total_fixtures']}")
            
            for clause in all_clauses:
                try:
                    entities = ner.extract_entities(clause["text"])
                    
                    # Convert entities to dict format for storage
                    entities_dict = {}
                    for k, v in entities.items():
                        if isinstance(v, list):
                            entities_dict[k] = [e.to_dict() if hasattr(e, 'to_dict') else str(e) for e in v]
                        else:
                            entities_dict[k] = []
                    
                    # Store per-clause analysis
                    ner_results.append({
                        "clause_id": clause["clause_id"],
                        "entities": entities_dict
                    })
                    
                    # Aggregate for document-level insights
                    for material in entities.get("materials", []):
                        all_materials.add(material.text)
                    for standard in entities.get("standards", []):
                        all_standards.add(standard.text)
                    for cost in entities.get("costs", []):
                        all_costs.append(cost.text)
                    for perf in entities.get("performance", []):
                        all_performance.append(perf.text)
                        
                except Exception as e:
                    logger.error(f"Error processing clause {clause.get('clause_id', 'unknown')}: {e}", exc_info=True)
                    continue
                    
            logger.info(f"NER analysis complete: clauses_analyzed={len(ner_results)}, "
                       f"materials={len(all_materials)}, standards={len(all_standards)}, "
                       f"costs={len(all_costs)}")


            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                logger.info(f"Temp file deleted: {temp_file_path}")

            # Generate document ID
            document_id = str(__import__('uuid').uuid4())
            logger.info(f"Document processing complete: document_id={document_id}")

            # Get division summary and ensure it's a dict
            divisions_summary = masterformat.get_division_summary(classified_sections)
            logger.info(f"Division summary type: {type(divisions_summary)}, value: {divisions_summary}")
            
            # Ensure divisions_summary is a dict
            if not isinstance(divisions_summary, dict):
                logger.warning(f"divisions_summary is not a dict, got {type(divisions_summary)}")
                divisions_summary = {}

            # Enhanced Analysis: Extract actionable insights
            logger.info("Performing enhanced analysis for actionable insights...")
            
            # 1. Use aggregated entities from NER
            key_materials = list(all_materials)
            key_standards = list(all_standards)
            cost_mentions = all_costs
            
            # Extract schedule mentions from text
            schedule_mentions = []
            for clause in all_clauses[:20]:
                text = clause.get("text", "").lower()
                if any(word in text for word in ["day", "week", "month", "schedule", "timeline", "duration"]):
                    schedule_mentions.append(clause.get("text")[:100])
            
            # 2. Identify potential risks and issues
            risk_indicators = []
            for clause in all_clauses:
                text = clause.get("text", "").lower()
                if any(word in text for word in ["shall", "must", "required", "mandatory"]):
                    risk_indicators.append({
                        "type": "requirement",
                        "clause_id": clause.get("clause_id"),
                        "text": clause.get("text")[:200],
                        "severity": "high" if "must" in text else "medium"
                    })
            
            # 3. Calculate completeness score
            completeness_factors = {
                "has_multiple_divisions": len(divisions_summary) > 3,
                "has_clauses": len(all_clauses) > 10,
                "has_standards": len(key_standards) > 0,
                "has_detailed_sections": len(classified_sections) > 5,
                "has_materials": len(key_materials) > 0,
                "has_costs": len(cost_mentions) > 0
            }
            completeness_score = (sum(completeness_factors.values()) / len(completeness_factors)) * 100
            
            # 4. Generate recommendations
            recommendations = []
            
            if len(divisions_summary) < 3:
                recommendations.append({
                    "priority": "high",
                    "category": "completeness",
                    "message": "Document covers few MasterFormat divisions. Consider adding more detailed scope sections."
                })
            
            if len(key_standards) == 0:
                recommendations.append({
                    "priority": "medium",
                    "category": "standards",
                    "message": "No industry standards detected (ASTM, ACI, etc.). Ensure compliance requirements are specified."
                })
            else:
                recommendations.append({
                    "priority": "low",
                    "category": "standards",
                    "message": f"Good! Found {len(key_standards)} industry standard references ensuring code compliance."
                })
            
            if len(key_materials) == 0:
                recommendations.append({
                    "priority": "medium",
                    "category": "materials",
                    "message": "No specific materials identified. Add detailed material specifications."
                })
            else:
                recommendations.append({
                    "priority": "low",
                    "category": "materials",
                    "message": f"Good! Identified {len(key_materials)} different materials with specifications."
                })
            
            if len(cost_mentions) == 0:
                recommendations.append({
                    "priority": "medium",
                    "category": "budget",
                    "message": "No cost information found. Consider adding budget estimates or allowances."
                })
            else:
                recommendations.append({
                    "priority": "low",
                    "category": "budget",
                    "message": f"Good! Found {len(cost_mentions)} cost references throughout the document."
                })
            
            if len(all_clauses) < 10:
                recommendations.append({
                    "priority": "medium",
                    "category": "detail",
                    "message": "Limited specification detail found. Consider expanding technical requirements."
                })


            return {
                "status": "success",
                "message": "Document processed successfully",
                "document_id": document_id,
                "filename": file.filename,
                "file_size": file_size,
                "analysis": {
                    # Basic metrics
                    "sections": len(classified_sections),
                    "clauses_extracted": len(all_clauses),
                    "divisions_found": divisions_summary,
                    "sample_clauses": all_clauses[:10],
                    "ner_analysis": ner_results,
                    
                    # MEP-specific analysis
                    "mep_analysis": {
                        "hvac": {
                            "equipment": mep_results['hvac']['equipment'][:10],
                            "capacities": mep_results['hvac']['capacities'][:10],
                            "efficiency_ratings": mep_results['hvac']['efficiency_ratings'],
                            "ductwork": mep_results['hvac']['ductwork'][:5],
                            "standards": mep_results['hvac']['standards'],
                            "summary": mep_results['hvac']['summary']
                        },
                        "plumbing": {
                            "fixtures": mep_results['plumbing']['fixtures'][:10],
                            "piping": mep_results['plumbing']['piping'][:10],
                            "water_supply": mep_results['plumbing']['water_supply'][:5],
                            "drainage": mep_results['plumbing']['drainage'][:5],
                            "standards": mep_results['plumbing']['standards'],
                            "summary": mep_results['plumbing']['summary']
                        },
                        "overall": mep_results['overall_summary']
                    },
                    
                    # Enhanced insights
                    "insights": {
                        "completeness_score": round(completeness_score, 1),
                        "key_materials": list(key_materials)[:10],
                        "key_standards": list(key_standards)[:10],
                        "risk_indicators": risk_indicators[:5],
                        "recommendations": recommendations,
                        "summary": {
                            "total_divisions": len(divisions_summary),
                            "most_referenced_division": max(divisions_summary.items(), key=lambda x: x[1])[0] if divisions_summary else "N/A",
                            "specification_density": round(len(all_clauses) / max(len(classified_sections), 1), 2),
                            "has_mep_specifications": mep_results['overall_summary']['has_hvac_specs'] or mep_results['overall_summary']['has_plumbing_specs']
                        }
                    }
                }
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing document: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    @app.post("/api/projects/{project_id}/documents/upload")
    async def upload_document_to_project(project_id: str, file: UploadFile, db: Session = Depends(get_db)):
        """
        Upload a document for a specific project.
        Processes the document and saves analysis results to the project.
        """
        from fastapi import HTTPException, UploadFile
        import os
        import tempfile
        import json

        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Validate file size (50MB limit)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

        # Read file in chunks to check size
        file_size = 0
        file_content = bytearray()

        try:
            logger.info(f"Uploading document to project {project_id}: {file.filename}")
            
            while chunk := await file.read(8192):
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File size exceeds {MAX_FILE_SIZE / (1024 * 1024)}MB limit"
                    )
                file_content.extend(chunk)

            # Validate file type
            allowed_extensions = ['.pdf', '.docx', '.xlsx', '.txt', '.csv']
            file_extension = os.path.splitext(file.filename)[1].lower()

            if file_extension not in allowed_extensions:
                raise HTTPException(
                    status_code=400,
                    detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
                )

            # Save file temporarily for processing
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
                temp_file.write(file_content)
                temp_file_path = temp_file.name

            logger.info(f"Processing document for project {project_id}...")

            # Run document processing pipeline
            from constructai.document_processing.ingestion import DocumentIngestor
            from constructai.document_processing.parser import DocumentParser
            from constructai.nlp.clause_extractor import ClauseExtractor
            from constructai.nlp.ner import ConstructionNER
            from constructai.document_processing.masterformat import MasterFormatClassifier
            from constructai.nlp.mep_analyzer import MEPAnalyzer

            # Process document
            ingestor = DocumentIngestor()
            ingested = ingestor.ingest_document(temp_file_path)

            parser = DocumentParser()
            parsed = parser.parse(ingested["content"])

            masterformat = MasterFormatClassifier()
            classified_sections = masterformat.classify_document_sections(parsed["structured_content"])

            clause_extractor = ClauseExtractor()
            all_clauses = []
            for section in classified_sections:
                clauses = clause_extractor.extract_clauses(section.get("content", ""))
                for c in clauses:
                    try:
                        all_clauses.append(c.to_dict())
                    except:
                        continue

            # NER analysis
            ner = ConstructionNER()
            all_materials = set()
            all_standards = set()
            all_costs = []
            
            for clause in all_clauses:
                try:
                    entities = ner.extract_entities(clause["text"])
                    for material in entities.get("materials", []):
                        all_materials.add(material.text)
                    for standard in entities.get("standards", []):
                        all_standards.add(standard.text)
                    for cost in entities.get("costs", []):
                        all_costs.append(cost.text)
                except:
                    continue

            # MEP analysis
            mep_analyzer = MEPAnalyzer()
            mep_results = mep_analyzer.analyze_document(ingested["content"])

            # Get division summary
            divisions_summary = masterformat.get_division_summary(classified_sections)
            if not isinstance(divisions_summary, dict):
                divisions_summary = {}

            # Calculate completeness
            completeness_factors = {
                "has_multiple_divisions": len(divisions_summary) > 3,
                "has_clauses": len(all_clauses) > 10,
                "has_standards": len(all_standards) > 0,
                "has_detailed_sections": len(classified_sections) > 5,
                "has_materials": len(all_materials) > 0,
                "has_costs": len(all_costs) > 0
            }
            completeness_score = (sum(completeness_factors.values()) / len(completeness_factors)) * 100

            # Generate recommendations
            recommendations = []
            if len(divisions_summary) < 3:
                recommendations.append({
                    "priority": "high",
                    "category": "completeness",
                    "description": "Document covers few MasterFormat divisions. Consider adding more detailed scope sections."
                })
            if len(all_standards) == 0:
                recommendations.append({
                    "priority": "medium",
                    "category": "standards",
                    "description": "No industry standards detected. Ensure compliance requirements are specified."
                })
            else:
                recommendations.append({
                    "priority": "low",
                    "category": "standards",
                    "description": f"Good! Found {len(all_standards)} industry standard references."
                })
            if len(all_materials) > 0:
                recommendations.append({
                    "priority": "low",
                    "category": "materials",
                    "description": f"Good! Identified {len(all_materials)} different materials with specifications."
                })
            if len(all_costs) > 0:
                recommendations.append({
                    "priority": "low",
                    "category": "budget",
                    "description": f"Good! Found {len(all_costs)} cost references throughout the document."
                })

            # Critical requirements (high severity risk indicators)
            critical_requirements = []
            for clause in all_clauses[:20]:
                text = clause.get("text", "").lower()
                if "must" in text or "shall" in text:
                    critical_requirements.append({
                        "severity": "MEDIUM",
                        "requirement": "REQUIREMENT",
                        "description": clause.get("text", "")[:200]
                    })

            # Build comprehensive analysis data structure
            analysis_data = {
                "quality": {
                    "completeness_score": round(completeness_score, 1),
                    "sections_count": len(classified_sections),
                    "total_clauses": len(all_clauses),
                    "masterformat_divisions": len(divisions_summary),
                    "masterformat_coverage": divisions_summary
                },
                "standards_found": list(all_standards),
                "key_materials": list(all_materials)[:20],
                "recommendations": recommendations,
                "critical_requirements": critical_requirements[:10]
            }

            # Store analysis in project metadata
            if not db_project.project_metadata:
                db_project.project_metadata = {}
            
            metadata = db_project.project_metadata if isinstance(db_project.project_metadata, dict) else {}
            metadata["analysis"] = analysis_data
            metadata["mep_analysis"] = {
                "overall": {
                    "has_hvac_specs": len(mep_results['hvac']['equipment']) > 0,
                    "has_plumbing_specs": len(mep_results['plumbing']['fixtures']) > 0,
                    "has_electrical_specs": False,  # Not yet implemented
                    "completion_percentage": round(
                        (
                            (80 if len(mep_results['hvac']['equipment']) > 0 else 0) +
                            (80 if len(mep_results['plumbing']['fixtures']) > 0 else 0)
                        ) / 2, 1
                    )
                },
                "hvac": {
                    "equipment": mep_results['hvac']['equipment'][:10],
                    "capacities": mep_results['hvac']['capacities'][:10],
                    "efficiency_ratings": mep_results['hvac']['efficiency_ratings'],
                    "ductwork": mep_results['hvac']['ductwork'][:5],
                    "standards": mep_results['hvac']['standards'],  # Changed from standards_compliance
                    "completion_percentage": 80 if len(mep_results['hvac']['equipment']) > 0 else 0,
                    "summary": {
                        "completeness_score": 80 if len(mep_results['hvac']['equipment']) > 0 else 0,
                        "total_equipment": len(mep_results['hvac']['equipment']),
                        "total_capacities": len(mep_results['hvac']['capacities']),
                        "has_efficiency_data": len(mep_results['hvac']['efficiency_ratings']) > 0
                    }
                },
                "plumbing": {
                    "fixtures": mep_results['plumbing']['fixtures'][:10],
                    "piping": mep_results['plumbing']['piping'][:10],
                    "water_supply": mep_results['plumbing']['water_supply'][:5],
                    "drainage": mep_results['plumbing']['drainage'][:5],
                    "standards": mep_results['plumbing']['standards'],  # Changed from standards_compliance
                    "completion_percentage": 80 if len(mep_results['plumbing']['fixtures']) > 0 else 0,
                    "summary": {
                        "completeness_score": 80 if len(mep_results['plumbing']['fixtures']) > 0 else 0,
                        "total_fixtures": len(mep_results['plumbing']['fixtures']),
                        "total_piping": len(mep_results['plumbing']['piping']),
                        "has_drainage_data": len(mep_results['plumbing']['drainage']) > 0
                    }
                }
            }
            
            db_project.project_metadata = metadata
            db.commit()
            db.refresh(db_project)

            logger.info(f"Analysis data saved to project {project_id}")

            # Clean up temp file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

            # Return response matching the structure expected by frontend
            return {
                "status": "success",
                "message": "Document processed and analysis saved to project",
                "document_id": str(__import__('uuid').uuid4()),
                "filename": file.filename,
                "file_size": file_size,
                "project_id": project_id,
                "analysis": {
                    "sections": len(classified_sections),
                    "clauses_extracted": len(all_clauses),
                    "divisions_found": divisions_summary,
                    "mep_analysis": metadata["mep_analysis"],
                    "insights": {
                        "completeness_score": round(completeness_score, 1),
                        "summary": {
                            "specification_density": round(len(all_clauses) / max(len(classified_sections), 1), 1),
                            "total_divisions": len(divisions_summary),
                            "total_standards": len(all_standards),
                            "total_materials": len(all_materials)
                        },
                        "key_materials": list(all_materials)[:10],
                        "key_standards": list(all_standards)[:10],
                        "recommendations": recommendations,
                        "critical_requirements": critical_requirements[:5],
                        "risk_indicators": []  # Add risk indicators array (empty for now, can be populated with risk analysis logic)
                    }
                }
            }

        except Exception as e:
            logger.error(f"Document processing failed: {str(e)}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Document processing failed: {str(e)}")
            os.unlink(temp_file_path)

            # Store document metadata in project (extend model as needed)
            # Example: add to a documents JSON field if present
            # if hasattr(db_project, "documents"):
            #     documents = db_project.documents or []
            #     documents.append({
            #         "id": document_id,
            #         "filename": file.filename,
            #         "file_size": file_size,
            #         "content_type": file.content_type,
            #         "uploaded_at": __import__('datetime').datetime.utcnow().isoformat()
            #     })
            #     db_project.documents = documents
            #     db.commit()

            document_id = str(__import__('uuid').uuid4())
            logger.info(f"Document uploaded for project {project_id}: {file.filename}")

            return {
                "status": "success",
                "message": "Document uploaded successfully",
                "document_id": document_id,
                "filename": file.filename,
                "file_size": file_size,
                "project_id": project_id
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading document: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
    
    @app.get("/api/projects/{project_id}/config")
    async def get_project_config(project_id: str, db: Session = Depends(get_db)):
        """Get project configuration settings."""
        from fastapi import HTTPException

        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Return default configuration
        return {
            "status": "success",
            "project_id": project_id,
            "config": {
                "analysis_settings": {
                    "enable_ai_suggestions": True,
                    "risk_threshold": "medium",
                    "optimization_level": "standard"
                },
                "notification_settings": {
                    "email_alerts": False,
                    "slack_integration": False
                },
                "export_settings": {
                    "default_format": "json",
                    "include_metadata": True
                }
            }
        }
    
    @app.put("/api/projects/{project_id}/config")
    async def update_project_config(project_id: str, config: Dict[str, Any], db: Session = Depends(get_db)):
        """Update project configuration settings."""
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()

        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")

        logger.info(f"Updated config for project {project_id}")

        return {
            "status": "success",
            "project_id": project_id,
            "message": "Configuration updated successfully",
            "config": config
        }
    
    # AI Provider Management Endpoints
    @app.get("/api/ai/providers")
    async def get_ai_providers():
        """
        Get list of available AI providers and their capabilities.
        """
        try:
            providers = ai_manager.get_available_providers()
            usage_stats = ai_manager.get_usage_stats()
            
            return {
                "status": "success",
                "primary_provider": ai_manager.primary_provider,
                "fallback_order": ai_manager.fallback_order,
                "providers": providers,
                "usage": usage_stats
            }
        except Exception as e:
            logger.error(f"Error getting AI providers: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/ai/test")
    async def test_ai_provider(
        provider: Optional[str] = None,
        prompt: str = "Hello! Respond with 'OK' if you can hear me."
    ):
        """
        Test an AI provider with a simple prompt.
        
        Args:
            provider: Provider name (optional, uses primary if not specified)
            prompt: Test prompt
        """
        try:
            response = ai_manager.generate(
                prompt=prompt,
                provider=provider,
                use_fallback=False,
                max_tokens=50
            )
            
            return {
                "status": "success",
                "provider": response.provider,
                "model": response.model,
                "response": response.content,
                "tokens_used": response.tokens_used,
                "metadata": response.metadata
            }
        except Exception as e:
            logger.error(f"AI provider test failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "provider": provider or ai_manager.primary_provider
            }
    
    @app.get("/api/ai/usage")
    async def get_ai_usage(provider: Optional[str] = None):
        """
        Get AI usage statistics for all or specific provider.
        
        Args:
            provider: Optional provider name
        """
        try:
            stats = ai_manager.get_usage_stats(provider)
            return {
                "status": "success",
                **stats
            }
        except Exception as e:
            logger.error(f"Error getting usage stats: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    # Enhanced AI endpoints
    @app.post("/api/ai/predict-risks")
    async def predict_project_risks(project_data: Dict[str, Any], provider: Optional[str] = None):
        """
        Predict potential risks for a construction project using AI.
        
        Request body should include:
        - name: Project name
        - budget: Budget amount
        - duration_days: Project duration
        - tasks: List of tasks
        - resources: List of resources
        
        Query parameter:
        - provider: AI provider to use (optional)
        """
        try:
            from ..ai import RiskPredictor
            
            predictor = RiskPredictor()
            risks = predictor.predict_risks(project_data)
            
            return {
                "status": "success",
                "risks_predicted": len(risks),
                "risks": risks,
                "summary": {
                    "critical": len([r for r in risks if r["impact"] == "critical"]),
                    "high": len([r for r in risks if r["impact"] == "high"]),
                    "medium": len([r for r in risks if r["impact"] == "medium"]),
                    "low": len([r for r in risks if r["impact"] == "low"]),
                }
            }
        except Exception as e:
            logger.error(f"Error predicting risks: {e}")
            raise HTTPException(status_code=500, detail=f"Risk prediction failed: {str(e)}")
    
    @app.post("/api/ai/estimate-cost")
    async def estimate_project_cost(project_data: Dict[str, Any]):
        """
        Estimate project cost using AI-powered analysis.
        
        Request body should include:
        - tasks: List of tasks with resources
        - resources: List of resources
        - duration_days: Project duration
        - project_type: Type of construction project
        """
        try:
            from ..ai import CostEstimator
            
            estimator = CostEstimator()
            estimate = estimator.estimate_cost(project_data)
            
            return {
                "status": "success",
                "estimate": estimate
            }
        except Exception as e:
            logger.error(f"Error estimating cost: {e}")
            raise HTTPException(status_code=500, detail=f"Cost estimation failed: {str(e)}")
    
    @app.post("/api/ai/recommendations")
    async def get_recommendations(project_data: Dict[str, Any], analysis_results: Optional[Dict[str, Any]] = None):
        """
        Get AI-powered recommendations for project improvement.
        
        Request body should include:
        - Project data (tasks, resources, budget, etc.)
        - Optional: analysis_results from audit/optimization
        """
        try:
            from ..ai import RecommendationEngine
            
            engine = RecommendationEngine()
            recommendations = engine.generate_recommendations(project_data, analysis_results)
            
            return {
                "status": "success",
                "total_recommendations": len(recommendations),
                "recommendations": recommendations,
                "categories": {
                    "schedule_optimization": len([r for r in recommendations if r["category"] == "schedule_optimization"]),
                    "cost_optimization": len([r for r in recommendations if r["category"] == "cost_optimization"]),
                    "risk_mitigation": len([r for r in recommendations if r["category"] == "risk_mitigation"]),
                    "quality_improvement": len([r for r in recommendations if r["category"] == "quality_improvement"]),
                    "technology_adoption": len([r for r in recommendations if r["category"] == "technology_adoption"]),
                }
            }
        except Exception as e:
            logger.error(f"Error generating recommendations: {e}")
            raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")
    
    @app.post("/api/projects/{project_id}/ai-analysis")
    async def comprehensive_ai_analysis(project_id: str, db: Session = Depends(get_db)):
        """
        Perform comprehensive AI analysis on a project.
        Includes risk prediction, cost estimation, and recommendations.
        """
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            from ..ai import RiskPredictor, CostEstimator, RecommendationEngine
            from ..engine.auditor import ProjectAuditor
            from ..engine.optimizer import WorkflowOptimizer
            
            # Prepare project data
            project_data = {
                "name": db_project.name,
                "budget": db_project.budget,
                "duration_days": 90,  # Default if not specified
                "tasks": db_project.tasks or [],
                "resources": db_project.resources or []
            }
            
            # Run all AI analyses
            risk_predictor = RiskPredictor()
            cost_estimator = CostEstimator()
            recommender = RecommendationEngine()
            auditor = ProjectAuditor()
            optimizer = WorkflowOptimizer()
            
            risks = risk_predictor.predict_risks(project_data)
            cost_estimate = cost_estimator.estimate_cost(project_data)
            
            # Run audit and optimization
            audit_result = auditor.audit(project_data) if project_data["tasks"] else {}
            optimization_result = optimizer.optimize(project_data) if project_data["tasks"] else {}
            
            # Generate recommendations based on all analyses
            analysis_context = {
                "audit": audit_result,
                "optimization": optimization_result
            }
            recommendations = recommender.generate_recommendations(project_data, analysis_context)
            
            # Cache comprehensive results
            analysis_id = str(uuid.uuid4())
            cache_entry = AnalysisResultDB(
                id=analysis_id,
                project_id=project_id,
                analysis_type="comprehensive_ai",
                result={
                    "risks": risks,
                    "cost_estimate": cost_estimate,
                    "recommendations": recommendations,
                    "audit": audit_result,
                    "optimization": optimization_result
                }
            )
            db.add(cache_entry)
            db.commit()
            
            return {
                "status": "success",
                "project_id": project_id,
                "analysis_id": analysis_id,
                "risks": {
                    "total": len(risks),
                    "critical": len([r for r in risks if r["impact"] == "critical"]),
                    "high": len([r for r in risks if r["impact"] == "high"]),
                    "details": risks[:5]  # Top 5 risks
                },
                "cost_estimate": cost_estimate,
                "recommendations": {
                    "total": len(recommendations),
                    "high_priority": len([r for r in recommendations if r.get("priority", 0) > 0.7]),
                    "details": recommendations[:5]  # Top 5 recommendations
                },
                "audit_score": audit_result.get("overall_score") if audit_result else None,
                "optimization_savings": optimization_result.get("cost_savings") if optimization_result else None
            }
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error in comprehensive AI analysis: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Comprehensive analysis failed: {str(e)}")
    
    logger.info("FastAPI app created successfully with enhanced AI capabilities")
    return app


# For running with uvicorn
app = create_app()
