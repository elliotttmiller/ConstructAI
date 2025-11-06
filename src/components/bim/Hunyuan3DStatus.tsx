'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Cpu,
  Zap,
  RefreshCw,
  Clock,
  Download,
  Eye,
  Layers
} from 'lucide-react';

interface ProcessingStatus {
  stage: string;
  progress: number;
  message: string;
  isError: boolean;
  details?: string;
  estimatedTimeRemaining?: number;
}

interface ConversionMetrics {
  processingTime: number;
  modelStats?: {
    vertices: number;
    faces: number;
    materials: number;
    fileSize: number;
  };
  quality?: {
    geometryScore: number;
    textureScore: number;
    overallScore: number;
  };
}

interface Hunyuan3DStatusProps {
  isProcessing: boolean;
  status: ProcessingStatus;
  serviceAvailable: boolean;
  conversionResult?: {
    success: boolean;
    modelUrl?: string;
    textureUrl?: string;
    fallbackUsed: boolean;
    error?: string;
  };
  metrics?: ConversionMetrics;
  onRetry?: () => void;
  onDownload?: (url: string) => void;
  onViewModel?: () => void;
  className?: string;
}

const Hunyuan3DStatus: React.FC<Hunyuan3DStatusProps> = ({
  isProcessing,
  status,
  serviceAvailable,
  conversionResult,
  metrics,
  onRetry,
  onDownload,
  onViewModel,
  className = ""
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  // Auto-hide success messages after 10 seconds
  useEffect(() => {
    if (conversionResult?.success && !isProcessing) {
      const timer = setTimeout(() => {
        // Could trigger a callback to hide the status
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [conversionResult?.success, isProcessing]);

  const getStatusIcon = () => {
    if (isProcessing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }

    if (status.isError || conversionResult?.error) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }

    if (conversionResult?.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }

    return <Clock className="h-4 w-4 text-blue-500" />;
  };

  const getStatusColor = () => {
    if (status.isError || conversionResult?.error) return 'destructive';
    if (conversionResult?.success) return 'default';
    if (isProcessing) return 'secondary';
    return 'outline';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    onRetry?.();
  };

  const getProcessingStageDescription = (stage: string) => {
    const stageDescriptions: Record<string, string> = {
      'initializing': 'Setting up AI processing pipeline...',
      'analyzing': 'Analyzing blueprint structure and features...',
      'preprocessing': 'Optimizing image for 3D generation...',
      'generating': 'Creating 3D geometry using Hunyuan3D-2...',
      'texturing': 'Applying materials and textures...',
      'postprocessing': 'Optimizing mesh and finalizing model...',
      'complete': 'Conversion completed successfully!'
    };
    return stageDescriptions[stage] || stage;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Service Status */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            Hunyuan3D-2 AI Service
            <Badge variant={serviceAvailable ? 'default' : 'destructive'} className="text-xs">
              {serviceAvailable ? (
                <>
                  <Zap className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                'Offline'
              )}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xs text-muted-foreground">
            {serviceAvailable
              ? 'Real AI models ready for blueprint conversion'
              : 'Using enhanced simulation mode'
            }
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {(isProcessing || conversionResult) && (
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {getStatusIcon()}
              Processing Status
              <Badge variant={getStatusColor()} className="text-xs">
                {isProcessing ? 'Processing' : conversionResult?.success ? 'Complete' : 'Failed'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium">
                    {getProcessingStageDescription(status.stage)}
                  </span>
                  <span className="text-muted-foreground">
                    {status.progress}%
                  </span>
                </div>
                <Progress value={status.progress} className="h-2" />
                {status.estimatedTimeRemaining && (
                  <div className="text-xs text-muted-foreground">
                    Estimated time remaining: {formatTime(status.estimatedTimeRemaining)}
                  </div>
                )}
              </div>
            )}

            {/* Status Message */}
            <div className="text-sm">
              {status.message}
            </div>

            {/* Error Handling */}
            {(status.isError || conversionResult?.error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="space-y-2">
                  <div>
                    {status.isError ? status.message : conversionResult?.error}
                  </div>
                  {status.details && (
                    <div className="text-xs opacity-80">
                      {status.details}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleRetry}
                      disabled={retryCount >= 3}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry {retryCount > 0 && `(${retryCount}/3)`}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-xs"
                    >
                      {showDetails ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Status */}
            {conversionResult?.success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="space-y-2">
                  <div className="text-green-800">
                    🎉 3D model generated successfully!
                  </div>
                  {conversionResult.fallbackUsed && (
                    <div className="text-xs text-orange-600">
                      Using enhanced simulation mode (Real AI unavailable)
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {conversionResult.modelUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownload?.(conversionResult.modelUrl!)}
                        className="text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download GLB
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={onViewModel}
                      className="text-xs"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View 3D Model
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Conversion Metrics */}
      {metrics && conversionResult?.success && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Model Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3 text-xs">
              {metrics.modelStats && (
                <>
                  <div>
                    <div className="font-medium">Vertices</div>
                    <div className="text-muted-foreground">
                      {metrics.modelStats.vertices.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Faces</div>
                    <div className="text-muted-foreground">
                      {metrics.modelStats.faces.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Materials</div>
                    <div className="text-muted-foreground">
                      {metrics.modelStats.materials}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">File Size</div>
                    <div className="text-muted-foreground">
                      {(metrics.modelStats.fileSize / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </>
              )}
              <div>
                <div className="font-medium">Processing Time</div>
                <div className="text-muted-foreground">
                  {formatTime(metrics.processingTime)}
                </div>
              </div>
              {metrics.quality && (
                <div>
                  <div className="font-medium">Quality Score</div>
                  <div className="text-muted-foreground">
                    {metrics.quality.overallScore}%
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technical Details (when expanded) */}
      {showDetails && (status.isError || conversionResult?.error) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs space-y-2 font-mono">
              <div>
                <span className="font-semibold">Service Available:</span> {String(serviceAvailable)}
              </div>
              <div>
                <span className="font-semibold">Retry Count:</span> {retryCount}
              </div>
              <div>
                <span className="font-semibold">Current Stage:</span> {status.stage}
              </div>
              {status.details && (
                <div>
                  <span className="font-semibold">Error Details:</span>
                  <pre className="mt-1 p-2 bg-orange-100 rounded text-xs overflow-auto">
                    {status.details}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Hunyuan3DStatus;
