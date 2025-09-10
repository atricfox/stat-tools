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
import ShareCalculation from '@/components/calculator/ShareCalculation';

export default function WeightedMeanCalculator() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [precision, setPrecision] = useState(2);
  const [inputMode, setInputMode] = useState<InputMode>('pairs');
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO

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

  // Convert result to CalculationStep format for the CalculationSteps component
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result) return [];
    
    return [
      {
        id: 'step-1',
        title: 'Step 1',
        description: `Collected ${result.validPairs} valid value:weight pairs`,
        formula: 'Data Validation',
        calculation: `Found ${result.validPairs} pairs, excluded ${result.excludedPairs} invalid entries`,
        result: `${result.validPairs} pairs`,
        explanation: 'Validated input data and filtered out invalid entries.',
        difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
      },
      {
        id: 'step-2',
        title: 'Step 2',
        description: 'Calculate weighted sum',
        formula: 'Σ(value × weight)',
        calculation: `Total weighted sum = ${result.totalWeightedValue}`,
        result: `${result.totalWeightedValue}`,
        explanation: 'Sum of all values multiplied by their respective weights.',
        difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
      },
      {
        id: 'step-3',
        title: 'Step 3',
        description: 'Calculate total weights',
        formula: 'Σ(weight)',
        calculation: `Total weights = ${result.totalWeights}`,
        result: `${result.totalWeights}`,
        explanation: 'Sum of all individual weights.',
        difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
      },
      {
        id: 'step-4',
        title: 'Step 4',
        description: 'Calculate weighted mean',
        formula: 'Weighted Mean = Σ(value × weight) ÷ Σ(weight)',
        calculation: `${result.totalWeightedValue} ÷ ${result.totalWeights} = ${result.weightedMean}`,
        result: `${result.weightedMean}`,
        explanation: 'The weighted mean represents the central tendency considering the importance (weight) of each value.',
        difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
      }
    ];
  };


  return (
    <CalculatorLayout
      title="Weighted Mean Calculator"
      description="Calculate weighted averages with multiple input methods. Perfect for GPA calculations, research data analysis, and weighted scoring systems."
      breadcrumbs={[
        { label: 'Calculators', href: '/calculator' },
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
          className="shadow-sm"
        />

        {/* Calculation Steps */}
        {showSteps && result && (
          <CalculationSteps
            steps={getCalculationSteps()}
            context={userMode}
            showFormulas={true}
            showExplanations={userMode === 'student'}
            interactive={true}
            className="shadow-sm"
          />
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

        {/* Control Buttons - Help Always Available for SEO */}
        <div className="flex flex-wrap gap-4">
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
          
          {/* Calculation Steps Button - Only when results available */}
          {result && (
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
          )}
          
          {/* Share Calculation - Only when results available */}
          {result && (
            <ShareCalculation
              onCreateShare={(options) => createShareableUrl(result, options)}
              onGenerateQR={generateQRCode}
              result={result}
            />
          )}
        </div>

      </div>
    </CalculatorLayout>
  );
}