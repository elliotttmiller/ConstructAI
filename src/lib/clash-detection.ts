/**
 * BIM Clash Detection Service
 * Analyzes 3D models for geometric conflicts and clearance issues
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface ModelElement {
  id: string;
  name: string;
  type: string;
  boundingBox: BoundingBox;
  geometry?: any;
}

export interface Clash {
  id: string;
  type: 'hard' | 'soft' | 'clearance';
  severity: 'critical' | 'major' | 'minor';
  description: string;
  elements: string[];
  location: string;
  distance: number;
  modelId: string;
}

export class ClashDetectionService {
  private static instance: ClashDetectionService;

  private constructor() {}

  public static getInstance(): ClashDetectionService {
    if (!ClashDetectionService.instance) {
      ClashDetectionService.instance = new ClashDetectionService();
    }
    return ClashDetectionService.instance;
  }

  /**
   * Detect clashes between model elements
   */
  async detectClashes(
    modelId: string,
    elements: ModelElement[],
    options: {
      hardClashTolerance?: number; // mm
      softClashTolerance?: number; // mm
      clearanceDistance?: number; // mm
    } = {}
  ): Promise<Clash[]> {
    const {
      hardClashTolerance = 0,
      softClashTolerance = 50,
      clearanceDistance = 100,
    } = options;

    const clashes: Clash[] = [];

    // Compare each element with every other element
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const elementA = elements[i];
        const elementB = elements[j];

        // Skip if same type (usually same discipline elements don't clash)
        if (elementA.type === elementB.type) continue;

        const distance = this.calculateDistance(
          elementA.boundingBox,
          elementB.boundingBox
        );

        // Hard clash - elements intersect
        if (distance <= hardClashTolerance) {
          clashes.push({
            id: `clash_${i}_${j}_hard`,
            type: 'hard',
            severity: 'critical',
            description: `${elementA.type} intersects with ${elementB.type}`,
            elements: [elementA.name, elementB.name],
            location: this.getClashLocation(elementA.boundingBox, elementB.boundingBox),
            distance,
            modelId,
          });
        }
        // Soft clash - elements too close
        else if (distance <= softClashTolerance) {
          clashes.push({
            id: `clash_${i}_${j}_soft`,
            type: 'soft',
            severity: distance <= softClashTolerance / 2 ? 'major' : 'minor',
            description: `${elementA.type} clearance issue with ${elementB.type}`,
            elements: [elementA.name, elementB.name],
            location: this.getClashLocation(elementA.boundingBox, elementB.boundingBox),
            distance,
            modelId,
          });
        }
        // Clearance warning
        else if (distance <= clearanceDistance) {
          clashes.push({
            id: `clash_${i}_${j}_clearance`,
            type: 'clearance',
            severity: 'minor',
            description: `${elementA.type} near ${elementB.type} - verify clearance`,
            elements: [elementA.name, elementB.name],
            location: this.getClashLocation(elementA.boundingBox, elementB.boundingBox),
            distance,
            modelId,
          });
        }
      }
    }

    return clashes;
  }

  /**
   * Calculate minimum distance between two bounding boxes
   */
  private calculateDistance(boxA: BoundingBox, boxB: BoundingBox): number {
    // Check if boxes intersect
    if (this.boxesIntersect(boxA, boxB)) {
      return 0;
    }

    // Calculate closest distance between boxes
    let minDistance = Infinity;

    // Check all 8 corners of boxA against boxB
    const cornersA = this.getBoxCorners(boxA);
    for (const corner of cornersA) {
      const dist = this.pointToBoxDistance(corner, boxB);
      minDistance = Math.min(minDistance, dist);
    }

    // Check all 8 corners of boxB against boxA
    const cornersB = this.getBoxCorners(boxB);
    for (const corner of cornersB) {
      const dist = this.pointToBoxDistance(corner, boxA);
      minDistance = Math.min(minDistance, dist);
    }

    return minDistance;
  }

  /**
   * Check if two bounding boxes intersect
   */
  private boxesIntersect(boxA: BoundingBox, boxB: BoundingBox): boolean {
    return (
      boxA.min.x <= boxB.max.x &&
      boxA.max.x >= boxB.min.x &&
      boxA.min.y <= boxB.max.y &&
      boxA.max.y >= boxB.min.y &&
      boxA.min.z <= boxB.max.z &&
      boxA.max.z >= boxB.min.z
    );
  }

  /**
   * Get all 8 corners of a bounding box
   */
  private getBoxCorners(box: BoundingBox): Array<{ x: number; y: number; z: number }> {
    return [
      { x: box.min.x, y: box.min.y, z: box.min.z },
      { x: box.max.x, y: box.min.y, z: box.min.z },
      { x: box.min.x, y: box.max.y, z: box.min.z },
      { x: box.max.x, y: box.max.y, z: box.min.z },
      { x: box.min.x, y: box.min.y, z: box.max.z },
      { x: box.max.x, y: box.min.y, z: box.max.z },
      { x: box.min.x, y: box.max.y, z: box.max.z },
      { x: box.max.x, y: box.max.y, z: box.max.z },
    ];
  }

  /**
   * Calculate distance from point to bounding box
   */
  private pointToBoxDistance(
    point: { x: number; y: number; z: number },
    box: BoundingBox
  ): number {
    const dx = Math.max(box.min.x - point.x, 0, point.x - box.max.x);
    const dy = Math.max(box.min.y - point.y, 0, point.y - box.max.y);
    const dz = Math.max(box.min.z - point.z, 0, point.z - box.max.z);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Get human-readable location string for clash
   */
  private getClashLocation(boxA: BoundingBox, boxB: BoundingBox): string {
    const centerA = {
      x: (boxA.min.x + boxA.max.x) / 2,
      y: (boxA.min.y + boxA.max.y) / 2,
      z: (boxA.min.z + boxA.max.z) / 2,
    };
    const centerB = {
      x: (boxB.min.x + boxB.max.x) / 2,
      y: (boxB.min.y + boxB.max.y) / 2,
      z: (boxB.min.z + boxB.max.z) / 2,
    };

    const midpoint = {
      x: (centerA.x + centerB.x) / 2,
      y: (centerA.y + centerB.y) / 2,
      z: (centerA.z + centerB.z) / 2,
    };

    return `X: ${midpoint.x.toFixed(2)}, Y: ${midpoint.y.toFixed(2)}, Z: ${midpoint.z.toFixed(2)}`;
  }

  /**
   * Parse model geometry to extract elements with bounding boxes
   * This is a placeholder - actual implementation depends on model format (IFC, RVT, etc.)
   */
  async parseModelElements(modelData: any): Promise<ModelElement[]> {
    // TODO: Implement actual model parsing based on format
    // For IFC: use web-ifc library
    // For RVT: use Forge API
    // For GLTF: use Three.js geometry analysis
    
    console.log('Parsing model elements:', modelData);
    
    // Return empty array for now - this should be implemented based on your model format
    return [];
  }
}

export default ClashDetectionService;
