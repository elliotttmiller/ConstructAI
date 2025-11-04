"""
Anthropic Claude Provider Implementation.
Supports Claude 3.5 Sonnet, Claude 3 Opus, and other Claude models.
"""

import json
import logging
from typing import Dict, List, Any, Optional

from .base import AIProvider, ModelConfig, GenerationResponse, UsageStats, ModelCapability

logger = logging.getLogger(__name__)


class AnthropicProvider(AIProvider):
    """
    Anthropic Claude API provider implementation.
    """
    
    def __init__(self, config: ModelConfig):
        """Initialize Anthropic provider."""
        super().__init__(config)
        self.client = None
        self._total_input_tokens = 0
        self._total_output_tokens = 0
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Anthropic client."""
        try:
            from anthropic import Anthropic
            
            self.client = Anthropic(api_key=self.config.api_key)
            logger.info(f"Anthropic provider initialized with model {self.model_name}")
        except ImportError:
            logger.error("Anthropic package not installed. Install with: pip install anthropic")
            self.client = None
        except Exception as e:
            logger.error(f"Failed to initialize Anthropic client: {e}")
            self.client = None
    
    def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> GenerationResponse:
        """Generate text using Anthropic API."""
        if not self.is_available():
            raise RuntimeError("Anthropic provider is not available")
        
        try:
            # Prepare parameters
            params = {
                "model": self.model_name,
                "max_tokens": max_tokens or self.config.max_tokens,
                "temperature": temperature or self.config.temperature,
                "messages": [{"role": "user", "content": prompt}]
            }
            
            if system_prompt:
                params["system"] = system_prompt
            
            params.update(kwargs)
            
            # Make API call
            response = self.client.messages.create(**params)
            
            # Extract response
            content = response.content[0].text
            
            # Track usage
            self._total_input_tokens += response.usage.input_tokens
            self._total_output_tokens += response.usage.output_tokens
            
            return GenerationResponse(
                content=content,
                model=self.model_name,
                provider=self.provider_name,
                tokens_used=response.usage.input_tokens + response.usage.output_tokens,
                finish_reason=response.stop_reason,
                metadata={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                    "stop_reason": response.stop_reason,
                }
            )
            
        except Exception as e:
            logger.error(f"Anthropic API call failed: {e}")
            raise RuntimeError(f"Anthropic API error: {str(e)}")
    
    def generate_structured(
        self,
        prompt: str,
        schema: Dict[str, Any],
        system_prompt: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate structured JSON output."""
        if not self.is_available():
            raise RuntimeError("Anthropic provider is not available")
        
        # Add JSON instruction
        json_instruction = f"\n\nRespond with valid JSON matching this schema:\n{json.dumps(schema, indent=2)}"
        enhanced_prompt = prompt + json_instruction
        
        response = self.generate(
            prompt=enhanced_prompt,
            system_prompt=system_prompt,
            **kwargs
        )
        
        try:
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
        """Chat completion with Anthropic."""
        if not self.is_available():
            raise RuntimeError("Anthropic provider is not available")
        
        try:
            # Extract system message if present
            system_prompt = None
            user_messages = []
            
            for msg in messages:
                if msg["role"] == "system":
                    system_prompt = msg["content"]
                else:
                    user_messages.append(msg)
            
            # Prepare parameters
            params = {
                "model": self.model_name,
                "max_tokens": max_tokens or self.config.max_tokens,
                "temperature": temperature or self.config.temperature,
                "messages": user_messages
            }
            
            if system_prompt:
                params["system"] = system_prompt
            
            params.update(kwargs)
            
            # Make API call
            response = self.client.messages.create(**params)
            
            # Extract response
            content = response.content[0].text
            
            # Track usage
            self._total_input_tokens += response.usage.input_tokens
            self._total_output_tokens += response.usage.output_tokens
            
            return GenerationResponse(
                content=content,
                model=self.model_name,
                provider=self.provider_name,
                tokens_used=response.usage.input_tokens + response.usage.output_tokens,
                finish_reason=response.stop_reason,
                metadata={
                    "input_tokens": response.usage.input_tokens,
                    "output_tokens": response.usage.output_tokens,
                }
            )
            
        except Exception as e:
            logger.error(f"Anthropic API call failed: {e}")
            raise RuntimeError(f"Anthropic API error: {str(e)}")
    
    def get_usage_stats(self) -> UsageStats:
        """Get usage statistics."""
        total_tokens = self._total_input_tokens + self._total_output_tokens
        
        # Estimate cost
        cost = self._estimate_cost(self._total_input_tokens, self._total_output_tokens)
        
        return UsageStats(
            prompt_tokens=self._total_input_tokens,
            completion_tokens=self._total_output_tokens,
            total_tokens=total_tokens,
            estimated_cost=cost
        )
    
    def _estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Estimate cost based on Anthropic pricing.
        Prices per 1M tokens (as of 2024).
        """
        pricing = {
            "claude-3-5-sonnet": {"input": 3.0, "output": 15.0},
            "claude-3-opus": {"input": 15.0, "output": 75.0},
            "claude-3-sonnet": {"input": 3.0, "output": 15.0},
            "claude-3-haiku": {"input": 0.25, "output": 1.25},
        }
        
        # Find matching pricing
        model_pricing = None
        for key in pricing:
            if key in self.model_name.lower():
                model_pricing = pricing[key]
                break
        
        if not model_pricing:
            # Default to Sonnet pricing
            model_pricing = pricing["claude-3-5-sonnet"]
        
        input_cost = (input_tokens / 1_000_000) * model_pricing["input"]
        output_cost = (output_tokens / 1_000_000) * model_pricing["output"]
        
        return input_cost + output_cost
    
    def is_available(self) -> bool:
        """Check if Anthropic provider is available."""
        if not self.client:
            return False
        
        if not self.config.api_key or self.config.api_key == "your-api-key-here":
            return False
        
        return True
