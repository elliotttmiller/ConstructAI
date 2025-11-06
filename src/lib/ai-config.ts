/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// AI Model Configuration Interface
export interface AIModelConfig {
  provider: 'openai' | 'google' | 'anthropic' | 'azure' | 'custom';
  model: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  enabled: boolean;
}

// Universal AI Response Interface
export interface UniversalAIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason?: string;
}

// AI Configuration Manager
export class AIConfigManager {
  private static instance: AIConfigManager;
  private configs: Map<string, AIModelConfig> = new Map();
  private clients: Map<string, any> = new Map();

  private constructor() {
    this.loadConfiguration();
    this.initializeClients();
  }

  public static getInstance(): AIConfigManager {
    if (!AIConfigManager.instance) {
      AIConfigManager.instance = new AIConfigManager();
    }
    return AIConfigManager.instance;
  }

  private loadConfiguration() {
    // Load configuration from environment variables
    const configs = {
      // Primary AI Model (for main responses)
      primary: {
        provider: (process.env.AI_PRIMARY_PROVIDER as any) || 'openai',
        model: process.env.AI_PRIMARY_MODEL || 'gpt-4-turbo-preview',
        temperature: parseFloat(process.env.AI_PRIMARY_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_PRIMARY_MAX_TOKENS || '1500'),
        topP: parseFloat(process.env.AI_PRIMARY_TOP_P || '1.0'),
        frequencyPenalty: parseFloat(process.env.AI_PRIMARY_FREQUENCY_PENALTY || '0.1'),
        presencePenalty: parseFloat(process.env.AI_PRIMARY_PRESENCE_PENALTY || '0.1'),
        enabled: process.env.AI_PRIMARY_ENABLED !== 'false'
      },
      
      // Document Analysis Model
      document: {
        provider: (process.env.AI_DOCUMENT_PROVIDER as any) || 'openai',
        model: process.env.AI_DOCUMENT_MODEL || 'gpt-4-turbo-preview',
        temperature: parseFloat(process.env.AI_DOCUMENT_TEMPERATURE || '0.3'),
        maxTokens: parseInt(process.env.AI_DOCUMENT_MAX_TOKENS || '2000'),
        enabled: process.env.AI_DOCUMENT_ENABLED !== 'false'
      },

      // BIM Analysis Model
      bim: {
        provider: (process.env.AI_BIM_PROVIDER as any) || 'openai',
        model: process.env.AI_BIM_MODEL || 'gpt-4-turbo-preview',
        temperature: parseFloat(process.env.AI_BIM_TEMPERATURE || '0.4'),
        maxTokens: parseInt(process.env.AI_BIM_MAX_TOKENS || '1800'),
        enabled: process.env.AI_BIM_ENABLED !== 'false'
      },

      // Cost Estimation Model
      cost: {
        provider: (process.env.AI_COST_PROVIDER as any) || 'openai',
        model: process.env.AI_COST_MODEL || 'gpt-4-turbo-preview',
        temperature: parseFloat(process.env.AI_COST_TEMPERATURE || '0.2'),
        maxTokens: parseInt(process.env.AI_COST_MAX_TOKENS || '1200'),
        enabled: process.env.AI_COST_ENABLED !== 'false'
      },

      // Fallback Model (when primary fails)
      fallback: {
        provider: (process.env.AI_FALLBACK_PROVIDER as any) || 'openai',
        model: process.env.AI_FALLBACK_MODEL || 'gpt-3.5-turbo',
        temperature: parseFloat(process.env.AI_FALLBACK_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.AI_FALLBACK_MAX_TOKENS || '1000'),
        enabled: process.env.AI_FALLBACK_ENABLED !== 'false'
      }
    };

    // Store configurations
    Object.entries(configs).forEach(([key, config]) => {
      this.configs.set(key, config);
    });

    console.log('🤖 AI Configuration loaded:', Array.from(this.configs.keys()));
  }

