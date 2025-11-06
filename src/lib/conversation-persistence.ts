/**
 * Conversation Persistence Service
 * Handles saving and loading chat conversations across sessions
 */

export interface PersistedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  agentType?: string;
  timestamp: string;
  toolExecutions?: ToolExecution[];
}

export interface ToolExecution {
  toolName: string;
  status: 'running' | 'success' | 'error';
  result?: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: PersistedMessage[];
  context?: any;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'constructai_conversations';
const CURRENT_CONVERSATION_KEY = 'constructai_current_conversation';
const MAX_CONVERSATIONS = 50;
const MAX_MESSAGES_PER_CONVERSATION = 100;

/**
 * Get all saved conversations
 */
export function getConversations(): Conversation[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const conversations = JSON.parse(stored) as Conversation[];
    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return [];
  }
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(id: string): Conversation | null {
  const conversations = getConversations();
  return conversations.find(c => c.id === id) || null;
}

/**
 * Get the current active conversation
 */
export function getCurrentConversation(): Conversation | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const currentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (!currentId) return null;
    
    return getConversation(currentId);
  } catch (error) {
    console.error('Failed to load current conversation:', error);
    return null;
  }
}

/**
 * Save or update a conversation
 */
export function saveConversation(conversation: Conversation): void {
  if (typeof window === 'undefined') return;
  
  try {
    const conversations = getConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    
    // Update timestamp
    conversation.updatedAt = new Date().toISOString();
    
    // Limit messages per conversation
    if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
    }
    
    if (existingIndex >= 0) {
      // Update existing
      conversations[existingIndex] = conversation;
    } else {
      // Add new
      conversations.unshift(conversation);
      
      // Limit total conversations
      if (conversations.length > MAX_CONVERSATIONS) {
        conversations.splice(MAX_CONVERSATIONS);
      }
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

/**
 * Create a new conversation
 */
export function createConversation(title?: string, context?: any): Conversation {
  const conversation: Conversation = {
    id: generateId(),
    title: title || 'New Conversation',
    messages: [],
    context,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveConversation(conversation);
  setCurrentConversation(conversation.id);
  
  return conversation;
}

/**
 * Add a message to a conversation
 */
export function addMessageToConversation(
  conversationId: string,
  message: PersistedMessage
): void {
  const conversation = getConversation(conversationId);
  if (!conversation) return;
  
  conversation.messages.push(message);
  
  // Auto-generate title from first user message
  if (conversation.messages.length === 1 && message.role === 'user') {
    conversation.title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
  }
  
  saveConversation(conversation);
}

/**
 * Update a message in a conversation (for tool execution updates)
 */
export function updateMessageInConversation(
  conversationId: string,
  messageId: string,
  updates: Partial<PersistedMessage>
): void {
  const conversation = getConversation(conversationId);
  if (!conversation) return;
  
  const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
  if (messageIndex >= 0) {
    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates
    };
    saveConversation(conversation);
  }
}

/**
 * Delete a conversation
 */
export function deleteConversation(id: string): void {
  if (typeof window === 'undefined') return;
  
  try {
    const conversations = getConversations().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    
    // Clear current if it was deleted
    const currentId = localStorage.getItem(CURRENT_CONVERSATION_KEY);
    if (currentId === id) {
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error);
  }
}

/**
 * Set the current active conversation
 */
export function setCurrentConversation(id: string | null): void {
  if (typeof window === 'undefined') return;
  
  if (id) {
    localStorage.setItem(CURRENT_CONVERSATION_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  }
}

/**
 * Clear all conversations
 */
export function clearAllConversations(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Failed to clear conversations:', error);
  }
}

/**
 * Export conversations as JSON
 */
export function exportConversations(): string {
  const conversations = getConversations();
  return JSON.stringify(conversations, null, 2);
}

/**
 * Import conversations from JSON
 */
export function importConversations(jsonData: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const imported = JSON.parse(jsonData) as Conversation[];
    
    // Validate structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid format: expected array');
    }
    
    // Merge with existing
    const existing = getConversations();
    const merged = [...imported, ...existing];
    
    // Remove duplicates by ID
    const unique = merged.filter((conv, index, self) => 
      index === self.findIndex(c => c.id === conv.id)
    );
    
    // Limit and save
    const limited = unique.slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    
    return true;
  } catch (error) {
    console.error('Failed to import conversations:', error);
    return false;
  }
}

// Helper function to generate unique IDs
function generateId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
