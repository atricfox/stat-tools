'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { useRangeCalculation } from '@/hooks/useRangeCalculation';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

export default function RangeCalculatorClient() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO

  // Use the custom hook for calculations
  const { result, calculateRange, clearResults, loadExample } = useRangeCalculation(
    userMode,
    precision
  );

  // SEO structured data
  const { getToolConfig } = useStructuredData('range');
  const structuredDataConfig = getToolConfig('range');

  const handleInputChange = (value: string) => {
    setInput(value);
    calculateRange(value);
  };

  const handleClearAll = () => {
    setInput('');
    clearResults();
  };

  const handleLoadExample = () => {
    const example = loadExample();
    setInput(example);
    calculateRange(example);
  };

  // Convert result steps to CalculationStep format for the CalculationSteps component
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Data Processing' : 
               step.includes('Minimum') ? 'Min Value Identification' :
               step.includes('Maximum') ? 'Max Value Identification' :
               step.includes('Range =') ? 'Range = Max - Min' :
               step.includes('Quartile') || step.includes('IQR') ? 'Quartile Analysis' :
               step.includes('outliers') ? 'Outlier Detection' :
               '',
      calculation: step,
      result: step.includes('Range =') ? formatForCalculationSteps(result.range, userMode, precision) : 
              step.includes('Minimum') ? formatForCalculationSteps(result.minimum, userMode, precision) :
              step.includes('Maximum') ? formatForCalculationSteps(result.maximum, userMode, precision) : '',
      explanation: index === 0 
        ? 'Processing and validating the input data for range calculation.'
        : step.includes('Minimum')
        ? 'Identifying the smallest value in the dataset.'
        : step.includes('Maximum')
        ? 'Identifying the largest value in the dataset.'
        : step.includes('Range =')
        ? 'The range shows the spread of data from minimum to maximum.'
        : step.includes('Quartile')
        ? 'Quartiles divide the data into four equal parts for distribution analysis.'
        : step.includes('IQR')
        ? 'Interquartile Range measures the spread of the middle 50% of data.'
        : step.includes('outliers')
        ? 'Outliers are data points that fall outside the expected range.'
        : 'Processing statistical calculation step.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportResults = (format: 'json' | 'csv' | 'txt') => {
    if (!result) return;
    
    let content = '';
    const fileName = `range-results.${format}`;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(result, null, 2);
        break;
      case 'csv':
        content = `data,${result.validNumbers.join(',')}\nrange,${result.range}\nminimum,${result.minimum}\nmaximum,${result.maximum}`;
        break;
      case 'txt':
        content = `Range: ${result.range}\nMinimum: ${result.minimum}\nMaximum: ${result.maximum}\nData: ${result.validNumbers.join(', ')}`;
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
    const shareText = `Range: ${data.range.toFixed(precision)}, Min: ${data.minimum.toFixed(precision)}, Max: ${data.maximum.toFixed(precision)}, Count: ${data.count}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Range Calculator Results',
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
        title="Range Calculator"
        description="Calculate data range, minimum, maximum, and distribution analysis with specialized tools for different use cases."
        breadcrumbs={[
          { label: 'Calculators', href: '/calculator' },
          { label: 'Range Calculator' }
        ]}
        currentTool="range"
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
              
              <PrecisionControl
                precision={precision}
                onPrecisionChange={setPrecision}
              />
            </div>
          </div>

          {/* Results Section */}
          {result && result.count > 0 && (
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
          {result && result.count > 0 && (
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
                Range Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  calculatorType="range"
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