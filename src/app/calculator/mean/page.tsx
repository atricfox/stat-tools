'use client'

import React, { useState } from 'react';
import { RotateCcw, HelpCircle } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { useMeanCalculation } from '@/hooks/useMeanCalculation';

export default function MeanCalculator() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  const [ignoreOutliers, setIgnoreOutliers] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Use the custom hook for calculations
  const { result, calculateMean, clearResults, loadExample } = useMeanCalculation(
    userMode,
    precision,
    ignoreOutliers,
    confidenceLevel
  );

  const handleInputChange = (value: string) => {
    setInput(value);
    calculateMean(value);
  };

  const handleClearAll = () => {
    setInput('');
    clearResults();
  };

  const handleLoadExample = () => {
    const example = loadExample();
    setInput(example);
    calculateMean(example);
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadResults = (data: any, format: 'csv' | 'json') => {
    const content = format === 'json' 
      ? JSON.stringify(data, null, 2)
      : `Mean,Count,Sum\n${data.mean},${data.count},${data.sum}`;
    
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mean-results.${format}`;
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
    <CalculatorLayout
      title="Mean Calculator"
      description="Calculate the arithmetic mean (average) with specialized tools for different use cases."
      breadcrumbs={[
        { label: 'Calculators', href: '/calculator' },
        { label: 'Mean Calculator' }
      ]}
      currentTool="Mean Calculator"
      toolCategory={toolCategory}
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
                <DataInput
                  value={input}
                  onChange={handleInputChange}
                  context={userMode}
                  label="Enter Your Data"
                  placeholder={`Enter numbers for ${userMode} analysis...`}
                />

                {/* Precision Control - Full Width */}
                <PrecisionControl
                  precision={precision}
                  onPrecisionChange={setPrecision}
                  userContext={userMode}
                  showAdvanced={userMode === 'research'}
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
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={ignoreOutliers}
                          onChange={(e) => setIgnoreOutliers(e.target.checked)}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Exclude outliers</span>
                      </label>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Confidence Level
                        </label>
                        <select
                          value={confidenceLevel}
                          onChange={(e) => setConfidenceLevel(Number(e.target.value))}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value={90}>90%</option>
                          <option value={95}>95%</option>
                          <option value={99}>99%</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons - Full Width at Bottom */}
                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={handleLoadExample}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                    Load Example
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Clear all"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Section */}
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

            {/* Help Section */}
            {showHelp && (
              <HelpSection
                userMode={userMode}
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
              </div>
            )}
          </div>
    </CalculatorLayout>
  );
}