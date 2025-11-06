/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Send,
  Bot,
  User,
  Circle,
  Zap,
  FileText,
  Building,
  Calculator,
  Shield,
  Users,
  Mic,
  Paperclip,
  MoreVertical,
  Settings,
  Minimize2,
  Maximize2,
  Info,
  FolderKanban
} from 'lucide-react';
import socketService from '@/lib/socket';
import AIServiceStatus from '@/components/ai/AIServiceStatus';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: string;
  userId: string;
  timestamp: Date;
  projectId?: string;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    relatedDocuments?: string[];
    cost?: number;
    safety?: boolean;
    model?: string;
    serviceStatus?: {
      openai: boolean;
      google: boolean;
    };
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    error?: string;
  };
}

interface AgentStatus {
  agentType: string;
  status: 'online' | 'busy' | 'offline' | 'processing';
  lastActivity: Date;
  message?: string;
  activeUsers?: number;
  tasksCompleted?: number;
}

interface TypingIndicator {
  userId: string;
  isTyping: boolean;
  agentType?: string;
}

const AGENT_TYPES = {
  suna: {
    name: 'AI',
    description: 'Main construction coordinator and project orchestrator',
    icon: Bot,
    color: 'bg-blue-500',
    capabilities: ['Project Management', 'Coordination', 'Analysis', 'Reporting']
  },
  'document-processor': {
    name: 'Document AI',
    description: 'Processes construction documents, plans, and specifications',
    icon: FileText,
    color: 'bg-green-500',
    capabilities: ['OCR Processing', 'Code Compliance', 'Document Analysis', 'Data Extraction']
  },
  'bim-analyzer': {
    name: 'BIM Expert',
    description: 'Analyzes 3D models, clash detection, and spatial coordination',
    icon: Building,
    color: 'bg-purple-500',
    capabilities: ['3D Analysis', 'Clash Detection', 'Model Optimization', 'Spatial Planning']
  },
  'cost-estimator': {
    name: 'Cost AI',
    description: 'Estimates costs, analyzes budgets, and tracks expenses',
    icon: Calculator,
    color: 'bg-orange-500',
    capabilities: ['Cost Analysis', 'Budget Tracking', 'Material Optimization', 'ROI Analysis']
  },
  'safety-monitor': {
    name: 'Safety AI',
    description: 'Monitors safety compliance and risk assessment',
    icon: Shield,
    color: 'bg-red-500',
    capabilities: ['Safety Monitoring', 'Risk Assessment', 'Compliance Check', 'Incident Prevention']
  },
  'team-coordinator': {
    name: 'Team AI',
    description: 'Manages team coordination and task assignments',
    icon: Users,
    color: 'bg-indigo-500',
    capabilities: ['Team Management', 'Task Assignment', 'Progress Tracking', 'Communication']
  }
};

interface Project {
  id: string;
  name: string;
  phase: string;
}

