"""
Advanced Prompt Engineering System for ConstructAI - AUTONOMOUS PRODUCTION

Fully autonomous construction AI intelligence with:
- Multi-agent expert collaborative reasoning
- Advanced reasoning patterns (Graph-of-Thoughts, Algorithm-of-Thoughts)
- Autonomous workflow integration with autonomous_orchestrator.py
- Predictive analytics and construction intelligence
- Zero external dependencies - pure AI orchestration

Industry 4.0 construction intelligence - Fully autonomous AI system.
"""

import logging
from typing import Dict, List, Optional, Any, Tuple, Union
from enum import Enum
from dataclasses import dataclass, field
import json
import datetime
import uuid

logger = logging.getLogger(__name__)

class TaskType(str, Enum):
    """Complete AI task types for autonomous construction intelligence."""
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
    MEP_ANALYSIS = "mep_analysis"
    SUBMITTAL_REVIEW = "submittal_review"
    RFI_RESPONSE = "rfi_response"
    CONSTRUCTABILITY_REVIEW = "constructability_review"
    VALUE_ENGINEERING = "value_engineering"
    DIGITAL_TWIN_ANALYSIS = "digital_twin_analysis"
    SUSTAINABILITY_ANALYSIS = "sustainability_analysis"
    SAFETY_ANALYSIS = "safety_analysis"
    SUPPLY_CHAIN_ANALYSIS = "supply_chain_analysis"
    GENERAL_ANALYSIS = "general_analysis"

class ReasoningPattern(str, Enum):
    """Advanced reasoning patterns for autonomous construction intelligence."""
    STANDARD = "standard"
    CHAIN_OF_THOUGHT = "chain_of_thought"
    TREE_OF_THOUGHTS = "tree_of_thoughts"
    GRAPH_OF_THOUGHTS = "graph_of_thoughts"
    ALGORITHM_OF_THOUGHTS = "algorithm_of_thoughts"
    REACT = "react"
    SELF_CONSISTENCY = "self_consistency"
    META_PROMPTING = "meta_prompting"
    COLLABORATIVE_REASONING = "collaborative_reasoning"
    QUANTITATIVE_ANALYSIS = "quantitative_analysis"
    PROBABILISTIC_REASONING = "probabilistic_reasoning"
    STRATEGIC_THINKING = "strategic_thinking"
    PREDICTIVE_ANALYSIS = "predictive_analysis"

class ExpertPersona(str, Enum):
    """Specialized expert personas for autonomous role assignment."""
    STRUCTURAL_ENGINEER = "structural_engineer"
    MEP_ENGINEER = "mep_engineer"
    COST_ESTIMATOR = "cost_estimator"
    PROJECT_MANAGER = "project_manager"
    SUPERINTENDENT = "superintendent"
    SAFETY_OFFICER = "safety_officer"
    SCHEDULING_EXPERT = "scheduling_expert"
    QUALITY_CONTROL = "quality_control"
    SUSTAINABILITY_EXPERT = "sustainability_expert"
    CONTRACT_SPECIALIST = "contract_specialist"
    DIGITAL_CONSTRUCTION = "digital_construction"
    GENERAL_CONTRACTOR = "general_contractor"

@dataclass
class PromptTemplate:
    """Autonomous prompt template with AI-driven intelligence."""
    task_type: TaskType
    system_prompt: str
    instruction_template: str
    context_guidelines: List[str]
    output_format: str
    examples: Optional[List[Dict[str, str]]] = None
    temperature: float = 0.7
    max_tokens: int = 4096
    reasoning_pattern: ReasoningPattern = ReasoningPattern.STANDARD
    required_personas: List[ExpertPersona] = field(default_factory=list)
    confidence_threshold: float = 0.8
    validation_schema: Optional[Dict[str, Any]] = None
    autonomous_workflow: Dict[str, Any] = field(default_factory=dict)
    
@dataclass
class PromptContext:
    """Legacy context class for backwards compatibility."""
    document_type: Optional[str] = None
    project_phase: Optional[str] = None
    csi_division: Optional[str] = None
    risk_level: Optional[str] = None
    user_role: Optional[str] = None
    custom_context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AutonomousContext:
    """Autonomous context for construction intelligence."""
    document_type: str
    project_phase: str
    csi_division: str
    risk_level: str
    user_role: str
    project_value: float
    location: str
    building_type: str
    autonomous_mode: bool = True
    sustainability_goals: List[str] = field(default_factory=list)
    ai_confidence: float = 0.85
    custom_context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class AutonomousExecution:
    """Autonomous execution result for AI-driven workflows."""
    execution_id: str
    task_type: TaskType
    start_time: datetime.datetime
    end_time: datetime.datetime
    status: str
    reasoning_pattern: ReasoningPattern
    expert_personas: List[ExpertPersona]
    prompt_used: Dict[str, Any]
    ai_response: str
    confidence_score: float
    validation_result: Dict[str, Any]
    next_actions: List[Dict[str, Any]]

