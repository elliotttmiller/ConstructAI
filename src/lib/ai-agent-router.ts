/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Agent Router
 * Intelligently routes user queries to the most appropriate AI agent based on context
 */

import { CopilotContext } from '@/components/providers/CopilotContextProvider';

export type AgentType = 
  | 'ai-assistant'
  | 'document-processor'
  | 'bim-analyzer'
  | 'cost-estimator'
  | 'safety-monitor'
  | 'team-coordinator'
  | 'compliance-checker'
  | 'pm-bot';

export interface AgentRoute {
  agentType: AgentType;
  confidence: number;
  reasoning: string;
}

/**
 * Agent capabilities and keywords
 */
const AGENT_PROFILES: Record<AgentType, {
  keywords: string[];
  capabilities: string[];
  contextPages: string[];
}> = {
  'document-processor': {
    keywords: ['document', 'pdf', 'spec', 'specification', 'blueprint', 'drawing', 'plan', 'upload', 'file', 'analyze document', 'read', 'extract'],
    capabilities: ['document analysis', 'OCR', 'text extraction', 'specification parsing'],
    contextPages: ['documents']
  },
  'bim-analyzer': {
    keywords: ['bim', '3d', 'model', 'ifc', 'clash', 'coordination', 'revit', 'geometry', 'spatial', 'collision', 'quantity takeoff', 'cad', 'parametric', 'generate', 'create model', 'structural column', 'box', 'enclosure', 'build', 'design'],
    capabilities: ['BIM analysis', 'clash detection', 'model coordination', 'quantity extraction', 'parametric CAD generation', '3D model creation', 'build123d integration'],
    contextPages: ['bim']
  },
  'cost-estimator': {
    keywords: ['cost', 'budget', 'estimate', 'price', 'financial', 'expense', 'money', 'dollar', 'bid', 'quote', 'material cost'],
    capabilities: ['cost estimation', 'budget analysis', 'pricing', 'financial planning'],
    contextPages: ['projects']
  },
  'safety-monitor': {
    keywords: ['safety', 'hazard', 'risk', 'accident', 'injury', 'osha', 'compliance', 'ppe', 'incident', 'danger'],
    capabilities: ['safety monitoring', 'risk assessment', 'compliance checking', 'incident tracking'],
    contextPages: ['projects', 'workflows']
  },
  'team-coordinator': {
    keywords: ['team', 'assign', 'task', 'member', 'worker', 'schedule', 'resource', 'coordination', 'collaboration', 'workload'],
    capabilities: ['task assignment', 'team coordination', 'resource allocation', 'schedule management'],
    contextPages: ['team', 'projects']
  },
  'compliance-checker': {
    keywords: ['compliance', 'code', 'regulation', 'building code', 'permit', 'inspection', 'legal', 'requirement', 'standard', 'zoning'],
    capabilities: ['code compliance', 'regulation checking', 'permit requirements', 'inspection preparation'],
    contextPages: ['projects', 'documents']
  },
  'pm-bot': {
    keywords: ['project', 'timeline', 'milestone', 'phase', 'planning', 'progress', 'status', 'overview', 'dashboard', 'manage'],
    capabilities: ['project management', 'timeline planning', 'progress tracking', 'milestone management'],
    contextPages: ['projects', 'workflows']
  },
  'ai-assistant': {
    keywords: ['help', 'question', 'how', 'what', 'why', 'when', 'general', 'guide', 'explain'],
    capabilities: ['general assistance', 'guidance', 'information', 'coordination'],
    contextPages: ['home', 'chat', 'agents', 'enterprise']
  }
};

/**
 * Route user query to the most appropriate agent based on context and content
 */
export function routeToAgent(
  message: string,
  context: CopilotContext
): AgentRoute {
  const messageLower = message.toLowerCase();
  const scores: Record<string, number> = {};
  
  // Calculate scores for each agent
  for (const [agentType, profile] of Object.entries(AGENT_PROFILES)) {
    let score = 0;
    
    // Score based on keyword matching
    for (const keyword of profile.keywords) {
      if (messageLower.includes(keyword)) {
        score += 10;
      }
    }
    
    // Boost score if current page matches agent's context pages
    if (profile.contextPages.includes(context.currentPage)) {
      score += 15;
    }
    
    // Boost based on active resources
    if (agentType === 'document-processor' && context.activeDocument) {
      score += 20;
    }
    if (agentType === 'bim-analyzer' && context.activeBIMModel) {
      score += 20;
    }
    if (agentType === 'pm-bot' && context.activeProject) {
      score += 10;
    }
    if (agentType === 'team-coordinator' && context.selectedTasks && context.selectedTasks.length > 0) {
      score += 15;
    }
    
    scores[agentType] = score;
  }
  
  // Find the agent with highest score
  let bestAgent: AgentType = 'ai-assistant';
  let maxScore = 0;
  
  for (const [agentType, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestAgent = agentType as AgentType;
    }
  }
  
  // If no strong match, use general assistant
  if (maxScore < 10) {
    bestAgent = 'ai-assistant';
  }
  
  // Calculate confidence (0-1)
  const confidence = Math.min(maxScore / 50, 1.0);
  
  // Generate reasoning
  const profile = AGENT_PROFILES[bestAgent];
  const reasoning = generateReasoning(bestAgent, confidence, context, messageLower, profile);
  
  return {
    agentType: bestAgent,
    confidence,
    reasoning
  };
}

