"use client";
/**
 * CumulativeGPACalculator - Complete cumulative GPA calculator component
 * Implements US-018: Cumulative GPA calculation for graduate school applications
 */

import React, { useState } from 'react';
import { HelpCircle, RefreshCw, ChevronDown } from 'lucide-react';
import useCumulativeGPACalculation from '@/hooks/useCumulativeGPACalculation';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import CumulativeGPACourseDataInput from './shared/CumulativeGPACourseDataInput';
import ResultDisplay from './shared/ResultDisplay';
import type { Course, GradingScale } from '@/types/education';

interface CumulativeGPACalculatorProps {
  className?: string;
  onResultChange?: (hasResult: boolean) => void;
}

export default function CumulativeGPACalculator({ 
  className = '',
  onResultChange 
}: CumulativeGPACalculatorProps) {
  const {
    courses,
    sourceGradingSystem,
    targetGradingSystem,
    result,
    isCalculating,
    error,
    addCourse,
    updateCourse,
    removeCourse,
    setCourses,
    setSourceGradingSystem,
    setTargetGradingSystem,
    addSemester,
    calculate,
    reset,
    isValid,
    validationErrors,
    totalCredits,
    courseCount,
    semesterCount,
    canCalculate
  } = useCumulativeGPACalculation({
    initialCourses: [],
    initialSourceGradingSystem: '4.0',
    initialTargetGradingSystem: '4.0',
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
          
          {/* Grading System Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Grading System Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Grading System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input Grading System
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['percentage', '4.0', '5.0'] as GradingScale[]).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setSourceGradingSystem(scale)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        sourceGradingSystem === scale
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

              {/* Target Grading System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target GPA System
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['4.0', '5.0', 'percentage'] as GradingScale[]).map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setTargetGradingSystem(scale)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        targetGradingSystem === scale
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {scale === 'percentage' ? 'Percentage' : 
                       scale === '4.0' ? '4.0 Scale' : '5.0 Scale'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {sourceGradingSystem !== targetGradingSystem && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-amber-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    System will automatically convert grades: {sourceGradingSystem} → {targetGradingSystem}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Courses Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Grades</h3>
            <CumulativeGPACourseDataInput
              courses={courses}
              sourceGradingSystem={sourceGradingSystem}
              targetGradingSystem={targetGradingSystem}
              onCoursesChange={setCourses}
              onAddCourse={addNewCourse}
              onUpdateCourse={updateCourse}
              onRemoveCourse={removeCourse}
              onClearAll={clearAllCourses}
              onAddSemester={addSemester}
              maxCourses={50}
            />


            <div className="mt-4 text-sm text-gray-600 text-center">
              {semesterCount} semesters, {courseCount} courses, {totalCredits} credits total
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
                <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cumulative GPA Results</h2>
          
          {/* Current Status Summary */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Academic Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-700">{semesterCount}</div>
                <div className="text-blue-600">Semesters</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">{courseCount}</div>
                <div className="text-blue-600">Total Courses</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">{totalCredits}</div>
                <div className="text-blue-600">Total Credits</div>
              </div>
              <div>
                <div className="font-medium text-blue-700">
                  {result ? result.cumulativeGPA.toFixed(2) : '--'}
                </div>
                <div className="text-blue-600">Cumulative GPA</div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <ResultDisplay
            result={result}
            type="cumulative-gpa"
            showDetails={true}
          />

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Graduate School Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Most graduate programs require GPA ≥ 3.0</li>
              <li>• Top-tier schools typically expect GPA ≥ 3.5</li>
              <li>• Consider retaking low-grade courses</li>
              <li>• Major coursework matters more than electives</li>
              <li>• Upward grade trends are favorable</li>
            </ul>
          </div>
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
            Cumulative GPA Calculator Help
          </h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            showHelp ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showHelp && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-4">
              <div>
              <h4 className="font-medium text-gray-900 mb-2">What is Cumulative GPA?</h4>
              <p className="text-gray-700">
                Cumulative GPA is your overall Grade Point Average across all semesters and courses. 
                It's calculated by dividing total grade points by total credit hours for all courses taken.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">How to Use This Calculator</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Select input and target grading systems (4.0, 5.0, or percentage)</li>
                <li>Add courses organized by semester with grades and credit hours</li>
                <li>Use checkboxes to include/exclude courses from GPA calculation</li>
                <li>View cumulative GPA with detailed academic analysis</li>
                <li>Get graduate school competitiveness assessment</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Grading System Conversions</h4>
              <ul className="text-gray-700 space-y-1">
                <li><strong>4.0 Scale:</strong> A=4.0, B=3.0, C=2.0, D=1.0, F=0.0</li>
                <li><strong>5.0 Scale:</strong> A=5.0, B=4.0, C=3.0, D=2.0, F=0.0</li>
                <li><strong>Percentage:</strong> 90-100%=A, 80-89%=B, 70-79%=C, etc.</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Graduate School Applications</h4>
              <ul className="text-gray-700 space-y-1">
                <li>Most graduate programs require minimum 3.0 GPA</li>
                <li>Competitive programs typically expect 3.5+ GPA</li>
                <li>Top-tier schools often require 3.7+ GPA</li>
                <li>Consider major GPA vs. overall GPA for specialized programs</li>
                <li>Upward grade trends can offset lower early grades</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tips for GPA Improvement</h4>
              <ul className="text-gray-700 space-y-1">
                <li>Focus on high-credit courses for maximum impact</li>
                <li>Consider retaking courses with very low grades</li>
                <li>Take additional courses in areas of strength</li>
                <li>Seek academic support services early</li>
                <li>Plan course loads carefully to maintain quality</li>
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