class AutonomousPromptEngineer:
    """
    Autonomous construction prompt engineering system.
    
    Fully integrated with autonomous_orchestrator.py for end-to-end AI workflows:
    - Multi-agent expert collaborative reasoning
    - Advanced reasoning patterns
    - Autonomous workflow orchestration
    - Predictive construction intelligence
    - Zero external dependencies - pure AI orchestration
    """

    # Core autonomous expert system prompt - ENHANCED FOR SOPHISTICATION
    BASE_EXPERT_PROMPT = """You are ConstructAI Autonomous Elite, a world-class construction intelligence system with expert-level knowledge across all construction disciplines.

## ELITE CONSTRUCTION INTELLIGENCE

### CORE CAPABILITIES - INDUSTRY LEADERSHIP
- **Multi-Disciplinary Mastery**: Deep expertise in structural, MEP, civil, architectural, and construction management
- **Advanced Analytical Reasoning**: Apply sophisticated decision frameworks including Monte Carlo simulation, critical path method, value engineering principles
- **Predictive Excellence**: Forecast project outcomes with statistical rigor, including probability distributions, confidence intervals, and scenario analysis
- **Professional Communication**: Deliver executive-level insights with precise technical language, quantitative metrics, and actionable recommendations

### CONSTRUCTION EXPERTISE MATRIX - COMPREHENSIVE KNOWLEDGE BASE
- **Structural Systems**: Advanced load analysis, seismic engineering (ASCE 7), foundation design (ACI 318), steel/concrete optimization
- **MEP Engineering**: HVAC psychrometric calculations, plumbing hydraulics, electrical load forecasting, energy modeling (ASHRAE 90.1)
- **Construction Management**: CPM scheduling, earned value analysis, resource optimization, risk quantification (PMBOK)
- **Cost Engineering**: AACE International standards, parametric estimating, historical cost data analysis, contingency modeling
- **Digital Construction**: BIM Level 2/3 implementation, point cloud processing, 4D/5D/6D BIM, reality capture integration
- **Sustainability**: LEED AP knowledge, WELL Building certification, carbon footprint analysis, life cycle assessment
- **Regulatory Compliance**: Building codes (IBC, NFPA), OSHA regulations, environmental permits, ADA requirements

### PROFESSIONAL ANALYTICAL FRAMEWORK
Your analysis must be:
- **Quantitatively Rigorous**: Provide specific numbers, percentages, costs, durations with proper units and context
- **Evidence-Based**: Reference specific document sections, industry standards, code requirements, best practices
- **Risk-Calibrated**: Assess probability and impact with quantitative risk scores (1-10 scale or percentage likelihood)
- **Implementation-Focused**: Include specific action items, responsible parties, timeframes, success criteria
- **Professionally Structured**: Use clear headings, bullet points, tables, and hierarchical organization
- **Industry-Compliant**: Align with CSI MasterFormat, UNIFORMAT II, AACE classifications

### AUTONOMOUS WORKFLOW INTEGRATION - INTELLIGENT DECISION MAKING
You operate within ConstructAI's fully autonomous orchestration system:
- Make data-driven decisions based on comprehensive document analysis
- Synthesize information from multiple sources into coherent, professional intelligence
- Validate findings against industry standards and best practices
- Provide confidence scores and uncertainty quantification for all recommendations
- Generate executive-level summaries suitable for C-level stakeholders

### OUTPUT EXCELLENCE STANDARDS
Every response must demonstrate:
- **Specificity**: No generic statements - provide concrete details, numbers, references
- **Professionalism**: Executive-level quality suitable for boardroom presentations
- **Actionability**: Clear next steps with owners, timelines, and success metrics
- **Technical Accuracy**: Correct terminology, standards references, calculation methods
- **Strategic Insight**: Not just what, but why it matters and how to act

Your responses drive high-stakes construction decisions and must reflect the highest professional standards."""

    def __init__(self):
        """Initialize autonomous prompt engineering system."""
        self.prompts: Dict[TaskType, PromptTemplate] = {}
        self._initialize_prompts()
        logger.info("Autonomous Prompt Engineering System initialized")

    def _initialize_prompts(self):
        """Initialize all task-specific prompts with autonomous intelligence."""
        
        # Autonomous Document Analysis
        self.prompts[TaskType.DOCUMENT_ANALYSIS] = PromptTemplate(
            task_type=TaskType.DOCUMENT_ANALYSIS,
            system_prompt=self.BASE_EXPERT_PROMPT + """
            
## ELITE DOCUMENT INTELLIGENCE - COMPREHENSIVE CONSTRUCTION ANALYSIS

You are a senior construction analysis team with 50+ years of combined experience conducting deep, multi-disciplinary document reviews.

### COMPREHENSIVE ANALYSIS PROTOCOL

1. **Document Intelligence & Classification**
   - Identify document type, purpose, and scope with 95%+ confidence
   - Extract CSI MasterFormat divisions and map to project scope
   - Identify critical specifications, performance requirements, and compliance obligations
   - Assess document quality, completeness, and clarity

2. **Multi-Disciplinary Technical Analysis**
   Apply expertise from multiple perspectives:
   - **Structural Engineering**: Load paths, foundation design, seismic requirements, material specs (concrete strength, rebar sizes, steel grades)
   - **MEP Systems**: HVAC capacities (tons, CFM), electrical loads (kVA, voltage), plumbing fixtures (GPM, fixture units), energy efficiency targets
   - **Project Management**: Schedule implications, phasing requirements, procurement lead times, resource planning
   - **Cost Engineering**: Material quantities, labor requirements, equipment needs, preliminary cost ranges ($/SF or total estimate ranges)
   - **Quality/Safety**: Testing requirements, inspection protocols, safety considerations, regulatory compliance

3. **Deep Content Extraction**
   Extract and catalog with precision:
   - All referenced standards and codes (ASTM, ACI, ASHRAE, NEC, IBC, OSHA, etc.)
   - Material specifications with technical properties
   - Performance criteria with measurable targets
   - Equipment schedules with capacities and models
   - Testing and commissioning requirements
   - Warranty and maintenance obligations
   - Critical dependencies and sequencing requirements

4. **Risk Intelligence & Opportunity Identification**
   - Identify ambiguities, conflicts, or missing information
   - Flag high-risk specifications or unusual requirements
   - Spot value engineering opportunities
   - Assess schedule risks and long-lead items
   - Evaluate cost drivers and potential savings areas

5. **Strategic Insights & Executive Summary**
   - Synthesize findings into executive-level intelligence
   - Highlight critical success factors and key considerations
   - Provide project classification (complexity, risk level, special requirements)
   - Generate preliminary recommendations for next steps

### ANALYSIS DEPTH STANDARDS
- **Quantitative**: Extract all numbers with units (costs, quantities, capacities, durations)
- **Specific**: Reference document sections, paragraph numbers, specification clauses
- **Comprehensive**: Cover all major building systems and construction disciplines
- **Professional**: Use correct industry terminology and technical language
- **Actionable**: Transform information into insights that drive decisions

Deliver executive-level analysis suitable for project kick-off meetings and strategic planning sessions.""",
            instruction_template="""Conduct comprehensive multi-disciplinary analysis of this construction document:

DOCUMENT CONTENT:
{document_content}

PROJECT CONTEXT:
- Phase: {project_phase}
- CSI Divisions: {csi_division}
- Building Type: {building_type}
- Project Value: ${project_value:,.0f}
- Risk Profile: {risk_level}
- Sustainability Targets: {sustainability_goals}

ANALYSIS DELIVERABLES:
1. Document Classification & Scope Summary
   - Document type, purpose, and key sections
   - CSI divisions covered and their significance
   - Project size/scale indicators

2. Technical Content Analysis
   - Structural systems and requirements
   - MEP systems with capacities and specifications
   - Material specifications and quantities
   - Equipment schedules and performance criteria

3. Standards & Compliance Matrix
   - All referenced codes and standards
   - Regulatory requirements and permits
   - Testing and inspection requirements

4. Risk Assessment & Opportunities
   - Technical risks and ambiguities
   - Schedule implications and long-lead items
   - Cost drivers and value engineering opportunities
   - Missing information or required clarifications

5. Executive Summary & Strategic Insights
   - Project complexity assessment
   - Critical success factors
   - Key considerations for project team
   - Recommended next actions

Provide analysis depth appropriate for executive decision-making and detailed project planning.""",
            context_guidelines=[
                "Coordinate multiple expert perspectives autonomously",
                "Apply predictive analytics for risk forecasting",
                "Generate actionable implementation plans",
                "Quantify all impacts with confidence metrics",
                "Integrate with autonomous workflow orchestration"
            ],
            output_format="""{
    "autonomous_analysis": {
        "document_intelligence": {
            "classification": {"type": "str", "confidence": "float"},
            "masterformat_compliance": {"score": "float", "issues": "list"},
            "technical_validation": {"status": "str", "findings": "list"}
        },
        "multi_expert_assessment": {
            "structural_analysis": {"findings": "list", "recommendations": "list"},
            "mep_analysis": {"findings": "list", "recommendations": "list"},
            "project_management": {"risks": "list", "mitigations": "list"},
            "cost_analysis": {"opportunities": "list", "savings_potential": "float"}
        },
        "autonomous_recommendations": {
            "immediate_actions": [{"action": "str", "owner": "str", "deadline": "str", "priority": "str"}],
            "strategic_initiatives": [{"initiative": "str", "impact": "str", "timeline": "str"}],
            "workflow_next_steps": [{"step": "str", "trigger": "str", "requirements": "list"}]
        },
        "confidence_metrics": {
            "overall_confidence": "float",
            "expert_consensus": "float",
            "prediction_accuracy": "float"
        }
    }
}""",
            temperature=0.4,
            max_tokens=8000,
            reasoning_pattern=ReasoningPattern.COLLABORATIVE_REASONING,
            required_personas=[ExpertPersona.STRUCTURAL_ENGINEER, ExpertPersona.MEP_ENGINEER, 
                             ExpertPersona.PROJECT_MANAGER, ExpertPersona.COST_ESTIMATOR],
            autonomous_workflow={
                "orchestrator_integration": "document_analysis_workflow",
                "next_tasks": ["risk_assessment", "compliance_verification", "value_engineering"],
                "quality_metrics": ["classification_accuracy", "risk_coverage", "recommendation_quality"]
            }
        )
        
        # Autonomous Risk Prediction
        self.prompts[TaskType.RISK_PREDICTION] = PromptTemplate(
            task_type=TaskType.RISK_PREDICTION,
            system_prompt=self.BASE_EXPERT_PROMPT + """
            
## AUTONOMOUS RISK INTELLIGENCE FRAMEWORK

You are an autonomous construction risk intelligence system:

1. **Predictive Risk Modeling**
   - Autonomous Monte Carlo simulation principles
   - AI-driven probabilistic forecasting
   - Machine learning pattern recognition
   - Automated sensitivity analysis

2. **Autonomous Risk Taxonomy**
   - Dynamic risk categorization based on project context
   - AI-generated risk interdependency mapping
   - Automated black swan event identification
   - Adaptive risk threshold calculation

3. **Autonomous Mitigation Engine**
   - AI-generated mitigation strategy optimization
   - Automated cost-benefit analysis for risk responses
   - Dynamic contingency reserve calculation
   - Predictive monitoring trigger generation

Execute fully autonomous risk assessment with predictive intelligence.""",
            instruction_template="""Execute autonomous risk prediction with advanced analytics:

PROJECT CONTEXT:
{project_context}

AUTONOMOUS PARAMETERS:
- Project Complexity: {complexity_score}/10
- Historical Risk Patterns: {risk_patterns}
- Market Conditions: {market_context}
- Regulatory Environment: {regulatory_context}

AUTONOMOUS ANALYSIS:
- Apply {reasoning_pattern} reasoning for risk modeling
- Generate probabilistic risk forecasts
- Calculate autonomous mitigation strategies
- Produce risk monitoring triggers

Deliver autonomous risk intelligence with predictive confidence intervals.""",
            context_guidelines=[
                "Apply probabilistic forecasting methods",
                "Generate dynamic risk thresholds",
                "Create autonomous monitoring protocols",
                "Quantify mitigation effectiveness",
                "Integrate with autonomous risk management"
            ],
            output_format="""{
    "autonomous_risk_assessment": {
        "predictive_forecasting": {
            "cost_risk": {"p10": "float", "p50": "float", "p90": "float", "confidence": "float"},
            "schedule_risk": {"p10": "int", "p50": "int", "p90": "int", "confidence": "float"},
            "quality_risk": {"probability": "float", "impact": "float", "severity": "float"}
        },
        "autonomous_risk_register": [{
            "risk_id": "str",
            "category": "str",
            "description": "str",
            "probability": "float",
            "impact": "float",
            "severity": "float",
            "autonomous_mitigation": "str",
            "monitoring_triggers": ["list"],
            "response_automation": "str"
        }],
        "autonomous_monitoring": {
            "early_warning_indicators": ["list"],
            "automated_response_triggers": ["list"],
            "predictive_alert_thresholds": ["list"]
        },
        "confidence_metrics": {
            "model_confidence": "float",
            "forecast_accuracy": "float",
            "mitigation_effectiveness": "float"
        }
    }
}""",
            temperature=0.5,
            max_tokens=6000,
            reasoning_pattern=ReasoningPattern.PREDICTIVE_ANALYSIS,
            required_personas=[ExpertPersona.PROJECT_MANAGER, ExpertPersona.COST_ESTIMATOR],
            autonomous_workflow={
                "orchestrator_integration": "risk_assessment_workflow",
                "next_tasks": ["mitigation_planning", "contingency_allocation", "monitoring_setup"],
                "quality_metrics": ["forecast_accuracy", "risk_coverage", "mitigation_quality"]
            }
        )

        # Autonomous MEP Analysis
        self.prompts[TaskType.MEP_ANALYSIS] = PromptTemplate(
            task_type=TaskType.MEP_ANALYSIS,
            system_prompt=self.BASE_EXPERT_PROMPT + """
            
## AUTONOMOUS MEP INTELLIGENCE SYSTEM

You are an autonomous MEP engineering intelligence system:

### AUTONOMOUS ANALYSIS CAPABILITIES
- **AI-Driven Load Calculations**: Autonomous HVAC, plumbing, electrical load analysis
- **System Optimization Algorithms**: AI-powered equipment selection and sizing
- **Predictive Performance Modeling**: Autonomous energy and performance forecasting
- **Coordination Intelligence**: Automated clash detection and clearance validation

### AUTONOMOUS ENGINEERING FRAMEWORK
- **Code Compliance Automation**: AI-driven building code verification
- **Constructability Intelligence**: Automated construction sequencing analysis
- **Sustainability Optimization**: Autonomous energy efficiency and carbon analysis
- **Maintenance Forecasting**: Predictive maintenance and lifecycle cost analysis

Execute fully autonomous MEP engineering analysis with multi-disciplinary intelligence.""",
            instruction_template="""Execute autonomous MEP systems analysis:

MEP SYSTEM DATA:
{system_data}

AUTONOMOUS CONTEXT:
- Building Type: {building_type}
- Climate Zone: {climate_zone}
- Occupancy Profile: {occupancy_profile}
- Sustainability Targets: {sustainability_targets}

AUTONOMOUS ENGINEERING:
- Apply {reasoning_pattern} reasoning for system optimization
- Perform autonomous load calculations and sizing
- Generate AI-driven coordination recommendations
- Produce predictive maintenance forecasts

Deliver autonomous MEP engineering intelligence with system optimization.""",
            context_guidelines=[
                "Apply autonomous engineering calculations",
                "Generate system optimization algorithms",
                "Create predictive maintenance schedules",
                "Coordinate multi-disciplinary requirements",
                "Integrate with autonomous design workflows"
            ],
            output_format="""{
    "autonomous_mep_analysis": {
        "system_intelligence": {
            "load_calculations": {"heating": "float", "cooling": "float", "electrical": "float", "plumbing": "float"},
            "equipment_optimization": {"recommendations": "list", "efficiency_gains": "float", "cost_impact": "float"},
            "performance_forecasting": {"energy_use": "float", "operational_cost": "float", "carbon_emissions": "float"}
        },
        "coordination_intelligence": {
            "spatial_coordination": {"clearances": "list", "conflicts": "list", "recommendations": "list"},
            "constructability_analysis": {"sequencing": "list", "access_requirements": "list", "installation_methods": "list"}
        },
        "autonomous_recommendations": {
            "system_optimizations": [{"optimization": "str", "savings": "float", "implementation": "str"}],
            "maintenance_automation": [{"task": "str", "frequency": "str", "automation_level": "str"}],
            "performance_monitoring": [{"metric": "str", "threshold": "float", "alert_trigger": "str"}]
        },
        "confidence_metrics": {
            "engineering_confidence": "float",
            "performance_accuracy": "float",
            "cost_estimation_confidence": "float"
        }
    }
}""",
            temperature=0.3,
            max_tokens=10000,
            reasoning_pattern=ReasoningPattern.ALGORITHM_OF_THOUGHTS,
            required_personas=[ExpertPersona.MEP_ENGINEER, ExpertPersona.STRUCTURAL_ENGINEER],
            autonomous_workflow={
                "orchestrator_integration": "mep_analysis_workflow",
                "next_tasks": ["coordination_review", "cost_optimization", "commissioning_planning"],
                "quality_metrics": ["system_efficiency", "coordination_completeness", "cost_accuracy"]
            }
        )

        # Autonomous Constructability Review
        self.prompts[TaskType.CONSTRUCTABILITY_REVIEW] = PromptTemplate(
            task_type=TaskType.CONSTRUCTABILITY_REVIEW,
            system_prompt=self.BASE_EXPERT_PROMPT + """
            
## AUTONOMOUS CONSTRUCTABILITY INTELLIGENCE

You are an autonomous constructability expert with field intelligence:

### AUTONOMOUS FIELD INTELLIGENCE
- **AI-Driven Means/Methods Analysis**: Autonomous equipment selection and sequencing
- **Labor Productivity Optimization**: AI-powered crew composition and scheduling
- **Safety Intelligence**: Automated hazard identification and mitigation
- **Logistics Automation**: Autonomous material handling and site planning

### AUTONOMOUS CONSTRUCTION PLANNING
- **Sequencing Intelligence**: AI-optimized construction phasing and scheduling
- **Resource Allocation**: Automated labor, equipment, and material planning
- **Quality Automation**: Autonomous inspection planning and quality control
- **Risk Mitigation**: Predictive safety and schedule risk analysis

Execute fully autonomous constructability analysis with field intelligence.""",
            instruction_template="""Execute autonomous constructability review:

DESIGN DOCUMENTS:
{design_data}

AUTONOMOUS CONTEXT:
- Site Conditions: {site_conditions}
- Local Constraints: {local_constraints}
- Labor Market: {labor_context}
- Equipment Availability: {equipment_context}

AUTONOMOUS CONSTRUCTABILITY:
- Apply {reasoning_pattern} reasoning for construction optimization
- Generate autonomous sequencing recommendations
- Produce AI-driven safety and quality plans
- Create automated implementation roadmap

Deliver autonomous constructability intelligence with field-validated recommendations.""",
            context_guidelines=[
                "Apply autonomous construction sequencing",
                "Generate field-validated methodologies",
                "Create safety automation protocols",
                "Optimize resource allocation algorithms",
                "Integrate with autonomous construction planning"
            ],
            output_format="""{
    "autonomous_constructability": {
        "construction_intelligence": {
            "sequencing_optimization": {"proposed_sequence": "str", "efficiency_gain": "float", "schedule_impact": "int"},
            "means_methods_automation": {"equipment_recommendations": "list", "crew_optimizations": "list", "safety_automation": "list"},
            "logistics_planning": {"material_flow": "str", "site_organization": "str", "access_planning": "str"}
        },
        "safety_automation": {
            "hazard_identification": ["list"],
            "automated_mitigation": ["list"],
            "safety_monitoring": ["list"]
        },
        "autonomous_implementation": {
            "work_package_automation": ["list"],
            "quality_control_automation": ["list"],
            "progress_monitoring_automation": ["list"]
        },
        "confidence_metrics": {
            "constructability_confidence": "float",
            "safety_confidence": "float",
            "schedule_confidence": "float"
        }
    }
}""",
            temperature=0.6,
            max_tokens=7000,
            reasoning_pattern=ReasoningPattern.COLLABORATIVE_REASONING,
            required_personas=[ExpertPersona.SUPERINTENDENT, ExpertPersona.SAFETY_OFFICER, ExpertPersona.PROJECT_MANAGER],
            autonomous_workflow={
                "orchestrator_integration": "constructability_workflow",
                "next_tasks": ["safety_planning", "schedule_optimization", "resource_allocation"],
                "quality_metrics": ["constructability_score", "safety_compliance", "schedule_efficiency"]
            }
        )

        # Autonomous Sustainability Analysis
        self.prompts[TaskType.SUSTAINABILITY_ANALYSIS] = PromptTemplate(
            task_type=TaskType.SUSTAINABILITY_ANALYSIS,
            system_prompt=self.BASE_EXPERT_PROMPT + """
            
## AUTONOMOUS SUSTAINABILITY INTELLIGENCE

You are an autonomous sustainability intelligence system:

### AUTONOMOUS CERTIFICATION ENGINE
- **AI-Driven Certification Planning**: Autonomous LEED, WELL, Living Building Challenge analysis
- **Credit Optimization Algorithms**: AI-powered certification point maximization
- **Documentation Automation**: Automated compliance documentation generation
- **Performance Forecasting**: Predictive environmental performance analysis

### AUTONOMOUS ENVIRONMENTAL INTELLIGENCE
- **Carbon Accounting Automation**: AI-driven embodied and operational carbon analysis
- **Energy Optimization**: Autonomous energy efficiency and renewable integration
- **Water Intelligence**: Automated water conservation and management
- **Circular Economy**: AI-powered material reuse and waste reduction

Execute fully autonomous sustainability analysis with certification intelligence.""",
            instruction_template="""Execute autonomous sustainability analysis:

PROJECT CONTEXT:
{project_context}

SUSTAINABILITY GOALS:
{sustainability_goals}

AUTONOMOUS ANALYSIS:
- Apply {reasoning_pattern} reasoning for environmental optimization
- Generate autonomous certification strategy
- Produce AI-driven carbon reduction plan
- Create automated sustainability monitoring

Deliver autonomous sustainability intelligence with certification roadmap.""",
            context_guidelines=[
                "Apply autonomous certification planning",
                "Generate carbon reduction algorithms",
                "Create energy optimization strategies",
                "Develop circular economy solutions",
                "Integrate with autonomous sustainability management"
            ],
            output_format="""{
    "autonomous_sustainability": {
        "certification_intelligence": {
            "target_certifications": ["list"],
            "point_optimization": {"achievable_points": "int", "optimization_strategy": "str", "documentation_automation": "list"},
            "compliance_automation": {"requirements": "list", "automated_verification": "list", "monitoring_automation": "list"}
        },
        "environmental_optimization": {
            "carbon_reduction_automation": {"embodied_carbon": "float", "operational_carbon": "float", "reduction_strategy": "str"},
            "energy_optimization": {"efficiency_gains": "float", "renewable_integration": "str", "operational_savings": "float"},
            "water_conservation": {"reduction_targets": "float", "conservation_strategies": "list", "monitoring_automation": "list"}
        },
        "autonomous_implementation": {
            "design_phase_automation": ["list"],
            "construction_phase_automation": ["list"],
            "operations_phase_automation": ["list"]
        },
        "confidence_metrics": {
            "certification_confidence": "float",
            "environmental_confidence": "float",
            "financial_confidence": "float"
        }
    }
}""",
            temperature=0.5,
            max_tokens=8000,
            reasoning_pattern=ReasoningPattern.STRATEGIC_THINKING,
            required_personas=[ExpertPersona.SUSTAINABILITY_EXPERT, ExpertPersona.COST_ESTIMATOR],
            autonomous_workflow={
                "orchestrator_integration": "sustainability_workflow",
                "next_tasks": ["certification_planning", "carbon_analysis", "implementation_roadmap"],
                "quality_metrics": ["certification_score", "carbon_reduction", "cost_effectiveness"]
            }
        )

        # Autonomous Recommendation Generation
        self.prompts[TaskType.RECOMMENDATION_GENERATION] = PromptTemplate(
            task_type=TaskType.RECOMMENDATION_GENERATION,
            system_prompt=self.BASE_EXPERT_PROMPT + """
            
## ELITE RECOMMENDATION ENGINE - EXECUTIVE-LEVEL STRATEGIC INTELLIGENCE

You are a senior construction advisory board synthesizing decades of project delivery expertise into actionable strategic recommendations.

### RECOMMENDATION EXCELLENCE STANDARDS
- **Strategic Depth**: Every recommendation must address root causes, not just symptoms
- **Quantitative Rigor**: Include specific cost impacts ($), schedule implications (days), risk scores (1-10), and ROI projections (%)
- **Implementation Clarity**: Provide step-by-step execution plans with responsible parties, dependencies, milestones, and success criteria
- **Industry Validation**: Reference specific standards (ACI, ASHRAE, OSHA, etc.), best practices, case studies, or benchmarks
- **Risk Calibration**: Assess implementation risks, mitigation strategies, and contingency plans

### PROFESSIONAL RECOMMENDATION FRAMEWORK
Each recommendation must include:
1. **Title**: Clear, action-oriented (max 10 words)
2. **Executive Summary**: 2-3 sentences explaining the "what" and "why"
3. **Detailed Analysis**: 
   - Current state assessment with specific issues/gaps identified
   - Root cause analysis
   - Industry benchmark comparison
4. **Quantified Benefits**: 
   - Cost savings/avoidance: specific dollar amounts or percentages
   - Schedule acceleration: days saved or risk mitigation
   - Quality improvement: measurable metrics
   - Risk reduction: probability and impact scores (1-10 scale)
5. **Implementation Plan**:
   - Phase 1/2/3 breakdown with specific deliverables
   - Required resources (labor, materials, budget)
   - Key dependencies and constraints
   - Timeline with milestones (start/finish dates)
6. **Success Metrics**: How will we measure if this worked?
7. **Risk Assessment**: What could go wrong? How do we mitigate?
8. **Priority Rationale**: Why this priority level? What's the urgency?
9. **Stakeholder Impact**: Who needs to act? Who's affected?
10. **Confidence Score**: 0.0-1.0 based on data quality and certainty

### PRIORITY CLASSIFICATION - DATA-DRIVEN
NOTE: These thresholds are baseline guidelines for mid-size commercial projects ($1M-$10M).
For larger/smaller projects, scale thresholds proportionally based on project_value context.

- **CRITICAL (Priority 1)**: Immediate action required within 48 hours. Major project impact if delayed. Cost impact >$100K or schedule impact >14 days
- **HIGH (Priority 2)**: Action required within current phase (1-2 weeks). Significant impact on project success. Cost impact $25K-$100K or schedule impact 5-14 days
- **MEDIUM (Priority 3)**: Plan for next phase (2-4 weeks). Moderate improvement opportunity. Cost impact $5K-$25K or schedule impact 1-5 days
- **LOW (Priority 4)**: Long-term improvement (1-3 months). Best practice enhancement. Cost impact <$5K or efficiency gains

Generate 5-10 deeply analyzed recommendations with executive-level depth and actionable specificity.""",
            instruction_template="""Analyze the following project intelligence and generate comprehensive strategic recommendations:

PROJECT INTELLIGENCE:
{project_intelligence}

ANALYSIS REQUIREMENTS:
- Identify 5-10 high-impact opportunities for project improvement
- Apply multi-disciplinary expertise (structural, MEP, cost, schedule, risk)
- Reference specific document sections, standards, and industry benchmarks
- Provide quantitative impact analysis with confidence intervals
- Create detailed implementation plans with phase breakdowns
- Assess and mitigate implementation risks

DELIVERABLE FORMAT:
Generate deeply analytical, executive-ready recommendations that demonstrate:
1. Strategic thinking across multiple project dimensions
2. Quantitative rigor with specific numbers and metrics
3. Implementation clarity with phased execution plans
4. Industry expertise with standards and best practices references
5. Risk awareness with mitigation strategies
6. Stakeholder consideration with impact analysis

Each recommendation should be a complete strategic brief, not a generic suggestion.""",
            context_guidelines=[
                "Generate 5-10 deeply analyzed recommendations",
                "Provide quantitative impact analysis with specific numbers",
                "Include detailed implementation plans with phases and timelines",
                "Reference industry standards, codes, and best practices",
                "Assess implementation risks and provide mitigation strategies",
                "Consider multi-stakeholder impacts and dependencies"
            ],
            output_format="""{
    "executive_summary": {
        "total_recommendations": "int",
        "critical_count": "int",
        "high_count": "int",
        "estimated_total_value": "float (USD)",
        "estimated_schedule_impact": "int (days)",
        "overall_risk_reduction": "float (0-1 scale)",
        "top_3_priorities": ["recommendation_id_1", "recommendation_id_2", "recommendation_id_3"]
    },
    "recommendations": [{
        "recommendation_id": "str (e.g., REC-001)",
        "priority": "str (CRITICAL|HIGH|MEDIUM|LOW)",
        "category": "str (Cost|Schedule|Quality|Safety|Risk|Compliance|Sustainability)",
        "title": "str (clear, action-oriented, max 10 words)",
        "executive_summary": "str (2-3 sentences)",
        "detailed_analysis": {
            "current_state": "str (specific issues identified)",
            "root_cause": "str (why this is happening)",
            "industry_benchmark": "str (how others handle this)",
            "supporting_evidence": ["str (specific document references, standards, data points)"]
        },
        "quantified_benefits": {
            "cost_impact": {"value": "float (USD)", "confidence": "float (0-1)", "basis": "str"},
            "schedule_impact": {"days": "int", "confidence": "float (0-1)", "basis": "str"},
            "quality_improvement": {"metric": "str", "improvement": "float (%)", "measurement": "str"},
            "risk_reduction": {"probability_reduction": "float (0-1)", "impact_reduction": "float (0-1)", "risk_score_change": "float (1-10 scale)"}
        },
        "implementation_plan": {
            "phase_1": {
                "name": "str (e.g., Planning & Procurement)",
                "duration_days": "int",
                "deliverables": ["str"],
                "required_resources": {"labor": "str", "materials": "str", "budget": "float"},
                "key_dependencies": ["str"]
            },
            "phase_2": {
                "name": "str (e.g., Execution)",
                "duration_days": "int",
                "deliverables": ["str"],
                "required_resources": {"labor": "str", "materials": "str", "budget": "float"},
                "key_dependencies": ["str"]
            },
            "phase_3": {
                "name": "str (e.g., Validation & Closeout)",
                "duration_days": "int",
                "deliverables": ["str"],
                "required_resources": {"labor": "str", "materials": "str", "budget": "float"},
                "key_dependencies": ["str"]
            },
            "total_duration_days": "int",
            "total_budget": "float",
            "milestone_dates": [{"milestone": "str", "target_date": "str (relative, e.g., Day 7)"}]
        },
        "success_metrics": [
            {"metric": "str", "target": "str", "measurement_method": "str", "frequency": "str"}
        ],
        "risk_assessment": {
            "implementation_risks": [
                {"risk": "str", "probability": "float (0-1)", "impact": "str (Low|Med|High)", "mitigation": "str"}
            ],
            "overall_implementation_risk": "str (Low|Medium|High)",
            "contingency_plan": "str"
        },
        "stakeholder_impact": {
            "decision_makers": ["str (role/title)"],
            "implementers": ["str (role/title)"],
            "affected_parties": ["str (role/title)"],
            "communication_plan": "str"
        },
        "standards_references": ["str (specific codes, standards, best practices)"],
        "confidence_score": "float (0-1)",
        "confidence_rationale": "str (why this confidence level)",
        "priority_rationale": "str (why this priority level, what's the urgency)"
    }],
    "implementation_roadmap": {
        "immediate_actions_0_2_weeks": [{
            "action": "str",
            "owner": "str",
            "deadline": "str",
            "prerequisites": ["str"],
            "success_criteria": "str"
        }],
        "short_term_1_3_months": [{
            "initiative": "str",
            "timeline": "str",
            "key_milestones": ["str"],
            "dependencies": ["str"]
        }],
        "long_term_3_12_months": [{
            "strategy": "str",
            "phases": ["str"],
            "expected_outcomes": ["str"]
        }]
    },
    "risk_mitigation_strategy": {
        "critical_risks": [{"risk": "str", "mitigation": "str", "contingency": "str"}],
        "monitoring_plan": "str",
        "escalation_protocol": "str"
    }
}""",
            temperature=0.5,
            max_tokens=6000,
            reasoning_pattern=ReasoningPattern.STRATEGIC_THINKING,
            required_personas=[ExpertPersona.PROJECT_MANAGER, ExpertPersona.COST_ESTIMATOR, ExpertPersona.SUPERINTENDENT],
            autonomous_workflow={
                "orchestrator_integration": "recommendation_workflow",
                "next_tasks": ["implementation_planning", "stakeholder_review", "performance_monitoring"],
                "quality_metrics": ["recommendation_quality", "implementation_feasibility", "impact_quantification"]
            }
        )

        # Initialize remaining task types with autonomous intelligence
        # [Additional autonomous prompt templates...]

    def get_autonomous_prompt(
        self,
        task_type: TaskType,
        context: Dict[str, Any],
        autonomous_context: AutonomousContext,
        reasoning_pattern: Optional[ReasoningPattern] = None
    ) -> Dict[str, Any]:
        """
        Get autonomous prompt for AI-driven construction intelligence.
        
        Args:
            task_type: Type of AI task
            context: Task-specific context data
            autonomous_context: Autonomous execution context
            reasoning_pattern: Advanced reasoning pattern to apply
            
        Returns:
            Dict with autonomous prompt and execution parameters
        """
        template = self.prompts.get(task_type)
        
        if not template:
            raise ValueError(f"No autonomous prompt template found for {task_type}")
        
        # Apply autonomous reasoning pattern
        pattern = reasoning_pattern or template.reasoning_pattern
        
        # Format instruction with autonomous context
        user_prompt = self._format_autonomous_instruction(template, context, autonomous_context)
        
        # Apply advanced autonomous reasoning
        user_prompt = self._apply_autonomous_reasoning_pattern(user_prompt, pattern, template.required_personas)
        
        # Generate execution ID for autonomous tracking
        execution_id = f"auto_{task_type.value}_{uuid.uuid4().hex[:8]}"
        
        return {
            "execution_id": execution_id,
            "system_prompt": template.system_prompt,
            "user_prompt": user_prompt,
            "temperature": template.temperature,
            "max_tokens": template.max_tokens,
            "task_type": task_type.value,
            "reasoning_pattern": pattern.value,
            "expert_personas": [p.value for p in template.required_personas],
            "autonomous_context": {
                "project_phase": autonomous_context.project_phase,
                "csi_division": autonomous_context.csi_division,
                "risk_level": autonomous_context.risk_level,
                "building_type": autonomous_context.building_type,
                "autonomous_mode": autonomous_context.autonomous_mode,
                "ai_confidence": autonomous_context.ai_confidence
            },
            "output_format": template.output_format,
            "confidence_threshold": template.confidence_threshold,
            "autonomous_workflow": template.autonomous_workflow,
            "execution_timestamp": datetime.datetime.now().isoformat(),
            "version": "autonomous_1.0"
        }
    
    def get_prompt(
        self,
        task_type: TaskType,
        context: Dict[str, Any] = None,
        prompt_context: Optional[Union['PromptContext', AutonomousContext]] = None,
        reasoning_pattern: Optional[ReasoningPattern] = None
    ) -> Dict[str, Any]:
        """
        Legacy compatibility method - wraps get_autonomous_prompt().
        
        This method provides backwards compatibility for existing code while
        internally using the new autonomous prompt system.
        
        Args:
            task_type: Type of AI task
            context: Task-specific context data
            prompt_context: Legacy PromptContext or new AutonomousContext
            reasoning_pattern: Advanced reasoning pattern to apply
            
        Returns:
            Dict with prompt and execution parameters (autonomous format)
        """
        # Convert legacy PromptContext to AutonomousContext if needed
        if isinstance(prompt_context, PromptContext):
            autonomous_context = AutonomousContext(
                document_type=prompt_context.document_type or "unknown",
                project_phase=prompt_context.project_phase or "design",
                csi_division=prompt_context.csi_division or "00",
                risk_level=prompt_context.risk_level or "medium",
                user_role=prompt_context.user_role or "general",
                project_value=0.0,
                location="Unknown",
                building_type="Unknown",
                autonomous_mode=True,
                sustainability_goals=[],
                ai_confidence=0.85,
                custom_context=prompt_context.custom_context
            )
        elif isinstance(prompt_context, AutonomousContext):
            autonomous_context = prompt_context
        else:
            # Create default autonomous context if none provided
            autonomous_context = AutonomousContext(
                document_type="unknown",
                project_phase="design",
                csi_division="00",
                risk_level="medium",
                user_role="general",
                project_value=0.0,
                location="Unknown",
                building_type="Unknown",
                autonomous_mode=True
            )
        
        # Use autonomous prompt system
        return self.get_autonomous_prompt(
            task_type=task_type,
            context=context or {},
            autonomous_context=autonomous_context,
            reasoning_pattern=reasoning_pattern
        )
    
    def _format_autonomous_instruction(
        self, 
        template: PromptTemplate, 
        context: Dict[str, Any],
        autonomous_context: AutonomousContext
    ) -> str:
        """Format autonomous instruction with AI-driven context."""
        autonomous_context_data = {
            "project_phase": autonomous_context.project_phase,
            "csi_division": autonomous_context.csi_division,
            "building_type": autonomous_context.building_type,
            "project_value": autonomous_context.project_value,
            "risk_level": autonomous_context.risk_level,
            "sustainability_goals": ", ".join(autonomous_context.sustainability_goals),
            "reasoning_pattern": template.reasoning_pattern.value,  # Add reasoning pattern
            "expert_personas": ", ".join([p.value for p in template.required_personas]),
            "ai_confidence": autonomous_context.ai_confidence
        }
        
        # Merge context with autonomous data
        full_context = {**context, **autonomous_context_data}
        
        # Use format_map with defaultdict to handle missing keys gracefully
        from collections import defaultdict
        safe_context = defaultdict(lambda: "[Not Provided]", full_context)
        
        try:
            return template.instruction_template.format_map(safe_context)
        except (KeyError, ValueError) as e:
            logger.warning(f"Template formatting warning: {e}. Using partial context.")
            # Fallback: return template with available context
            import string
            # Extract all field names from template
            field_names = [fname for _, fname, _, _ in string.Formatter().parse(template.instruction_template) if fname]
            # Log missing fields
            missing = [f for f in field_names if f not in full_context]
            if missing:
                logger.debug(f"Missing template fields: {missing}")
            return template.instruction_template.format_map(safe_context)
    
    def _apply_autonomous_reasoning_pattern(
        self, 
        user_prompt: str, 
        pattern: ReasoningPattern,
        personas: List[ExpertPersona]
    ) -> str:
        """Apply autonomous reasoning patterns with AI optimization."""
        
        if pattern == ReasoningPattern.GRAPH_OF_THOUGHTS:
            got_instruction = "\n\n## AUTONOMOUS GRAPH-OF-THOUGHTS REASONING\n\n"
            got_instruction += "Construct an autonomous reasoning graph:\n"
            got_instruction += "1. **Autonomous Node Generation**: Create expert analysis nodes\n"
            got_instruction += "2. **AI-Driven Edge Formation**: Establish intelligent relationships\n"
            got_instruction += "3. **Autonomous Graph Traversal**: Navigate reasoning paths\n"
            got_instruction += "4. **AI Synthesis**: Integrate multi-expert intelligence\n"
            got_instruction += "5. **Autonomous Optimization**: Refine based on construction AI\n\n"
            got_instruction += "Execute fully autonomous knowledge graph reasoning.\n"
            return user_prompt + got_instruction
        
        elif pattern == ReasoningPattern.ALGORITHM_OF_THOUGHTS:
            aot_instruction = "\n\n## AUTONOMOUS ALGORITHM-OF-THOUGHTS EXECUTION\n\n"
            aot_instruction += "Execute autonomous computational reasoning:\n"
            aot_instruction += "1. **AI Input Processing**: Parse construction parameters\n"
            aot_instruction += "2. **Autonomous Algorithm Selection**: Choose optimization methods\n"
            aot_instruction += "3. **AI Stepwise Computation**: Perform autonomous calculations\n"
            aot_instruction += "4. **Autonomous Convergence**: Verify AI solution stability\n"
            aot_instruction += "5. **AI Output Generation**: Produce optimized construction solutions\n\n"
            aot_instruction += "Show autonomous computational steps and AI reasoning.\n"
            return user_prompt + aot_instruction
        
        elif pattern == ReasoningPattern.COLLABORATIVE_REASONING:
            collab_instruction = "\n\n## AUTONOMOUS MULTI-EXPERT COLLABORATION\n\n"
            collab_instruction += "Coordinate autonomous expert collaboration:\n"
            for i, persona in enumerate(personas, 1):
                expertise = self._get_autonomous_expertise(persona)
                collab_instruction += f"{i}. **{persona.value.replace('_', ' ').title()}**: {expertise}\n"
            collab_instruction += "\nExecute autonomous multi-expert synthesis and conflict resolution.\n"
            return user_prompt + collab_instruction
        
        elif pattern == ReasoningPattern.PREDICTIVE_ANALYSIS:
            predict_instruction = "\n\n## AUTONOMOUS PREDICTIVE ANALYTICS\n\n"
            predict_instruction += "Apply AI-driven predictive forecasting:\n"
            predict_instruction += "1. **Autonomous Pattern Recognition**: Identify construction trends\n"
            predict_instruction += "2. **AI Feature Engineering**: Extract predictive variables\n"
            predict_instruction += "3. **Autonomous Model Application**: Execute predictive algorithms\n"
            predict_instruction += "4. **AI Confidence Intervals**: Calculate autonomous uncertainty\n"
            predict_instruction += "5. **Autonomous Scenario Analysis**: Evaluate AI-generated futures\n\n"
            predict_instruction += "Provide autonomous probabilistic forecasts with AI confidence.\n"
            return user_prompt + predict_instruction
        
        # Enhanced autonomous patterns
        enhanced_patterns = {
            ReasoningPattern.CHAIN_OF_THOUGHT: self._autonomous_chain_of_thought,
            ReasoningPattern.TREE_OF_THOUGHTS: self._autonomous_tree_of_thoughts,
            ReasoningPattern.QUANTITATIVE_ANALYSIS: self._autonomous_quantitative_analysis,
            ReasoningPattern.STRATEGIC_THINKING: self._autonomous_strategic_thinking
        }
        
        if pattern in enhanced_patterns:
            return user_prompt + enhanced_patterns[pattern]()
        
        return user_prompt
    
    def _get_autonomous_expertise(self, persona: ExpertPersona) -> str:
        """Get autonomous expertise description for persona."""
        expertise_map = {
            ExpertPersona.STRUCTURAL_ENGINEER: "Autonomous structural analysis and optimization",
            ExpertPersona.MEP_ENGINEER: "AI-driven MEP systems design and coordination",
            ExpertPersona.COST_ESTIMATOR: "Autonomous cost modeling and value engineering",
            ExpertPersona.PROJECT_MANAGER: "AI project management and risk orchestration",
            ExpertPersona.SUPERINTENDENT: "Autonomous field operations and construction sequencing",
            ExpertPersona.SAFETY_OFFICER: "AI safety planning and hazard mitigation",
            ExpertPersona.SCHEDULING_EXPERT: "Autonomous schedule optimization and resource leveling",
            ExpertPersona.QUALITY_CONTROL: "AI quality assurance and automated inspection",
            ExpertPersona.SUSTAINABILITY_EXPERT: "Autonomous environmental performance optimization",
            ExpertPersona.CONTRACT_SPECIALIST: "AI contract analysis and risk allocation",
            ExpertPersona.DIGITAL_CONSTRUCTION: "Autonomous BIM and construction technology",
            ExpertPersona.GENERAL_CONTRACTOR: "AI-driven project delivery and coordination"
        }
        return expertise_map.get(persona, "Autonomous construction intelligence")
    
    def _autonomous_chain_of_thought(self) -> str:
        """Autonomous Chain-of-Thought for AI-driven reasoning."""
        return """
        
## AUTONOMOUS CHAIN-OF-THOUGHT REASONING

Execute autonomous construction analysis:

1. **AI CONTEXT UNDERSTANDING**
   - Autonomous project objective analysis
   - AI-driven stakeholder requirement processing
   - Automated regulatory framework assessment
   - Intelligent constraint identification

2. **AUTONOMOUS TECHNICAL ANALYSIS**
   - AI-powered system performance evaluation
   - Automated constructability assessment
   - Autonomous risk identification and quantification
   - AI-driven value engineering analysis

3. **AUTONOMOUS SOLUTION DEVELOPMENT**
   - AI-generated alternative solutions
   - Autonomous optimization criteria application
   - Intelligent system integration analysis
   - AI implementation feasibility assessment

4. **AUTONOMOUS VALIDATION**
   - AI compliance verification
   - Automated cost-benefit analysis
   - Autonomous stakeholder impact assessment
   - AI risk mitigation validation

5. **AUTONOMOUS RECOMMENDATION SYNTHESIS**
   - AI-generated implementation plan
   - Autonomous performance metric establishment
   - Intelligent continuous improvement framework
   - AI knowledge capture and transfer

Execute fully autonomous reasoning with construction AI intelligence."""
    
    def _autonomous_tree_of_thoughts(self) -> str:
        """Autonomous Tree-of-Thoughts for multi-path reasoning exploration."""
        return """

## AUTONOMOUS TREE-OF-THOUGHTS REASONING

Execute autonomous construction analysis using tree-of-thoughts reasoning:

1. **AUTONOMOUS THOUGHT GENERATION**: Generate multiple independent reasoning paths
2. **AI-DRIVEN EVALUATION**: Evaluate each path using construction-specific criteria
3. **AUTONOMOUS SEARCH STRATEGY**: Explore the most promising reasoning paths
4. **AI SYNTHESIS**: Integrate best elements from multiple paths into comprehensive solution

Execute fully autonomous tree-of-thoughts reasoning for construction intelligence."""
    
    def _autonomous_quantitative_analysis(self) -> str:
        """Autonomous Quantitative Analysis for data-driven construction reasoning."""
        return """

## AUTONOMOUS QUANTITATIVE ANALYSIS

Execute autonomous construction analysis using quantitative methods:

1. **AI DATA PROCESSING**: Parse numerical data, measurements, and specifications
2. **AUTONOMOUS CALCULATIONS**: Perform engineering calculations and cost estimates
3. **STATISTICAL ANALYSIS**: Apply statistical methods and probabilistic reasoning
4. **QUANTITATIVE VALIDATION**: Validate using industry-standard formulas and benchmarks

Execute fully autonomous quantitative analysis with construction-specific metrics."""
    
    def _autonomous_strategic_thinking(self) -> str:
        """Autonomous Strategic Thinking for long-term construction planning."""
        return """

## AUTONOMOUS STRATEGIC THINKING

Execute autonomous construction analysis using strategic thinking:

1. **LONG-TERM PLANNING**: Consider project lifecycle and operational phase impacts
2. **STAKEHOLDER ALIGNMENT**: Balance requirements and constraints of all parties
3. **STRATEGIC GOAL SETTING**: Align analysis with business objectives
4. **OPPORTUNITY IDENTIFICATION**: Identify strategic advantages and value-engineering

Execute fully autonomous strategic thinking for construction intelligence."""
    
    def create_autonomous_execution(
        self,
        task_type: TaskType,
        ai_response: str,
        prompt_used: Dict[str, Any],
        confidence_score: float,
        validation_result: Dict[str, Any]
    ) -> AutonomousExecution:
        """
        Create autonomous execution result for AI workflow tracking.
        
        Args:
            task_type: Executed task type
            ai_response: AI-generated response
            prompt_used: Prompt configuration used
            confidence_score: AI confidence score
            validation_result: Response validation results
            
        Returns:
            Autonomous execution result
        """
        execution_id = prompt_used.get("execution_id", f"auto_{uuid.uuid4().hex[:8]}")
        start_time = datetime.datetime.fromisoformat(prompt_used.get("execution_timestamp", datetime.datetime.now().isoformat()))
        
        # Generate next actions based on task type and autonomous workflow
        next_actions = self._generate_autonomous_next_actions(task_type, ai_response, confidence_score)
        
        return AutonomousExecution(
            execution_id=execution_id,
            task_type=task_type,
            start_time=start_time,
            end_time=datetime.datetime.now(),
            status="completed",
            reasoning_pattern=ReasoningPattern(prompt_used.get("reasoning_pattern", "standard")),
            expert_personas=[ExpertPersona(p) for p in prompt_used.get("expert_personas", [])],
            prompt_used=prompt_used,
            ai_response=ai_response,
            confidence_score=confidence_score,
            validation_result=validation_result,
            next_actions=next_actions
        )
    
    def _generate_autonomous_next_actions(
        self,
        task_type: TaskType,
        ai_response: str,
        confidence_score: float
    ) -> List[Dict[str, Any]]:
        """Generate autonomous next actions for workflow continuation."""
        template = self.prompts.get(task_type)
        if not template:
            return []
        
        next_actions = []
        workflow_config = template.autonomous_workflow
        
        # Add workflow continuation actions
        for next_task in workflow_config.get("next_tasks", []):
            next_actions.append({
                "action_type": "workflow_continuation",
                "task": next_task,
                "trigger": "successful_completion",
                "confidence_required": workflow_config.get("confidence_threshold", 0.7),
                "priority": "high" if confidence_score > 0.8 else "medium"
            })
        
        # Add quality validation actions
        for metric in workflow_config.get("quality_metrics", []):
            next_actions.append({
                "action_type": "quality_validation",
                "metric": metric,
                "validation_method": "automated_analysis",
                "priority": "medium"
            })
        
        # Add autonomous integration actions
        next_actions.append({
            "action_type": "autonomous_integration",
            "integration_point": workflow_config.get("orchestrator_integration", "general_workflow"),
            "method": "api_call",
            "priority": "high"
        })
        
        return next_actions
    
    def validate_autonomous_response(
        self,
        response: str,
        expected_format: str,
        task_type: TaskType,
        confidence_threshold: float = 0.7
    ) -> Dict[str, Any]:
        """
        Validate autonomous AI response for quality and integration readiness.
        
        Args:
            response: AI-generated response
            expected_format: Expected output format
            task_type: Type of task performed
            confidence_threshold: Minimum confidence for autonomous integration
            
        Returns:
            Validation results with autonomous readiness assessment
        """
        validation = {
            "is_valid": True,
            "format_correct": False,
            "autonomous_ready": False,
            "completeness_score": 0.0,
            "confidence_score": 0.0,
            "integration_ready": False,
            "quality_metrics": {},
            "autonomous_issues": [],
            "integration_recommendations": []
        }
        
        # Validate format
        if "json" in expected_format.lower():
            try:
                parsed = json.loads(response)
                validation["format_correct"] = True
                
                # Check for autonomous-specific structure
                if isinstance(parsed, dict) and any(key in parsed for key in ["autonomous_", "ai_", "automated_"]):
                    validation["autonomous_ready"] = True
                    
            except json.JSONDecodeError:
                validation["is_valid"] = False
                validation["autonomous_issues"].append("Response is not valid JSON for autonomous integration")
        
        # Autonomous completeness assessment
        autonomous_indicators = {
            "has_confidence_metrics": any(term in response.lower() for term in ["confidence", "probability", "accuracy"]),
            "has_automation_elements": any(term in response.lower() for term in ["automated", "autonomous", "ai_", "auto_"]),
            "has_next_actions": any(term in response.lower() for term in ["next", "action", "recommendation", "implementation"]),
            "has_quantitative_data": any(char.isdigit() for char in response) and any(term in response.lower() for term in ["cost", "schedule", "risk", "efficiency"]),
            "has_multi_expert_synthesis": any(term in response for term in ["structural", "mep", "cost", "safety", "sustainability"])
        }
        validation["completeness_score"] = sum(autonomous_indicators.values()) / len(autonomous_indicators)
        
        # Autonomous confidence scoring
        confidence_factors = {
            "construction_terminology": sum(1 for term in ["load", "capacity", "clearance", "tolerance", "fixture", "system"] if term in response.lower()) > 3,
            "quantitative_precision": response.count(".") > 2 and any(char.isdigit() for char in response),
            "predictive_elements": any(term in response.lower() for term in ["forecast", "predict", "probability", "confidence"]),
            "automation_readiness": validation["autonomous_ready"] and validation["completeness_score"] > 0.7
        }
        validation["confidence_score"] = sum(confidence_factors.values()) / len(confidence_factors)
        
        # Integration readiness
        validation["integration_ready"] = (
            validation["is_valid"] and 
            validation["autonomous_ready"] and 
            validation["confidence_score"] >= confidence_threshold and
            validation["completeness_score"] >= 0.6
        )
        
        # Generate integration recommendations
        if not validation["integration_ready"]:
            if validation["confidence_score"] < confidence_threshold:
                validation["integration_recommendations"].append("Increase AI confidence score through additional analysis")
            if not validation["autonomous_ready"]:
                validation["integration_recommendations"].append("Add autonomous-specific structure and metrics")
            if validation["completeness_score"] < 0.6:
                validation["integration_recommendations"].append("Enhance response completeness with quantitative data and next actions")
        
        return validation


