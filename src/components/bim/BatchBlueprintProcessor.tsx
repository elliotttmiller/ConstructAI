import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Upload,
  Play,
  Pause,
  Trash2,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  FileText,
  X
} from 'lucide-react';
import { productionBlueprintAnalyzer, BlueprintAnalysisResult } from '@/lib/blueprint-analyzer-production';
import { BlueprintAnalysis } from '@/lib/hunyuan3d-service';

export interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  analysis?: BlueprintAnalysis;
  error?: string;
  startTime?: Date;
  endTime?: Date;
  processingTime?: number;
}

interface BatchBlueprintProcessorProps {
  onBatchComplete?: (results: BatchFile[]) => void;
  onFileComplete?: (file: BatchFile) => void;
  maxConcurrent?: number;
  autoStart?: boolean;
}

// Helper function to convert BlueprintAnalysisResult to BlueprintAnalysis
function convertAnalysisResult(result: BlueprintAnalysisResult): BlueprintAnalysis {
  return {
    imageSize: result.imageSize,
    detectedElements: result.detectedElements,
    architecturalStyle: result.architecturalStyle,
    complexity: result.complexity,
    estimatedConversionTime: result.estimatedConversionTime,
    enhancedFeatures: {
      drawingType: result.drawingType,
      projection: 'plan',
      roomCount: result.textRegions.roomLabels.length,
      doorCount: result.lineAnalysis.doorCount,
      windowCount: result.lineAnalysis.windowCount,
      scaleDetected: false,
      scaleRatio: 50,
      scaleUnit: 'm',
      ocrConfidence: result.textRegions.confidence,
      textRegions: result.textRegions.count,
      structuralComplexity: Math.round(result.lineAnalysis.totalLines / 10),
      remoteAnalysisAvailable: false
    },
    processingQuality: {
      imageClarity: result.processingQuality.imageClarity,
      lineAccuracy: result.processingQuality.lineDefinition,
      textReadability: result.processingQuality.textReadability,
      lineDefinition: result.processingQuality.lineDefinition,
      overallScore: result.processingQuality.overallScore
    }
  };
}

