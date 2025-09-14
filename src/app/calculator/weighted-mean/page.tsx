'use client'

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import WeightedDataInput from '@/components/calculator/WeightedDataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { useWeightedMeanCalculation } from '@/hooks/useWeightedMeanCalculation';
import { useWeightedURLState } from '@/lib/weighted-url-state-manager';
import { WeightedPair, InputMode } from '@/types/weightedMean';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

export default function WeightedMeanCalculator() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [precision, setPrecision] = useState(2);
  const [inputMode, setInputMode] = useState<InputMode>('pairs');
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO
  const [showSteps, setShowSteps] = useState(false);

  // Use the weighted mean calculation hook
  const {
    result,
    error,
    isCalculating,
    calculateWeighted,
    loadExample,
    clearResults
  } = useWeightedMeanCalculation({
    userMode,
    precision,
    zeroWeightStrategy: 'ignore',
    missingWeightStrategy: 'zero',
    normalizeWeights: false
  });

  // Use URL state management for sharing
  const {
    state: urlState,
    updateState: updateURLState,
    createShareableUrl,
    generateQRCode
  } = useWeightedURLState();

  const toolCategory = userMode === 'teacher' ? 'gpa' : userMode === 'research' ? 'analysis' : 'statistics';

  // Convert result steps to CalculationStep format for the CalculationSteps component
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Data Validation' : 
               index === 1 ? 'Weight Calculation' : 
               index === 2 ? 'Σ(value × weight)' :
               index === 3 ? 'Σ(weights)' :
               index === result.steps.length - 1 ? 'Weighted Mean = Σ(value × weight) / Σ(weights)' : '',
      calculation: step,
      result: index === result.steps.length - 1 ? formatForCalculationSteps(result.weightedMean, userMode, precision) : '',
      explanation: index === result.steps.length - 1 
        ? `The weighted mean gives more importance to values with higher weights.` 
        : index === 0 
        ? 'Validating and processing input value-weight pairs.'
        : index === 1
        ? 'Calculating the total weighted values and weights.'
        : 'Processing statistical calculations step by step.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const handleDataChange = (pairs: WeightedPair[]) => {
    // Auto-calculate when data changes
    if (pairs.length > 0) {
      calculateWeighted(pairs);
    } else {
      clearResults();
    }
    
    // Update URL state for sharing
    updateURLState({
      pairs,
      precision,
      userMode,
      inputMode
    });
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadResults = (data: any, format: 'csv' | 'json') => {
    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : `Weighted Mean,Total Weight,Valid Pairs,Total Weighted Value,Excluded\n${data.weightedMean},${data.totalWeights},${data.validPairs},${data.totalWeightedValue},${data.excludedPairs}`;
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weighted-mean-results.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareResults = (data: any) => {
    const shareableState = createShareableUrl(data, { includeQR: true });
    const shareUrl = shareableState?.url || window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Weighted Mean Calculator Results',
        text: `Weighted Mean: ${data.weightedMean.toFixed(precision)}`,
        url: shareUrl
      }).catch((error) => {
        // Ignore AbortError (user canceled share)
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(shareUrl);
        }
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      // You could add a toast notification here
    }
  };



  return (
    <CalculatorLayout
      title="Weighted Mean Calculator"
      description="Calculate weighted averages with multiple input methods. Perfect for GPA calculations, research data analysis, and weighted scoring systems."
      breadcrumbs={[
        { label: 'Calculators', href: '/statistics-calculators' },
        { label: 'Weighted Mean Calculator' }
      ]}
      currentTool="Weighted Mean Calculator"
      toolCategory={toolCategory}
    >
      {/* User Mode Selector */}
      <UserModeSelector 
        userMode={userMode} 
        onModeChange={setUserMode}
      />

      <div className="space-y-6 mt-8">
        
        {/* Data Input Section */}
        <WeightedDataInput
          inputMode={inputMode}
          onModeChange={setInputMode}
          onDataChange={handleDataChange}
          userMode={userMode}
          disabled={isCalculating}
        />

        {/* Precision Control */}
        <PrecisionControl
          precision={precision}
          onPrecisionChange={setPrecision}
          userContext={userMode}
          showAdvanced={userMode === 'research'}
        />

        {/* Statistical Results */}
        <StatisticalResults
          result={result}
          userMode={userMode}
          precision={precision}
          onCopy={handleCopyResults}
          onDownload={handleDownloadResults}
          onShare={handleShareResults}
          className="shadow-sm"
        />

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
              Weighted Mean Calculator Help
            </h3>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
              showHelp ? 'rotate-180' : ''
            }`} />
          </button>
          
          {showHelp && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <HelpSection
                userMode={userMode}
                calculatorType="weighted-mean"
                className="shadow-sm"
              />
            </div>
          )}
        </div>

        {/* Mode-specific placeholder information */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {userMode === 'student' && 'Student Mode Features'}
            {userMode === 'research' && 'Research Mode Features'}
            {userMode === 'teacher' && 'Teacher Mode Features'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userMode === 'student' && (
              <>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">GPA Calculation</h4>
                  <p className="text-sm text-gray-600">Calculate weighted GPA with course grades and credit hours</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Grade Analysis</h4>
                  <p className="text-sm text-gray-600">View grade distribution and course contributions</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Step-by-Step</h4>
                  <p className="text-sm text-gray-600">Detailed calculation steps for learning</p>
                </div>
              </>
            )}
            {userMode === 'research' && (
              <>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">High Precision</h4>
                  <p className="text-sm text-gray-600">Support for scientific precision requirements</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">URL Sharing</h4>
                  <p className="text-sm text-gray-600">Save and share calculation configurations</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Weight Analysis</h4>
                  <p className="text-sm text-gray-600">Analyze weight distribution and impact</p>
                </div>
              </>
            )}
            {userMode === 'teacher' && (
              <>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Batch Processing</h4>
                  <p className="text-sm text-gray-600">Handle multiple students and assignments</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Class Statistics</h4>
                  <p className="text-sm text-gray-600">Generate class performance summaries</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Data Import</h4>
                  <p className="text-sm text-gray-600">Import from Excel and CSV formats</p>
                </div>
              </>
            )}
          </div>
        </div>


      </div>
    </CalculatorLayout>
  );
}