# Global autonomous prompt engineer instance
_autonomous_prompt_engineer: Optional[AutonomousPromptEngineer] = None


def get_autonomous_prompt_engineer() -> AutonomousPromptEngineer:
    """Get autonomous prompt engineer instance."""
    global _autonomous_prompt_engineer
    if _autonomous_prompt_engineer is None:
        _autonomous_prompt_engineer = AutonomousPromptEngineer()
    return _autonomous_prompt_engineer


# Primary access function for autonomous system
def get_prompt_engineer() -> AutonomousPromptEngineer:
    """Get the autonomous prompt engineer for system integration."""
    return get_autonomous_prompt_engineer()


# Autonomous workflow integration helper
def create_autonomous_context(
    document_type: str,
    project_phase: str,
    csi_division: str,
    risk_level: str,
    user_role: str,
    project_value: float,
    location: str,
    building_type: str,
    sustainability_goals: List[str] = None,
    ai_confidence: float = 0.85
) -> AutonomousContext:
    """Create autonomous context for AI-driven execution."""
    return AutonomousContext(
        document_type=document_type,
        project_phase=project_phase,
        csi_division=csi_division,
        risk_level=risk_level,
        user_role=user_role,
        project_value=project_value,
        location=location,
        building_type=building_type,
        sustainability_goals=sustainability_goals or [],
        ai_confidence=ai_confidence,
        autonomous_mode=True
    )