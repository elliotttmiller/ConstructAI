"use client";

import * as React from "react";
import { AlertCircle, RefreshCw, FileText, XCircle } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "@/app/lib/utils";
import type { APIError } from "@/app/lib/types";

interface AutonomousErrorHandlerProps {
  error: Error | APIError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  context?: "upload" | "analysis" | "general";
  className?: string;
}

export function AutonomousErrorHandler({
  error,
  onRetry,
  onDismiss,
  context = "general",
  className,
}: AutonomousErrorHandlerProps) {
  if (!error) return null;

  const isAPIError = (err: Error | APIError): err is APIError => {
    return "code" in err;
  };

  const getErrorDetails = () => {
    if (isAPIError(error)) {
      return {
        title: getErrorTitle(error.code),
        message: error.message,
        suggestions: getErrorSuggestions(error.code, context),
        severity: getErrorSeverity(error.code),
      };
    }

    return {
      title: "An Error Occurred",
      message: error.message || "An unexpected error occurred",
      suggestions: getGenericSuggestions(context),
      severity: "error" as const,
    };
  };

  const details = getErrorDetails();

  const severityStyles = {
    error: {
      border: "border-error/30",
      bg: "bg-error/5",
      icon: "text-error",
      button: "bg-error hover:bg-error/90",
    },
    warning: {
      border: "border-warning/30",
      bg: "bg-warning/5",
      icon: "text-warning",
      button: "bg-warning hover:bg-warning/90",
    },
    info: {
      border: "border-primary/30",
      bg: "bg-primary/5",
      icon: "text-primary",
      button: "bg-primary hover:bg-primary/90",
    },
  };

  const styles = severityStyles[details.severity];

  return (
    <Card className={cn("border-2", styles.border, styles.bg, className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn("shrink-0 mt-1", styles.icon)}>
            {details.severity === "error" ? (
              <AlertCircle className="h-6 w-6" />
            ) : (
              <FileText className="h-6 w-6" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">{details.title}</h3>
              <p className="mt-1 text-sm text-neutral-700">{details.message}</p>
            </div>

            {/* Suggestions */}
            {details.suggestions.length > 0 && (
              <div className="rounded-lg border border-neutral-200 bg-surface p-4">
                <h4 className="mb-2 text-sm font-semibold text-foreground">
                  What you can do:
                </h4>
                <ul className="space-y-2">
                  {details.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-neutral-700">
                      <span className="shrink-0 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  size="sm"
                  className={styles.button}
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              )}
              {onDismiss && (
                <Button
                  onClick={onDismiss}
                  variant="outline"
                  size="sm"
                >
                  <XCircle className="h-4 w-4" />
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions

function getErrorTitle(code?: string): string {
  if (!code) return "An Error Occurred";

  const titles: Record<string, string> = {
    NETWORK_ERROR: "Network Connection Failed",
    TIMEOUT: "Request Timed Out",
    PARSE_ERROR: "Failed to Process Response",
    FILE_TOO_LARGE: "File Size Exceeds Limit",
    INVALID_FILE_TYPE: "Unsupported File Type",
    UPLOAD_FAILED: "Upload Failed",
    ANALYSIS_FAILED: "AI Analysis Failed",
    INSUFFICIENT_PERMISSIONS: "Insufficient Permissions",
    RATE_LIMIT: "Rate Limit Exceeded",
    SERVER_ERROR: "Server Error",
    "400": "Invalid Request",
    "401": "Authentication Required",
    "403": "Access Denied",
    "404": "Resource Not Found",
    "429": "Too Many Requests",
    "500": "Internal Server Error",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
  };

  return titles[code] || `Error ${code}`;
}

function getErrorSeverity(code?: string): "error" | "warning" | "info" {
  if (!code) return "error";

  // Warnings for recoverable issues
  if (["TIMEOUT", "RATE_LIMIT", "429", "503"].includes(code)) {
    return "warning";
  }

  // Info for user-actionable issues
  if (["FILE_TOO_LARGE", "INVALID_FILE_TYPE", "400", "401"].includes(code)) {
    return "info";
  }

  return "error";
}

function getErrorSuggestions(code?: string, context?: string): string[] {
  const suggestions: string[] = [];

  if (!code) return getGenericSuggestions(context);

  switch (code) {
    case "NETWORK_ERROR":
      suggestions.push("Check your internet connection");
      suggestions.push("Verify that the API server is running");
      suggestions.push("Try disabling VPN or firewall temporarily");
      break;

    case "TIMEOUT":
      suggestions.push("The analysis is taking longer than expected");
      suggestions.push("Try uploading a smaller document");
      suggestions.push("Wait a moment and try again");
      break;

    case "PARSE_ERROR":
      suggestions.push("The AI response format was unexpected");
      suggestions.push("This may be a temporary issue - try again");
      suggestions.push("Contact support if this persists");
      break;

    case "FILE_TOO_LARGE":
      suggestions.push("Maximum file size is 50MB");
      suggestions.push("Try compressing the document");
      suggestions.push("Split large documents into smaller parts");
      break;

    case "INVALID_FILE_TYPE":
      suggestions.push("Supported formats: PDF, DOCX, XLSX, TXT, CSV");
      suggestions.push("Convert your document to a supported format");
      break;

    case "UPLOAD_FAILED":
      suggestions.push("Ensure the file is not corrupted");
      suggestions.push("Check available storage space");
      suggestions.push("Try uploading again");
      break;

    case "ANALYSIS_FAILED":
      suggestions.push("The AI could not complete the analysis");
      suggestions.push("Ensure the document contains construction data");
      suggestions.push("Try a different document or contact support");
      break;

    case "INSUFFICIENT_PERMISSIONS":
    case "401":
    case "403":
      suggestions.push("You may not have access to this project");
      suggestions.push("Contact your project administrator");
      suggestions.push("Try logging out and back in");
      break;

    case "RATE_LIMIT":
    case "429":
      suggestions.push("You've made too many requests");
      suggestions.push("Wait a few minutes before trying again");
      suggestions.push("Consider upgrading your plan for higher limits");
      break;

    case "SERVER_ERROR":
    case "500":
    case "502":
      suggestions.push("The server encountered an error");
      suggestions.push("This is usually temporary - try again in a moment");
      suggestions.push("Contact support if this persists");
      break;

    case "503":
      suggestions.push("The service is temporarily unavailable");
      suggestions.push("We may be performing maintenance");
      suggestions.push("Try again in a few minutes");
      break;

    default:
      return getGenericSuggestions(context);
  }

  return suggestions;
}

function getGenericSuggestions(context?: string): string[] {
  const suggestions: string[] = [
    "Try refreshing the page",
    "Check your internet connection",
  ];

  if (context === "upload") {
    suggestions.push("Ensure the file is valid and not corrupted");
    suggestions.push("Try uploading a smaller file");
  } else if (context === "analysis") {
    suggestions.push("Try running the analysis again");
    suggestions.push("Ensure the project has valid data");
  }

  suggestions.push("Contact support if the problem persists");

  return suggestions;
}

/**
 * Hook for managing error state with automatic dismissal
 */
export function useErrorHandler(autoDismissMs?: number) {
  const [error, setError] = React.useState<Error | APIError | null>(null);

  const handleError = React.useCallback((err: Error | APIError) => {
    console.error("Error occurred:", err);
    setError(err);

    if (autoDismissMs) {
      setTimeout(() => {
        setError(null);
      }, autoDismissMs);
    }
  }, [autoDismissMs]);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  };
}

/**
 * Higher-order function to wrap async functions with error handling
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  onError: (error: Error | APIError) => void
): T {
  return (async (...args: unknown[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error(String(error)));
      }
      throw error;
    }
  }) as T;
}
