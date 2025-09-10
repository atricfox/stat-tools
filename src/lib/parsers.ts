/**
 * Advanced data parsers for multiple input formats
 * Supports CSV, TSV, Excel paste, scientific notation, and more
 */

export interface ParseResult {
  validNumbers: number[];
  invalidEntries: string[];
  metadata: {
    totalEntries: number;
    formatDetected: string;
    duplicates: number[];
    statistics?: {
      min: number;
      max: number;
      range: number;
    };
  };
}

/**
 * Detect input format based on content analysis
 */
export function detectInputFormat(input: string): string {
  const trimmed = input.trim();
  
  // Empty input
  if (!trimmed) return 'empty';
  
  // Tab-separated (Excel/TSV)
  if (trimmed.includes('\t') && trimmed.split('\t').length > 2) {
    return 'tsv';
  }
  
  // Comma-separated with quotes (CSV)
  if (/["'][^"']*["']/.test(trimmed) && trimmed.includes(',')) {
    return 'csv-quoted';
  }
  
  // Simple comma-separated
  if (trimmed.includes(',') && trimmed.split(',').length > 2) {
    return 'csv';
  }
  
  // Multi-line (newline separated)
  if (trimmed.includes('\n') && trimmed.split('\n').length > 2) {
    return 'multiline';
  }
  
  // Space-separated
  if (/\s+/.test(trimmed) && trimmed.split(/\s+/).length > 2) {
    return 'space-separated';
  }
  
  // Scientific notation dominant
  if (/\d+\.?\d*[eE][+-]?\d+/.test(trimmed)) {
    return 'scientific';
  }
  
  // Single number
  if (/^-?\d+\.?\d*$/.test(trimmed)) {
    return 'single';
  }
  
  return 'mixed';
}

/**
 * Parse CSV format (handles quoted values)
 */
export function parseCSV(input: string): string[] {
  const entries: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;
  
  while (i < input.length) {
    const char = input[i];
    
    if (char === '"' || char === "'") {
      if (inQuotes && input[i + 1] === char) {
        // Escaped quote
        current += char;
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      entries.push(current.trim());
      current = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (current.trim()) {
        entries.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
    i++;
  }
  
  if (current.trim()) {
    entries.push(current.trim());
  }
  
  return entries.filter(entry => entry.length > 0);
}

/**
 * Parse TSV format (tab-separated values)
 */
export function parseTSV(input: string): string[] {
  return input
    .split(/[\n\r]+/)
    .flatMap(line => line.split('\t'))
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);
}

/**
 * Parse space-separated values (handles multiple spaces)
 */
export function parseSpaceSeparated(input: string): string[] {
  return input
    .split(/[\n\r]+/)
    .flatMap(line => line.split(/\s+/))
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);
}

/**
 * Parse multi-line format (one number per line)
 */
export function parseMultiline(input: string): string[] {
  return input
    .split(/[\n\r]+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Advanced number validation and parsing
 */
export function parseNumber(entry: string): number | null {
  const trimmed = entry.trim();
  
  // Empty string
  if (!trimmed) return null;
  
  // Remove common non-numeric characters that might be mixed in
  const cleaned = trimmed
    .replace(/[""'']/g, '') // Remove quotes
    .replace(/[,\s](?=\d)/g, '') // Remove thousands separators
    .replace(/^\$|%$/g, '') // Remove currency/percentage symbols
    .trim();
  
  // Try parsing as number
  const num = parseFloat(cleaned);
  
  // Validate the result
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }
  
  // Additional validation for edge cases
  if (Math.abs(num) > 1e15) {
    // Very large numbers might be problematic
    console.warn(`Large number detected: ${num}`);
  }
  
  return num;
}

/**
 * Detect and handle special numeric formats
 */
export function normalizeNumber(entry: string): string {
  let normalized = entry.trim();
  
  // Handle percentages
  if (normalized.endsWith('%')) {
    const num = parseFloat(normalized.slice(0, -1));
    if (!isNaN(num)) {
      normalized = (num / 100).toString();
    }
  }
  
  // Handle fractions (basic)
  if (normalized.includes('/') && !normalized.includes(' ')) {
    const parts = normalized.split('/');
    if (parts.length === 2) {
      const numerator = parseFloat(parts[0]);
      const denominator = parseFloat(parts[1]);
      if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
        normalized = (numerator / denominator).toString();
      }
    }
  }
  
  // Handle scientific notation normalization
  if (/^-?\d+\.?\d*[eE][+-]?\d+$/.test(normalized)) {
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      // Convert to decimal if reasonable
      if (Math.abs(num) < 1e6 && Math.abs(num) > 1e-6) {
        normalized = num.toString();
      }
    }
  }
  
  return normalized;
}

/**
 * Calculate basic statistics for parsed data
 */
export function calculateBasicStats(numbers: number[]): {
  min: number;
  max: number;
  range: number;
} {
  if (numbers.length === 0) {
    return { min: 0, max: 0, range: 0 };
  }
  
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  const range = max - min;
  
  return { min, max, range };
}

