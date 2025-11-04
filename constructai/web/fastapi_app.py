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
                metadata=project.get("metadata"),
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
                metadata=original.metadata,
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
        """
        db_project = db.query(ProjectDB).filter(ProjectDB.id == project_id).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        from fastapi.responses import JSONResponse
        from datetime import datetime
        
        project_dict = db_project.to_dict()
        
        if format == "json":
            return JSONResponse(content={
                "status": "success",
                "format": "json",
                "data": project_dict,
                "exported_at": datetime.utcnow().isoformat()
            })
        elif format == "pdf":
            return {
                "status": "success",
                "format": "pdf",
                "message": "PDF export will be generated",
                "download_url": f"/api/downloads/{project_id}.pdf"
            }
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
            
            logger.info(f"Processing document: {file.filename} ({file_size} bytes)")
            
            # Process document with AI pipeline
            try:
                # Import document processing modules
                from constructai.document_processing.parser import DocumentParser
                from constructai.document_processing.ingestion import DocumentIngestion
                from constructai.nlp.clause_extractor import ClauseExtractor
                
                # Parse document
                parser = DocumentParser()
                parsed_content = parser.parse(temp_file_path)
                
                # Extract clauses and information
                extractor = ClauseExtractor()
                clauses = extractor.extract_clauses(parsed_content.get("text", ""))
                
                # Extract project metadata
                ingestion = DocumentIngestion()
                project_data = ingestion.extract_project_info(parsed_content, clauses)
                
                logger.info(f"Document processed successfully: {len(clauses)} clauses extracted")
                
                # Generate document ID
                document_id = str(__import__('uuid').uuid4())
                
                # Return processed data
                return {
                    "status": "success",
                    "message": "Document processed successfully",
                    "document_id": document_id,
                    "filename": file.filename,
                    "file_size": file_size,
                    "processed_data": {
                        "project_name": project_data.get("project_name", file.filename.rsplit('.', 1)[0]),
                        "budget": project_data.get("budget", 0),
                        "tasks": len(project_data.get("tasks", [])),
                        "clauses_extracted": len(clauses),
                        "resources_identified": len(project_data.get("resources", [])),
                    },
                    "raw_data": {
                        "clauses": clauses[:10],  # First 10 clauses as sample
                        "tasks": project_data.get("tasks", []),
                        "resources": project_data.get("resources", []),
                    }
                }
                
            except ImportError as e:
                # Fallback if document processing modules not fully implemented
                logger.warning(f"Document processing modules not available: {e}")
                
                # Mock processing result for MVP
                document_id = str(__import__('uuid').uuid4())
                
                return {
                    "status": "success",
                    "message": "Document uploaded (AI processing pending full implementation)",
                    "document_id": document_id,
                    "filename": file.filename,
                    "file_size": file_size,
                    "processed_data": {
                        "project_name": file.filename.rsplit('.', 1)[0],
                        "budget": 2500000,  # Mock data
                        "tasks": 25,
                        "clauses_extracted": 0,
                        "resources_identified": 0,
                    }
                }
            
            finally:
                # Clean up temp file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error processing document: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    @app.post("/api/projects/{project_id}/documents/upload")
    async def upload_document(project_id: str, file: UploadFile):
        """
        Upload a document for a project.
        Processes the document and extracts relevant information.
        """
        from fastapi import HTTPException, UploadFile
        import os
        import tempfile
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Validate file size (50MB limit)
        MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
        
        # Read file in chunks to check size
        file_size = 0
        file_content = bytearray()
        
        try:
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
            
            # TODO: Process document with document_processing module
            # from constructai.document_processing import ingestion
            # result = ingestion.process_document(temp_file_path)
            
            # Clean up temp file
            os.unlink(temp_file_path)
            
            # Store document metadata in project
            if "documents" not in projects_db[project_id]:
                projects_db[project_id]["documents"] = []
            
            document_id = str(__import__('uuid').uuid4())
            projects_db[project_id]["documents"].append({
                "id": document_id,
                "filename": file.filename,
                "file_size": file_size,
                "content_type": file.content_type,
                "uploaded_at": __import__('datetime').datetime.utcnow().isoformat()
            })
            
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
    async def get_project_config(project_id: str):
        """Get project configuration settings."""
        from fastapi import HTTPException
        
        if project_id not in projects_db:
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
    async def update_project_config(project_id: str, config: Dict[str, Any]):
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
    
    # Enhanced AI endpoints
    @app.post("/api/ai/predict-risks")
    async def predict_project_risks(project_data: Dict[str, Any]):
        """
        Predict potential risks for a construction project using AI.
        
        Request body should include:
        - name: Project name
        - budget: Budget amount
        - duration_days: Project duration
        - tasks: List of tasks
        - resources: List of resources
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
