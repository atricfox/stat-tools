/**
 * Hook for variance calculations with comprehensive statistical analysis
 * Supports both sample and population calculations with educational features
 */

import { useState, useCallback, useMemo } from 'react';
import {
  VarianceDataPoint,
  VarianceResult,
  UseVarianceCalculation,
  VarianceCalculatorState,
  VarianceNormalityTestResult,
  VarianceConfidenceIntervalResult,
  VarianceError
} from '@/types/variance';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

export const useVarianceCalculation = (): UseVarianceCalculation => {
  const [result, setResult] = useState<VarianceResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataPoints, setDataPoints] = useState<VarianceDataPoint[]>([]);

  // Statistical calculation utilities
  const calculateMean = useCallback((values: number[]): number => {
    if (values.length === 0) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, []);

  const calculateVariance = useCallback((values: number[], mean: number, isPopulation: boolean): number => {
    if (values.length === 0) return 0;
    if (values.length === 1 && !isPopulation) return 0;

    const sumOfSquaredDeviations = values.reduce((sum, value) => {
      const deviation = value - mean;
      return sum + (deviation * deviation);
    }, 0);

    const divisor = isPopulation ? values.length : values.length - 1;
    return divisor > 0 ? sumOfSquaredDeviations / divisor : 0;
  }, []);

  const calculateQuantile = useCallback((sortedValues: number[], q: number): number => {
    if (sortedValues.length === 0) return 0;

    const index = (sortedValues.length - 1) * q;
    const lower = Math.floor(index);
    const upper = Math.ceil(index);

    if (lower === upper) return sortedValues[lower];

    const weight = index - lower;
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }, []);

  const detectOutliers = useCallback((values: number[], method: 'iqr' | 'zscore' | 'modified_zscore', threshold: number): number[] => {
    if (values.length < 4) return [];

    const sortedValues = [...values].sort((a, b) => a - b);

    switch (method) {
      case 'iqr': {
        const q1 = calculateQuantile(sortedValues, 0.25);
        const q3 = calculateQuantile(sortedValues, 0.75);
        const iqr = q3 - q1;
        const lowerBound = q1 - threshold * iqr;
        const upperBound = q3 + threshold * iqr;
        return values.filter(value => value < lowerBound || value > upperBound);
      }

      case 'zscore': {
        const mean = calculateMean(values);
        const stdDev = Math.sqrt(calculateVariance(values, mean, false));
        if (stdDev === 0) return [];
        return values.filter(value => Math.abs((value - mean) / stdDev) > threshold);
      }

      case 'modified_zscore': {
        const median = calculateQuantile(sortedValues, 0.5);
        const deviations = values.map(value => Math.abs(value - median));
        const mad = calculateQuantile([...deviations].sort((a, b) => a - b), 0.5);
        if (mad === 0) return [];
        return values.filter(value => Math.abs(0.6745 * (value - median) / mad) > threshold);
      }

      default:
        return [];
    }
  }, [calculateMean, calculateVariance, calculateQuantile]);

  const calculateSkewness = useCallback((values: number[], mean: number, stdDev: number): number => {
    if (values.length < 3 || stdDev === 0) return 0;

    const n = values.length;
    const sumCubedDeviations = values.reduce((sum, value) => {
      const deviation = (value - mean) / stdDev;
      return sum + Math.pow(deviation, 3);
    }, 0);

    return (n / ((n - 1) * (n - 2))) * sumCubedDeviations;
  }, []);

  const calculateKurtosis = useCallback((values: number[], mean: number, stdDev: number): number => {
    if (values.length < 4 || stdDev === 0) return 0;

    const n = values.length;
    const sumQuartedDeviations = values.reduce((sum, value) => {
      const deviation = (value - mean) / stdDev;
      return sum + Math.pow(deviation, 4);
    }, 0);

    const kurtosis = (n * (n + 1) / ((n - 1) * (n - 2) * (n - 3))) * sumQuartedDeviations;
    const correction = 3 * Math.pow(n - 1, 2) / ((n - 2) * (n - 3));

    return kurtosis - correction; // Excess kurtosis
  }, []);

  const generateCalculationSteps = useCallback((
    values: number[],
    mean: number,
    variance: number,
    isPopulation: boolean
  ): string[] => {
    const steps: string[] = [];
    const n = values.length;

    steps.push(`Step 1: Count the data points: n = ${n}`);
    steps.push(`Step 2: Calculate the mean: x̄ = (${values.join(' + ')}) / ${n} = ${mean.toFixed(4)}`);

    const deviations = values.map(x => x - mean);
    steps.push(`Step 3: Calculate deviations from mean: ${deviations.map(d => d.toFixed(4)).join(', ')}`);

    const squaredDeviations = deviations.map(d => d * d);
    const sumSquaredDeviations = squaredDeviations.reduce((sum, sq) => sum + sq, 0);
    steps.push(`Step 4: Square the deviations: ${squaredDeviations.map(sq => sq.toFixed(4)).join(', ')}`);
    steps.push(`Step 5: Sum of squared deviations: ${sumSquaredDeviations.toFixed(4)}`);

    const divisor = isPopulation ? n : n - 1;
    const divisorType = isPopulation ? 'N' : 'N-1';
    steps.push(`Step 6: Calculate variance: σ² = ${sumSquaredDeviations.toFixed(4)} / ${divisorType} = ${variance.toFixed(4)}`);

    return steps;
  }, []);

  const validateData = useCallback((points: VarianceDataPoint[]) => {
    const errors: string[] = [];

    if (points.length === 0) {
      errors.push('At least one data point is required');
      return { valid: false, errors };
    }

    // Single data point is valid for population variance (result = 0)

    const validPoints = points.filter(point => !point.excluded);
    if (validPoints.length === 0) {
      errors.push('At least one data point must not be excluded');
    }

    validPoints.forEach((point, index) => {
      if (typeof point.value !== 'number' || isNaN(point.value)) {
        errors.push(`Data point ${index + 1}: Value must be a valid number`);
      }
      if (!isFinite(point.value)) {
        errors.push(`Data point ${index + 1}: Value must be finite`);
      }
    });

    return { valid: errors.length === 0, errors };
  }, []);

  const calculate = useCallback(async (
    points: VarianceDataPoint[],
    options: Partial<VarianceCalculatorState> = {}
  ) => {
    setIsCalculating(true);
    setError(null);

    try {
      const validation = validateData(points);
      if (!validation.valid) {
        throw new VarianceError(
          validation.errors.join('; '),
          'VALIDATION_ERROR',
          { errors: validation.errors }
        );
      }

      const validPoints = points.filter(point => !point.excluded);
      const values = validPoints.map(point => point.value);
      const sortedValues = [...values].sort((a, b) => a - b);

      // Outlier detection - always detect outliers for reporting
      const outlierMethod = options.outlierMethod || 'iqr';
      const outlierThreshold = options.outlierThreshold || 1.5;
      const outlierValues = detectOutliers(values, outlierMethod, outlierThreshold);

      const cleanValues = options.excludeOutliers ?
        values.filter(value => !outlierValues.includes(value)) : values;

      if (cleanValues.length === 0) {
        throw new VarianceError(
          'No valid data points remain after outlier removal',
          'NO_DATA_ERROR'
        );
      }

      // Core calculations
      const mean = calculateMean(cleanValues);
      const sampleVariance = calculateVariance(cleanValues, mean, false);
      const populationVariance = calculateVariance(cleanValues, mean, true);
      const standardDeviation = Math.sqrt(options.calculationType === 'population' ? populationVariance : sampleVariance);

      // Descriptive statistics
      const count = cleanValues.length;
      const sum = cleanValues.reduce((acc, val) => acc + val, 0);
      const sumOfSquares = cleanValues.reduce((acc, val) => acc + val * val, 0);
      const sumOfSquaredDeviations = cleanValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);

      const min = Math.min(...cleanValues);
      const max = Math.max(...cleanValues);
      const range = max - min;
      const median = calculateQuantile(sortedValues, 0.5);
      const q1 = calculateQuantile(sortedValues, 0.25);
      const q3 = calculateQuantile(sortedValues, 0.75);
      const iqr = q3 - q1;

      // Advanced statistics
      const skewness = calculateSkewness(cleanValues, mean, standardDeviation);
      const kurtosis = calculateKurtosis(cleanValues, mean, standardDeviation);
      const coefficientOfVariation = mean !== 0 ? (standardDeviation / Math.abs(mean)) * 100 : 0;
      const standardError = count > 1 ? standardDeviation / Math.sqrt(count) : 0;

      // Calculate deviations for educational purposes
      const deviations = cleanValues.map(value => ({
        value,
        deviation: value - mean,
        squaredDeviation: Math.pow(value - mean, 2)
      }));

      // Generate calculation steps
      const calculationType = options.calculationType || 'sample';
      const isPopulation = calculationType === 'population';
      const steps = generateCalculationSteps(cleanValues, mean,
        isPopulation ? populationVariance : sampleVariance, isPopulation);

      // Determine distribution type (simplified heuristic)
      let distributionType: 'normal' | 'skewed' | 'uniform' | 'bimodal' = 'normal';
      if (Math.abs(skewness) > 1) distributionType = 'skewed';
      else if (Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 0.5) distributionType = 'uniform';

      const result: VarianceResult = {
        // Core measures
        mean,
        sampleVariance,
        populationVariance,
        standardDeviation,

        // Descriptive statistics
        count,
        sum,
        sumOfSquares,
        sumOfSquaredDeviations,

        // Range and quartiles
        min,
        max,
        range,
        median,
        q1,
        q3,
        iqr,

        // Advanced measures
        skewness,
        kurtosis,
        coefficientOfVariation,
        standardError,

        // Data quality
        validDataPoints: validPoints.filter(point =>
          !outlierValues.includes(point.value) || !options.excludeOutliers),
        excludedDataPoints: points.filter(point => point.excluded),
        outliers: validPoints.filter(point => outlierValues.includes(point.value)),

        // Metadata
        calculationType: calculationType as 'sample' | 'population',
        timestamp: new Date().toISOString(),
        steps,
        distributionType,
        deviations
      };

      setResult(result);
    } catch (err) {
      const errorMessage = err instanceof VarianceError ?
        err.message : 'An unexpected error occurred during calculation';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [
    validateData,
    detectOutliers,
    calculateMean,
    calculateVariance,
    calculateQuantile,
    calculateSkewness,
    calculateKurtosis,
    generateCalculationSteps
  ]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setDataPoints([]);
  }, []);

  const addDataPoint = useCallback((point: VarianceDataPoint) => {
    setDataPoints(prev => [...prev, point]);
  }, []);

  const removeDataPoint = useCallback((id: string) => {
    setDataPoints(prev => prev.filter(point => point.id !== id));
  }, []);

  const updateDataPoint = useCallback((id: string, updates: Partial<VarianceDataPoint>) => {
    setDataPoints(prev => prev.map(point =>
      point.id === id ? { ...point, ...updates } : point
    ));
  }, []);

  return {
    result,
    isCalculating,
    error,
    calculate,
    reset,
    addDataPoint,
    removeDataPoint,
    updateDataPoint,
    validateData
  };
};

export default useVarianceCalculation;