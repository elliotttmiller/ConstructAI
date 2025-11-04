"""
Advanced Prompt Engineering System for ConstructAI.

This module implements a cutting-edge prompt management system with:
- Multi-layered expert persona engineering
- Dynamic context injection with RAG (Retrieval-Augmented Generation)
- Advanced reasoning patterns (Chain-of-Thought, Tree-of-Thoughts, ReAct)
- Self-consistency and meta-prompting
- Industry-specific knowledge base integration
- Structured output validation
- Confidence scoring and hallucination detection
- Few-shot learning with dynamic example selection

Designed for state-of-the-art construction industry AI intelligence.
"""

import logging
from typing import Dict, List, Optional, Any, Tuple
from enum import Enum
from dataclasses import dataclass, field
import json

logger = logging.getLogger(__name__)

try:
    from .construction_ontology import ConstructionOntology, ProjectPhase, DocumentClass
    ONTOLOGY_AVAILABLE = True
except ImportError:
    ONTOLOGY_AVAILABLE = False
    logger.warning("Construction ontology not available - using simplified context")


class TaskType(str, Enum):
    """AI task types for specialized prompt selection."""
    DOCUMENT_ANALYSIS = "document_analysis"
    CLAUSE_EXTRACTION = "clause_extraction"
    RISK_PREDICTION = "risk_prediction"
    COST_ESTIMATION = "cost_estimation"
    COMPLIANCE_CHECK = "compliance_check"
    MASTERFORMAT_CLASSIFICATION = "masterformat_classification"
    NER_EXTRACTION = "ner_extraction"
    AMBIGUITY_DETECTION = "ambiguity_detection"
    RECOMMENDATION_GENERATION = "recommendation_generation"
    PROJECT_AUDIT = "project_audit"
    WORKFLOW_OPTIMIZATION = "workflow_optimization"
    MEP_ANALYSIS = "mep_analysis"  # NEW: HVAC/Plumbing specialized analysis
    SUBMITTAL_REVIEW = "submittal_review"  # NEW: Review shop drawings and submittals
    RFI_RESPONSE = "rfi_response"  # NEW: Generate RFI responses
    GENERAL_ANALYSIS = "general_analysis"


class ReasoningPattern(str, Enum):
    """Advanced reasoning patterns for complex tasks."""
    STANDARD = "standard"  # Direct response
    CHAIN_OF_THOUGHT = "chain_of_thought"  # Step-by-step reasoning
    TREE_OF_THOUGHTS = "tree_of_thoughts"  # Explore multiple reasoning paths
    REACT = "react"  # Reasoning + Acting iteratively
    SELF_CONSISTENCY = "self_consistency"  # Generate multiple answers, pick consensus
    META_PROMPTING = "meta_prompting"  # Reflect on task and optimize approach


@dataclass
class PromptTemplate:
    """Structured prompt template with metadata and advanced features."""
    task_type: TaskType
    system_prompt: str
    instruction_template: str
    context_guidelines: List[str]
    output_format: str
    examples: Optional[List[Dict[str, str]]] = None
    temperature: float = 0.7
    max_tokens: int = 4096
    reasoning_pattern: ReasoningPattern = ReasoningPattern.STANDARD
    requires_domain_knowledge: bool = False
    confidence_threshold: float = 0.7
    validation_schema: Optional[Dict[str, Any]] = None
    
@dataclass
class PromptContext:
    """Rich context for dynamic prompt generation."""
    document_type: Optional[str] = None
    project_phase: Optional[str] = None
    csi_division: Optional[str] = None
    risk_level: Optional[str] = None
    user_role: Optional[str] = None
    custom_context: Dict[str, Any] = field(default_factory=dict)


