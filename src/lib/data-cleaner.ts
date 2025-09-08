/**
 * Intelligent data cleaning and validation for teacher scenarios
 * Handles missing values, outliers, and format inconsistencies
 */

export interface DataIssue {
  type: 'missing' | 'invalid' | 'outlier' | 'duplicate' | 'format' | 'range';
  severity: 'low' | 'medium' | 'high' | 'critical';
  index: number;
  value: any;
  message: string;
  suggestions: string[];
  autoFixAvailable: boolean;
}

export interface CleaningOptions {
  handleMissing: 'remove' | 'interpolate' | 'mean' | 'median' | 'zero' | 'flag';
  outlierMethod: 'iqr' | 'zscore' | 'modified-zscore' | 'none';
  outlierThreshold: number;
  removeDuplicates: boolean;
  validateRange?: { min: number; max: number };
  expectedFormat?: 'percentage' | 'decimal' | 'integer' | 'currency';
  customValidation?: (value: any, index: number) => boolean;
  preserveOriginal: boolean;
}

export interface CleaningResult {
  originalData: any[];
  cleanedData: number[];
  issues: DataIssue[];
  stats: {
    totalItems: number;
    validItems: number;
    removedItems: number;
    modifiedItems: number;
    flaggedItems: number;
  };
  recommendations: string[];
  confidence: number; // 0-100, confidence in cleaning quality
}

export interface TeacherDataProfile {
  pattern: 'gradebook' | 'attendance' | 'scores' | 'mixed' | 'unknown';
  confidence: number;
  characteristics: {
    hasNames: boolean;
    hasHeaders: boolean;
    numericColumns: number[];
    expectedRange?: { min: number; max: number };
    commonFormats: string[];
    samplesPerStudent?: number;
  };
  suggestions: {
    cleaningStrategy: string;
    recommendedOptions: Partial<CleaningOptions>;
    warnings: string[];
  };
}

export class DataCleaner {
  /**
   * Analyze data and detect common teacher data patterns
   */
  static analyzeDataProfile(data: any[]): TeacherDataProfile {
    if (data.length === 0) {
      return {
        pattern: 'unknown',
        confidence: 0,
        characteristics: {
          hasNames: false,
          hasHeaders: false,
          numericColumns: [],
          commonFormats: []
        },
        suggestions: {
          cleaningStrategy: 'No data to analyze',
          recommendedOptions: {},
          warnings: ['Empty dataset']
        }
      };
    }

    const analysis = this.performDataAnalysis(data);
    const pattern = this.detectPattern(analysis);
    const characteristics = this.extractCharacteristics(analysis);
    const suggestions = this.generateSuggestions(pattern, characteristics);

    return {
      pattern: pattern.type,
      confidence: pattern.confidence,
      characteristics,
      suggestions
    };
  }

  /**
   * Clean data with intelligent handling of teacher-specific issues
   */
  static cleanData(data: any[], options: Partial<CleaningOptions> = {}): CleaningResult {
    const profile = this.analyzeDataProfile(data);
    const mergedOptions = this.mergeOptionsWithProfile(options, profile);
    
    const originalData = [...data];
    const issues: DataIssue[] = [];
    let processedData = [...data];
    
    // Step 1: Detect all issues
    const detectedIssues = this.detectAllIssues(processedData, mergedOptions);
    issues.push(...detectedIssues);
    
    // Step 2: Apply cleaning strategies
    const cleaningSteps = [
      { name: 'format', handler: this.handleFormatIssues },
      { name: 'missing', handler: this.handleMissingValues },
      { name: 'outliers', handler: this.handleOutliers },
      { name: 'duplicates', handler: this.handleDuplicates },
      { name: 'range', handler: this.handleRangeViolations }
    ];

    let stats = {
      totalItems: originalData.length,
      validItems: 0,
      removedItems: 0,
      modifiedItems: 0,
      flaggedItems: 0
    };

    for (const step of cleaningSteps) {
      const result = step.handler(processedData, mergedOptions, issues);
      processedData = result.data;
      stats.modifiedItems += result.modifiedCount;
      stats.removedItems += result.removedCount;
      stats.flaggedItems += result.flaggedCount;
    }

    // Step 3: Convert to numbers and validate
    const { cleanedData, validCount } = this.finalizeData(processedData);
    stats.validItems = validCount;
    stats.removedItems = stats.totalItems - validCount;

    // Step 4: Generate recommendations
    const recommendations = this.generateRecommendations(issues, stats, profile);
    const confidence = this.calculateCleaningConfidence(issues, stats, profile);

    return {
      originalData,
      cleanedData,
      issues,
      stats,
      recommendations,
      confidence
    };
  }

