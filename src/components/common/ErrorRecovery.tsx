'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertTriangle,
  RefreshCw,
  FileText,
  Settings,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Bug
} from 'lucide-react';

export interface ErrorRecoveryProps {
  error: Error | string;
  context?: {
    operation?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    timestamp?: Date;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  suggestions?: string[];
  showDetails?: boolean;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface ErrorSolution {
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  icon: React.ComponentType<{ className?: string }>;
}

export default function ErrorRecovery({
  error,
  context,
  onRetry,
  onDismiss,
  suggestions = [],
  showDetails = false,
  severity = 'medium'
}: ErrorRecoveryProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);
  const [isRetrying, setIsRetrying] = useState(false);

  const errorMessage = error instanceof Error ? error.message : error;
  const errorName = error instanceof Error ? error.name : 'Error';

  // Analyze error and provide intelligent solutions
  const solutions = getErrorSolutions(errorMessage, context);

  const handleRetry = async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'low': return 'border-blue-200 bg-blue-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'critical': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityIcon = () => {
    switch (severity) {
      case 'low': return <Info className="h-5 w-5 text-blue-500" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className={`w-full ${getSeverityColor()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getSeverityIcon()}
            <div>
              <CardTitle className="text-lg">
                {context?.operation ? `${context.operation} Failed` : 'Operation Failed'}
              </CardTitle>
              <CardDescription className="mt-1">
                {getContextualDescription(errorMessage, context)}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={severity === 'critical' ? 'destructive' : 'outline'}>
              {severity} error
            </Badge>
            {onDismiss && (
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Message */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="font-medium">
            {errorMessage}
          </AlertDescription>
        </Alert>

        {/* Context Information */}
        {context && (
          <div className="text-sm space-y-2">
            {context.fileName && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">File:</span>
                <span className="font-mono">{context.fileName}</span>
                {context.fileSize && (
                  <Badge variant="outline" className="text-xs">
                    {(context.fileSize / 1024 / 1024).toFixed(2)}MB
                  </Badge>
                )}
              </div>
            )}
            {context.timestamp && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-mono text-xs">
                  {context.timestamp.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Solutions */}
        {solutions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggested Solutions
            </h4>
            <div className="space-y-2">
              {solutions.map((solution, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <solution.icon className="h-4 w-4 mt-0.5 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{solution.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {solution.description}
                    </div>
                    {solution.action && (
                      <div className="mt-2">
                        {solution.action.href ? (
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={solution.action.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              {solution.action.label}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={solution.action.onClick}
                          >
                            {solution.action.label}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Additional Suggestions:</h4>
            <ul className="text-sm space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onRetry && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isRetrying ? 'Retrying...' : 'Try Again'}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>
                  Hide Details <ChevronUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Show Details <ChevronDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Technical Details */}
        {isExpanded && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Technical Details
            </h4>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Error Type:</span>
                <span className="ml-2 font-mono">{errorName}</span>
              </div>

              {context && Object.entries(context).map(([key, value]) => (
                <div key={key}>
                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                  <span className="ml-2 font-mono">
                    {value instanceof Date ? value.toISOString() : String(value)}
                  </span>
                </div>
              ))}

              <div className="mt-3 p-3 bg-muted rounded border">
                <div className="font-medium mb-2">Error Message:</div>
                <div className="font-mono text-xs break-all">{errorMessage}</div>
              </div>

              {error instanceof Error && error.stack && (
                <div className="p-3 bg-muted rounded border">
                  <div className="font-medium mb-2">Stack Trace:</div>
                  <pre className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getContextualDescription(errorMessage: string, context?: ErrorRecoveryProps['context']): string {
  const operation = context?.operation || 'The operation';

  if (errorMessage.includes('File size')) {
    return `The file you uploaded is too large for processing.`;
  }

  if (errorMessage.includes('File type') || errorMessage.includes('not supported')) {
    return `The file format is not supported for this operation.`;
  }

  if (errorMessage.includes('timeout')) {
    return `${operation} took too long and was cancelled.`;
  }

  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return `A network error occurred while communicating with our servers.`;
  }

  if (errorMessage.includes('memory') || errorMessage.includes('quota')) {
    return `Your browser ran out of memory while processing the file.`;
  }

  return `${operation} encountered an unexpected error.`;
}

function getErrorSolutions(errorMessage: string, context?: ErrorRecoveryProps['context']): ErrorSolution[] {
  const solutions: ErrorSolution[] = [];

  // File size errors
  if (errorMessage.includes('File size') || errorMessage.includes('too large')) {
    solutions.push({
      title: 'Reduce File Size',
      description: 'Compress your image or use a smaller file. Try reducing image resolution or quality.',
      action: {
        label: 'Image Compression Tools',
        href: 'https://tinypng.com'
      },
      icon: Download
    });
  }

  // File type errors
  if (errorMessage.includes('File type') || errorMessage.includes('not supported')) {
    solutions.push({
      title: 'Convert File Format',
      description: 'Convert your file to a supported format (JPG, PNG, BMP, or PDF).',
      action: {
        label: 'File Converters',
        href: 'https://convertio.co'
      },
      icon: RefreshCw
    });
  }

  // Timeout errors
  if (errorMessage.includes('timeout')) {
    solutions.push({
      title: 'Reduce File Complexity',
      description: 'Try using a simpler blueprint or image with fewer details.',
      icon: Settings
    });

    solutions.push({
      title: 'Check Internet Connection',
      description: 'Ensure you have a stable internet connection and try again.',
      icon: RefreshCw
    });
  }

  // Memory errors
  if (errorMessage.includes('memory') || errorMessage.includes('quota')) {
    solutions.push({
      title: 'Close Other Browser Tabs',
      description: 'Free up browser memory by closing unnecessary tabs and try again.',
      icon: Settings
    });

    solutions.push({
      title: 'Use a Smaller Image',
      description: 'Try uploading a smaller or lower resolution version of your blueprint.',
      icon: Download
    });
  }

  // OCR/text recognition errors
  if (errorMessage.includes('OCR') || errorMessage.includes('text recognition')) {
    solutions.push({
      title: 'Improve Image Quality',
      description: 'Use a higher resolution image with better contrast and clearer text.',
      icon: Settings
    });
  }

  // Browser compatibility
  if (errorMessage.includes('not supported') || errorMessage.includes('compatibility')) {
    solutions.push({
      title: 'Update Your Browser',
      description: 'Use a modern browser like Chrome, Firefox, or Safari for best compatibility.',
      action: {
        label: 'Browser Support Guide',
        href: '/docs/browser-support'
      },
      icon: ExternalLink
    });
  }

  // Generic solutions
  if (solutions.length === 0) {
    solutions.push({
      title: 'Try a Different File',
      description: 'Test with a different blueprint or image to isolate the issue.',
      icon: FileText
    });

    solutions.push({
      title: 'Refresh and Retry',
      description: 'Refresh the page and try the operation again.',
      action: {
        label: 'Refresh Page',
        onClick: () => window.location.reload()
      },
      icon: RefreshCw
    });
  }

  return solutions;
}
