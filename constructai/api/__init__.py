"""
REST API interface for ConstructAI.
"""

from typing import Dict, Any, Optional
from datetime import datetime
import json
import logging

from ..models.project import Project
from ..engine.auditor import ProjectAuditor
from ..engine.optimizer import WorkflowOptimizer
from ..engine.compliance import ComplianceChecker
from ..utils.data_io import ProjectDataHandler


# Configure logging
logger = logging.getLogger(__name__)


class ConstructAIAPI:
    """
    REST API interface for ConstructAI services.
    
    This class provides a programmatic interface that can be wrapped
    by web frameworks like Flask, FastAPI, or Django.
    """
    
    def __init__(self):
        self.auditor = ProjectAuditor()
        self.optimizer = WorkflowOptimizer()
        self.compliance_checker = ComplianceChecker()
        self.data_handler = ProjectDataHandler()
    
    def audit_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Audit a project from JSON data.
        
        Args:
            project_data: Project data as dictionary
            
        Returns:
            Audit results as dictionary
        """
        try:
            # Convert dict to Project object
            project = self.data_handler._dict_to_project(project_data)
            
            # Run audit
            result = self.auditor.audit(project)
            
            # Return summary
            return {
                "status": "success",
                "data": result.generate_summary()
            }
        except ValueError as e:
            # Log full error for debugging
            logger.error(f"Validation error in audit_project: {e}")
            return {
                "status": "error",
                "message": "Invalid project data format"
            }
        except Exception as e:
            # Log full error for debugging but don't expose to user
            logger.error(f"Error in audit_project: {e}", exc_info=True)
            return {
                "status": "error",
                "message": "An error occurred while auditing the project"
            }
    
    def optimize_project(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Optimize a project from JSON data.
        
        Args:
            project_data: Project data as dictionary
            
        Returns:
            Optimization results as dictionary
        """
        try:
            # Convert dict to Project object
            project = self.data_handler._dict_to_project(project_data)
            
            # Run optimization
            result = self.optimizer.optimize(project)
            
            # Return summary and optimized project
            return {
                "status": "success",
                "data": {
                    "summary": result.generate_summary(),
                    "optimized_project": self.data_handler._project_to_dict(result.optimized_project)
                }
            }
        except ValueError as e:
            logger.error(f"Validation error in optimize_project: {e}")
            return {
                "status": "error",
                "message": "Invalid project data format"
            }
        except Exception as e:
            logger.error(f"Error in optimize_project: {e}", exc_info=True)
            return {
                "status": "error",
                "message": "An error occurred while optimizing the project"
            }
    
    def check_compliance(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check project compliance from JSON data.
        
        Args:
            project_data: Project data as dictionary
            
        Returns:
            Compliance results as dictionary
        """
        try:
            # Convert dict to Project object
            project = self.data_handler._dict_to_project(project_data)
            
            # Run compliance check
            results = self.compliance_checker.check_all(project)
            
            return {
                "status": "success",
                "data": results
            }
        except ValueError as e:
            logger.error(f"Validation error in check_compliance: {e}")
            return {
                "status": "error",
                "message": "Invalid project data format"
            }
        except Exception as e:
            logger.error(f"Error in check_compliance: {e}", exc_info=True)
            return {
                "status": "error",
                "message": "An error occurred while checking compliance"
            }
    
    def full_analysis(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Run full analysis (audit + optimize + compliance).
        
        Args:
            project_data: Project data as dictionary
            
        Returns:
            Combined results as dictionary
        """
        try:
            # Convert dict to Project object
            project = self.data_handler._dict_to_project(project_data)
            
            # Run all analyses
            audit_result = self.auditor.audit(project)
            opt_result = self.optimizer.optimize(project)
            compliance_results = self.compliance_checker.check_all(project)
            
            return {
                "status": "success",
                "data": {
                    "audit": audit_result.generate_summary(),
                    "optimization": opt_result.generate_summary(),
                    "compliance": compliance_results,
                    "optimized_project": self.data_handler._project_to_dict(opt_result.optimized_project)
                }
            }
        except ValueError as e:
            logger.error(f"Validation error in full_analysis: {e}")
            return {
                "status": "error",
                "message": "Invalid project data format"
            }
        except Exception as e:
            logger.error(f"Error in full_analysis: {e}", exc_info=True)
            return {
                "status": "error",
                "message": "An error occurred during analysis"
            }
    
    def get_project_summary(self, project_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get basic project summary.
        
        Args:
            project_data: Project data as dictionary
            
        Returns:
            Project summary as dictionary
        """
        try:
            project = self.data_handler._dict_to_project(project_data)
            
            return {
                "status": "success",
                "data": {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "budget": project.budget,
                    "total_tasks": len(project.tasks),
                    "total_cost": project.calculate_total_cost(),
                    "start_date": project.start_date.isoformat() if project.start_date else None,
                    "target_end_date": project.target_end_date.isoformat() if project.target_end_date else None
                }
            }
        except ValueError as e:
            logger.error(f"Validation error in get_project_summary: {e}")
            return {
                "status": "error",
                "message": "Invalid project data format"
            }
        except Exception as e:
            logger.error(f"Error in get_project_summary: {e}", exc_info=True)
            return {
                "status": "error",
                "message": "An error occurred while getting project summary"
            }


def create_flask_app():
    """
    Create a Flask application with ConstructAI API endpoints.
    
    This is an optional feature that requires Flask to be installed.
    
    Returns:
        Flask app instance
    """
    try:
        from flask import Flask, request, jsonify
    except ImportError:
        raise ImportError("Flask is required for the web API. Install with: pip install flask")
    
    app = Flask(__name__)
    api = ConstructAIAPI()
    
    @app.route('/api/v1/audit', methods=['POST'])
    def audit():
        """Audit project endpoint."""
        data = request.get_json()
        result = api.audit_project(data)
        return jsonify(result)
    
    @app.route('/api/v1/optimize', methods=['POST'])
    def optimize():
        """Optimize project endpoint."""
        data = request.get_json()
        result = api.optimize_project(data)
        return jsonify(result)
    
    @app.route('/api/v1/compliance', methods=['POST'])
    def compliance():
        """Check compliance endpoint."""
        data = request.get_json()
        result = api.check_compliance(data)
        return jsonify(result)
    
    @app.route('/api/v1/analyze', methods=['POST'])
    def analyze():
        """Full analysis endpoint."""
        data = request.get_json()
        result = api.full_analysis(data)
        return jsonify(result)
    
    @app.route('/api/v1/summary', methods=['POST'])
    def summary():
        """Project summary endpoint."""
        data = request.get_json()
        result = api.get_project_summary(data)
        return jsonify(result)
    
    @app.route('/api/v1/health', methods=['GET'])
    def health():
        """Health check endpoint."""
        return jsonify({
            "status": "healthy",
            "version": "0.1.0",
            "service": "ConstructAI"
        })
    
    return app
