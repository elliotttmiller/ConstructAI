# Universal AI Model Integration System

## Overview

ConstructAI features a universal, seamless AI model integration system that allows you to:
- Use multiple AI providers (OpenAI, Anthropic Claude, Google Gemini, Azure OpenAI, local models)
- Automatically switch between providers
- Configure fallback providers for reliability
- Track usage and costs across all providers
- Easily add new providers

## Supported Providers

### ✅ Currently Implemented
1. **OpenAI** (GPT-4, GPT-4o, GPT-3.5-turbo)
2. **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku)

### 📋 Easy to Add
3. **Google Gemini** (Gemini Pro, Gemini Pro Vision)
4. **Azure OpenAI** (Uses OpenAI provider with Azure endpoint)
5. **Local Models** (Ollama, LM Studio)

## Quick Start

### 1. Configure Environment Variables

Copy `.env.example` to `.env` and configure your API keys:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Primary provider
AI_PRIMARY_PROVIDER=openai

# Fallback providers (optional)
AI_FALLBACK_PROVIDERS=anthropic

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
OPENAI_MODEL=gpt-4o-mini

# Anthropic Configuration (optional)
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```

### 2. Start the Application

```bash
python start.py
```

The AI Model Manager will automatically:
- Load configured providers
- Verify API keys
- Set up fallback chain
- Make providers available to all endpoints

### 3. Test Your Configuration

```bash
# Check available providers
curl http://localhost:8000/api/ai/providers

# Test a provider
curl -X POST http://localhost:8000/api/ai/test \
  -H "Content-Type: application/json" \
  -d '{"provider": "openai", "prompt": "Hello!"}'
```

## Configuration Options

### Provider Selection

```env
# Primary provider (first choice for all requests)
AI_PRIMARY_PROVIDER=openai

# Fallback providers (used if primary fails)
# Comma-separated, in order of preference
AI_FALLBACK_PROVIDERS=anthropic,openai
```

### OpenAI Configuration

```env
OPENAI_API_KEY=sk-...                    # Required
OPENAI_MODEL=gpt-4o-mini                # Default model
OPENAI_MAX_TOKENS=4096                  # Max tokens per request
OPENAI_TEMPERATURE=0.7                  # Sampling temperature (0-1)
OPENAI_API_BASE=https://custom.api.com  # Optional: custom endpoint
```

**Available Models:**
- `gpt-4o` - Latest, best (multimodal)
- `gpt-4o-mini` - Fast, cheap, recommended
- `gpt-4-turbo` - Powerful, expensive
- `gpt-4` - Original GPT-4
- `gpt-3.5-turbo` - Legacy, cheapest

### Anthropic Configuration

```env
ANTHROPIC_API_KEY=sk-ant-...                          # Required
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022            # Default model
ANTHROPIC_MAX_TOKENS=4096                             # Max tokens
ANTHROPIC_TEMPERATURE=0.7                             # Temperature
```

**Available Models:**
- `claude-3-5-sonnet-20241022` - Latest, best
- `claude-3-opus-20240229` - Most capable
- `claude-3-sonnet-20240229` - Balanced
- `claude-3-haiku-20240307` - Fast, cheap

### Azure OpenAI Configuration

```env
AI_PRIMARY_PROVIDER=openai
OPENAI_API_KEY=your-azure-key
OPENAI_API_BASE=https://your-resource.openai.azure.com
OPENAI_API_VERSION=2024-02-15-preview
OPENAI_MODEL=your-deployment-name
```

## API Usage

### Check Available Providers

```bash
GET /api/ai/providers
```

Response:
```json
{
  "status": "success",
  "primary_provider": "openai",
  "fallback_order": ["anthropic"],
  "providers": [
    {
      "provider": "openai",
      "model": "gpt-4o-mini",
      "capabilities": ["text_generation", "chat", "function_calling", "json_mode"],
      "available": true
    }
  ],
  "usage": {
    "providers": {
      "openai": {
        "prompt_tokens": 1234,
        "completion_tokens": 567,
        "total_tokens": 1801,
        "estimated_cost": 0.0045
      }
    },
    "total": {
      "total_tokens": 1801,
      "estimated_cost": 0.0045
    }
  }
}
```

### Test a Provider

```bash
POST /api/ai/test
```

Request:
```json
{
  "provider": "openai",
  "prompt": "Say hello!"
}
```

Response:
```json
{
  "status": "success",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "response": "Hello! How can I help you today?",
  "tokens_used": 25
}
```

### Get Usage Statistics

```bash
GET /api/ai/usage
GET /api/ai/usage?provider=openai
```

## Python API Usage

### Basic Generation

```python
from constructai.ai.providers import AIModelManager

# Initialize manager (loads from environment)
manager = AIModelManager()

# Generate text (uses primary provider with automatic fallback)
response = manager.generate(
    prompt="Analyze this construction project...",
    system_prompt="You are a construction expert.",
    temperature=0.7,
    max_tokens=1000
)

