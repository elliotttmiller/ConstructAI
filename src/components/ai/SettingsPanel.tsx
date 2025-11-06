"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export interface CopilotSettings {
  panelWidth: number;
  enableMarkdown: boolean;
  enableProactiveSuggestions: boolean;
  enableToolVisualization: boolean;
  autoSaveConversations: boolean;
  maxMessagesInMemory: number;
  theme: 'auto' | 'light' | 'dark';
}

const DEFAULT_SETTINGS: CopilotSettings = {
  panelWidth: 400,
  enableMarkdown: true,
  enableProactiveSuggestions: true,
  enableToolVisualization: true,
  autoSaveConversations: true,
  maxMessagesInMemory: 100,
  theme: 'auto'
};

const SETTINGS_KEY = 'constructai_copilot_settings';

/**
 * Load settings from localStorage
 */
export function loadSettings(): CopilotSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: CopilotSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CopilotSettings;
  onSettingsChange: (settings: CopilotSettings) => void;
}

export default function SettingsPanel({
  isOpen,
  onClose,
  settings,
  onSettingsChange
}: SettingsPanelProps) {
  const [localSettings, setLocalSettings] = useState<CopilotSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSettingsChange(localSettings);
    saveSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(DEFAULT_SETTINGS);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>AI Copilot Settings</DialogTitle>
          <DialogDescription>
            Customize your AI Copilot experience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Panel Width */}
          <div className="space-y-2">
            <Label>Panel Width: {localSettings.panelWidth}px</Label>
            <Slider
              value={[localSettings.panelWidth]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, panelWidth: value })
              }
              min={300}
              max={800}
              step={50}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Adjust the default width of the copilot panel
            </p>
          </div>

          <Separator />

          {/* Features */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Features</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rich Content (Markdown)</Label>
                <p className="text-xs text-muted-foreground">
                  Display formatted text, code, and links
                </p>
              </div>
              <Switch
                checked={localSettings.enableMarkdown}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, enableMarkdown: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Proactive Suggestions</Label>
                <p className="text-xs text-muted-foreground">
                  Show contextual suggestions automatically
                </p>
              </div>
              <Switch
                checked={localSettings.enableProactiveSuggestions}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, enableProactiveSuggestions: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tool Visualization</Label>
                <p className="text-xs text-muted-foreground">
                  Show when AI executes tools and actions
                </p>
              </div>
              <Switch
                checked={localSettings.enableToolVisualization}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, enableToolVisualization: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Save Conversations</Label>
                <p className="text-xs text-muted-foreground">
                  Persist chat history across sessions
                </p>
              </div>
              <Switch
                checked={localSettings.autoSaveConversations}
                onCheckedChange={(checked) =>
                  setLocalSettings({ ...localSettings, autoSaveConversations: checked })
                }
              />
            </div>
          </div>

          <Separator />

          {/* Performance */}
          <div className="space-y-2">
            <Label>Max Messages in Memory: {localSettings.maxMessagesInMemory}</Label>
            <Slider
              value={[localSettings.maxMessagesInMemory]}
              onValueChange={([value]) =>
                setLocalSettings({ ...localSettings, maxMessagesInMemory: value })
              }
              min={20}
              max={200}
              step={20}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Limit conversation history to improve performance
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
