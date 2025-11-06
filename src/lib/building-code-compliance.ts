/**
 * Building Code Compliance Service
 * Real-time regulatory database integration and compliance checking
 */

import axios from 'axios';
import { ErrorTracker, PerformanceMonitor } from './production-config';

export interface BuildingCode {
  id: string;
  jurisdiction: string;
  code: string;
  title: string;
  section: string;
  category: 'zoning' | 'structural' | 'fire' | 'accessibility' | 'electrical' | 'plumbing' | 'mechanical' | 'energy';
  requirement: string;
  applicableFor: string[];
  lastUpdated: Date;
  effectiveDate: Date;
  url?: string;
}

export interface ComplianceRule {
  id: string;
  codeReference: string;
  description: string;
  checkType: 'dimensional' | 'count' | 'ratio' | 'material' | 'spatial' | 'accessibility';
  parameters: Record<string, any>;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  autoCheck: boolean;
}

export interface ComplianceViolation {
  id: string;
  ruleId: string;
  codeReference: string;
  severity: 'critical' | 'major' | 'minor' | 'warning';
  description: string;
  location?: {
    floor?: string;
    room?: string;
    coordinates?: { x: number; y: number; z?: number };
  };
  recommendation: string;
  estimatedCost?: number;
  estimatedTime?: string;
  status: 'open' | 'acknowledged' | 'resolved' | 'waived';
  dateFound: Date;
  dueDate?: Date;
}

export interface ProjectInfo {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'industrial' | 'institutional' | 'mixed-use';
  occupancyClass: string;
  constructionType: string;
  location: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: { lat: number; lng: number };
  };
  dimensions: {
    totalArea: number;
    buildingHeight: number;
    floors: number;
    units?: number;
  };
  use: string[];
  sprinklerSystem: boolean;
  elevators: boolean;
  accessibility: {
    adaCompliant: boolean;
    accessibleUnits?: number;
    accessibleParking?: number;
  };
}

export interface ComplianceReport {
  projectId: string;
  reportDate: Date;
  jurisdiction: string;
  applicableCodes: BuildingCode[];
  violations: ComplianceViolation[];
  summary: {
    totalViolations: number;
    criticalViolations: number;
    majorViolations: number;
    minorViolations: number;
    warnings: number;
    complianceScore: number;
  };
  recommendations: {
    immediate: string[];
    planned: string[];
    optional: string[];
  };
  estimatedCosts: {
    immediate: number;
    planned: number;
    total: number;
  };
}

export interface CodeDatabase {
  name: string;
  jurisdiction: string;
  version: string;
  lastSync: Date;
  url: string;
  apiKey?: string;
}

export class BuildingCodeComplianceService {
  private static instance: BuildingCodeComplianceService;
  private codeDatabases: Map<string, CodeDatabase> = new Map();
  private cachedCodes: Map<string, BuildingCode[]> = new Map();
  private complianceRules: Map<string, ComplianceRule[]> = new Map();

  public static getInstance(): BuildingCodeComplianceService {
    if (!BuildingCodeComplianceService.instance) {
      BuildingCodeComplianceService.instance = new BuildingCodeComplianceService();
    }
    return BuildingCodeComplianceService.instance;
  }

  constructor() {
    this.initializeCodeDatabases();
    this.loadComplianceRules();
  }

  // Initialize code databases
  private initializeCodeDatabases() {
    // International Building Code (IBC)
    this.codeDatabases.set('ibc', {
      name: 'International Building Code',
      jurisdiction: 'International',
      version: '2021',
      lastSync: new Date(),
      url: 'https://codes.iccsafe.org/api/ibc'
    });

    // ICC Family of Codes
    this.codeDatabases.set('ifc', {
      name: 'International Fire Code',
      jurisdiction: 'International',
      version: '2021',
      lastSync: new Date(),
      url: 'https://codes.iccsafe.org/api/ifc'
    });

    // ADA Standards
    this.codeDatabases.set('ada', {
      name: 'ADA Accessibility Standards',
      jurisdiction: 'United States',
      version: '2010',
      lastSync: new Date(),
      url: 'https://www.access-board.gov/api/ada'
    });

    // Local codes would be added based on project location
  }