function generateReasoning(
  agentType: AgentType,
  confidence: number,
  context: CopilotContext,
  message: string,
  profile: any
): string {
  const reasons: string[] = [];
  
  // Context-based reasoning
  if (profile.contextPages.includes(context.currentPage)) {
    reasons.push(`You're on the ${context.currentPage} page`);
  }
  
  if (context.activeProject) {
    reasons.push(`Working on project: ${context.activeProject.name}`);
  }
  
  if (context.activeDocument) {
    reasons.push(`Viewing document: ${context.activeDocument.name}`);
  }
  
  // Keyword-based reasoning
  const matchedKeywords = profile.keywords.filter((kw: string) => message.includes(kw));
  if (matchedKeywords.length > 0) {
    reasons.push(`Query mentions: ${matchedKeywords.slice(0, 3).join(', ')}`);
  }
  
  // Capability match
  if (reasons.length === 0) {
    reasons.push(`Best suited for ${profile.capabilities[0]}`);
  }
  
  return reasons.join(' • ');
}

/**
 * Get agent display information
 */
export function getAgentInfo(agentType: AgentType) {
  const agentNames: Record<AgentType, string> = {
    'ai-assistant': 'AI Assistant',
    'document-processor': 'Document Processor',
    'bim-analyzer': 'BIM Analyzer',
    'cost-estimator': 'Cost Estimator',
    'safety-monitor': 'Safety Monitor',
    'team-coordinator': 'Team Coordinator',
    'compliance-checker': 'Compliance Checker',
    'pm-bot': 'Project Manager'
  };
  
  const agentDescriptions: Record<AgentType, string> = {
    'ai-assistant': 'General construction AI assistance',
    'document-processor': 'Document analysis and processing',
    'bim-analyzer': '3D BIM model analysis and coordination',
    'cost-estimator': 'Cost estimation and budget analysis',
    'safety-monitor': 'Safety compliance and risk assessment',
    'team-coordinator': 'Team coordination and task assignment',
    'compliance-checker': 'Building code compliance checking',
    'pm-bot': 'Project management and planning'
  };
  
  return {
    name: agentNames[agentType],
    description: agentDescriptions[agentType],
    capabilities: AGENT_PROFILES[agentType]?.capabilities || []
  };
}

/**
 * Get suggested actions based on current context
 */
export function getSuggestedActions(context: CopilotContext): Array<{
  label: string;
  description: string;
  agentType: AgentType;
  prompt: string;
}> {
  const actions: Array<{
    label: string;
    description: string;
    agentType: AgentType;
    prompt: string;
  }> = [];
  
  // Page-specific suggestions
  if (context.currentPage === 'projects' && context.activeProject) {
    actions.push({
      label: 'Get Project Status',
      description: 'View current project status and progress',
      agentType: 'pm-bot',
      prompt: `Give me a status update on project ${context.activeProject.name}`
    });
    
    actions.push({
      label: 'Estimate Costs',
      description: 'Get cost estimates for project',
      agentType: 'cost-estimator',
      prompt: `Provide a cost estimate for ${context.activeProject.name}`
    });
    
    actions.push({
      label: 'Check Compliance',
      description: 'Review building code compliance',
      agentType: 'compliance-checker',
      prompt: `Check building code compliance for ${context.activeProject.name}`
    });
  }
  
  if (context.currentPage === 'documents' && context.activeDocument) {
    actions.push({
      label: 'Analyze Document',
      description: 'Get AI analysis of this document',
      agentType: 'document-processor',
      prompt: `Analyze the document ${context.activeDocument.name}`
    });
    
    actions.push({
      label: 'Extract Key Info',
      description: 'Extract important details',
      agentType: 'document-processor',
      prompt: `Extract key information from ${context.activeDocument.name}`
    });
  }
  
  if (context.currentPage === 'bim' && context.activeBIMModel) {
    actions.push({
      label: 'Check for Clashes',
      description: 'Run clash detection analysis',
      agentType: 'bim-analyzer',
      prompt: `Run clash detection on ${context.activeBIMModel.name}`
    });
    
    actions.push({
      label: 'Quantity Takeoff',
      description: 'Extract material quantities',
      agentType: 'bim-analyzer',
      prompt: `Perform quantity takeoff for ${context.activeBIMModel.name}`
    });
  }
  
  if (context.currentPage === 'team' && context.selectedTasks && context.selectedTasks.length > 0) {
    actions.push({
      label: 'Auto-Assign Tasks',
      description: 'Let AI assign tasks to team members',
      agentType: 'team-coordinator',
      prompt: `Auto-assign the selected tasks to appropriate team members`
    });
  }
  
  // Always available actions
  actions.push({
    label: 'Ask a Question',
    description: 'Get help with anything',
    agentType: 'ai-assistant',
    prompt: 'How can you help me?'
  });
  
  return actions.slice(0, 5); // Limit to top 5 suggestions
}
