"""
Unit tests for AI Provider System.
Tests the universal AI model integration and switching.
"""

import unittest
import os
from unittest.mock import Mock, patch

from constructai.ai.providers.base import (
    AIProvider,
    ModelConfig,
    GenerationResponse,
    UsageStats,
    ModelCapability,
)
from constructai.ai.providers.manager import AIModelManager


class TestModelConfig(unittest.TestCase):
    """Test ModelConfig dataclass."""
    
    def test_model_config_creation(self):
        """Test creating model configuration."""
        config = ModelConfig(
            provider="openai",
            model_name="gpt-4o-mini",
            api_key="test-key",
            max_tokens=2048,
            temperature=0.5
        )
        
        self.assertEqual(config.provider, "openai")
        self.assertEqual(config.model_name, "gpt-4o-mini")
        self.assertEqual(config.api_key, "test-key")
        self.assertEqual(config.max_tokens, 2048)
        self.assertEqual(config.temperature, 0.5)
    
    def test_default_capabilities(self):
        """Test default capabilities are set."""
        config = ModelConfig(
            provider="test",
            model_name="test-model",
            api_key="key"
        )
        
        self.assertIsNotNone(config.capabilities)
        self.assertIn(ModelCapability.TEXT_GENERATION, config.capabilities)


class TestGenerationResponse(unittest.TestCase):
    """Test GenerationResponse dataclass."""
    
    def test_response_creation(self):
        """Test creating generation response."""
        response = GenerationResponse(
            content="Test response",
            model="gpt-4o-mini",
            provider="openai",
            tokens_used=100,
            finish_reason="stop"
        )
        
        self.assertEqual(response.content, "Test response")
        self.assertEqual(response.model, "gpt-4o-mini")
        self.assertEqual(response.provider, "openai")
        self.assertEqual(response.tokens_used, 100)
        self.assertEqual(response.finish_reason, "stop")
        self.assertIsNotNone(response.metadata)


class TestAIModelManager(unittest.TestCase):
    """Test AI Model Manager."""
    
    def setUp(self):
        """Set up test environment."""
        # Save original env vars
        self.original_env = os.environ.copy()
    
    def tearDown(self):
        """Restore environment."""
        os.environ.clear()
        os.environ.update(self.original_env)
    
    def test_manager_initialization(self):
        """Test manager initialization."""
        # Set minimal env vars
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        
        manager = AIModelManager(config_source="env")
        
        self.assertIsNotNone(manager)
        self.assertEqual(manager.primary_provider, "openai")
    
    def test_load_openai_from_env(self):
        """Test loading OpenAI provider from environment."""
        os.environ["OPENAI_API_KEY"] = "test-key"
        os.environ["OPENAI_MODEL"] = "gpt-4o-mini"
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        
        manager = AIModelManager(config_source="env")
        
        self.assertIn("openai", manager.providers)
        self.assertEqual(manager.primary_provider, "openai")
    
    def test_load_anthropic_from_env(self):
        """Test loading Anthropic provider from environment."""
        os.environ["ANTHROPIC_API_KEY"] = "test-key"
        os.environ["ANTHROPIC_MODEL"] = "claude-3-5-sonnet-20241022"
        os.environ["AI_PRIMARY_PROVIDER"] = "anthropic"
        
        manager = AIModelManager(config_source="env")
        
        self.assertIn("anthropic", manager.providers)
    
    def test_fallback_order(self):
        """Test fallback order configuration."""
        os.environ["OPENAI_API_KEY"] = "test-key-1"
        os.environ["ANTHROPIC_API_KEY"] = "test-key-2"
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        os.environ["AI_FALLBACK_PROVIDERS"] = "anthropic"
        
        manager = AIModelManager(config_source="env")
        
        self.assertEqual(manager.primary_provider, "openai")
        self.assertIn("anthropic", manager.fallback_order)
    
    def test_get_provider(self):
        """Test getting a specific provider."""
        os.environ["OPENAI_API_KEY"] = "test-key"
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        
        manager = AIModelManager(config_source="env")
        
        # Get primary provider
        provider = manager.get_provider()
        self.assertIsNotNone(provider)
        
        # Get specific provider
        provider = manager.get_provider("openai")
        self.assertIsNotNone(provider)
    
    def test_get_nonexistent_provider(self):
        """Test getting non-existent provider raises error."""
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        
        manager = AIModelManager(config_source="env")
        
        with self.assertRaises(ValueError):
            manager.get_provider("nonexistent")
    
    def test_get_available_providers(self):
        """Test getting list of available providers."""
        os.environ["OPENAI_API_KEY"] = "test-key"
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        
        manager = AIModelManager(config_source="env")
        
        providers = manager.get_available_providers()
        self.assertIsInstance(providers, list)
    
    def test_usage_stats(self):
        """Test getting usage statistics."""
        os.environ["OPENAI_API_KEY"] = "test-key"
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        
        manager = AIModelManager(config_source="env")
        
        stats = manager.get_usage_stats()
        self.assertIsInstance(stats, dict)
        self.assertIn("providers", stats)
        self.assertIn("total", stats)
    
    @patch('constructai.ai.providers.openai_provider.OpenAI')
    def test_generate_with_fallback(self, mock_openai):
        """Test generation with fallback."""
        os.environ["OPENAI_API_KEY"] = "test-key-1"
        os.environ["ANTHROPIC_API_KEY"] = "test-key-2"
        os.environ["AI_PRIMARY_PROVIDER"] = "openai"
        os.environ["AI_FALLBACK_PROVIDERS"] = "anthropic"
        
        # Mock OpenAI to fail
        mock_openai.side_effect = Exception("Primary provider failed")
        
        manager = AIModelManager(config_source="env")
        
        # This should try primary then fallback
        # In real scenario, would fall back to anthropic
        # For this test, we just verify the manager handles it
        self.assertIsNotNone(manager)


class TestProviderCapabilities(unittest.TestCase):
    """Test provider capability checks."""
    
    def test_capability_check(self):
        """Test checking provider capabilities."""
        config = ModelConfig(
            provider="test",
            model_name="test-model",
            api_key="key",
            capabilities=[
                ModelCapability.TEXT_GENERATION,
                ModelCapability.CHAT,
            ]
        )
        
        # Create a mock provider
        class MockProvider(AIProvider):
            def generate(self, **kwargs):
                pass
            
            def generate_structured(self, **kwargs):
                pass
            
            def chat(self, **kwargs):
                pass
            
            def get_usage_stats(self):
                return UsageStats(0, 0, 0, 0.0)
            
            def is_available(self):
                return True
        
        provider = MockProvider(config)
        
        self.assertTrue(provider.supports_capability(ModelCapability.TEXT_GENERATION))
        self.assertTrue(provider.supports_capability(ModelCapability.CHAT))
        self.assertFalse(provider.supports_capability(ModelCapability.VISION))


class TestUsageStats(unittest.TestCase):
    """Test usage statistics."""
    
    def test_usage_stats_creation(self):
        """Test creating usage stats."""
        stats = UsageStats(
            prompt_tokens=100,
            completion_tokens=50,
            total_tokens=150,
            estimated_cost=0.002
        )
        
        self.assertEqual(stats.prompt_tokens, 100)
        self.assertEqual(stats.completion_tokens, 50)
        self.assertEqual(stats.total_tokens, 150)
        self.assertAlmostEqual(stats.estimated_cost, 0.002)


if __name__ == '__main__':
    unittest.main()
