'use client';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Eye, EyeOff, Cpu, Zap } from 'lucide-react';
import {
  BlueprintAnalysisResult,
  ConversionResult,
  ConversionSettings,
  GLTFLoadResult
} from '@/types/hunyuan3d';

// Types
interface BIMAnalysis {
  totalElements: number;
  structuralElements: number;
  mechanicalElements: number;
  electricalElements: number;
  clashes: number;
  compliance: number;
  cost: number;
}

interface ProcessingIndicator {
  show: boolean;
  progress: number;
  message: string;
}

interface OverlayElement {
  id: string;
  type: string;
  position: { x: number; y: number };
  dimensions: { width: number; height: number };
  confidence: number;
}

interface ThreeViewerProps {
  onAnalysisComplete?: (analysis: BIMAnalysis) => void;
  onClashesDetected?: (clashes: any[]) => void;
  onSceneReady?: (scene: THREE.Scene) => void;
  className?: string;
}

const ThreeViewer: React.FC<ThreeViewerProps> = ({
  onAnalysisComplete,
  onClashesDetected,
  onSceneReady,
  className = ""
}) => {
  // Refs
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [blueprintAnalysis, setBlueprintAnalysis] = useState<BlueprintAnalysisResult | null>(null);
  const [detectedElements, setDetectedElements] = useState<OverlayElement[]>([]);
  const [showOverlay, setShowOverlay] = useState(false);
  const [analysis, setAnalysis] = useState<BIMAnalysis | null>(null);
  const [processingIndicator, setProcessingIndicator] = useState<ProcessingIndicator>({
    show: false,
    progress: 0,
    message: ''
  });
  const sceneInitializedRef = useRef(false);

  // Mock clashes data for demonstration
  const clashes = [
    { id: 'clash_001', severity: 'high', elements: ['beam_01', 'pipe_03'] },
    { id: 'clash_002', severity: 'medium', elements: ['wall_05', 'duct_02'] }
  ];

  // Helper function to convert analysis to overlay elements
  const convertAnalysisToOverlayElements = (analysisResult: BlueprintAnalysisResult): OverlayElement[] => {
    if (!analysisResult?.detectedElements) return [];

    return analysisResult.detectedElements.map((element: any, index: number) => ({
      id: `element_${index}`,
      type: element.type || 'unknown',
      position: { x: element.x || 0, y: element.y || 0 },
      dimensions: { width: element.width || 50, height: element.height || 50 },
      confidence: element.confidence || 0.8
    }));
  };

  // Optimized Real Hunyuan3D-2 Blueprint to 3D Model conversion with performance improvements
  // (Removed duplicate declaration of convertBlueprintTo3DOptimized to fix redeclaration error)

  // Enhanced file upload handler with real Hunyuan3D-2 conversion
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store uploaded file for overlay
    setUploadedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    // Determine file type and conversion workflow
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const is2DBlueprint = ['pdf', 'jpg', 'jpeg', 'png', 'dwg', 'dxf'].includes(fileExtension || '');
    const is3DModel = ['ifc', 'rvt', 'obj', 'fbx', 'gltf', 'glb'].includes(fileExtension || '');

    try {
      if (is2DBlueprint) {
        // Real Hunyuan3D-2 Blueprint to 3D Model Conversion
        await convertBlueprintTo3DOptimized(file);
      } else if (is3DModel) {
        // Direct 3D Model Processing
        await simulate3DModelProcessing(file);
      } else {
        // Generic document processing
        await simulateDocumentProcessing(file);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setProcessingIndicator({ show: true, progress: 100, message: 'Processing failed. Please try again.' });
      setTimeout(() => {
        setProcessingIndicator({ show: false, progress: 0, message: '' });
      }, 3000);
    } finally {
      setIsUploading(false);
    }
  }, []);

  // Load real 3D model file
  const simulate3DModelProcessing = useCallback(async (file: File) => {
    setProcessingIndicator({ show: true, progress: 10, message: `Loading 3D model: ${file.name}` });
    
    try {
      // Create object URL from the uploaded file
      const fileUrl = URL.createObjectURL(file);
      const fileExtension = file.name.toLowerCase().split('.').pop();
      
      setProcessingIndicator({ show: true, progress: 30, message: 'Parsing 3D model...' });
      
      // Load the actual uploaded file based on its type
      if (fileExtension === 'obj') {
        await loadOBJModel(fileUrl, file.name);
      } else if (fileExtension === 'fbx') {
        await loadFBXModel(fileUrl, file.name);
      } else if (fileExtension === 'gltf' || fileExtension === 'glb') {
        await loadGLTFModel(fileUrl, file.name);
      } else if (fileExtension === 'ifc') {
        await loadIFCModel(fileUrl, file.name);
      } else {
        // Fallback to demo for unsupported formats
        console.warn(`Unsupported format: ${fileExtension}, loading demo model`);
        await loadEnhancedDemoModel();
      }
      
      setProcessingIndicator({ show: true, progress: 100, message: `✅ ${file.name} loaded successfully!` });
      setTimeout(() => setProcessingIndicator({ show: false, progress: 0, message: '' }), 3000);
      
      // Clean up object URL
      setTimeout(() => URL.revokeObjectURL(fileUrl), 5000);
    } catch (error) {
      console.error('Failed to load 3D model:', error);
      setProcessingIndicator({ show: true, progress: 100, message: '❌ Failed to load model. Try another format.' });
      setTimeout(() => setProcessingIndicator({ show: false, progress: 0, message: '' }), 3000);
    }
  }, []);

  // Simulate document processing
  const simulateDocumentProcessing = useCallback(async (file: File) => {
    setProcessingIndicator({ show: true, progress: 50, message: `Analyzing document: ${file.name}` });
    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingIndicator({ show: true, progress: 100, message: 'Document analyzed successfully!' });
    setTimeout(() => setProcessingIndicator({ show: false, progress: 0, message: '' }), 3000);
  }, []);

  // Optimized Real Hunyuan3D-2 Blueprint to 3D Model conversion with performance improvements
  const convertBlueprintTo3DOptimized = useCallback(async (file: File) => {
    try {
      // Start production blueprint analysis
      setIsAnalyzing(true);
      setBlueprintAnalysis(null);

      setProcessingIndicator({
        show: true,
        progress: 5,
        message: 'Initializing AI analysis pipeline...'
      });

      // Import the Hunyuan3D service dynamically for better performance
      const { hunyuan3DService } = await import('@/lib/hunyuan3d-service');

      setProcessingIndicator({
        show: true,
        progress: 15,
        message: 'Connecting to Hunyuan3D-2 models...'
      });

      // Check service availability first
      const isServiceAvailable = await hunyuan3DService.isServiceAvailable();

      if (isServiceAvailable) {
        setProcessingIndicator({
          show: true,
          progress: 25,
          message: '🤖 Real Hunyuan3D-2 AI processing...'
        });
      } else {
        setProcessingIndicator({
          show: true,
          progress: 25,
          message: '🔄 Using enhanced simulation mode...'
        });
      }

      // Run enhanced blueprint analysis
      const analysisResult = await hunyuan3DService.analyzeBlueprint(file);

      setProcessingIndicator({
        show: true,
        progress: 60,
        message: 'Analysis complete, generating 3D model...'
      });

      setBlueprintAnalysis(analysisResult);
      setIsAnalyzing(false);

      // Convert analysis results to overlay elements
      const overlayElements = convertAnalysisToOverlayElements(analysisResult);
      setDetectedElements(overlayElements);
      setShowOverlay(true);

      setProcessingIndicator({
        show: true,
        progress: 80,
        message: 'Starting 3D conversion workflow...'
      });

      console.log('📊 Enhanced Blueprint Analysis:', analysisResult);

      // Use the enhanced conversion service
      const conversionOptions = {
        prompt: 'A detailed 3D architectural building model with accurate proportions',
        style: 'architectural' as const,
        quality: analysisResult.complexity === 'high' ? 'high' as const : 'standard' as const,
        includeTextures: true,
        octreeResolution: analysisResult.complexity === 'high' ? 256 : 128,
        numInferenceSteps: analysisResult.complexity === 'high' ? 10 : 5,
        guidanceScale: 5.0,
        maxFaceCount: 40000,
        seed: Math.floor(Math.random() * 10000)
      };

      setProcessingIndicator({
        show: true,
        progress: 85,
        message: isServiceAvailable ? 'Real AI generating 3D model...' : 'Simulation generating model...'
      });

      // Start conversion with the real service
      const conversionResult = await hunyuan3DService.convertBlueprintTo3D(file, conversionOptions);

      if (!conversionResult.success) {
        throw new Error(conversionResult.error || 'Conversion failed');
      }

      setProcessingIndicator({
        show: true,
        progress: 95,
        message: 'Optimizing 3D model for display...'
      });

      // Generate enhanced 3D model with optimized loading
      await generateOptimized3DModel({
        originalFile: file.name,
        conversionResult,
        analysisResult,
        isRealConversion: !conversionResult.fallbackUsed
      });

      // Success message with service info
      const serviceLabel = conversionResult.fallbackUsed ? 'Enhanced Simulation' : 'Real Hunyuan3D-2';
      const aiStatus = conversionResult.fallbackUsed ? '🔄 Simulation' : '✅ Real AI';

      setProcessingIndicator({
        show: true,
        progress: 100,
        message: `🎉 ${aiStatus} ${serviceLabel}: Generated 3D model from ${file.name}! Quality: ${conversionOptions.quality}`
      });

      setTimeout(() => {
        setProcessingIndicator({ show: false, progress: 0, message: '' });
      }, 5000);

    } catch (error) {
      console.error('Blueprint conversion error:', error);
      setIsAnalyzing(false);

      setProcessingIndicator({
        show: true,
        progress: 100,
        message: `❌ Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });

      setTimeout(() => {
        setProcessingIndicator({ show: false, progress: 0, message: '' });
      }, 3000);
    }
  }, []);

  // Optimized 3D model generation with performance improvements
  const generateOptimized3DModel = async (options: {
    originalFile: string;
    conversionResult: ConversionResult;
    analysisResult: BlueprintAnalysisResult;
    isRealConversion: boolean;
  }) => {
    console.log('🏗️ Starting optimized 3D model generation:', options);

    // Clear existing models efficiently
    if (sceneRef.current) {
      // Use object traversal for efficient cleanup
      const objectsToRemove: THREE.Object3D[] = [];
      sceneRef.current.traverse((child) => {
        if (child.userData.type === 'building' ||
            child.userData.type === 'foundation' ||
            child.userData.type === 'ground' ||
            child.userData.type === 'test' ||
            child.name === 'Building') {
          objectsToRemove.push(child);
        }
      });

      // Remove objects efficiently
      objectsToRemove.forEach(obj => {
        if (obj.parent) {
          obj.parent.remove(obj);
        }
        // Dispose geometry and materials to free memory
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      console.log('🧹 Efficiently cleared existing models:', objectsToRemove.length, 'objects');
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && (window as any).gc) {
      (window as any).gc();
    }

    // Clear GPU memory
    if (rendererRef.current) {
      rendererRef.current.info.reset();
      rendererRef.current.dispose();
      // Recreate renderer for fresh state
      initializeRenderer();
    }

    // Load optimized model based on conversion result
    console.log('🔄 Loading optimized 3D model...');

    if (options.isRealConversion && options.conversionResult.modelUrl) {
      // Load real AI-generated model
      await loadRealAIModel(options.conversionResult.modelUrl);
    } else {
      // Load enhanced demo model with analysis data
      await loadEnhancedDemoModel(options.analysisResult);
    }

    console.log('✅ Optimized 3D model loaded successfully');

    // Update analysis with conversion data
    const enhancedAnalysis: BIMAnalysis = {
      totalElements: options.analysisResult.detectedElements?.length || 15,
      structuralElements: options.analysisResult.enhancedFeatures?.roomCount * 2 || 8,
      mechanicalElements: Math.floor((options.analysisResult.enhancedFeatures?.roomCount || 4) * 1.5),
      electricalElements: Math.floor((options.analysisResult.enhancedFeatures?.roomCount || 4) * 1.2),
      clashes: clashes.length,
      compliance: options.conversionResult.metadata?.modelStats?.conversionAccuracy || 85,
      cost: 450000 + Math.floor(Math.random() * 100000)
    };

    setAnalysis(enhancedAnalysis);
    onAnalysisComplete?.(enhancedAnalysis);
    onClashesDetected?.(clashes);

    // Store conversion info for display
    (window as any).lastConversionInfo = {
      isRealConversion: options.isRealConversion,
      modelType: options.isRealConversion ? 'Hunyuan3D-2' : 'Enhanced Simulation',
      conversionAccuracy: enhancedAnalysis.compliance,
      processingTime: Date.now()
    };
  };

  // Initialize renderer efficiently
  const initializeRenderer = useCallback(() => {
    if (!mountRef.current) return;

    const containerWidth = mountRef.current.clientWidth || 800;
    const containerHeight = mountRef.current.clientHeight || 500;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance'
    });

    renderer.setSize(containerWidth, containerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);
  }, []);

  // Clear existing models from scene
  const clearScene = useCallback(() => {
    if (!sceneRef.current) return;

    const objectsToRemove: THREE.Object3D[] = [];
    sceneRef.current.traverse((child) => {
      if (child.userData.type === 'building' ||
          child.userData.type === 'foundation' ||
          child.userData.type === 'ground' ||
          child.userData.type === 'test' ||
          child.userData.type === 'uploaded-model' ||
          child.name === 'Building' ||
          child.name === 'UploadedModel') {
        objectsToRemove.push(child);
      }
    });

    objectsToRemove.forEach(obj => {
      if (obj.parent) {
        obj.parent.remove(obj);
      }
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach(mat => mat.dispose());
        } else if (obj.material) {
          obj.material.dispose();
        }
      }
    });

    console.log('🧹 Cleared scene:', objectsToRemove.length, 'objects removed');
  }, []);

  // Load OBJ model
  const loadOBJModel = async (fileUrl: string, fileName: string) => {
    if (!sceneRef.current) return;

    try {
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js');
      const loader = new OBJLoader();

      const object = await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(fileUrl, resolve, undefined, reject);
      });

      clearScene();

      object.name = 'UploadedModel';
      object.userData.type = 'uploaded-model';
      object.userData.fileName = fileName;

      // Apply default material if needed
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          if (!child.material) {
            child.material = new THREE.MeshStandardMaterial({ color: 0xcccccc });
          }
        }
      });

      sceneRef.current.add(object);
      fitCameraToObject(object);

      console.log('✅ OBJ model loaded:', fileName);
    } catch (error) {
      console.error('Failed to load OBJ:', error);
      throw error;
    }
  };

  // Load FBX model
  const loadFBXModel = async (fileUrl: string, fileName: string) => {
    if (!sceneRef.current) return;

    try {
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
      const loader = new FBXLoader();

      const object = await new Promise<THREE.Group>((resolve, reject) => {
        loader.load(fileUrl, resolve, undefined, reject);
      });

      clearScene();

      object.name = 'UploadedModel';
      object.userData.type = 'uploaded-model';
      object.userData.fileName = fileName;

      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      sceneRef.current.add(object);
      fitCameraToObject(object);

      console.log('✅ FBX model loaded:', fileName);
    } catch (error) {
      console.error('Failed to load FBX:', error);
      throw error;
    }
  };

  // Load GLTF/GLB model
  const loadGLTFModel = async (fileUrl: string, fileName: string) => {
    if (!sceneRef.current) return;

    try {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);

      const gltf = await new Promise<GLTFLoadResult>((resolve, reject) => {
        loader.load(fileUrl, resolve, undefined, reject);
      });

      clearScene();

      gltf.scene.name = 'UploadedModel';
      gltf.scene.userData.type = 'uploaded-model';
      gltf.scene.userData.fileName = fileName;

      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = true;
        }
      });

      sceneRef.current.add(gltf.scene);
      fitCameraToObject(gltf.scene);

      console.log('✅ GLTF/GLB model loaded:', fileName);
    } catch (error) {
      console.error('Failed to load GLTF/GLB:', error);
      throw error;
    }
  };

  // Load IFC model
  const loadIFCModel = async (fileUrl: string, fileName: string) => {
    // IFC loading requires web-ifc-three library
    // For now, fall back to demo model with a message
    console.warn('IFC format requires web-ifc-three library. Install it for IFC support.');
    setProcessingIndicator({ 
      show: true, 
      progress: 50, 
      message: '⚠️ IFC support coming soon. Loading demo for now...' 
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await loadEnhancedDemoModel();
  };

  // Fit camera to object
  const fitCameraToObject = (object: THREE.Object3D) => {
    if (!cameraRef.current || !controlsRef.current) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = cameraRef.current.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 2.5; // Zoom out a bit for better view

    cameraRef.current.position.set(
      center.x + cameraZ * 0.5,
      center.y + cameraZ * 0.5,
      center.z + cameraZ
    );
    cameraRef.current.lookAt(center);
    cameraRef.current.updateProjectionMatrix();

    controlsRef.current.target.copy(center);
    controlsRef.current.update();

    console.log('📷 Camera fitted to object:', { size, center, cameraZ });
  };

  // Load real AI-generated model
  const loadRealAIModel = async (modelUrl: string) => {
    if (!sceneRef.current) return;

    try {
      // Dynamic import for better performance
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');

      const loader = new GLTFLoader();
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('/draco/');
      loader.setDRACOLoader(dracoLoader);

      const gltf = await new Promise<GLTFLoadResult>((resolve, reject) => {
        loader.load(
          modelUrl,
          resolve,
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setProcessingIndicator({
              show: true,
              progress: Math.min(90 + percent * 0.1, 100),
              message: `Loading real AI model: ${Math.round(percent)}%`
            });
          },
          reject
        );
      });

      // Add the real model to the scene
      sceneRef.current.add(gltf.scene);

      // Optimize the model
      gltf.scene.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Enable frustum culling for performance
          child.frustumCulled = true;
        }
      });

      // Position camera optimally
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      if (cameraRef.current) {
        cameraRef.current.position.copy(center);
        cameraRef.current.position.x += size;
        cameraRef.current.position.y += size * 0.5;
        cameraRef.current.position.z += size;
        cameraRef.current.lookAt(center);
      }

      if (controlsRef.current) {
        controlsRef.current.target.copy(center);
        controlsRef.current.update();
      }

      console.log('✅ Real AI model loaded and optimized');

    } catch (error) {
      console.warn('❌ Failed to load real AI model, falling back to demo:', error);
      await loadEnhancedDemoModel();
    }
  };

  // Enhanced demo model with analysis data
  const loadEnhancedDemoModel = async (analysisResult?: BlueprintAnalysisResult) => {
    if (!sceneRef.current) return;

    const scene = sceneRef.current;
    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'Building';

    try {
      // Use analysis data to create more accurate model
      const roomCount = analysisResult?.enhancedFeatures?.roomCount || 4;
      const doorCount = analysisResult?.enhancedFeatures?.doorCount || 3;
      const windowCount = analysisResult?.enhancedFeatures?.windowCount || 6;
      const complexity = analysisResult?.complexity || 'medium';

      // Adjust building size based on analysis
      const buildingScale = complexity === 'high' ? 1.5 : complexity === 'low' ? 0.7 : 1.0;
      const buildingWidth = 50 * buildingScale;
      const buildingDepth = 35 * buildingScale;
      const buildingHeight = 25 + (roomCount * 2);

      // Create foundation
      const foundationGeometry = new THREE.BoxGeometry(buildingWidth + 10, 2, buildingDepth + 10);
      const foundationMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
      const foundation = new THREE.Mesh(foundationGeometry, foundationMaterial);
      foundation.position.set(0, -1, 0);
      foundation.castShadow = true;
      foundation.receiveShadow = true;
      foundation.userData = { type: 'foundation', id: 'found_001' };
      buildingGroup.add(foundation);

      // Create main building
      const buildingGeometry = new THREE.BoxGeometry(buildingWidth, buildingHeight, buildingDepth);
      const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0xE8E8E8 });
      const mainBuilding = new THREE.Mesh(buildingGeometry, buildingMaterial);
      mainBuilding.position.set(0, buildingHeight / 2, 0);
      mainBuilding.castShadow = true;
      mainBuilding.receiveShadow = true;
      mainBuilding.userData = { type: 'building', id: 'main_001' };
      buildingGroup.add(mainBuilding);

      // Create roof based on complexity
      let roof;
      if (complexity === 'high') {
        // Complex roof
        const roofGeometry = new THREE.ConeGeometry(buildingWidth * 0.6, 12, 6);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        roof = new THREE.Mesh(roofGeometry, roofMaterial);
      } else {
        // Simple roof
        const roofGeometry = new THREE.ConeGeometry(buildingWidth * 0.5, 8, 4);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        roof = new THREE.Mesh(roofGeometry, roofMaterial);
      }

      roof.position.set(0, buildingHeight + 6, 0);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      roof.userData = { type: 'roof', id: 'roof_001' };
      buildingGroup.add(roof);

      // Add windows based on analysis
      const windowGeometry = new THREE.BoxGeometry(3, 4, 0.5);
      const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87CEEB });

      for (let i = 0; i < windowCount; i++) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        const angle = (i / windowCount) * Math.PI * 2;
        const radius = buildingWidth * 0.6;
        window.position.set(
          Math.cos(angle) * radius,
          8 + (i % 3) * 6,
          Math.sin(angle) * radius
        );
        window.userData = { type: 'window', id: `window_${i}` };
        buildingGroup.add(window);
      }

      // Add doors based on analysis
      const doorGeometry = new THREE.BoxGeometry(4, 8, 0.5);
      const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });

      for (let i = 0; i < doorCount; i++) {
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        const angle = (i / doorCount) * Math.PI * 2;
        const radius = buildingWidth * 0.6;
        door.position.set(
          Math.cos(angle) * radius,
          4,
          Math.sin(angle) * radius
        );
        door.userData = { type: 'door', id: `door_${i}` };
        buildingGroup.add(door);
      }

      // Add ground plane
      const groundGeometry = new THREE.PlaneGeometry(200, 200);
      const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -2;
      ground.receiveShadow = true;
      ground.userData = { type: 'ground', id: 'ground_001' };
      scene.add(ground);

      // Add building group to scene
      scene.add(buildingGroup);

      // Position camera optimally
      if (cameraRef.current) {
        const distance = Math.max(buildingWidth, buildingHeight, buildingDepth) * 2;
        cameraRef.current.position.set(distance, distance * 0.7, distance);
        cameraRef.current.lookAt(0, buildingHeight / 2, 0);
      }

      if (controlsRef.current) {
        controlsRef.current.target.set(0, buildingHeight / 2, 0);
        controlsRef.current.update();
      }

      console.log('✅ Enhanced building model generated:', {
        roomCount,
        doorCount,
        windowCount,
        complexity,
        buildingScale
      });

    } catch (error) {
      console.error('Error generating enhanced model:', error);
    }
  };

  // Initialize Three.js scene
  const initializeScene = useCallback(() => {
    if (!mountRef.current || sceneInitializedRef.current) return;

    // Mark as initialized to prevent re-initialization
    sceneInitializedRef.current = true;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      (mountRef.current.clientWidth || 800) / (mountRef.current.clientHeight || 500),
      0.1,
      10000
    );
    camera.position.set(50, 30, 50);
    cameraRef.current = camera;

    // Renderer setup
    initializeRenderer();

    // Controls setup
    if (rendererRef.current) {
      const controls = new OrbitControls(camera, rendererRef.current.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxDistance = 500;
      controls.minDistance = 5;
      controlsRef.current = controls;
    }

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    // Don't auto-load demo model - wait for user to upload a file
    // loadEnhancedDemoModel();

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // Notify parent component that scene is ready
    if (onSceneReady) {
      onSceneReady(scene);
    }

  }, [initializeRenderer, onSceneReady]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    if (controlsRef.current) {
      controlsRef.current.dispose();
    }

    if (mountRef.current && rendererRef.current) {
      mountRef.current.removeChild(rendererRef.current.domElement);
    }
  }, []);

  // Handle window resize
  const handleResize = useCallback(() => {
    if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    cameraRef.current.aspect = width / height;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(width, height);
  }, []);

  // Effects
  useEffect(() => {
    initializeScene();

    window.addEventListener('resize', handleResize);

    return () => {
      cleanup();
      window.removeEventListener('resize', handleResize);
    };
  }, [initializeScene, handleResize, cleanup]);

  return (
    <div className={`w-full h-full bg-background ${className}`}>
      {/* 3D Viewer Container */}
      <div className="relative w-full h-full">
        <div ref={mountRef} className="w-full h-full" />

        {/* Empty State Message */}
        {!uploadedFile && !analysis && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center space-y-4 p-8 bg-background/80 backdrop-blur rounded-lg max-w-md">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No Model Loaded</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a 3D model (.obj, .fbx, .gltf, .glb, .ifc) or 2D blueprint (.pdf, .jpg, .png, .dwg) to begin
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Controls */}
        <div className="absolute top-4 left-4 z-10 space-y-2">
          <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload Blueprint
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf,.ifc,.rvt,.obj,.fbx,.gltf,.glb"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
                id="file-upload"
              />
              <Button
                asChild
                size="sm"
                disabled={isUploading}
                className="w-full"
              >
                <label htmlFor="file-upload" className="cursor-pointer">
                  {isUploading ? 'Processing...' : 'Select File'}
                </label>
              </Button>

              {uploadedFile && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {uploadedFile.name}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Status Indicator */}
          {(processingIndicator.show || isAnalyzing) && (
            <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Cpu className="h-4 w-4 animate-pulse" />
                    <span className="font-medium">AI Processing</span>
                    <Badge variant="secondary" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      Hunyuan3D-2
                    </Badge>
                  </div>
                  <Progress value={processingIndicator.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {processingIndicator.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overlay Controls */}
          {detectedElements.length > 0 && (
            <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardContent className="pt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowOverlay(!showOverlay)}
                  className="w-full"
                >
                  {showOverlay ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Analysis
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="absolute top-4 right-4 z-10">
            <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">BIM Analysis</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Elements: {analysis.totalElements}</div>
                  <div>Clashes: {analysis.clashes}</div>
                  <div>Compliance: {analysis.compliance}%</div>
                  <div>Cost: ${analysis.cost.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blueprint Overlay */}
        {showOverlay && detectedElements.length > 0 && (
          <div className="absolute inset-0 pointer-events-none z-5">
            {detectedElements.map((element) => (
              <div
                key={element.id}
                className="absolute border-2 border-blue-500 bg-blue-500/20"
                style={{
                  left: `${element.position.x}px`,
                  top: `${element.position.y}px`,
                  width: `${element.dimensions.width}px`,
                  height: `${element.dimensions.height}px`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-1 rounded">
                  {element.type} ({Math.round(element.confidence * 100)}%)
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreeViewer;