  /**
   * Auto-fix data issues with teacher-friendly strategies
   */
  static autoFixData(data: any[], aggressiveness: 'conservative' | 'moderate' | 'aggressive' = 'moderate'): CleaningResult {
    const profile = this.analyzeDataProfile(data);
    
    const options: CleaningOptions = {
      handleMissing: this.getAutoMissingStrategy(profile, aggressiveness),
      outlierMethod: this.getAutoOutlierMethod(profile, aggressiveness),
      outlierThreshold: this.getAutoOutlierThreshold(aggressiveness),
      removeDuplicates: aggressiveness !== 'conservative',
      validateRange: this.getAutoRangeValidation(profile),
      expectedFormat: this.getAutoExpectedFormat(profile),
      preserveOriginal: true
    };

    return this.cleanData(data, options);
  }

  /**
   * Validate gradebook data specifically
   */
  static validateGradebook(
    data: any[],
    expectedRange: { min: number; max: number } = { min: 0, max: 100 },
    allowPartialCredit: boolean = true
  ): CleaningResult {
    const options: CleaningOptions = {
      handleMissing: 'flag', // Teachers need to see missing assignments
      outlierMethod: 'iqr',
      outlierThreshold: allowPartialCredit ? 3.0 : 2.0,
      removeDuplicates: false, // Keep duplicates in case they're legitimate
      validateRange: expectedRange,
      expectedFormat: expectedRange.max <= 1 ? 'decimal' : 'integer',
      preserveOriginal: true
    };

    return this.cleanData(data, options);
  }

  // Private helper methods
  private static performDataAnalysis(data: any[]): any {
    const sample = data.slice(0, Math.min(100, data.length));
    
    return {
      sampleSize: sample.length,
      totalSize: data.length,
      types: this.analyzeTypes(sample),
      ranges: this.analyzeRanges(sample),
      formats: this.analyzeFormats(sample),
      patterns: this.analyzePatterns(sample),
      nullCount: sample.filter(v => v === null || v === undefined || v === '').length
    };
  }

  private static analyzeTypes(sample: any[]): Record<string, number> {
    const types: Record<string, number> = {};
    
    sample.forEach(value => {
      let type = typeof value;
      
      if (value === null || value === undefined) {
        type = 'null';
      } else if (type === 'string') {
        if (value.trim() === '') {
          type = 'empty';
        } else if (!isNaN(parseFloat(value))) {
          type = 'numeric_string';
        } else if (value.match(/^\d{1,2}\/\d{1,2}\/\d{2,4}$/)) {
          type = 'date';
        }
      }
      
      types[type] = (types[type] || 0) + 1;
    });
    
    return types;
  }

  private static analyzeRanges(sample: any[]): { min: number; max: number; mean: number } | null {
    const numbers = sample
      .map(v => parseFloat(String(v || '')))
      .filter(n => !isNaN(n));
      
    if (numbers.length === 0) return null;
    
    return {
      min: Math.min(...numbers),
      max: Math.max(...numbers),
      mean: numbers.reduce((sum, n) => sum + n, 0) / numbers.length
    };
  }

