import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      return await handleChatMessage(req, supabaseClient)
    } else if (req.method === 'GET') {
      return await getChatMessages(req, supabaseClient)
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    })

  } catch (error) {
    console.error('Chat handler error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handleChatMessage(req: Request, supabaseClient: any) {
  const { content, role, agentType, userId, projectId } = await req.json()

  if (!content || !role || !userId) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Insert user message
  const userMessage = {
    content,
    role,
    agent_type: agentType,
    user_id: userId,
    project_id: projectId,
  }

  const { data: messageData, error: messageError } = await supabaseClient
    .from('chat_messages')
    .insert(userMessage)
    .select()
    .single()

  if (messageError) {
    console.error('Message insert error:', messageError)
    return new Response(
      JSON.stringify({ error: 'Failed to save message' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  // Generate AI response if user message
  if (role === 'user') {
    const aiResponse = await generateAIResponse(content, agentType || 'suna')

    const assistantMessage = {
      content: aiResponse,
      role: 'assistant',
      agent_type: agentType || 'suna',
      user_id: 'system',
      project_id: projectId,
    }

    const { data: aiMessageData, error: aiMessageError } = await supabaseClient
      .from('chat_messages')
      .insert(assistantMessage)
      .select()
      .single()

    if (aiMessageError) {
      console.error('AI message insert error:', aiMessageError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        userMessage: messageData,
        aiMessage: aiMessageData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: messageData
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function getChatMessages(req: Request, supabaseClient: any) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  const projectId = url.searchParams.get('projectId')

  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'userId parameter required' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  let query = supabaseClient
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (projectId) {
    query = query.eq('project_id', projectId)
  }

  const { data: messages, error } = await query

  if (error) {
    console.error('Messages fetch error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch messages' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  return new Response(
    JSON.stringify({
      success: true,
      messages: messages || []
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function generateAIResponse(userMessage: string, agentType: string): Promise<string> {
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  const responses = {
    suna: [
      "I understand your request. Let me coordinate with the appropriate agents to help you with that.",
      "I'll route this to our specialized agents for processing. This should take just a few moments.",
      "Great question! I'm analyzing your project data and will provide recommendations based on current best practices.",
      "I've reviewed your request and I'm coordinating with our PM Bot and Design Converter agents to provide the best solution.",
      "Thank you for your question. I'm processing this with our construction AI agents to give you the most accurate information.",
    ],
    upload: [
      "File processing initiated. I'll extract the relevant data and classify the document type.",
      "OCR analysis complete. I've successfully extracted text and identified key construction elements.",
      "Document uploaded successfully. Processing with our advanced AI models for maximum accuracy.",
      "Upload received. Beginning automated document classification and text extraction process.",
    ],
    pm: [
      "I've created new tasks based on your project requirements and assigned them to the appropriate team members.",
      "Schedule updated successfully. I've coordinated with all stakeholders and optimized the timeline.",
      "Task assignments complete. All team members have been notified with detailed instructions.",
      "Project timeline analyzed. I'm updating milestones and resource allocation based on current progress.",
    ],
    converter: [
      "2D-to-3D conversion initiated. Processing your CAD drawings with advanced AI algorithms.",
      "Clash detection analysis complete. I've identified potential conflicts that require attention.",
      "3D model generation successful. The BIM model is now ready for review and collaboration.",
      "CAD file analysis completed. Beginning automated 3D model generation and clash detection.",
    ]
  }

  const agentResponses = responses[agentType as keyof typeof responses] || responses.suna
  const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)]

  return randomResponse
}
