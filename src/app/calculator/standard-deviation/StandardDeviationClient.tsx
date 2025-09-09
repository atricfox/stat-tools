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

import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';

export default function StandardDeviationClient() {
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

  // SEO structured data
  const { getToolConfig } = useStructuredData('standard-deviation');
  const structuredDataConfig = getToolConfig('standard-deviation');

  // UI State
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [precision, setPrecision] = useState(2);
  const [userMode, setUserMode] = useState<'student' | 'research' | 'teacher'>('student');
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // Standard Deviation specific state
  const [calculationType, setCalculationType] = useState<'sample' | 'population'>('sample');
  const [inputMode, setInputMode] = useState<StatisticalDataInputMode>('manual');
  const [outlierDetectionEnabled, setOutlierDetectionEnabled] = useState(false);

  // Calculate on data changes
  useEffect(() => {
    if (dataPoints.length >= 2) {
      const validDataPoints = dataPoints.filter(dp => !isNaN(dp.value));
      if (validDataPoints.length >= 2) {
        calculate(validDataPoints, { 
          calculationType: calculationType as 'sample' | 'population',
          precision
        });
      }
    }
  }, [dataPoints, calculationType, precision, outlierDetectionEnabled, calculate]);

  // Handle data input changes
  const handleDataChange = useCallback((newDataPoints: DataPoint[]) => {
    setDataPoints(newDataPoints);
  }, []);

  const handleAddDataPoint = useCallback((value: number, label?: string) => {
    const newPoint: DataPoint = {
      id: Date.now().toString(),
      value,
      label: label || `Value ${dataPoints.length + 1}`
    };
    setDataPoints(prev => [...prev, newPoint]);
  }, [dataPoints.length]);

  const handleRemoveDataPoint = useCallback((id: string) => {
    setDataPoints(prev => prev.filter(dp => dp.id !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setDataPoints([]);
    resetCalculation();
  }, [resetCalculation]);

  const handleLoadExample = useCallback(() => {
    const exampleData: DataPoint[] = [
      { id: '1', value: 2, label: 'Value 1' },
      { id: '2', value: 4, label: 'Value 2' },
      { id: '3', value: 4, label: 'Value 3' },
      { id: '4', value: 4, label: 'Value 4' },
      { id: '5', value: 5, label: 'Value 5' },
      { id: '6', value: 5, label: 'Value 6' },
      { id: '7', value: 7, label: 'Value 7' },
      { id: '8', value: 9, label: 'Value 8' }
    ];
    setDataPoints(exampleData);
  }, []);

  // Generate shareable state
  const generateShareableState = () => {
    return null; // Would return shareable state
  };

  // Generate QR code
  const generateQRCode = () => {
    return 'data:image/svg+xml;base64,mock-qr-code';
  };

  // Convert result steps to CalculationSteps format
  const getCalculationSteps = () => {
    if (!result || !result.steps) return [];
    return result.steps.map((step, index) => {
      const totalSteps = result.steps.length;
      const stepIndex = index;
      
      return {
        id: `step-${index}`,
        title: `Step ${index + 1}`,
        description: step,
        formula: getStepFormula(stepIndex, totalSteps),
        calculation: step,
        result: '',
        explanation: getStepExplanation(stepIndex, totalSteps),
        difficulty: userMode === 'student' ? 'basic' as const : 
                   userMode === 'research' ? 'advanced' as const : 
                   'intermediate' as const
      };
    });
  };

  const getStepFormula = (stepIndex: number, totalSteps: number): string => {
    const formulas = [
      'x̄ = Σx / n',
      'Σ(x - x̄)²',
      calculationType === 'sample' ? 's² = Σ(x - x̄)² / (n-1)' : 'σ² = Σ(x - x̄)² / n',
      calculationType === 'sample' ? 's = √(s²)' : 'σ = √(σ²)'
    ];
    return formulas[Math.min(stepIndex, formulas.length - 1)] || '';
  };

  const getStepExplanation = (stepIndex: number, totalSteps: number): string => {
    const explanations = [
      'Calculate the mean (average) of all data points.',
      'Find the squared differences from the mean for each data point.',
      'Calculate the variance by averaging the squared differences.',
      'Take the square root of the variance to get the standard deviation.'
    ];
    
    return stepIndex === totalSteps - 1 
      ? 'The standard deviation measures how spread out the data points are from the mean.'
      : 'This step helps us understand the variability in our data.';
  };

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />
      
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
        
        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Input & Controls */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Data Input Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <StatisticalDataInput
                dataPoints={dataPoints}
                onDataPointsChange={handleDataChange}
                inputMode={inputMode}
                onInputModeChange={setInputMode}
                userMode={userMode}
                isProcessing={isCalculating || isBatchProcessing}
                processingProgress={batchProgress}
                onBatchProcess={processFile}
                enableBatchProcessing={userMode !== 'student'}
              />
            </div>

            {/* Settings Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calculation Type
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCalculationType('sample')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          calculationType === 'sample'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        Sample (s)
                      </button>
                      <button
                        onClick={() => setCalculationType('population')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          calculationType === 'population'
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                        }`}
                      >
                        Population (σ)
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <PrecisionControl
                      precision={precision}
                      onPrecisionChange={setPrecision}
                    />
                  </div>
                </div>

                {/* Advanced Options for Research/Teacher mode */}
                {userMode !== 'student' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={outlierDetectionEnabled}
                          onChange={(e) => setOutlierDetectionEnabled(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Enable outlier detection</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 justify-center pt-2">
                  {result && (
                    <>
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
                      
                      <button
                        onClick={() => setShowShare(!showShare)}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                          showShare 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Share2 className="w-4 h-4 inline mr-1" />
                        Share
                      </button>
                    </>
                  )}

                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Clear all data"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* Results */}
            {result && (
              <StandardDeviationResults
                result={result}
                precision={precision}
                userMode={userMode}
                showAdvancedStats={userMode !== 'student'}
                showDistributionAnalysis={userMode === 'research'}
              />
            )}

            {/* Visualization */}
            {showVisualization && result && (
              <StatisticalVisualization
                result={result}
                config={{
                  showMean: true,
                  showMedian: userMode !== 'student',
                  showStandardDeviation: true,
                  showOutliers: outlierDetectionEnabled,
                  showNormalCurve: userMode !== 'student',
                  chartType: 'histogram'
                }}
                onConfigChange={(newConfig) => {
                  // Handle config changes if needed
                }}
                userMode={userMode}
              />
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
          </div>
        </div>

        {/* Share Modal - TODO: Implement proper sharing */}
        {showShare && result && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Share Calculation</h3>
              <p className="text-gray-600 mb-4">Sharing functionality will be implemented in a future update.</p>
              <button
                onClick={() => setShowShare(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Calculation Steps */}
        {showSteps && result && (
          <div className="mt-8">
            <CalculationSteps
              steps={getCalculationSteps()}
              context={userMode}
              showFormulas={userMode !== 'student'}
              showExplanations={true}
              interactive={userMode === 'student'}
              className="shadow-sm"
            />
          </div>
        )}

        {/* Control Buttons */}
        {result && (
          <div className="flex gap-4 mt-6">
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
          </div>
        )}

        {/* Help Section */}
        {showHelp && (
          <div className="mt-8">
            <HelpSection
              calculatorType="standard-deviation"
              userMode={userMode}
            />
          </div>
        )}
      </CalculatorLayout>
    </>
  );
}