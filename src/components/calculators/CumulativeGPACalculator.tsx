"use client";
/**
 * CumulativeGPACalculator - Complete cumulative GPA calculator component
 * Implements US-018: Cumulative GPA calculation for graduate school applications
 */

import React, { useState, useRef } from 'react';
import { HelpCircle, RefreshCw, ChevronDown, Copy, Share2, Download } from 'lucide-react';
import useCumulativeGPACalculation from '@/hooks/useCumulativeGPACalculation';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
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
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO
  const [showSteps, setShowSteps] = useState(false);
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

  // Action functions for copy, share, download
  const copyResult = () => {
    if (!result) return;
    const text = `Cumulative GPA Results
Cumulative GPA: ${result.cumulativeGPA.toFixed(2)}
Total Semesters: ${semesterCount}
Total Courses: ${courseCount}
Total Credits: ${totalCredits}
Source System: ${sourceGradingSystem}
Target System: ${targetGradingSystem}`;
    
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Show success feedback
    });
  };

  const shareResult = async () => {
    if (!result) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Cumulative GPA Results',
          text: `My cumulative GPA is ${result.cumulativeGPA.toFixed(2)} across ${semesterCount} semesters with ${courseCount} courses and ${totalCredits} credits.`,
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
      cumulativeGPA: result.cumulativeGPA,
      totalSemesters: semesterCount,
      totalCourses: courseCount,
      totalCredits: totalCredits,
      sourceGradingSystem: sourceGradingSystem,
      targetGradingSystem: targetGradingSystem,
      courses: courses,
      timestamp: new Date().toISOString()
    };

    if (format === 'csv') {
      content = `Course Name,Grade,Credits,Semester,Included\n`;
      content += courses.map(course => 
        `"${course.name}","${course.grade}",${course.credits},"${course.semester}",${course.isIncluded ? 'Yes' : 'No'}`
      ).join('\n');
      content += `\n\nCumulative GPA,${result.cumulativeGPA.toFixed(2)}\nTotal Semesters,${semesterCount}\nTotal Courses,${courseCount}\nTotal Credits,${totalCredits}\nSource System,${sourceGradingSystem}\nTarget System,${targetGradingSystem}`;
      filename = 'cumulative_gpa_results.csv';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = 'cumulative_gpa_results.json';
      mimeType = 'application/json';
    } else { // txt
      content = `Cumulative GPA Results
Generated: ${new Date().toLocaleString()}

Cumulative GPA: ${result.cumulativeGPA.toFixed(2)}
Total Semesters: ${semesterCount}
Total Courses: ${courseCount}
Total Credits: ${totalCredits}
Source System: ${sourceGradingSystem}
Target System: ${targetGradingSystem}

Course Details:
${courses.map(course => `${course.name}: ${course.grade} (${course.credits} credits, ${course.semester})`).join('\n')}`;
      filename = 'cumulative_gpa_results.txt';
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

            {/* Action Buttons - Calculate button removed, Reset moved to input component */}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Cumulative GPA Results</h2>
            
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
            <h4 className="text-sm font-medium text-blue-900 mb-2">Academic Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-700">{semesterCount}</div>
                <div className="text-blue-600">Semesters</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-700">{courseCount}</div>
                <div className="text-blue-600">Total Courses</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-700">{totalCredits}</div>
                <div className="text-blue-600">Total Credits</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-blue-700">
                  {result ? result.cumulativeGPA.toFixed(2) : '--'}
                </div>
                <div className="text-blue-600">Cumulative GPA</div>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="text-center">
            <ResultDisplay
              result={result}
              type="cumulative-gpa"
              showDetails={true}
            />
          </div>

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
            Cumulative GPA Calculator Help
          </h3>
          <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
            showHelp ? 'rotate-180' : ''
          }`} />
        </button>
        
        {showHelp && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <HelpSection
              userMode="student"
              calculatorType="cumulative-gpa"
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