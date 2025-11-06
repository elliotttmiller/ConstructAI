'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Building,
  Ruler,
  Eye,
  Layers,
  FileText,
  Cpu,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MapPin,
  Hash,
  Clock
} from 'lucide-react';
import { BlueprintAnalysis } from '@/lib/hunyuan3d-service';

interface EnhancedBlueprintAnalysisProps {
  analysis: BlueprintAnalysis | null;
  isLoading: boolean;
}

export default function EnhancedBlueprintAnalysis({ analysis, isLoading }: EnhancedBlueprintAnalysisProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 animate-pulse" />
            Analyzing Blueprint...
          </CardTitle>
          <CardDescription>
            Running advanced computer vision and AI analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
            <Progress value={65} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Processing architectural elements, extracting dimensions, and analyzing structure...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No blueprint analysis available. Upload a blueprint to see detailed insights.
        </AlertDescription>
      </Alert>
    );
  }

  const enhanced = analysis.enhancedFeatures;
  const hasEnhancedFeatures = !!enhanced;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Blueprint Analysis
              {hasEnhancedFeatures && (
                <Badge variant="default" className="ml-2">
                  Enhanced AI Analysis
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {hasEnhancedFeatures
                ? 'Advanced computer vision and architectural element detection'
                : 'Basic blueprint analysis results'
              }
            </CardDescription>
          </div>
          <Badge variant={analysis.complexity === 'high' ? 'destructive' : analysis.complexity === 'medium' ? 'outline' : 'default'}>
            {analysis.complexity} complexity
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elements">Elements</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{analysis.detectedElements.length}</div>
                <div className="text-sm text-muted-foreground">Element Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{enhanced?.roomCount || '?'}</div>
                <div className="text-sm text-muted-foreground">Rooms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{enhanced?.doorCount || '?'}</div>
                <div className="text-sm text-muted-foreground">Doors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{enhanced?.windowCount || '?'}</div>
                <div className="text-sm text-muted-foreground">Windows</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Architectural Style:</span>
                <Badge variant="outline">{analysis.architecturalStyle}</Badge>
              </div>

              {enhanced && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Drawing Type:</span>
                    <Badge variant="outline">{enhanced.drawingType}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Projection:</span>
                    <Badge variant="outline">{enhanced.projection}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Scale Detection:</span>
                    <div className="flex items-center gap-2">
                      {enhanced.scaleDetected ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="text-sm">
                        {enhanced.scaleDetected
                          ? `${enhanced.scaleRatio} px/${enhanced.scaleUnit}`
                          : 'Not detected'
                        }
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Processing:</span>
                <span className="text-sm">{Math.round(analysis.estimatedConversionTime / 1000)}s</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="elements" className="space-y-4 mt-4">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Detected Elements
              </h4>

              <div className="grid grid-cols-2 gap-2">
                {analysis.detectedElements.map((element, index) => (
                  <Badge key={index} variant="outline" className="justify-center">
                    {element.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>

            {enhanced && (
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Text Analysis
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-semibold">{enhanced.textRegions}</div>
                    <div className="text-xs text-muted-foreground">Text Regions</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-semibold">{enhanced.ocrConfidence}%</div>
                    <div className="text-xs text-muted-foreground">OCR Confidence</div>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <div className="text-lg font-semibold">{enhanced.structuralComplexity}</div>
                    <div className="text-xs text-muted-foreground">Structural Complexity</div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4" />
                  Complexity Analysis
                </h4>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Complexity</span>
                      <span>{analysis.complexity}</span>
                    </div>
                    <Progress
                      value={analysis.complexity === 'low' ? 33 : analysis.complexity === 'medium' ? 66 : 100}
                      className="h-2"
                    />
                  </div>

                  {enhanced && (
                    <>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Structural Complexity</span>
                          <span>{enhanced.structuralComplexity}/10</span>
                        </div>
                        <Progress value={enhanced.structuralComplexity * 10} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Text Recognition Quality</span>
                          <span>{enhanced.ocrConfidence}%</span>
                        </div>
                        <Progress value={enhanced.ocrConfidence} className="h-2" />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {analysis.processingQuality && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Eye className="h-4 w-4" />
                    Production Quality Metrics
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Overall Quality Score</span>
                        <span>{analysis.processingQuality.overallScore}%</span>
                      </div>
                      <Progress value={analysis.processingQuality.overallScore} className="h-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="text-center p-2 border rounded">
                        <div className="text-sm font-semibold">{analysis.processingQuality.imageClarity}%</div>
                        <div className="text-xs text-muted-foreground">Image Clarity</div>
                      </div>
                      <div className="text-center p-2 border rounded">
                        <div className="text-sm font-semibold">{analysis.processingQuality.textReadability}%</div>
                        <div className="text-xs text-muted-foreground">Text Readability</div>
                      </div>
                      <div className="text-center p-2 border rounded">
                        <div className="text-sm font-semibold">{analysis.processingQuality.lineDefinition}%</div>
                        <div className="text-xs text-muted-foreground">Line Definition</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Eye className="h-4 w-4" />
                  Visual Analysis
                </h4>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Image Size:</span>
                    <div>{analysis.imageSize.width} × {analysis.imageSize.height}px</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aspect Ratio:</span>
                    <div>{(analysis.imageSize.width / analysis.imageSize.height).toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4" />
                  Processing Information
                </h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Analysis Type:</span>
                    <span>{hasEnhancedFeatures ? 'Enhanced AI + CV' : 'Basic'}</span>
                  </div>

                  {enhanced && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Remote Analysis:</span>
                        <span>{enhanced.remoteAnalysisAvailable ? 'Available' : 'Local Only'}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Scale Detection:</span>
                        <span className="flex items-center gap-1">
                          {enhanced.scaleDetected ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <AlertCircle className="h-3 w-3 text-yellow-500" />
                          )}
                          {enhanced.scaleDetected ? 'Detected' : 'Manual'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Conversion:</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.round(analysis.estimatedConversionTime / 1000)}s
                    </span>
                  </div>
                </div>
              </div>

              {enhanced && (
                <div>
                  <h4 className="font-medium flex items-center gap-2 mb-3">
                    <Hash className="h-4 w-4" />
                    Detailed Metrics
                  </h4>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-2 border rounded">
                      <div className="font-medium">Architectural Elements</div>
                      <div className="text-muted-foreground">
                        {enhanced.roomCount + enhanced.doorCount + enhanced.windowCount} total
                      </div>
                    </div>

                    <div className="p-2 border rounded">
                      <div className="font-medium">Text Regions</div>
                      <div className="text-muted-foreground">
                        {enhanced.textRegions} detected
                      </div>
                    </div>

                    <div className="p-2 border rounded">
                      <div className="font-medium">Drawing Standard</div>
                      <div className="text-muted-foreground">
                        {enhanced.drawingType}
                      </div>
                    </div>

                    <div className="p-2 border rounded">
                      <div className="font-medium">Projection Type</div>
                      <div className="text-muted-foreground">
                        {enhanced.projection}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
