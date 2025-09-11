'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import CalculationSteps from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import UnweightedGPADataInput from '@/components/calculator/UnweightedGPADataInput';
import UnweightedGPAResults from '@/components/calculator/UnweightedGPAResults';
import { useUnweightedGPACalculation } from '@/hooks/useUnweightedGPACalculation';
import { UNWEIGHTED_GRADING_SYSTEMS } from '@/lib/unweightedGpaCalculation';
import { UI_CONTENT, UnweightedGradingSystem } from '@/types/unweightedGpa';

export default function UnweightedGPACalculatorClient() {
  // UI State
  const [precision, setPrecision] = useState(2);
  const [showHelp, setShowHelp] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [gradingSystem, setGradingSystem] = useState<UnweightedGradingSystem>(
    UNWEIGHTED_GRADING_SYSTEMS['standard-4.0']
  );

  // Use the unweighted GPA calculation hook
  const {
    result,
    isCalculating,
    error,
    courses,
    addCourse,
    updateCourse,
    removeCourse,
    clearAll,
    loadExample,
    exportToCSV,
    exportToJSON
  } = useUnweightedGPACalculation(gradingSystem, precision);

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    try {
      let content = '';
      let fileName = '';
      let mimeType = '';

      switch (format) {
        case 'csv':
          content = exportToCSV();
          fileName = 'unweighted-gpa-results.csv';
          mimeType = 'text/csv';
          break;
        case 'json':
          content = exportToJSON();
          fileName = 'unweighted-gpa-results.json';
          mimeType = 'application/json';
          break;
        default:
          console.warn('Unsupported export format:', format);
          return;
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <CalculatorLayout
      title={UI_CONTENT.title}
      description={UI_CONTENT.description}
      breadcrumbs={[
        { label: 'Calculators', href: '/calculator' },
        { label: 'Unweighted GPA Calculator' }
      ]}
      currentTool="unweighted-gpa"
      toolCategory="gpa"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grading System Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {UI_CONTENT.labels.gradingSystem}
              </label>
              <select
                value={gradingSystem.id}
                onChange={(e) => setGradingSystem(UNWEIGHTED_GRADING_SYSTEMS[e.target.value])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.values(UNWEIGHTED_GRADING_SYSTEMS).map(system => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Precision Control */}
            <PrecisionControl
              precision={precision}
              onPrecisionChange={setPrecision}
            />

            {/* Load Example */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {UI_CONTENT.labels.sampleData}
              </label>
              <button
                onClick={() => loadExample(gradingSystem.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {UI_CONTENT.buttons.loadExample}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </div>
          </div>
        )}

        {/* Data Input Section */}
        <UnweightedGPADataInput
          courses={courses}
          gradingSystem={gradingSystem}
          onAddCourse={addCourse}
          onUpdateCourse={updateCourse}
          onRemoveCourse={removeCourse}
          onClearAll={clearAll}
          onLoadExample={loadExample}
        />

        {/* Results Section */}
        {result && courses.length > 0 && (
          <UnweightedGPAResults
            result={result}
            precision={precision}
            onExport={handleExport}
          />
        )}

        {/* Calculation Steps Section */}
        {result && courses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                <HelpCircle className="w-5 h-5 inline mr-2" />
                {UI_CONTENT.labels.calculationSteps}
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showSteps ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showSteps && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <CalculationSteps
                  steps={result.calculationSteps.map(step => ({
                    id: step.id,
                    title: step.title,
                    description: step.description,
                    formula: step.formula || '',
                    calculation: step.calculation,
                    result: step.result,
                    explanation: step.explanation || '',
                    difficulty: 'basic' as const
                  }))}
                  context="student"
                  showFormulas={true}
                  showExplanations={true}
                  interactive={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              <HelpCircle className="w-5 h-5 inline mr-2" />
              {UI_CONTENT.help.title}
            </h3>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
              showHelp ? 'rotate-180' : ''
            }`} />
          </button>
          
          {showHelp && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Quick Guide</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                    <li>Select your grading system (4.0 Standard or Plus/Minus)</li>
                    <li>Add courses with name, credits, and letter grade</li>
                    <li>View your calculated unweighted GPA instantly</li>
                    <li>Export or share your results</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">{UI_CONTENT.help.unweightedVsWeighted}</h4>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>Unweighted GPA (This Calculator):</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>All courses count equally</li>
                      <li>Standard 4.0 scale for all classes</li>
                      <li>Used by many colleges for fair comparison</li>
                    </ul>
                    <p><strong>Weighted GPA:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>AP/IB/Honors courses get extra points</li>
                      <li>Can exceed 4.0 scale</li>
                      <li>Shows academic rigor and challenge level</li>
                    </ul>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">{UI_CONTENT.help.gradingSystems}</h4>
                  <div className="text-sm text-gray-600">
                    <p><strong>4.0 Standard Scale:</strong> A=4.0, B=3.0, C=2.0, D=1.0, F=0.0</p>
                    <p><strong>4.0 Plus/Minus Scale:</strong> Includes A+, A-, B+, B-, etc. with intermediate values</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">{UI_CONTENT.help.tips}</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Most competitive colleges recalculate using unweighted GPA</li>
                    <li>Focus on consistent performance across all subjects</li>
                    <li>Aim for 3.0+ for good standing, 3.5+ for competitive schools</li>
                    <li>Use this calculator to track your academic progress</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}