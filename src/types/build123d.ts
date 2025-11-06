/**
 * TypeScript type definitions for Build123d CAD Service
 * 
 * Provides type-safe interfaces for parametric CAD operations,
 * model generation, and professional CAD export functionality.
 */

// ============================================================================
// Core CAD Types
// ============================================================================

export interface Dimensions3D {
  width: number;
  height: number;
  depth: number;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  z: number;
}

// ============================================================================
// Model Parameters
// ============================================================================

export interface ColumnParameters {
  height: number;
  shaft_diameter: number;
  base_size: number;
  hole_count: number;
  hole_diameter: number;
  material: string;
  add_capital: boolean;
}

export interface BoxParameters {
  dimensions: Dimensions3D;
  wall_thickness: number;
  has_lid: boolean;
  corner_radius?: number;
  mounting_holes: boolean;
}

export interface PrimitiveParameters {
  shape: 'box' | 'cylinder' | 'sphere' | 'cone' | 'torus';
  width?: number;
  height?: number;
  depth?: number;
  radius?: number;
}

// ============================================================================
// Model Properties
// ============================================================================

export interface ModelProperties {
  volume: number;
  surface_area: number;
  bounding_box: BoundingBox;
  center_of_mass: Point3D;
  mass_estimate?: number;
}

export interface MaterialProperties {
  type: string;
  density: number;
  mass_kg: number;
}

// ============================================================================
// Export & Results
// ============================================================================

export interface ModelExports {
  step?: string;
  stl?: string;
  gltf?: string;
  brep?: string;
  iges?: string;
  dxf?: string;
}

export type ExportFormat = 'step' | 'stl' | 'gltf' | 'brep' | 'iges' | 'dxf';

export interface CADGenerationResult {
  success: boolean;
  model_id: string;
  model_type: string;
  exports: ModelExports;
  properties: ModelProperties;
  parameters: Record<string, any>;
  material?: MaterialProperties;
  mode?: 'demo' | 'production';
  message?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface GenerateColumnRequest {
  params: ColumnParameters;
}

export interface GenerateBoxRequest {
  params: BoxParameters;
}

export interface ExportRequest {
  model_id: string;
  format: ExportFormat;
  options?: Record<string, any>;
}

export interface FilletOperationRequest {
  model_id: string;
  edge_indices: number[];
  radius: number;
}

export interface ChamferOperationRequest {
  model_id: string;
  edge_indices: number[];
  distance: number;
}

// ============================================================================
// Job Status
// ============================================================================

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface CADJob {
  job_id: string;
  status: JobStatus;
  progress: number;
  message: string;
  created_at: string;
  completed_at?: string;
  result?: CADGenerationResult;
}

// ============================================================================
// Service Status
// ============================================================================

export interface CADServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  build123d_installed: boolean;
  active_jobs: number;
  total_jobs: number;
  output_directory: string;
  timestamp: string;
}

// ============================================================================
// CAD Operations
// ============================================================================

export type CADOperationType = 
  | 'fillet'
  | 'chamfer'
  | 'shell'
  | 'offset'
  | 'boolean_union'
  | 'boolean_subtract'
  | 'boolean_intersect'
  | 'mirror'
  | 'array'
  | 'rotate'
  | 'scale';

export interface CADOperation {
  operation: CADOperationType;
  parameters: Record<string, any>;
}

// ============================================================================
// Helper Type Guards
// ============================================================================

export function isCADGenerationResult(obj: any): obj is CADGenerationResult {
  return (
    typeof obj === 'object' &&
    'success' in obj &&
    'model_id' in obj &&
    'exports' in obj
  );
}

export function isCADJob(obj: any): obj is CADJob {
  return (
    typeof obj === 'object' &&
    'job_id' in obj &&
    'status' in obj &&
    'progress' in obj
  );
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface CADBuilderProps {
  onModelGenerated?: (result: CADGenerationResult) => void;
  onError?: (error: Error) => void;
  className?: string;
}

export interface CADViewerProps {
  modelId: string;
  modelData?: CADGenerationResult;
  showProperties?: boolean;
  showExportOptions?: boolean;
  className?: string;
}

export interface ParametricFormProps {
  modelType: 'column' | 'box' | 'primitive';
  initialValues?: Partial<ColumnParameters | BoxParameters | PrimitiveParameters>;
  onSubmit: (params: any) => Promise<void>;
  isLoading?: boolean;
}

// ============================================================================
// API Client Types
// ============================================================================

export interface CADServiceClient {
  generateColumn: (params: ColumnParameters) => Promise<CADGenerationResult>;
  generateBox: (params: BoxParameters) => Promise<CADGenerationResult>;
  generatePrimitive: (params: PrimitiveParameters) => Promise<CADGenerationResult>;
  applyFillet: (modelId: string, edges: number[], radius: number) => Promise<CADGenerationResult>;
  exportModel: (modelId: string, format: ExportFormat) => Promise<Blob>;
  getJobStatus: (jobId: string) => Promise<CADJob>;
  cleanupModel: (modelId: string) => Promise<{ success: boolean; deleted_formats: string[] }>;
  healthCheck: () => Promise<CADServiceHealth>;
}

// ============================================================================
// Error Types
// ============================================================================

export class CADServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'CADServiceError';
  }
}

export class CADGenerationError extends CADServiceError {
  constructor(message: string, details?: any) {
    super(message, 500, details);
    this.name = 'CADGenerationError';
  }
}

export class CADExportError extends CADServiceError {
  constructor(message: string, details?: any) {
    super(message, 500, details);
    this.name = 'CADExportError';
  }
}

// ============================================================================
// Utility Types
// ============================================================================

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