print(response.content)
print(f"Provider: {response.provider}")
print(f"Tokens used: {response.tokens_used}")
```

### Specify Provider

```python
# Use specific provider
response = manager.generate(
    prompt="What are the risks?",
    provider="anthropic",  # Force use of Anthropic
    use_fallback=False  # Don't fall back to other providers
)
```

### Chat Completion

```python
messages = [
    {"role": "system", "content": "You are a construction AI assistant."},
    {"role": "user", "content": "What's the critical path?"},
    {"role": "assistant", "content": "The critical path is..."},
    {"role": "user", "content": "How can we optimize it?"}
]

response = manager.chat(messages=messages)
print(response.content)
```

### Structured Output (JSON)

```python
schema = {
    "type": "object",
    "properties": {
        "risks": {"type": "array"},
        "severity": {"type": "string"},
        "mitigation": {"type": "string"}
    }
}

result = manager.generate_structured(
    prompt="Analyze project risks",
    schema=schema
)

print(result)  # Parsed JSON dict
```

### Get Provider Information

```python
# List available providers
providers = manager.get_available_providers()
for provider in providers:
    print(f"{provider['provider']}: {provider['model']}")

# Get usage stats
stats = manager.get_usage_stats()
print(f"Total cost: ${stats['total']['estimated_cost']:.4f}")
```

## Automatic Fallback

The system automatically falls back to alternative providers if the primary fails:

```python
# This will try openai, then anthropic if openai fails
response = manager.generate(
    prompt="Analyze this...",
    use_fallback=True  # Default
)
```

Fallback scenarios:
- API key invalid or missing
- Rate limit exceeded
- Model unavailable
- Network error
- Any other provider error

## Cost Tracking

The system tracks usage and estimates costs:

```python
# Get usage stats for all providers
stats = manager.get_usage_stats()

print(f"OpenAI: ${stats['providers']['openai']['estimated_cost']:.4f}")
print(f"Total: ${stats['total']['estimated_cost']:.4f}")
```

**Pricing (as of 2024):**

| Provider | Model | Input (per 1M tokens) | Output (per 1M tokens) |
|----------|-------|----------------------|------------------------|
| OpenAI | gpt-4o | $2.50 | $10.00 |
| OpenAI | gpt-4o-mini | $0.15 | $0.60 |
| OpenAI | gpt-4-turbo | $10.00 | $30.00 |
| Anthropic | claude-3-5-sonnet | $3.00 | $15.00 |
| Anthropic | claude-3-opus | $15.00 | $75.00 |
| Anthropic | claude-3-haiku | $0.25 | $1.25 |

## Adding New Providers

### 1. Create Provider Class

```python
from constructai.ai.providers.base import AIProvider, ModelConfig

class MyProvider(AIProvider):
    def __init__(self, config: ModelConfig):
        super().__init__(config)
        # Initialize your API client
    
    def generate(self, prompt, **kwargs):
        # Implement text generation
        pass
    
    def chat(self, messages, **kwargs):
        # Implement chat completion
        pass
    
    def is_available(self):
        # Check if provider is configured
        return bool(self.config.api_key)
```

### 2. Register in Manager

Edit `constructai/ai/providers/manager.py`:

```python
def _load_from_env(self):
    # Add your provider
    my_key = os.getenv("MY_PROVIDER_API_KEY")
    if my_key:
        config = ModelConfig(
            provider="myprovider",
            model_name=os.getenv("MY_PROVIDER_MODEL"),
            api_key=my_key
        )
        self.providers["myprovider"] = MyProvider(config)
```

### 3. Add to .env.example

```env
MY_PROVIDER_API_KEY=your-key-here
MY_PROVIDER_MODEL=model-name
```

## Best Practices

1. **Set Primary and Fallback**: Configure at least 2 providers for reliability
2. **Use Environment Variables**: Never hardcode API keys
3. **Monitor Usage**: Check `/api/ai/usage` regularly
4. **Choose Right Model**: Use cheaper models for simple tasks
5. **Handle Errors**: Always implement error handling
6. **Test Providers**: Use `/api/ai/test` to verify configuration

## Troubleshooting

### Provider Not Available

**Problem**: `Provider 'openai' is not available`

**Solutions**:
1. Check API key in `.env`
2. Verify key is valid
3. Check `/api/ai/providers` endpoint
4. Review logs for initialization errors

### All Providers Failed

**Problem**: `All providers failed`

**Solutions**:
1. Check internet connection
2. Verify API keys are valid
3. Check provider status pages
4. Review rate limits
5. Check logs for specific errors

### High Costs

**Solutions**:
1. Use cheaper models (gpt-4o-mini, claude-haiku)
2. Reduce max_tokens
3. Implement caching
4. Monitor usage with `/api/ai/usage`

## Security

1. **Never commit `.env`**: Added to `.gitignore`
2. **Rotate keys regularly**: Update API keys periodically
3. **Use environment variables**: Don't hardcode sensitive data
4. **Monitor usage**: Track for unauthorized use
5. **Set rate limits**: Prevent abuse

## Examples

See `examples/ai_provider_usage.py` for complete examples.

## Support

For issues or questions:
1. Check logs: `logs/constructai.log`
2. Test providers: `/api/ai/test`
3. Review configuration: `.env`
4. Check documentation: `docs/`

## License

MIT License - see LICENSE file for details
