/**
 * Real Hunyuan3D-2 Service Integration
 * Enhanced service layer for 2D to 3D blueprint conversion using Tencent's real Hunyuan3D-2 models
 */

import { ErrorTracker, PerformanceMonitor } from './production-config';
import {
  BlueprintAnalysisResult,
  ConversionResult,
  ConversionSettings,
  Hunyuan3DConfig,
  Hunyuan3DServiceResponse,
  ProcessingProgress,
  ApiResponse
} from '@/types/hunyuan3d';

// Legacy interface for backward compatibility
export interface BlueprintAnalysis {
  imageSize: {
    width: number;
    height: number;
  };
  detectedElements: string[];
  architecturalStyle: string;
  complexity: 'low' | 'medium' | 'high';
  estimatedConversionTime: number;
  enhancedFeatures?: {
    drawingType: string;
    projection: string;
    roomCount: number;
    doorCount: number;
    windowCount: number;
    scaleDetected: boolean;
    scaleRatio: number;
    scaleUnit: string;
    ocrConfidence: number;
    textRegions: number;
    structuralComplexity: number;
    remoteAnalysisAvailable: boolean;
  };
  processingQuality?: {
    imageClarity: number;
    lineAccuracy: number;
    textReadability: number;
    lineDefinition: number;
    overallScore: number;
  };
}

// Using interfaces from central types file
// Legacy interface names maintained for backward compatibility
export type Hunyuan3DConversionOptions = ConversionSettings;
export type Hunyuan3DResult = ConversionResult;

export interface JobStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: any;
  error?: string;
  estimatedTime?: string;
}

class Hunyuan3DService {
  private config: Hunyuan3DConfig;
  private _isAvailable: boolean = false;
  private lastHealthCheck: number = 0;

  constructor() {
    this.config = {
      baseUrl: process.env.NEXT_PUBLIC_HUNYUAN3D_URL || 'http://localhost:8000',
      model: 'tencent/Hunyuan3D-2',
      enableTextures: true,
      quality: 'standard',
      maxRetries: 3,
      timeout: 120000, // 2 minutes
      fallbackMode: false
    };

    // Check service availability on initialization
    this.checkAvailability();
  }

  public getConfig(): Hunyuan3DConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<Hunyuan3DConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public isServiceAvailable(): boolean {
    return this._isAvailable;
  }

  private async checkAvailability(): Promise<boolean> {
    const now = Date.now();

    // Cache health check for 30 seconds
    if (now - this.lastHealthCheck < 30000 && this._isAvailable) {
      return this._isAvailable;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        this._isAvailable = data.status === 'healthy' && data.model_loaded;
        this.lastHealthCheck = now;

        console.log('🤖 Real Hunyuan3D-2 Service:', {
          available: this._isAvailable,
          device: data.device,
          modelLoaded: data.model_loaded,
          pipelines: data.pipelines
        });

        return this._isAvailable;
      }
    } catch (error) {
      console.warn('⚠️ Hunyuan3D service not available at:', this.config.baseUrl);
    }