/**
 * Detect duplicate values
 */
export function findDuplicates(numbers: number[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  
  numbers.forEach(num => {
    if (seen.has(num)) {
      duplicates.add(num);
    } else {
      seen.add(num);
    }
  });
  
  return Array.from(duplicates);
}

/**
 * Main parsing function with format auto-detection
 */
export function parseMultiFormatInput(input: string): ParseResult {
  const format = detectInputFormat(input);
  let entries: string[] = [];
  
  // Parse based on detected format
  switch (format) {
    case 'empty':
      entries = [];
      break;
    case 'csv-quoted':
    case 'csv':
      entries = parseCSV(input);
      break;
    case 'tsv':
      entries = parseTSV(input);
      break;
    case 'multiline':
      entries = parseMultiline(input);
      break;
    case 'space-separated':
      entries = parseSpaceSeparated(input);
      break;
    default:
      // Fallback to mixed separator parsing
      entries = input
        .split(/[,\n\r\t\s]+/)
        .map(entry => entry.trim())
        .filter(entry => entry.length > 0);
  }
  
  // Normalize and parse numbers
  const validNumbers: number[] = [];
  const invalidEntries: string[] = [];
  
  entries.forEach(entry => {
    const normalized = normalizeNumber(entry);
    const num = parseNumber(normalized);
    
    if (num !== null) {
      validNumbers.push(num);
    } else if (entry.trim()) {
      invalidEntries.push(entry);
    }
  });
  
  // Calculate statistics and metadata
  const statistics = validNumbers.length > 0 ? calculateBasicStats(validNumbers) : undefined;
  const duplicates = findDuplicates(validNumbers);
  
  return {
    validNumbers,
    invalidEntries,
    metadata: {
      totalEntries: entries.length,
      formatDetected: format,
      duplicates,
      statistics
    }
  };
}

/**
 * Specialized parser for educational data (grades, scores)
 */
export function parseEducationalData(input: string, gradeScale: { min: number; max: number } = { min: 0, max: 100 }): ParseResult & {
  gradingInfo: {
    validGrades: number[];
    outOfRange: number[];
    distribution: { [key: string]: number };
  };
} {
  const baseResult = parseMultiFormatInput(input);
  
  // Separate valid grades from out-of-range values
  const validGrades: number[] = [];
  const outOfRange: number[] = [];
  
  baseResult.validNumbers.forEach(num => {
    if (num >= gradeScale.min && num <= gradeScale.max) {
      validGrades.push(num);
    } else {
      outOfRange.push(num);
    }
  });
  
  // Calculate grade distribution
  const distribution: { [key: string]: number } = {};
  if (gradeScale.max === 100) {
    // Standard percentage grading
    const ranges = ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (0-59)'];
    distribution['A (90-100)'] = validGrades.filter(g => g >= 90).length;
    distribution['B (80-89)'] = validGrades.filter(g => g >= 80 && g < 90).length;
    distribution['C (70-79)'] = validGrades.filter(g => g >= 70 && g < 80).length;
    distribution['D (60-69)'] = validGrades.filter(g => g >= 60 && g < 70).length;
    distribution['F (0-59)'] = validGrades.filter(g => g < 60).length;
  }
  
  return {
    ...baseResult,
    gradingInfo: {
      validGrades,
      outOfRange,
      distribution
    }
  };
}

/**
 * Specialized parser for scientific/research data
 */
export function parseScientificData(input: string): ParseResult & {
  scientificInfo: {
    hasScientificNotation: boolean;
    significantFigures: number[];
    precisionIssues: string[];
    suggestedSignificantFigures?: number;
  };
} {
  const baseResult = parseMultiFormatInput(input);
  
  // Analyze scientific notation usage
  const hasScientificNotation = /\d+\.?\d*[eE][+-]?\d+/.test(input);
  
  // Estimate significant figures for each number
  const significantFigures: number[] = [];
  const precisionIssues: string[] = [];
  
  baseResult.validNumbers.forEach((num, index) => {
    const str = num.toString();
    
    // Basic significant figures estimation
    const cleaned = str.replace(/^-?0+/, '').replace(/\.?0+$/, '');
    const sigFigs = cleaned.replace('.', '').length || 1;
    significantFigures.push(sigFigs);
    
    // Check for precision issues
    if (str.includes('.') && str.split('.')[1].length > 6) {
      precisionIssues.push(`Number ${index + 1} has high precision (${str.split('.')[1].length} decimal places)`);
    }
  });

  // Suggest appropriate significant figures based on data
  const maxSigFigs = Math.max(...significantFigures, 0);
  const avgSigFigs = significantFigures.length > 0 ? 
    significantFigures.reduce((sum, sf) => sum + sf, 0) / significantFigures.length : 0;
  const suggestedSignificantFigures = Math.max(Math.ceil(avgSigFigs), maxSigFigs, 3);
  
  return {
    ...baseResult,
    scientificInfo: {
      hasScientificNotation,
      significantFigures,
      precisionIssues,
      suggestedSignificantFigures
    }
  };
}