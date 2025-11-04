"""
Universal AI Provider Interface.
Defines the contract that all AI providers must implement.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum


class ModelCapability(Enum):
    """AI model capabilities."""
    TEXT_GENERATION = "text_generation"
    CHAT = "chat"
    EMBEDDINGS = "embeddings"
    FUNCTION_CALLING = "function_calling"
    VISION = "vision"
    JSON_MODE = "json_mode"


@dataclass
class ModelConfig:
    """Configuration for an AI model."""
    provider: str
    model_name: str
    api_key: str
    api_base: Optional[str] = None
    max_tokens: int = 4096
    temperature: float = 0.7
    timeout: int = 60
    capabilities: List[ModelCapability] = None
    
    def __post_init__(self):
        if self.capabilities is None:
            self.capabilities = [ModelCapability.TEXT_GENERATION]


@dataclass
class GenerationResponse:
    """Response from AI model generation."""
    content: str
    model: str
    provider: str
    tokens_used: int
    finish_reason: str
    metadata: Dict[str, Any] = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


@dataclass
class UsageStats:
    """Token usage statistics."""
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost: float = 0.0


class AIProvider(ABC):
    """
    Abstract base class for AI providers.
    All AI providers must implement this interface.
    """
    
    def __init__(self, config: ModelConfig):
        """
        Initialize the provider with configuration.
        
        Args:
            config: Model configuration
        """
        self.config = config
        self.provider_name = config.provider
        self.model_name = config.model_name
    
    @abstractmethod
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> GenerationResponse:
        """
        Generate text from a prompt.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            **kwargs: Additional provider-specific parameters
            
        Returns:
            GenerationResponse with generated text and metadata
        """
        pass
    
    @abstractmethod
    def generate_structured(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate structured output (JSON) from a prompt.
        
        Args:
            prompt: User prompt
            schema: JSON schema for output validation
            system_prompt: Optional system prompt
            **kwargs: Additional provider-specific parameters
            
        Returns:
            Parsed JSON object matching the schema
        """
        pass
    
    @abstractmethod
    def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> GenerationResponse:
        """
        Chat completion with message history.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            **kwargs: Additional provider-specific parameters
            
        Returns:
            GenerationResponse with assistant message
        """
        pass
    
    @abstractmethod
    def get_usage_stats(self) -> UsageStats:
        """
        Get token usage statistics.
        
        Returns:
            UsageStats object with token counts and cost
        """
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """
        Check if the provider is available and configured.
        
        Returns:
            True if provider can be used, False otherwise
        """
        pass
    
    def supports_capability(self, capability: ModelCapability) -> bool:
        """
        Check if model supports a specific capability.
        
        Args:
            capability: Capability to check
            
        Returns:
            True if supported, False otherwise
        """
        return capability in self.config.capabilities
    
    def get_provider_info(self) -> Dict[str, Any]:
        """
        Get provider information.
        
        Returns:
            Dict with provider details
        """
        return {
            "provider": self.provider_name,
            "model": self.model_name,
            "capabilities": [c.value for c in self.config.capabilities],
            "available": self.is_available()
        }