    this._isAvailable = false;
    this.lastHealthCheck = now;
    return false;
  }

  /**
   * Real blueprint analysis using production-ready computer vision
   */
  public async analyzeBlueprint(file: File): Promise<BlueprintAnalysisResult> {
    PerformanceMonitor.startTimer('blueprint-analysis-real');

    try {
      // Check if real service is available
      const serviceAvailable = await this.checkAvailability();

      if (serviceAvailable) {
        // Use real Hunyuan3D analysis
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.config.baseUrl}/analyze`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30000)
        });

        if (response.ok) {
          const data = await response.json();

          const analysis: BlueprintAnalysis = {
            imageSize: {
              width: data.analysis.image_properties.width,
              height: data.analysis.image_properties.height
            },
            detectedElements: this.generateDetectedElements(data.analysis),
            architecturalStyle: this.determineArchitecturalStyle(data.analysis),
            complexity: data.analysis.complexity_analysis?.detail_level || 'medium',
            estimatedConversionTime: this.estimateConversionTime(data.analysis),
            enhancedFeatures: {
              drawingType: 'blueprint',
              projection: 'orthographic',
              roomCount: data.analysis.detected_features.estimated_rooms,
              doorCount: data.analysis.detected_features.estimated_doors,
              windowCount: data.analysis.detected_features.estimated_windows,
              scaleDetected: false,
              scaleRatio: 50,
              scaleUnit: 'unknown',
              ocrConfidence: 0,
              textRegions: 0,
              structuralComplexity: Math.min(10, Math.floor(data.analysis.detected_features.large_contours / 10)),
              remoteAnalysisAvailable: true
            },
            processingQuality: {
              imageClarity: data.analysis.complexity_analysis?.complexity_score || 75,
              lineAccuracy: Math.min(95, data.analysis.detected_features.large_contours * 10),
              textReadability: 0,
              lineDefinition: Math.min(95, data.analysis.detected_features.large_contours * 8),
              overallScore: data.analysis.complexity_analysis?.complexity_score || 75
            }
          };

          PerformanceMonitor.endTimer('blueprint-analysis-real');

          // Convert to new interface format
          return {
            complexity: analysis.complexity,
            detectedElements: analysis.detectedElements.map((element, index) => ({
              id: `element_${index}`,
              type: 'unknown' as const,
              x: 0,
              y: 0,
              width: 50,
              height: 50,
              confidence: 0.8,
              properties: { description: element }
            })),
            enhancedFeatures: analysis.enhancedFeatures || {
              roomCount: 4,
              doorCount: 3,
              windowCount: 6
            },
            metadata: {
              version: '2.0',
              timestamp: Date.now(),
              processingMethod: 'real',
              imageProperties: {
                width: analysis.imageSize.width,
                height: analysis.imageSize.height,
                format: 'unknown'
              },
              conversionSettings: {}
            },
            confidence: analysis.processingQuality?.overallScore || 75,
            processingTime: Date.now()
          };
        }
      }

      throw new Error('Hunyuan3D service is not available. Please check the service configuration and try again.');

    } catch (error) {
      ErrorTracker.trackError('blueprint-analysis-real', error as Error, { fileName: file.name });
      throw error;
    }
  }

  /**
   * Real 2D to 3D conversion using Hunyuan3D-2
   */
  public async convertBlueprintTo3D(
    file: File,
    options: Hunyuan3DConversionOptions = {}
  ): Promise<Hunyuan3DResult> {
    PerformanceMonitor.startTimer('blueprint-to-3d-real');

    try {
      // Check if real service is available
      const serviceAvailable = await this.checkAvailability();

      if (serviceAvailable) {
        console.log('🤖 Using Real Hunyuan3D-2 for conversion');

        // Prepare form data
        const formData = new FormData();
        formData.append('image', file);
        formData.append('prompt', options.prompt || 'A detailed 3D architectural building model');
        formData.append('style', options.style || 'architectural');
        formData.append('quality', options.quality || this.config.quality);
        formData.append('include_textures', String(options.includeTextures ?? this.config.enableTextures));
        formData.append('octree_resolution', String(options.octreeResolution || 128));
        formData.append('num_inference_steps', String(options.numInferenceSteps || 5));
        formData.append('guidance_scale', String(options.guidanceScale || 5.0));
        formData.append('max_face_count', String(options.maxFaceCount || 40000));
        formData.append('seed', String(options.seed || Math.floor(Math.random() * 10000)));

        // Start generation
        const response = await fetch(`${this.config.baseUrl}/generate3d`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(this.config.timeout)
        });

        if (!response.ok) {
          throw new Error(`Real Hunyuan3D API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Real conversion failed');
        }

        // Poll for completion
        const result = await this.pollJobCompletion(data.job_id);

        PerformanceMonitor.endTimer('blueprint-to-3d-real');
        return {
          success: true,
          jobId: data.job_id,
          modelUrl: result.result?.model_url,
          textureUrl: result.result?.texture_url,
          metadata: result.result,
          fallbackUsed: false,
          processingTime: Date.now()
        };
      }

      throw new Error('Hunyuan3D service is not available. Please check the service configuration and try again.');

    } catch (error) {
      ErrorTracker.trackError('blueprint-to-3d-real', error as Error, { fileName: file.name });

      return {
        success: false,
        fallbackUsed: false,
        error: error instanceof Error ? error.message : 'Unknown error in real conversion',
        metadata: {},
        processingTime: 0
      };
    }
  }

  private async pollJobCompletion(jobId: string, maxAttempts: number = 60): Promise<JobStatus> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.config.baseUrl}/status/${jobId}`);

        if (!response.ok) {
          throw new Error('Failed to get job status');
        }

        const status: JobStatus = await response.json();

        if (status.status === 'completed') {
          return status;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Job failed');
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;

      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
      }
    }

    throw new Error('Job polling timeout');
  }

  private generateDetectedElements(analysis: any): string[] {
    const elements = [];
    const features = analysis.detected_features;

    if (features.estimated_walls > 0) {
      for (let i = 0; i < features.estimated_walls; i++) {
        elements.push(`wall_${i}`);
      }
    }

    if (features.estimated_doors > 0) {
      for (let i = 0; i < features.estimated_doors; i++) {
        elements.push(`door_${i}`);
      }
    }

    if (features.estimated_windows > 0) {
      for (let i = 0; i < features.estimated_windows; i++) {
        elements.push(`window_${i}`);
      }
    }

    if (features.estimated_rooms > 0) {
      for (let i = 0; i < features.estimated_rooms; i++) {
        elements.push(`room_${i}`);
      }
    }

    return elements;
  }

  private estimateConversionTime(analysis: any): number {
    const complexity = analysis.complexity_analysis?.complexity_score || 50;
    const baseTime = 30000; // 30 seconds base
    const complexityMultiplier = complexity / 50; // Scale based on complexity
    return Math.round(baseTime * complexityMultiplier);
  }

  private determineArchitecturalStyle(analysis: any): string {
    const complexity = analysis.complexity_analysis?.complexity_score || 50;

    if (complexity > 80) return 'modern';
    if (complexity > 60) return 'contemporary';
    if (complexity > 40) return 'traditional';
    return 'simple';
  }

  /**
   * Get supported model formats
   */
  public async getModelFormats(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/formats`);

      if (response.ok) {
        const data = await response.json();
        return data.output_formats || ['glb', 'obj'];
      }
    } catch (error) {
      console.warn('Failed to get model formats:', error);
    }

    return ['glb', 'obj'];
  }

  /**
   * Load or switch models
   */
  public async loadModels(modelPath: string = 'tencent/Hunyuan3D-2', enableTexture: boolean = true): Promise<boolean> {
    try {
      const formData = new FormData();
      formData.append('model_path', modelPath);
      formData.append('enable_texture', String(enableTexture));

      const response = await fetch(`${this.config.baseUrl}/load_models`, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(60000) // 1 minute timeout for model loading
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Models loaded successfully:', data);
        this._isAvailable = true;
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to load models:', error);
    }

    return false;
  }

  /**
   * Get service status and metrics
   */
  public async getServiceStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`);

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Failed to get service status:', error);
    }

    return {
      status: 'unavailable',
      model_loaded: false,
      device: 'unknown'
    };
  }

  // Legacy methods for backward compatibility
  public isAvailable(): boolean {
    return this._isAvailable;
  }
}

// Export singleton instance
export const hunyuan3DService = new Hunyuan3DService();

export default hunyuan3DService;
