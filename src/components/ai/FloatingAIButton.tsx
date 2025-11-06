"use client";

import { Sparkles, X } from 'lucide-react';
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
    <button
      onClick={togglePanel}
      className={`
        fixed bottom-6 z-50
        h-12 w-12 rounded-full
        flex items-center justify-center
        transition-all duration-300 ease-in-out
        bg-gradient-to-br from-violet-600 to-indigo-600
        hover:from-violet-500 hover:to-indigo-500
        shadow-lg hover:shadow-2xl
        hover:scale-110 active:scale-95
        group
        ${isOpen ? 'right-[420px]' : 'right-6'}
      `}
      aria-label={isOpen ? "Close AI Copilot" : "Open AI Copilot"}
      title={isOpen ? "Close AI Copilot (Cmd/Ctrl+K)" : "Open AI Copilot (Cmd/Ctrl+K)"}
    >
      {/* Animated glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
      
      {/* Icon container with subtle rotation on hover */}
      <div className="relative z-10 transition-transform duration-300 group-hover:rotate-12">
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
        )}
      </div>
      
      {/* Ripple effect on click */}
      <span className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-30 transition-opacity duration-150" />
    </button>
  );
}