export default function ChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('suna');
  const [selectedProject, setSelectedProject] = useState<string | null>(null); // null = general chat
  const [projects, setProjects] = useState<Project[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<string, AgentStatus>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showAgentPanel, setShowAgentPanel] = useState(true);
  const [showAIStatus, setShowAIStatus] = useState(false);
  const [processingIndicator, setProcessingIndicator] = useState<{
    show: boolean;
    progress: number;
    message: string;
  }>({ show: false, progress: 0, message: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch available projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    if (session?.user) {
      fetchProjects();
    }
  }, [session]);

  // Initialize socket connection and event listeners
  useEffect(() => {
    const initializeChat = async () => {
      setConnectionStatus('connecting');

      // Load message history from database
      try {
        if (session?.user?.email) {
          const response = await fetch('/api/messages');
          if (response.ok) {
            const data = await response.json();
            if (data.messages && data.messages.length > 0) {
              // Transform messages to match ChatMessage interface
              const transformedMessages = data.messages.map((msg: any) => ({
                id: msg.id,
                content: msg.content,
                role: msg.role,
                agentType: msg.agent_type,
                userId: msg.user_id,
                timestamp: new Date(msg.created_at),
                projectId: msg.project_id,
                metadata: msg.metadata || {}
              }));
              setMessages(transformedMessages);
            } else {
              // Only add welcome message if no history exists
              addWelcomeMessage();
            }
          } else {
            addWelcomeMessage();
          }
        } else {
          addWelcomeMessage();
        }
      } catch (error) {
        console.error('Failed to load message history:', error);
        addWelcomeMessage();
      }

      // Listen for connection status
      socketService.on('connection_status', (data: any) => {
        setIsConnected(data.status === 'connected');
        setConnectionStatus(data.status === 'connected' ? 'connected' : 'disconnected');
      });

      // Listen for new messages
      socketService.on('new_message', (message: ChatMessage) => {
        setMessages(prev => [...prev, message]);

        // Handle processing completion
        if (message.role === 'assistant') {
          setProcessingIndicator({ show: false, progress: 0, message: '' });
        }
      });

      // Listen for typing indicators
      socketService.on('user_typing', (data: TypingIndicator) => {
        setTypingUsers(prev => {
          const filtered = prev.filter(u => u.userId !== data.userId);
          if (data.isTyping) {
            return [...filtered, data];
          }
          return filtered;
        });
      });

      // Listen for agent status updates
      socketService.on('agent_status_changed', (status: AgentStatus) => {
        setAgentStatuses(prev => ({
          ...prev,
          [status.agentType]: status
        }));
      });

      // Listen for workflow events
      socketService.on('workflow_started', (data: any) => {
        console.log('Workflow started:', data);
        // Could add workflow notifications to UI
      });

      socketService.on('workflow_completed', (data: any) => {
        console.log('Workflow completed:', data);
        // Could add success notification to UI
      });

      socketService.on('workflow_error', (data: any) => {
        console.error('Workflow error:', data);
        // Could add error notification to UI
      });

      // Initial connection check
      if (socketService.isSocketConnected()) {
        setIsConnected(true);
        setConnectionStatus('connected');
      }
    };

    const addWelcomeMessage = () => {
      const welcomeMessage: ChatMessage = {
        id: 'welcome_' + Date.now(),
        content: `Welcome to ConstructAI! I'm your AI Assistant, ready to help coordinate your construction projects. I can help you with:

🏗️ **Project Management** - Coordinate tasks, timelines, and resources
📋 **Document Processing** - Analyze plans, specs, and building codes
🎯 **3D BIM Analysis** - Review models, detect clashes, optimize designs
💰 **Cost Analysis** - Estimate costs, track budgets, optimize spending
⚠️ **Safety Monitoring** - Ensure compliance, assess risks, prevent incidents
👥 **Team Coordination** - Manage assignments, track progress, facilitate communication

What would you like to work on today?`,
        role: 'assistant',
        agentType: 'suna',
        userId: 'system',
        timestamp: new Date(),
        metadata: {
          confidence: 100,
          processingTime: 0
        }
      };

      setMessages([welcomeMessage]);
    };

    initializeChat();

    // Cleanup
    return () => {
      socketService.off('connection_status');
      socketService.off('new_message');
      socketService.off('user_typing');
      socketService.off('agent_status_changed');
      socketService.off('workflow_started');
      socketService.off('workflow_completed');
      socketService.off('workflow_error');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced message sending - Direct API call for better performance
  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || !session?.user) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      content: inputValue.trim(),
      role: 'user',
      agentType: selectedAgent,
      userId: session.user.email || 'anonymous',
      timestamp: new Date(),
      projectId: selectedProject || undefined // Use selected project or undefined for general chat
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue.trim();
    setInputValue('');

    // Show processing indicator
    setProcessingIndicator({
      show: true,
      progress: 10,
      message: `${AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES]?.name} is analyzing your request...`
    });

    try {
      // Save user message to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: userMessage.content,
          role: userMessage.role,
          agent_type: userMessage.agentType,
          project_id: userMessage.projectId,
          metadata: userMessage.metadata || {}
        })
      });

      // Update progress
      setProcessingIndicator(prev => ({
        ...prev,
        progress: 30,
        message: 'Connecting to AI service...'
      }));

      // Call AI API directly
      const aiResponse = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMessage,
          agentType: selectedAgent,
          userId: session.user.email,
          context: {
            projectId: selectedProject,
            timestamp: new Date().toISOString(),
            conversationHistory: messages.slice(-5) // Last 5 messages for context
          }
        })
      });

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      // Update progress
      setProcessingIndicator(prev => ({
        ...prev,
        progress: 80,
        message: 'Generating response...'
      }));

      const aiData = await aiResponse.json();

      // Create AI message
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        content: aiData.content || 'I apologize, but I couldn\'t generate a response.',
        role: 'assistant',
        agentType: selectedAgent,
        userId: 'ai_system',
        timestamp: new Date(),
        projectId: selectedProject || undefined,
        metadata: {
          model: aiData.model,
          serviceStatus: aiData.serviceStatus,
          usage: aiData.usage
        }
      };

      // Add AI message
      setMessages(prev => [...prev, aiMessage]);

      // Save AI message to database
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: aiMessage.content,
          role: aiMessage.role,
          agent_type: aiMessage.agentType,
          project_id: aiMessage.projectId,
          metadata: aiMessage.metadata || {}
        })
      });

      // Hide processing indicator
      setProcessingIndicator({ show: false, progress: 100, message: 'Complete!' });

    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Show error message
      const errorMessage: ChatMessage = {
        id: `error_${Date.now()}`,
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        role: 'assistant',
        agentType: selectedAgent,
        userId: 'ai_system',
        timestamp: new Date(),
        projectId: selectedProject || undefined,
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
          model: 'error-fallback'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
      setProcessingIndicator({ show: false, progress: 0, message: '' });
    }
  }, [inputValue, session, selectedAgent, selectedProject, messages]);

  // Handle typing indicators
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      setIsTyping(true);
      socketService.emit('typing_status', {
        userId: session?.user?.email || 'anonymous',
        isTyping: true,
        agentType: selectedAgent
      });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emit('typing_status', {
        userId: session?.user?.email || 'anonymous',
        isTyping: false,
        agentType: selectedAgent
      });
    }, 1000);
  }, [isTyping, session, selectedAgent]);

  // Handle Enter key
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // Quick action buttons
  const quickActions = [
    { label: 'Project Status', query: 'What is the current status of my construction project?', agent: 'suna' },
    { label: 'Upload Documents', query: 'I need to upload and process construction documents', agent: 'document-processor' },
    { label: 'Run BIM Analysis', query: 'Analyze my 3D building model for clashes and issues', agent: 'bim-analyzer' },
    { label: 'Cost Estimate', query: 'Generate a cost estimate for my project', agent: 'cost-estimator' },
    { label: 'Safety Review', query: 'Perform a safety compliance check on my project', agent: 'safety-monitor' },
    { label: 'Team Update', query: 'Show me team progress and task assignments', agent: 'team-coordinator' }
  ];

  const handleQuickAction = (action: typeof quickActions[0]) => {
    setSelectedAgent(action.agent);
    setInputValue(action.query);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Agent Panel */}
      {showAgentPanel && (
        <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
          <div className="px-3 py-3 border-b bg-gradient-to-b from-gray-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-800">AI Agents</h2>
              <Badge 
                variant={connectionStatus === 'connected' ? 'default' : 'secondary'}
                className="text-[10px] px-2 py-0.5 h-5"
              >
                <Circle className={`w-1.5 h-1.5 mr-1 ${connectionStatus === 'connected' ? 'fill-green-500' : 'fill-gray-500'}`} />
                {connectionStatus}
              </Badge>
            </div>

            <div className="flex gap-1.5">
              <Button
                variant={!showAIStatus ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAIStatus(false)}
                className="flex-1 h-8 text-xs"
              >
                <Bot className="w-3.5 h-3.5 mr-1.5" />
                Agents
              </Button>
              <Button
                variant={showAIStatus ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAIStatus(true)}
                className="flex-1 h-8 text-xs"
              >
                <Settings className="w-3.5 h-3.5 mr-1.5" />
                Status
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!showAIStatus ? (
              <div className="p-3 space-y-1.5">
                {Object.entries(AGENT_TYPES).map(([key, agent]) => {
                  const status = agentStatuses[key];
                  const IconComponent = agent.icon;

                  return (
                    <div
                      key={key}
                      className={`group relative cursor-pointer transition-all duration-200 rounded-lg border ${
                        selectedAgent === key 
                          ? 'bg-blue-50 border-blue-300 shadow-sm' 
                          : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedAgent(key)}
                    >
                      <div className="flex items-center gap-2.5 p-2.5">
                        <div className={`flex-shrink-0 p-1.5 rounded-md ${agent.color} bg-opacity-10`}>
                          <IconComponent className={`w-4 h-4 ${agent.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                            <Badge
                              variant={
                                status?.status === 'online' ? 'default' :
                                status?.status === 'busy' ? 'secondary' :
                                status?.status === 'processing' ? 'outline' : 'secondary'
                              }
                              className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0"
                            >
                              {status?.status || 'ready'}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                            {agent.description}
                          </p>
                        </div>
                      </div>
                      {status?.message && (
                        <div className="px-2.5 pb-2 pt-0">
                          <p className="text-[10px] text-blue-600 italic truncate">
                            {status.message}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4">
                <AIServiceStatus />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {!showAIStatus && (
            <div className="px-3 py-2.5 border-t bg-gradient-to-t from-gray-50 to-white">
              <h3 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {quickActions.slice(0, 3).map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="justify-start text-[11px] h-7 px-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={() => handleQuickAction(action)}
                  >
                    <Zap className="w-3 h-3 mr-1.5 opacity-60" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAgentPanel(!showAgentPanel)}
              >
                {showAgentPanel ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>

              <div className="flex items-center gap-3">
                {selectedAgent && AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES] && (
                  <>
                    <div className={`p-2 rounded-lg ${AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].color} bg-opacity-10`}>
                      {React.createElement(AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].icon, {
                        className: `w-5 h-5 ${AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].color.replace('bg-', 'text-')}`
                      })}
                    </div>
                    <div>
                      <h1 className="text-lg font-semibold">
                        {AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].name}
                      </h1>
                      <p className="text-sm text-gray-600">
                        {AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES].description}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <Separator orientation="vertical" className="h-12 mx-4" />

              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-gray-500" />
                <Select value={selectedProject || "general"} onValueChange={(value) => setSelectedProject(value === "general" ? null : value)}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select project context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>General Chat (No Project)</span>
                      </div>
                    </SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-col gap-2">
                          <FolderKanban className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{project.name}</div>
                            <div className="text-xs text-gray-500">{project.phase}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {messages.filter(m => m.role === 'user').length} messages
              </Badge>
              {selectedProject && (
                <Badge variant="secondary" className="text-xs">
                  <FolderKanban className="w-3 h-3 mr-1" />
                  Project Context
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {processingIndicator.show && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-900">{processingIndicator.message}</span>
                  <span className="text-xs text-blue-700">{processingIndicator.progress}%</span>
                </div>
                <Progress value={processingIndicator.progress} className="h-1" />
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className={AGENT_TYPES[message.agentType as keyof typeof AGENT_TYPES]?.color || 'bg-gray-500'}>
                    {React.createElement(AGENT_TYPES[message.agentType as keyof typeof AGENT_TYPES]?.icon || Bot, {
                      className: "w-4 h-4 text-white"
                    })}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-last' : ''}`}>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-white border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>

                  {message.metadata && (
                    <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          {message.metadata.confidence && (
                            <span>Confidence: {message.metadata.confidence}%</span>
                          )}
                          {message.metadata.processingTime && (
                            <span>Processed in {message.metadata.processingTime}ms</span>
                          )}
                          {message.metadata.usage && (
                            <span>Tokens: {message.metadata.usage.totalTokens}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {message.metadata.model && (
                            <Badge
                              variant={
                                message.metadata.model.includes('fallback') || message.metadata.model.includes('error')
                                  ? 'destructive'
                                  : 'default'
                              }
                              className="text-xs"
                            >
                              {message.metadata.model.includes('gpt') ? '🤖 GPT-4' :
                               message.metadata.model.includes('gemini') ? '🧠 Gemini' :
                               message.metadata.model.includes('fallback') ? '⚠️ Offline' :
                               message.metadata.model.includes('error') ? '❌ Error' :
                               message.metadata.model}
                            </Badge>
                          )}
                          {message.metadata.serviceStatus && (
                            <div className="flex items-center gap-1">
                              {message.metadata.serviceStatus.openai && (
                                <div className="w-2 h-2 bg-green-500 rounded-full" title="OpenAI Connected" />
                              )}
                              {message.metadata.serviceStatus.google && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" title="Google AI Connected" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{message.role === 'user' ? 'You' : AGENT_TYPES[message.agentType as keyof typeof AGENT_TYPES]?.name || 'AI'}</span>
                  <span>•</span>
                  <span>{message.timestamp.toLocaleTimeString()}</span>
                </div>
              </div>

              {message.role === 'user' && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-blue-500">
                    <User className="w-4 h-4 text-white" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}

          {/* Typing Indicators */}
          {typingUsers.length > 0 && (
            <div className="flex gap-3 justify-start">
              <Avatar className="w-8 h-8 mt-1">
                <AvatarFallback className="bg-gray-500">
                  <Bot className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-600">
                    {AGENT_TYPES[typingUsers[0].agentType as keyof typeof AGENT_TYPES]?.name || 'AI'} is typing...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <Button variant="ghost" size="sm">
              <Paperclip className="w-4 h-4" />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${AGENT_TYPES[selectedAgent as keyof typeof AGENT_TYPES]?.name || 'AI'}...`}
                className="pr-12"
                disabled={!isConnected}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={sendMessage}
                disabled={!inputValue.trim() || !isConnected}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm">
              <Mic className="w-4 h-4" />
            </Button>
          </div>

          {!isConnected && (
            <Alert className="mt-2">
              <AlertDescription className="text-xs">
                Connection lost. Trying to reconnect...
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
