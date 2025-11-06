/**
 * Enhanced BIM Model Processor
 * 
 * Advanced BIM model processing with analysis, optimization,
 * and intelligent feature extraction.
 */

import * as THREE from 'three';

export interface BIMElement {
  id: string;
  type: 'wall' | 'floor' | 'roof' | 'door' | 'window' | 'column' | 'beam' | 'slab' | 'stair' | 'railing' | 'equipment' | 'furniture' | 'other';
  category: 'architectural' | 'structural' | 'mechanical' | 'electrical' | 'plumbing' | 'fire' | 'site' | 'other';
  
  // Geometric properties
  geometry: THREE.BufferGeometry;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  boundingBox: THREE.Box3;
  volume: number;
  surfaceArea: number;
  
  // Material properties
  material: string;
  color: THREE.Color;
  opacity: number;
  
  // Metadata
  level: string;
  family: string;
  typeName: string;
  parameters: Record<string, any>;
  
  // Relationships
  connectedTo: string[];
  hostedBy?: string;
  hosts: string[];
}

export interface BIMAnalysis {
  // Summary statistics
  totalElements: number;
  elementsByType: Record<string, number>;
  elementsByCategory: Record<string, number>;
  elementsByLevel: Record<string, number>;
  
  // Geometric analysis
  totalVolume: number;
  totalSurfaceArea: number;
  boundingBox: THREE.Box3;
  buildingHeight: number;
  footprintArea: number;
  
  // Quality metrics
  qualityScore: number;
  issuesFound: BIMIssue[];
  warnings: string[];
  
  // Performance metrics
  drawCalls: number;
  triangleCount: number;
  materialCount: number;
  textureMemory: number;
  
  // Clash detection
  clashes: BIMClash[];
  
  // Compliance
  complianceChecks: ComplianceCheck[];
}

export interface BIMIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  type: 'geometry' | 'metadata' | 'relationship' | 'compliance' | 'performance';
  elementId?: string;
  description: string;
  location?: THREE.Vector3;
  suggestedFix?: string;
}

export interface BIMClash {
  id: string;
  type: 'hard' | 'soft' | 'clearance';
  severity: 'critical' | 'major' | 'minor';
  element1: string;
  element2: string;
  location: THREE.Vector3;
  volume: number;
  description: string;
}

export interface ComplianceCheck {
  id: string;
  category: 'building-code' | 'accessibility' | 'fire-safety' | 'energy' | 'structural';
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'not-applicable';
  description: string;
  reference?: string;
}

export class EnhancedBIMProcessor {
  
  private elements: Map<string, BIMElement> = new Map();
  private scene: THREE.Scene;
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  /**
   * Process a loaded BIM model
   */
  async processModel(model: THREE.Object3D): Promise<BIMAnalysis> {
    console.log('🏗️ Starting enhanced BIM processing...');
    
    // Extract elements
    await this.extractElements(model);
    
    // Analyze geometry
    const geometricAnalysis = this.analyzeGeometry();
    
    // Detect clashes
    const clashes = await this.detectClashes();
    
    // Check compliance
    const complianceChecks = await this.checkCompliance();
    
    // Identify issues
    const issues = await this.identifyIssues();
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(issues, clashes);
    
    // Performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics();
    
    return {
      totalElements: this.elements.size,
      elementsByType: this.getElementCountsByType(),
      elementsByCategory: this.getElementCountsByCategory(),
      elementsByLevel: this.getElementCountsByLevel(),
      
      ...geometricAnalysis,
      
      qualityScore,
      issuesFound: issues,
      warnings: this.generateWarnings(issues),
      
      ...performanceMetrics,
      
      clashes,
      complianceChecks
    };
  }
  
