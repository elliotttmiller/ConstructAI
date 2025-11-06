'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronDown,
  ChevronRight,
  Circle,
  Search,
  Filter,
  MoreVertical,
  Palette
} from 'lucide-react';
import * as THREE from 'three';

// Layer data structure
export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  color: string;
  opacity: number;
  objectCount: number;
  children?: Layer[];
  parent?: string;
  meshes: THREE.Mesh[];
  type: 'group' | 'mesh' | 'structural' | 'mechanical' | 'electrical' | 'architectural';
}

interface LayerManagerProps {
  scene: THREE.Scene | null;
  onLayerSelect?: (layer: Layer | null) => void;
  onLayerVisibilityChange?: (layerId: string, visible: boolean) => void;
  onLayerLockChange?: (layerId: string, locked: boolean) => void;
  className?: string;
}

export const LayerManager: React.FC<LayerManagerProps> = ({
  scene,
  onLayerSelect,
  onLayerVisibilityChange,
  onLayerLockChange,
  className = ''
}) => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Extract layers from Three.js scene
  const extractLayers = (scene: THREE.Scene | null): Layer[] => {
    if (!scene) return [];

    const layerMap = new Map<string, Layer>();
    const rootLayers: Layer[] = [];

    // Traverse scene and organize by userData.layer or name
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Group) {
        const layerName = object.userData.layer || object.userData.type || object.name || 'Default';
        const layerId = `layer_${layerName.toLowerCase().replace(/\s+/g, '_')}`;

        if (!layerMap.has(layerId)) {
          const layer: Layer = {
            id: layerId,
            name: layerName,
            visible: object.visible,
            locked: false,
            color: '#3b82f6',
            opacity: 1,
            objectCount: 0,
            meshes: [],
            type: determineLayerType(layerName),
            children: []
          };
          layerMap.set(layerId, layer);
          rootLayers.push(layer);
        }

        const layer = layerMap.get(layerId)!;
        layer.objectCount++;
        if (object instanceof THREE.Mesh) {
          layer.meshes.push(object);
        }
      }
    });

    return rootLayers;
  };

  const determineLayerType = (name: string): Layer['type'] => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('structural') || nameLower.includes('column') || nameLower.includes('beam')) {
      return 'structural';
    } else if (nameLower.includes('mechanical') || nameLower.includes('hvac') || nameLower.includes('pipe')) {
      return 'mechanical';
    } else if (nameLower.includes('electrical') || nameLower.includes('wire') || nameLower.includes('conduit')) {
      return 'electrical';
    } else if (nameLower.includes('architectural') || nameLower.includes('wall') || nameLower.includes('floor')) {
      return 'architectural';
    } else if (nameLower.includes('group')) {
      return 'group';
    }
    return 'mesh';
  };

  const getLayerTypeIcon = (type: Layer['type']) => {
    switch (type) {
      case 'structural':
        return <Circle className="w-3 h-3 fill-blue-500 text-blue-500" />;
      case 'mechanical':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />;
      case 'electrical':
        return <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />;
      case 'architectural':
        return <Circle className="w-3 h-3 fill-purple-500 text-purple-500" />;
      case 'group':
        return <Circle className="w-3 h-3 fill-gray-500 text-gray-500" />;
      default:
        return <Circle className="w-3 h-3 fill-slate-500 text-slate-500" />;
    }
  };

  // Update layers when scene changes
  useEffect(() => {
    if (scene) {
      const extractedLayers = extractLayers(scene);
      setLayers(extractedLayers);
    }
  }, [scene]);

  // Handle layer selection with outline effect
  const handleLayerClick = (layer: Layer) => {
    setSelectedLayer(layer);
    
    // Clear previous outlines
    if (scene) {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // Remove outline
          object.userData.outlined = false;
          
          // Restore original material if it was replaced
          if (object.userData.originalMaterial) {
            object.material = object.userData.originalMaterial;
            delete object.userData.originalMaterial;
          }
        }
      });
    }

    // Apply outline to selected layer meshes
    layer.meshes.forEach((mesh) => {
      mesh.userData.outlined = true;
      
      // Store original material
      if (!mesh.userData.originalMaterial) {
        mesh.userData.originalMaterial = mesh.material;
      }

      // Create outline material with emissive glow
      const outlineMaterial = mesh.material instanceof THREE.Material 
        ? (mesh.material as THREE.MeshStandardMaterial).clone()
        : new THREE.MeshStandardMaterial();
      
      if (outlineMaterial instanceof THREE.MeshStandardMaterial) {
        outlineMaterial.emissive = new THREE.Color(0x00ff88);
        outlineMaterial.emissiveIntensity = 0.5;
        outlineMaterial.transparent = true;
        outlineMaterial.opacity = 0.9;
      }

      mesh.material = outlineMaterial;
    });

    onLayerSelect?.(layer);
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setLayers(prevLayers => 
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          const newVisible = !layer.visible;
          
          // Update Three.js objects
          layer.meshes.forEach(mesh => {
            mesh.visible = newVisible;
          });

          onLayerVisibilityChange?.(layerId, newVisible);

          return { ...layer, visible: newVisible };
        }
        return layer;
      })
    );
  };

  // Toggle layer lock
  const toggleLayerLock = (layerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setLayers(prevLayers =>
      prevLayers.map(layer => {
        if (layer.id === layerId) {
          const newLocked = !layer.locked;
          onLayerLockChange?.(layerId, newLocked);
          return { ...layer, locked: newLocked };
        }
        return layer;
      })
    );
  };

  // Toggle layer expansion
  const toggleLayerExpansion = (layerId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    setExpandedLayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(layerId)) {
        newSet.delete(layerId);
      } else {
        newSet.add(layerId);
      }
      return newSet;
    });
  };

  // Filter layers
  const filteredLayers = layers.filter(layer => {
    const matchesSearch = layer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || layer.type === filterType;
    return matchesSearch && matchesType;
  });

  // Render layer item
  const renderLayerItem = (layer: Layer, depth = 0) => {
    const isExpanded = expandedLayers.has(layer.id);
    const isSelected = selectedLayer?.id === layer.id;
    const hasChildren = layer.children && layer.children.length > 0;

    return (
      <div key={layer.id} className="select-none">
        <div
          className={`
            flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer
            transition-all duration-200 hover:bg-muted/50
            ${isSelected ? 'bg-primary/20 ring-1 ring-primary/50' : ''}
            ${layer.locked ? 'opacity-60' : ''}
          `}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => handleLayerClick(layer)}
        >
          {/* Expand/Collapse */}
          {hasChildren && (
            <button
              onClick={(e) => toggleLayerExpansion(layer.id, e)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>
          )}
          
          {!hasChildren && <div className="w-4" />}

          {/* Layer Type Icon */}
          <div className="flex-shrink-0">
            {getLayerTypeIcon(layer.type)}
          </div>

          {/* Layer Name */}
          <span className="flex-1 text-sm truncate font-medium">
            {layer.name}
          </span>

          {/* Object Count */}
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {layer.objectCount}
          </Badge>

          {/* Visibility Toggle */}
          <button
            onClick={(e) => toggleLayerVisibility(layer.id, e)}
            className="p-1 hover:bg-muted rounded"
            title={layer.visible ? 'Hide layer' : 'Show layer'}
          >
            {layer.visible ? (
              <Eye className="w-3.5 h-3.5" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          {/* Lock Toggle */}
          <button
            onClick={(e) => toggleLayerLock(layer.id, e)}
            className="p-1 hover:bg-muted rounded"
            title={layer.locked ? 'Unlock layer' : 'Lock layer'}
          >
            {layer.locked ? (
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <Unlock className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {layer.children!.map(child => renderLayerItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <CardTitle className="text-base">Layer Manager</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {layers.length} layers
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Select layers to highlight with glowing outline
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search layers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
              className="h-7 text-xs"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterType === 'structural' ? 'default' : 'outline'}
              onClick={() => setFilterType('structural')}
              className="h-7 text-xs"
            >
              <Circle className="w-2.5 h-2.5 fill-blue-500 text-blue-500 mr-1" />
              Structural
            </Button>
            <Button
              size="sm"
              variant={filterType === 'mechanical' ? 'default' : 'outline'}
              onClick={() => setFilterType('mechanical')}
              className="h-7 text-xs"
            >
              <Circle className="w-2.5 h-2.5 fill-green-500 text-green-500 mr-1" />
              MEP
            </Button>
            <Button
              size="sm"
              variant={filterType === 'architectural' ? 'default' : 'outline'}
              onClick={() => setFilterType('architectural')}
              className="h-7 text-xs"
            >
              <Circle className="w-2.5 h-2.5 fill-purple-500 text-purple-500 mr-1" />
              Arch
            </Button>
          </div>
        </div>

        <Separator />

        {/* Layer List */}
        <div className="space-y-0.5 max-h-96 overflow-y-auto pr-1">
          {filteredLayers.length > 0 ? (
            filteredLayers.map(layer => renderLayerItem(layer))
          ) : (
            <div className="text-center py-8 text-sm text-muted-foreground">
              {searchTerm ? 'No layers match your search' : 'No layers found in scene'}
            </div>
          )}
        </div>

        {/* Selected Layer Info */}
        {selectedLayer && (
          <>
            <Separator />
            <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">Selected Layer</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedLayer.type}
                </Badge>
              </div>
              <div className="text-sm font-medium">{selectedLayer.name}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Objects:</span>
                  <span className="ml-1 font-medium">{selectedLayer.objectCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <span className="ml-1 font-medium">
                    {selectedLayer.visible ? 'Visible' : 'Hidden'}
                    {selectedLayer.locked && ' • Locked'}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-muted-foreground mb-1">
                  ✨ Glowing outline active
                </div>
              </div>
            </div>
          </>
        )}

        {/* Quick Actions */}
        <Separator />
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              layers.forEach(layer => {
                layer.meshes.forEach(mesh => mesh.visible = true);
              });
              setLayers(layers.map(l => ({ ...l, visible: true })));
            }}
            className="flex-1 h-8 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            Show All
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              layers.forEach(layer => {
                layer.meshes.forEach(mesh => mesh.visible = false);
              });
              setLayers(layers.map(l => ({ ...l, visible: false })));
            }}
            className="flex-1 h-8 text-xs"
          >
            <EyeOff className="w-3 h-3 mr-1" />
            Hide All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LayerManager;
