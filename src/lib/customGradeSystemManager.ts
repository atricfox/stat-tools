/**
 * Custom Grade System Manager
 * Handles storage, validation, and management of user-created custom grading systems
 * Features: localStorage persistence, import/export, validation, templates
 */

import { GradePointSystem, ValidationResult, ValidationError, ValidationWarning } from '@/types/gpa';

const STORAGE_KEY = 'statcal_custom_grade_systems';
const VERSION_KEY = 'statcal_custom_systems_version';
const CURRENT_VERSION = '1.0.0';

export interface CustomSystemStorage {
  version: string;
  systems: GradePointSystem[];
  lastUpdated: string;
}

export class CustomGradeSystemManager {
  private systems: Map<string, GradePointSystem> = new Map();
  private listeners: Set<(systems: GradePointSystem[]) => void> = new Set();

  constructor() {
    this.loadSystems();
  }

  /**
   * Load custom systems from localStorage
   */
  private loadSystems(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const version = localStorage.getItem(VERSION_KEY);

      if (!stored || !version) {
        this.initializeStorage();
        return;
      }

      const data: CustomSystemStorage = JSON.parse(stored);

      // Check version compatibility
      if (data.version !== CURRENT_VERSION) {
        this.migrateFromVersion(data.version, data);
        return;
      }

      // Load systems into memory
      data.systems.forEach(system => {
        this.systems.set(system.id, system);
      });

    } catch (error) {
      console.warn('Failed to load custom grade systems:', error);
      this.initializeStorage();
    }
  }

  /**
   * Initialize storage with empty data
   */
  private initializeStorage(): void {
    const initialData: CustomSystemStorage = {
      version: CURRENT_VERSION,
      systems: [],
      lastUpdated: new Date().toISOString()
    };

    this.saveSystems(initialData);
  }

  /**
   * Migrate from older versions
   */
  private migrateFromVersion(fromVersion: string, data: any): void {
    console.log(`Migrating custom systems from version ${fromVersion} to ${CURRENT_VERSION}`);
    
    // For now, just reinitialize - in future versions we'd have actual migration logic
    this.initializeStorage();
  }

  /**
   * Save systems to localStorage
   */
  private saveSystems(data?: CustomSystemStorage): void {
    try {
      const saveData: CustomSystemStorage = data || {
        version: CURRENT_VERSION,
        systems: Array.from(this.systems.values()),
        lastUpdated: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      // Notify listeners
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save custom grade systems:', error);
      throw new Error('Unable to save custom grading system');
    }
  }

  /**
   * Add a listener for system changes
   */
  public addListener(callback: (systems: GradePointSystem[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const systems = this.getAllSystems();
    this.listeners.forEach(callback => callback(systems));
  }

  /**
   * Validate a grading system
   */
  public validateSystem(system: GradePointSystem): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic required fields
    if (!system.name?.trim()) {
      errors.push({
        field: 'name',
        message: 'System name is required',
        value: system.name,
        code: 'required'
      });
    }

    if (!system.country?.trim()) {
      warnings.push({
        field: 'country',
        message: 'Country/region helps identify the system context',
        value: system.country,
        suggestion: 'Add country or region information'
      });
    }

    if (!system.description?.trim()) {
      warnings.push({
        field: 'description',
        message: 'Description helps users understand the system',
        value: system.description,
        suggestion: 'Add a brief description of the grading system'
      });
    }

    // Scale validation
    if (system.scale <= 0 || system.scale > 10) {
      errors.push({
        field: 'scale',
        message: 'Scale must be between 0.1 and 10.0',
        value: system.scale,
        code: 'range'
      });
    }

    // Mappings validation
    if (!system.mappings || system.mappings.length === 0) {
      errors.push({
        field: 'mappings',
        message: 'At least one grade mapping is required',
        value: system.mappings,
        code: 'required'
      });
    } else {
      this.validateMappings(system, errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate grade mappings
   */
  private validateMappings(
    system: GradePointSystem,
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const mappings = system.mappings;

    // Check for duplicate letter grades
    const letterGrades = mappings.map(m => m.letterGrade.toUpperCase().trim());
    const duplicates = letterGrades.filter((grade, index) => 
      grade && letterGrades.indexOf(grade) !== index
    );
    
    if (duplicates.length > 0) {
      errors.push({
        field: 'mappings',
        message: `Duplicate letter grades: ${[...new Set(duplicates)].join(', ')}`,
        value: duplicates,
        code: 'duplicate'
      });
    }

    // Validate individual mappings
    mappings.forEach((mapping, index) => {
      // Required fields
      if (!mapping.letterGrade?.trim()) {
        errors.push({
          field: `mappings.${index}.letterGrade`,
          message: `Letter grade is required for mapping ${index + 1}`,
          value: mapping.letterGrade,
          code: 'required'
        });
      }

      // Grade points validation
      if (typeof mapping.gradePoints !== 'number' || 
          mapping.gradePoints < 0 || 
          mapping.gradePoints > system.scale) {
        errors.push({
          field: `mappings.${index}.gradePoints`,
          message: `Grade points must be between 0 and ${system.scale}`,
          value: mapping.gradePoints,
          code: 'range'
        });
      }

      // Numeric range validation
      if (mapping.numericMin >= mapping.numericMax) {
        errors.push({
          field: `mappings.${index}.range`,
          message: `Numeric minimum (${mapping.numericMin}) must be less than maximum (${mapping.numericMax})`,
          value: [mapping.numericMin, mapping.numericMax],
          code: 'range'
        });
      }

      // Percentage range validation
      if (mapping.percentageMin && mapping.percentageMax && 
          mapping.percentageMin >= mapping.percentageMax) {
        errors.push({
          field: `mappings.${index}.percentage`,
          message: `Percentage minimum must be less than maximum`,
          value: [mapping.percentageMin, mapping.percentageMax],
          code: 'range'
        });
      }
    });

    // Check for gaps and overlaps in coverage
    this.validateCoverage(mappings, warnings, errors);
  }

  /**
   * Validate coverage (gaps and overlaps)
   */
  private validateCoverage(
    mappings: any[],
    warnings: ValidationWarning[],
    errors: ValidationError[]
  ): void {
    const validMappings = mappings.filter(m => 
      typeof m.numericMin === 'number' && 
      typeof m.numericMax === 'number' &&
      m.numericMin < m.numericMax
    );

    if (validMappings.length < 2) return;

    const sortedMappings = [...validMappings].sort((a, b) => b.numericMin - a.numericMin);

    for (let i = 0; i < sortedMappings.length - 1; i++) {
      const current = sortedMappings[i];
      const next = sortedMappings[i + 1];

      // Check for overlap
      if (current.numericMin <= next.numericMax) {
        errors.push({
          field: 'mappings',
          message: `Grade ranges overlap: ${next.letterGrade} (${next.numericMin}-${next.numericMax}) and ${current.letterGrade} (${current.numericMin}-${current.numericMax})`,
          value: [current, next],
          code: 'overlap'
        });
      }
      // Check for gap
      else if (current.numericMin > next.numericMax + 1) {
        warnings.push({
          field: 'mappings',
          message: `Gap in coverage between ${next.letterGrade} (max: ${next.numericMax}) and ${current.letterGrade} (min: ${current.numericMin})`,
          value: [next.numericMax, current.numericMin],
          suggestion: 'Consider adjusting ranges to ensure full coverage'
        });
      }
    }
  }

  /**
   * Save a custom system
   */
  public async saveSystem(system: GradePointSystem): Promise<void> {
    // Validate before saving
    const validation = this.validateSystem(system);
    if (!validation.isValid) {
      throw new Error(`Invalid grading system: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Ensure it's marked as custom
    const customSystem: GradePointSystem = {
      ...system,
      id: system.id || `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isOfficial: false
    };

    this.systems.set(customSystem.id, customSystem);
    this.saveSystems();
  }

  /**
   * Get a system by ID
   */
  public getSystem(id: string): GradePointSystem | undefined {
    return this.systems.get(id);
  }

  /**
   * Get all custom systems
   */
  public getAllSystems(): GradePointSystem[] {
    return Array.from(this.systems.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Delete a custom system
   */
  public deleteSystem(id: string): boolean {
    const existed = this.systems.has(id);
    if (existed) {
      this.systems.delete(id);
      this.saveSystems();
    }
    return existed;
  }

  /**
   * Update an existing system
   */
  public updateSystem(id: string, updates: Partial<GradePointSystem>): void {
    const existing = this.systems.get(id);
    if (!existing) {
      throw new Error(`System with ID ${id} not found`);
    }

    const updated = { ...existing, ...updates, id };
    const validation = this.validateSystem(updated);
    
    if (!validation.isValid) {
      throw new Error(`Invalid system update: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.systems.set(id, updated);
    this.saveSystems();
  }

  /**
   * Export system to JSON
   */
  public exportSystem(id: string): string {
    const system = this.systems.get(id);
    if (!system) {
      throw new Error(`System with ID ${id} not found`);
    }

    return JSON.stringify(system, null, 2);
  }

  /**
   * Export all systems
   */
  public exportAllSystems(): string {
    const exportData = {
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      systems: Array.from(this.systems.values())
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import system from JSON
   */
  public importSystem(jsonData: string): GradePointSystem {
    try {
      const data = JSON.parse(jsonData);
      
      // Handle single system import
      if (data.mappings && Array.isArray(data.mappings)) {
        const system: GradePointSystem = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: data.name || 'Imported System',
          scale: data.scale || 4.0,
          country: data.country || '',
          description: data.description || 'Imported grading system',
          isOfficial: false,
          mappings: data.mappings
        };

        const validation = this.validateSystem(system);
        if (!validation.isValid) {
          throw new Error(`Invalid imported system: ${validation.errors.map(e => e.message).join(', ')}`);
        }

        return system;
      }

      throw new Error('Invalid system format');
    } catch (error) {
      throw new Error(`Failed to import system: ${(error as Error).message}`);
    }
  }

  /**
   * Import multiple systems
   */
  public importMultipleSystems(jsonData: string): GradePointSystem[] {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.systems || !Array.isArray(data.systems)) {
        throw new Error('Invalid export format');
      }

      const imported: GradePointSystem[] = [];
      
      for (const systemData of data.systems) {
        try {
          const system = this.importSystem(JSON.stringify(systemData));
          imported.push(system);
        } catch (error) {
          console.warn(`Failed to import system "${systemData.name}":`, error);
        }
      }

      return imported;
    } catch (error) {
      throw new Error(`Failed to import systems: ${(error as Error).message}`);
    }
  }

  /**
   * Clear all custom systems
   */
  public clearAllSystems(): void {
    this.systems.clear();
    this.saveSystems();
  }

  /**
   * Get storage statistics
   */
  public getStorageStats(): {
    systemCount: number;
    storageSize: number;
    lastUpdated: string;
  } {
    const data = localStorage.getItem(STORAGE_KEY);
    return {
      systemCount: this.systems.size,
      storageSize: data ? new Blob([data]).size : 0,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Singleton instance
export const customGradeSystemManager = new CustomGradeSystemManager();