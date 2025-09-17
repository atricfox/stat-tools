'use client';

import React, { useState, useReducer, useCallback } from 'react';
import { ChevronDown, HelpCircle, Settings, Download, Copy, Share, BarChart3 } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';
import { MeanCIEngine, type MeanCIResults, type ConfidenceInterval, type MeanCIOptions } from '@/lib/statistics/mean-ci-engine';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

// State types for the calculator
interface MeanCIState {
  input: string;
  confidenceLevels: number[];
  includeTrimmed: boolean;
  trimRatio: number;
  bootstrapIterations: number;
  randomSeed: number;
  isCalculating: boolean;
  progress: number;
  results: MeanCIResults | null;
  error: string | null;
}

// Types are now imported from the engine

// Action types for state management
type MeanCIAction =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_CONFIDENCE_LEVELS'; payload: number[] }
  | { type: 'SET_INCLUDE_TRIMMED'; payload: boolean }
  | { type: 'SET_BOOTSTRAP_ITERATIONS'; payload: number }
  | { type: 'SET_RANDOM_SEED'; payload: number }
  | { type: 'START_CALCULATION' }
  | { type: 'UPDATE_PROGRESS'; payload: number }
  | { type: 'SET_RESULTS'; payload: MeanCIResults }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_RESULTS' };

// State reducer
const meanCIReducer = (state: MeanCIState, action: MeanCIAction): MeanCIState => {
  switch (action.type) {
    case 'SET_INPUT':
      return { ...state, input: action.payload, error: null };
    case 'SET_CONFIDENCE_LEVELS':
      return { ...state, confidenceLevels: action.payload };
    case 'SET_INCLUDE_TRIMMED':
      return { ...state, includeTrimmed: action.payload };
    case 'SET_BOOTSTRAP_ITERATIONS':
      return { ...state, bootstrapIterations: action.payload };
    case 'SET_RANDOM_SEED':
      return { ...state, randomSeed: action.payload };
    case 'START_CALCULATION':
      return { ...state, isCalculating: true, progress: 0, error: null };
    case 'UPDATE_PROGRESS':
      return { ...state, progress: action.payload };
    case 'SET_RESULTS':
      return { ...state, isCalculating: false, results: action.payload, progress: 100 };
    case 'SET_ERROR':
      return { ...state, isCalculating: false, error: action.payload, progress: 0 };
    case 'CLEAR_RESULTS':
      return { ...state, results: null, error: null, progress: 0 };
    default:
      return state;
  }
};