  private static analyzeFormats(sample: any[]): string[] {
    const formats = new Set<string>();
    
    sample.forEach(value => {
      const str = String(value || '').trim();
      
      if (str.match(/^\d+$/)) formats.add('integer');
      if (str.match(/^\d*\.\d+$/)) formats.add('decimal');
      if (str.match(/^\d+%$/)) formats.add('percentage');
      if (str.match(/^\$\d+(\.\d{2})?$/)) formats.add('currency');
      if (str.match(/^[A-Za-z\s]+$/)) formats.add('text');
      if (str === '') formats.add('empty');
    });
    
    return Array.from(formats);
  }

  private static analyzePatterns(sample: any[]): string[] {
    const patterns: string[] = [];
    
    // Check for gradebook patterns
    if (sample.some(v => {
      const num = parseFloat(String(v || ''));
      return !isNaN(num) && num >= 0 && num <= 100;
    })) {
      patterns.push('percentage_grades');
    }
    
    if (sample.some(v => {
      const num = parseFloat(String(v || ''));
      return !isNaN(num) && num >= 0 && num <= 1;
    })) {
      patterns.push('decimal_grades');
    }
    
    // Check for attendance patterns
    if (sample.some(v => 
      ['present', 'absent', 'p', 'a', '1', '0'].includes(String(v || '').toLowerCase())
    )) {
      patterns.push('attendance');
    }
    
    return patterns;
  }

  private static detectPattern(analysis: any): { type: TeacherDataProfile['pattern']; confidence: number } {
    const { types, ranges, patterns } = analysis;
    
    // Calculate confidence based on data consistency
    let confidence = 0;
    let detectedPattern: TeacherDataProfile['pattern'] = 'unknown';
    
    // Gradebook detection
    if (patterns.includes('percentage_grades') || patterns.includes('decimal_grades')) {
      detectedPattern = 'gradebook';
      confidence = 0.8;
      
      if (ranges && ranges.min >= 0 && ranges.max <= 100) {
        confidence = 0.95;
      }
    }
    
    // Attendance detection
    if (patterns.includes('attendance')) {
      detectedPattern = 'attendance';
      confidence = 0.9;
    }
    
    // Score detection
    if (types.number > 0 && !patterns.includes('percentage_grades')) {
      detectedPattern = 'scores';
      confidence = 0.6;
    }
    
    return { type: detectedPattern, confidence };
  }

  private static extractCharacteristics(analysis: any): TeacherDataProfile['characteristics'] {
    return {
      hasNames: analysis.types.string > 0 && analysis.formats.includes('text'),
      hasHeaders: false, // Would need row analysis
      numericColumns: [], // Would need column analysis
      expectedRange: analysis.ranges ? { 
        min: analysis.ranges.min, 
        max: analysis.ranges.max 
      } : undefined,
      commonFormats: analysis.formats
    };
  }

  private static generateSuggestions(
    pattern: { type: TeacherDataProfile['pattern']; confidence: number },
    characteristics: TeacherDataProfile['characteristics']
  ): TeacherDataProfile['suggestions'] {
    const warnings: string[] = [];
    let cleaningStrategy = '';
    let recommendedOptions: Partial<CleaningOptions> = {};
    
    switch (pattern.type) {
      case 'gradebook':
        cleaningStrategy = 'Gradebook cleaning with missing assignment handling';
        recommendedOptions = {
          handleMissing: 'flag',
          outlierMethod: 'iqr',
          validateRange: { min: 0, max: 100 }
        };
        break;
        
      case 'attendance':
        cleaningStrategy = 'Attendance data normalization';
        recommendedOptions = {
          handleMissing: 'zero',
          outlierMethod: 'none',
          removeDuplicates: false
        };
        break;
        
      case 'scores':
        cleaningStrategy = 'Score validation and outlier detection';
        recommendedOptions = {
          handleMissing: 'mean',
          outlierMethod: 'zscore',
          validateRange: characteristics.expectedRange
        };
        break;
        
      default:
        cleaningStrategy = 'General data cleaning';
        recommendedOptions = {
          handleMissing: 'remove',
          outlierMethod: 'iqr'
        };
    }
    
    if (pattern.confidence < 0.7) {
      warnings.push('Data pattern unclear - manual review recommended');
    }
    
    return { cleaningStrategy, recommendedOptions, warnings };
  }

