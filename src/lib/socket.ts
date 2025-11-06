import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: string;
  userId: string;
  timestamp: Date;
  projectId?: string;
  metadata?: {
    model?: string;
    serviceStatus?: any;
    usage?: any;
    error?: string;
  };
}

interface AgentStatus {
  agentType: string;
  status: 'online' | 'busy' | 'offline';
  lastActivity: Date;
  message?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    // In production, this would connect to a real Socket.IO server
    // For now, we'll create a more sophisticated simulation
    try {
      // Simulate socket connection with enhanced features
      this.simulateConnection();
    } catch (error) {
      console.error('Socket connection failed:', error);
      this.handleConnectionError();
    }
  }

  private simulateConnection() {
    // Create a mock socket interface for development
    this.socket = {
      emit: this.simulateEmit.bind(this),
      on: this.simulateOn.bind(this),
      off: this.simulateOff.bind(this),
      disconnect: this.simulateDisconnect.bind(this),
      connected: true,
      id: `sim_${Math.random().toString(36).substr(2, 9)}`
    } as any;

    this.isConnected = true;
    console.log('✅ Socket simulation initialized with enhanced features');

    // Simulate connection success
    setTimeout(() => {
      this.emit('connection_status', { status: 'connected', timestamp: new Date() });
    }, 100);
  }

  private eventHandlers = new Map<string, ((...args: any[]) => void)[]>();

  private simulateEmit(event: string, data?: any) {
    console.log(`📤 Socket emit: ${event}`, data);

    // Enhanced simulation with intelligent responses
    this.handleSimulatedEmit(event, data);
  }

  private async handleSimulatedEmit(event: string, data: any) {
    switch (event) {
      case 'send_message':
        await this.simulateAIResponse(data);
        break;
      case 'join_room':
        console.log(`🏠 Joined room: ${data}`);
        break;
      case 'typing_status':
        this.simulateTypingResponse(data);
        break;
      case 'agent_status_update':
        this.broadcastAgentStatus(data);
        break;
    }
  }

  private async simulateAIResponse(message: ChatMessage) {
    if (message.role !== 'user') return;

    // Add user message to history
    this.addToMessageHistory(message);

    // Show typing indicator
    this.emit('user_typing', {
      userId: 'ai_agent',
      isTyping: true,
      agentType: message.agentType || 'ai-assistant'
    });

    // Update agent status to processing
    this.emit('agent_status_changed', {
      agentType: message.agentType || 'ai-assistant',
      status: 'processing',
      lastActivity: new Date(),
      message: 'Processing your request...'
    });

    try {
      // Generate AI response using real service
      const response = await this.generateIntelligentResponse(message);

      // Add AI response to history
      this.addToMessageHistory(response);

      // Simulate realistic delay based on message complexity
      const wordCount = message.content.split(' ').length;
      const baseDelay = 1000;
      const complexityDelay = Math.min(wordCount * 100, 3000);
      const delay = baseDelay + complexityDelay + Math.random() * 1000;

      setTimeout(() => {
        // Stop typing indicator
        this.emit('user_typing', {
          userId: 'ai_agent',
          isTyping: false,
          agentType: message.agentType || 'ai-assistant'
        });

        // Update agent status to online
        this.emit('agent_status_changed', {
          agentType: message.agentType || 'ai-assistant',
          status: 'online',
          lastActivity: new Date(),
          message: 'Ready to assist'
        });

        // Send AI response
        this.emit('new_message', response);

        // Log service status for debugging
        if (response.metadata?.serviceStatus) {
          console.log('🤖 AI Service Status:', response.metadata.serviceStatus);
        }
      }, delay);

    } catch (error) {
      console.error('Error generating AI response:', error);

      // Stop typing indicator on error
      this.emit('user_typing', {
        userId: 'ai_agent',
        isTyping: false,
        agentType: message.agentType || 'ai-assistant'
      });

      // Update agent status to offline
      this.emit('agent_status_changed', {
        agentType: message.agentType || 'ai-assistant',
        status: 'offline',
        lastActivity: new Date(),
        message: 'Service temporarily unavailable'
      });
    }
  }

  private async generateIntelligentResponse(message: ChatMessage): Promise<ChatMessage> {
    try {
      // Call the real AI service API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.content,
          agentType: message.agentType || 'ai-assistant',
          userId: message.userId,
          context: {
            projectId: message.projectId,
            timestamp: message.timestamp,
            conversationHistory: this.getRecentMessages(5) // Get last 5 messages for context
          }
        })
      });

      const aiResponse = await response.json();

      return {
        id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        content: aiResponse.content,
        role: 'assistant',
        agentType: message.agentType || 'ai-assistant',
        userId: 'ai_system',
        timestamp: new Date(),
        projectId: message.projectId,
        metadata: {
          model: aiResponse.model,
          serviceStatus: aiResponse.serviceStatus,
          usage: aiResponse.usage
        }
      };

    } catch (error) {
      console.error('Error calling AI service:', error);
      throw error; // Re-throw instead of returning fallback
    }
  }

  private recentMessages: ChatMessage[] = [];

  private getRecentMessages(count: number): ChatMessage[] {
    return this.recentMessages.slice(-count);
  }

  private addToMessageHistory(message: ChatMessage) {
    this.recentMessages.push(message);
    // Keep only last 20 messages to prevent memory issues
    if (this.recentMessages.length > 20) {
      this.recentMessages = this.recentMessages.slice(-20);
    }
  }

  private simulateTypingResponse(data: any) {
    // Broadcast typing status to other users
    this.emit('user_typing', {
      userId: data.userId,
      isTyping: data.isTyping,
      agentType: data.agentType
    });
  }

  private broadcastAgentStatus(data: any) {
    const status: AgentStatus = {
      agentType: data.agentType,
      status: data.status,
      lastActivity: new Date(),
      message: data.message
    };

    this.emit('agent_status_changed', status);
  }

  private simulateOn(event: string, handler: (...args: any[]) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  private simulateOff(event: string, handler?: (...args: any[]) => void) {
    if (handler) {
      const handlers = this.eventHandlers.get(event) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  private simulateDisconnect() {
    this.isConnected = false;
    this.socket = null;
    console.log('🔌 Socket disconnected');
  }

  // Public methods
  public emit(event: string, data?: any) {
    // Simulate broadcasting to all listeners
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  public on(event: string, handler: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.on(event, handler);
    } else {
      this.simulateOn(event, handler);
    }
  }

  public off(event: string, handler?: (...args: any[]) => void) {
    if (this.socket) {
      this.socket.off(event, handler);
    } else {
      this.simulateOff(event, handler);
    }
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.simulateDisconnect();
  }

  public isSocketConnected(): boolean {
    return this.isConnected;
  }

  public getSocketId(): string | null {
    return this.socket?.id || null;
  }

  private handleConnectionError() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

      setTimeout(() => {
        this.initializeSocket();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.error('❌ Max reconnection attempts reached.');
    }
  }

  // Workflow notification methods
  public notifyWorkflowStart(workflowType: string, entityId: string, agentType: string) {
    this.emit('workflow_started', {
      workflowType,
      entityId,
      agentType,
      timestamp: new Date()
    });

    this.emit('agent_status_changed', {
      agentType,
      status: 'processing',
      lastActivity: new Date(),
      message: `Running ${workflowType} workflow...`
    });
  }

  public notifyWorkflowComplete(workflowType: string, entityId: string, agentType: string, result: any) {
    this.emit('workflow_completed', {
      workflowType,
      entityId,
      agentType,
      result,
      timestamp: new Date()
    });

    this.emit('agent_status_changed', {
      agentType,
      status: 'online',
      lastActivity: new Date(),
      message: 'Ready to assist'
    });
  }

  public notifyWorkflowError(workflowType: string, entityId: string, agentType: string, error: string) {
    this.emit('workflow_error', {
      workflowType,
      entityId,
      agentType,
      error,
      timestamp: new Date()
    });

    this.emit('agent_status_changed', {
      agentType,
      status: 'offline',
      lastActivity: new Date(),
      message: 'Workflow encountered an error'
    });
  }

  // Agent status simulation
  public simulateAgentActivity() {
    const agents = ['ai-assistant', 'document-processor', 'bim-analyzer', 'cost-estimator', 'safety-monitor'];

    setInterval(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const statuses = ['online', 'busy', 'processing'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      this.emit('agent_status_changed', {
        agentType: randomAgent,
        status: randomStatus,
        lastActivity: new Date(),
        message: this.getAgentStatusMessage(randomAgent, randomStatus)
      });
    }, 15000 + Math.random() * 30000); // Random interval between 15-45 seconds
  }

  private getAgentStatusMessage(agent: string, status: string): string {
    const messages = {
      'ai-assistant': {
        'online': 'Ready to assist with construction management',
        'busy': 'Analyzing project data and generating insights',
        'processing': 'Processing construction documents'
      },
      'document-processor': {
        'online': 'Ready to process construction documents',
        'busy': 'Extracting data from uploaded files',
        'processing': 'Running OCR on construction plans'
      },
      'bim-analyzer': {
        'online': 'Ready for 3D model analysis',
        'busy': 'Running clash detection algorithms',
        'processing': 'Analyzing building information model'
      },
      'cost-estimator': {
        'online': 'Ready to analyze project costs',
        'busy': 'Calculating material and labor estimates',
        'processing': 'Updating budget projections'
      },
      'safety-monitor': {
        'online': 'Monitoring safety compliance',
        'busy': 'Analyzing safety protocols',
        'processing': 'Generating safety report'
      }
    };

    return messages[agent as keyof typeof messages]?.[status as keyof typeof messages['ai-assistant']] || 'Active';
  }
}

// Create singleton instance
const socketService = new SocketService();

// Start agent activity simulation
socketService.simulateAgentActivity();

export default socketService;
