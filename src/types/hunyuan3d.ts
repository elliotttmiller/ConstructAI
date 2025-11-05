// Hunyuan3D TypeScript Interfaces
// Replaces 'any' types with proper interfaces for better type safety

export interface BlueprintAnalysisResult {
  complexity: 'low' | 'medium' | 'high';
  detectedElements: DetectedElement[];
  enhancedFeatures: EnhancedFeatures;
  metadata: AnalysisMetadata;
  confidence: number;
  processingTime: number;
}

export interface DetectedElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  properties?: Record<string, unknown>;
}

export type ElementType =
  | 'wall'
  | 'door'
  | 'window'
  | 'room'
  | 'stairs'
  | 'column'
  | 'beam'
  | 'dimension'
  | 'text'
  | 'symbol'
  | 'unknown';

export interface EnhancedFeatures {
  drawingType?: string;
  projection?: string;
  roomCount: number;
  doorCount: number;
  windowCount: number;
  totalArea?: number;
  buildingType?: BuildingType;
  structuralElements?: StructuralElement[];
  scaleDetected?: boolean;
  scaleRatio?: number;
  scaleUnit?: string;
  ocrConfidence?: number;
  textRegions?: number;
  structuralComplexity?: number;
  remoteAnalysisAvailable?: boolean;
}

export type BuildingType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'mixed'
  | 'unknown';

export interface StructuralElement {
  type: 'wall' | 'column' | 'beam' | 'slab' | 'foundation';
  dimensions: Dimensions3D;
  material?: string;
  loadBearing?: boolean;
}

export interface Dimensions3D {
  length: number;
  width: number;
  height: number;
}

export interface AnalysisMetadata {
  version: string;
  timestamp: number;
  processingMethod: 'real' | 'simulation';
  imageProperties: ImageProperties;
  conversionSettings: ConversionSettings;
}

export interface ImageProperties {
  width: number;
  height: number;
  format: string;
  dpi?: number;
  colorDepth?: number;
}

export interface ConversionSettings {
  prompt?: string;
  style?: ConversionStyle;
  quality?: ConversionQuality;
  includeTextures?: boolean;
  generateFloorPlan?: boolean;
  octreeResolution?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  maxFaceCount?: number;
  seed?: number;
}

export type ConversionStyle = 'architectural' | 'industrial' | 'modern' | 'classic';
export type ConversionQuality = 'low' | 'standard' | 'high' | 'ultra';

export interface ConversionResult {
  success: boolean;
  jobId?: string;
  modelUrl?: string;
  textureUrl?: string;
  fallbackUsed: boolean;
  error?: string;
  metadata: ConversionMetadata;
  processingTime: number;
}

export interface ConversionMetadata {
  modelStats?: ModelStats;
  performance?: PerformanceMetrics;
  quality?: QualityMetrics;
}

export interface ModelStats {
  vertices: number;
  faces: number;
  materials: number;
  textures: number;
  hasTexture: boolean;
  fileSize: number;
  conversionAccuracy: number;
  boundingBox?: {
    min: number[];
    max: number[];
  };
}

export interface PerformanceMetrics {
  gpuMemoryUsed: number;
  processingTime: number;
  inferenceSteps: number;
  batchSize: number;
}

export interface QualityMetrics {
  geometryScore: number;
  textureScore: number;
  overallScore: number;
  issues: QualityIssue[];
}

export interface QualityIssue {
  type: 'geometry' | 'texture' | 'material' | 'topology';
  severity: 'low' | 'medium' | 'high';
  description: string;
  suggestion?: string;
}

// Three.js related interfaces
import * as THREE from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Use the actual GLTF type from three.js
export type GLTFLoadResult = GLTF;

// API Response interfaces
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface Hunyuan3DServiceResponse {
  available: boolean;
  version?: string;
  capabilities?: ServiceCapabilities;
  status: ServiceStatus;
}

export interface ServiceCapabilities {
  maxImageSize: number;
  supportedFormats: string[];
  supportedStyles: ConversionStyle[];
  supportedQualities: ConversionQuality[];
  gpuAcceleration: boolean;
  batchProcessing: boolean;
}

export type ServiceStatus = 'online' | 'offline' | 'maintenance' | 'error';

// Progress tracking interfaces
export interface ProcessingProgress {
  stage: ProcessingStage;
  progress: number;
  message: string;
  estimatedTimeRemaining?: number;
}

export type ProcessingStage =
  | 'initializing'
  | 'analyzing'
  | 'preprocessing'
  | 'converting'
  | 'postprocessing'
  | 'optimizing'
  | 'complete'
  | 'error';

// Job management interfaces
export interface ConversionJob {
  id: string;
  status: JobStatus;
  progress: ProcessingProgress;
  result?: ConversionResult;
  error?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
}

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Event interfaces for real-time updates
export interface ProcessingEvent {
  type: ProcessingEventType;
  jobId: string;
  payload: ProcessingProgress | ConversionResult | string;
  timestamp: number;
}

export type ProcessingEventType =
  | 'progress'
  | 'complete'
  | 'error'
  | 'cancelled';

// Configuration interfaces
export interface Hunyuan3DConfig {
  baseUrl: string;
  model: string;
  enableTextures: boolean;
  quality: 'fast' | 'standard' | 'high';
  maxRetries: number;
  timeout: number;

  debugMode?: boolean;
}

export interface ModelVariant {
  name: string;
  id: string;
  description: string;
  capabilities: ModelCapabilities;
  requirements: ModelRequirements;
}

export interface ModelCapabilities {
  maxResolution: number;
  supportedInputs: string[];
  outputFormats: string[];
  processingSpeed: 'fast' | 'medium' | 'slow';
  qualityLevel: ConversionQuality;
}

export interface ModelRequirements {
  minVRAM: number;
  minRAM: number;
  gpuRequired: boolean;
  supportedPlatforms: string[];
}

// Error interfaces
export interface Hunyuan3DError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  suggestion?: string;
  recoverable: boolean;
}

// Batch processing interfaces
export interface BatchJob {
  id: string;
  files: BatchFile[];
  settings: ConversionSettings;
  status: BatchJobStatus;
  progress: BatchProgress;
  results: ConversionResult[];
  createdAt: number;
  completedAt?: number;
}

export interface BatchFile {
  id: string;
  filename: string;
  size: number;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ConversionResult;
}

export type BatchJobStatus = 'created' | 'processing' | 'completed' | 'partial' | 'failed';

export interface BatchProgress {
  totalFiles: number;
  processedFiles: number;
  failedFiles: number;
  overallProgress: number;
  estimatedTimeRemaining?: number;
}
