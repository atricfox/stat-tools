/**
 * Data formatting utilities for display and export
 */

export interface FormattingOptions {
  precision?: number;
  notation?: 'decimal' | 'scientific' | 'auto';
  locale?: string;
  useThousandsSeparator?: boolean;
}

/**
 * Format a number for display with various options
 */
export function formatNumber(
  value: number, 
  options: FormattingOptions = {}
): string {
  const {
    precision = 2,
    notation = 'auto',
    locale = 'en-US',
    useThousandsSeparator = false
  } = options;

  // Handle special cases
  if (!isFinite(value)) {
    if (isNaN(value)) return 'NaN';
    return value > 0 ? '∞' : '-∞';
  }

  // Auto-detect notation based on magnitude
  let finalNotation = notation;
  if (notation === 'auto') {
    if (Math.abs(value) >= 1e6 || (Math.abs(value) < 0.001 && value !== 0)) {
      finalNotation = 'scientific';
    } else {
      finalNotation = 'decimal';
    }
  }

  // Format based on notation
  if (finalNotation === 'scientific') {
    return value.toExponential(precision);
  }

  // Decimal formatting
  const formatted = value.toFixed(precision);
  
  if (useThousandsSeparator) {
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  }

  return formatted;
}

/**
 * Format calculation steps for educational display
 */
export function formatCalculationSteps(
  numbers: number[], 
  operation: 'mean' | 'sum' | 'count',
  result: number,
  precision: number = 2
): string[] {
  const formatOpts = { precision, useThousandsSeparator: numbers.length > 10 };
  
  switch (operation) {
    case 'mean': {
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      const formattedNumbers = numbers.map(n => formatNumber(n, formatOpts));
      
      return [
        `**Step 1:** List all the numbers`,
        `Numbers: ${formattedNumbers.join(', ')}`,
        `**Step 2:** Add all numbers together`,
        `Sum = ${formattedNumbers.join(' + ')} = ${formatNumber(sum, formatOpts)}`,
        `**Step 3:** Divide the sum by the count of numbers`,
        `Mean = ${formatNumber(sum, formatOpts)} ÷ ${numbers.length} = ${formatNumber(result, formatOpts)}`,
        `**Answer:** The mean is ${formatNumber(result, formatOpts)}`
      ];
    }
    
    case 'sum': {
      const formattedNumbers = numbers.map(n => formatNumber(n, formatOpts));
      return [
        `Add all numbers: ${formattedNumbers.join(' + ')} = ${formatNumber(result, formatOpts)}`
      ];
    }
    
    case 'count': {
      return [
        `Count the valid numbers: ${numbers.length} numbers found`
      ];
    }
    
    default:
      return [`Result: ${formatNumber(result, formatOpts)}`];
  }
}

/**
 * Format data summary for display
 */
export function formatDataSummary(
  validCount: number,
  invalidCount: number,
  formatDetected: string,
  duplicateCount: number = 0
): string[] {
  const summary: string[] = [];
  
  // Basic counts
  if (validCount > 0) {
    summary.push(`✓ ${validCount} valid number${validCount !== 1 ? 's' : ''} found`);
  }
  
  if (invalidCount > 0) {
    summary.push(`⚠ ${invalidCount} invalid entr${invalidCount !== 1 ? 'ies' : 'y'} ignored`);
  }
  
  // Format detection
  const formatNames: { [key: string]: string } = {
    'csv': 'Comma-separated values',
    'csv-quoted': 'Quoted CSV format',
    'tsv': 'Tab-separated values (Excel)',
    'multiline': 'Line-by-line format',
    'space-separated': 'Space-separated values',
    'scientific': 'Scientific notation',
    'single': 'Single number',
    'mixed': 'Mixed format'
  };
  
  if (formatNames[formatDetected]) {
    summary.push(`📋 Format: ${formatNames[formatDetected]}`);
  }
  
  // Duplicates warning
  if (duplicateCount > 0) {
    summary.push(`🔄 ${duplicateCount} duplicate value${duplicateCount !== 1 ? 's' : ''} detected`);
  }
  
  return summary;
}

/**
 * Format results for copying/sharing
 */
export function formatForExport(
  result: number,
  operation: 'mean' | 'median' | 'sum',
  numbers: number[],
  precision: number = 2
): string {
  const timestamp = new Date().toLocaleString();
  const formattedResult = formatNumber(result, { precision });
  
  let output = `Statistical Calculation Results\n`;
  output += `Generated: ${timestamp}\n`;
  output += `Operation: ${operation.charAt(0).toUpperCase() + operation.slice(1)}\n`;
  output += `Result: ${formattedResult}\n`;
  output += `Sample size: ${numbers.length}\n`;
  
  if (numbers.length <= 20) {
    output += `Data: ${numbers.map(n => formatNumber(n, { precision })).join(', ')}\n`;
  } else {
    const preview = numbers.slice(0, 10);
    output += `Data preview: ${preview.map(n => formatNumber(n, { precision })).join(', ')}... (+${numbers.length - 10} more)\n`;
  }
  
  return output;
}

/**
 * Format validation messages for user feedback
 */
export function formatValidationMessage(
  type: 'warning' | 'error' | 'info',
  message: string,
  details?: string
): { type: string; message: string; details?: string } {
  const prefixes = {
    warning: '⚠',
    error: '❌',
    info: 'ℹ'
  };
  
  return {
    type,
    message: `${prefixes[type]} ${message}`,
    details
  };
}

/**
 * Format number range for display
 */
export function formatRange(min: number, max: number, precision: number = 2): string {
  const formatOpts = { precision };
  return `${formatNumber(min, formatOpts)} to ${formatNumber(max, formatOpts)}`;
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, precision: number = 1): string {
  return `${formatNumber(value * 100, { precision })}%`;
}

/**
 * Format duration in milliseconds to human readable
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

/**
 * Create shareable URL with calculation state
 */
export function createShareableURL(
  baseURL: string,
  numbers: number[],
  precision: number,
  operation: string = 'mean'
): string {
  const params = new URLSearchParams();
  
  // Encode numbers (limit to reasonable length)
  if (numbers.length <= 100) {
    params.set('data', numbers.join(','));
  } else {
    // For large datasets, just include summary
    params.set('count', numbers.length.toString());
    params.set('sample', numbers.slice(0, 10).join(','));
  }
  
  params.set('precision', precision.toString());
  params.set('operation', operation);
  params.set('timestamp', Date.now().toString());
  
  return `${baseURL}?${params.toString()}`;
}

/**
 * Parse shareable URL to restore calculation state
 */
export function parseShareableURL(url: string): {
  numbers?: number[];
  precision?: number;
  operation?: string;
  timestamp?: number;
} | null {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;
    
    const result: any = {};
    
    if (params.has('data')) {
      const dataStr = params.get('data')!;
      result.numbers = dataStr.split(',').map(Number).filter(n => !isNaN(n));
    }
    
    if (params.has('precision')) {
      result.precision = parseInt(params.get('precision')!);
    }
    
    if (params.has('operation')) {
      result.operation = params.get('operation');
    }
    
    if (params.has('timestamp')) {
      result.timestamp = parseInt(params.get('timestamp')!);
    }
    
    return result;
  } catch {
    return null;
  }
}