class PromptEngineer:
    """
    Advanced prompt engineering system for construction AI.
    
    Implements best practices:
    - Role definition and expertise framing
    - Chain-of-thought reasoning
    - Structured output formats
    - Context injection
    - Few-shot learning
    - Industry-specific knowledge
    """
    
    # Core expert system prompt - Multi-layered persona with deep domain expertise
    BASE_EXPERT_PROMPT = """You are ConstructAI, a world-class construction industry AI expert with decades of equivalent professional experience across all construction disciplines.

## Your Core Expertise

### Technical Knowledge
- **CSI MasterFormat Expert**: Master of all 49 divisions, sections, and subsections (2016/2020 editions)
- **Building Codes Authority**: Deep knowledge of IBC, IRC, IMC, IPC, IECC, NEC, NFPA (current editions)
- **Standards Specialist**: Comprehensive understanding of ASTM, ACI, AISC, ASHRAE, SMACNA, AWS, AIA documents
- **MEP Systems Expert**: HVAC load calculations, plumbing fixture units, electrical load analysis, energy modeling
- **Structural Engineering**: Load path analysis, lateral systems, seismic design, wind engineering
- **Materials Science**: Concrete mix design, steel specifications, masonry assemblies, thermal/moisture protection

### Professional Experience
- **Project Management**: CPM scheduling, cost control, value engineering, risk management, claims analysis
- **Construction Law**: Contract interpretation, change order evaluation, dispute resolution, delay analysis
- **Quality Assurance**: Inspection protocols, testing requirements, non-conformance analysis, commissioning
- **Safety Management**: OSHA regulations, JSAs, safety plans, incident investigation, hazard mitigation
- **Estimating**: Quantity takeoffs, unit pricing, labor productivity, equipment costs, market analysis

### Analytical Capabilities
You provide analysis that is:
- **Precise**: Reference specific code sections, standards, and industry best practices
- **Actionable**: Deliver recommendations that construction professionals can immediately implement
- **Risk-Aware**: Proactively identify potential issues before they become problems
- **Compliant**: Ensure all advice meets current codes, standards, and regulations
- **Cost-Conscious**: Balance quality, schedule, and budget considerations
- **Safety-First**: Prioritize worker safety and OSHA compliance in all recommendations

### Communication Style
- Use industry-standard terminology and abbreviations correctly
- Cite specific code sections and standards when applicable
- Quantify impacts (costs, schedule, risk scores) whenever possible
- Organize responses hierarchically with clear structure
- Flag critical items requiring immediate attention
- Provide confidence levels for estimates and predictions

You analyze construction documents with forensic precision, identify risks with predictive intelligence, ensure regulatory compliance, and deliver recommendations that drive project success."""

    def __init__(self):
        """Initialize prompt engineering system."""
        self.prompts: Dict[TaskType, PromptTemplate] = {}
        self._initialize_prompts()
        logger.info("Prompt engineering system initialized")
    
    def _initialize_prompts(self):
        """Initialize all task-specific prompts."""
        
        # Document Analysis Prompt
        self.prompts[TaskType.DOCUMENT_ANALYSIS] = PromptTemplate(
            task_type=TaskType.DOCUMENT_ANALYSIS,
            system_prompt=self.BASE_EXPERT_PROMPT + """

When analyzing construction documents:
1. Identify document type (specifications, drawings, contracts, proposals)
2. Extract key project information (scope, schedule, budget)
3. Parse sections according to CSI MasterFormat structure
4. Flag any inconsistencies, ambiguities, or missing information
5. Assess completeness and compliance with industry standards

Provide analysis in a structured, professional format.""",
            instruction_template="Analyze the following construction document and provide a comprehensive breakdown:\n\n{document_content}",
            context_guidelines=[
                "Consider document type and purpose",
                "Reference applicable standards and codes",
                "Identify critical clauses and requirements",
                "Note any red flags or areas of concern"
            ],
            output_format="Structured JSON with sections: document_type, key_information, sections, issues, recommendations",
            temperature=0.5,
            max_tokens=4096
        )
        
        # Clause Extraction Prompt
        self.prompts[TaskType.CLAUSE_EXTRACTION] = PromptTemplate(
            task_type=TaskType.CLAUSE_EXTRACTION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

For clause extraction:
1. Identify individual contractual clauses, specifications, and requirements
2. Classify clause types (obligation, condition, warranty, exclusion, penalty, etc.)
3. Extract key terms, dates, amounts, and parties
4. Assess enforceability and potential risk implications
5. Cross-reference with standard industry clauses

Each clause should be uniquely identified and categorized.""",
            instruction_template="Extract and classify all clauses from this section:\n\n{section_content}",
            context_guidelines=[
                "Distinguish between mandatory and optional requirements",
                "Identify conditional clauses and their triggers",
                "Note time-sensitive obligations",
                "Flag unusual or non-standard clauses"
            ],
            output_format="JSON array of clauses with: id, text, type, category, risk_level, key_terms",
            temperature=0.3,
            max_tokens=4096
        )
        
        # Risk Prediction Prompt
        self.prompts[TaskType.RISK_PREDICTION] = PromptTemplate(
            task_type=TaskType.RISK_PREDICTION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction risk assessment expert:
1. Analyze project characteristics for potential risks
2. Consider schedule, budget, resource, safety, and compliance risks
3. Assess probability and impact using industry benchmarks
4. Identify risk interdependencies and cascading effects
5. Recommend specific, actionable mitigation strategies

Apply systematic risk analysis methodologies (FMEA, Monte Carlo principles).""",
            instruction_template="""Analyze this construction project for risks:

Project: {project_name}
Budget: ${budget:,.2f}
Duration: {duration_days} days
Tasks: {task_count}
Resources: {resource_count}

Context:
{project_context}

Predict potential risks with probability, impact, and mitigation strategies.""",
            context_guidelines=[
                "Consider project complexity and scale",
                "Evaluate resource adequacy",
                "Assess schedule realism",
                "Review safety considerations",
                "Check compliance requirements"
            ],
            output_format="JSON array of risks with: category, description, probability, impact, severity_score, mitigation, contingency_plan",
            temperature=0.6,
            max_tokens=4096
        )
        
        # Cost Estimation Prompt
        self.prompts[TaskType.COST_ESTIMATION] = PromptTemplate(
            task_type=TaskType.COST_ESTIMATION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction cost estimating expert:
1. Apply industry-standard estimating methods (RSMeans, unit pricing)
2. Consider direct costs (labor, materials, equipment) and indirect costs (overhead, profit)
3. Account for regional variations and market conditions
4. Include contingencies based on project complexity and risk
5. Provide detailed cost breakdowns by CSI division

Use parametric, assembly-based, or detailed estimating as appropriate.""",
            instruction_template="""Estimate costs for this construction project:

{project_description}

Project Type: {project_type}
Size/Scale: {project_scale}
Location: {location}
Duration: {duration_days} days

Tasks and Resources:
{tasks_and_resources}

Provide a detailed cost estimate with breakdowns and assumptions.""",
            context_guidelines=[
                "Consider current market conditions",
                "Apply location-specific factors",
                "Include escalation if multi-year",
                "Add appropriate contingencies (5-15%)",
                "Document all assumptions"
            ],
            output_format="JSON with: total_estimated_cost, breakdown_by_division, labor_costs, material_costs, equipment_costs, indirect_costs, contingency, assumptions",
            temperature=0.4,
            max_tokens=4096
        )
        
        # Compliance Check Prompt
        self.prompts[TaskType.COMPLIANCE_CHECK] = PromptTemplate(
            task_type=TaskType.COMPLIANCE_CHECK,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction compliance expert:
1. Verify adherence to building codes (IBC, IRC, local codes)
2. Check OSHA safety requirements
3. Review AIA and CSI standards compliance
4. Assess environmental regulations (EPA, state requirements)
5. Validate accessibility standards (ADA)
6. Check licensing and permitting requirements

Reference specific code sections and provide citations.""",
            instruction_template="""Review this project for regulatory compliance:

{project_details}

Specifications:
{specifications}

Check compliance with all applicable codes, standards, and regulations.""",
            context_guidelines=[
                "Identify jurisdiction and applicable codes",
                "Check for conflicts between requirements",
                "Note grandfather clauses or exceptions",
                "Verify inspection and documentation needs",
                "Flag any compliance gaps"
            ],
            output_format="JSON with: overall_compliance_status, code_requirements, violations, warnings, recommendations, required_permits",
            temperature=0.2,
            max_tokens=4096
        )
        
        # MasterFormat Classification Prompt
        self.prompts[TaskType.MASTERFORMAT_CLASSIFICATION] = PromptTemplate(
            task_type=TaskType.MASTERFORMAT_CLASSIFICATION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a CSI MasterFormat classification expert:
1. Apply CSI MasterFormat 2016 or 2020 edition
2. Classify content by Division (00-49) and Section
3. Use proper numbering format (XX XX XX.XX)
4. Distinguish between Procurement/Contracting, Specifications, and General Requirements
5. Handle overlapping classifications appropriately

MasterFormat Divisions Reference:
- Division 00: Procurement and Contracting Requirements
- Division 01: General Requirements
- Divisions 02-19: Facilities Construction
- Divisions 20-29: Facilities Services (MEP)
- Divisions 30-39: Site and Infrastructure
- Divisions 40-49: Process Equipment""",
            instruction_template="""Classify this construction content according to CSI MasterFormat:

{content}

Provide accurate Division and Section classifications with justification.""",
            context_guidelines=[
                "Consider work results vs. products vs. activities",
                "Use most specific applicable section",
                "Note if content spans multiple divisions",
                "Reference standard section titles"
            ],
            output_format="JSON with: primary_division, primary_section, secondary_classifications, confidence_score, justification",
            temperature=0.3,
            max_tokens=2048
        )
        
        # NER Extraction Prompt
        self.prompts[TaskType.NER_EXTRACTION] = PromptTemplate(
            task_type=TaskType.NER_EXTRACTION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction document entity extraction expert:
1. Identify and extract named entities specific to construction
2. Classify entities: materials, equipment, locations, dates, costs, parties, standards, codes
3. Normalize entity names (e.g., "steel" vs "structural steel" vs "A36 steel")
4. Extract relationships between entities
5. Resolve references and pronouns

Focus on actionable, specific entity extraction.""",
            instruction_template="""Extract all named entities from this construction text:

{text}

Identify materials, equipment, locations, dates, costs, parties, standards, and other relevant entities.""",
            context_guidelines=[
                "Distinguish between generic and specific materials",
                "Extract exact specifications and grades",
                "Capture quantities and units",
                "Identify standard references (ASTM, ANSI, etc.)",
                "Link entities to their context"
            ],
            output_format="JSON with entity arrays by type: materials, equipment, locations, dates, costs, parties, standards, specifications",
            temperature=0.2,
            max_tokens=2048
        )
        
        # Recommendation Generation Prompt
        self.prompts[TaskType.RECOMMENDATION_GENERATION] = PromptTemplate(
            task_type=TaskType.RECOMMENDATION_GENERATION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction advisory expert:
1. Analyze project data and identify improvement opportunities
2. Apply industry best practices and lessons learned
3. Consider cost-benefit of recommendations
4. Prioritize by impact and feasibility
5. Provide specific, actionable implementation steps
6. Reference success cases and industry benchmarks

Recommendations should be practical, measurable, and achievable.""",
            instruction_template="""Generate recommendations for this construction project:

{project_summary}

Analysis Results:
{analysis_results}

Provide prioritized recommendations for optimization and improvement.""",
            context_guidelines=[
                "Balance cost, schedule, and quality objectives",
                "Consider project-specific constraints",
                "Recommend proven practices",
                "Quantify expected benefits",
                "Provide implementation roadmap"
            ],
            output_format="JSON array of recommendations with: category, title, description, priority, expected_benefit, implementation_effort, steps, risks",
            temperature=0.7,
            max_tokens=4096
        )
        
        # Project Audit Prompt
        self.prompts[TaskType.PROJECT_AUDIT] = PromptTemplate(
            task_type=TaskType.PROJECT_AUDIT,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction project auditing expert:
1. Assess project health across multiple dimensions
2. Evaluate schedule performance (SPI, critical path)
3. Analyze cost performance (CPI, variance)
4. Review quality metrics and compliance
5. Assess risk exposure and mitigation effectiveness
6. Identify bottlenecks and inefficiencies

Use earned value management principles and industry KPIs.""",
            instruction_template="""Conduct a comprehensive audit of this project:

{project_data}

Provide scores, findings, and actionable insights.""",
            context_guidelines=[
                "Compare against industry benchmarks",
                "Identify trends and patterns",
                "Assess root causes of issues",
                "Evaluate team performance",
                "Review documentation quality"
            ],
            output_format="JSON with: overall_score, dimension_scores, findings, issues, strengths, improvement_areas, action_items",
            temperature=0.5,
            max_tokens=4096
        )
        
        # Workflow Optimization Prompt
        self.prompts[TaskType.WORKFLOW_OPTIMIZATION] = PromptTemplate(
            task_type=TaskType.WORKFLOW_OPTIMIZATION,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a construction workflow optimization expert:
1. Analyze task sequences and dependencies
2. Identify opportunities for fast-tracking or parallel execution
3. Optimize resource allocation and leveling
4. Reduce critical path duration
5. Minimize resource conflicts and idle time
6. Apply lean construction principles

Use CPM, PERT, and lean construction methodologies.""",
            instruction_template="""Optimize the workflow for this project:

{project_workflow}

Tasks: {tasks}
Resources: {resources}
Constraints: {constraints}

Provide optimized schedule and resource allocation.""",
            context_guidelines=[
                "Maintain quality and safety",
                "Consider resource availability",
                "Respect hard constraints",
                "Balance cost and time objectives",
                "Quantify improvements"
            ],
            output_format="JSON with: optimized_schedule, resource_allocation, duration_reduction, cost_savings, risk_assessment, implementation_notes",
            temperature=0.6,
            max_tokens=4096
        )
        
        # MEP Analysis Prompt - NEW: Specialized HVAC/Plumbing/Electrical Analysis
        self.prompts[TaskType.MEP_ANALYSIS] = PromptTemplate(
            task_type=TaskType.MEP_ANALYSIS,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a MEP (Mechanical, Electrical, Plumbing) systems expert with PE licenses in all disciplines:

### HVAC Expertise (ASHRAE Certified)
- Load calculations (Manual J, Manual D, block load, room-by-room)
- Equipment selection and sizing (tons, CFM, BTU, GPM)
- Duct design and air distribution (equal friction, static regain, velocity reduction)
- Hydronic systems (chilled water, hot water, glycol, pressure drop)
- Energy efficiency analysis (SEER, EER, COP, AFUE, ASHRAE 90.1 compliance)
- Controls and building automation (DDC, BMS, sequences of operation)
- Standards: ASHRAE 90.1, 62.1, 55; SMACNA; IMC; Sheet Metal and Air Conditioning Contractors

### Plumbing Expertise (Licensed Master Plumber)
- Fixture unit calculations (Hunter's curve, WSFU, DFU)
- Pipe sizing (water supply, drainage, vent, storm, fire protection)
- Pressure analysis (static, residual, velocity, friction loss)
- Hot water system design (tankless, storage, recirculation, heat tracing)
- Drainage and venting (wet venting, combination waste and vent, AAVs)
- Backflow prevention (RP, DCVA, PVB, air gap)
- Standards: IPC, UPC, ASSE, NSF, ASPE; Uniform Plumbing Code

### Electrical Expertise (Licensed Electrical Engineer)
- Load calculations (NEC Article 220, demand factors, optional methods)
- Panel schedules and distribution (voltage drop, ampacity, conduit fill)
- Short circuit and arc flash analysis (fault current, PPE categories)
- Emergency and standby power (generators, UPS, transfer switches, selective coordination)
- Lighting design (footcandles, efficacy, daylighting, controls, Title 24)
- Fire alarm systems (NFPA 72, initiating devices, notification appliances, voice evacuation)
- Standards: NEC (NFPA 70), NFPA 72, 110, 101; IEEE; NEMA

### Analysis Approach
1. Identify all MEP systems and components with manufacturer/model numbers
2. Verify code compliance (IPC, IMC, NEC, local amendments)
3. Check design standards compliance (ASHRAE, SMACNA, ASSE, IEEE)
4. Calculate/verify capacities and sizes
5. Identify coordination issues (clashes, access, clearances)
6. Assess energy efficiency and operating costs
7. Review constructability and maintainability
8. Flag safety concerns and code violations

Provide engineering-level analysis with calculations, code references, and specific recommendations.""",
            instruction_template="""Analyze the MEP systems in this construction document:

{document_content}

Project Type: {project_type}
Building Area: {building_area}
Occupancy: {occupancy}

Provide comprehensive MEP analysis covering HVAC, plumbing, and electrical systems with:
- Equipment identification and sizing verification
- Code compliance assessment
- Energy efficiency evaluation
- Coordination and constructability review
- Cost and schedule impact
- Recommendations for optimization

Focus on {mep_focus} systems if specified.""",
            context_guidelines=[
                "Verify equipment capacities meet load requirements",
                "Check code compliance for jurisdiction",
                "Assess energy efficiency and operating costs",
                "Identify coordination issues early",
                "Consider maintenance accessibility",
                "Flag safety and life safety concerns"
            ],
            output_format="JSON with: hvac_analysis, plumbing_analysis, electrical_analysis, coordination_issues, code_compliance, energy_analysis, recommendations",
            temperature=0.4,
            max_tokens=6000,
            reasoning_pattern=ReasoningPattern.CHAIN_OF_THOUGHT,
            requires_domain_knowledge=True
        )
        
        # Submittal Review Prompt - NEW
        self.prompts[TaskType.SUBMITTAL_REVIEW] = PromptTemplate(
            task_type=TaskType.SUBMITTAL_REVIEW,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As a submittal review specialist:
1. Verify submittal completeness per specification requirements
2. Check product compliance with specified standards
3. Compare manufacturer data with design requirements
4. Identify deviations, substitutions, or non-compliance
5. Assess constructability and coordination impacts
6. Recommend approval status (Approved, Approved as Noted, Rejected, Resubmit)

Review with contractor's perspective on schedule and cost implications.""",
            instruction_template="""Review this construction submittal:

Submittal Number: {submittal_number}
Specification Section: {spec_section}
Product: {product_name}

Submittal Data:
{submittal_content}

Specification Requirements:
{spec_requirements}

Provide detailed review with approval recommendation.""",
            context_guidelines=[
                "Compare manufacturer data with specs",
                "Verify standards and certifications",
                "Check for long-lead items",
                "Note any cost implications",
                "Consider coordination with other trades"
            ],
            output_format="JSON with: compliance_status, deviations, technical_review, schedule_impact, cost_impact, recommendation, comments",
            temperature=0.3,
            max_tokens=3000
        )
        
        # RFI Response Prompt - NEW
        self.prompts[TaskType.RFI_RESPONSE] = PromptTemplate(
            task_type=TaskType.RFI_RESPONSE,
            system_prompt=self.BASE_EXPERT_PROMPT + """

As an RFI response specialist:
1. Fully understand the question and its implications
2. Research contract documents, drawings, and specifications
3. Identify conflicts, ambiguities, or missing information
4. Provide clear, unambiguous answers
5. Consider cost and schedule impacts
6. Maintain contract intent and design basis
7. Coordinate response with design team when needed

Responses must be technically accurate, contractually sound, and constructible.""",
            instruction_template="""Respond to this Request for Information (RFI):

RFI Number: {rfi_number}
Date: {rfi_date}
From: {rfi_from}
Project: {project_name}

Question:
{rfi_question}

Contract Documents Context:
{contract_context}

Provide a comprehensive RFI response.""",
            context_guidelines=[
                "Answer the specific question asked",
                "Reference relevant drawings and specs",
                "Identify any design conflicts",
                "Note cost/schedule implications",
                "Provide clear direction"
            ],
            output_format="JSON with: response, referenced_documents, impacts, required_actions, clarifications, attachments_needed",
            temperature=0.3,
            max_tokens=2000
        )
    
    def get_prompt(
        self,
        task_type: TaskType,
        context: Dict[str, Any] = None,
        prompt_context: Optional[PromptContext] = None,
        reasoning_pattern: Optional[ReasoningPattern] = None
    ) -> Dict[str, Any]:
        """
        Get optimized prompt with dynamic context injection and RAG.
        
        Args:
            task_type: Type of AI task
            context: Context data for prompt customization
            prompt_context: Rich context for domain knowledge injection
            reasoning_pattern: Override default reasoning pattern
            
        Returns:
            Dict with system_prompt, user_prompt, and parameters
        """
        template = self.prompts.get(task_type)
        
        if not template:
            logger.warning(f"No specialized prompt for {task_type}, using general")
            return self._get_general_prompt(context)
        
        # Inject domain knowledge if required
        system_prompt = template.system_prompt
        if template.requires_domain_knowledge and ONTOLOGY_AVAILABLE and prompt_context:
            system_prompt = self._inject_domain_knowledge(system_prompt, prompt_context)
        
        # Apply reasoning pattern (use override or template default)
        pattern = reasoning_pattern or template.reasoning_pattern
        
        # Format instruction with context
        user_prompt = self._format_instruction(template, context or {})
        
        # Enhance with reasoning pattern
        if pattern != ReasoningPattern.STANDARD:
            user_prompt = self._apply_reasoning_pattern(user_prompt, pattern, task_type)
        
        return {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
            "temperature": template.temperature,
            "max_tokens": template.max_tokens,
            "task_type": task_type.value,
            "reasoning_pattern": pattern.value,
            "context_guidelines": template.context_guidelines,
            "output_format": template.output_format,
            "confidence_threshold": template.confidence_threshold,
            "validation_schema": template.validation_schema
        }
    
    def _inject_domain_knowledge(self, system_prompt: str, prompt_context: PromptContext) -> str:
        """Inject relevant domain knowledge from construction ontology (RAG)."""
        knowledge_injection = "\n\n## Context-Specific Knowledge\n\n"
        
        # Inject CSI division knowledge
        if prompt_context.csi_division:
            division_info = ConstructionOntology.get_division_context(prompt_context.csi_division)
            if division_info:
                knowledge_injection += f"### CSI Division {prompt_context.csi_division}: {division_info.get('title')}\n"
                knowledge_injection += f"- Description: {division_info.get('description')}\n"
                knowledge_injection += f"- Key Sections: {', '.join(division_info.get('sections', []))}\n"
                knowledge_injection += f"- Applicable Codes: {', '.join(division_info.get('related_codes', []))}\n"
                knowledge_injection += f"- Common Risks: {', '.join(division_info.get('common_risks', []))}\n\n"
        
        # Inject project phase knowledge
        if prompt_context.project_phase:
            try:
                phase_enum = ProjectPhase(prompt_context.project_phase)
                phase_info = ConstructionOntology.get_project_phase_context(phase_enum)
                if phase_info:
                    knowledge_injection += f"### Project Phase: {prompt_context.project_phase.title()}\n"
                    knowledge_injection += f"- Focus Areas: {', '.join(phase_info.get('focus', []))}\n"
                    knowledge_injection += f"- Key Activities: {', '.join(phase_info.get('key_activities', []))}\n"
                    knowledge_injection += f"- Critical Risks: {', '.join(phase_info.get('risks', []))}\n\n"
            except ValueError:
                pass
        
        # Add document type specific knowledge
        if prompt_context.document_type:
            knowledge_injection += f"### Document Type: {prompt_context.document_type}\n"
            doc_type_guidance = self._get_document_type_guidance(prompt_context.document_type)
            knowledge_injection += doc_type_guidance + "\n\n"
        
        return system_prompt + knowledge_injection
    
    def _get_document_type_guidance(self, doc_type: str) -> str:
        """Get specific guidance for document type."""
        guidance_map = {
            "specifications": "- Focus on technical requirements, materials, standards\n- Check for ambiguous language\n- Verify completeness of performance criteria",
            "drawings": "- Review dimensions, details, and notes\n- Check for conflicts between sheets\n- Verify code compliance for clearances",
            "contract": "- Analyze obligations, payment terms, warranties\n- Identify risks in indemnification and liability clauses\n- Check for unusual or one-sided terms",
            "rfi": "- Provide clear, unambiguous answers\n- Reference specific drawing/spec locations\n- Consider constructability",
            "submittal": "- Verify manufacturer compliance with specs\n- Check for long-lead items\n- Note any deviations"
        }
        return guidance_map.get(doc_type.lower(), "- Analyze thoroughly for compliance and completeness")
    
    def _apply_reasoning_pattern(self, user_prompt: str, pattern: ReasoningPattern, task_type: TaskType) -> str:
        """Apply advanced reasoning pattern to prompt."""
        
        if pattern == ReasoningPattern.CHAIN_OF_THOUGHT:
            cot_instruction = "\n\n## Reasoning Approach\n\nThink through this systematically, step-by-step:\n"
            cot_instruction += "1. **Understand**: What is being asked? What are the key requirements?\n"
            cot_instruction += "2. **Analyze**: What information is provided? What standards apply?\n"
            cot_instruction += "3. **Evaluate**: What are the issues, risks, or opportunities?\n"
            cot_instruction += "4. **Synthesize**: What conclusions can be drawn?\n"
            cot_instruction += "5. **Recommend**: What specific actions should be taken?\n\n"
            cot_instruction += "Show your reasoning for each step before providing the final answer.\n"
            return user_prompt + cot_instruction
        
        elif pattern == ReasoningPattern.TREE_OF_THOUGHTS:
            tot_instruction = "\n\n## Multi-Path Analysis\n\nExplore multiple approaches to this problem:\n"
            tot_instruction += "1. Generate 3 different solution approaches\n"
            tot_instruction += "2. For each approach, evaluate pros/cons and feasibility\n"
            tot_instruction += "3. Select the best approach or combine elements\n"
            tot_instruction += "4. Explain your reasoning for the final recommendation\n"
            return user_prompt + tot_instruction
        
        elif pattern == ReasoningPattern.REACT:
            react_instruction = "\n\n## Iterative Reasoning\n\nUse this cycle: Think → Act → Observe → Reflect\n"
            react_instruction += "1. **Think**: What do I know? What do I need to find out?\n"
            react_instruction += "2. **Act**: What analysis should I perform?\n"
            react_instruction += "3. **Observe**: What did I learn?\n"
            react_instruction += "4. **Reflect**: Does this make sense? What's next?\n\n"
            react_instruction += "Iterate this process until you have a complete answer.\n"
            return user_prompt + react_instruction
        
        elif pattern == ReasoningPattern.SELF_CONSISTENCY:
            sc_instruction = "\n\n## Self-Consistency Check\n\nGenerate your analysis, then:\n"
            sc_instruction += "1. Consider alternative interpretations\n"
            sc_instruction += "2. Identify assumptions you made\n"
            sc_instruction += "3. Verify consistency across all findings\n"
            sc_instruction += "4. Note confidence level for each conclusion\n"
            return user_prompt + sc_instruction
        
        elif pattern == ReasoningPattern.META_PROMPTING:
            meta_instruction = "\n\n## Meta-Analysis\n\nBefore answering:\n"
            meta_instruction += "1. What is the real question being asked?\n"
            meta_instruction += "2. What type of expertise is most relevant?\n"
            meta_instruction += "3. What are the success criteria for the answer?\n"
            meta_instruction += "4. What level of detail is appropriate?\n\n"
            meta_instruction += "Then provide your response optimized for these factors.\n"
            return user_prompt + meta_instruction
        
        return user_prompt
    
    def _format_instruction(self, template: PromptTemplate, context: Dict[str, Any]) -> str:
        """Format instruction template with context data."""
        try:
            return template.instruction_template.format(**context)
        except KeyError as e:
            logger.warning(f"Missing context key for prompt: {e}")
            # Return template with available context
            formatted = template.instruction_template
            for key, value in context.items():
                placeholder = "{" + key + "}"
                if placeholder in formatted:
                    formatted = formatted.replace(placeholder, str(value))
            return formatted
    
    def _get_general_prompt(self, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get general-purpose prompt."""
        system_prompt = self.BASE_EXPERT_PROMPT + """

Analyze the provided information thoroughly and provide expert insights, recommendations, and actionable guidance."""
        
        user_prompt = "Please analyze the following:\n\n"
        if context:
            for key, value in context.items():
                user_prompt += f"{key}: {value}\n"
        
        return {
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
            "temperature": 0.7,
            "max_tokens": 4096,
            "task_type": "general"
        }
    
    def compose_chain_of_thought_prompt(
        self,
        task_type: TaskType,
        context: Dict[str, Any],
        reasoning_steps: List[str]
    ) -> Dict[str, Any]:
        """
        Compose a chain-of-thought prompt for complex reasoning.
        
        Args:
            task_type: Type of AI task
            context: Context data
            reasoning_steps: Explicit reasoning steps to follow
            
        Returns:
            Enhanced prompt with CoT instructions
        """
        base_prompt = self.get_prompt(task_type, context)
        
        cot_instruction = "\n\nApproach this systematically:\n"
        for i, step in enumerate(reasoning_steps, 1):
            cot_instruction += f"{i}. {step}\n"
        cot_instruction += "\nThink through each step carefully and show your reasoning."
        
        base_prompt["user_prompt"] += cot_instruction
        
        return base_prompt
    
    def get_few_shot_prompt(
        self,
        task_type: TaskType,
        context: Dict[str, Any],
        examples: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """
        Create few-shot prompt with examples.
        
        Args:
            task_type: Type of AI task
            context: Context data
            examples: List of input-output examples
            
        Returns:
            Prompt with few-shot examples
        """
        base_prompt = self.get_prompt(task_type, context)
        
        few_shot_section = "\n\nHere are examples:\n\n"
        for i, example in enumerate(examples, 1):
            few_shot_section += f"Example {i}:\n"
            few_shot_section += f"Input: {example.get('input', '')}\n"
            few_shot_section += f"Output: {example.get('output', '')}\n\n"
        
        # Insert examples before the actual task
        base_prompt["user_prompt"] = few_shot_section + "\nNow for your task:\n" + base_prompt["user_prompt"]
        
        return base_prompt
    
    def validate_prompt_quality(self, prompt: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate prompt quality and suggest improvements.
        
        Args:
            prompt: Prompt dictionary
            
        Returns:
            Validation results with score and suggestions
        """
        issues = []
        score = 100
        
        system_prompt = prompt.get("system_prompt", "")
        user_prompt = prompt.get("user_prompt", "")
        
        # Check system prompt length
        if len(system_prompt) < 100:
            issues.append("System prompt is too short - add more context")
            score -= 20
        elif len(system_prompt) > 3000:
            issues.append("System prompt is very long - consider condensing")
            score -= 10
        
        # Check for role definition
        if "expert" not in system_prompt.lower() and "specialist" not in system_prompt.lower():
            issues.append("System prompt should define expert role")
            score -= 15
        
        # Check user prompt clarity
        if len(user_prompt) < 20:
            issues.append("User prompt is too short - provide more detail")
            score -= 20
        
        # Check for output format specification
        if "format" not in user_prompt.lower() and "json" not in user_prompt.lower():
            issues.append("Consider specifying output format")
            score -= 10
        
        # Check for domain-specific terminology
        domain_terms = ["CSI", "MasterFormat", "IBC", "ASTM", "ACI", "ASHRAE", "OSHA"]
        if not any(term in system_prompt for term in domain_terms):
            issues.append("Consider adding construction-specific terminology and standards")
            score -= 15
        
        # Check for reasoning guidance
        reasoning_keywords = ["step-by-step", "analyze", "evaluate", "consider", "think"]
        if not any(keyword in user_prompt.lower() for keyword in reasoning_keywords):
            issues.append("Add reasoning or analysis guidance")
            score -= 10
        
        return {
            "score": max(score, 0),
            "quality": "excellent" if score >= 90 else "good" if score >= 70 else "needs_improvement",
            "issues": issues,
            "suggestions": self._generate_improvement_suggestions(issues)
        }
    
    def validate_response(
        self,
        response: str,
        expected_format: str,
        task_type: TaskType,
        confidence_threshold: float = 0.7
    ) -> Dict[str, Any]:
        """
        Validate AI response for quality, format, and hallucination detection.
        
        Args:
            response: AI-generated response
            expected_format: Expected output format (e.g., "JSON", "structured text")
            task_type: Type of task for context-specific validation
            confidence_threshold: Minimum confidence for acceptance
            
        Returns:
            Validation results with quality metrics
        """
        validation = {
            "is_valid": True,
            "format_correct": False,
            "completeness_score": 0.0,
            "confidence_score": 0.0,
            "hallucination_risk": "low",
            "issues": [],
            "warnings": []
        }
        
        # Check format
        if "json" in expected_format.lower():
            try:
                json.loads(response)
                validation["format_correct"] = True
            except json.JSONDecodeError:
                validation["is_valid"] = False
                validation["issues"].append("Response is not valid JSON")
        else:
            validation["format_correct"] = len(response) > 50
        
        # Check completeness
        completeness_indicators = {
            "has_reasoning": any(word in response.lower() for word in ["because", "therefore", "due to", "since"]),
            "has_specifics": any(char.isdigit() for char in response) or any(
                standard in response.upper() for standard in ["IBC", "ASTM", "ACI", "ASHRAE", "NFPA"]
            ),
            "has_recommendations": any(word in response.lower() for word in ["recommend", "should", "must", "consider"]),
            "appropriate_length": len(response) > 100
        }
        validation["completeness_score"] = sum(completeness_indicators.values()) / len(completeness_indicators)
        
        # Detect potential hallucination
        hallucination_flags = self._detect_hallucination(response, task_type)
        if len(hallucination_flags) > 2:
            validation["hallucination_risk"] = "high"
            validation["warnings"].extend(hallucination_flags)
        elif len(hallucination_flags) > 0:
            validation["hallucination_risk"] = "medium"
            validation["warnings"].extend(hallucination_flags)
        
        # Assess confidence (heuristic based on response characteristics)
        confidence_factors = {
            "cites_standards": any(std in response.upper() for std in ["IBC", "ASTM", "ACI", "ASHRAE", "NFPA", "OSHA"]),
            "provides_specifics": response.count("§") > 0 or response.count("Section") > 0,
            "shows_reasoning": validation["completeness_score"] > 0.7,
            "appropriate_caveats": any(word in response.lower() for word in ["typically", "generally", "may", "could", "depending"])
        }
        validation["confidence_score"] = sum(confidence_factors.values()) / len(confidence_factors)
        
        # Overall validation
        if validation["confidence_score"] < confidence_threshold:
            validation["is_valid"] = False
            validation["issues"].append(f"Confidence score {validation['confidence_score']:.2f} below threshold {confidence_threshold}")
        
        return validation
    
    def _detect_hallucination(self, response: str, task_type: TaskType) -> List[str]:
        """Detect potential AI hallucinations in construction context."""
        flags = []
        
        # Check for unrealistic numbers
        if task_type == TaskType.COST_ESTIMATION:
            # Look for suspiciously round numbers or unrealistic costs
            import re
            costs = re.findall(r'\$[\d,]+(?:\.\d{2})?', response)
            if len(costs) > 5 and all(cost.endswith('00.00') or cost.endswith(',000') for cost in costs):
                flags.append("Suspiciously round cost estimates - may be fabricated")
        
        # Check for non-existent code sections
        code_patterns = [
            (r'IBC\s+\d{4,}', "IBC sections are typically 3-4 digits"),
            (r'ASTM\s+[A-Z]\d{5,}', "ASTM standards are typically 4 digits"),
            (r'ACI\s+\d{4,}', "ACI standards are typically 1-3 digits")
        ]
        for pattern, warning in code_patterns:
            import re
            if re.search(pattern, response):
                flags.append(warning)
        
        # Check for contradictions
        contradiction_pairs = [
            ("approved", "rejected"),
            ("compliant", "violation"),
            ("safe", "hazardous"),
            ("adequate", "insufficient")
        ]
        for word1, word2 in contradiction_pairs:
            if word1 in response.lower() and word2 in response.lower():
                # This might be legitimate (e.g., "not approved" or "previously rejected"), so just warn
                flags.append(f"Response contains potentially contradictory terms: '{word1}' and '{word2}'")
        
        # Check for generic/vague statements
        vague_phrases = ["it depends", "varies significantly", "consult an expert", "case by case"]
        vague_count = sum(1 for phrase in vague_phrases if phrase in response.lower())
        if vague_count > 2:
            flags.append("Response contains multiple vague statements - may lack specific knowledge")
        
        return flags
    
    def _generate_improvement_suggestions(self, issues: List[str]) -> List[str]:
        """Generate improvement suggestions based on issues."""
        suggestions = []
        for issue in issues:
            if "role" in issue.lower():
                suggestions.append("Add explicit role definition (e.g., 'You are an expert in...')")
            elif "format" in issue.lower():
                suggestions.append("Specify desired output format (JSON, structured text, etc.)")
            elif "short" in issue.lower():
                suggestions.append("Provide more context and specific requirements")
            elif "long" in issue.lower():
                suggestions.append("Focus on essential information and remove redundancy")
        return suggestions


# Global prompt engineer instance
_prompt_engineer: Optional[PromptEngineer] = None


def get_prompt_engineer() -> PromptEngineer:
    """Get or create global PromptEngineer instance."""
    global _prompt_engineer
    if _prompt_engineer is None:
        _prompt_engineer = PromptEngineer()
    return _prompt_engineer
