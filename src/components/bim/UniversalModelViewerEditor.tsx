'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ParametricCADBuilder } from '@/components/cad/ParametricCADBuilder';
import type { CADGenerationResult } from '@/types/build123d';
import { IntelligentModelRecognizer, type ModelAnalysis, type ModelConfiguration } from '@/lib/intelligent-model-recognizer';
import { EnhancedBIMProcessor, type BIMAnalysis } from '@/lib/enhanced-bim-processor';
import { 
  Upload, 
  Download, 
  Move, 
  RotateCcw, 
  Maximize2,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Copy,
  Settings,
  Palette,
  Grid3x3,
  Layers,
  Box,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Activity,
  Zap
} from 'lucide-react';

interface UniversalModelViewerEditorProps {
  className?: string;
  onModelLoaded?: (model: THREE.Object3D) => void;
  onModelUpdated?: (model: THREE.Object3D) => void;
  onExport?: (format: string) => void;
  onAnalysisComplete?: (analysis: BIMAnalysis | null) => void;
}

type TransformMode = 'translate' | 'rotate' | 'scale' | null;
type ViewMode = 'view' | 'edit';

export function UniversalModelViewerEditor({
  className = '',
  onModelLoaded,
  onModelUpdated,
  onExport,
  onAnalysisComplete
}: UniversalModelViewerEditorProps) {
  // Core Three.js refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bimProcessorRef = useRef<EnhancedBIMProcessor | null>(null);

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('view');
  const [transformMode, setTransformMode] = useState<TransformMode>(null);
  const [selectedObject, setSelectedObject] = useState<THREE.Object3D | null>(null);
  const [loadedModels, setLoadedModels] = useState<THREE.Object3D[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  
  // Analysis state
  const [modelAnalysis, setModelAnalysis] = useState<ModelAnalysis | null>(null);
  const [bimAnalysis, setBimAnalysis] = useState<BIMAnalysis | null>(null);
  const [analysisReport, setAnalysisReport] = useState<string>('');
  
  // Object properties state
  const [objectPosition, setObjectPosition] = useState({ x: 0, y: 0, z: 0 });
  const [objectRotation, setObjectRotation] = useState({ x: 0, y: 0, z: 0 });
  const [objectScale, setObjectScale] = useState({ x: 1, y: 1, z: 1 });
  const [objectColor, setObjectColor] = useState('#ffffff');
  const [objectOpacity, setObjectOpacity] = useState(1.0);

  // Handle transform changes
  const handleTransformChange = useCallback(() => {
    if (!selectedObject) return;
    
    setObjectPosition({
      x: selectedObject.position.x,
      y: selectedObject.position.y,
      z: selectedObject.position.z
    });
    setObjectRotation({
      x: selectedObject.rotation.x,
      y: selectedObject.rotation.y,
      z: selectedObject.rotation.z
    });
    setObjectScale({
      x: selectedObject.scale.x,
      y: selectedObject.scale.y,
      z: selectedObject.scale.z
    });
    
    onModelUpdated?.(selectedObject);
  }, [selectedObject, onModelUpdated]);

  // Handle object selection
  const handleObjectSelection = useCallback((object: THREE.Object3D) => {
    setSelectedObject(object);
    setViewMode('edit');
    
    // Update property displays
    setObjectPosition({
      x: object.position.x,
      y: object.position.y,
      z: object.position.z
    });
    setObjectRotation({
      x: object.rotation.x,
      y: object.rotation.y,
      z: object.rotation.z
    });
    setObjectScale({
      x: object.scale.x,
      y: object.scale.y,
      z: object.scale.z
    });

    // Get material properties if available
    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshStandardMaterial) {
      setObjectColor(`#${object.material.color.getHexString()}`);
      setObjectOpacity(object.material.opacity);
    }
  }, []);

  // Initialize scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Initialize BIM processor
    bimProcessorRef.current = new EnhancedBIMProcessor(scene);

    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(10, 10, 10);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.name = 'GridHelper';
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    axesHelper.name = 'AxesHelper';
    scene.add(axesHelper);

    // Add orbit controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControlsRef.current = orbitControls;

    // Add transform controls
    const transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
    });
    
    // Note: We'll add the transform controls to the scene later when needed
    // scene.add(transformControls);
    transformControlsRef.current = transformControls;

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // Handle clicks for object selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      if (!mountRef.current || !camera || !scene) return;
      
      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const object = intersects[0].object;
        // Don't select helpers or controls
        if (object.name !== 'GridHelper' && object.name !== 'AxesHelper') {
          handleObjectSelection(object);
        }
      }
    };
    renderer.domElement.addEventListener('click', handleClick);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Store the current mount element for cleanup
    const currentMount = mountRef.current;

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.dispose();
      if (currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, [handleObjectSelection]);

  // Update grid visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    const grid = sceneRef.current.getObjectByName('GridHelper');
    if (grid) grid.visible = showGrid;
  }, [showGrid]);

  // Update axes visibility
  useEffect(() => {
    if (!sceneRef.current) return;
    const axes = sceneRef.current.getObjectByName('AxesHelper');
    if (axes) axes.visible = showAxes;
  }, [showAxes]);

  // Handle transform mode changes
  useEffect(() => {
    if (!transformControlsRef.current || !selectedObject) return;
    
    if (transformMode) {
      transformControlsRef.current.setMode(transformMode);
      transformControlsRef.current.attach(selectedObject);
    } else {
      transformControlsRef.current.detach();
    }
  }, [transformMode, selectedObject]);

  // Load model file with intelligent recognition
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !sceneRef.current) return;

    setLoading(true);
    setProcessing(true);
    setUploadProgress(10);
    
    try {
      console.log('🔍 Analyzing file...');
      
      // Step 1: Intelligent file analysis
      const analysis = await IntelligentModelRecognizer.analyzeFile(file);
      setModelAnalysis(analysis);
      setUploadProgress(20);
      
      console.log('📊 Analysis complete:', analysis);
      
      // Step 2: Generate optimal configuration
      const config = IntelligentModelRecognizer.generateConfiguration(analysis);
      setUploadProgress(30);
      
      // Step 3: Generate analysis report
      const report = IntelligentModelRecognizer.generateReport(analysis, config);
      setAnalysisReport(report);
      console.log(report);
      setUploadProgress(40);
      
      // Step 4: Load model with appropriate loader
      const fileUrl = URL.createObjectURL(file);
      const extension = analysis.fileExtension;
      setUploadProgress(50);

      let loadedObject: THREE.Object3D | null = null;

      console.log(`📦 Loading with ${config.loader.toUpperCase()} loader...`);
      
      if (extension === 'gltf' || extension === 'glb') {
        loadedObject = await loadGLTFModel(fileUrl, file.name);
      } else if (extension === 'obj') {
        loadedObject = await loadOBJModel(fileUrl, file.name);
      } else if (extension === 'fbx') {
        loadedObject = await loadFBXModel(fileUrl, file.name);
      } else if (extension === 'stl') {
        loadedObject = await loadSTLModel(fileUrl, file.name);
      }
      
      setUploadProgress(70);

      if (loadedObject) {
        // Step 5: Apply intelligent configuration
        IntelligentModelRecognizer.applyConfiguration(loadedObject, config, analysis);
        setUploadProgress(80);
        
        // Step 6: Add to scene
        sceneRef.current.add(loadedObject);
        setLoadedModels(prev => [...prev, loadedObject]);
        fitCameraToObject(loadedObject, config);
        setUploadProgress(85);
        
        // Step 7: Run BIM analysis if applicable
        if (analysis.isBIM || analysis.isArchitectural) {
          console.log('🏗️ Running BIM analysis...');
          if (bimProcessorRef.current) {
            const bimAnalysisResult = await bimProcessorRef.current.processModel(loadedObject);
            setBimAnalysis(bimAnalysisResult);
            onAnalysisComplete?.(bimAnalysisResult);
            console.log('✅ BIM analysis complete:', bimAnalysisResult);
          }
        }
        
        setUploadProgress(100);
        onModelLoaded?.(loadedObject);
        
        console.log('✅ Model loaded successfully with intelligent configuration');
      }

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error('❌ Failed to load model:', error);
    } finally {
      setLoading(false);
      setProcessing(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, [onModelLoaded, onAnalysisComplete]);

  // Loader functions
  const loadGLTFModel = async (url: string, name: string): Promise<THREE.Object3D> => {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          gltf.scene.name = name;
          gltf.scene.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          resolve(gltf.scene);
        },
        undefined,
        reject
      );
    });
  };

  const loadOBJModel = async (url: string, name: string): Promise<THREE.Object3D> => {
    const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
    const loader = new OBJLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (object) => {
          object.name = name;
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          resolve(object);
        },
        undefined,
        reject
      );
    });
  };

  const loadFBXModel = async (url: string, name: string): Promise<THREE.Object3D> => {
    const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
    const loader = new FBXLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (object) => {
          object.name = name;
          object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          resolve(object);
        },
        undefined,
        reject
      );
    });
  };

  const loadSTLModel = async (url: string, name: string): Promise<THREE.Object3D> => {
    const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js');
    const loader = new STLLoader();
    
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (geometry) => {
          const material = new THREE.MeshStandardMaterial({ color: 0x888888 });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.name = name;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          resolve(mesh);
        },
        undefined,
        reject
      );
    });
  };

  // Fit camera to object with optional configuration
  const fitCameraToObject = (object: THREE.Object3D, config?: ModelConfiguration) => {
    if (!cameraRef.current || !orbitControlsRef.current) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Use configuration distance if available
    const distanceMultiplier = config ? config.cameraDistance / 20 : 2.5;
    cameraZ *= distanceMultiplier;

    cameraRef.current.position.set(
      center.x + cameraZ * 0.5,
      center.y + cameraZ * 0.5,
      center.z + cameraZ
    );
    cameraRef.current.lookAt(center);
    cameraRef.current.updateProjectionMatrix();

    orbitControlsRef.current.target.copy(center);
    orbitControlsRef.current.update();
  };

  // Handle CAD model generation
  const handleCADModelGenerated = useCallback(async (result: CADGenerationResult) => {
    if (!sceneRef.current || !result.exports.gltf) return;

    setLoading(true);
    try {
      // Load the generated GLTF model
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const loader = new GLTFLoader();
      
      const gltf = await new Promise<any>((resolve, reject) => {
        loader.load(result.exports.gltf!, resolve, undefined, reject);
      });
      
      const loadedObject = gltf.scene;
      loadedObject.name = result.model_type;
      loadedObject.traverse((child: any) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      if (loadedObject) {
        sceneRef.current.add(loadedObject);
        setLoadedModels(prev => [...prev, loadedObject]);
        
        // Fit camera to object
        if (cameraRef.current && orbitControlsRef.current) {
          const box = new THREE.Box3().setFromObject(loadedObject);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          
          const maxDim = Math.max(size.x, size.y, size.z);
          const fov = cameraRef.current.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ *= 1.5;
          
          cameraRef.current.position.set(center.x + cameraZ, center.y + cameraZ, center.z + cameraZ);
          cameraRef.current.lookAt(center);
          cameraRef.current.updateProjectionMatrix();
          
          orbitControlsRef.current.target.copy(center);
          orbitControlsRef.current.update();
        }
        
        onModelLoaded?.(loadedObject);
      }
    } catch (error) {
      console.error('Failed to load CAD model:', error);
    } finally {
      setLoading(false);
    }
  }, [onModelLoaded]);

  // Update object properties
  const updateObjectProperty = useCallback((property: string, axis: 'x' | 'y' | 'z', value: number) => {
    if (!selectedObject) return;

    if (property === 'position') {
      selectedObject.position[axis] = value;
      setObjectPosition(prev => ({ ...prev, [axis]: value }));
    } else if (property === 'rotation') {
      selectedObject.rotation[axis] = value;
      setObjectRotation(prev => ({ ...prev, [axis]: value }));
    } else if (property === 'scale') {
      selectedObject.scale[axis] = value;
      setObjectScale(prev => ({ ...prev, [axis]: value }));
    }

    onModelUpdated?.(selectedObject);
  }, [selectedObject, onModelUpdated]);

  // Update object color
  const updateObjectColor = useCallback((color: string) => {
    if (!selectedObject || !(selectedObject instanceof THREE.Mesh)) return;

    const material = selectedObject.material as THREE.MeshStandardMaterial;
    material.color.setStyle(color);
    setObjectColor(color);
    onModelUpdated?.(selectedObject);
  }, [selectedObject, onModelUpdated]);

  // Update object opacity
  const updateObjectOpacity = useCallback((opacity: number) => {
    if (!selectedObject || !(selectedObject instanceof THREE.Mesh)) return;

    const material = selectedObject.material as THREE.MeshStandardMaterial;
    material.opacity = opacity;
    material.transparent = opacity < 1;
    setObjectOpacity(opacity);
    onModelUpdated?.(selectedObject);
  }, [selectedObject, onModelUpdated]);

  // Delete selected object
  const deleteSelectedObject = useCallback(() => {
    if (!selectedObject || !sceneRef.current) return;

    sceneRef.current.remove(selectedObject);
    setLoadedModels(prev => prev.filter(obj => obj !== selectedObject));
    setSelectedObject(null);
    setViewMode('view');
    
    if (transformControlsRef.current) {
      transformControlsRef.current.detach();
    }
  }, [selectedObject]);

  // Reset camera
  const resetCamera = useCallback(() => {
    if (!cameraRef.current || !orbitControlsRef.current) return;

    cameraRef.current.position.set(10, 10, 10);
    cameraRef.current.lookAt(0, 0, 0);
    orbitControlsRef.current.target.set(0, 0, 0);
    orbitControlsRef.current.update();
  }, []);

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* 3D Viewport */}
      <div className="flex-1 relative bg-slate-100">
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />
        
        {/* Toolbar */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <Card className="p-2">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={viewMode === 'view' ? 'default' : 'outline'}
                onClick={() => setViewMode('view')}
                title="View Mode"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'edit' ? 'default' : 'outline'}
                onClick={() => setViewMode('edit')}
                title="Edit Mode"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {viewMode === 'edit' && selectedObject && (
            <Card className="p-2">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={transformMode === 'translate' ? 'default' : 'outline'}
                  onClick={() => setTransformMode(transformMode === 'translate' ? null : 'translate')}
                  title="Move"
                >
                  <Move className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={transformMode === 'rotate' ? 'default' : 'outline'}
                  onClick={() => setTransformMode(transformMode === 'rotate' ? null : 'rotate')}
                  title="Rotate"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant={transformMode === 'scale' ? 'default' : 'outline'}
                  onClick={() => setTransformMode(transformMode === 'scale' ? null : 'scale')}
                  title="Scale"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* View Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Card className="p-2">
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowGrid(!showGrid)}
                title="Toggle Grid"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAxes(!showAxes)}
                title="Toggle Axes"
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={resetCamera}
                title="Reset Camera"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            {processing && (
              <div className="w-64 space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {uploadProgress < 20 ? 'Analyzing file...' :
                   uploadProgress < 40 ? 'Generating configuration...' :
                   uploadProgress < 70 ? 'Loading model...' :
                   uploadProgress < 85 ? 'Applying settings...' :
                   'Running analysis...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Side Panel */}
      <div className="w-80 border-l bg-background overflow-y-auto">
        <Tabs defaultValue="models" className="h-full">
          <TabsList className="grid w-full grid-cols-5 text-xs">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="analysis">
              <Activity className="h-3 w-3 mr-1" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="cad">
              <Sparkles className="h-3 w-3 mr-1" />
              CAD
            </TabsTrigger>
            <TabsTrigger value="properties">Props</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="p-4 space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Model Analysis</h3>
              {modelAnalysis ? (
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        File Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">{modelAnalysis.fileType}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size:</span>
                        <span>{(modelAnalysis.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Complexity:</span>
                        <Badge variant={modelAnalysis.complexity === 'very-high' || modelAnalysis.complexity === 'high' ? 'destructive' : 'secondary'}>
                          {modelAnalysis.complexity.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs">Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-1 text-xs">
                      {modelAnalysis.isBIM && <Badge variant="default" className="mr-1">BIM</Badge>}
                      {modelAnalysis.isCAD && <Badge variant="default" className="mr-1">CAD</Badge>}
                      {modelAnalysis.isArchitectural && <Badge variant="secondary" className="mr-1">Architectural</Badge>}
                      {modelAnalysis.isStructural && <Badge variant="secondary" className="mr-1">Structural</Badge>}
                      {modelAnalysis.isMEP && <Badge variant="secondary" className="mr-1">MEP</Badge>}
                      {modelAnalysis.isManufacturing && <Badge variant="secondary" className="mr-1">Manufacturing</Badge>}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="p-3">
                      <CardTitle className="text-xs">Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vertices:</span>
                        <span>{modelAnalysis.estimatedVertexCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Polygons:</span>
                        <span>{modelAnalysis.estimatedPolygonCount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Units:</span>
                        <span>{modelAnalysis.detectedUnits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Coord System:</span>
                        <span>{modelAnalysis.coordinateSystem}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {bimAnalysis && (
                    <>
                      <Card>
                        <CardHeader className="p-3">
                          <CardTitle className="text-xs flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            BIM Analysis
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Quality Score:</span>
                            <Badge variant={bimAnalysis.qualityScore >= 80 ? 'default' : 'destructive'}>
                              {bimAnalysis.qualityScore.toFixed(0)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Elements:</span>
                            <span>{bimAnalysis.totalElements}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Clashes:</span>
                            <Badge variant={bimAnalysis.clashes.length > 0 ? 'destructive' : 'default'}>
                              {bimAnalysis.clashes.length}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Issues:</span>
                            <Badge variant={bimAnalysis.issuesFound.length > 5 ? 'destructive' : 'secondary'}>
                              {bimAnalysis.issuesFound.length}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="p-3">
                          <CardTitle className="text-xs">Building Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 pt-0 space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Height:</span>
                            <span>{bimAnalysis.buildingHeight.toFixed(2)}m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Footprint:</span>
                            <span>{bimAnalysis.footprintArea.toFixed(2)}m²</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Volume:</span>
                            <span>{bimAnalysis.totalVolume.toFixed(2)}m³</span>
                          </div>
                        </CardContent>
                      </Card>

                      {bimAnalysis.clashes.length > 0 && (
                        <Card>
                          <CardHeader className="p-3">
                            <CardTitle className="text-xs flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              Clashes Detected
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-3 pt-0 space-y-2">
                            {bimAnalysis.clashes.slice(0, 5).map((clash) => (
                              <div key={clash.id} className="text-xs p-2 bg-muted rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <Badge variant={clash.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                    {clash.severity}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{clash.type}</span>
                                </div>
                                <p className="text-xs">{clash.description}</p>
                              </div>
                            ))}
                            {bimAnalysis.clashes.length > 5 && (
                              <p className="text-xs text-muted-foreground">
                                +{bimAnalysis.clashes.length - 5} more clashes
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}

                  {analysisReport && (
                    <Card>
                      <CardHeader className="p-3">
                        <CardTitle className="text-xs">Full Report</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded overflow-auto max-h-60">
                          {analysisReport}
                        </pre>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Upload a model to see detailed analysis
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="cad" className="p-4 space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Parametric CAD Builder</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Generate 3D models programmatically
              </p>
            </div>
            <ParametricCADBuilder
              onModelGenerated={handleCADModelGenerated}
              className="border-0 shadow-none"
            />
          </TabsContent>

          <TabsContent value="models" className="p-4 space-y-4">
            <div>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary transition-colors text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload Model</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    GLTF, GLB, OBJ, FBX, STL
                  </p>
                </div>
              </Label>
              <input
                id="file-upload"
                type="file"
                accept=".gltf,.glb,.obj,.fbx,.stl"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-sm">Loaded Models ({loadedModels.length})</h3>
              {loadedModels.map((model, index) => (
                <div
                  key={index}
                  className={`p-2 border rounded cursor-pointer hover:bg-muted transition-colors ${
                    selectedObject === model ? 'bg-primary/10 border-primary' : ''
                  }`}
                  onClick={() => handleObjectSelection(model)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{model.name || `Model ${index + 1}`}</span>
                    <Badge variant="secondary" className="text-xs">
                      {model.type}
                    </Badge>
                  </div>
                </div>
              ))}
              {loadedModels.length === 0 && (
                <p className="text-xs text-muted-foreground">No models loaded yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="properties" className="p-4 space-y-4">
            {selectedObject ? (
              <>
                <div>
                  <h3 className="font-medium text-sm mb-2">Object: {selectedObject.name}</h3>
                  <Badge>{selectedObject.type}</Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Position</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <Label htmlFor="pos-x" className="text-xs text-muted-foreground">X</Label>
                        <Input
                          id="pos-x"
                          type="number"
                          step="0.1"
                          value={objectPosition.x.toFixed(2)}
                          onChange={(e) => updateObjectProperty('position', 'x', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pos-y" className="text-xs text-muted-foreground">Y</Label>
                        <Input
                          id="pos-y"
                          type="number"
                          step="0.1"
                          value={objectPosition.y.toFixed(2)}
                          onChange={(e) => updateObjectProperty('position', 'y', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pos-z" className="text-xs text-muted-foreground">Z</Label>
                        <Input
                          id="pos-z"
                          type="number"
                          step="0.1"
                          value={objectPosition.z.toFixed(2)}
                          onChange={(e) => updateObjectProperty('position', 'z', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Rotation (radians)</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <Label htmlFor="rot-x" className="text-xs text-muted-foreground">X</Label>
                        <Input
                          id="rot-x"
                          type="number"
                          step="0.1"
                          value={objectRotation.x.toFixed(2)}
                          onChange={(e) => updateObjectProperty('rotation', 'x', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rot-y" className="text-xs text-muted-foreground">Y</Label>
                        <Input
                          id="rot-y"
                          type="number"
                          step="0.1"
                          value={objectRotation.y.toFixed(2)}
                          onChange={(e) => updateObjectProperty('rotation', 'y', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rot-z" className="text-xs text-muted-foreground">Z</Label>
                        <Input
                          id="rot-z"
                          type="number"
                          step="0.1"
                          value={objectRotation.z.toFixed(2)}
                          onChange={(e) => updateObjectProperty('rotation', 'z', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Scale</Label>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <Label htmlFor="scale-x" className="text-xs text-muted-foreground">X</Label>
                        <Input
                          id="scale-x"
                          type="number"
                          step="0.1"
                          value={objectScale.x.toFixed(2)}
                          onChange={(e) => updateObjectProperty('scale', 'x', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scale-y" className="text-xs text-muted-foreground">Y</Label>
                        <Input
                          id="scale-y"
                          type="number"
                          step="0.1"
                          value={objectScale.y.toFixed(2)}
                          onChange={(e) => updateObjectProperty('scale', 'y', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scale-z" className="text-xs text-muted-foreground">Z</Label>
                        <Input
                          id="scale-z"
                          type="number"
                          step="0.1"
                          value={objectScale.z.toFixed(2)}
                          onChange={(e) => updateObjectProperty('scale', 'z', parseFloat(e.target.value))}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>

                  {selectedObject instanceof THREE.Mesh && (
                    <>
                      <div>
                        <Label htmlFor="color" className="text-xs">Color</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            id="color"
                            type="color"
                            value={objectColor}
                            onChange={(e) => updateObjectColor(e.target.value)}
                            className="h-8 w-16"
                          />
                          <Input
                            type="text"
                            value={objectColor}
                            onChange={(e) => updateObjectColor(e.target.value)}
                            className="h-8 flex-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="opacity" className="text-xs">Opacity: {objectOpacity.toFixed(2)}</Label>
                        <Slider
                          id="opacity"
                          min={0}
                          max={1}
                          step={0.01}
                          value={[objectOpacity]}
                          onValueChange={(value) => updateObjectOpacity(value[0])}
                          className="mt-2"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={deleteSelectedObject}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled
                    title="Duplication feature coming soon"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-8">
                <Box className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select an object to edit its properties</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="export" className="p-4 space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Export Options</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Export your model in various formats
              </p>
              
              <div className="space-y-2">
                {['GLTF', 'GLB', 'OBJ', 'STL', 'FBX'].map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => onExport?.(format)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export as {format}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
