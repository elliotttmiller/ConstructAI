/**
 * Intelligent Model Recognition and Configuration System
 * 
 * Automatically detects file types, analyzes content, and applies
 * optimal configuration for viewing and editing.
 */

import * as THREE from 'three';

export interface ModelAnalysis {
  fileType: string;
  fileExtension: string;
  fileName: string;
  fileSize: number;
  
  // Model characteristics
  isBIM: boolean;
  isCAD: boolean;
  isArchitectural: boolean;
  isStructural: boolean;
  isMEP: boolean;
  isManufacturing: boolean;
  
  // Complexity metrics
  estimatedVertexCount: number;
  estimatedPolygonCount: number;
  complexity: 'low' | 'medium' | 'high' | 'very-high';
  
  // Recommended settings
  recommendedLOD: 'low' | 'medium' | 'high';
  enableShadows: boolean;
  enableAO: boolean;
  enableAntialiasing: boolean;
  maxTextureSize: number;
  
  // Processing hints
  requiresDecimation: boolean;
  requiresOptimization: boolean;
  supportsInstancing: boolean;
  hasAnimations: boolean;
  hasLayers: boolean;
  
  // Metadata
  detectedUnits: 'mm' | 'cm' | 'm' | 'in' | 'ft' | 'unknown';
  suggestedScale: number;
  coordinateSystem: 'y-up' | 'z-up' | 'unknown';
}

export interface ModelConfiguration {
  loader: 'gltf' | 'obj' | 'fbx' | 'stl' | 'ifc' | 'rvt' | 'dwg';
  
  // Rendering settings
  castShadow: boolean;
  receiveShadow: boolean;
  frustumCulled: boolean;
  
  // Material settings
  materialType: 'standard' | 'phong' | 'lambert' | 'basic';
  roughness: number;
  metalness: number;
  
  // Camera settings
  cameraFOV: number;
  cameraNear: number;
  cameraFar: number;
  cameraDistance: number;
  
  // Lighting
  ambientIntensity: number;
  directionalIntensity: number;
  
  // Performance
  useLOD: boolean;
  useOcclusion: boolean;
  maxDrawCalls: number;
  
  // Post-processing
  useSSAO: boolean;
  useBloom: boolean;
  useToneMapping: boolean;
}

export class IntelligentModelRecognizer {
  
  /**
   * Analyze a file and determine optimal configuration
   */
  static async analyzeFile(file: File): Promise<ModelAnalysis> {
    const extension = file.name.toLowerCase().split('.').pop() || '';
    const fileName = file.name;
    const fileSize = file.size;
    
    // Determine file type category
    const isBIM = IntelligentModelRecognizer.isBIMFormat(extension);
    const isCAD = IntelligentModelRecognizer.isCADFormat(extension);
    const isArchitectural = IntelligentModelRecognizer.isArchitecturalFile(fileName);
    const isStructural = IntelligentModelRecognizer.isStructuralFile(fileName);
    const isMEP = IntelligentModelRecognizer.isMEPFile(fileName);
    const isManufacturing = IntelligentModelRecognizer.isManufacturingFile(fileName);
    
    // Estimate complexity based on file size and type
    const complexity = IntelligentModelRecognizer.estimateComplexity(fileSize, extension);
    const estimatedVertexCount = IntelligentModelRecognizer.estimateVertexCount(fileSize, extension);
    const estimatedPolygonCount = Math.floor(estimatedVertexCount / 3);
    
    // Determine optimal settings
    const recommendedLOD = complexity === 'very-high' || complexity === 'high' ? 'high' : 'medium';
    const enableShadows = complexity !== 'very-high' && fileSize < 50 * 1024 * 1024;
    const enableAO = complexity === 'low' || complexity === 'medium';
    const enableAntialiasing = fileSize < 100 * 1024 * 1024;
    
    // Processing hints
    const requiresDecimation = estimatedPolygonCount > 500000;
    const requiresOptimization = fileSize > 20 * 1024 * 1024;
    const supportsInstancing = isBIM || isArchitectural;
    const hasAnimations = extension === 'fbx' || extension === 'gltf';
    const hasLayers = isBIM || extension === 'ifc';
    
    // Detect units and coordinate system
    const detectedUnits = IntelligentModelRecognizer.detectUnits(fileName, extension);
    const suggestedScale = IntelligentModelRecognizer.calculateScale(detectedUnits);
    const coordinateSystem = IntelligentModelRecognizer.detectCoordinateSystem(extension);
    
    return {
      fileType: this.getFileTypeDescription(extension),
      fileExtension: extension,
      fileName,
      fileSize,
      isBIM,
      isCAD,
      isArchitectural,
      isStructural,
      isMEP,
      isManufacturing,
      estimatedVertexCount,
      estimatedPolygonCount,
      complexity,
      recommendedLOD,
      enableShadows,
      enableAO,
      enableAntialiasing,
      maxTextureSize: IntelligentModelRecognizer.getMaxTextureSize(complexity),
      requiresDecimation,
      requiresOptimization,
      supportsInstancing,
      hasAnimations,
      hasLayers,
      detectedUnits,
      suggestedScale,
      coordinateSystem
    };
  }
  
