"""
OpenAI Provider Implementation.
Supports GPT-4, GPT-3.5-turbo, and other OpenAI models.
"""

import json
import logging
from typing import Dict, List, Any, Optional

from .base import AIProvider, ModelConfig, GenerationResponse, UsageStats, ModelCapability

logger = logging.getLogger(__name__)


class OpenAIProvider(AIProvider):
    """
    OpenAI API provider implementation.
    Supports GPT-4, GPT-3.5-turbo, and other OpenAI models.
    """
    
    def __init__(self, config: ModelConfig):
        """Initialize OpenAI provider."""
        super().__init__(config)
        self.client = None
        self._total_prompt_tokens = 0
        self._total_completion_tokens = 0
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize OpenAI client."""
        try:
            from openai import OpenAI
            
            kwargs = {"api_key": self.config.api_key}
            if self.config.api_base:
                kwargs["base_url"] = self.config.api_base
            
            self.client = OpenAI(**kwargs)
            logger.info(f"OpenAI provider initialized with model {self.model_name}")
        except ImportError:
            logger.error("OpenAI package not installed. Install with: pip install openai")
            self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            self.client = None
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> GenerationResponse:
        """Generate text using OpenAI API."""
        if not self.is_available():
            raise RuntimeError("OpenAI provider is not available")
        
        # Build messages
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        
        # Use chat endpoint
        return self.chat(messages, temperature, max_tokens, **kwargs)
    
    def generate_structured(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate structured JSON output."""
        if not self.is_available():
            raise RuntimeError("OpenAI provider is not available")
        
        # Add JSON instruction to system prompt
        json_system = (system_prompt or "") + "\n\nYou must respond with valid JSON matching this schema:\n" + json.dumps(schema, indent=2)
        
        try:
            # For models that support response_format
            response = self.generate(
                prompt=prompt,
                system_prompt=json_system,
                response_format={"type": "json_object"},
                **kwargs
            )
            
            # Parse JSON response
            result = json.loads(response.content)
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise ValueError(f"Model did not return valid JSON: {e}")
    
    def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> GenerationResponse:
        """Chat completion with OpenAI."""
        if not self.is_available():
            raise RuntimeError("OpenAI provider is not available")
        
        try:
            # Prepare parameters
            params = {
                "model": self.model_name,
                "messages": messages,
                "temperature": temperature or self.config.temperature,
                "max_tokens": max_tokens or self.config.max_tokens,
            }
            
            # Add any additional parameters
            params.update(kwargs)
            
            # Make API call
            response = self.client.chat.completions.create(**params)
            
            # Extract response
            choice = response.choices[0]
            content = choice.message.content
            finish_reason = choice.finish_reason
            
            # Track usage
            usage = response.usage
            self._total_prompt_tokens += usage.prompt_tokens
            self._total_completion_tokens += usage.completion_tokens
            
            return GenerationResponse(
                content=content,
                model=self.model_name,
                provider=self.provider_name,
                tokens_used=usage.total_tokens,
                finish_reason=finish_reason,
                metadata={
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "model": response.model,
                }
            )
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {e}")
            raise RuntimeError(f"OpenAI API error: {str(e)}")
    
    def get_usage_stats(self) -> UsageStats:
        """Get usage statistics."""
        total_tokens = self._total_prompt_tokens + self._total_completion_tokens
        
        # Estimate cost (approximate pricing)
        cost = self._estimate_cost(
            self._total_prompt_tokens,
            self._total_completion_tokens
        )
        
        return UsageStats(
            prompt_tokens=self._total_prompt_tokens,
            completion_tokens=self._total_completion_tokens,
            total_tokens=total_tokens,
            estimated_cost=cost
        )
    
    def _estimate_cost(self, prompt_tokens: int, completion_tokens: int) -> float:
        """
        Estimate cost based on OpenAI pricing.
        Prices per 1M tokens (as of 2024).
        """
        pricing = {
            "gpt-4": {"prompt": 30.0, "completion": 60.0},
            "gpt-4-turbo": {"prompt": 10.0, "completion": 30.0},
            "gpt-4o": {"prompt": 2.5, "completion": 10.0},
            "gpt-4o-mini": {"prompt": 0.15, "completion": 0.6},
            "gpt-3.5-turbo": {"prompt": 0.5, "completion": 1.5},
        }
        
        # Find matching pricing
        model_pricing = None
        for key in pricing:
            if key in self.model_name.lower():
                model_pricing = pricing[key]
                break
        
        if not model_pricing:
            # Default to gpt-4o pricing
            model_pricing = pricing["gpt-4o"]
        
        prompt_cost = (prompt_tokens / 1_000_000) * model_pricing["prompt"]
        completion_cost = (completion_tokens / 1_000_000) * model_pricing["completion"]
        
        return prompt_cost + completion_cost
    
    def is_available(self) -> bool:
        """Check if OpenAI provider is available."""
        if not self.client:
            return False
        
        if not self.config.api_key or self.config.api_key == "your-api-key-here":
            return False
        
        return True
