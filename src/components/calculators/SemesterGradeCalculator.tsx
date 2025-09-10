"use client";
/**
 * SemesterGradeCalculator - Complete semester grade calculator component
 * Implements US-022: Semester grade calculation for students
 */

import React, { useState } from 'react';
import { HelpCircle, RefreshCw, ChevronDown } from 'lucide-react';
import useSemesterGradeCalculation from '@/hooks/useSemesterGradeCalculation';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import SemesterCourseDataInput from './shared/SemesterCourseDataInput';
import ResultDisplay from './shared/ResultDisplay';
import type { Course, GradingScale } from '@/types/education';

interface SemesterGradeCalculatorProps {
  className?: string;
  onResultChange?: (hasResult: boolean) => void;
}

export default function SemesterGradeCalculator({ 
  className = '',
  onResultChange 
}: SemesterGradeCalculatorProps) {
  const {
    courses,
    gradingScale,
    result,
    isCalculating,
    error,
    addCourse,
    updateCourse,
    removeCourse,
    setCourses,
    setGradingScale,
    calculate,
    reset,
    isValid,
    validationErrors,
    totalCredits,
    courseCount,
    canCalculate
  } = useSemesterGradeCalculation({
    initialCourses: [],
    initialGradingScale: '4.0',
    autoCalculate: true
  });

  // Course management functions for the new input component
  const addNewCourse = (newCourse: Omit<Course, 'id'>) => {
    const course: Course = {
      ...newCourse,
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setCourses([...courses, course]);
  };

  const clearAllCourses = () => {
    setCourses([]);
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
          
          {/* Grading Scale Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grading System</h3>
            <div className="flex flex-wrap gap-2">
              {(['percentage', '4.0', '5.0'] as GradingScale[]).map((scale) => (
                <button
                  key={scale}
                  onClick={() => setGradingScale(scale)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    gradingScale === scale
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {scale === 'percentage' ? 'Percentage (0-100)' : 
                   scale === '4.0' ? '4.0 Scale (A-F)' : '5.0 Scale (A-F)'}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Grades</h3>
            <SemesterCourseDataInput
              courses={courses}
              gradingScale={gradingScale}
              onCoursesChange={setCourses}
              onAddCourse={addNewCourse}
              onUpdateCourse={updateCourse}
              onRemoveCourse={removeCourse}
              onClearAll={clearAllCourses}
              maxCourses={25}
            />

            <div className="mt-4 text-sm text-gray-600 text-center">
              {courseCount} courses, {totalCredits} credits total
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
              <button
                onClick={calculate}
                disabled={!canCalculate || isCalculating}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  canCalculate && !isCalculating
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </button>
              
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Semester Grade Results</h2>
          
          {/* Current Status Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Semester Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-700">{courseCount}</div>
                <div className="text-blue-600">Courses</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">{totalCredits}</div>
                <div className="text-blue-600">Total Credits</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">
                  {gradingScale === 'percentage' ? 'Percentage' : 
                   gradingScale === '4.0' ? '4.0 Scale' : '5.0 Scale'}
                </div>
                <div className="text-blue-600">Grading System</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">
                  {result ? result.semesterGPA.toFixed(2) : '--'}
                </div>
                <div className="text-blue-600">Semester GPA</div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <ResultDisplay
            result={result}
            type="semester"
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
            Semester Grade Calculator Help
          </h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            showHelp ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showHelp && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Quick Start</h4>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                <li>Choose your grading system above</li>
                <li>Add courses using any input method (manual, paste, or upload)</li>
                <li>Your GPA is calculated automatically as you enter data</li>
              </ol>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Input Methods</h4>
              <ul className="text-gray-700 space-y-1">
                <li><strong>Manual:</strong> Add courses one by one</li>
                <li><strong>Paste Transcript:</strong> Copy-paste from your transcript</li>
                <li><strong>Spreadsheet:</strong> Import from Excel/Google Sheets</li>
                <li><strong>Upload File:</strong> Import from CSV file</li>
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