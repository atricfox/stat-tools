'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DualValueInput from '@/components/calculator/DualValueInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { usePercentErrorCalculation } from '@/hooks/usePercentErrorCalculation';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';
import { formatForCalculationSteps, formatPercentage } from '@/lib/formatters/numberFormatter';

export default function PercentErrorCalculatorClient() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [theoreticalValue, setTheoreticalValue] = useState('');
  const [experimentalValue, setExperimentalValue] = useState('');
  const [precision, setPrecision] = useState(2);
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO

  // Use the custom hook for calculations
  const { result, calculatePercentError, clearResults, loadExample } = usePercentErrorCalculation(
    userMode,
    precision
  );

  // SEO structured data
  const { getToolConfig } = useStructuredData('percent-error');
  const structuredDataConfig = getToolConfig('percent-error');

  const handleTheoreticalChange = (value: string) => {
    setTheoreticalValue(value);
    // Always attempt calculation when either input changes, let the hook handle validation
    calculatePercentError(value, experimentalValue);
  };

  const handleExperimentalChange = (value: string) => {
    setExperimentalValue(value);
    // Always attempt calculation when either input changes, let the hook handle validation  
    calculatePercentError(theoreticalValue, value);
  };

  const handleClearAll = () => {
    setTheoreticalValue('');
    setExperimentalValue('');
    clearResults();
  };

  const handleLoadExample = () => {
    const example = loadExample();
    setTheoreticalValue(example.theoretical);
    setExperimentalValue(example.experimental);
    calculatePercentError(example.theoretical, example.experimental);
  };

  // Convert result steps to CalculationStep format for the CalculationSteps component
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Input Values' : 
               index === 1 ? '|Experimental - Theoretical|' :
               index === 2 ? 'Percent Error = (|Error| / |Theoretical|) × 100%' :
               index === result.steps.length - 1 ? 'Final Result' : '',
      calculation: step,
      result: index === 2 ? formatPercentage(result.percentError, userMode, precision) : '',
      explanation: index === 0 
        ? 'Input the theoretical and experimental values for comparison.'
        : index === 1
        ? 'Calculate the absolute difference between experimental and theoretical values.'
        : index === 2
        ? 'Calculate the percent error as a percentage of the theoretical value.'
        : index === result.steps.length - 1
        ? 'The percent error indicates the accuracy of the measurement.'
        : 'Processing calculation step.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportResults = (format: 'json' | 'csv' | 'txt') => {
    if (!result) return;
    
    let content = '';
    const fileName = `percent-error-results.${format}`;
    
    switch (format) {
      case 'json':
        content = JSON.stringify(result, null, 2);
        break;
      case 'csv':
        content = `theoretical,experimental,percent_error,absolute_error\n${result.theoreticalValue},${result.experimentalValue},${result.percentError},${result.absoluteError}`;
        break;
      case 'txt':
        content = `Percent Error: ${result.percentError}%\nAbsolute Error: ${result.absoluteError}\nTheoretical: ${result.theoreticalValue}\nExperimental: ${result.experimentalValue}`;
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
    const shareText = `Percent Error: ${data.percentError.toFixed(precision)}%, Absolute Error: ${data.absoluteError.toFixed(precision)}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Percent Error Calculator Results',
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
        title="Percent Error Calculator"
        description="Calculate percent error between theoretical and experimental values with specialized tools for students, teachers, and researchers."
        breadcrumbs={[
          { label: 'Calculators', href: '/calculator' },
          { label: 'Percent Error Calculator' }
        ]}
        currentTool="percent-error"
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
              <DualValueInput
                theoreticalValue={theoreticalValue}
                experimentalValue={experimentalValue}
                onTheoreticalChange={handleTheoreticalChange}
                onExperimentalChange={handleExperimentalChange}
                userMode={userMode}
                error={result?.steps[0]?.includes('Error:') || result?.steps[0]?.includes('Invalid') 
                  ? result.steps[0] 
                  : undefined}
                onLoadExample={handleLoadExample}
                onClear={handleClearAll}
              />
              
              <PrecisionControl
                precision={precision}
                onPrecisionChange={setPrecision}
              />
            </div>
          </div>

          {/* Results Section */}
          {result && !result.steps[0]?.includes('Error:') && !result.steps[0]?.includes('Invalid') && (
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
          {result && !result.steps[0]?.includes('Error:') && !result.steps[0]?.includes('Invalid') && (
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
                Percent Error Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  calculatorType="percent-error"
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