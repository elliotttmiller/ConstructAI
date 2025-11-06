/**
 * Visual Overlay System for Blueprint Element Detection
 * Renders detected elements directly on the original blueprint image
 */

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Eye,
  EyeOff,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Palette,
  Square,
  Circle,
  Minus
} from 'lucide-react';

export interface DetectedElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'room' | 'text' | 'dimension' | 'stair' | 'fixture';
  confidence: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  label?: string;
  properties?: Record<string, any>;
}

export interface OverlayConfig {
  showElements: boolean;
  showLabels: boolean;
  showConfidence: boolean;
  opacity: number;
  elementTypes: Record<string, boolean>;
  colorScheme: 'default' | 'colorBlind' | 'contrast' | 'professional';
}

interface BlueprintOverlayProps {
  imageFile: File;
  detectedElements: DetectedElement[];
  onElementClick?: (element: DetectedElement) => void;
  onElementEdit?: (elementId: string, updates: Partial<DetectedElement>) => void;
  className?: string;
}

const ELEMENT_COLORS = {
  default: {
    wall: '#ef4444',      // Red
    door: '#22c55e',      // Green
    window: '#3b82f6',    // Blue
    room: '#a855f7',      // Purple
    text: '#f59e0b',      // Amber
    dimension: '#10b981', // Emerald
    stair: '#f97316',     // Orange
    fixture: '#ec4899'    // Pink
  },
  professional: {
    wall: '#1e40af',      // Professional blue
    door: '#059669',      // Professional green
    window: '#0891b2',    // Professional cyan
    room: '#7c3aed',      // Professional purple
    text: '#d97706',      // Professional orange
    dimension: '#047857', // Professional emerald
    stair: '#dc2626',     // Professional red
    fixture: '#be185d'    // Professional pink
  },
  colorBlind: {
    wall: '#000000',      // Black
    door: '#0000ff',      // Blue
    window: '#ff0000',    // Red
    room: '#008000',      // Green
    text: '#800080',      // Purple
    dimension: '#ffa500', // Orange
    stair: '#a52a2a',     // Brown
    fixture: '#ff1493'    // Deep pink
  },
  contrast: {
    wall: '#ffffff',      // White
    door: '#ffff00',      // Yellow
    window: '#00ffff',    // Cyan
    room: '#ff00ff',      // Magenta
    text: '#00ff00',      // Lime
    dimension: '#ff8000', // Orange
    stair: '#8000ff',     // Violet
    fixture: '#ff0080'    // Rose
  }
};