  private initializeClients() {
    // Initialize OpenAI client if any OpenAI models are configured
    const hasOpenAI = Array.from(this.configs.values()).some(c => c.provider === 'openai' && c.enabled);
    if (hasOpenAI && process.env.OPENAI_API_KEY) {
      this.clients.set('openai', new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: false
      }));
      console.log('✅ OpenAI client initialized');
    }

    // Initialize Google AI client if any Google models are configured
    const hasGoogle = Array.from(this.configs.values()).some(c => c.provider === 'google' && c.enabled);
    if (hasGoogle && process.env.GOOGLE_AI_API_KEY) {
      this.clients.set('google', new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY));
      console.log('✅ Google AI client initialized');
    }

    // Initialize Azure OpenAI if configured
    if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      this.clients.set('azure', new OpenAI({
        apiKey: process.env.AZURE_OPENAI_API_KEY,
        baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments`,
        defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview' },
        defaultHeaders: {
          'api-key': process.env.AZURE_OPENAI_API_KEY,
        },
      }));
      console.log('✅ Azure OpenAI client initialized');
    }
  }

  // Get configuration for a specific AI task
  public getConfig(task: string): AIModelConfig | null {
    return this.configs.get(task) || this.configs.get('primary') || null;
  }

  // Get all available configurations
  public getAllConfigs(): Map<string, AIModelConfig> {
    return new Map(this.configs);
  }

  // Universal AI completion method
  public async complete(
    task: string,
    messages: Array<{role: 'system' | 'user' | 'assistant', content: string}>,
    overrideConfig?: Partial<AIModelConfig>
  ): Promise<UniversalAIResponse> {
    const config = this.getConfig(task);
    if (!config || !config.enabled) {
      throw new Error(`AI task '${task}' is not configured or disabled`);
    }

    // Apply overrides if provided
    const finalConfig = { ...config, ...overrideConfig };

    try {
      switch (finalConfig.provider) {
        case 'openai':
        case 'azure':
          return await this.completeOpenAI(finalConfig, messages);
        case 'google':
          return await this.completeGoogle(finalConfig, messages);
        default:
          throw new Error(`Provider '${finalConfig.provider}' not supported`);
      }
    } catch (error) {
      console.error(`AI completion failed for task '${task}':`, error);
      
      // Try fallback if available and not already using fallback
      if (task !== 'fallback' && this.configs.has('fallback')) {
        console.log('🔄 Attempting fallback model...');
        return await this.complete('fallback', messages, overrideConfig);
      }
      
      throw error;
    }
  }

  private async completeOpenAI(config: AIModelConfig, messages: any[]): Promise<UniversalAIResponse> {
    const client = this.clients.get(config.provider === 'azure' ? 'azure' : 'openai');
    if (!client) {
      throw new Error(`${config.provider} client not initialized`);
    }

    const completion = await client.chat.completions.create({
      model: config.model,
      messages,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      top_p: config.topP,
      frequency_penalty: config.frequencyPenalty,
      presence_penalty: config.presencePenalty,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      provider: config.provider,
      model: config.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      finishReason: completion.choices[0]?.finish_reason || 'unknown'
    };
  }

  private async completeGoogle(config: AIModelConfig, messages: any[]): Promise<UniversalAIResponse> {
    const client = this.clients.get('google');
    if (!client) {
      throw new Error('Google AI client not initialized');
    }

    const model = client.getGenerativeModel({ model: config.model });
    
    // Convert OpenAI format to Google format
    const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      content: response.text(),
      provider: 'google',
      model: config.model,
      usage: {
        promptTokens: 0, // Google doesn't provide token counts in the same way
        completionTokens: 0,
        totalTokens: 0,
      },
      finishReason: 'stop'
    };
  }

  // Check which AI services are properly configured
  public getServiceStatus(): { [key: string]: boolean } {
    return {
      openai: !!this.clients.get('openai'),
      google: !!this.clients.get('google'),
      azure: !!this.clients.get('azure'),
    };
  }

  // Reload configuration (useful for runtime updates)
  public reload() {
    this.configs.clear();
    this.clients.clear();
    this.loadConfiguration();
    this.initializeClients();
    console.log('🔄 AI Configuration reloaded');
  }
}

// Export singleton instance
export const aiConfig = AIConfigManager.getInstance();