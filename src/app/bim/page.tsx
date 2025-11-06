"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  RotateCcw,
  Move,
  ZoomIn,
  ZoomOut,
  Layers,
  Eye,
  EyeOff,
  Settings,
  Download,
  Share,
  Ruler,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Upload,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Loader2
} from "lucide-react";
import ThreeViewer from "@/components/bim/ThreeViewer";
import { UniversalModelViewerEditor } from "@/components/bim/UniversalModelViewerEditor";
import { ParametricCADBuilder } from "@/components/cad/ParametricCADBuilder";
import { LayerManager } from "@/components/bim/LayerManager";
import type { CADGenerationResult } from "@/types/build123d";

interface BIMModel {
  id: string;
  name: string;
  type: string;
  status: 'loaded' | 'loading' | 'error';
  size: string;
  lastModified: Date;
  version: string;
  url?: string;
  projectId?: string;
  projectName?: string;
}

interface ClashItem {
  id: string;
  type: 'hard' | 'soft' | 'clearance';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  elements: string[];
  location: string;
  modelId?: string;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-500';
    case 'major':
      return 'bg-orange-500';
    case 'minor':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
};

export default function BIMPage() {
  const { data: session } = useSession();
  const [models, setModels] = useState<BIMModel[]>([]);
  const [clashes, setClashes] = useState<ClashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showClashes, setShowClashes] = useState(true);
  const [generatedCADModel, setGeneratedCADModel] = useState<CADGenerationResult | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [threeScene, setThreeScene] = useState<any>(null);
  const sceneInitializedRef = useRef(false);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    fetchBIMData();
    // Only run once when session is available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]); // Changed from [session] to prevent excessive re-renders

  const fetchBIMData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bim');
      
      if (!response.ok) {
        throw new Error('Failed to fetch BIM data');
      }

      const data = await response.json();
      setModels(data.models || []);
      setClashes(data.clashes || []);
      
      if (data.models && data.models.length > 0) {
        setSelectedModel(data.models[0].id);
      }
    } catch (err) {
      console.error('Error fetching BIM data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Please sign in to view BIM models</p>
      </div>
    );
  }

  const [viewerMode, setViewerMode] = useState<'classic' | 'universal'>('universal');

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">3D BIM Viewer & Editor</h1>
            <p className="text-muted-foreground">
              Universal model viewer with integrated editing and analysis tools
            </p>
          </div>
          <div className="flex space-x-2">
            <div className="flex border rounded-md">
              <Button 
                variant={viewerMode === 'universal' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewerMode('universal')}
              >
                Universal Editor
              </Button>
              <Button 
                variant={viewerMode === 'classic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewerMode('classic')}
              >
                Classic Viewer
              </Button>
            </div>
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Load Model
            </Button>
            <Button variant="outline">
              <Share className="mr-2 h-4 w-4" />
              Share View
            </Button>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {viewerMode === 'universal' ? (
          /* Universal Model Viewer/Editor */
          <UniversalModelViewerEditor
            onModelLoaded={(model) => {
              console.log('Model loaded in universal viewer:', model);
              setThreeScene(model);
            }}
            onModelUpdated={(model) => {
              console.log('Model updated:', model);
            }}
            onExport={(format) => {
              console.log('Export requested:', format);
              // TODO: Implement export functionality
            }}
          />
        ) : (
          <>
            {/* Classic Viewer Mode */}
            <div className="flex-1 relative">
              {/* 3D Viewer Container */}
              <ThreeViewer
                onAnalysisComplete={(analysis) => {
                  console.log('Analysis complete:', analysis);
                }}
                onClashesDetected={(clashes) => {
                  console.log('Clashes detected:', clashes);
                }}
                onSceneReady={(scene) => {
                  if (!sceneInitializedRef.current) {
                    sceneInitializedRef.current = true;
                    setThreeScene(scene);
                  }
                }}
              />
            </div>

            {/* Right Sidebar */}
            <div className="w-80 border-l bg-background">
          <Tabs defaultValue="models" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="layers">Layers</TabsTrigger>
              <TabsTrigger value="cad">CAD</TabsTrigger>
              <TabsTrigger value="clashes">Clashes</TabsTrigger>
              <TabsTrigger value="properties">Props</TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-3">Loaded Models</h3>
                <div className="space-y-2">
                  {models.length > 0 ? (
                    models.map((model) => (
                      <div
                        key={model.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedModel === model.id
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedModel(model.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{model.name}</span>
                          <div className="flex items-center space-x-1">
                            <Badge variant="secondary" className="text-xs">
                              {model.type.toUpperCase()}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Size: {model.size}</p>
                          <p>Version: {model.version}</p>
                          <p>Modified: {new Date(model.lastModified).toLocaleDateString()}</p>
                          {model.projectName && <p>Project: {model.projectName}</p>}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No BIM models loaded</p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-3">Layer Control</h3>
                <div className="space-y-2">
                  {['Architectural', 'Structural', 'MEP', 'Site'].map((layer) => (
                    <div key={layer} className="flex items-center justify-between">
                      <span className="text-sm">{layer}</span>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layers" className="p-0 h-full overflow-hidden">
              <LayerManager 
                scene={threeScene}
                onLayerSelect={(layer) => {
                  console.log('Layer selected:', layer);
                }}
                onLayerVisibilityChange={(layerId, visible) => {
                  console.log('Layer visibility changed:', layerId, visible);
                }}
                onLayerLockChange={(layerId, locked) => {
                  console.log('Layer lock changed:', layerId, locked);
                }}
                className="h-full border-0 rounded-none"
              />
            </TabsContent>

            <TabsContent value="cad" className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              <ParametricCADBuilder
                onModelGenerated={(result) => {
                  setGeneratedCADModel(result);
                  // Dispatch event to load model in ThreeViewer
                  if (result.exports.gltf && typeof window !== 'undefined') {
                    const event = new CustomEvent('loadCADModel', { 
                      detail: { 
                        url: `/api/cad/export/${result.model_id}/gltf`,
                        modelId: result.model_id,
                        properties: result.properties
                      } 
                    });
                    window.dispatchEvent(event);
                  }
                }}
                className="w-full"
              />
            </TabsContent>

            <TabsContent value="clashes" className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Clash Report</h3>
                <Button size="sm" variant="outline">
                  <FileText className="mr-1 h-3 w-3" />
                  Export
                </Button>
              </div>

              <div className="space-y-3">
                {clashes.length > 0 ? (
                  clashes.map((clash) => (
                    <Card key={clash.id} className="cursor-pointer hover:bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(clash.severity)}`}></div>
                            <span className="text-sm font-medium capitalize">{clash.severity}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {clash.type}
                          </Badge>
                        </div>
                        <p className="text-sm mb-2">{clash.description}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>Location: {clash.location}</p>
                          <p>Elements: {clash.elements.join(', ')}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No clashes detected</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="properties" className="p-4 space-y-4">
              <div>
                <h3 className="font-medium mb-3">Element Properties</h3>
                <div className="text-sm text-muted-foreground">
                  Select an element in the 3D view to see its properties
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Selected Element</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>Structural Beam</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID:</span>
                    <span>Beam_B1_001</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Material:</span>
                    <span>Steel</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span>W12x26</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <span>Level 3</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
