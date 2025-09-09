/**
 * Standard Deviation Calculator Page
 * Complete statistical analysis tool with visualization and educational features
 * Supports sample/population calculations, outlier detection, and batch processing
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Calculator, 
  Users, 
  GraduationCap, 
  FileText,
  Share2,
  Settings,
  HelpCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import UserModeSelector from '@/components/calculator/UserModeSelector';
import StatisticalDataInput from '@/components/calculator/StatisticalDataInput';
import StandardDeviationResults from '@/components/calculator/StandardDeviationResults';
import StatisticalVisualization from '@/components/calculator/StatisticalVisualization';
import HelpSection from '@/components/calculator/HelpSection';
import ShareCalculation from '@/components/calculator/ShareCalculation';
import CalculationSteps from '@/components/calculator/CalculationSteps';

import { useStandardDeviationCalculation } from '@/hooks/useStandardDeviationCalculation';
import { useBatchProcessing } from '@/hooks/useBatchProcessing';

import { 
  DataPoint,
  StatisticalDataInputMode,
  StandardDeviationCalculatorState,
  StatisticalVisualizationConfig,
  BatchProcessingOptions
} from '@/types/standardDeviation';

export default function StandardDeviationCalculatorPage() {
  // Core calculation state
  const { 
    result, 
    isCalculating, 
    error, 
    calculate, 
    reset: resetCalculation,
    validateData
  } = useStandardDeviationCalculation();

  // Batch processing
  const {
    isProcessing: isBatchProcessing,
    progress: batchProgress,
    results: batchResults,
    errors: batchErrors,
    processFile,
    downloadResults: downloadBatchResults,
    reset: resetBatchProcessing
  } = useBatchProcessing();

  // UI State
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [precision, setPrecision] = useState(2);
  const [userMode, setUserMode] = useState<'student' | 'research' | 'teacher'>('student');
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Calculation settings
  const [calculatorState, setCalculatorState] = useState<StandardDeviationCalculatorState>({
    dataPoints: [],
    inputMode: { type: 'manual' },
    calculationType: 'sample',
    precision: 2,
    userMode: 'student',
    showSteps: false,
    showOutliers: true,
    showVisualization: false,
    excludeOutliers: false,
    outlierMethod: 'iqr',
    outlierThreshold: 1.5,
    useWeights: false,
    normalityTest: false,
    confidenceInterval: 95,
    timestamp: Date.now(),
    version: '1.0'
  });

  // Visualization config
  const [visualizationConfig, setVisualizationConfig] = useState<StatisticalVisualizationConfig>({
    chartType: 'histogram',
    showMean: true,
    showMedian: true,
    showStandardDeviation: true,
    showOutliers: true,
    showNormalCurve: false,
    bins: 10,
    width: 600,
    height: 300
  });

  // Input mode state
  const [inputMode, setInputMode] = useState<StatisticalDataInputMode>({ type: 'manual' });

  // Update calculator state when dependencies change
  useEffect(() => {
    setCalculatorState(prev => ({
      ...prev,
      dataPoints,
      precision,
      userMode,
      showSteps,
      showVisualization,
      timestamp: Date.now()
    }));
  }, [dataPoints, precision, userMode, showSteps, showVisualization]);

  // Auto-calculate when data changes
  useEffect(() => {
    if (dataPoints.length >= 2) {
      const validation = validateData(dataPoints);
      if (validation.valid) {
        calculate(dataPoints, calculatorState);
      }
    } else {
      resetCalculation();
    }
  }, [dataPoints, calculatorState, calculate, resetCalculation, validateData]);

  // Handle data point changes
  const handleDataPointsChange = useCallback((newDataPoints: DataPoint[]) => {
    setDataPoints(newDataPoints);
  }, []);

  // Handle input mode changes
  const handleInputModeChange = useCallback((mode: StatisticalDataInputMode) => {
    setInputMode(mode);
  }, []);

  // Handle calculation type change
  const handleCalculationTypeChange = useCallback((type: 'sample' | 'population' | 'both') => {
    setCalculatorState(prev => ({ ...prev, calculationType: type }));
  }, []);

  // Handle outlier settings change
  const handleOutlierSettingsChange = useCallback((
    excludeOutliers: boolean, 
    method: 'iqr' | 'zscore' | 'modified_zscore', 
    threshold: number
  ) => {
    setCalculatorState(prev => ({
      ...prev,
      excludeOutliers,
      outlierMethod: method,
      outlierThreshold: threshold
    }));
  }, []);

  // Handle batch file processing
  const handleBatchProcess = useCallback((file: File, options: BatchProcessingOptions) => {
    processFile(file, options);
  }, [processFile]);

  // Handle copy results
  const handleCopyResults = useCallback((text: string) => {
    navigator.clipboard?.writeText(text);
    // Could add toast notification here
  }, []);

  // Handle download results
  const handleDownloadResults = useCallback((result: any, format: 'csv' | 'json' | 'pdf') => {
    // Implementation would depend on the specific format
    console.log('Downloading results in format:', format);
  }, []);

  // Handle sharing
  const handleCreateShare = useCallback((options: any) => {
    // Implementation for creating shareable URLs
    console.log('Creating share with options:', options);
    return null; // Would return shareable state
  }, []);

  const handleGenerateQR = useCallback(async (url: string, options?: any) => {
    // Implementation for QR code generation
    return 'data:image/svg+xml;base64,mock-qr-code';
  }, []);

  // Get calculation steps for display
  const getCalculationSteps = useCallback(() => {
    if (!result || !result.steps) return [];
    return result.steps.map((step, index) => {
      // Parse the step to extract calculation and result
      const stepText = step;
      let calculation = '';
      let resultValue = '';
      let formula = '';
      
      // Extract the main content after "Step X: "
      const mainContent = stepText.replace(/^Step \d+:\s*/, '');
      
      if (mainContent.includes('=')) {
        // Handle different step formats
        if (mainContent.includes(':')) {
          // Format: "Description: calculation = result"
          const [description, calculationPart] = mainContent.split(':');
          if (calculationPart && calculationPart.includes('=')) {
            const parts = calculationPart.split('=');
            calculation = parts[0].trim();
            resultValue = parts.slice(1).join('=').trim();
          } else {
            calculation = mainContent;
          }
        } else {
          // Format: "calculation = result"
          const parts = mainContent.split('=');
          calculation = parts[0].trim();
          resultValue = parts.slice(1).join('=').trim();
        }
      } else {
        // No equals sign, just description
        calculation = mainContent;
      }
      
      // Set appropriate formulas for each step
      switch (index) {
        case 1: // Mean calculation
          formula = 'x̄ = (Σx) / n';
          break;
        case 3: // Squared deviations
          formula = '(x - x̄)²';
          break;
        case 4: // Sum of squared deviations
          formula = 'Σ(x - x̄)²';
          break;
        case 5: // Variance
          formula = calculatorState.calculationType === 'population' ? 'σ² = Σ(x - x̄)² / N' : 's² = Σ(x - x̄)² / (N-1)';
          break;
        case 6: // Standard deviation
          formula = calculatorState.calculationType === 'population' ? 'σ = √(σ²)' : 's = √(s²)';
          break;
        default:
          formula = '';
      }
      
      return {
        id: `step-${index}`,
        title: `Step ${index + 1}`,
        description: stepText,
        formula: formula,
        calculation: calculation,
        result: resultValue,
        explanation: getStepExplanation(index, result.steps.length),
        difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
      };
    });
  }, [result, userMode, calculatorState.calculationType]);

  // Get explanation for each step
  const getStepExplanation = (stepIndex: number, totalSteps: number): string => {
    const explanations = [
      'Count how many data points we have in our dataset.',
      'Add all values together and divide by the count to find the average.',
      'Subtract the mean from each value to see how far each point is from the center.',
      'Square each deviation to eliminate negative values and emphasize larger differences.',
      'Add up all the squared deviations to get the total variation.',
      'Divide by the appropriate number to get the variance.',
      'Take the square root of variance to get the standard deviation in original units.'
    ];
    
    if (stepIndex < explanations.length) {
      return explanations[stepIndex];
    }
    
    return stepIndex === totalSteps - 1 
      ? 'The standard deviation measures how spread out the data points are from the mean.'
      : 'This step helps us understand the variability in our data.';
  };

  return (
    <CalculatorLayout
      title="Standard Deviation Calculator"
      description="Calculate sample and population standard deviation with comprehensive statistical analysis. Includes outlier detection, visualization, and batch processing for large datasets."
      breadcrumbs={[
        { label: 'Calculators', href: '/calculator' },
        { label: 'Standard Deviation Calculator' }
      ]}
      currentTool="standard-deviation"
      toolCategory="statistics"
    >
      {/* User Mode Selector */}
      <UserModeSelector 
        userMode={userMode}
        onModeChange={setUserMode}
      />

      <div className="space-y-6 mt-8">
        {/* Input Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="space-y-6">
            
            {/* Data Input */}
            <StatisticalDataInput
              dataPoints={dataPoints}
              onDataPointsChange={handleDataPointsChange}
              inputMode={inputMode}
              onInputModeChange={handleInputModeChange}
              userMode={userMode}
              maxDataPoints={1000}
              enableBatchProcessing={true}
              onBatchProcess={handleBatchProcess}
              isProcessing={isBatchProcessing}
              processingProgress={batchProgress}
            />

            {/* Precision Control - Full Width */}
            <PrecisionControl
              precision={precision}
              onPrecisionChange={setPrecision}
            />

            {/* Research Mode Controls - Full Width */}
            {userMode === 'research' && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Research Options
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Calculation Type
                    </label>
                    <select
                      value={calculatorState.calculationType}
                      onChange={(e) => handleCalculationTypeChange(e.target.value as any)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="sample">Sample Standard Deviation</option>
                      <option value="population">Population Standard Deviation</option>
                      <option value="both">Show Both</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Outlier Detection
                    </label>
                    <select
                      value={calculatorState.outlierMethod}
                      onChange={(e) => handleOutlierSettingsChange(
                        calculatorState.excludeOutliers,
                        e.target.value as any,
                        calculatorState.outlierThreshold
                      )}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="iqr">IQR Method</option>
                      <option value="zscore">Z-Score Method</option>
                      <option value="modified_zscore">Modified Z-Score</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={calculatorState.excludeOutliers}
                      onChange={(e) => handleOutlierSettingsChange(
                        e.target.checked,
                        calculatorState.outlierMethod,
                        calculatorState.outlierThreshold
                      )}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Exclude outliers</span>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={calculatorState.normalityTest}
                      onChange={(e) => setCalculatorState(prev => ({ ...prev, normalityTest: e.target.checked }))}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Normality test</span>
                  </label>
                </div>
              </div>
            )}

            {/* Action Buttons - Full Width at Bottom */}
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                  showSettings 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-1" />
                Settings
              </button>
              
              {result && (
                <button
                  onClick={() => setShowVisualization(!showVisualization)}
                  className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                    showVisualization 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-1" />
                  Charts
                </button>
              )}
              
              <button
                onClick={() => handleDataPointsChange([])}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Clear all data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <StandardDeviationResults
            result={result}
            userMode={userMode}
            precision={precision}
            onCopy={handleCopyResults}
            onDownload={handleDownloadResults}
            showAdvancedStats={true}
            showDistributionAnalysis={true}
            className="shadow-sm"
          />
        )}

        {/* Visualization Section */}
        {result && showVisualization && (
          <StatisticalVisualization
            result={result}
            config={visualizationConfig}
            onConfigChange={setVisualizationConfig}
            userMode={userMode}
            className="shadow-sm"
          />
        )}

        {/* Calculation Steps */}
        {result && showSteps && (
          <CalculationSteps
            steps={getCalculationSteps()}
            context={userMode}
            showFormulas={true}
            showExplanations={userMode === 'student'}
            interactive={true}
            className="shadow-sm"
          />
        )}

        {/* Help Section */}
        {showHelp && (
          <HelpSection
            calculatorType="standard-deviation"
            userMode={userMode}
            onClose={() => setShowHelp(false)}
            className="shadow-sm"
          />
        )}

        {/* Toggle Buttons Row */}
        {result && (
          <div className="flex gap-4">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showSteps 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showSteps ? 'Hide' : 'Show'} Calculation Steps
            </button>
            
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                showHelp 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              {showHelp ? 'Hide' : 'Show'} Help
            </button>
            
            {result && (
              <ShareCalculation
                onCreateShare={handleCreateShare}
                onGenerateQR={handleGenerateQR}
                result={result}
              />
            )}
          </div>
        )}

        {/* Advanced Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outlier Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={calculatorState.outlierThreshold}
                  onChange={(e) => handleOutlierSettingsChange(
                    calculatorState.excludeOutliers,
                    calculatorState.outlierMethod,
                    parseFloat(e.target.value) || 1.5
                  )}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confidence Interval
                </label>
                <select
                  value={calculatorState.confidenceInterval}
                  onChange={(e) => setCalculatorState(prev => ({ ...prev, confidenceInterval: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={90}>90%</option>
                  <option value={95}>95%</option>
                  <option value={99}>99%</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center text-red-800">
              <span className="font-medium">Calculation Error:</span>
            </div>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        )}

        {/* Batch Processing Results */}
        {batchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Batch Processing Results ({batchResults.length} datasets)
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadBatchResults('csv')}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => downloadBatchResults('json')}
                  className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Export JSON
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-600">Dataset</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">Count</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">Mean</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">Std Dev</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-600">CV%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {batchResults.map((batchResult, index) => (
                    <tr key={index}>
                      <td className="px-3 py-2">Dataset {index + 1}</td>
                      <td className="px-3 py-2 text-right font-mono">{batchResult.count}</td>
                      <td className="px-3 py-2 text-right font-mono">{batchResult.mean.toFixed(precision)}</td>
                      <td className="px-3 py-2 text-right font-mono">{batchResult.sampleStandardDeviation.toFixed(precision)}</td>
                      <td className="px-3 py-2 text-right font-mono">{batchResult.coefficientOfVariation.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CalculatorLayout>
  );
}