  /**
   * Generate optimal configuration based on analysis
   */
  static generateConfiguration(analysis: ModelAnalysis): ModelConfiguration {
    const isHighComplexity = analysis.complexity === 'high' || analysis.complexity === 'very-high';
    
    return {
      loader: IntelligentModelRecognizer.selectLoader(analysis.fileExtension),
      
      // Rendering
      castShadow: analysis.enableShadows && !isHighComplexity,
      receiveShadow: analysis.enableShadows,
      frustumCulled: true,
      
      // Materials - BIM and architectural get standard, manufacturing gets phong
      materialType: analysis.isBIM || analysis.isArchitectural ? 'standard' : 
                    analysis.isManufacturing ? 'phong' : 'lambert',
      roughness: analysis.isManufacturing ? 0.3 : 0.7,
      metalness: analysis.isManufacturing ? 0.8 : 0.1,
      
      // Camera - closer for small parts, farther for buildings
      cameraFOV: 75,
      cameraNear: analysis.isManufacturing ? 0.01 : 0.1,
      cameraFar: analysis.isBIM ? 10000 : 1000,
      cameraDistance: analysis.isBIM ? 100 : analysis.isManufacturing ? 5 : 20,
      
      // Lighting - brighter for technical models
      ambientIntensity: analysis.isManufacturing ? 0.5 : 0.6,
      directionalIntensity: analysis.isManufacturing ? 1.0 : 0.8,
      
      // Performance
      useLOD: isHighComplexity,
      useOcclusion: analysis.isBIM && !isHighComplexity,
      maxDrawCalls: isHighComplexity ? 1000 : 5000,
      
      // Post-processing - only for less complex scenes
      useSSAO: analysis.enableAO,
      useBloom: false, // Disable by default for performance
      useToneMapping: analysis.isArchitectural || analysis.isBIM
    };
  }
  
  // Helper methods
  
  private static isBIMFormat(extension: string): boolean {
    return ['ifc', 'rvt', 'nwd', 'nwc'].includes(extension);
  }
  
  private static isCADFormat(extension: string): boolean {
    return ['dwg', 'dxf', 'step', 'stp', 'iges', 'igs', 'sat'].includes(extension);
  }
  
  private static isArchitecturalFile(fileName: string): boolean {
    const keywords = ['building', 'floor', 'wall', 'room', 'arch', 'facade', 'structure'];
    const lowerName = fileName.toLowerCase();
    return keywords.some(keyword => lowerName.includes(keyword));
  }
  
  private static isStructuralFile(fileName: string): boolean {
    const keywords = ['beam', 'column', 'truss', 'foundation', 'slab', 'structural'];
    const lowerName = fileName.toLowerCase();
    return keywords.some(keyword => lowerName.includes(keyword));
  }
  
