"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

// Context data structure based on blueprint
export interface CopilotContext {
  // Page Information
  currentPage: 'projects' | 'documents' | 'bim' | 'team' | 'workflows' | 'enterprise' | 'chat' | 'agents' | 'home';
  currentRoute: string;
  
  // Resource Context
  activeProject?: {
    id: string;
    name: string;
    phase?: string;
    location?: string;
  };
  
  activeDocument?: {
    id: string;
    name: string;
    type: string;
    projectId?: string;
  };
  
  activeBIMModel?: {
    id: string;
    name: string;
    projectId?: string;
  };
  
  // User Context
  userId?: string;
  userRole?: string;
  teamId?: string;
  
  // Selection State
  selectedTasks?: string[];
  selectedDocuments?: string[];
}

interface CopilotContextValue {
  context: CopilotContext;
  updateContext: (partial: Partial<CopilotContext>) => void;
  clearContext: () => void;
  isOpen: boolean;
  togglePanel: () => void;
  openPanel: () => void;
  closePanel: () => void;
}

const CopilotContextContext = createContext<CopilotContextValue | undefined>(undefined);

export function useCopilotContext() {
  const context = useContext(CopilotContextContext);
  if (!context) {
    throw new Error('useCopilotContext must be used within CopilotContextProvider');
  }
  return context;
}

interface CopilotContextProviderProps {
  children: ReactNode;
}

export default function CopilotContextProvider({ children }: CopilotContextProviderProps) {
  const pathname = usePathname();
  
  // Initialize with saved panel state from localStorage
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize context state
  const [context, setContext] = useState<CopilotContext>({
    currentPage: 'home',
    currentRoute: '/',
  });

  // Load panel state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('copilot_panel_state');
    if (savedState) {
      try {
        const { isOpen: savedIsOpen } = JSON.parse(savedState);
        setIsOpen(savedIsOpen);
      } catch (e) {
        console.error('Failed to parse copilot panel state:', e);
      }
    }
  }, []);

  // Save panel state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('copilot_panel_state', JSON.stringify({ isOpen }));
  }, [isOpen]);

  // Auto-detect page from pathname
  useEffect(() => {
    let currentPage: CopilotContext['currentPage'] = 'home';
    
    if (pathname.startsWith('/projects')) {
      currentPage = 'projects';
    } else if (pathname.startsWith('/documents')) {
      currentPage = 'documents';
    } else if (pathname.startsWith('/bim')) {
      currentPage = 'bim';
    } else if (pathname.startsWith('/team')) {
      currentPage = 'team';
    } else if (pathname.startsWith('/workflows')) {
      currentPage = 'workflows';
    } else if (pathname.startsWith('/enterprise')) {
      currentPage = 'enterprise';
  // Removed /chat route handling as chat page is deprecated
      currentPage = 'chat';
    } else if (pathname.startsWith('/agents')) {
      currentPage = 'agents';
    }

    setContext(prev => ({
      ...prev,
      currentPage,
      currentRoute: pathname,
    }));
  }, [pathname]);

  const updateContext = useCallback((partial: Partial<CopilotContext>) => {
    setContext(prev => ({
      ...prev,
      ...partial,
    }));
  }, []);

  const clearContext = useCallback(() => {
    setContext({
      currentPage: context.currentPage,
      currentRoute: context.currentRoute,
    });
  }, [context.currentPage, context.currentRoute]);

  const togglePanel = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openPanel = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value: CopilotContextValue = {
    context,
    updateContext,
    clearContext,
    isOpen,
    togglePanel,
    openPanel,
    closePanel,
  };

  return (
    <CopilotContextContext.Provider value={value}>
      {children}
    </CopilotContextContext.Provider>
  );
}
