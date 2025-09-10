'use client';

import React, { useState } from 'react';
import { RotateCcw, HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { useMeanCalculation } from '@/hooks/useMeanCalculation';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';

export default function MeanCalculatorClient() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  // const [ignoreOutliers, setIgnoreOutliers] = useState(false); // unused
  // const [confidenceLevel, setConfidenceLevel] = useState(95); // unused
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO

  // Use the custom hook for calculations
  const { result, calculateMean, clearResults } = useMeanCalculation(
    userMode,
    precision,
    false, // ignoreOutliers
    95     // confidenceLevel
  );

  // SEO structured data
  const { getToolConfig } = useStructuredData('mean');
  const structuredDataConfig = getToolConfig('mean');

  const handleInputChange = (value: string) => {
    setInput(value);
    calculateMean(value);
  };

  const handleClearAll = () => {
    setInput('');
    clearResults();
  };

  // const handleLoadExample = () => {
  //   const example = loadExample();
  //   setInput(example);
  //   calculateMean(example);
  // }; // unused

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportResults = (format: 'json' | 'csv' | 'txt') => {
    if (!result) return;
    
    let content = '';
    const fileName = `mean-results.${format}`;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(result, null, 2);
        break;
      case 'csv':
        content = `data,${result.validNumbers.join(',')}\nmean,${result.mean}`;
        break;
      case 'txt':
        content = `Mean: ${result.mean}\nData: ${result.validNumbers.join(', ')}`;
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

  // Convert result steps to CalculationStep format for the CalculationSteps component
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Input Processing' : index === result.steps.length - 1 ? 'Mean = Sum ÷ Count' : '',
      calculation: step,
      result: index === result.steps.length - 1 ? result.mean.toFixed(precision) : '',
      explanation: index === result.steps.length - 1 
        ? 'The mean represents the central tendency of your data set.' 
        : 'Processing the input data and validating numerical values.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const toolCategory = userMode === 'teacher' ? 'gpa' : userMode === 'research' ? 'analysis' : 'statistics';

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />
      
      <CalculatorLayout
        title="Mean Calculator"
        description="Calculate the arithmetic mean (average) with specialized tools for different use cases."
        breadcrumbs={[
          { label: 'Calculators', href: '/calculator' },
          { label: 'Mean Calculator' }
        ]}
        currentTool="mean"
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
              />
              
              <PrecisionControl
                precision={precision}
                onPrecisionChange={setPrecision}
              />

              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Clear all data"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
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
            />
          )}

          {/* Calculation Steps */}
          {showSteps && result && (
            <CalculationSteps
              steps={getCalculationSteps()}
              context={userMode}
              showFormulas={userMode !== 'student'}
              showExplanations={true}
              interactive={userMode === 'student'}
              className="shadow-sm"
            />
          )}

          {/* Calculation Steps Button - Only when results available */}
          {result && (
            <div className="flex justify-center">
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
                Mean Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  calculatorType="mean"
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