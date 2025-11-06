"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCopilotContext } from '@/components/providers/CopilotContextProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  routeToAgent, 
  getSuggestedActions, 
  getAgentInfo, 
  type AgentType 
} from '@/lib/ai-agent-router';
import { parseMarkdown, type MarkdownElement } from '@/lib/markdown-renderer';
import {
  getCurrentConversation,
  createConversation,
  addMessageToConversation,
  setCurrentConversation,
  type PersistedMessage,
  type ToolExecution
} from '@/lib/conversation-persistence';
import SettingsPanel, { loadSettings, saveSettings, type CopilotSettings } from './SettingsPanel';
import {
  Send,
  Bot,
  User,
  X,
  Settings,
  FileText,
  Building,
  Calculator,
  Shield,
  Users,
  Sparkles,
  Lightbulb,
  Wrench,
  ChevronLeft,
  ChevronRight,
  Edit2,
  History,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: string;
  timestamp: Date;
  toolExecutions?: ToolExecution[];
  routingInfo?: {
    selectedAgent: AgentType;
    confidence: number;
    reasoning: string;
  };
}

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'ai-assistant': Bot,
  'document-processor': FileText,
  'bim-analyzer': Building,
  'cost-estimator': Calculator,
  'safety-monitor': Shield,
  'team-coordinator': Users,
  'compliance-checker': Shield,
  'pm-bot': Sparkles,
};

