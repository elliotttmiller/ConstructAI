import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// OpenAI Configuration
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: false // Only use server-side
});

// Google AI Configuration
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agentType?: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  reasoning?: string;
}

export class ConstructionAIService {
  private static instance: ConstructionAIService;

  public static getInstance(): ConstructionAIService {
    if (!ConstructionAIService.instance) {
      ConstructionAIService.instance = new ConstructionAIService();
    }
    return ConstructionAIService.instance;
  }

  // Suna AI - Master Orchestrator
  async getSunaResponse(message: string, context?: any): Promise<AIResponse> {
    const systemPrompt = `You are Suna AI, the master orchestrator for ConstructAI, a comprehensive construction management platform. You coordinate with specialized AI agents and provide intelligent insights for construction projects.

Your capabilities include:
- Project management and coordination
- Document analysis and processing
- BIM model insights and clash detection
- Building code compliance checking
- Team collaboration and task assignment
- Resource allocation and scheduling
- Risk assessment and safety recommendations

Context: ${JSON.stringify(context || {})}

Respond as a knowledgeable construction industry expert with access to advanced AI agents. Be specific, actionable, and professional.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      const response = completion.choices[0]?.message?.content || "I apologize, but I couldn't process your request at the moment.";

      return {
        content: response,
        model: "gpt-4-turbo-preview",
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        }
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get AI response. Please check your OpenAI API configuration and try again.');
    }
  }

  // Document Processing Agent
  async getDocumentAnalysis(documentText: string, documentType: string): Promise<AIResponse> {
    const systemPrompt = `You are the Document Processing Agent for ConstructAI. Analyze construction documents and extract key information, identify potential issues, and provide recommendations.

Document Type: ${documentType}

Extract and analyze:
- Key specifications and requirements
- Safety considerations
- Compliance requirements
- Potential conflicts or issues
- Recommendations for project team

Provide structured, actionable insights for construction professionals.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent([
        systemPrompt,
        `Document content: ${documentText}`
      ]);

      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        model: "gemini-pro"
      };
    } catch (error) {
      console.error('Google AI API error:', error);
      throw new Error('Failed to analyze document. Please check your Google AI API configuration and try again.');
    }
  }

  // Building Code Compliance Agent
  async checkBuildingCodeCompliance(projectDetails: any, location: string): Promise<AIResponse> {
    const systemPrompt = `You are the Building Code Compliance Agent for ConstructAI. Analyze construction projects for building code compliance based on location and project specifications.

Location: ${location}
Project Details: ${JSON.stringify(projectDetails)}

Check for compliance with:
- Local building codes and regulations
- Safety requirements and standards
- Accessibility standards (ADA, etc.)
- Environmental regulations
- Structural requirements
- Fire safety codes
- Zoning restrictions

Provide detailed compliance analysis with specific code references and recommendations.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this project for building code compliance.` }
        ],
        max_tokens: 1500,
        temperature: 0.3,
      });

      const response = completion.choices[0]?.message?.content || "Unable to complete compliance analysis.";

      return {
        content: response,
        model: "gpt-4-turbo-preview",
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        }
      };
    } catch (error) {
      console.error('Building code compliance error:', error);
      throw new Error('Failed to check building code compliance. Please check your API configuration and try again.');
    }
  }

  // BIM Analysis Agent
  async analyzeBIMModel(modelData: any, clashDetectionResults?: any): Promise<AIResponse> {
    const systemPrompt = `You are the BIM Analysis Agent for ConstructAI. Analyze 3D BIM models, identify potential issues, and provide construction insights.

Model Data: ${JSON.stringify(modelData)}
Clash Detection Results: ${JSON.stringify(clashDetectionResults || {})}

Analyze for:
- Structural integrity and design issues
- MEP coordination conflicts
- Construction sequencing recommendations
- Material optimization opportunities
- Cost estimation insights
- Schedule impact assessments

Provide detailed technical analysis with actionable recommendations.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent([
        systemPrompt,
        `Please analyze this BIM model and provide insights.`
      ]);

      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        model: "gemini-pro"
      };
    } catch (error) {
      console.error('BIM analysis error:', error);
      throw new Error('Failed to analyze BIM model. Please check your API configuration and try again.');
    }
  }

  // Project Management Agent
  async getProjectInsights(projectData: any, taskData: any[]): Promise<AIResponse> {
    const systemPrompt = `You are the Project Management Agent for ConstructAI. Analyze project data and provide intelligent insights for project optimization.

Project Data: ${JSON.stringify(projectData)}
Tasks: ${JSON.stringify(taskData)}

Analyze and provide insights on:
- Project timeline optimization
- Resource allocation efficiency
- Risk identification and mitigation
- Budget variance analysis
- Team productivity recommendations
- Critical path analysis
- Milestone achievement strategies

Provide actionable project management recommendations.`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this project and provide management insights.` }
        ],
        max_tokens: 1200,
        temperature: 0.5,
      });

      const response = completion.choices[0]?.message?.content || "Unable to complete project analysis.";

      return {
        content: response,
        model: "gpt-4-turbo-preview",
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        }
      };
    } catch (error) {
      console.error('Project management error:', error);
      throw new Error('Failed to generate project insights. Please check your API configuration and try again.');
    }
  }

  // Risk Assessment Agent
  async assessProjectRisks(projectData: any, weatherData?: any): Promise<AIResponse> {
    const systemPrompt = `You are the Risk Assessment Agent for ConstructAI. Analyze construction projects for potential risks and provide mitigation strategies.

Project Data: ${JSON.stringify(projectData)}
Weather Data: ${JSON.stringify(weatherData || {})}

Assess risks in categories:
- Safety and health risks
- Environmental and weather risks
- Financial and budget risks
- Schedule and timeline risks
- Technical and design risks
- Regulatory and compliance risks
- Market and economic risks

Provide risk levels (Low/Medium/High/Critical) and specific mitigation strategies.`;

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent([
        systemPrompt,
        `Please conduct a comprehensive risk assessment for this construction project.`
      ]);

      const response = await result.response;
      const text = response.text();

      return {
        content: text,
        model: "gemini-pro"
      };
    } catch (error) {
      console.error('Risk assessment error:', error);
      throw new Error('Failed to assess project risks. Please check your API configuration and try again.');
    }
  }

  // Multi-Agent Conversation Handler
  async handleMultiAgentConversation(
    messages: AIMessage[],
    agentType: string,
    context?: any
  ): Promise<AIResponse> {
    switch (agentType) {
      case 'suna':
        return this.getSunaResponse(messages[messages.length - 1].content, context);
      case 'upload':
        return this.getDocumentAnalysis(messages[messages.length - 1].content, context?.documentType || 'general');
      case 'compliance':
        return this.checkBuildingCodeCompliance(context?.projectDetails, context?.location || 'General');
      case 'bim':
        return this.analyzeBIMModel(context?.modelData, context?.clashResults);
      case 'pm':
        return this.getProjectInsights(context?.projectData, context?.taskData || []);
      case 'risk':
        return this.assessProjectRisks(context?.projectData, context?.weatherData);
      default:
        return this.getSunaResponse(messages[messages.length - 1].content, context);
    }
  }

  // Check if AI services are properly configured
  isConfigured(): { openai: boolean; google: boolean } {
    return {
      openai: !!process.env.OPENAI_API_KEY,
      google: !!process.env.GOOGLE_AI_API_KEY
    };
  }
}

export default ConstructionAIService;