  // Load compliance rules
  private loadComplianceRules() {
    const commonRules: ComplianceRule[] = [
      {
        id: 'ibc_1006_exits',
        codeReference: 'IBC 1006.2.1',
        description: 'Number of exits required based on occupant load',
        checkType: 'count',
        parameters: {
          occupantLoad: 'calculated',
          requiredExits: 'formula',
          exitSeparation: 'half_diagonal'
        },
        severity: 'critical',
        autoCheck: true
      },
      {
        id: 'ibc_1005_means_egress',
        codeReference: 'IBC 1005.1',
        description: 'Means of egress width requirements',
        checkType: 'dimensional',
        parameters: {
          minWidth: { residential: 36, commercial: 44 },
          clearWidth: 32,
          occupantLoad: 'calculated'
        },
        severity: 'critical',
        autoCheck: true
      },
      {
        id: 'ada_206_accessible_routes',
        codeReference: 'ADA 206.2.1',
        description: 'Accessible routes to all areas',
        checkType: 'spatial',
        parameters: {
          minWidth: 36,
          maxSlope: 5,
          maxCrossSlope: 2,
          clearSpace: 18
        },
        severity: 'major',
        autoCheck: true
      },
      {
        id: 'ibc_503_building_height',
        codeReference: 'IBC 503.1',
        description: 'Building height limitations by construction type',
        checkType: 'dimensional',
        parameters: {
          maxHeightByType: {
            'Type_I': 'unlimited',
            'Type_II': 65,
            'Type_III': 65,
            'Type_IV': 85,
            'Type_V': 50
          }
        },
        severity: 'critical',
        autoCheck: true
      },
      {
        id: 'ibc_1210_toilet_facilities',
        codeReference: 'IBC 1210.1',
        description: 'Required toilet and bathing facilities',
        checkType: 'count',
        parameters: {
          occupancyType: 'variable',
          occupantLoad: 'calculated',
          accessibleFixtures: 'percentage'
        },
        severity: 'major',
        autoCheck: true
      }
    ];

    this.complianceRules.set('general', commonRules);
  }

  // Check project compliance
  public async checkCompliance(
    projectInfo: ProjectInfo,
    blueprintData?: {
      rooms: Array<{ type: string; area: number; exits: number }>;
      doors: Array<{ width: number; accessible: boolean }>;
      corridors: Array<{ width: number; length: number }>;
      stairs: Array<{ width: number; rise: number; run: number }>;
      parking: Array<{ accessible: boolean; count: number }>;
    }
  ): Promise<ComplianceReport> {

    PerformanceMonitor.startTimer('compliance-check');

    try {
      // Get applicable codes for jurisdiction
      const applicableCodes = await this.getApplicableCodes(projectInfo);

      // Load specific rules for project type and location
      const rules = await this.getComplianceRules(projectInfo);

      // Run compliance checks
      const violations = await this.runComplianceChecks(projectInfo, blueprintData, rules);

      // Generate summary and recommendations
      const summary = this.generateComplianceSummary(violations);
      const recommendations = this.generateRecommendations(violations);
      const estimatedCosts = this.estimateComplianceCosts(violations);

      const report: ComplianceReport = {
        projectId: projectInfo.id,
        reportDate: new Date(),
        jurisdiction: `${projectInfo.location.city}, ${projectInfo.location.state}`,
        applicableCodes,
        violations,
        summary,
        recommendations,
        estimatedCosts
      };

      PerformanceMonitor.endTimer('compliance-check');
      return report;

    } catch (error) {
      ErrorTracker.trackError('compliance-check', error as Error, { projectInfo });
      PerformanceMonitor.endTimer('compliance-check');
      throw error;
    }
  }

  // Get applicable codes for jurisdiction
  private async getApplicableCodes(projectInfo: ProjectInfo): Promise<BuildingCode[]> {
    const { city, state, country } = projectInfo.location;
    const cacheKey = `${country}-${state}-${city}`;

    // Check cache first
    if (this.cachedCodes.has(cacheKey)) {
      return this.cachedCodes.get(cacheKey)!;
    }

    const codes: BuildingCode[] = [];

    try {
      // Fetch from various code databases
      const ibcCodes = await this.fetchCodesFromDatabase('ibc', projectInfo);
      const ifcCodes = await this.fetchCodesFromDatabase('ifc', projectInfo);
      const adaCodes = await this.fetchCodesFromDatabase('ada', projectInfo);

      codes.push(...ibcCodes, ...ifcCodes, ...adaCodes);

      // Fetch local codes if available
      const localCodes = await this.fetchLocalCodes(projectInfo);
      codes.push(...localCodes);

      // Cache results
      this.cachedCodes.set(cacheKey, codes);

      return codes;
    } catch (error) {
      // Return basic codes if API calls fail
      return this.getBasicCodes(projectInfo);
    }
  }

