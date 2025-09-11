/**
 * Smart number formatting for high-precision calculations
 * Handles scientific notation, very small/large numbers, and precision display
 */

export interface FormatNumberOptions {
  precision?: number;
  minSciNotation?: number; // Use scientific notation for numbers smaller than this
  maxSciNotation?: number; // Use scientific notation for numbers larger than this
  forceSignificantDigits?: boolean; // Force using significant digits instead of decimal places
}

/**
 * Format a number intelligently based on its magnitude and required precision
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted string representation
 */
export function formatNumberSmart(
  value: number, 
  options: FormatNumberOptions = {}
): string {
  const {
    precision = 2,
    minSciNotation = 1e-4,
    maxSciNotation = 1e6,
    forceSignificantDigits = false
  } = options;

  // Handle special cases
  if (value === 0) return '0';
  if (!isFinite(value)) return value.toString();

  const absValue = Math.abs(value);

  // For very small or very large numbers, use scientific notation
  if (absValue < minSciNotation || absValue > maxSciNotation) {
    return value.toExponential(precision);
  }

  // For significant digits mode (useful for scientific calculations)
  if (forceSignificantDigits) {
    return value.toPrecision(precision + 1);
  }

  // Regular formatting with smart precision
  // If the number would round to 0 with current precision, increase precision
  let adjustedPrecision = precision;
  while (adjustedPrecision < 10 && parseFloat(value.toFixed(adjustedPrecision)) === 0 && absValue > 0) {
    adjustedPrecision++;
  }

  // Format with adjusted precision
  const formatted = value.toFixed(adjustedPrecision);
  
  // Remove unnecessary trailing zeros after decimal point
  return parseFloat(formatted).toString();
}

/**
 * Format a number for display in calculation steps
 * Uses context-aware formatting based on user mode
 */
export function formatForCalculationSteps(
  value: number,
  userMode: 'student' | 'teacher' | 'research' = 'student',
  precision: number = 2
): string {
  if (userMode === 'research') {
    // Research mode: show high precision with scientific notation for extreme values
    return formatNumberSmart(value, {
      precision: Math.max(precision, 4),
      minSciNotation: 1e-4,
      maxSciNotation: 1e5,
      forceSignificantDigits: Math.abs(value) < 1e-3 || Math.abs(value) > 1e3
    });
  } else if (userMode === 'teacher') {
    // Teacher mode: balance precision and readability
    return formatNumberSmart(value, {
      precision: Math.max(precision, 2),
      minSciNotation: 1e-5,
      maxSciNotation: 1e6
    });
  } else {
    // Student mode: simpler formatting, avoid scientific notation unless necessary
    return formatNumberSmart(value, {
      precision,
      minSciNotation: 1e-8,
      maxSciNotation: 1e8
    });
  }
}

/**
 * Format a percentage with appropriate precision
 */
export function formatPercentage(
  value: number,
  userMode: 'student' | 'teacher' | 'research' = 'student',
  precision: number = 2
): string {
  const formatted = formatForCalculationSteps(value, userMode, precision);
  return `${formatted}%`;
}

/**
 * Format a scientific measurement with appropriate units and precision
 */
export function formatScientificValue(
  value: number,
  unit: string = '',
  precision: number = 4
): string {
  const formatted = formatNumberSmart(value, {
    precision,
    minSciNotation: 1e-4,
    maxSciNotation: 1e4,
    forceSignificantDigits: true
  });
  
  return unit ? `${formatted} ${unit}` : formatted;
}