  private static detectAllIssues(data: any[], options: CleaningOptions): DataIssue[] {
    const issues: DataIssue[] = [];
    
    data.forEach((value, index) => {
      // Missing values
      if (value === null || value === undefined || value === '') {
        issues.push({
          type: 'missing',
          severity: 'medium',
          index,
          value,
          message: 'Missing value detected',
          suggestions: ['Remove row', 'Use mean/median', 'Interpolate', 'Flag for teacher review'],
          autoFixAvailable: true
        });
      }
      
      // Invalid numeric values
      const numValue = parseFloat(String(value || ''));
      if (value !== null && value !== undefined && value !== '' && isNaN(numValue)) {
        issues.push({
          type: 'invalid',
          severity: 'high',
          index,
          value,
          message: 'Cannot convert to number',
          suggestions: ['Remove value', 'Manual correction needed'],
          autoFixAvailable: false
        });
      }
      
      // Range violations
      if (!isNaN(numValue) && options.validateRange) {
        if (numValue < options.validateRange.min || numValue > options.validateRange.max) {
          issues.push({
            type: 'range',
            severity: 'high',
            index,
            value: numValue,
            message: `Value outside expected range (${options.validateRange.min}-${options.validateRange.max})`,
            suggestions: ['Check for data entry error', 'Remove outlier', 'Verify range settings'],
            autoFixAvailable: true
          });
        }
      }
    });
    
    return issues;
  }

  private static handleFormatIssues(
    data: any[],
    options: CleaningOptions,
    issues: DataIssue[]
  ): { data: any[]; modifiedCount: number; removedCount: number; flaggedCount: number } {
    let modifiedCount = 0;
    
    const processedData = data.map(value => {
      if (typeof value === 'string') {
        // Handle percentage format
        if (value.endsWith('%')) {
          modifiedCount++;
          return parseFloat(value.slice(0, -1));
        }
        
        // Handle currency format
        if (value.startsWith('$')) {
          modifiedCount++;
          return parseFloat(value.slice(1));
        }
        
        // Clean whitespace and common separators
        const cleaned = value.replace(/[,\s]/g, '');
        if (cleaned !== value && !isNaN(parseFloat(cleaned))) {
          modifiedCount++;
          return parseFloat(cleaned);
        }
      }
      
      return value;
    });
    
    return { data: processedData, modifiedCount, removedCount: 0, flaggedCount: 0 };
  }

  private static handleMissingValues(
    data: any[],
    options: CleaningOptions,
    issues: DataIssue[]
  ): { data: any[]; modifiedCount: number; removedCount: number; flaggedCount: number } {
    let modifiedCount = 0;
    let removedCount = 0;
    let flaggedCount = 0;
    
    const validNumbers = data
      .map(v => parseFloat(String(v || '')))
      .filter(n => !isNaN(n));
    
    const mean = validNumbers.length > 0 ? 
      validNumbers.reduce((sum, n) => sum + n, 0) / validNumbers.length : 0;
    
    const median = validNumbers.length > 0 ?
      [...validNumbers].sort((a, b) => a - b)[Math.floor(validNumbers.length / 2)] : 0;
    
    const processedData = data.map(value => {
      if (value === null || value === undefined || value === '') {
        switch (options.handleMissing) {
          case 'mean':
            modifiedCount++;
            return mean;
          case 'median':
            modifiedCount++;
            return median;
          case 'zero':
            modifiedCount++;
            return 0;
          case 'flag':
            flaggedCount++;
            return 'MISSING';
          case 'remove':
            removedCount++;
            return null; // Will be filtered out later
          default:
            return value;
        }
      }
      return value;
    }).filter(v => v !== null);
    
    return { data: processedData, modifiedCount, removedCount, flaggedCount };
  }