export default function BatchBlueprintProcessor({
  onBatchComplete,
  onFileComplete,
  maxConcurrent = 3,
  autoStart = false
}: BatchBlueprintProcessorProps) {
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyProcessing, setCurrentlyProcessing] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newBatchFiles: BatchFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0
    }));

    setBatchFiles(prev => [...prev, ...newBatchFiles]);

    if (autoStart && newBatchFiles.length > 0) {
      startBatchProcessing();
    }

    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  }, [autoStart]);

  const processFile = useCallback(async (batchFile: BatchFile): Promise<BatchFile> => {
    setBatchFiles(prev => prev.map(f =>
      f.id === batchFile.id
        ? { ...f, status: 'processing' as const, startTime: new Date(), progress: 10 }
        : f
    ));

    try {
      const startTime = Date.now();

      // Update progress during processing
      const progressInterval = setInterval(() => {
        setBatchFiles(prev => prev.map(f =>
          f.id === batchFile.id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ));
      }, 500);

      // Run the analysis
      const analysisResult = await productionBlueprintAnalyzer.analyzeBlueprint(batchFile.file, {
        enableOCR: true,
        enhanceImage: true,
        detectScale: true,
        classifyElements: true,
        maxImageSize: 2048
      });

      clearInterval(progressInterval);

      const endTime = new Date();
      const processingTime = Date.now() - startTime;

      // Convert BlueprintAnalysisResult to BlueprintAnalysis
      const analysis = convertAnalysisResult(analysisResult);

      const completedFile: BatchFile = {
        ...batchFile,
        status: 'completed',
        progress: 100,
        analysis,
        endTime,
        processingTime
      };

      setBatchFiles(prev => prev.map(f =>
        f.id === batchFile.id ? completedFile : f
      ));

      onFileComplete?.(completedFile);
      return completedFile;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorFile: BatchFile = {
        ...batchFile,
        status: 'error',
        progress: 0,
        error: errorMessage,
        endTime: new Date()
      };

      setBatchFiles(prev => prev.map(f =>
        f.id === batchFile.id ? errorFile : f
      ));

      return errorFile;
    }
  }, [onFileComplete]);

  const startBatchProcessing = useCallback(async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setCurrentlyProcessing(0);
    setTotalCompleted(0);

    const pendingFiles = batchFiles.filter(f => f.status === 'pending');
    let processing = 0;
    let completed = 0;

    const processNext = async (): Promise<void> => {
      const nextFile = pendingFiles.find(f => f.status === 'pending' && processing < maxConcurrent);

      if (!nextFile) {
        if (processing === 0) {
          // All done
          setIsProcessing(false);
          setCurrentlyProcessing(0);
          onBatchComplete?.(batchFiles);
          setShowResults(true);
        }
        return;
      }

      processing++;
      setCurrentlyProcessing(processing);

      const result = await processFile(nextFile);

      processing--;
      completed++;
      setCurrentlyProcessing(processing);
      setTotalCompleted(completed);

      // Process next file
      setTimeout(processNext, 100);
    };

    // Start initial batch
    for (let i = 0; i < Math.min(maxConcurrent, pendingFiles.length); i++) {
      processNext();
    }
  }, [batchFiles, isProcessing, maxConcurrent, processFile, onBatchComplete]);

  const pauseProcessing = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const clearCompleted = useCallback(() => {
    setBatchFiles(prev => prev.filter(f => f.status !== 'completed'));
  }, []);

  const clearAll = useCallback(() => {
    setBatchFiles([]);
    setTotalCompleted(0);
    setCurrentlyProcessing(0);
    setShowResults(false);
  }, []);

  const removeFile = useCallback((fileId: string) => {
    setBatchFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const downloadResults = useCallback(() => {
    const results = batchFiles
      .filter(f => f.status === 'completed' && f.analysis)
      .map(f => ({
        fileName: f.file.name,
        fileSize: f.file.size,
        processingTime: f.processingTime,
        detectedElements: f.analysis?.detectedElements || [],
        complexity: f.analysis?.complexity,
        architecturalStyle: f.analysis?.architecturalStyle,
        estimatedConversionTime: f.analysis?.estimatedConversionTime,
        processingQuality: f.analysis?.processingQuality
      }));

    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-analysis-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [batchFiles]);

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4 animate-spin" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const pendingCount = batchFiles.filter(f => f.status === 'pending').length;
  const processingCount = batchFiles.filter(f => f.status === 'processing').length;
  const completedCount = batchFiles.filter(f => f.status === 'completed').length;
  const errorCount = batchFiles.filter(f => f.status === 'error').length;
  const totalProgress = batchFiles.length > 0 ? (completedCount / batchFiles.length) * 100 : 0;

  return (
    <div className="w-full space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Batch Blueprint Processor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isProcessing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Blueprint Files
                </Button>
              </div>
              <div className="flex gap-2">
                {!isProcessing ? (
                  <Button
                    onClick={startBatchProcessing}
                    disabled={pendingCount === 0}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Processing
                  </Button>
                ) : (
                  <Button
                    onClick={pauseProcessing}
                    variant="outline"
                    className="flex-1"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button
                  onClick={clearAll}
                  variant="outline"
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Overview */}
            {batchFiles.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500">{pendingCount}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{processingCount}</div>
                    <div className="text-sm text-muted-foreground">Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                    <div className="text-sm text-muted-foreground">Errors</div>
                  </div>
                </div>

                <Progress value={totalProgress} className="h-2" />

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Overall Progress: {Math.round(totalProgress)}%</span>
                  <span>Currently Processing: {currentlyProcessing}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {batchFiles.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Files ({batchFiles.length})
            </CardTitle>
            <div className="flex gap-2">
              {completedCount > 0 && (
                <Button
                  onClick={downloadResults}
                  variant="outline"
                  size="sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Results
                </Button>
              )}
              {completedCount > 0 && (
                <Button
                  onClick={clearCompleted}
                  variant="outline"
                  size="sm"
                >
                  Clear Completed
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {batchFiles.map((batchFile, index) => (
                <div
                  key={batchFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(batchFile.status)}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{batchFile.file.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(batchFile.file.size / 1024 / 1024).toFixed(1)}MB
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(batchFile.status)}
                        <span className="capitalize">{batchFile.status}</span>
                      </div>

                      {batchFile.status === 'processing' && (
                        <span>{batchFile.progress}%</span>
                      )}

                      {batchFile.status === 'completed' && batchFile.analysis && (
                        <span>{batchFile.analysis.detectedElements.length} elements</span>
                      )}

                      {batchFile.status === 'completed' && batchFile.processingTime && (
                        <span>{(batchFile.processingTime / 1000).toFixed(1)}s</span>
                      )}

                      {batchFile.error && (
                        <span className="text-red-600 truncate max-w-xs">{batchFile.error}</span>
                      )}
                    </div>

                    {batchFile.status === 'processing' && (
                      <Progress value={batchFile.progress} className="h-1 mt-2" />
                    )}
                  </div>

                  <Button
                    onClick={() => removeFile(batchFile.id)}
                    variant="ghost"
                    size="sm"
                    disabled={batchFile.status === 'processing'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {showResults && completedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Batch Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully processed {completedCount} of {batchFiles.length} files.
                {errorCount > 0 && ` ${errorCount} files had errors.`}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