  /**
   * Extract BIM elements from model
   */
  private async extractElements(model: THREE.Object3D): Promise<void> {
    let elementId = 0;
    
    model.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const element = this.createBIMElement(object, `element_${elementId++}`);
        this.elements.set(element.id, element);
      }
    });
    
    console.log(`✓ Extracted ${this.elements.size} BIM elements`);
  }
  
  /**
   * Create BIM element from mesh
   */
  private createBIMElement(mesh: THREE.Mesh, id: string): BIMElement {
    const geometry = mesh.geometry;
    const boundingBox = new THREE.Box3().setFromObject(mesh);
    
    // Determine element type from name or geometry
    const type = this.determineElementType(mesh);
    const category = this.determineCategory(type);
    const level = this.determineLevel(mesh);
    
    // Calculate properties
    const volume = this.calculateVolume(geometry);
    const surfaceArea = this.calculateSurfaceArea(geometry);
    
    // Extract material info
    const material = mesh.material instanceof THREE.Material ? mesh.material : new THREE.MeshStandardMaterial();
    const color = material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshBasicMaterial
      ? material.color.clone()
      : new THREE.Color(0x888888);
    const opacity = material.opacity;
    
    return {
      id,
      type,
      category,
      geometry,
      position: mesh.position.clone(),
      rotation: mesh.rotation.clone(),
      boundingBox,
      volume,
      surfaceArea,
      material: material.type,
      color,
      opacity,
      level,
      family: mesh.userData.family || 'Unknown',
      typeName: mesh.userData.type || mesh.name || 'Unknown',
      parameters: mesh.userData,
      connectedTo: [],
      hosts: []
    };
  }
  
  /**
   * Determine element type from mesh
   */
  private determineElementType(mesh: THREE.Mesh): BIMElement['type'] {
    const name = (mesh.name || '').toLowerCase();
    const userData = mesh.userData || {};
    
    if (name.includes('wall') || userData.category === 'wall') return 'wall';
    if (name.includes('floor') || userData.category === 'floor') return 'floor';
    if (name.includes('roof') || userData.category === 'roof') return 'roof';
    if (name.includes('door') || userData.category === 'door') return 'door';
    if (name.includes('window') || userData.category === 'window') return 'window';
    if (name.includes('column') || userData.category === 'column') return 'column';
    if (name.includes('beam') || userData.category === 'beam') return 'beam';
    if (name.includes('slab') || userData.category === 'slab') return 'slab';
    if (name.includes('stair') || userData.category === 'stair') return 'stair';
    if (name.includes('railing') || userData.category === 'railing') return 'railing';
    if (name.includes('equipment') || userData.category === 'equipment') return 'equipment';
    if (name.includes('furniture') || userData.category === 'furniture') return 'furniture';
    
    return 'other';
  }
  
  /**
   * Determine category from element type
   */
  private determineCategory(type: BIMElement['type']): BIMElement['category'] {
    const categoryMap: Record<string, BIMElement['category']> = {
      'wall': 'architectural',
      'floor': 'architectural',
      'roof': 'architectural',
      'door': 'architectural',
      'window': 'architectural',
      'column': 'structural',
      'beam': 'structural',
      'slab': 'structural',
      'stair': 'architectural',
      'railing': 'architectural',
      'equipment': 'mechanical',
      'furniture': 'architectural'
    };
    
    return categoryMap[type] || 'other';
  }
  
  /**
   * Determine level from position
   */
  private determineLevel(mesh: THREE.Mesh): string {
    const y = mesh.position.y;
    
    if (y < 0) return 'Foundation';
    if (y < 5) return 'Level 1';
    if (y < 8) return 'Level 2';
    if (y < 11) return 'Level 3';
    if (y < 14) return 'Level 4';
    
    return `Level ${Math.floor(y / 3) + 1}`;
  }
  
  /**
   * Calculate volume of geometry
   * NOTE: Currently uses simplified bounding box approach.
   * For production use, consider implementing proper mesh volume calculation
   * using signed volume of triangles or similar algorithms.
   */
  private calculateVolume(geometry: THREE.BufferGeometry): number {
    // Simplified bounding box volume calculation
    // This provides a rough estimate but is not geometrically accurate
    geometry.computeBoundingBox();
    const box = geometry.boundingBox!;
    const size = new THREE.Vector3();
    box.getSize(size);
    return size.x * size.y * size.z;
  }
  
  /**
   * Calculate surface area of geometry
   */
  private calculateSurfaceArea(geometry: THREE.BufferGeometry): number {
    let area = 0;
    const position = geometry.attributes.position;
    
    if (geometry.index) {
      const index = geometry.index;
      for (let i = 0; i < index.count; i += 3) {
        const a = new THREE.Vector3().fromBufferAttribute(position, index.getX(i));
        const b = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 1));
        const c = new THREE.Vector3().fromBufferAttribute(position, index.getX(i + 2));
        
        const ab = new THREE.Vector3().subVectors(b, a);
        const ac = new THREE.Vector3().subVectors(c, a);
        const cross = new THREE.Vector3().crossVectors(ab, ac);
        
        area += cross.length() / 2;
      }
    }
    
    return area;
  }
  
  /**
   * Analyze geometry
   */
  private analyzeGeometry() {
    let totalVolume = 0;
    let totalSurfaceArea = 0;
    const boundingBox = new THREE.Box3();
    
    this.elements.forEach(element => {
      totalVolume += element.volume;
      totalSurfaceArea += element.surfaceArea;
      boundingBox.union(element.boundingBox);
    });
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    return {
      totalVolume,
      totalSurfaceArea,
      boundingBox,
      buildingHeight: size.y,
      footprintArea: size.x * size.z
    };
  }
  
  /**
   * Detect clashes between elements
   */
  private async detectClashes(): Promise<BIMClash[]> {
    const clashes: BIMClash[] = [];
    const elements = Array.from(this.elements.values());
    
    // Check for intersections between elements
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        const elem1 = elements[i];
        const elem2 = elements[j];
        
        // Skip if same category (some overlaps are expected)
        if (elem1.category === elem2.category) continue;
        
        // Check bounding box intersection
        if (elem1.boundingBox.intersectsBox(elem2.boundingBox)) {
          const intersection = elem1.boundingBox.clone().intersect(elem2.boundingBox);
          const size = new THREE.Vector3();
          intersection.getSize(size);
          const volume = size.x * size.y * size.z;
          
          // Determine clash type and severity
          const type = this.determineClashType(elem1, elem2);
          const severity = volume > 1.0 ? 'critical' : volume > 0.1 ? 'major' : 'minor';
          
          clashes.push({
            id: `clash_${clashes.length + 1}`,
            type,
            severity,
            element1: elem1.id,
            element2: elem2.id,
            location: intersection.getCenter(new THREE.Vector3()),
            volume,
            description: `${elem1.type} intersects with ${elem2.type}`
          });
        }
      }
    }
    
    console.log(`✓ Detected ${clashes.length} clashes`);
    return clashes;
  }
  
  /**
   * Determine clash type
   */
  private determineClashType(elem1: BIMElement, elem2: BIMElement): BIMClash['type'] {
    // Hard clashes: structural elements intersecting
    if ((elem1.category === 'structural' || elem2.category === 'structural') &&
        (elem1.category !== elem2.category)) {
      return 'hard';
    }
    
    // Clearance: mechanical/electrical too close to structural
    if ((elem1.category === 'mechanical' || elem1.category === 'electrical') &&
        elem2.category === 'structural') {
      return 'clearance';
    }
    
    return 'soft';
  }
  
  /**
   * Check building code compliance
   */
  private async checkCompliance(): Promise<ComplianceCheck[]> {
    const checks: ComplianceCheck[] = [];
    
    // Check door widths (accessibility)
    const doors = Array.from(this.elements.values()).filter(e => e.type === 'door');
    doors.forEach(door => {
      const size = new THREE.Vector3();
      door.boundingBox.getSize(size);
      const width = Math.max(size.x, size.z);
      
      checks.push({
        id: `accessibility_door_${door.id}`,
        category: 'accessibility',
        name: 'Door Width Compliance',
        status: width >= 0.9 ? 'pass' : 'fail',
        description: `Door width: ${width.toFixed(2)}m (minimum 0.9m required)`,
        reference: 'ADA Standards'
      });
    });
    
    // Check stair dimensions (safety)
    const stairs = Array.from(this.elements.values()).filter(e => e.type === 'stair');
    stairs.forEach(stair => {
      const size = new THREE.Vector3();
      stair.boundingBox.getSize(size);
      const width = Math.max(size.x, size.z);
      
      checks.push({
        id: `fire_safety_stair_${stair.id}`,
        category: 'fire-safety',
        name: 'Stair Width Compliance',
        status: width >= 1.1 ? 'pass' : 'warning',
        description: `Stair width: ${width.toFixed(2)}m (minimum 1.1m recommended for commercial)`,
        reference: 'IBC 2018'
      });
    });
    
    // Check building height
    const geometricAnalysis = this.analyzeGeometry();
    checks.push({
      id: 'building_height',
      category: 'building-code',
      name: 'Building Height Limit',
      status: geometricAnalysis.buildingHeight < 50 ? 'pass' : 'warning',
      description: `Building height: ${geometricAnalysis.buildingHeight.toFixed(2)}m`,
      reference: 'Local Zoning Code'
    });
    
    console.log(`✓ Completed ${checks.length} compliance checks`);
    return checks;
  }
  
  /**
   * Identify model issues
   */
  private async identifyIssues(): Promise<BIMIssue[]> {
    const issues: BIMIssue[] = [];
    
    this.elements.forEach(element => {
      // Check for zero-volume elements
      if (element.volume < 0.001) {
        issues.push({
          id: `issue_${issues.length}`,
          severity: 'warning',
          type: 'geometry',
          elementId: element.id,
          description: `Element ${element.id} has near-zero volume`,
          location: element.position,
          suggestedFix: 'Review element geometry'
        });
      }
      
      // Check for missing metadata
      if (!element.family || element.family === 'Unknown') {
        issues.push({
          id: `issue_${issues.length}`,
          severity: 'info',
          type: 'metadata',
          elementId: element.id,
          description: `Element ${element.id} missing family information`,
          suggestedFix: 'Add family metadata'
        });
      }
    });
    
    return issues;
  }
  
  /**
   * Calculate quality score
   */
  private calculateQualityScore(issues: BIMIssue[], clashes: BIMClash[]): number {
    let score = 100;
    
    // Deduct points for issues
    issues.forEach(issue => {
      if (issue.severity === 'error') score -= 5;
      if (issue.severity === 'warning') score -= 2;
      if (issue.severity === 'info') score -= 0.5;
    });
    
    // Deduct points for clashes
    clashes.forEach(clash => {
      if (clash.severity === 'critical') score -= 10;
      if (clash.severity === 'major') score -= 5;
      if (clash.severity === 'minor') score -= 1;
    });
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Generate warnings
   */
  private generateWarnings(issues: BIMIssue[]): string[] {
    return issues
      .filter(issue => issue.severity === 'warning' || issue.severity === 'error')
      .map(issue => issue.description);
  }
  
  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics() {
    let triangleCount = 0;
    const materialSet = new Set<string>();
    
    this.elements.forEach(element => {
      if (element.geometry.index) {
        triangleCount += element.geometry.index.count / 3;
      } else {
        triangleCount += element.geometry.attributes.position.count / 3;
      }
      
      materialSet.add(element.material);
    });
    
    return {
      drawCalls: this.elements.size,
      triangleCount: Math.floor(triangleCount),
      materialCount: materialSet.size,
      textureMemory: 0 // Texture memory calculation not yet implemented - would require traversing all materials and calculating texture sizes
    };
  }
  
  /**
   * Get element counts by type
   */
  private getElementCountsByType(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.elements.forEach(element => {
      counts[element.type] = (counts[element.type] || 0) + 1;
    });
    
    return counts;
  }
  
  /**
   * Get element counts by category
   */
  private getElementCountsByCategory(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.elements.forEach(element => {
      counts[element.category] = (counts[element.category] || 0) + 1;
    });
    
    return counts;
  }
  
  /**
   * Get element counts by level
   */
  private getElementCountsByLevel(): Record<string, number> {
    const counts: Record<string, number> = {};
    
    this.elements.forEach(element => {
      counts[element.level] = (counts[element.level] || 0) + 1;
    });
    
    return counts;
  }
  
  /**
   * Get elements by type
   */
  getElementsByType(type: BIMElement['type']): BIMElement[] {
    return Array.from(this.elements.values()).filter(e => e.type === type);
  }
  
  /**
   * Get elements by category
   */
  getElementsByCategory(category: BIMElement['category']): BIMElement[] {
    return Array.from(this.elements.values()).filter(e => e.category === category);
  }
  
  /**
   * Get element by ID
   */
  getElementById(id: string): BIMElement | undefined {
    return this.elements.get(id);
  }
}