  private static isMEPFile(fileName: string): boolean {
    const keywords = ['mep', 'hvac', 'duct', 'pipe', 'electrical', 'mechanical', 'plumbing'];
    const lowerName = fileName.toLowerCase();
    return keywords.some(keyword => lowerName.includes(keyword));
  }
  
  private static isManufacturingFile(fileName: string): boolean {
    const keywords = ['part', 'assembly', 'component', 'machining', 'cnc', 'tool'];
    const lowerName = fileName.toLowerCase();
    return keywords.some(keyword => lowerName.includes(keyword));
  }
  
  private static estimateComplexity(fileSize: number, extension: string): 'low' | 'medium' | 'high' | 'very-high' {
    // BIM files are inherently complex
    if (this.isBIMFormat(extension)) {
      if (fileSize > 100 * 1024 * 1024) return 'very-high';
      if (fileSize > 50 * 1024 * 1024) return 'high';
      return 'medium';
    }
    
    // General complexity estimation
    if (fileSize > 100 * 1024 * 1024) return 'very-high';
    if (fileSize > 20 * 1024 * 1024) return 'high';
    if (fileSize > 5 * 1024 * 1024) return 'medium';
    return 'low';
  }
  
  private static estimateVertexCount(fileSize: number, extension: string): number {
    // Rough estimation based on format efficiency
    const bytesPerVertex: Record<string, number> = {
      'gltf': 32,
      'glb': 28,
      'obj': 50,
      'fbx': 40,
      'stl': 36,
      'ifc': 60
    };
    
    const efficiency = bytesPerVertex[extension] || 40;
    return Math.floor(fileSize / efficiency);
  }
  
  private static detectUnits(fileName: string, extension: string): ModelAnalysis['detectedUnits'] {
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('_mm') || lowerName.includes('-mm')) return 'mm';
    if (lowerName.includes('_cm') || lowerName.includes('-cm')) return 'cm';
    if (lowerName.includes('_m') || lowerName.includes('-m')) return 'm';
    if (lowerName.includes('_in') || lowerName.includes('-in')) return 'in';
    if (lowerName.includes('_ft') || lowerName.includes('-ft')) return 'ft';
    
    // Default units by file type
    if (this.isBIMFormat(extension)) return 'mm'; // BIM typically uses mm
    if (this.isCADFormat(extension)) return 'mm'; // CAD typically uses mm
    if (extension === 'stl') return 'mm'; // STL for 3D printing uses mm
    
