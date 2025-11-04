"""
Advanced AI modules for ConstructAI.
Includes unified construction intelligence engine, autonomous orchestration,
prompt engineering, universal document intelligence, and legacy utilities.
"""

# Import universal document intelligence
try:
    from .universal_intelligence import UniversalDocumentIntelligence
    UNIVERSAL_INTELLIGENCE_AVAILABLE = True
except ImportError:
    UNIVERSAL_INTELLIGENCE_AVAILABLE = False
    UniversalDocumentIntelligence = None

# Import unified construction intelligence engine
try:
    from .utilities import (
        ConstructionIntelligenceEngine,
        get_intelligence_engine,
        RiskAssessment,
        QuantitativeEstimate,
        StrategicRecommendation,
        CostCategory,
        RiskSeverity,
        RecommendationPriority
    )
    UTILITIES_AVAILABLE = True
except ImportError:
    UTILITIES_AVAILABLE = False

# Import analysis generator
try:
    from .analysis_generator import AnalysisGenerator
    ANALYSIS_GENERATOR_AVAILABLE = True
except ImportError:
    ANALYSIS_GENERATOR_AVAILABLE = False

# Import autonomous orchestrator
try:
    from .autonomous_orchestrator import (
        AutonomousAIOrchestrator,
        get_autonomous_orchestrator,
        AnalysisPhase,
        ConfidenceLevel,
        AutonomousWorkflowState
    )
    AUTONOMOUS_AVAILABLE = True
except ImportError:
    AUTONOMOUS_AVAILABLE = False

# Import prompt engineering system
try:
    from .prompts import (
        AutonomousPromptEngineer,
        TaskType,
        PromptTemplate,
        PromptContext,
        AutonomousContext,
        AutonomousExecution,
        ReasoningPattern,
        ExpertPersona,
        get_prompt_engineer,
        get_autonomous_prompt_engineer,
        create_autonomous_context
    )
    PROMPTS_AVAILABLE = True
except ImportError:
    PROMPTS_AVAILABLE = False

__all__ = [
    # Legacy (deprecated)
    "RiskPredictor", "CostEstimator", "RecommendationEngine"
]

if UTILITIES_AVAILABLE:
    __all__.extend([
        "ConstructionIntelligenceEngine",
        "get_intelligence_engine",
        "RiskAssessment",
        "QuantitativeEstimate",
        "StrategicRecommendation",
        "CostCategory",
        "RiskSeverity",
        "RecommendationPriority",
    ])

if ANALYSIS_GENERATOR_AVAILABLE:
    __all__.extend([
        "AnalysisGenerator",
    ])

if AUTONOMOUS_AVAILABLE:
    __all__.extend([
        "AutonomousAIOrchestrator",
        "get_autonomous_orchestrator",
        "AnalysisPhase",
        "ConfidenceLevel",
        "AutonomousWorkflowState",
    ])

if PROMPTS_AVAILABLE:
    __all__.extend([
        "AutonomousPromptEngineer",
        "TaskType",
        "PromptTemplate",
        "PromptContext",
        "AutonomousContext",
        "AutonomousExecution",
        "ReasoningPattern",
        "ExpertPersona",
        "get_prompt_engineer",
        "get_autonomous_prompt_engineer",
        "create_autonomous_context",
    ])

