"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCopilotContext } from '@/components/providers/CopilotContextProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Sparkles
} from 'lucide-react';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: string;
  timestamp: Date;
}

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'suna': Bot,
  'document-processor': FileText,
  'bim-analyzer': Building,
  'cost-estimator': Calculator,
  'safety-monitor': Shield,
  'team-coordinator': Users,
};

export default function AICopilotSidepanel() {
  const { data: session } = useSession();
  const { context, isOpen, closePanel } = useCopilotContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
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
        agentType: 'suna',
        timestamp: new Date(),
      }]);
    }
  }, [messages.length]);

  const sendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          agentType: 'suna',
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
        agentType: 'suna',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '_error',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        agentType: 'suna',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, context, session]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed right-0 top-0 h-screen w-[400px] bg-background border-l border-border shadow-2xl z-40 flex flex-col transition-transform duration-300 ease-in-out"
      style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">AI Copilot</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
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
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs">
              {context.currentPage}
            </Badge>
            {context.activeProject && (
              <span className="text-muted-foreground truncate">
                {context.activeProject.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => {
            const AgentIcon = message.agentType ? AGENT_ICONS[message.agentType] : Bot;
            
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
                
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
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
            onClick={sendMessage}
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
  );
}