export default function MeanCICalculatorClient() {
  const [state, dispatch] = useReducer(meanCIReducer, {
    input: '',
    confidenceLevels: [0.95],
    includeTrimmed: false,
    trimRatio: 0.2,
    bootstrapIterations: 10000,
    randomSeed: Math.floor(Math.random() * 1000000),
    isCalculating: false,
    progress: 0,
    results: null,
    error: null,
  });

  const [precision, setPrecision] = useState(4);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [showSteps, setShowSteps] = useState(false);

  // SEO structured data
  const { getToolConfig } = useStructuredData('mean-confidence-intervals');
  const structuredDataConfig = getToolConfig('mean-confidence-intervals');

  // Parse input data
  const parseInput = (input: string): number[] => {
    try {
      // Remove brackets, split by various delimiters, and parse numbers
      const cleaned = input.replace(/[\[\]]/g, '');
      const values = cleaned
        .split(/[,\s\n\r\t]+/)
        .map(v => v.trim())
        .filter(v => v.length > 0)
        .map(v => parseFloat(v));

      // Check for invalid numbers
      if (values.some(v => isNaN(v))) {
        throw new Error('Invalid number detected in input');
      }

      return values;
    } catch (error) {
      throw new Error('Failed to parse input data. Please check format.');
    }
  };

  // Validate input data
  const validateInput = (data: number[]): void => {
    if (data.length < 3) {
      throw new Error('Sample size too small. Please provide at least 3 data points.');
    }

    // Check for zero variance
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    
    if (variance === 0 || !isFinite(variance)) {
      throw new Error('Data has zero variance. All confidence intervals collapse to the mean.');
    }
  };

  // Calculate confidence intervals using the engine
  const calculateConfidenceIntervals = useCallback(async (data: number[]): Promise<MeanCIResults> => {
    const options: MeanCIOptions = {
      confidenceLevels: state.confidenceLevels,
      includeTrimmed: state.includeTrimmed,
      trimRatio: state.trimRatio,
      bootstrapIterations: state.bootstrapIterations,
      randomSeed: state.randomSeed
    };

    return await MeanCIEngine.calculateConfidenceIntervals(
      data, 
      options, 
      (progress) => {
        dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
      }
    );
  }, [state.confidenceLevels, state.includeTrimmed, state.trimRatio, state.bootstrapIterations, state.randomSeed]);

  // Handle input change with automatic calculation
  const handleInputChange = useCallback(async (value: string) => {
    dispatch({ type: 'SET_INPUT', payload: value });
    
    if (value.trim()) {
      try {
        const data = parseInput(value);
        if (data.length >= 3) {
          validateInput(data);
          dispatch({ type: 'START_CALCULATION' });
          const results = await calculateConfidenceIntervals(data);
          dispatch({ type: 'SET_RESULTS', payload: results });
        } else {
          dispatch({ type: 'CLEAR_RESULTS' });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Calculation failed' });
      }
    } else {
      dispatch({ type: 'CLEAR_RESULTS' });
    }
  }, [calculateConfidenceIntervals]);

  // Handle clear
  const handleClear = useCallback(() => {
    dispatch({ type: 'SET_INPUT', payload: '' });
    dispatch({ type: 'CLEAR_RESULTS' });
  }, []);

  // Handle confidence level changes
  const handleConfidenceLevelChange = useCallback(async (level: number, checked: boolean) => {
    const newLevels = checked
      ? [...state.confidenceLevels, level].sort((a, b) => a - b)
      : state.confidenceLevels.filter(l => l !== level);
    
    dispatch({ type: 'SET_CONFIDENCE_LEVELS', payload: newLevels });
    
    // Recalculate if we have input data
    if (state.input.trim() && newLevels.length > 0) {
      try {
        const data = parseInput(state.input);
        if (data.length >= 3) {
          dispatch({ type: 'START_CALCULATION' });
          // Create temporary options with new confidence levels
          const options: MeanCIOptions = {
            confidenceLevels: newLevels,
            includeTrimmed: state.includeTrimmed,
            trimRatio: state.trimRatio,
            bootstrapIterations: state.bootstrapIterations,
            randomSeed: state.randomSeed
          };
          const results = await MeanCIEngine.calculateConfidenceIntervals(
            data, 
            options, 
            (progress) => {
              dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
            }
          );
          dispatch({ type: 'SET_RESULTS', payload: results });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Calculation failed' });
      }
    }
  }, [state.input, state.includeTrimmed, state.trimRatio, state.bootstrapIterations, state.randomSeed]);

  // Handle trimmed mean option change
  const handleTrimmedMeanChange = useCallback(async (checked: boolean) => {
    dispatch({ type: 'SET_INCLUDE_TRIMMED', payload: checked });
    
    // Recalculate if we have input data
    if (state.input.trim() && state.confidenceLevels.length > 0) {
      try {
        const data = parseInput(state.input);
        if (data.length >= 3) {
          dispatch({ type: 'START_CALCULATION' });
          // Create temporary options with new trimmed setting
          const options: MeanCIOptions = {
            confidenceLevels: state.confidenceLevels,
            includeTrimmed: checked,
            trimRatio: state.trimRatio,
            bootstrapIterations: state.bootstrapIterations,
            randomSeed: state.randomSeed
          };
          const results = await MeanCIEngine.calculateConfidenceIntervals(
            data, 
            options, 
            (progress) => {
              dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
            }
          );
          dispatch({ type: 'SET_RESULTS', payload: results });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Calculation failed' });
      }
    }
  }, [state.input, state.confidenceLevels, state.trimRatio, state.bootstrapIterations, state.randomSeed]);

  // Handle precision change with recalculation
  const handlePrecisionChange = useCallback(async (newPrecision: number) => {
    setPrecision(newPrecision);
    
    // Recalculate if we have input data - precision affects display but we might want to recalculate for consistency
    if (state.input.trim() && state.confidenceLevels.length > 0) {
      try {
        const data = parseInput(state.input);
        if (data.length >= 3) {
          dispatch({ type: 'START_CALCULATION' });
          const results = await calculateConfidenceIntervals(data);
          dispatch({ type: 'SET_RESULTS', payload: results });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Calculation failed' });
      }
    }
  }, [state.input, state.confidenceLevels, calculateConfidenceIntervals]);

  // Handle bootstrap iterations change with recalculation
  const handleBootstrapIterationsChange = useCallback(async (newIterations: number) => {
    dispatch({ type: 'SET_BOOTSTRAP_ITERATIONS', payload: newIterations });
    
    // Recalculate if we have input data
    if (state.input.trim() && state.confidenceLevels.length > 0) {
      try {
        const data = parseInput(state.input);
        if (data.length >= 3) {
          dispatch({ type: 'START_CALCULATION' });
          // Create temporary options with new bootstrap iterations
          const options: MeanCIOptions = {
            confidenceLevels: state.confidenceLevels,
            includeTrimmed: state.includeTrimmed,
            trimRatio: state.trimRatio,
            bootstrapIterations: newIterations,
            randomSeed: state.randomSeed
          };
          const results = await MeanCIEngine.calculateConfidenceIntervals(
            data, 
            options, 
            (progress) => {
              dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
            }
          );
          dispatch({ type: 'SET_RESULTS', payload: results });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Calculation failed' });
      }
    }
  }, [state.input, state.confidenceLevels, state.includeTrimmed, state.trimRatio, state.randomSeed]);

  // Handle random seed change with recalculation
  const handleRandomSeedChange = useCallback(async (newSeed: number) => {
    dispatch({ type: 'SET_RANDOM_SEED', payload: newSeed });
    
    // Recalculate if we have input data
    if (state.input.trim() && state.confidenceLevels.length > 0) {
      try {
        const data = parseInput(state.input);
        if (data.length >= 3) {
          dispatch({ type: 'START_CALCULATION' });
          // Create temporary options with new random seed
          const options: MeanCIOptions = {
            confidenceLevels: state.confidenceLevels,
            includeTrimmed: state.includeTrimmed,
            trimRatio: state.trimRatio,
            bootstrapIterations: state.bootstrapIterations,
            randomSeed: newSeed
          };
          const results = await MeanCIEngine.calculateConfidenceIntervals(
            data, 
            options, 
            (progress) => {
              dispatch({ type: 'UPDATE_PROGRESS', payload: progress });
            }
          );
          dispatch({ type: 'SET_RESULTS', payload: results });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Calculation failed' });
      }
    }
  }, [state.input, state.confidenceLevels, state.includeTrimmed, state.trimRatio, state.bootstrapIterations]);

  // Copy results to clipboard
  const handleCopyResults = () => {
    if (!state.results) return;
    
    const text = generateResultsText(state.results);
    navigator.clipboard.writeText(text);
  };

  // Share results
  const handleShareResults = () => {
    if (!state.results) return;
    
    const results = state.results;
    const intervals = results.intervals.map(i => 
      `${formatMethodName(i.method)} (${(i.confidenceLevel * 100).toFixed(0)}%): [${i.lower.toFixed(precision)}, ${i.upper.toFixed(precision)}]`
    ).join(', ');
    
    const shareText = `Mean Confidence Intervals: Sample Mean = ${results.sampleMean.toFixed(precision)}, Sample Size = ${results.sampleSize}, ${intervals}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mean Confidence Intervals Calculator Results',
        text: shareText,
        url: window.location.href
      }).catch((error) => {
        // Ignore AbortError (user canceled share)
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        }
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
    }
  };

  // Export results
  const handleExportResults = (format: 'json' | 'markdown' | 'csv') => {
    if (!state.results) return;
    
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(state.results, null, 2);
        fileName = 'mean-ci-results.json';
        mimeType = 'application/json';
        break;
      case 'markdown':
        content = generateMarkdownReport(state.results);
        fileName = 'mean-ci-results.md';
        mimeType = 'text/markdown';
        break;
      case 'csv':
        content = generateCSVReport(state.results);
        fileName = 'mean-ci-results.csv';
        mimeType = 'text/csv';
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate text for copying
  const generateResultsText = (results: MeanCIResults): string => {
    return `Mean Confidence Intervals Results
Sample Size: ${results.sampleSize}
Sample Mean: ${results.sampleMean.toFixed(4)}
Sample Std: ${results.sampleStd.toFixed(4)}

${results.intervals.map(interval => 
  `${interval.method} (${(interval.confidenceLevel * 100).toFixed(0)}%): [${interval.lower.toFixed(4)}, ${interval.upper.toFixed(4)}]`
).join('\n')}`;
  };

  // Generate markdown report
  const generateMarkdownReport = (results: MeanCIResults): string => {
    return `# Mean Confidence Intervals Report

## Sample Statistics
- **Sample Size**: ${results.sampleSize}
- **Sample Mean**: ${results.sampleMean.toFixed(4)}
- **Sample Standard Deviation**: ${results.sampleStd.toFixed(4)}
- **Standard Error**: ${results.standardError.toFixed(4)}

## Confidence Intervals

| Method | Confidence Level | Lower Bound | Upper Bound | Notes |
|--------|------------------|-------------|-------------|-------|
${results.intervals.map(interval => 
  `| ${interval.method} | ${(interval.confidenceLevel * 100).toFixed(0)}% | ${interval.lower.toFixed(4)} | ${interval.upper.toFixed(4)} | ${interval.notes} |`
).join('\n')}

## Analysis
${results.narrative}

### Recommendations
${results.recommendations.map(rec => `- ${rec}`).join('\n')}
`;
  };

  // Generate CSV report
  const generateCSVReport = (results: MeanCIResults): string => {
    const header = 'Method,Confidence Level,Lower Bound,Upper Bound,Notes\n';
    const rows = results.intervals.map(interval => 
      `${interval.method},${interval.confidenceLevel},${interval.lower},${interval.upper},"${interval.notes}"`
    ).join('\n');
    return header + rows;
  };

  // Convert result steps to CalculationStep format
  const getCalculationSteps = (): CalculationStep[] => {
    if (!state.results) return [];
    
    const results = state.results;
    const steps: CalculationStep[] = [];
    
    // Step 1: Data Collection
    steps.push({
      id: 'step-1',
      title: 'Step 1: Data Collection',
      description: `Collected ${results.sampleSize} data points`,
      formula: 'n = number of observations',
      calculation: `n = ${results.sampleSize}`,
      result: `${results.sampleSize} observations`,
      explanation: 'Count the total number of data points in the dataset.',
      difficulty: 'basic'
    });
    
    // Step 2: Calculate Sample Statistics
    steps.push({
      id: 'step-2',
      title: 'Step 2: Sample Statistics',
      description: 'Calculate basic sample statistics',
      formula: 'x̄ = Σx / n, s = √[Σ(x - x̄)² / (n-1)]',
      calculation: `Mean = ${results.sampleMean.toFixed(precision)}, Std Dev = ${results.sampleStd.toFixed(precision)}`,
      result: `x̄ = ${results.sampleMean.toFixed(precision)}, s = ${results.sampleStd.toFixed(precision)}`,
      explanation: 'Calculate the sample mean and standard deviation.',
      difficulty: 'basic'
    });
    
    // Step 3: Outlier Detection
    const hasOutliers = results.outlierFlags.iqr.length > 0 || results.outlierFlags.mad.length > 0;
    steps.push({
      id: 'step-3',
      title: 'Step 3: Outlier Detection',
      description: hasOutliers ? 'Outliers detected in dataset' : 'No outliers detected',
      formula: 'IQR method: outliers if x < Q1 - 1.5×IQR or x > Q3 + 1.5×IQR',
      calculation: hasOutliers ? `${results.outlierFlags.iqr.length} outliers found` : 'All data points within normal range',
      result: hasOutliers ? 'Outliers present' : 'No outliers',
      explanation: 'Check for extreme values that might affect interval estimates.',
      difficulty: 'intermediate'
    });
    
    // Step 4-N: Confidence Intervals
    results.intervals.forEach((interval, index) => {
      const methodName = formatMethodName(interval.method);
      steps.push({
        id: `step-ci-${index}`,
        title: `${methodName} Confidence Interval`,
        description: `${(interval.confidenceLevel * 100).toFixed(0)}% confidence interval using ${methodName} method`,
        formula: getFormulaForMethod(interval.method),
        calculation: `[${interval.lower.toFixed(precision)}, ${interval.upper.toFixed(precision)}]`,
        result: `${(interval.confidenceLevel * 100).toFixed(0)}% CI: [${interval.lower.toFixed(precision)}, ${interval.upper.toFixed(precision)}]`,
        explanation: interval.notes,
        difficulty: interval.method.includes('bootstrap') ? 'advanced' : 'intermediate'
      });
    });
    
    return steps;
  };
  
  // Helper function to format method names
  const formatMethodName = (method: string): string => {
    switch (method) {
      case 't':
        return 'T-Interval';
      case 'bootstrap_percentile':
        return 'Bootstrap Percentile';
      case 'bootstrap_bca':
        return 'Bootstrap BCa';
      case 'bootstrap_trimmed':
        return 'Bootstrap Trimmed';
      default:
        return method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Helper function to get formula for each method
  const getFormulaForMethod = (method: string): string => {
    switch (method) {
      case 't':
        return 'x̄ ± t(α/2, n-1) × (s/√n)';
      case 'bootstrap_percentile':
        return 'Percentiles of bootstrap distribution';
      case 'bootstrap_bca':
        return 'BCa-corrected bootstrap percentiles';
      case 'bootstrap_trimmed':
        return 'Bootstrap of trimmed mean distribution';
      default:
        return '';
    }
  };

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />
      
      <CalculatorLayout
        title="Mean Confidence Intervals Calculator"
        description="Calculate and compare multiple types of confidence intervals for the mean using t-distribution, Bootstrap, and robust methods."
        breadcrumbs={[
          { label: 'Calculators', href: '/statistics-calculators' },
          { label: 'Mean CI Calculator' }
        ]}
        currentTool="mean-confidence-intervals"
        toolCategory="statistics"
      >
        <div className="space-y-6">
          
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="space-y-6">
              <DataInput
                value={state.input}
                onChange={handleInputChange}
                context="research"
                placeholder="Enter numbers separated by commas, spaces, or line breaks...
Example: 12.3, 11.8, 13.1, 12.7, 11.9, 12.4"
                label="Sample Data"
                onClear={handleClear}
              />

              {/* Confidence Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Levels
                </label>
                <div className="flex flex-wrap gap-4">
                  {[0.90, 0.95, 0.99].map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={state.confidenceLevels.includes(level)}
                        onChange={(e) => handleConfidenceLevelChange(level, e.target.checked)}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        disabled={state.isCalculating}
                      />
                      <span className="text-sm text-gray-700">{(level * 100).toFixed(0)}%</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Trimmed Mean Option */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.includeTrimmed}
                    onChange={(e) => handleTrimmedMeanChange(e.target.checked)}
                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={state.isCalculating}
                  />
                  <span className="text-sm text-gray-700">
                    Include 20% trimmed mean bootstrap (robust to outliers)
                  </span>
                </label>
              </div>

              <PrecisionControl
                precision={precision}
                onPrecisionChange={handlePrecisionChange}
              />
            </div>

            {/* Advanced Settings */}
            <div className="mt-6">
              <button
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <Settings className="w-4 h-4 mr-1" />
                Advanced Settings
                <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                  showAdvancedSettings ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showAdvancedSettings && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label htmlFor="bootstrap-iterations" className="block text-sm font-medium text-gray-700 mb-1">
                      Bootstrap Iterations
                    </label>
                    <input
                      id="bootstrap-iterations"
                      type="number"
                      min="1000"
                      max="20000"
                      step="1000"
                      value={state.bootstrapIterations}
                      onChange={(e) => handleBootstrapIterationsChange(parseInt(e.target.value))}
                      className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={state.isCalculating}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="random-seed" className="block text-sm font-medium text-gray-700 mb-1">
                      Random Seed (for reproducibility)
                    </label>
                    <input
                      id="random-seed"
                      type="number"
                      value={state.randomSeed}
                      onChange={(e) => handleRandomSeedChange(parseInt(e.target.value))}
                      className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={state.isCalculating}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Progress Display */}
            {state.isCalculating && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-blue-700">Calculating... {state.progress}%</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {state.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600">{state.error}</p>
              </div>
            )}
          </div>

          {/* Results Section */}
          {state.results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Statistical Results
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyResults}
                    className="p-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    title="Copy Results"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleShareResults}
                    className="p-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    title="Share Results"
                  >
                    <Share className="w-4 h-4" />
                  </button>
                  <div className="relative group">
                    <button className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors" title="Download Results">
                      <Download className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => handleExportResults('csv')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-md"
                      >
                        Download CSV
                      </button>
                      <button
                        onClick={() => handleExportResults('json')}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-md"
                      >
                        Download JSON
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Sample Size</div>
                  <div className="text-lg font-semibold text-gray-900">{state.results.sampleSize}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Mean</div>
                  <div className="text-lg font-semibold text-gray-900">{state.results.sampleMean.toFixed(4)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Std Dev</div>
                  <div className="text-lg font-semibold text-gray-900">{state.results.sampleStd.toFixed(4)}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Std Error</div>
                  <div className="text-lg font-semibold text-gray-900">{state.results.standardError.toFixed(4)}</div>
                </div>
              </div>

              {/* Confidence Intervals Table */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Method</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Level</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Lower</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Upper</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.results.intervals.map((interval, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {formatMethodName(interval.method)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {(interval.confidenceLevel * 100).toFixed(0)}%
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {interval.lower.toFixed(4)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {interval.upper.toFixed(4)}
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-sm">
                          {interval.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Analysis */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Analysis</h3>
                <p className="text-blue-800 mb-3">{state.results.narrative}</p>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Recommendations:</h4>
                  <ul className="text-blue-800 space-y-1">
                    {state.results.recommendations.map((rec, index) => (
                      <li key={index}>• {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Calculation Steps Section - Only when results available */}
          {state.results && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <button
                onClick={() => setShowSteps(!showSteps)}
                className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  <HelpCircle className="w-5 h-5 inline mr-2" />
                  Calculation Steps
                </h3>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                  showSteps ? 'rotate-180' : ''
                }`} />
              </button>
              
              {showSteps && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <CalculationSteps
                    steps={getCalculationSteps()}
                    context="research"
                    showFormulas={true}
                    showExplanations={true}
                    interactive={true}
                    className="shadow-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                <HelpCircle className="w-5 h-5 inline mr-2" />
                Mean Confidence Intervals Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  calculatorType="mean-confidence-intervals"
                  userMode="research"
                />
              </div>
            )}
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
}