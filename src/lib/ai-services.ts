/* eslint-disable @typescript-eslint/no-explicit-any */
import OpenAI from 'openai';
import { aiConfig } from './ai-config';
import { getToolDefinitions, executeAgentTool, ToolResult } from './ai-agent-tools';

// --- Types ---
type Provider = 'openai';
type CompletionOptions = {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  enableTools?: boolean;
};

export type AIResponse = {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  reasoning?: string;
};

// --- Utility ---
const formatForPrompt = (value: unknown): string => {
  try {
    if (value === undefined || value === null) return '{}';
    if (typeof value === 'string') return value;
    return JSON.stringify(value, null, 2);
  } catch (error) {
    console.warn('Prompt formatting fallback triggered:', error);
    return String(value);
  }
};

// --- Universal AI Client ---
class UniversalAIClient {
  private openai: OpenAI | null = null;
  private primaryProvider: Provider | null = null;

  constructor() { this.initializeClients(); }

  private initializeClients(): void {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, dangerouslyAllowBrowser: false });
      this.primaryProvider = 'openai';
      console.log('✅ OpenAI initialized as primary AI provider');
    }
    if (!this.primaryProvider) {
      console.warn('⚠️ No AI providers configured. Please set OPENAI_API_KEY');
    }
  }

  private getAvailableProviders(): Provider[] {
    const providers: Provider[] = [];
    if (this.openai) providers.push('openai');
    return providers;
  }

  getStatus(): { openai: boolean; primary: Provider | null; available: Provider[] } {
    return {
      openai: !!this.openai,
      primary: this.primaryProvider,
      available: this.getAvailableProviders()
    };
  }

  async complete(systemPrompt: string, userMessage: string, options: CompletionOptions = {}): Promise<{ content: string; model: string; usage?: any }> {
    const providers = this.getAvailableProviders();
    if (providers.length === 0) throw new Error('No AI providers are configured. Please set OPENAI_API_KEY or GOOGLE_AI_API_KEY in your environment variables.');
    for (const provider of providers) {
      try {
        if (provider === 'openai') {
          return await this.completeWithOpenAI(systemPrompt, userMessage, options);
        }
      } catch (error) {
        console.error(`${provider} failed, trying next provider:`, error);
      }
    }
    throw new Error('All AI providers failed. Please check your API keys and network connection.');
  }

  private async completeWithOpenAI(systemPrompt: string, userMessage: string, options: CompletionOptions): Promise<{ content: string; model: string; usage?: any }> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    const completion = await this.openai.chat.completions.create({
      model: options.model || process.env.AI_PRIMARY_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1500,
      top_p: 1.0,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    });
    return {
      content: completion.choices[0]?.message?.content || '',
      model: completion.model,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0
      }
    };
  }

  async completeWithTools(systemPrompt: string, userMessage: string, options: CompletionOptions = {}): Promise<{ content: string; model: string; usage?: any; toolCalls?: any[] }> {
    if (!this.openai || options.enableTools === false) return this.complete(systemPrompt, userMessage, options);
    const tools = getToolDefinitions();
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
    const totalUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    const executedTools: { name: string; arguments: Record<string, unknown>; result: ToolResult }[] = [];
    let finalResponse = '';
    let iterationCount = 0;
    const MAX_ITERATIONS = 5;
    while (iterationCount < MAX_ITERATIONS) {
      iterationCount += 1;
      const completion = await this.openai.chat.completions.create({
        model: options.model || process.env.AI_PRIMARY_MODEL || 'gpt-4-turbo-preview',
        messages,
        tools,
        tool_choice: 'auto',
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 1500
      });
      const choice = completion.choices[0];
      if (completion.usage) {
        totalUsage.promptTokens += completion.usage.prompt_tokens || 0;
        totalUsage.completionTokens += completion.usage.completion_tokens || 0;
        totalUsage.totalTokens += completion.usage?.total_tokens || 0;
      }
      if (!choice.message.tool_calls) {
        finalResponse = choice.message.content || '';
        break;
      }
      messages.push(choice.message);
      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === 'function') {
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(toolCall.function.arguments || '{}'); } catch (parseError) { console.error('Failed to parse tool arguments:', parseError); }
          const toolResult = (await executeAgentTool(toolCall.function.name, args)) as ToolResult;
          executedTools.push({ name: toolCall.function.name, arguments: args, result: toolResult });
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(toolResult) });
        }
      }
    }
    return {
      content: finalResponse,
      model: process.env.AI_PRIMARY_MODEL || 'gpt-4-turbo-preview',
      usage: totalUsage,
      toolCalls: executedTools
    };
  }

  async analyzeDocumentWithVision(
    imageUrl: string,
    documentType: string,
    options: { temperature?: number; maxTokens?: number; detail?: 'low' | 'high' | 'auto' } = {}
  ): Promise<{ content: string; model: string; usage?: any }> {
    if (!this.openai) throw new Error('OpenAI not initialized. Vision API requires OpenAI.');
    // imageUrl must be a public URL accessible from the internet, e.g. /uploads/filename.png
    const systemPrompt = `# Role: Elite Construction Document Vision Analyst\n\nYou are an advanced AI specialist in visual analysis of construction documents, blueprints, plans, and technical drawings. You possess expert-level knowledge in:\n- Reading and interpreting architectural blueprints and construction plans\n- Identifying building elements, dimensions, annotations, and specifications\n- Recognizing construction symbols, codes, and standards\n- Detecting issues, conflicts, or missing information in visual documents\n- Understanding spatial relationships and construction sequences\n\n## Document Type: ${documentType}\n\n## Analysis Framework\n...`; // Truncated for brevity
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: [
            { type: 'text', text: `Analyze this ${documentType} construction document in detail. Extract all visible information, measurements, and provide professional construction insights.` },
            { type: 'image_url', image_url: { url: imageUrl, detail: options.detail || 'high' } }
          ] }
        ],
        temperature: options.temperature ?? 0.4,
        max_tokens: options.maxTokens ?? 4096
      });
      return {
        content: completion.choices[0]?.message?.content || '',
        model: completion.model,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('Vision API error:', error);
      throw new Error('Failed to analyze document with vision. This may be because GPT-4 Vision is not available or the image is invalid.');
    }
  }

  async analyzeDocumentMultiModal(
    imageUrl: string,
    extractedText: string,
    documentType: string,
    options: { temperature?: number; maxTokens?: number } = {}
  ): Promise<{ content: string; model: string; usage?: any }> {
    if (!this.openai) throw new Error('OpenAI not initialized');
    const systemPrompt = `# Role: Multi-Modal Construction Document Intelligence\n...`; // Truncated for brevity
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `The following text has been extracted from the document:\n\n${extractedText}\n\n**Visual Analysis:**\nPlease analyze the image below and correlate it with the extracted text above.` },
          { role: 'user', content: [
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
          ] }
        ],
        temperature: options.temperature ?? 0.3,
        max_tokens: options.maxTokens ?? 4096
      });
      return {
        content: completion.choices[0]?.message?.content || '',
        model: completion.model,
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      console.error('Multi-modal analysis error:', error);
      throw new Error('Failed to perform multi-modal analysis.');
    }
  }

  // High-level wrapper methods for orchestrator compatibility
  async getDocumentAnalysis(documentText: string, documentType: string): Promise<AIResponse> {
    const systemPrompt = `You are an expert construction document analyst. Analyze the following ${documentType} document and provide detailed insights.`;
    const result = await this.complete(systemPrompt, `Document content:\n\n${documentText}`, { temperature: 0.4, maxTokens: 2048 });
    return { content: result.content, model: result.model, usage: result.usage };
  }

  async analyzeBIMModel(modelData: any, clashDetectionResults?: any): Promise<AIResponse> {
    const systemPrompt = `You are an expert BIM analyst. Analyze the following BIM model data and clash detection results.`;
    const userMessage = `Model Data: ${formatForPrompt(modelData)}\n\nClash Detection Results: ${formatForPrompt(clashDetectionResults || {})}`;
    const result = await this.complete(systemPrompt, userMessage, { temperature: 0.4, maxTokens: 2048 });
    return { content: result.content, model: result.model, usage: result.usage };
  }

  async getProjectInsights(projectData: any, taskData: any[]): Promise<AIResponse> {
    const systemPrompt = `You are an expert project management analyst. Provide insights and recommendations for this construction project.`;
    const userMessage = `Project Data: ${formatForPrompt(projectData)}\n\nTasks: ${formatForPrompt(taskData)}`;
    const result = await this.complete(systemPrompt, userMessage, { temperature: 0.5, maxTokens: 2000 });
    return { content: result.content, model: result.model, usage: result.usage };
  }

  async getAIAssistantResponse(message: string, context?: any): Promise<AIResponse> {
    const systemPrompt = `You are an AI assistant for a construction management platform. Help users with their questions and tasks.`;
    const userMessage = context ? `Context: ${formatForPrompt(context)}\n\nUser: ${message}` : message;
    const result = await this.completeWithTools(systemPrompt, userMessage, { temperature: 0.7, maxTokens: 2000 });
    return { 
      content: result.content, 
      model: result.model, 
      usage: result.usage,
      reasoning: result.toolCalls?.length ? `Executed ${result.toolCalls.length} tool(s)` : undefined
    };
  }

  async checkBuildingCodeCompliance(projectDetails: any, location: string): Promise<AIResponse> {
    const systemPrompt = `You are an expert building code compliance analyst. Review this project for code compliance issues.`;
    const userMessage = `Project Details: ${formatForPrompt(projectDetails)}\n\nLocation: ${location}`;
    const result = await this.complete(systemPrompt, userMessage, { temperature: 0.3, maxTokens: 2000 });
    return { content: result.content, model: result.model, usage: result.usage };
  }
}

const aiClient = new UniversalAIClient();

export default aiClient;
