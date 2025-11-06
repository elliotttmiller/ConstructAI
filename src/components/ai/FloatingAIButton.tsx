"use client";

import { Bot, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopilotContext } from '@/components/providers/CopilotContextProvider';
import { useEffect } from 'react';

export default function FloatingAIButton() {
  const { isOpen, togglePanel } = useCopilotContext();

  // Keyboard shortcut: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        togglePanel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePanel]);

  return (
    <Button
      onClick={togglePanel}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90 transition-all hover:scale-110"
      size="icon"
      aria-label={isOpen ? "Close AI Copilot" : "Open AI Copilot"}
      title={isOpen ? "Close AI Copilot (Cmd/Ctrl+K)" : "Open AI Copilot (Cmd/Ctrl+K)"}
    >
      {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
    </Button>
  );
}
