"use client";
/**
 * FinalGradeCalculator - Complete final grade prediction calculator component
 * Implements US-019: Final exam score prediction for students
 */

import React, { useState } from 'react';
import { HelpCircle, RefreshCw, ChevronDown } from 'lucide-react';
import useFinalGradeCalculation from '@/hooks/useFinalGradeCalculation';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
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
    autoCalculate: false
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

  // Notify parent component about result changes
  React.useEffect(() => {
    onResultChange?.(result !== null);
  }, [result, onResultChange]);

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

            {/* Grading Scale Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grading Scale
              </label>
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

            {/* Action Buttons */}
            <div className="flex gap-2 justify-center pt-2">
              {grades.length > 0 && (
                <button
                  onClick={calculate}
                  disabled={!canCalculate || isCalculating}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    canCalculate && !isCalculating
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isCalculating ? 'Calculating...' : 'Calculate Required Score'}
                </button>
              )}
              
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Reset all data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Grade Prediction</h2>
          
          {/* Current Status Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
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

      {/* Calculation Steps */}
      {showSteps && result && (
        <CalculationSteps
          steps={getCalculationSteps()}
          context="student"
          showFormulas={true}
          showExplanations={true}
          interactive={true}
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
            Final Grade Calculator Help
          </h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            showHelp ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showHelp && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
              <h4 className="font-medium text-gray-900 mb-2">What is Final Grade Prediction?</h4>
              <p className="text-gray-700">
                This calculator helps you determine the minimum score needed on your final exam 
                to achieve your desired overall grade in a course based on your current performance.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Use This Calculator</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Enter your current assignment and exam scores with their weights</li>
                <li>Set the weight percentage for your final exam</li>
                <li>Choose your target overall grade for the course</li>
                <li>The calculator will show the required final exam score</li>
                <li>View detailed calculation steps and feasibility analysis</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Understanding Results</h4>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Green:</strong> Target is easily achievable</li>
                <li><strong>Yellow:</strong> Target requires moderate effort</li>
                <li><strong>Orange:</strong> Target is challenging but possible</li>
                <li><strong>Red:</strong> Target may not be achievable</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tips for Success</h4>
              <ul className="text-gray-700 space-y-1">
                <li>Keep your current grades updated as you receive new scores</li>
                <li>Plan your study time based on the required final score</li>
                <li>Consider extra credit opportunities if available</li>
                <li>Speak with your instructor if targets seem unrealistic</li>
              </ul>
            </div>
            </div>
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