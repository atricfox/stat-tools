'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { useMedianCalculation } from '@/hooks/useMedianCalculation';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

export default function MedianCalculatorClient() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Use the median calculation hook
  const { result, calculateMedian, clearResults } = useMedianCalculation(
    userMode,
    precision
  );

  // SEO structured data
  const { getToolConfig } = useStructuredData('median');
  const structuredDataConfig = getToolConfig('median');

  const handleInputChange = (value: string) => {
    setInput(value);
    calculateMedian(value);
  };

  const handleClearAll = () => {
    setInput('');
    clearResults();
  };

  // Convert result steps to CalculationStep format
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Data Processing' : 
               index === result.steps.length - 1 ? 'Median = Middle Value' : 
               index === 1 ? 'Data Sorting' : '',
      calculation: step,
      result: index === result.steps.length - 1 ? formatForCalculationSteps(result.median, userMode, precision) : '',
      explanation: index === result.steps.length - 1 
        ? 'The median represents the middle value when data is sorted in order.' 
        : index === 0 
        ? 'Processing and validating the input data.'
        : 'Sorting data and finding the middle position.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportResults = (format: 'csv' | 'json' | 'txt') => {
    if (!result) return;
    
    const data = {
      median: result.median,
      mean: result.mean,
      count: result.count,
      min: result.min,
      max: result.max,
      range: result.max - result.min,
      q1: result.q1,
      q3: result.q3,
      iqr: result.iqr,
      outliers: result.outliers || []
    };
    
    let content = '';
    let filename = '';
    
    switch (format) {
      case 'csv':
        content = `Metric,Value\nMedian,${result.median}\nMean,${result.mean}\nCount,${result.count}\nMin,${result.min}\nMax,${result.max}\nRange,${result.max - result.min}\nQ1 (First Quartile),${result.q1}\nQ3 (Third Quartile),${result.q3}\nIQR (Interquartile Range),${result.iqr}\nOutliers,"${(result.outliers || []).join(', ')}"`;
        filename = 'median-results.csv';
        break;
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = 'median-results.json';
        break;
      case 'txt':
        content = `Median Calculator Results\n\nMedian: ${result.median}\nMean: ${result.mean}\nCount: ${result.count}\nMin: ${result.min}\nMax: ${result.max}\nRange: ${result.max - result.min}\nQ1 (First Quartile): ${result.q1}\nQ3 (Third Quartile): ${result.q3}\nIQR (Interquartile Range): ${result.iqr}\nOutliers: ${(result.outliers || []).join(', ') || 'None'}`;
        filename = 'median-results.txt';
        break;
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareResults = async (data: any) => {
    if (navigator.share && result) {
      try {
        await navigator.share({
          title: 'Median Calculator Results',
          text: `Median: ${result.median}\nMean: ${result.mean}\nCount: ${result.count}\nQ1: ${result.q1}\nQ3: ${result.q3}\nIQR: ${result.iqr}\nRange: ${result.min} - ${result.max}`,
          url: window.location.href
        });
      } catch (error: any) {
        // Handle share cancellation or errors gracefully
        if (error.name !== 'AbortError') {
          console.error('Error sharing results:', error);
        }
        // AbortError means user canceled the share, which is normal behavior
      }
    }
  };

  const toolCategory = userMode === 'teacher' ? 'gpa' : userMode === 'research' ? 'analysis' : 'statistics';

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />
      
      <CalculatorLayout
        title="Median Calculator"
        description="Calculate the median (middle value) of your dataset with advanced statistical analysis tools."
        breadcrumbs={[
          { label: 'Calculators', href: '/statistics-calculators' },
          { label: 'Median Calculator' }
        ]}
        currentTool="median"
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

          {/* Calculation Steps Section */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Calculation Steps
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {showSteps && (
                <div className="p-6">
                  <CalculationSteps 
                    steps={getCalculationSteps()}
                    userMode={userMode}
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
                Median Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  isOpen={true}
                  onToggle={() => {}}
                  title=""
                  content={{
                    concept: "The median is the middle value in a dataset when values are arranged in order. Unlike the mean, it's not affected by extreme values (outliers).",
                    whenToUse: "Use median when you want to find the typical value in a dataset, especially when dealing with skewed distributions or outliers.",
                    examples: [
                      "Test scores: Finding the middle performance level",
                      "Income data: Understanding typical earnings (not skewed by high earners)",
                      "Survey responses: Finding the central tendency in ratings"
                    ]
                  }}
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
