"""
Universal Document Intelligence System

This module provides AI-powered universal document analysis that adapts to ANY document type:
- Construction specifications
- Proposals and bids
- Contracts and agreements
- RFPs and RFQs
- Schedules and timelines
- Safety plans
- Quality plans
- Meeting minutes
- Change orders
- Submittals
- And ANY other construction-related document

The system uses advanced AI to:
1. Intelligently detect document type and structure
2. Extract relevant information regardless of format
3. Generate context-aware insights
4. Provide actionable recommendations
"""

import logging
from typing import Dict, Any, List, Optional
from constructai.ai.providers.manager import AIModelManager
from constructai.ai.prompts import get_prompt_engineer, TaskType, PromptContext

logger = logging.getLogger(__name__)


class UniversalDocumentIntelligence:
    """
    Universal AI-powered document intelligence system that adapts to any document type.
    """
    
    def __init__(self):
        self.ai_manager = AIModelManager()
        self.prompt_engineer = get_prompt_engineer()
        logger.info("🌍 Universal Document Intelligence System initialized")
    
    async def classify_document(self, document_content: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Use AI to intelligently classify document type and structure.
        
        Returns:
            {
                "document_type": str,  # e.g., "construction_specification", "proposal", "contract"
                "structure_type": str,  # e.g., "master_format", "free_form", "tabular"
                "key_sections": List[str],  # Detected sections
                "information_density": str,  # "low", "medium", "high"
                "primary_focus": List[str],  # e.g., ["costs", "technical", "compliance"]
                "confidence": float
            }
        """
        logger.info("🔍 Classifying document with AI...")
        
        doc_preview = document_content[:3000]
        
        classification_prompt = self.prompt_engineer.get_prompt(
            task_type=TaskType.DOCUMENT_ANALYSIS,
            context={
                "document_content": doc_preview,  # Changed from document_preview to document_content
                "task": """Analyze this document and provide a JSON response with:
                {
                    "document_type": "one of: construction_specification, proposal, bid, contract, rfp, rfq, schedule, safety_plan, quality_plan, submittal, change_order, meeting_minutes, drawing_notes, or other",
                    "structure_type": "one of: master_format, csi_format, free_form, tabular, narrative",
                    "key_sections": ["list", "of", "section", "names"],
                    "information_density": "low/medium/high",
                    "primary_focus": ["technical", "financial", "schedule", "compliance", "safety", "quality"],
                    "has_costs": true/false,
                    "has_technical_specs": true/false,
                    "has_schedule": true/false,
                    "confidence": 0.0-1.0
                }"""
            },
            prompt_context=PromptContext(
                document_type="universal",
                custom_context=metadata or {}
            )
        )
        
        try:
            response = self.ai_manager.generate(
                prompt=f"{classification_prompt['system_prompt']}\n\n{classification_prompt['user_prompt']}",
                max_tokens=600,
                temperature=0.2,
                task_type="classification"
            )
            
            # Try to parse JSON response
            import json
            import re
            
            content = response.content.strip()
            
            # Try multiple JSON extraction strategies
            # 1. Look for JSON in code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            # 2. Look for standalone JSON object
            elif '{' in content and '}' in content:
                # Extract everything from first { to last }
                start = content.find('{')
                end = content.rfind('}') + 1
                content = content[start:end]
            
            classification = json.loads(content)
            logger.info(f"✅ Document classified as: {classification.get('document_type', 'unknown')}")
            return classification
            
        except Exception as e:
            logger.error(f"AI classification failed: {e}")
            logger.debug(f"AI response content: {response.content[:200] if 'response' in locals() else 'No response'}")
            return {
                "document_type": "unknown",
                "structure_type": "free_form",
                "key_sections": [],
                "information_density": "medium",
                "primary_focus": ["general"],
                "has_costs": False,
                "has_technical_specs": False,
                "has_schedule": False,
                "confidence": 0.3
            }
    
    async def extract_universal_entities(self, document_content: str, classification: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract key entities from ANY document type using AI.
        
        Returns:
            {
                "companies": List[str],
                "people": List[str],
                "dates": List[str],
                "costs": List[Dict],
                "requirements": List[str],
                "risks": List[str],
                "materials": List[str],
                "equipment": List[str],
                "standards": List[str],
                "locations": List[str],
                "key_terms": List[str]
            }
        """
        logger.info("🔍 Extracting entities with AI...")
        
        doc_type = classification.get('document_type', 'unknown')
        
        extraction_prompt = self.prompt_engineer.get_prompt(
            task_type=TaskType.DOCUMENT_ANALYSIS,  # Changed from NER_EXTRACTION (no template exists)
            context={
                "document_content": document_content[:8000],
                "document_type": doc_type,
                "task": f"""Extract ALL key information from this {doc_type} document. Return JSON:
                {{
                    "companies": ["company names"],
                    "people": ["person names and roles"],
                    "dates": ["important dates with context"],
                    "costs": [{{"item": "description", "amount": "value", "type": "labor/material/equipment/etc"}}],
                    "requirements": ["key requirements, specifications, or obligations"],
                    "risks": ["identified risks, concerns, or issues"],
                    "materials": ["construction materials mentioned"],
                    "equipment": ["equipment, tools, or machinery"],
                    "standards": ["codes, standards, or regulations"],
                    "locations": ["project locations or site references"],
                    "key_terms": ["important technical or legal terms"],
                    "summary": "3-sentence summary of document"
                }}"""
            },
            prompt_context=PromptContext(
                document_type=doc_type,
                custom_context={}
            )
        )
        
        try:
            response = self.ai_manager.generate(
                prompt=f"{extraction_prompt['system_prompt']}\n\n{extraction_prompt['user_prompt']}",
                max_tokens=1500,
                temperature=0.2,
                task_type="extraction"
            )
            
            import json
            import re
            
            content = response.content.strip()
            
            # Try multiple JSON extraction strategies
            # 1. Look for JSON in code blocks
            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', content, re.DOTALL)
            if json_match:
                content = json_match.group(1)
            # 2. Look for standalone JSON object
            elif '{' in content and '}' in content:
                start = content.find('{')
                end = content.rfind('}') + 1
                content = content[start:end]
            
            entities = json.loads(content)
            logger.info(f"✅ Extracted entities from {doc_type}")
            return entities
            
        except Exception as e:
            logger.error(f"AI entity extraction failed: {e}")
            logger.debug(f"AI response content: {response.content[:200] if 'response' in locals() else 'No response'}")
            return {
                "companies": [],
                "people": [],
                "dates": [],
                "costs": [],
                "requirements": [],
                "risks": [],
                "materials": [],
                "equipment": [],
                "standards": [],
                "locations": [],
                "key_terms": [],
                "summary": "Entity extraction failed"
            }
    
    async def calculate_quality_metrics(
        self,
        document_content: str,
        classification: Dict[str, Any],
        entities: Dict[str, Any],
        traditional_analysis: Dict[str, Any]
    ) -> Dict[str, float]:
        """
        Calculate universal quality metrics that work for ANY document type.
        
        Returns quality metrics (0.0 to 1.0):
            - completeness: How complete is the document?
            - clarity: How clear and well-structured?
            - information_richness: How much useful information?
            - actionability: How actionable are the insights?
        """
        logger.info("📊 Calculating universal quality metrics...")
        
        # Base metrics on actual content
        doc_length = len(document_content)
        entities_count = sum(len(v) if isinstance(v, list) else 1 for v in entities.values())
        
        # Completeness: Based on information density and entity extraction
        completeness_factors = []
        if entities_count > 10:
            completeness_factors.append(0.3)
        if entities_count > 30:
            completeness_factors.append(0.3)
        if entities['costs']:
            completeness_factors.append(0.15)
        if entities['requirements']:
            completeness_factors.append(0.15)
        if entities['standards']:
            completeness_factors.append(0.1)
        
        completeness = sum(completeness_factors) if completeness_factors else 0.1
        
        # Clarity: Based on structure and confidence
        clarity = classification.get('confidence', 0.5)
        if classification.get('structure_type') in ['master_format', 'csi_format', 'tabular']:
            clarity = min(1.0, clarity + 0.2)
        
        # Information Richness: Based on entities and content
        richness = min(1.0, entities_count / 100)
        if richness < 0.1:
            richness = 0.1  # Minimum baseline
        
        # Actionability: Based on recommendations potential
        actionability = 0.5  # Baseline
        if entities['requirements']:
            actionability += 0.2
        if entities['risks']:
            actionability += 0.15
        if entities['costs']:
            actionability += 0.15
        actionability = min(1.0, actionability)
        
        return {
            "completeness": round(completeness, 3),
            "clarity": round(clarity, 3),
            "information_richness": round(richness, 3),
            "actionability": round(actionability, 3),
            "overall_quality": round((completeness + clarity + richness + actionability) / 4, 3)
        }