  private static handleOutliers(
    data: any[],
    options: CleaningOptions,
    issues: DataIssue[]
  ): { data: any[]; modifiedCount: number; removedCount: number; flaggedCount: number } {
    if (options.outlierMethod === 'none') {
      return { data, modifiedCount: 0, removedCount: 0, flaggedCount: 0 };
    }
    
    const numbers = data
      .map(v => parseFloat(String(v || '')))
      .filter(n => !isNaN(n));
      
    if (numbers.length < 4) {
      return { data, modifiedCount: 0, removedCount: 0, flaggedCount: 0 };
    }
    
    const outliers = DataCleaner.detectOutliers(numbers, options.outlierMethod, options.outlierThreshold);
    let flaggedCount = outliers.length;
    
    // For teacher data, we typically flag rather than remove outliers
    outliers.forEach(index => {
      if (index < issues.length) return; // Already reported
      
      issues.push({
        type: 'outlier',
        severity: 'medium',
        index,
        value: numbers[index],
        message: 'Statistical outlier detected',
        suggestions: ['Review value', 'Keep if valid', 'Remove if error'],
        autoFixAvailable: true
      });
    });
    
    return { data, modifiedCount: 0, removedCount: 0, flaggedCount };
  }

  private static handleDuplicates(
    data: any[],
    options: CleaningOptions,
    issues: DataIssue[]
  ): { data: any[]; modifiedCount: number; removedCount: number; flaggedCount: number } {
    if (!options.removeDuplicates) {
      return { data, modifiedCount: 0, removedCount: 0, flaggedCount: 0 };
    }
    
    const seen = new Set();
    const processedData = [];
    let removedCount = 0;
    
    for (const value of data) {
      const key = String(value);
      if (!seen.has(key)) {
        seen.add(key);
        processedData.push(value);
      } else {
        removedCount++;
      }
    }
    
    return { data: processedData, modifiedCount: 0, removedCount, flaggedCount: 0 };
  }

  private static handleRangeViolations(
    data: any[],
    options: CleaningOptions,
    issues: DataIssue[]
  ): { data: any[]; modifiedCount: number; removedCount: number; flaggedCount: number } {
    // Range violations are typically flagged in issues, not auto-fixed
    return { data, modifiedCount: 0, removedCount: 0, flaggedCount: 0 };
  }

  private static finalizeData(data: any[]): { cleanedData: number[]; validCount: number } {
    const cleanedData: number[] = [];
    
    data.forEach(value => {
      if (value === 'MISSING') return; // Skip flagged missing values
      
      const num = parseFloat(String(value || ''));
      if (!isNaN(num)) {
        cleanedData.push(num);
      }
    });
    
    return { cleanedData, validCount: cleanedData.length };
  }

  private static detectOutliers(
    numbers: number[],
    method: CleaningOptions['outlierMethod'],
    threshold: number
  ): number[] {
    if (method === 'none' || numbers.length < 4) return [];
    
    const outlierIndices: number[] = [];
    
    if (method === 'iqr') {
      const sorted = [...numbers].sort((a, b) => a - b);
      const q1 = sorted[Math.floor(sorted.length * 0.25)];
      const q3 = sorted[Math.floor(sorted.length * 0.75)];
      const iqr = q3 - q1;
      const lowerBound = q1 - threshold * iqr;
      const upperBound = q3 + threshold * iqr;
      
      numbers.forEach((value, index) => {
        if (value < lowerBound || value > upperBound) {
          outlierIndices.push(index);
        }
      });
    }
    
    // Add other outlier detection methods as needed
    
    return outlierIndices;
  }