export default function BlueprintOverlay({
  imageFile,
  detectedElements,
  onElementClick,
  onElementEdit,
  className = ''
}: BlueprintOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectedElement, setSelectedElement] = useState<DetectedElement | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [overlayConfig, setOverlayConfig] = useState<OverlayConfig>({
    showElements: true,
    showLabels: true,
    showConfidence: false,
    opacity: 0.7,
    elementTypes: {
      wall: true,
      door: true,
      window: true,
      room: true,
      text: true,
      dimension: true,
      stair: true,
      fixture: true
    },
    colorScheme: 'default'
  });

  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Load and draw the image with overlays
  useEffect(() => {
    if (!imageFile || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Calculate optimal canvas size
      const container = containerRef.current;
      if (!container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      const aspectRatio = img.width / img.height;

      let displayWidth = containerWidth;
      let displayHeight = containerWidth / aspectRatio;

      if (displayHeight > containerHeight) {
        displayHeight = containerHeight;
        displayWidth = containerHeight * aspectRatio;
      }

      canvas.width = displayWidth;
      canvas.height = displayHeight;
      setCanvasSize({ width: displayWidth, height: displayHeight });

      // Clear and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      setImageLoaded(true);
      drawOverlays(ctx, displayWidth / img.width, displayHeight / img.height);
    };

    img.src = URL.createObjectURL(imageFile);

    return () => {
      URL.revokeObjectURL(img.src);
    };
  }, [imageFile, overlayConfig, detectedElements]);

  // Draw element overlays
  const drawOverlays = (ctx: CanvasRenderingContext2D, scaleX: number, scaleY: number) => {
    if (!overlayConfig.showElements) return;

    const colors = ELEMENT_COLORS[overlayConfig.colorScheme];

    detectedElements.forEach((element) => {
      if (!overlayConfig.elementTypes[element.type]) return;

      const x = element.bounds.x * scaleX;
      const y = element.bounds.y * scaleY;
      const width = element.bounds.width * scaleX;
      const height = element.bounds.height * scaleY;

      // Set drawing properties
      ctx.globalAlpha = overlayConfig.opacity;
      ctx.strokeStyle = colors[element.type];
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      // Draw bounding box
      ctx.strokeRect(x, y, width, height);

      // Draw element-specific shapes
      if (element.type === 'door') {
        // Draw door swing arc
        ctx.beginPath();
        ctx.arc(x, y + height, width, -Math.PI/2, 0);
        ctx.setLineDash([5, 5]);
        ctx.stroke();
      } else if (element.type === 'window') {
        // Draw window sill lines
        ctx.beginPath();
        ctx.moveTo(x, y + height/2);
        ctx.lineTo(x + width, y + height/2);
        ctx.stroke();
      } else if (element.type === 'room') {
        // Draw room fill with low opacity
        ctx.globalAlpha = overlayConfig.opacity * 0.3;
        ctx.fillStyle = colors[element.type];
        ctx.fillRect(x, y, width, height);
        ctx.globalAlpha = overlayConfig.opacity;
      }

      // Draw labels
      if (overlayConfig.showLabels && element.label) {
        const labelX = x + width / 2;
        const labelY = y - 5;

        ctx.font = '12px Arial';
        ctx.fillStyle = colors[element.type];
        ctx.textAlign = 'center';
        ctx.fillText(element.label, labelX, labelY);

        // Draw confidence if enabled
        if (overlayConfig.showConfidence) {
          const confidenceText = `${Math.round(element.confidence)}%`;
          ctx.font = '10px Arial';
          ctx.fillText(confidenceText, labelX, labelY + 15);
        }
      }

      // Highlight selected element
      if (selectedElement?.id === element.id) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(x - 2, y - 2, width + 4, height + 4);
      }
    });

    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
  };

  // Handle canvas clicks for element selection
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find clicked element
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = x * scaleX;
    const clickY = y * scaleY;

    const clickedElement = detectedElements.find((element) => {
      if (!overlayConfig.elementTypes[element.type]) return false;

      const elementX = element.bounds.x * (canvas.width / 1920); // Assuming original image width
      const elementY = element.bounds.y * (canvas.height / 1080); // Assuming original image height
      const elementWidth = element.bounds.width * (canvas.width / 1920);
      const elementHeight = element.bounds.height * (canvas.height / 1080);

      return (
        clickX >= elementX &&
        clickX <= elementX + elementWidth &&
        clickY >= elementY &&
        clickY <= elementY + elementHeight
      );
    });

    if (clickedElement) {
      setSelectedElement(clickedElement);
      onElementClick?.(clickedElement);
    } else {
      setSelectedElement(null);
    }
  };

  // Toggle element type visibility
  const toggleElementType = (type: string) => {
    setOverlayConfig(prev => ({
      ...prev,
      elementTypes: {
        ...prev.elementTypes,
        [type]: !prev.elementTypes[type]
      }
    }));
  };

  // Export annotated image
  const exportAnnotatedImage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `annotated-${imageFile.name}`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Reset view
  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const elementTypeCounts = detectedElements.reduce((counts, element) => {
    counts[element.type] = (counts[element.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Blueprint Analysis Overlay
            <Badge variant="outline">
              {detectedElements.length} elements
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOverlayConfig(prev => ({ ...prev, showElements: !prev.showElements }))}
            >
              {overlayConfig.showElements ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {overlayConfig.showElements ? 'Hide' : 'Show'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportAnnotatedImage}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Control Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
          {/* Display Controls */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Display Controls</h4>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Opacity</span>
                <span className="text-xs">{Math.round(overlayConfig.opacity * 100)}%</span>
              </div>
              <Slider
                value={[overlayConfig.opacity]}
                onValueChange={([value]) => setOverlayConfig(prev => ({ ...prev, opacity: value }))}
                max={1}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={overlayConfig.showLabels ? "default" : "outline"}
                size="sm"
                onClick={() => setOverlayConfig(prev => ({ ...prev, showLabels: !prev.showLabels }))}
              >
                Labels
              </Button>
              <Button
                variant={overlayConfig.showConfidence ? "default" : "outline"}
                size="sm"
                onClick={() => setOverlayConfig(prev => ({ ...prev, showConfidence: !prev.showConfidence }))}
              >
                Confidence
              </Button>
            </div>
          </div>

          {/* Element Types */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Element Types</h4>
            <div className="grid grid-cols-2 gap-1">
              {Object.entries(elementTypeCounts).map(([type, count]) => (
                <Button
                  key={type}
                  variant={overlayConfig.elementTypes[type] ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleElementType(type)}
                  className="justify-between text-xs"
                >
                  <span className="capitalize">{type}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Color Schemes */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Color Scheme</h4>
            <div className="space-y-1">
              {Object.keys(ELEMENT_COLORS).map((scheme) => (
                <Button
                  key={scheme}
                  variant={overlayConfig.colorScheme === scheme ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOverlayConfig(prev => ({ ...prev, colorScheme: scheme as any }))}
                  className="w-full text-xs justify-start"
                >
                  <Palette className="h-3 w-3 mr-2" />
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Container */}
        <div
          ref={containerRef}
          className="relative border rounded-lg overflow-hidden bg-gray-50"
          style={{ height: '600px' }}
        >
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="cursor-crosshair"
            style={{
              transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
              transformOrigin: 'top left'
            }}
          />

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}
              className="bg-white/90"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.5))}
              className="bg-white/90"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetView}
              className="bg-white/90"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Selected Element Info - Moved to top-right */}
          {selectedElement && (
            <div className="absolute top-4 right-4 p-3 bg-white/95 rounded-lg shadow-lg border max-w-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: ELEMENT_COLORS[overlayConfig.colorScheme][selectedElement.type] }}
                    />
                    <span className="font-medium capitalize">{selectedElement.type}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {Math.round(selectedElement.confidence)}%
                  </Badge>
                </div>
                {selectedElement.label && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Label:</span> {selectedElement.label}
                  </div>
                )}
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Size:</span> {selectedElement.bounds.width} × {selectedElement.bounds.height}px
                </div>
                {selectedElement.properties && Object.keys(selectedElement.properties).length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {Object.entries(selectedElement.properties).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium capitalize">{key}:</span> {String(value)}
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedElement(null)}
                  className="h-6 px-2 text-xs"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <div className="text-sm text-muted-foreground">Loading blueprint...</div>
              </div>
            </div>
          )}
        </div>

        {/* Element Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
          {Object.entries(elementTypeCounts).map(([type, count]) => (
            <div key={type} className="text-center">
              <div
                className="w-4 h-4 rounded mx-auto mb-1"
                style={{ backgroundColor: ELEMENT_COLORS[overlayConfig.colorScheme][type as keyof typeof ELEMENT_COLORS['default']] }}
              />
              <div className="text-lg font-semibold">{count}</div>
              <div className="text-xs text-muted-foreground capitalize">{type}s</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
