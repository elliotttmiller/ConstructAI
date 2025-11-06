import { NextRequest, NextResponse } from 'next/server';
import ConstructionAIService from '@/lib/ai-services';

export async function POST(request: NextRequest) {
  try {
    const { message, agentType, context, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const aiService = ConstructionAIService.getInstance();

    // Check if AI services are configured
    const serviceStatus = aiService.isConfigured();

    let response;

    try {
      // Use the multi-agent conversation handler
      response = await aiService.handleMultiAgentConversation(
        [{ role: 'user', content: message, agentType }],
        agentType || 'ai-assistant',
        context
      );
    } catch (error) {
      console.error('AI service error:', error);
      
      // Return proper error instead of fallback
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Failed to process AI request',
          serviceStatus,
          agentType: agentType || 'ai-assistant'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ...response,
      serviceStatus,
      timestamp: new Date().toISOString(),
      agentType: agentType || 'ai-assistant'
    });

  } catch (error) {
    console.error('AI chat API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        model: 'error-fallback',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
