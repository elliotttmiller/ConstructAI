"""
ConstructAI - AI-Powered Construction Workflow Optimization

Transform your construction workflow from start to finish with autonomous AI.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

__version__ = "0.1.0"

# ============================================================================
# CENTRALIZED ENVIRONMENT VARIABLE LOADING
# ============================================================================
# Load environment variables with proper priority:
# 1. .env.local (local overrides, never committed)
# 2. .env (shared defaults, never committed)
# 3. .env.example (template only, safe to commit)
#
# This runs once when the package is imported, ensuring all modules
# have access to environment variables.
# ============================================================================

def _load_environment():
    """
    Load environment variables from .env files with proper priority.
    
    Priority (highest to lowest):
    1. Existing environment variables (already set in shell)
    2. .env.local (local development overrides)
    3. .env (shared configuration)
    4. System defaults
    """
    # Find the project root (where .env files are located)
    project_root = Path(__file__).parent.parent
    
    # Load .env first (lower priority)
    env_file = project_root / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=False)
    
    # Load .env.local second (higher priority, overrides .env)
    env_local_file = project_root / ".env.local"
    if env_local_file.exists():
        load_dotenv(env_local_file, override=True)
    
    # Note: We don't override=True for .env to respect shell environment variables
    # but we do override=True for .env.local to allow local developer overrides

# Load environment variables when package is imported
_load_environment()

from .models.project import Project, Task, Resource, TaskStatus, ResourceType
from .engine.optimizer import WorkflowOptimizer
from .engine.auditor import ProjectAuditor

__all__ = [
    "Project",
    "Task",
    "Resource",
    "TaskStatus",
    "ResourceType",
    "WorkflowOptimizer",
    "ProjectAuditor",
]
