"""
AI Model Manager - Universal model selection and switching.
Handles provider initialization, fallback, and routing.
"""

import os
import logging
from typing import Dict, List, Optional, Any
from enum import Enum

from .base import AIProvider, ModelConfig, GenerationResponse, ModelCapability
from .openai_provider import OpenAIProvider

logger = logging.getLogger(__name__)

# Import prompt engineering system
try:
    from ..prompts import get_prompt_engineer, TaskType
    PROMPTS_AVAILABLE = True
except ImportError:
    PROMPTS_AVAILABLE = False
    logger.warning("Advanced prompt engineering system not available")


class ProviderType(str, Enum):
    """Supported AI providers."""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GOOGLE = "google"
    AZURE = "azure"
    LOCAL = "local"


class AIModelManager:
    """
    Manages AI model providers and handles intelligent routing.
    Supports automatic fallback and provider switching.
    Integrates advanced prompt engineering system.
    """
    
    # Enhanced expert system prompt with division-specific intelligence
    FALLBACK_EXPERT_PROMPT = (
        "You are ConstructAI, a world-class expert in construction specifications, compliance, risk management, and project optimization. "
        "Your expertise covers all CSI MasterFormat divisions including: "
        "\n- Division 26 (Electrical): NEC compliance, power distribution, lighting systems"
        "\n- Division 22 (Plumbing): IPC/UPC codes, fixtures, piping systems"
        "\n- Division 23 (HVAC): ASHRAE standards, HVAC equipment and controls"
        "\n- Division 21 (Fire Suppression): NFPA standards, sprinkler systems"
        "\n- Division 03 (Concrete): ACI standards, mix designs, reinforcement"
        "\n- Division 05 (Metals): AISC standards, structural steel, connections"
        "\n- Division 09 (Finishes): ASTM standards, interior/exterior finishes"
        "\n\nYour role is to analyze documents, extract clauses, classify sections, identify risks, and provide actionable recommendations with precision and clarity. "
        "Always use industry best practices, reference standards (CSI MasterFormat, NEC, IPC/UPC, ASHRAE, NFPA, ACI, AISC, ASTM, etc.), "
        "and communicate in a professional, concise, and authoritative manner. "
        "When asked to analyze, audit, or optimize, provide detailed reasoning, cite relevant standards, and suggest practical improvements. "
        "If ambiguity or missing information is detected, highlight it and recommend mitigation strategies. "
        "Your responses should be structured, actionable, and tailored for construction professionals."
    )

    def __init__(self, config_source: str = "env"):
        """
        Initialize AI Model Manager.
        
        Args:
            config_source: Configuration source ("env" for environment variables)
        """
        self.providers: Dict[str, AIProvider] = {}
        self.primary_provider: Optional[str] = None
        self.fallback_order: List[str] = []
        self.prompt_engineer = get_prompt_engineer() if PROMPTS_AVAILABLE else None
        
        if config_source == "env":
            self._load_from_env()
        
        logger.info(f"AI Model Manager initialized with {len(self.providers)} provider(s)")
        if self.prompt_engineer:
            logger.info("Advanced prompt engineering system enabled")
    
    def _load_from_env(self):
        """Load provider configurations from environment variables."""
        
        # OpenAI Configuration
        openai_key = os.getenv("OPENAI_API_KEY")
        openai_model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        openai_base = os.getenv("OPENAI_API_BASE")
        
        if openai_key and openai_key != "your-api-key-here":
            try:
                config = ModelConfig(
                    provider="openai",
                    model_name=openai_model,
                    api_key=openai_key,
                    api_base=openai_base,
                    max_tokens=int(os.getenv("OPENAI_MAX_TOKENS", "4096")),
                    temperature=float(os.getenv("OPENAI_TEMPERATURE", "0.7")),
                    capabilities=[
                        ModelCapability.TEXT_GENERATION,
                        ModelCapability.CHAT,
                        ModelCapability.FUNCTION_CALLING,
                        ModelCapability.JSON_MODE,
                    ]
                )
                self.providers["openai"] = OpenAIProvider(config)
                logger.info(f"OpenAI provider registered: {openai_model}")
            except Exception as e:
                logger.error(f"Failed to initialize OpenAI provider: {e}")
        
        # Set primary provider
        primary = os.getenv("AI_PRIMARY_PROVIDER", "openai").lower()
        if primary in self.providers:
            self.primary_provider = primary
            logger.info(f"Primary provider set to: {primary}")
        elif self.providers:
            # Use first available provider
            self.primary_provider = list(self.providers.keys())[0]
            logger.warning(f"Primary provider '{primary}' not available, using: {self.primary_provider}")
        
        # Set fallback order
        fallback_str = os.getenv("AI_FALLBACK_PROVIDERS", "openai")
        self.fallback_order = [p.strip().lower() for p in fallback_str.split(",") if p.strip()]
        logger.info(f"Fallback order: {self.fallback_order}")
    
    def get_provider(self, provider_name: Optional[str] = None) -> AIProvider:
        """
        Get a specific provider or the primary provider.
        
        Args:
            provider_name: Name of provider (e.g., 'openai', 'anthropic')
            
        Returns:
            AIProvider instance
            
        Raises:
            ValueError: If provider not found
        """
        if provider_name:
            if provider_name not in self.providers:
                raise ValueError(f"Provider '{provider_name}' not available")
            return self.providers[provider_name]
        
        if not self.primary_provider:
            raise ValueError("No providers configured")
        
        return self.providers[self.primary_provider]
    
    def enhance_prompt_with_division_knowledge(
        self,
        system_prompt: str,
        detected_divisions: List[str]
    ) -> str:
        """
        Enhance system prompt with division-specific expertise.
        
        Args:
            system_prompt: Base system prompt
            detected_divisions: List of detected CSI division codes
            
        Returns:
            Enhanced system prompt with division-specific knowledge
        """
        try:
            from ..construction_ontology import DivisionSpecificKnowledge
            
            if not detected_divisions:
                return system_prompt
            
            # Get division-specific expertise
            division_expertise = []
            for division in detected_divisions:
                expertise = DivisionSpecificKnowledge.get_division_expertise(division)
                if expertise and expertise != "General construction expertise with industry best practices":
                    division_expertise.append(f"\n### Division {division} Expertise:\n{expertise}")
            
            if division_expertise:
                enhanced_prompt = system_prompt + "\n\n" + "\n".join(division_expertise)
                logger.info(f"Enhanced prompt with {len(detected_divisions)} division-specific expertise sections")
                return enhanced_prompt
            
        except Exception as e:
            logger.warning(f"Could not enhance prompt with division knowledge: {e}")
        
        return system_prompt
    
    def generate(
        Returns:
            AIProvider instance
            
        Raises:
            ValueError: If provider not found or not available
        """
        if provider_name is None:
            provider_name = self.primary_provider
        
        if not provider_name:
            raise ValueError("No AI provider configured")
        
        provider = self.providers.get(provider_name)
        if not provider:
            raise ValueError(f"Provider '{provider_name}' not found")
        
        if not provider.is_available():
            raise ValueError(f"Provider '{provider_name}' is not available")
        
        return provider
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
        use_fallback: bool = True,
        task_type: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> GenerationResponse:
        """
        Generate text using specified or primary provider with automatic fallback.
        
        Args:
            prompt: User prompt
            system_prompt: Optional system prompt (overrides task-specific prompt)
            provider: Specific provider to use (or None for primary)
            use_fallback: Whether to try fallback providers on failure
            task_type: Optional task type for specialized prompt (e.g., "risk_prediction")
            context: Optional context for prompt engineering
            **kwargs: Additional provider-specific parameters
            
        Returns:
            GenerationResponse
        """
        providers_to_try = []

        # Build provider list
        if provider:
            providers_to_try.append(provider)
        elif self.primary_provider:
            providers_to_try.append(self.primary_provider)

        if use_fallback:
            providers_to_try.extend([
                p for p in self.fallback_order 
                if p not in providers_to_try and p in self.providers
            ])

        last_error = None

        # Use advanced prompt engineering if available
        effective_system_prompt = system_prompt
        if not effective_system_prompt and self.prompt_engineer and task_type:
            try:
                # Get task-specific optimized prompt
                task_enum = TaskType(task_type)
                prompt_data = self.prompt_engineer.get_prompt(task_enum, context)
                effective_system_prompt = prompt_data["system_prompt"]
                # Use engineered user prompt if no prompt provided
                if not prompt or prompt == "":
                    prompt = prompt_data["user_prompt"]
                # Apply optimal parameters
                if "temperature" not in kwargs:
                    kwargs["temperature"] = prompt_data["temperature"]
                if "max_tokens" not in kwargs:
                    kwargs["max_tokens"] = prompt_data["max_tokens"]
                logger.info(f"Using optimized prompt for task: {task_type}")
            except (ValueError, KeyError) as e:
                logger.warning(f"Could not load specialized prompt for {task_type}: {e}")
                effective_system_prompt = self.FALLBACK_EXPERT_PROMPT
        elif not effective_system_prompt:
            # Use fallback expert prompt
            effective_system_prompt = self.FALLBACK_EXPERT_PROMPT

        for provider_name in providers_to_try:
            try:
                provider_obj = self.get_provider(provider_name)
                logger.info(f"Attempting generation with provider: {provider_name}")

                response = provider_obj.generate(
                    prompt=prompt,
                    system_prompt=effective_system_prompt,
                    **kwargs
                )

                logger.info(f"Generation successful with {provider_name}")
                return response

            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                last_error = e
                continue

        # All providers failed
        raise RuntimeError(f"All providers failed. Last error: {last_error}")
    
    def generate_structured(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        provider: Optional[str] = None,
        use_fallback: bool = True,
        task_type: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate structured JSON output with automatic fallback.
        
        Args:
            prompt: User prompt
            schema: JSON schema
            system_prompt: Optional system prompt
            provider: Specific provider to use
            use_fallback: Whether to use fallback providers
            task_type: Optional task type for specialized prompt
            context: Optional context for prompt engineering
            **kwargs: Additional parameters
            
        Returns:
            Parsed JSON object
        """
        providers_to_try = []
        
        if provider:
            providers_to_try.append(provider)
        elif self.primary_provider:
            providers_to_try.append(self.primary_provider)
        
        if use_fallback:
            providers_to_try.extend([
                p for p in self.fallback_order 
                if p not in providers_to_try and p in self.providers
            ])
        
        last_error = None
        
        # Use advanced prompt engineering if available
        effective_system_prompt = system_prompt
        if not effective_system_prompt and self.prompt_engineer and task_type:
            try:
                task_enum = TaskType(task_type)
                prompt_data = self.prompt_engineer.get_prompt(task_enum, context)
                effective_system_prompt = prompt_data["system_prompt"]
                if not prompt:
                    prompt = prompt_data["user_prompt"]
                logger.info(f"Using optimized structured prompt for task: {task_type}")
            except (ValueError, KeyError) as e:
                logger.warning(f"Could not load specialized prompt: {e}")
                effective_system_prompt = self.FALLBACK_EXPERT_PROMPT
        elif not effective_system_prompt:
            effective_system_prompt = self.FALLBACK_EXPERT_PROMPT
        
        for provider_name in providers_to_try:
            try:
                provider_obj = self.get_provider(provider_name)
                
                result = provider_obj.generate_structured(
                    prompt=prompt,
                    schema=schema,
                    system_prompt=effective_system_prompt,
                    **kwargs
                )
                
                logger.info(f"Structured generation successful with {provider_name}")
                return result
                
            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                last_error = e
                continue
        
        raise RuntimeError(f"All providers failed. Last error: {last_error}")
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        provider: Optional[str] = None,
        use_fallback: bool = True,
        **kwargs
    ) -> GenerationResponse:
        """
        Chat completion with automatic fallback.
        
        Args:
            messages: List of message dicts
            provider: Specific provider to use
            use_fallback: Whether to use fallback
            **kwargs: Additional parameters
            
        Returns:
            GenerationResponse
        """
        providers_to_try = []
        
        if provider:
            providers_to_try.append(provider)
        elif self.primary_provider:
            providers_to_try.append(self.primary_provider)
        
        if use_fallback:
            providers_to_try.extend([
                p for p in self.fallback_order 
                if p not in providers_to_try and p in self.providers
            ])
        
        last_error = None
        
        for provider_name in providers_to_try:
            try:
                provider_obj = self.get_provider(provider_name)
                
                response = provider_obj.chat(messages=messages, **kwargs)
                
                logger.info(f"Chat completion successful with {provider_name}")
                return response
                
            except Exception as e:
                logger.warning(f"Provider {provider_name} failed: {e}")
                last_error = e
                continue
        
        raise RuntimeError(f"All providers failed. Last error: {last_error}")
    
    def get_available_providers(self) -> List[Dict[str, Any]]:
        """
        Get list of available providers with their capabilities.
        
        Returns:
            List of provider info dicts
        """
        return [
            provider.get_provider_info()
            for provider in self.providers.values()
            if provider.is_available()
        ]
    
    def get_usage_stats(self, provider: Optional[str] = None) -> Dict[str, Any]:
        """
        Get usage statistics for all or specific provider.
        
        Args:
            provider: Optional provider name
            
        Returns:
            Dict with usage stats
        """
        if provider:
            provider_obj = self.providers.get(provider)
            if provider_obj:
                stats = provider_obj.get_usage_stats()
                return {
                    "provider": provider,
                    "stats": {
                        "prompt_tokens": stats.prompt_tokens,
                        "completion_tokens": stats.completion_tokens,
                        "total_tokens": stats.total_tokens,
                        "estimated_cost": stats.estimated_cost,
                    }
                }
        
        # Return stats for all providers
        all_stats = {}
        total_cost = 0.0
        total_tokens = 0
        
        for name, provider_obj in self.providers.items():
            stats = provider_obj.get_usage_stats()
            all_stats[name] = {
                "prompt_tokens": stats.prompt_tokens,
                "completion_tokens": stats.completion_tokens,
                "total_tokens": stats.total_tokens,
                "estimated_cost": stats.estimated_cost,
            }
            total_cost += stats.estimated_cost
            total_tokens += stats.total_tokens
        
        return {
            "providers": all_stats,
            "total": {
                "total_tokens": total_tokens,
                "estimated_cost": total_cost,
            }
        }