  private static generateRecommendations(
    issues: DataIssue[],
    stats: CleaningResult['stats'],
    profile: TeacherDataProfile
  ): string[] {
    const recommendations: string[] = [];
    
    const missingCount = issues.filter(i => i.type === 'missing').length;
    const invalidCount = issues.filter(i => i.type === 'invalid').length;
    const outlierCount = issues.filter(i => i.type === 'outlier').length;
    
    if (missingCount > stats.totalItems * 0.1) {
      recommendations.push(`High missing data rate (${missingCount}/${stats.totalItems}). Consider investigating data collection process.`);
    }
    
    if (invalidCount > 0) {
      recommendations.push(`${invalidCount} values could not be converted to numbers. Manual review recommended.`);
    }
    
    if (outlierCount > 0) {
      recommendations.push(`${outlierCount} statistical outliers detected. Review for data entry errors or exceptional cases.`);
    }
    
    if (profile.pattern === 'gradebook' && missingCount > 0) {
      recommendations.push('Missing assignments detected. Consider whether these represent unsubmitted work or data collection gaps.');
    }
    
    return recommendations;
  }

  private static calculateCleaningConfidence(
    issues: DataIssue[],
    stats: CleaningResult['stats'],
    profile: TeacherDataProfile
  ): number {
    if (stats.totalItems === 0) return 0;
    
    const issueWeight = issues.reduce((weight, issue) => {
      const severity = { low: 1, medium: 2, high: 4, critical: 8 };
      return weight + severity[issue.severity];
    }, 0);
    
    const maxWeight = stats.totalItems * 8; // If all were critical
    const issueScore = Math.max(0, 100 - (issueWeight / maxWeight) * 100);
    
    const validityScore = (stats.validItems / stats.totalItems) * 100;
    const profileScore = profile.confidence * 100;
    
    return Math.round((issueScore * 0.4 + validityScore * 0.4 + profileScore * 0.2));
  }

  // Auto-strategy helpers
  private static mergeOptionsWithProfile(
    options: Partial<CleaningOptions>,
    profile: TeacherDataProfile
  ): CleaningOptions {
    const defaults: CleaningOptions = {
      handleMissing: 'remove',
      outlierMethod: 'iqr',
      outlierThreshold: 1.5,
      removeDuplicates: false,
      preserveOriginal: true
    };
    
    return {
      ...defaults,
      ...profile.suggestions.recommendedOptions,
      ...options
    };
  }

  private static getAutoMissingStrategy(
    profile: TeacherDataProfile,
    aggressiveness: string
  ): CleaningOptions['handleMissing'] {
    if (profile.pattern === 'gradebook') return 'flag';
    if (profile.pattern === 'attendance') return 'zero';
    
    return aggressiveness === 'conservative' ? 'flag' : 
           aggressiveness === 'moderate' ? 'mean' : 'remove';
  }

  private static getAutoOutlierMethod(
    profile: TeacherDataProfile,
    aggressiveness: string
  ): CleaningOptions['outlierMethod'] {
    if (profile.pattern === 'attendance') return 'none';
    
    return aggressiveness === 'conservative' ? 'none' :
           aggressiveness === 'moderate' ? 'iqr' : 'zscore';
  }

  private static getAutoOutlierThreshold(aggressiveness: string): number {
    return aggressiveness === 'conservative' ? 3.0 :
           aggressiveness === 'moderate' ? 2.0 : 1.5;
  }

  private static getAutoRangeValidation(
    profile: TeacherDataProfile
  ): { min: number; max: number } | undefined {
    if (profile.pattern === 'gradebook') {
      return profile.characteristics.expectedRange?.max === 1 ? 
        { min: 0, max: 1 } : { min: 0, max: 100 };
    }
    
    return profile.characteristics.expectedRange;
  }

  private static getAutoExpectedFormat(
    profile: TeacherDataProfile
  ): CleaningOptions['expectedFormat'] {
    const formats = profile.characteristics.commonFormats;
    
    if (formats.includes('percentage')) return 'percentage';
    if (formats.includes('decimal')) return 'decimal';
    if (formats.includes('currency')) return 'currency';
    if (formats.includes('integer')) return 'integer';
    
    return undefined;
  }
}

export default DataCleaner;