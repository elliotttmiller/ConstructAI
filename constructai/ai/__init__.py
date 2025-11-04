"""
Advanced AI modules for ConstructAI.
Includes risk prediction, cost estimation, recommendation engine, and prompt engineering.
"""

from .risk_predictor import RiskPredictor
from .cost_estimator import CostEstimator  
from .recommender import RecommendationEngine

# Import prompt engineering system
try:
    from .prompts import (
        PromptEngineer,
        TaskType,
        PromptTemplate,
        PromptContext,
        ReasoningPattern,
        get_prompt_engineer
    )
    PROMPTS_AVAILABLE = True
except ImportError:
    PROMPTS_AVAILABLE = False

__all__ = ["RiskPredictor", "CostEstimator", "RecommendationEngine"]

if PROMPTS_AVAILABLE:
    __all__.extend([
        "PromptEngineer",
        "TaskType",
        "PromptTemplate",
        "PromptContext",
        "ReasoningPattern",
        "get_prompt_engineer",
    ])