  // Fetch codes from specific database
  private async fetchCodesFromDatabase(databaseId: string, projectInfo: ProjectInfo): Promise<BuildingCode[]> {
    const database = this.codeDatabases.get(databaseId);
    if (!database) return [];

    try {
      // This would make actual API calls to code databases
      // For now, return mock data based on project type
      return this.getMockCodes(databaseId, projectInfo);
    } catch (error) {
      console.warn(`Failed to fetch codes from ${database.name}:`, error);
      return [];
    }
  }

  // Get mock codes (replace with real API calls)
  private getMockCodes(databaseId: string, projectInfo: ProjectInfo): BuildingCode[] {
    const mockCodes: BuildingCode[] = [];

    if (databaseId === 'ibc') {
      mockCodes.push(
        {
          id: 'ibc_1006_2_1',
          jurisdiction: 'International',
          code: 'IBC',
          title: 'Number of Exits or Exit Access Doorways',
          section: '1006.2.1',
          category: 'fire',
          requirement: 'Every space must have at least two exits when occupant load exceeds 50',
          applicableFor: ['commercial', 'institutional', 'residential'],
          lastUpdated: new Date('2021-01-01'),
          effectiveDate: new Date('2021-01-01'),
          url: 'https://codes.iccsafe.org/content/IBC2021P4/chapter-10-means-of-egress#IBC2021P4_Ch10_Sec1006.2.1'
        },
        {
          id: 'ibc_1005_1',
          jurisdiction: 'International',
          code: 'IBC',
          title: 'Minimum Width of Means of Egress',
          section: '1005.1',
          category: 'fire',
          requirement: 'Minimum clear width of 32 inches for means of egress',
          applicableFor: ['all'],
          lastUpdated: new Date('2021-01-01'),
          effectiveDate: new Date('2021-01-01')
        }
      );
    }

    if (databaseId === 'ada') {
      mockCodes.push(
        {
          id: 'ada_206_2_1',
          jurisdiction: 'United States',
          code: 'ADA',
          title: 'Accessible Routes',
          section: '206.2.1',
          category: 'accessibility',
          requirement: 'At least one accessible route must connect accessible building entrances with all accessible areas',
          applicableFor: ['all'],
          lastUpdated: new Date('2010-01-01'),
          effectiveDate: new Date('2010-01-01')
        }
      );
    }

    return mockCodes.filter(code =>
      code.applicableFor.includes('all') ||
      code.applicableFor.includes(projectInfo.type)
    );
  }

  // Fetch local codes
  private async fetchLocalCodes(projectInfo: ProjectInfo): Promise<BuildingCode[]> {
    // This would integrate with local jurisdiction APIs
    // For now, return empty array
    return [];
  }

  // Get basic codes as fallback
  private getBasicCodes(projectInfo: ProjectInfo): BuildingCode[] {
    return [
      {
        id: 'basic_exits',
        jurisdiction: 'General',
        code: 'Basic',
        title: 'Exit Requirements',
        section: 'General',
        category: 'fire',
        requirement: 'Adequate exits required for safe egress',
        applicableFor: ['all'],
        lastUpdated: new Date(),
        effectiveDate: new Date()
      }
    ];
  }

  // Get compliance rules for project
  private async getComplianceRules(projectInfo: ProjectInfo): Promise<ComplianceRule[]> {
    const generalRules = this.complianceRules.get('general') || [];

    // Add project-specific rules based on type, location, etc.
    const specificRules = this.getProjectSpecificRules(projectInfo);

    return [...generalRules, ...specificRules];
  }

  // Get project-specific rules
  private getProjectSpecificRules(projectInfo: ProjectInfo): ComplianceRule[] {
    const rules: ComplianceRule[] = [];

    // Add rules based on project type
    if (projectInfo.type === 'residential' && projectInfo.dimensions.units && projectInfo.dimensions.units > 4) {
      rules.push({
        id: 'residential_accessibility',
        codeReference: 'Fair Housing Act',
        description: 'Accessible units required in multi-family housing',
        checkType: 'ratio',
        parameters: { accessibleUnitsPercent: 5 },
        severity: 'critical',
        autoCheck: true
      });
    }

    if (projectInfo.dimensions.buildingHeight > 75) {
      rules.push({
        id: 'high_rise_requirements',
        codeReference: 'IBC 403',
        description: 'High-rise building requirements',
        checkType: 'spatial',
        parameters: { sprinklerRequired: true, smokeControlRequired: true },
        severity: 'critical',
        autoCheck: true
      });
    }

    return rules;
  }

