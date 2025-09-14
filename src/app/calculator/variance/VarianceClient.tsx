'use client';

import React, { useState, useCallback } from 'react';
import { RotateCcw, HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';

import { useVarianceCalculation } from '@/hooks/useVarianceCalculation';
import { VarianceDataPoint, VarianceResult } from '@/types/variance';

import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

export default function VarianceClient() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  const [calculationType, setCalculationType] = useState<'sample' | 'population'>('sample');
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO

  // Use the custom hook for calculations
  const { result, calculate, reset: resetCalculation } = useVarianceCalculation();

  // SEO structured data
  const { getToolConfig } = useStructuredData('variance');
  const structuredDataConfig = getToolConfig('variance');

  const handleInputChange = (value: string) => {
    setInput(value);
    if (value.trim()) {
      // Parse input similar to Standard Deviation Calculator
      const numbers = value.split(/[,\s\n]+/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
      if (numbers.length >= 2) {
        // Convert to VarianceDataPoint format for the hook
        const dataPoints: VarianceDataPoint[] = numbers.map((num, index) => ({
          id: index.toString(),
          value: num,
          label: `Value ${index + 1}`
        }));
        calculate(dataPoints, {
          calculationType: calculationType as 'sample' | 'population',
          precision
        });
      }
    } else {
      resetCalculation();
    }
  };

  const handleClearAll = () => {
    setInput('');
    resetCalculation();
  };

  // Convert result steps to CalculationStep format for the CalculationSteps component
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];

    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Data Collection' :
               index === 1 ? 'x̄ = Σx / n' :
               index === 2 ? 'Deviations from Mean' :
               index === 3 ? '(x - x̄)²' :
               index === 4 ? 'Σ(x - x̄)²' :
               index === 5 ? calculationType === 'sample' ? 's² = Σ(x - x̄)² / (n-1)' : 'σ² = Σ(x - x̄)² / n' : '',
      calculation: step,
      result: index === result.steps.length - 1 ? formatForCalculationSteps(result.variance || 0, userMode, precision) : '',
      explanation: index === result.steps.length - 1
        ? `The ${calculationType} variance measures how spread out your data points are from the mean.`
        : index === 0
        ? 'Count the number of data points in the dataset.'
        : index === 1
        ? 'Calculate the arithmetic mean of all data points.'
        : index === 2
        ? 'Find how much each data point differs from the mean.'
        : index === 3
        ? 'Square each deviation to make all values positive.'
        : index === 4
        ? 'Sum all the squared deviations.'
        : 'Processing statistical calculations step by step.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportResults = (format: 'json' | 'csv' | 'txt') => {
    if (!result) return;

    let content = '';
    const fileName = `variance-results.${format}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(result, null, 2);
        break;
      case 'csv':
        content = `data,${result.validDataPoints?.map(p => p.value).join(',') || ''}\nvariance,${result.variance}\nmean,${result.mean}\nstandardDeviation,${result.standardDeviation}`;
        break;
      case 'txt':
        content = `Variance: ${result.variance}\nMean: ${result.mean}\nStandard Deviation: ${result.standardDeviation}\nData: ${result.validDataPoints?.map(p => p.value).join(', ') || ''}`;
        break;
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareResults = (data: any) => {
    const variance = data.calculationType === 'population' ? data.populationVariance : data.sampleVariance;
    const shareText = `Variance: ${variance.toFixed(precision)}, Mean: ${data.mean.toFixed(precision)}, Sample Size: ${data.count}`;

    if (navigator.share) {
      navigator.share({
        title: 'Variance Calculator Results',
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

  const toolCategory = userMode === 'teacher' ? 'gpa' : userMode === 'research' ? 'analysis' : 'statistics';

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />

      <CalculatorLayout
        title="Variance Calculator"
        description="Calculate sample and population variance with step-by-step explanations for different use cases."
        breadcrumbs={[
          { label: 'Calculators', href: '/statistics-calculators' },
          { label: 'Variance Calculator' }
        ]}
        currentTool="variance"
        toolCategory={toolCategory}
      >
        <div className="space-y-6">
          {/* User Mode Selector */}
          <UserModeSelector
            userMode={userMode}
            onModeChange={setUserMode}
          />

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="space-y-6">
              <DataInput
                value={input}
                onChange={handleInputChange}
                context={userMode}
                placeholder="Enter numbers separated by commas, spaces, or line breaks..."
                label="Data Values"
                onClear={handleClearAll}
              />

              <div>
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
                    Sample (s²)
                  </button>
                  <button
                    onClick={() => setCalculationType('population')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      calculationType === 'population'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                    }`}
                  >
                    Population (σ²)
                  </button>
                </div>
              </div>

              <PrecisionControl
                precision={precision}
                onPrecisionChange={setPrecision}
              />
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <StatisticalResults
              result={result}
              userMode={userMode}
              precision={precision}
              onCopy={handleCopyResults}
              onDownload={(data, format) => handleExportResults(format as 'csv' | 'json' | 'txt')}
              onShare={handleShareResults}
            />
          )}

          {/* Calculation Steps Section - Only when results available */}
          {result && (
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
                    context={userMode}
                    showFormulas={userMode !== 'student'}
                    showExplanations={true}
                    interactive={true}
                    className="shadow-sm"
                  />
                </div>
              )}
            </div>
          )}

          {/* Help Section - Clickable Header for expand/collapse */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                <HelpCircle className="w-5 h-5 inline mr-2" />
                Variance Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>

            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  calculatorType="variance"
                  userMode={userMode}
                />
              </div>
            )}
          </div>
        </div>
      </CalculatorLayout>
    </>
  );
}