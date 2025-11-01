"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
            <AlertTriangle className="h-8 w-8 text-error" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-neutral-600">
            {this.state.error?.message ||
              "An unexpected error occurred. Please try again."}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => this.setState({ hasError: false, error: undefined })}
              variant="outline"
            >
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error display component for use in catch blocks
 */
export function ErrorDisplay({
  error,
  retry,
}: {
  error: Error | string;
  retry?: () => void;
}) {
  const message = typeof error === "string" ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-error/20 bg-error/5 p-8 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-error" />
      <h3 className="mb-2 text-lg font-semibold text-foreground">Error</h3>
      <p className="mb-4 text-sm text-neutral-600">{message}</p>
      {retry && (
        <Button onClick={retry} size="sm">
          Retry
        </Button>
      )}
    </div>
  );
}