    return 'unknown';
  }
  
  private static calculateScale(units: ModelAnalysis['detectedUnits']): number {
    // Convert to meters as base unit
    const scaleFactors: Record<string, number> = {
      'mm': 0.001,
      'cm': 0.01,
      'm': 1.0,
      'in': 0.0254,
      'ft': 0.3048,
      'unknown': 1.0
    };
    
    return scaleFactors[units];
  }
  
  private static detectCoordinateSystem(extension: string): 'y-up' | 'z-up' | 'unknown' {
    // Known coordinate systems by format
    if (['obj', 'fbx', 'gltf', 'glb'].includes(extension)) return 'y-up';
    if (['ifc', 'rvt', 'dwg', 'dxf'].includes(extension)) return 'z-up';
    return 'unknown';
  }
  
  private static getMaxTextureSize(complexity: ModelAnalysis['complexity']): number {
    switch (complexity) {
      case 'low': return 2048;
      case 'medium': return 2048;
      case 'high': return 1024;
      case 'very-high': return 512;
    }
  }
  
  private static selectLoader(extension: string): ModelConfiguration['loader'] {
    if (['gltf', 'glb'].includes(extension)) return 'gltf';
    if (extension === 'obj') return 'obj';
    if (extension === 'fbx') return 'fbx';
    if (extension === 'stl') return 'stl';
    if (extension === 'ifc') return 'ifc';
    if (extension === 'rvt') return 'rvt';
    if (['dwg', 'dxf'].includes(extension)) return 'dwg';
    
    return 'gltf'; // Default fallback
  }
  
  private static getFileTypeDescription(extension: string): string {
    const descriptions: Record<string, string> = {
      'gltf': 'GL Transmission Format (glTF)',
      'glb': 'Binary GL Transmission Format',
      'obj': 'Wavefront OBJ',
      'fbx': 'Autodesk FBX',
      'stl': 'STereoLithography',
      'ifc': 'Industry Foundation Classes (BIM)',
      'rvt': 'Autodesk Revit',
      'dwg': 'AutoCAD Drawing',
      'dxf': 'Drawing Exchange Format',
      'step': 'STEP CAD Format',
      'stp': 'STEP CAD Format',
      'iges': 'IGES CAD Format',
      'igs': 'IGES CAD Format'
    };
    
    return descriptions[extension] || `${extension.toUpperCase()} File`;
  }
  
  /**
   * Apply configuration to a loaded model
   */
  static applyConfiguration(
    model: THREE.Object3D,
    config: ModelConfiguration,
    analysis: ModelAnalysis
  ): void {
    // Apply scale if needed
    if (analysis.suggestedScale !== 1.0) {
      model.scale.multiplyScalar(analysis.suggestedScale);
    }
    
    // Apply coordinate system correction
    if (analysis.coordinateSystem === 'z-up') {
      // Rotate from Z-up to Y-up
      model.rotation.x = -Math.PI / 2;
    }
    
    // Apply rendering settings to all meshes
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = config.castShadow;
        child.receiveShadow = config.receiveShadow;
        child.frustumCulled = config.frustumCulled;
        
        // Apply material settings
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.roughness = config.roughness;
          child.material.metalness = config.metalness;
        }
      }
    });
  }
  
  /**
   * Generate human-readable report
   */
  static generateReport(analysis: ModelAnalysis, config: ModelConfiguration): string {
    return `
🔍 Model Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 File Information
  • Name: ${analysis.fileName}
  • Type: ${analysis.fileType}
  • Size: ${(analysis.fileSize / 1024 / 1024).toFixed(2)} MB

🏗️ Model Category
  • BIM Model: ${analysis.isBIM ? '✓' : '✗'}
  • CAD Model: ${analysis.isCAD ? '✓' : '✗'}
  • Architectural: ${analysis.isArchitectural ? '✓' : '✗'}
  • Structural: ${analysis.isStructural ? '✓' : '✗'}
  • MEP: ${analysis.isMEP ? '✓' : '✗'}
  • Manufacturing: ${analysis.isManufacturing ? '✓' : '✗'}

📊 Complexity Analysis
  • Complexity: ${analysis.complexity.toUpperCase()}
  • Est. Vertices: ${analysis.estimatedVertexCount.toLocaleString()}
  • Est. Polygons: ${analysis.estimatedPolygonCount.toLocaleString()}
  • Requires Optimization: ${analysis.requiresOptimization ? '✓' : '✗'}

⚙️ Configuration Applied
  • Loader: ${config.loader.toUpperCase()}
  • Material: ${config.materialType}
  • Shadows: ${config.castShadow ? 'Enabled' : 'Disabled'}
  • LOD: ${config.useLOD ? 'Enabled' : 'Disabled'}
  • SSAO: ${config.useSSAO ? 'Enabled' : 'Disabled'}

📏 Units & Scale
  • Detected Units: ${analysis.detectedUnits}
  • Scale Factor: ${analysis.suggestedScale}
  • Coordinate System: ${analysis.coordinateSystem}

💡 Recommendations
  • Level of Detail: ${analysis.recommendedLOD.toUpperCase()}
  • Max Texture Size: ${analysis.maxTextureSize}px
  • Camera Distance: ${config.cameraDistance}m
`;
  }
}
