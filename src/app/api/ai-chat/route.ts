import { NextRequest, NextResponse } from 'next/server';
import aiClient from '@/lib/ai-services';

export async function POST(request: NextRequest) {
  try {
    const { message, agentType, context, userId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Use aiClient directly (it's a singleton instance)
    const aiService = aiClient;

    // Check if AI services are configured
    const serviceStatus = aiService.getStatus();

    let response;

    try {
      // Route to appropriate AI method based on agent type
      switch (agentType) {
        case 'document':
        case 'upload':
          response = await aiService.getDocumentAnalysis(
            message,
            context?.documentType || 'general'
          );
          break;
        case 'bim':
          response = await aiService.analyzeBIMModel(
            context?.modelData || {},
            context?.clashResults
          );
          break;
        case 'pm':
          response = await aiService.getProjectInsights(
            context?.projectData || {},
            context?.taskData || []
          );
          break;
        case 'compliance':
          response = await aiService.checkBuildingCodeCompliance(
            context?.projectDetails || {},
            context?.location || 'General'
          );
          break;
        case 'ai-assistant':
        default:
          response = await aiService.getAIAssistantResponse(message, context);
          break;
      }
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
