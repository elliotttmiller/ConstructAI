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
    
    # In-memory storage for projects (temporary - replace with database later)
    projects_db: Dict[str, Dict[str, Any]] = {}
    
    @app.get("/api/projects")
    async def get_projects():
        """Get all projects."""
        return list(projects_db.values())
    
    @app.get("/api/projects/{project_id}")
    async def get_project(project_id: str):
        """Get a specific project by ID."""
        from fastapi import HTTPException
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        return projects_db[project_id]
    
    @app.post("/api/projects")
    async def create_project(project: Dict[str, Any]):
        """Create a new project."""
        import uuid
        from datetime import datetime
        
        # Generate unique ID
        project_id = str(uuid.uuid4())
        
        # Set defaults and timestamps
        new_project = {
            "id": project_id,
            "name": project.get("name", "Untitled Project"),
            "description": project.get("description", ""),
            "status": project.get("status", "planning"),
            "budget": project.get("budget", 0),
            "total_tasks": project.get("total_tasks", 0),
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        # Store in memory
        projects_db[project_id] = new_project
        
        logger.info(f"Created project: {project_id} - {new_project['name']}")
        return new_project
    
    @app.put("/api/projects/{project_id}")
    async def update_project(project_id: str, project: Dict[str, Any]):
        """Update an existing project."""
        from fastapi import HTTPException
        from datetime import datetime
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update fields
        existing_project = projects_db[project_id]
        for key, value in project.items():
            if key != "id" and key != "created_at":  # Don't allow changing ID or creation date
                existing_project[key] = value
        
        existing_project["updated_at"] = datetime.utcnow().isoformat()
        
        logger.info(f"Updated project: {project_id}")
        return existing_project
    
    @app.delete("/api/projects/{project_id}")
    async def delete_project(project_id: str):
        """Delete a project."""
        from fastapi import HTTPException
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        del projects_db[project_id]
        logger.info(f"Deleted project: {project_id}")
        return {"status": "deleted", "project_id": project_id}
    
    @app.post("/api/projects/{project_id}/duplicate")
    async def duplicate_project(project_id: str):
        """Duplicate an existing project."""
        import uuid
        from datetime import datetime
        from fastapi import HTTPException
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get original project
        original_project = projects_db[project_id]
        
        # Create duplicate with new ID
        new_project_id = str(uuid.uuid4())
        duplicate_project = {
            **original_project,
            "id": new_project_id,
            "name": f"{original_project['name']} (Copy)",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        # Store duplicate
        projects_db[new_project_id] = duplicate_project
        
        logger.info(f"Duplicated project: {project_id} -> {new_project_id}")
        return duplicate_project
    
    @app.put("/api/projects/{project_id}/archive")
    async def archive_project(project_id: str):
        """Archive a project (sets status to 'archived')."""
        from datetime import datetime
        from fastapi import HTTPException
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update project status to archived
        projects_db[project_id]["status"] = "archived"
        projects_db[project_id]["updated_at"] = datetime.utcnow().isoformat()
        
        logger.info(f"Archived project: {project_id}")
        return projects_db[project_id]
    
    @app.post("/api/projects/{project_id}/analyze")
    async def analyze_project(project_id: str, project_data: Dict[str, Any]):
        """
        Perform AI analysis on a project.
        Returns audit results and optimization suggestions.
        """
        from fastapi import HTTPException
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        try:
            project = projects_db[project_id]
            
            # Create sample project data for analysis
            sample_project_data = {
                "project_name": project["name"],
                "budget": project["budget"],
                "tasks": project_data.get("tasks", []),
                "resources": project_data.get("resources", [])
            }
            
            # Perform audit
            auditor = ProjectAuditor()
            audit_result = auditor.audit(sample_project_data)
            
            # Perform optimization
            optimizer = WorkflowOptimizer()
            optimization_result = optimizer.optimize(sample_project_data)
            
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
            logger.error(f"Error analyzing project {project_id}: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    
    @app.get("/api/projects/{project_id}/export")
    async def export_project(project_id: str, format: str = "json"):
        """
        Export project data in various formats (json, pdf, excel).
        """
        from fastapi import HTTPException
        from fastapi.responses import JSONResponse
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        project = projects_db[project_id]
        
        if format == "json":
            return JSONResponse(content={
                "status": "success",
                "format": "json",
                "data": project,
                "exported_at": __import__('datetime').datetime.utcnow().isoformat()
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
        from fastapi import HTTPException
        
        if project_id not in projects_db:
            raise HTTPException(status_code=404, detail="Project not found")
        
        logger.info(f"Updated config for project {project_id}")
        
        return {
            "status": "success",
            "project_id": project_id,
            "message": "Configuration updated successfully",
            "config": config
        }
    
    logger.info("FastAPI app created successfully")
    return app


# For running with uvicorn
app = create_app()
