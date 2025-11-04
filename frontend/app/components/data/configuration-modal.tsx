"use client";

import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { useToast } from "../ui/toast";
import type { ProjectConfig } from "@/app/lib/types";

interface ConfigurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConfig?: ProjectConfig;
  onSubmit: (config: ProjectConfig) => Promise<void>;
}

export function ConfigurationModal({
  open,
  onOpenChange,
  initialConfig,
  onSubmit,
}: ConfigurationModalProps) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<ProjectConfig>(
    initialConfig || {
      analysis_settings: {
        enable_ai_suggestions: true,
        risk_threshold: "medium",
        optimization_level: "standard",
      },
      notification_settings: {
        email_alerts: false,
        slack_integration: false,
      },
      export_settings: {
        default_format: "json",
        include_metadata: true,
      },
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig);
    }
  }, [initialConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      await onSubmit(config);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update configuration:", error);
      showToast("Failed to update configuration. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => !isSubmitting && onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Project Configuration</DialogTitle>
          <DialogDescription>
            Customize analysis settings and preferences for this project.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Analysis Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Analysis Settings
              </h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="ai-suggestions" className="cursor-pointer">
                  Enable AI Suggestions
                </Label>
                <input
                  type="checkbox"
                  id="ai-suggestions"
                  checked={config.analysis_settings.enable_ai_suggestions}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      analysis_settings: {
                        ...config.analysis_settings,
                        enable_ai_suggestions: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="risk-threshold">Risk Threshold</Label>
                <select
                  id="risk-threshold"
                  value={config.analysis_settings.risk_threshold}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      analysis_settings: {
                        ...config.analysis_settings,
                        risk_threshold: e.target.value as "low" | "medium" | "high",
                      },
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                >
                  <option value="low">Low - Flag only critical risks</option>
                  <option value="medium">Medium - Balanced approach</option>
                  <option value="high">High - Flag all potential issues</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="optimization-level">Optimization Level</Label>
                <select
                  id="optimization-level"
                  value={config.analysis_settings.optimization_level}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      analysis_settings: {
                        ...config.analysis_settings,
                        optimization_level: e.target.value as
                          | "basic"
                          | "standard"
                          | "aggressive",
                      },
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                >
                  <option value="basic">Basic - Conservative optimizations</option>
                  <option value="standard">Standard - Balanced improvements</option>
                  <option value="aggressive">
                    Aggressive - Maximum optimization
                  </option>
                </select>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Notifications
              </h3>

              <div className="flex items-center justify-between">
                <Label htmlFor="email-alerts" className="cursor-pointer">
                  Email Alerts
                </Label>
                <input
                  type="checkbox"
                  id="email-alerts"
                  checked={config.notification_settings.email_alerts}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      notification_settings: {
                        ...config.notification_settings,
                        email_alerts: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="slack-integration" className="cursor-pointer">
                  Slack Integration
                </Label>
                <input
                  type="checkbox"
                  id="slack-integration"
                  checked={config.notification_settings.slack_integration}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      notification_settings: {
                        ...config.notification_settings,
                        slack_integration: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Export Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                Export Settings
              </h3>

              <div className="space-y-2">
                <Label htmlFor="default-format">Default Export Format</Label>
                <select
                  id="default-format"
                  value={config.export_settings.default_format}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      export_settings: {
                        ...config.export_settings,
                        default_format: e.target.value as "json" | "pdf" | "excel",
                      },
                    })
                  }
                  className="w-full rounded-lg border border-neutral-200 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isSubmitting}
                >
                  <option value="json">JSON</option>
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="include-metadata" className="cursor-pointer">
                  Include Metadata in Exports
                </Label>
                <input
                  type="checkbox"
                  id="include-metadata"
                  checked={config.export_settings.include_metadata}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      export_settings: {
                        ...config.export_settings,
                        include_metadata: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-2 focus:ring-primary"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
