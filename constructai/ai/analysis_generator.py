"""
AI-Powered Construction Analysis Generator.

Uses advanced prompt engineering and LLM intelligence to generate:
- Project insights and recommendations
- Execution strategies
- Risk assessments
- Cost analysis
- Procurement recommendations
"""

import logging
from typing import Dict, List, Any, Optional
import json

logger = logging.getLogger(__name__)

try:
    from .prompts import get_prompt_engineer, TaskType, PromptContext
    from .providers.manager import AIModelManager
    from .construction_ontology import ConstructionOntology
    PROMPTS_AVAILABLE = True
except ImportError as e:
    logger.error(f"Failed to import AI modules: {e}")
    PROMPTS_AVAILABLE = False


class ConstructionAnalysisGenerator:
    """
    AI-powered generator for construction project analysis and recommendations.
    Uses advanced prompt engineering for high-quality, context-aware outputs.
    """
    
    def __init__(self):
        """Initialize the analysis generator with AI model and prompt engineer."""
        if not PROMPTS_AVAILABLE:
            raise ImportError("AI modules not available. Check imports.")
        
        self.ai_manager = AIModelManager()
        self.prompt_engineer = get_prompt_engineer()
        self.ontology = ConstructionOntology()
        logger.info("ConstructionAnalysisGenerator initialized with AI capabilities")
    
    def generate_recommendations(
        self,
        project_data: Dict[str, Any],
        analysis_results: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Generate AI-powered recommendations based on project analysis.
        
        Args:
            project_data: Project metadata and context
            analysis_results: Results from document processing (NER, MEP, clauses, etc.)
            
        Returns:
            List of AI-generated recommendations with priority, category, and message
        """
        try:
            # Build context for AI
            context = PromptContext(
                document_type="construction_specification",
                project_phase="execution_planning",
                user_role="project_manager"
            )
            
            # Prepare analysis summary for AI
            analysis_summary = self._prepare_analysis_summary(analysis_results)
            
            # Generate prompt using the correct method name
            prompt_data = self.prompt_engineer.get_prompt(
                task_type=TaskType.RECOMMENDATION_GENERATION,
                context={
                    "project_name": project_data.get("name", "Unknown Project"),
                    "analysis_summary": analysis_summary,
                    "divisions_found": analysis_results.get("divisions_summary", {}),
                    "materials_count": len(analysis_results.get("materials", [])),
                    "standards_count": len(analysis_results.get("standards", [])),
                    "clauses_count": analysis_results.get("clauses_count", 0),
                    "mep_data": analysis_results.get("mep_analysis", {})
                },
                prompt_context=context
            )
            
            # Call AI model - construct full prompt from system and user prompts
            full_prompt = f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
            
            response = self.ai_manager.generate(
                prompt=full_prompt,
                max_tokens=prompt_data.get("max_tokens", 2000),
                temperature=prompt_data.get("temperature", 0.7),
                task_type="recommendation_generation"
            )
            
            # Parse AI response into structured recommendations
            recommendations = self._parse_recommendations(response.content)
            
            logger.info(f"Generated {len(recommendations)} AI-powered recommendations")
            return recommendations
            
        except Exception as e:
            logger.error(f"Failed to generate AI recommendations: {e}", exc_info=True)
            # Return empty list instead of fallback - let the PDF handle missing data
            return []
    
    def generate_project_intelligence(
        self,
        project_data: Dict[str, Any],
        analysis_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered project intelligence and scope analysis.
        
        Returns:
            Dict with project_overview, characteristics, key_insights
        """
        try:
            context = PromptContext(
                document_type="construction_specification",
                project_phase="planning",
                user_role="project_executive"
            )
            
            analysis_summary = self._prepare_analysis_summary(analysis_results)
            
            prompt_data = self.prompt_engineer.get_prompt(
                task_type=TaskType.DOCUMENT_ANALYSIS,
                context={
                    "project_name": project_data.get("name", "Project"),
                    "analysis_summary": analysis_summary,
                    "divisions": str(analysis_results.get("divisions_summary", {})),
                    "materials": str(analysis_results.get("materials", [])[:20]),
                    "standards": str(analysis_results.get("standards", [])[:20]),
                    "mep_analysis": str(analysis_results.get("mep_analysis", {})),
                    "task": "Generate comprehensive project intelligence including: 1) Project scope overview, 2) Key project characteristics, 3) Construction type and complexity, 4) Critical systems and components. Be specific and actionable."
                },
                prompt_context=context
            )
            
            full_prompt = f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
            
            response = self.ai_manager.generate(
                prompt=full_prompt,
                max_tokens=prompt_data.get("max_tokens", 1500),
                temperature=prompt_data.get("temperature", 0.6),
                task_type="project_intelligence"
            )
            
            intelligence = self._parse_project_intelligence(response.content)
            logger.info("Generated AI-powered project intelligence")
            return intelligence
            
        except Exception as e:
            logger.error(f"Failed to generate project intelligence: {e}", exc_info=True)
            return {}
    
    def generate_execution_strategy(
        self,
        project_data: Dict[str, Any],
        analysis_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered construction execution strategy.
        
        Returns:
            Dict with construction_phases, critical_path_items, sequencing_strategy
        """
        try:
            context = PromptContext(
                document_type="construction_specification",
                project_phase="execution_planning",
                user_role="construction_manager"
            )
            
            prompt_data = self.prompt_engineer.get_prompt(
                task_type=TaskType.WORKFLOW_OPTIMIZATION,
                context={
                    "project_name": project_data.get("name", "Project"),
                    "divisions": str(analysis_results.get("divisions_summary", {})),
                    "mep_systems": str(analysis_results.get("mep_analysis", {})),
                    "materials": str(analysis_results.get("materials", [])[:15]),
                    "task": "Generate detailed construction execution strategy including: 1) Phased construction sequence with specific tasks, 2) Critical path and long-lead items with lead times, 3) Sequencing recommendations for optimal efficiency. Be specific about actual construction activities."
                },
                prompt_context=context
            )
            
            full_prompt = f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
            
            response = self.ai_manager.generate(
                prompt=full_prompt,
                max_tokens=prompt_data.get("max_tokens", 2000),
                temperature=prompt_data.get("temperature", 0.7),
                task_type="execution_strategy"
            )
            
            strategy = self._parse_execution_strategy(response.content)
            logger.info("Generated AI-powered execution strategy")
            return strategy
            
        except Exception as e:
            logger.error(f"Failed to generate execution strategy: {e}", exc_info=True)
            return {}
    
    def generate_risk_analysis(
        self,
        project_data: Dict[str, Any],
        analysis_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered risk analysis and mitigation strategies.
        
        Returns:
            Dict with safety_considerations, schedule_risks, quality_control
        """
        try:
            context = PromptContext(
                document_type="construction_specification",
                project_phase="risk_assessment",
                user_role="safety_manager"
            )
            
            prompt_data = self.prompt_engineer.get_prompt(
                task_type=TaskType.RISK_PREDICTION,
                context={
                    "project_name": project_data.get("name", "Project"),
                    "divisions": str(analysis_results.get("divisions_summary", {})),
                    "materials": str(analysis_results.get("materials", [])[:20]),
                    "standards": str(analysis_results.get("standards", [])[:20]),
                    "mep_systems": str(analysis_results.get("mep_analysis", {})),
                    "task": "Analyze project risks and generate: 1) Safety considerations and OSHA compliance items, 2) Schedule risk factors and mitigation, 3) Quality control checkpoints. Be specific about actual risks for this project type."
                },
                prompt_context=context
            )
            
            full_prompt = f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
            
            response = self.ai_manager.generate(
                prompt=full_prompt,
                max_tokens=prompt_data.get("max_tokens", 1800),
                temperature=prompt_data.get("temperature", 0.6),
                task_type="risk_analysis"
            )
            
            risk_analysis = self._parse_risk_analysis(response.content)
            logger.info("Generated AI-powered risk analysis")
            return risk_analysis
            
        except Exception as e:
            logger.error(f"Failed to generate risk analysis: {e}", exc_info=True)
            return {}
    
    def generate_procurement_strategy(
        self,
        project_data: Dict[str, Any],
        analysis_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered procurement and material strategy.
        
        Returns:
            Dict with procurement_phases, sourcing_strategy, value_engineering
        """
        try:
            context = PromptContext(
                document_type="construction_specification",
                project_phase="procurement",
                user_role="procurement_manager"
            )
            
            prompt_data = self.prompt_engineer.get_prompt(
                task_type=TaskType.COST_ESTIMATION,
                context={
                    "project_name": project_data.get("name", "Project"),
                    "divisions": str(analysis_results.get("divisions_summary", {})),
                    "materials": str(analysis_results.get("materials", [])[:25]),
                    "mep_equipment": str(self._extract_mep_equipment(analysis_results.get("mep_analysis", {}))),
                    "task": "Generate procurement strategy including: 1) Phased procurement timeline with specific items and lead times, 2) Material sourcing considerations, 3) Value engineering opportunities. Be specific about actual materials and equipment."
                },
                prompt_context=context
            )
            
            full_prompt = f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
            
            response = self.ai_manager.generate(
                prompt=full_prompt,
                max_tokens=prompt_data.get("max_tokens", 1800),
                temperature=prompt_data.get("temperature", 0.7),
                task_type="procurement_strategy"
            )
            
            procurement = self._parse_procurement_strategy(response.content)
            logger.info("Generated AI-powered procurement strategy")
            return procurement
            
        except Exception as e:
            logger.error(f"Failed to generate procurement strategy: {e}", exc_info=True)
            return {}
    
    def generate_cost_resource_analysis(
        self,
        project_data: Dict[str, Any],
        analysis_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate AI-powered cost breakdown and resource requirements.
        
        Returns:
            Dict with material_requirements, labor_trades, equipment_needs
        """
        try:
            context = PromptContext(
                document_type="construction_specification",
                project_phase="cost_planning",
                user_role="cost_estimator"
            )
            
            prompt_data = self.prompt_engineer.get_prompt(
                task_type=TaskType.COST_ESTIMATION,
                context={
                    "project_name": project_data.get("name", "Project"),
                    "divisions": str(analysis_results.get("divisions_summary", {})),
                    "materials": str(analysis_results.get("materials", [])[:30]),
                    "mep_systems": str(analysis_results.get("mep_analysis", {})),
                    "task": "Generate detailed cost and resource analysis including: 1) Material requirements by category, 2) Labor and trade requirements, 3) Major equipment needs. Be specific about quantities and types."
                },
                prompt_context=context
            )
            
            full_prompt = f"{prompt_data['system_prompt']}\n\n{prompt_data['user_prompt']}"
            
            response = self.ai_manager.generate(
                prompt=full_prompt,
                max_tokens=prompt_data.get("max_tokens", 1800),
                temperature=prompt_data.get("temperature", 0.6),
                task_type="cost_analysis"
            )
            
            cost_analysis = self._parse_cost_resource_analysis(response.content)
            logger.info("Generated AI-powered cost and resource analysis")
            return cost_analysis
            
        except Exception as e:
            logger.error(f"Failed to generate cost analysis: {e}", exc_info=True)
            return {}
    
    # Helper methods
    
    def _prepare_analysis_summary(self, analysis_results: Dict[str, Any]) -> str:
        """Prepare concise analysis summary for AI context."""
        divisions = analysis_results.get("divisions_summary", {})
        materials_count = len(analysis_results.get("materials", []))
        standards_count = len(analysis_results.get("standards", []))
        clauses_count = analysis_results.get("clauses_count", 0)
        
        mep = analysis_results.get("mep_analysis", {})
        has_hvac = mep.get("overall", {}).get("has_hvac_specs", False)
        has_plumbing = mep.get("overall", {}).get("has_plumbing_specs", False)
        
        summary = f"Project includes {len(divisions)} MasterFormat divisions, "
        summary += f"{clauses_count} specification clauses, "
        summary += f"{materials_count} identified materials, "
        summary += f"{standards_count} industry standards. "
        
        if has_hvac or has_plumbing:
            summary += "MEP systems: "
            if has_hvac:
                summary += "HVAC specified "
            if has_plumbing:
                summary += "Plumbing specified "
        
        return summary
    
    def _extract_mep_equipment(self, mep_analysis: Dict[str, Any]) -> List[str]:
        """Extract MEP equipment list for AI context."""
        equipment = []
        
        hvac = mep_analysis.get("hvac", {})
        if hvac.get("equipment"):
            equipment.extend([
                eq.get("type", str(eq)) if isinstance(eq, dict) else str(eq)
                for eq in hvac["equipment"][:5]
            ])
        
        plumbing = mep_analysis.get("plumbing", {})
        if plumbing.get("fixtures"):
            equipment.extend([
                fx.get("type", str(fx)) if isinstance(fx, dict) else str(fx)
                for fx in plumbing["fixtures"][:5]
            ])
        
        return equipment
    
    def _parse_recommendations(self, ai_response: str) -> List[Dict[str, Any]]:
        """Parse AI response into structured recommendations."""
        recommendations = []
        
        try:
            # Try to parse as JSON first
            if ai_response.strip().startswith('[') or ai_response.strip().startswith('{'):
                parsed = json.loads(ai_response)
                if isinstance(parsed, list):
                    return parsed
                elif isinstance(parsed, dict) and 'recommendations' in parsed:
                    return parsed['recommendations']
            
            # Otherwise, parse line by line
            lines = ai_response.strip().split('\n')
            current_rec = {}
            
            for line in lines:
                line = line.strip()
                if not line:
                    if current_rec:
                        recommendations.append(current_rec)
                        current_rec = {}
                    continue
                
                # Look for priority markers
                if any(p in line.lower() for p in ['high priority', 'critical', 'urgent']):
                    current_rec['priority'] = 'high'
                elif any(p in line.lower() for p in ['medium priority', 'important']):
                    current_rec['priority'] = 'medium'
                elif any(p in line.lower() for p in ['low priority', 'optional']):
                    current_rec['priority'] = 'low'
                
                # Look for category indicators
                if any(c in line.lower() for c in ['safety', 'osha']):
                    current_rec['category'] = 'safety'
                elif any(c in line.lower() for c in ['schedule', 'timeline']):
                    current_rec['category'] = 'schedule'
                elif any(c in line.lower() for c in ['cost', 'budget']):
                    current_rec['category'] = 'cost'
                elif any(c in line.lower() for c in ['quality', 'qc']):
                    current_rec['category'] = 'quality'
                elif any(c in line.lower() for c in ['material', 'procurement']):
                    current_rec['category'] = 'materials'
                else:
                    current_rec['category'] = current_rec.get('category', 'general')
                
                # Store the message
                if 'message' not in current_rec or len(line) > len(current_rec.get('message', '')):
                    current_rec['message'] = line.lstrip('-•* ')
            
            if current_rec and 'message' in current_rec:
                recommendations.append(current_rec)
            
        except Exception as e:
            logger.error(f"Failed to parse recommendations: {e}")
        
        # Ensure all recs have required fields
        for rec in recommendations:
            rec.setdefault('priority', 'medium')
            rec.setdefault('category', 'general')
            rec.setdefault('message', 'Review project specifications for completeness')
        
        return recommendations[:10]  # Limit to top 10
    
    def _parse_project_intelligence(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into project intelligence structure."""
        return {
            "overview": ai_response,
            "characteristics": [],
            "insights": ai_response
        }
    
    def _parse_execution_strategy(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into execution strategy structure."""
        return {
            "phases": [],
            "critical_items": [],
            "strategy_text": ai_response
        }
    
    def _parse_risk_analysis(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into risk analysis structure."""
        return {
            "safety_items": [],
            "schedule_risks": [],
            "quality_checkpoints": [],
            "analysis_text": ai_response
        }
    
    def _parse_procurement_strategy(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into procurement strategy structure."""
        return {
            "procurement_phases": [],
            "sourcing_tips": [],
            "ve_opportunities": [],
            "strategy_text": ai_response
        }
    
    def _parse_cost_resource_analysis(self, ai_response: str) -> Dict[str, Any]:
        """Parse AI response into cost/resource analysis structure."""
        return {
            "material_categories": {},
            "labor_trades": [],
            "equipment_list": [],
            "analysis_text": ai_response
        }
