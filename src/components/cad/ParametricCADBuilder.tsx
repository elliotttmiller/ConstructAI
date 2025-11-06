'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Box, 
  Cylinder, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Info,
  Settings,
  Save,
  Library,
  Sparkles
} from 'lucide-react';
import type { 
  CADGenerationResult, 
  ColumnParameters, 
  BoxParameters,
  ExportFormat 
} from '@/types/build123d';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  model_type: string;
  default_parameters: any;
  tags: string[];
}

interface ParametricCADBuilderProps {
  onModelGenerated?: (result: CADGenerationResult) => void;
  className?: string;
}

export function ParametricCADBuilder({ 
  onModelGenerated, 
  className = '' 
}: ParametricCADBuilderProps) {
  const [activeTab, setActiveTab] = useState<'column' | 'box' | 'templates'>('column');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<CADGenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // Column parameters state
  const [columnParams, setColumnParams] = useState<ColumnParameters>({
    height: 3000,
    shaft_diameter: 300,
    base_size: 500,
    hole_count: 4,
    hole_diameter: 20,
    material: 'steel',
    add_capital: true
  });

  // Box parameters state
  const [boxParams, setBoxParams] = useState<BoxParameters>({
    dimensions: {
      width: 200,
      height: 150,
      depth: 100
    },
    wall_thickness: 5,
    has_lid: true,
    corner_radius: 5,
    mounting_holes: false
  });

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await fetch('/api/cad/templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoadingTemplates(false);
    }
  };

  const applyTemplate = (template: Template) => {
    if (template.model_type === 'column') {
      setColumnParams(template.default_parameters);
      setActiveTab('column');
    } else if (template.model_type === 'box') {
      setBoxParams(template.default_parameters);
      setActiveTab('box');
    }
  };

  const saveModel = async () => {
    if (!result) return;
    
    setSaving(true);
    try {
      const modelName = window.prompt('Enter a name for this model:');
      if (!modelName) return;

      const response = await fetch('/api/cad/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model_id: result.model_id,
          model_type: result.model_type || activeTab,
          name: modelName,
          description: `${activeTab} model generated on ${new Date().toLocaleDateString()}`,
          parameters: result.parameters,
          properties: result.properties,
          exports: result.exports,
          material: result.material,
        })
      });

      if (response.ok) {
        alert('Model saved successfully!');
      } else {
        throw new Error('Failed to save model');
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save model. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const generateColumn = useCallback(async () => {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cad/column/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(columnParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Generation failed');
      }

      const data: CADGenerationResult = await response.json();
      setResult(data);
      
      if (onModelGenerated) {
        onModelGenerated(data);
      }

      // Load GLTF into viewer if available
      if (data.exports.gltf && typeof window !== 'undefined') {
        const event = new CustomEvent('loadCADModel', { 
          detail: { 
            url: `/api/cad/export/${data.model_id}/gltf`,
            modelId: data.model_id
          } 
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Column generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [columnParams, onModelGenerated]);

  const generateBox = useCallback(async () => {
    setGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/cad/box/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(boxParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Generation failed');
      }

      const data: CADGenerationResult = await response.json();
      setResult(data);

      if (onModelGenerated) {
        onModelGenerated(data);
      }

      if (data.exports.gltf && typeof window !== 'undefined') {
        const event = new CustomEvent('loadCADModel', { 
          detail: { 
            url: `/api/cad/export/${data.model_id}/gltf`,
            modelId: data.model_id
          } 
        });
        window.dispatchEvent(event);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Box generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }, [boxParams, onModelGenerated]);

  const downloadFile = useCallback(async (format: ExportFormat) => {
    if (!result) return;

    try {
      const response = await fetch(`/api/cad/export/${result.model_id}/${format}`);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${result.model_id}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      setError('Failed to download file');
    }
  }, [result]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Parametric CAD Builder
        </CardTitle>
        <CardDescription>
          Generate precise CAD models using build123d parametric modeling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'column' | 'box' | 'templates')}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="column" className="flex items-center gap-2">
              <Cylinder className="w-4 h-4" />
              Column
            </TabsTrigger>
            <TabsTrigger value="box" className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              Box
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium">Model Templates</h3>
              <Badge variant="secondary">{templates.length} templates</Badge>
            </div>
            
            {loadingTemplates ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => applyTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{template.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="column" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="col-height">Height (mm)</Label>
                <Input
                  id="col-height"
                  type="number"
                  value={columnParams.height}
                  onChange={(e) => setColumnParams({
                    ...columnParams,
                    height: parseFloat(e.target.value) || 0
                  })}
                  min={100}
                  step={100}
                />
              </div>

              <div>
                <Label htmlFor="col-diameter">Shaft Diameter (mm)</Label>
                <Input
                  id="col-diameter"
                  type="number"
                  value={columnParams.shaft_diameter}
                  onChange={(e) => setColumnParams({
                    ...columnParams,
                    shaft_diameter: parseFloat(e.target.value) || 0
                  })}
                  min={50}
                  step={10}
                />
              </div>

              <div>
                <Label htmlFor="col-base">Base Size (mm)</Label>
                <Input
                  id="col-base"
                  type="number"
                  value={columnParams.base_size}
                  onChange={(e) => setColumnParams({
                    ...columnParams,
                    base_size: parseFloat(e.target.value) || 0
                  })}
                  min={100}
                  step={50}
                />
              </div>

              <div>
                <Label htmlFor="col-holes">Bolt Holes</Label>
                <Input
                  id="col-holes"
                  type="number"
                  value={columnParams.hole_count}
                  onChange={(e) => setColumnParams({
                    ...columnParams,
                    hole_count: parseInt(e.target.value) || 4
                  })}
                  min={3}
                  max={12}
                />
              </div>

              <div>
                <Label htmlFor="col-hole-dia">Hole Diameter (mm)</Label>
                <Input
                  id="col-hole-dia"
                  type="number"
                  value={columnParams.hole_diameter}
                  onChange={(e) => setColumnParams({
                    ...columnParams,
                    hole_diameter: parseFloat(e.target.value) || 0
                  })}
                  min={5}
                  step={5}
                />
              </div>

              <div>
                <Label htmlFor="col-material">Material</Label>
                <select
                  id="col-material"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={columnParams.material}
                  onChange={(e) => setColumnParams({
                    ...columnParams,
                    material: e.target.value
                  })}
                >
                  <option value="steel">Steel</option>
                  <option value="aluminum">Aluminum</option>
                  <option value="concrete">Concrete</option>
                  <option value="timber">Timber</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="col-capital"
                checked={columnParams.add_capital}
                onCheckedChange={(checked) => setColumnParams({
                  ...columnParams,
                  add_capital: checked
                })}
              />
              <Label htmlFor="col-capital">Add Capital (Top Plate)</Label>
            </div>

            <Button 
              onClick={generateColumn} 
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Column...
                </>
              ) : (
                <>
                  <Cylinder className="w-4 h-4 mr-2" />
                  Generate Column
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="box" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="box-width">Width (mm)</Label>
                <Input
                  id="box-width"
                  type="number"
                  value={boxParams.dimensions.width}
                  onChange={(e) => setBoxParams({
                    ...boxParams,
                    dimensions: {
                      ...boxParams.dimensions,
                      width: parseFloat(e.target.value) || 0
                    }
                  })}
                  min={10}
                  step={10}
                />
              </div>

              <div>
                <Label htmlFor="box-height">Height (mm)</Label>
                <Input
                  id="box-height"
                  type="number"
                  value={boxParams.dimensions.height}
                  onChange={(e) => setBoxParams({
                    ...boxParams,
                    dimensions: {
                      ...boxParams.dimensions,
                      height: parseFloat(e.target.value) || 0
                    }
                  })}
                  min={10}
                  step={10}
                />
              </div>

              <div>
                <Label htmlFor="box-depth">Depth (mm)</Label>
                <Input
                  id="box-depth"
                  type="number"
                  value={boxParams.dimensions.depth}
                  onChange={(e) => setBoxParams({
                    ...boxParams,
                    dimensions: {
                      ...boxParams.dimensions,
                      depth: parseFloat(e.target.value) || 0
                    }
                  })}
                  min={10}
                  step={10}
                />
              </div>

              <div>
                <Label htmlFor="box-thickness">Wall Thickness (mm)</Label>
                <Input
                  id="box-thickness"
                  type="number"
                  value={boxParams.wall_thickness}
                  onChange={(e) => setBoxParams({
                    ...boxParams,
                    wall_thickness: parseFloat(e.target.value) || 0
                  })}
                  min={1}
                  step={1}
                />
              </div>

              <div>
                <Label htmlFor="box-radius">Corner Radius (mm)</Label>
                <Input
                  id="box-radius"
                  type="number"
                  value={boxParams.corner_radius || 0}
                  onChange={(e) => setBoxParams({
                    ...boxParams,
                    corner_radius: parseFloat(e.target.value) || undefined
                  })}
                  min={0}
                  step={1}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="box-lid"
                  checked={boxParams.has_lid}
                  onCheckedChange={(checked) => setBoxParams({
                    ...boxParams,
                    has_lid: checked
                  })}
                />
                <Label htmlFor="box-lid">Include Lid</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="box-holes"
                  checked={boxParams.mounting_holes}
                  onCheckedChange={(checked) => setBoxParams({
                    ...boxParams,
                    mounting_holes: checked
                  })}
                />
                <Label htmlFor="box-holes">Add Mounting Holes</Label>
              </div>
            </div>

            <Button 
              onClick={generateBox} 
              disabled={generating}
              className="w-full"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Box...
                </>
              ) : (
                <>
                  <Box className="w-4 h-4 mr-2" />
                  Generate Box
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Model Generated Successfully!</span>
              {result.mode === 'demo' && (
                <Badge variant="outline" className="ml-2">Demo Mode</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Volume</p>
                <p className="text-2xl font-bold">
                  {(result.properties.volume / 1000000).toFixed(2)} cm³
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Surface Area</p>
                <p className="text-2xl font-bold">
                  {(result.properties.surface_area / 100).toFixed(2)} cm²
                </p>
              </div>
              {result.material && (
                <div>
                  <p className="text-sm font-medium">Material</p>
                  <p className="text-lg font-semibold capitalize">
                    {result.material.type}
                  </p>
                </div>
              )}
              {result.material && (
                <div>
                  <p className="text-sm font-medium">Estimated Mass</p>
                  <p className="text-2xl font-bold">
                    {result.material.mass_kg.toFixed(2)} kg
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Export Options</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={saveModel}
                  disabled={saving}
                  className="bg-primary"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Model
                </Button>
                {result.exports.step && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile('step')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    STEP (CAD)
                  </Button>
                )}
                {result.exports.stl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile('stl')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    STL (3D Print)
                  </Button>
                )}
                {result.exports.gltf && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadFile('gltf')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    GLTF (Web)
                  </Button>
                )}
              </div>
            </div>

            {result.mode === 'demo' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Running in demo mode. Install build123d for full functionality:
                  <code className="block mt-2 p-2 bg-muted rounded text-xs">
                    pip install build123d
                  </code>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ParametricCADBuilder;