export default function AICopilotSidepanel() {
  const { data: session } = useSession();
  const { context, isOpen, closePanel } = useCopilotContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<CopilotSettings>(loadSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(settings.panelWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentType | null>(null);
  const [showContextEdit, setShowContextEdit] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Load conversation on mount
  useEffect(() => {
    if (settings.autoSaveConversations) {
      const savedConv = getCurrentConversation();
      if (savedConv) {
        setCurrentConversationId(savedConv.id);
        const loadedMessages: ChatMessage[] = savedConv.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(loadedMessages);
      } else {
        // Create new conversation
        const newConv = createConversation('New Chat', context);
        setCurrentConversationId(newConv.id);
      }
    }
  }, []);

  // Initialize with welcome message if no messages
  useEffect(() => {
    if (messages.length === 0 && !settings.autoSaveConversations) {
      setMessages([{
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
        agentType: 'ai-assistant',
        timestamp: new Date(),
      }]);
    }
  }, [messages.length, settings.autoSaveConversations]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Update panel width from settings
  useEffect(() => {
    setPanelWidth(settings.panelWidth);
  }, [settings.panelWidth]);

  // Handle panel resizing
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth >= 300 && newWidth <= 800) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      // Save the new width using settings utility
      const newSettings = { ...settings, panelWidth };
      setSettings(newSettings);
      saveSettings(newSettings);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, panelWidth, settings]);

  // Proactive suggestions based on context changes
  useEffect(() => {
    if (settings.enableProactiveSuggestions && isOpen) {
      // Show suggestions when context changes significantly
      setShowSuggestions(true);
    }
  }, [context.currentPage, context.activeProject, context.activeDocument, settings.enableProactiveSuggestions, isOpen]);

  const sendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    // Route message to appropriate agent
    const routing = routeToAgent(textToSend, context);
    const agentToUse = selectedAgent || routing.agentType;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: textToSend,
      role: 'user',
      timestamp: new Date(),
      routingInfo: {
        selectedAgent: agentToUse,
        confidence: routing.confidence,
        reasoning: routing.reasoning
      }
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Save to conversation
    if (settings.autoSaveConversations && currentConversationId) {
      addMessageToConversation(currentConversationId, {
        ...userMessage,
        timestamp: userMessage.timestamp.toISOString()
      });
    }

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          agentType: agentToUse,
          context: {
            ...context,
            userId: session?.user?.email,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '_assistant',
        content: data.response || data.content || 'I received your message.',
        role: 'assistant',
        agentType: agentToUse,
        timestamp: new Date(),
        toolExecutions: data.toolExecutions || []
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to conversation
      if (settings.autoSaveConversations && currentConversationId) {
        addMessageToConversation(currentConversationId, {
          ...assistantMessage,
          timestamp: assistantMessage.timestamp.toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        agentType: 'ai-assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setSelectedAgent(null); // Reset manual agent selection
    }
  }, [inputValue, isLoading, context, session, selectedAgent, settings, currentConversationId]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestedAction = (prompt: string, agentType: AgentType) => {
    setSelectedAgent(agentType);
    setInputValue(prompt);
    sendMessage(prompt);
  };

  const handleSettingsChange = (newSettings: CopilotSettings) => {
    setSettings(newSettings);
    setPanelWidth(newSettings.panelWidth);
  };

  // Render message content with markdown if enabled
  const renderMessageContent = (content: string) => {
    if (!settings.enableMarkdown) {
      return <p className="text-sm whitespace-pre-wrap">{content}</p>;
    }

    const elements = parseMarkdown(content);
    return <div className="text-sm space-y-2">{elements.map((el, idx) => renderMarkdownElement(el, idx))}</div>;
  };

  const renderMarkdownElement = (element: MarkdownElement, key: number): React.ReactNode => {
    switch (element.type) {
      case 'heading':
        const HeadingTag = `h${element.level}` as keyof JSX.IntrinsicElements;
        return <HeadingTag key={key} className="font-bold mb-2 mt-4">{element.content}</HeadingTag>;
      
      case 'paragraph':
        return <p key={key} className="mb-2">{renderInlineElements(element.children || [])}</p>;
      
      case 'code':
        return (
          <pre key={key} className="bg-muted p-3 rounded-lg overflow-x-auto mb-2 text-xs">
            <code className={`language-${element.language}`}>{element.content}</code>
          </pre>
        );
      
      case 'list':
        return (
          <ul key={key} className="list-disc list-inside mb-2 space-y-1">
            {element.children?.map((child, idx) => renderMarkdownElement(child, idx))}
          </ul>
        );
      
      case 'listItem':
        return <li key={key}>{renderInlineElements(element.children || [])}</li>;
      
      case 'blockquote':
        return <blockquote key={key} className="border-l-4 border-primary pl-4 italic mb-2">{element.content}</blockquote>;
      
      default:
        return <p key={key} className="mb-2">{element.content}</p>;
    }
  };

  const renderInlineElements = (elements: MarkdownElement[]): React.ReactNode => {
    return elements.map((el, idx) => {
      switch (el.type) {
        case 'bold':
          return <strong key={idx}>{el.content}</strong>;
        case 'italic':
          return <em key={idx}>{el.content}</em>;
        case 'code':
          return <code key={idx} className="bg-muted px-1 py-0.5 rounded text-xs">{el.content}</code>;
        case 'link':
          return <a key={idx} href={el.href} className="text-primary underline" target="_blank" rel="noopener noreferrer">{el.content}</a>;
        case 'text':
        default:
          return <span key={idx}>{el.content}</span>;
      }
    });
  };

  if (!isOpen) return null;

  const suggestedActions = getSuggestedActions(context);

  return (
    <>
      {/* Resize Handle */}
      <div
        ref={resizeHandleRef}
        className="fixed top-0 h-screen w-1 cursor-ew-resize hover:bg-primary/20 z-50 transition-colors"
        style={{ right: panelWidth }}
        onMouseDown={handleResizeStart}
      />

      <div
        ref={panelRef}
        className="fixed right-0 top-0 h-screen bg-background border-l border-border shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-in-out"
        style={{ 
          width: `${panelWidth}px`,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          cursor: isResizing ? 'ew-resize' : 'default'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-lg">AI Copilot</h2>
            {selectedAgent && (
              <Badge variant="outline" className="text-xs">
                {getAgentInfo(selectedAgent).name}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setShowContextEdit(!showContextEdit)}
              title="Edit Context"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={closePanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Context Bar */}
        {context.currentPage && (
          <div className="px-4 py-2 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <Badge variant="outline" className="text-xs">
                {context.currentPage}
              </Badge>
              {context.activeProject && (
                <span className="text-muted-foreground truncate">
                  📁 {context.activeProject.name}
                </span>
              )}
              {context.activeDocument && (
                <span className="text-muted-foreground truncate">
                  📄 {context.activeDocument.name}
                </span>
              )}
              {context.activeBIMModel && (
                <span className="text-muted-foreground truncate">
                  🏗️ {context.activeBIMModel.name}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Suggested Actions */}
        {showSuggestions && suggestedActions.length > 0 && settings.enableProactiveSuggestions && (
          <div className="px-4 py-3 bg-primary/5 border-b border-border">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Suggested Actions</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-auto h-6 text-xs"
                onClick={() => setShowSuggestions(false)}
              >
                Dismiss
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedActions.map((action, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestedAction(action.prompt, action.agentType)}
                  title={action.description}
                >
                  <Zap className="h-3 w-3 mr-1" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => {
              const AgentIcon = message.agentType ? AGENT_ICONS[message.agentType] || Bot : Bot;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10">
                        <AgentIcon className="h-4 w-4 text-primary" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    {/* Agent routing info */}
                    {message.role === 'user' && message.routingInfo && message.routingInfo.confidence > 0.5 && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        Routed to: {getAgentInfo(message.routingInfo.selectedAgent).name}
                        {message.routingInfo.confidence < 0.8 && (
                          <span className="opacity-70">({Math.round(message.routingInfo.confidence * 100)}%)</span>
                        )}
                      </div>
                    )}
                    
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {renderMessageContent(message.content)}
                      
                      {/* Tool executions */}
                      {settings.enableToolVisualization && message.toolExecutions && message.toolExecutions.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                          {message.toolExecutions.map((tool, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs opacity-80">
                              <Wrench className="h-3 w-3" />
                              <span>{tool.toolName}</span>
                              {tool.status === 'running' && <span className="animate-pulse">Running...</span>}
                              {tool.status === 'success' && <span className="text-green-500">✓</span>}
                              {tool.status === 'error' && <span className="text-red-500">✗</span>}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs opacity-60 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10">
                    <Bot className="h-4 w-4 text-primary animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="rounded-lg px-4 py-2 bg-muted">
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-border">
          {selectedAgent && (
            <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Sending to: {getAgentInfo(selectedAgent).name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => setSelectedAgent(null)}
              >
                Clear
              </Button>
            </div>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!inputValue.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
    </>
  );
}