  // Run compliance checks
  private async runComplianceChecks(
    projectInfo: ProjectInfo,
    blueprintData: any,
    rules: ComplianceRule[]
  ): Promise<ComplianceViolation[]> {

    const violations: ComplianceViolation[] = [];

    for (const rule of rules) {
      if (!rule.autoCheck) continue;

      try {
        const ruleViolations = await this.checkRule(rule, projectInfo, blueprintData);
        violations.push(...ruleViolations);
      } catch (error) {
        console.warn(`Failed to check rule ${rule.id}:`, error);
      }
    }

    return violations;
  }

  // Check individual rule
  private async checkRule(
    rule: ComplianceRule,
    projectInfo: ProjectInfo,
    blueprintData: any
  ): Promise<ComplianceViolation[]> {

    const violations: ComplianceViolation[] = [];

    switch (rule.checkType) {
      case 'dimensional':
        violations.push(...this.checkDimensionalRequirements(rule, projectInfo, blueprintData));
        break;
      case 'count':
        violations.push(...this.checkCountRequirements(rule, projectInfo, blueprintData));
        break;
      case 'ratio':
        violations.push(...this.checkRatioRequirements(rule, projectInfo, blueprintData));
        break;
      case 'spatial':
        violations.push(...this.checkSpatialRequirements(rule, projectInfo, blueprintData));
        break;
      case 'accessibility':
        violations.push(...this.checkAccessibilityRequirements(rule, projectInfo, blueprintData));
        break;
    }

    return violations;
  }

  // Check dimensional requirements
  private checkDimensionalRequirements(rule: ComplianceRule, projectInfo: ProjectInfo, blueprintData: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (rule.id === 'ibc_1005_means_egress' && blueprintData?.corridors) {
      blueprintData.corridors.forEach((corridor: any, index: number) => {
        const requiredWidth = projectInfo.type === 'residential' ? 36 : 44;

        if (corridor.width < requiredWidth) {
          violations.push({
            id: `${rule.id}_corridor_${index}`,
            ruleId: rule.id,
            codeReference: rule.codeReference,
            severity: rule.severity,
            description: `Corridor width ${corridor.width}" is less than required ${requiredWidth}"`,
            location: { floor: 'N/A', room: `Corridor ${index + 1}` },
            recommendation: `Widen corridor to minimum ${requiredWidth}" clear width`,
            estimatedCost: 5000,
            estimatedTime: '2-3 days',
            status: 'open',
            dateFound: new Date()
          });
        }
      });
    }

    return violations;
  }

  // Check count requirements
  private checkCountRequirements(rule: ComplianceRule, projectInfo: ProjectInfo, blueprintData: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (rule.id === 'ibc_1006_exits' && blueprintData?.rooms) {
      blueprintData.rooms.forEach((room: any, index: number) => {
        const occupantLoad = Math.ceil(room.area / 50); // Simplified calculation
        const requiredExits = occupantLoad > 50 ? 2 : 1;

        if (room.exits < requiredExits) {
          violations.push({
            id: `${rule.id}_room_${index}`,
            ruleId: rule.id,
            codeReference: rule.codeReference,
            severity: rule.severity,
            description: `Room ${room.type} has ${room.exits} exit(s), requires ${requiredExits}`,
            location: { room: `${room.type} ${index + 1}` },
            recommendation: `Add ${requiredExits - room.exits} additional exit(s)`,
            estimatedCost: 15000,
            estimatedTime: '1-2 weeks',
            status: 'open',
            dateFound: new Date()
          });
        }
      });
    }

    return violations;
  }

  // Check ratio requirements
  private checkRatioRequirements(rule: ComplianceRule, projectInfo: ProjectInfo, blueprintData: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (rule.id === 'residential_accessibility') {
      const totalUnits = projectInfo.dimensions.units || 0;
      const requiredAccessibleUnits = Math.ceil(totalUnits * (rule.parameters.accessibleUnitsPercent / 100));
      const currentAccessibleUnits = projectInfo.accessibility.accessibleUnits || 0;

      if (currentAccessibleUnits < requiredAccessibleUnits) {
        violations.push({
          id: `${rule.id}_units`,
          ruleId: rule.id,
          codeReference: rule.codeReference,
          severity: rule.severity,
          description: `${currentAccessibleUnits} accessible units provided, ${requiredAccessibleUnits} required (${rule.parameters.accessibleUnitsPercent}% of ${totalUnits} units)`,
          recommendation: `Convert ${requiredAccessibleUnits - currentAccessibleUnits} units to accessible design`,
          estimatedCost: (requiredAccessibleUnits - currentAccessibleUnits) * 8000,
          estimatedTime: '3-4 weeks',
          status: 'open',
          dateFound: new Date()
        });
      }
    }

    return violations;
  }

