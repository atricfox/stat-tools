"use client";
/**
 * FinalGradeCalculator - Complete final grade prediction calculator component
 * Implements US-019: Final exam score prediction for students
 */

import React, { useState, useRef } from 'react';
import { HelpCircle, RefreshCw, ChevronDown, Copy, Share2, Download } from 'lucide-react';
import useFinalGradeCalculation from '@/hooks/useFinalGradeCalculation';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import GradeDataInput from './shared/GradeDataInput';
import WeightSlider from './shared/WeightSlider';
import FinalGradeResultDisplay from './shared/FinalGradeResultDisplay';
import type { GradeItem, GradingScale } from '@/types/education';

interface FinalGradeCalculatorProps {
  className?: string;
  onResultChange?: (hasResult: boolean) => void;
}

export default function FinalGradeCalculator({ 
  className = '',
  onResultChange 
}: FinalGradeCalculatorProps) {
  const {
    grades,
    finalExamWeight,
    targetGrade,
    gradingScale,
    result,
    isCalculating,
    error,
    setGrades,
    setFinalExamWeight,
    setTargetGrade,
    setGradingScale,
    calculate,
    reset,
    isValid,
    validationErrors,
    currentWeightedScore,
    remainingWeight,
    canCalculate
  } = useFinalGradeCalculation({
    initialGrades: [],
    initialFinalWeight: 40,
    initialTargetGrade: 85,
    autoCalculate: true
  });

  // Grade management functions for the new input component
  const addGrade = (newGrade: Omit<GradeItem, 'id'>) => {
    const grade: GradeItem = {
      ...newGrade,
      id: `grade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setGrades([...grades, grade]);
  };

  const updateGrade = (gradeId: string, updates: Partial<GradeItem>) => {
    setGrades(grades.map(grade => 
      grade.id === gradeId ? { ...grade, ...updates } : grade
    ));
  };

  const removeGrade = (gradeId: string) => {
    setGrades(grades.filter(grade => grade.id !== gradeId));
  };

  const clearAllGrades = () => {
    setGrades([]);
  };


  // UI State for showing steps and help
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

  // Close download menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (downloadMenuRef.current && !downloadMenuRef.current.contains(event.target as Node)) {
        setShowDownloadMenu(false);
      }
    };

    if (showDownloadMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDownloadMenu]);

  // Notify parent component about result changes
  React.useEffect(() => {
    onResultChange?.(result !== null);
  }, [result, onResultChange]);

  // Action functions for copy, share, download
  const copyResult = () => {
    if (!result) return;
    const text = `Final Grade Prediction Results
Required Final Score: ${result.isAchievable ? `${result.requiredScore.toFixed(1)}%` : 'Not Achievable'}
Current Weighted Score: ${result.currentWeightedScore.toFixed(1)}%
${!result.isAchievable ? `Maximum Possible Grade: ${result.maxPossibleGrade.toFixed(1)}%` : ''}
Difficulty Level: ${result.difficultyLevel}
Recommendation: ${result.recommendation}`;
    
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show success feedback
    });
  };

  const shareResult = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Final Grade Prediction',
          text: `I need ${result.isAchievable ? `${result.requiredScore.toFixed(1)}%` : 'an impossible score'} on my final exam to achieve my target grade.`,
          url: window.location.href
        });
      } catch (error: any) {
        // Handle share cancellation gracefully
        if (error.name !== 'AbortError') {
          console.error('Error sharing results:', error);
          copyResult(); // Fallback to copy on error
        }
        // AbortError means user canceled the share, which is normal behavior
      }
    } else {
      copyResult(); // Fallback to copy
    }
  };

  const downloadData = (format: 'csv' | 'json' | 'txt') => {
    if (!result) return;
    let content = '';
    let filename = '';
    let mimeType = '';

    const data = {
      requiredScore: result.requiredScore,
      isAchievable: result.isAchievable,
      currentWeightedScore: result.currentWeightedScore,
      maxPossibleGrade: result.maxPossibleGrade,
      difficultyLevel: result.difficultyLevel,
      recommendation: result.recommendation,
      timestamp: new Date().toISOString()
    };

    if (format === 'csv') {
      content = `Field,Value
Required Final Score,${result.isAchievable ? `${result.requiredScore.toFixed(1)}%` : 'Not Achievable'}
Current Weighted Score,${result.currentWeightedScore.toFixed(1)}%
Maximum Possible Grade,${result.maxPossibleGrade.toFixed(1)}%
Difficulty Level,${result.difficultyLevel}
Is Achievable,${result.isAchievable}
Recommendation,"${result.recommendation}"
Generated,${new Date().toLocaleString()}`;
      filename = 'final_grade_prediction.csv';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'final_grade_prediction.json';
      mimeType = 'application/json';
    } else { // txt
      content = `Final Grade Prediction Results
Generated: ${new Date().toLocaleString()}

Required Final Score: ${result.isAchievable ? `${result.requiredScore.toFixed(1)}%` : 'Not Achievable'}
Current Weighted Score: ${result.currentWeightedScore.toFixed(1)}%
Maximum Possible Grade: ${result.maxPossibleGrade.toFixed(1)}%
Difficulty Level: ${result.difficultyLevel}
Is Achievable: ${result.isAchievable}

Recommendation: ${result.recommendation}`;
      filename = 'final_grade_prediction.txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  // Convert calculation steps to CalculationSteps format
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.calculationSteps) return [];
    
    return result.calculationSteps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      formula: step.formula || '',
      calculation: step.calculation,
      result: step.result,
      explanation: step.explanation,
      difficulty: step.difficulty as 'basic' | 'intermediate' | 'advanced'
    }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
        <div className="space-y-6">
          
          {/* Grading Scale Selection - Moved to top */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grading Scale</h3>
            <div className="flex flex-wrap gap-2">
              {(['percentage', '4.0', '5.0'] as GradingScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setGradingScale(scale)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    gradingScale === scale
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {scale === 'percentage' ? 'Percentage' : 
                   scale === '4.0' ? '4.0 Scale' : '5.0 Scale'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Current Grades Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Grades</h3>
            <GradeDataInput
              grades={grades}
              onGradesChange={setGrades}
              onAddGrade={addGrade}
              onUpdateGrade={updateGrade}
              onRemoveGrade={removeGrade}
              onClearAll={clearAllGrades}
              maxGrades={15}
            />
          </div>

          {/* Configuration Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Calculation Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Final Exam Weight */}
              <div>
                <WeightSlider
                  label="Final Exam Weight"
                  value={finalExamWeight}
                  onChange={setFinalExamWeight}
                  min={1}
                  max={Math.min(100, remainingWeight + finalExamWeight)}
                  step={1}
                  unit="%"
                  description={`Available weight: ${remainingWeight.toFixed(1)}%`}
                />
              </div>

              {/* Target Grade */}
              <div>
                <WeightSlider
                  label="Target Grade"
                  value={targetGrade}
                  onChange={setTargetGrade}
                  min={1}
                  max={100}
                  step={0.1}
                  unit="pts"
                  description="Desired overall grade for this course"
                />
              </div>
            </div>

            {/* Validation Errors */}
            {!isValid && validationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h4 className="text-sm font-medium text-red-800">Validation Errors</h4>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-1">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons - Remove Calculate button, move Clear to GradeDataInput */}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Final Grade Prediction</h2>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={copyResult}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Copy results"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={shareResult}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title="Share results"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <div className="relative" ref={downloadMenuRef}>
                <button 
                  onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  title="Download results"
                >
                  <Download className="h-4 w-4" />
                </button>
                {showDownloadMenu && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-16">
                    <button
                      onClick={() => downloadData('csv')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => downloadData('json')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => downloadData('txt')}
                      className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                    >
                      TXT
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Current Status Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-center">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Current Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-700">{grades.length}</div>
                <div className="text-blue-600">Assignments</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">{currentWeightedScore.toFixed(1)}</div>
                <div className="text-blue-600">Current Score</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">{finalExamWeight}%</div>
                <div className="text-blue-600">Final Weight</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">{targetGrade}</div>
                <div className="text-blue-600">Target Grade</div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <FinalGradeResultDisplay
            result={result}
            showDetails={true}
          />

        </div>
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
                context="student"
                showFormulas={true}
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
            Final Grade Calculator Help
          </h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            showHelp ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showHelp && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <HelpSection
              userMode="student"
              calculatorType="final-grade"
              className="shadow-sm"
            />
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center text-red-800">
            <span className="font-medium">Error:</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}