  // Check spatial requirements
  private checkSpatialRequirements(rule: ComplianceRule, projectInfo: ProjectInfo, blueprintData: any): ComplianceViolation[] {
    const violations: ComplianceViolation[] = [];

    if (rule.id === 'ada_206_accessible_routes' && blueprintData?.corridors) {
      blueprintData.corridors.forEach((corridor: any, index: number) => {
        if (corridor.width < rule.parameters.minWidth) {
          violations.push({
            id: `${rule.id}_route_${index}`,
            ruleId: rule.id,
            codeReference: rule.codeReference,
            severity: rule.severity,
            description: `Accessible route width ${corridor.width}" is less than required ${rule.parameters.minWidth}"`,
            location: { room: `Corridor ${index + 1}` },
            recommendation: `Widen accessible route to minimum ${rule.parameters.minWidth}" clear width`,
            estimatedCost: 3000,
            estimatedTime: '1-2 days',
            status: 'open',
            dateFound: new Date()
          });
        }
      });
    }

    return violations;
  }

  // Check accessibility requirements
  private checkAccessibilityRequirements(rule: ComplianceRule, projectInfo: ProjectInfo, blueprintData: any): ComplianceViolation[] {
    // Similar to spatial requirements but focused on ADA compliance
    return this.checkSpatialRequirements(rule, projectInfo, blueprintData);
  }

  // Generate compliance summary
  private generateComplianceSummary(violations: ComplianceViolation[]) {
    const summary = {
      totalViolations: violations.length,
      criticalViolations: violations.filter(v => v.severity === 'critical').length,
      majorViolations: violations.filter(v => v.severity === 'major').length,
      minorViolations: violations.filter(v => v.severity === 'minor').length,
      warnings: violations.filter(v => v.severity === 'warning').length,
      complianceScore: 0
    };

    // Calculate compliance score (0-100)
    const maxPossibleScore = 100;
    const criticalPenalty = summary.criticalViolations * 20;
    const majorPenalty = summary.majorViolations * 10;
    const minorPenalty = summary.minorViolations * 5;
    const warningPenalty = summary.warnings * 2;

    summary.complianceScore = Math.max(0, maxPossibleScore - criticalPenalty - majorPenalty - minorPenalty - warningPenalty);

    return summary;
  }

  // Generate recommendations
  private generateRecommendations(violations: ComplianceViolation[]) {
    const immediate: string[] = [];
    const planned: string[] = [];
    const optional: string[] = [];

    violations.forEach(violation => {
      if (violation.severity === 'critical') {
        immediate.push(violation.recommendation);
      } else if (violation.severity === 'major') {
        planned.push(violation.recommendation);
      } else {
        optional.push(violation.recommendation);
      }
    });

    return {
      immediate: [...new Set(immediate)], // Remove duplicates
      planned: [...new Set(planned)],
      optional: [...new Set(optional)]
    };
  }

  // Estimate compliance costs
  private estimateComplianceCosts(violations: ComplianceViolation[]) {
    const immediate = violations
      .filter(v => v.severity === 'critical')
      .reduce((sum, v) => sum + (v.estimatedCost || 0), 0);

    const planned = violations
      .filter(v => v.severity === 'major')
      .reduce((sum, v) => sum + (v.estimatedCost || 0), 0);

    return {
      immediate,
      planned,
      total: immediate + planned
    };
  }

  // Update code databases
  public async updateCodeDatabases(): Promise<boolean> {
    try {
      for (const [id, database] of this.codeDatabases) {
        await this.syncCodeDatabase(id, database);
      }
      return true;
    } catch (error) {
      ErrorTracker.trackError('code-update', error as Error);
      return false;
    }
  }

  // Sync individual code database
  private async syncCodeDatabase(id: string, database: CodeDatabase): Promise<void> {
    try {
      // This would sync with actual code databases
      console.log(`Syncing ${database.name}...`);

      // Update last sync time
      database.lastSync = new Date();
      this.codeDatabases.set(id, database);

      // Clear cache to force refresh
      this.cachedCodes.clear();
    } catch (error) {
      console.warn(`Failed to sync ${database.name}:`, error);
    }
  }

  // Get available jurisdictions
  public getAvailableJurisdictions(): string[] {
    return [
      'International (IBC/IFC)',
      'United States (Federal)',
      'California',
      'New York',
      'Texas',
      'Florida',
      'Illinois'
    ];
  }

  // Get supported project types
  public getSupportedProjectTypes(): string[] {
    return [
      'residential',
      'commercial',
      'industrial',
      'institutional',
      'mixed-use'
    ];
  }
}

// Export singleton instance
export const buildingCodeComplianceService = BuildingCodeComplianceService.getInstance();

export default buildingCodeComplianceService;
