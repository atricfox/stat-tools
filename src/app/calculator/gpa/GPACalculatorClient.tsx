'use client';

import React, { useState, useEffect } from 'react';
import { 
  HelpCircle,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import GradePointSystemSelector from '@/components/calculator/GradePointSystemSelector';
import GPADataInput from '@/components/calculator/GPADataInput';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import { useGPACalculation } from '@/hooks/useGPACalculation';
import { DEFAULT_GRADE_SYSTEMS } from '@/lib/gpaCalculation';
import { GradePointSystem } from '@/types/gpa';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';

export default function GPACalculatorClient() {
  // Use GPA calculation hook
  const {
    result,
    error,
    courses,
    addCourse,
    removeCourse,
    updateCourse,
    clearAll,
    loadExample,
    courseStatistics,
    validationSummary,
    calculateWithCurrentCourses,
    calculateWithCompatibleCourses
  } = useGPACalculation();

  // SEO structured data
  const { getToolConfig } = useStructuredData('gpa');
  const structuredDataConfig = getToolConfig('gpa');

  // UI State
  const [precision, setPrecision] = useState(2);
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [showIncompatibilityWarning, setShowIncompatibilityWarning] = useState(false);

  // GPA specific state
  const [gradeSystem, setGradeSystem] = useState<GradePointSystem>(DEFAULT_GRADE_SYSTEMS['gpa-4.0']);

  // Get available grade systems
  const gradeSystems = Object.values(DEFAULT_GRADE_SYSTEMS);

  // Convert GPA calculation steps to CalculationSteps format
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

  // Handle grading system changes - show warning for incompatible data
  useEffect(() => {
    if (courses.length > 0) {
      // Check if any courses have invalid grades for the new system
      const hasInvalidGrades = courses.some(course => {
        if (!course.grade) return false;
        return !gradeSystem.mappings.some(mapping => 
          mapping.letterGrade === course.grade
        );
      });

      if (hasInvalidGrades) {
        // Show warning instead of clearing immediately
        setShowIncompatibilityWarning(true);
      } else {
        setShowIncompatibilityWarning(false);
      }
    } else {
      setShowIncompatibilityWarning(false);
    }
  }, [gradeSystem, courses]);

  // Handle incompatibility resolution
  const handleIncompatibilityResolution = (action: 'clear' | 'loadExample' | 'keep') => {
    if (action === 'clear') {
      clearAll();
    } else if (action === 'loadExample') {
      loadExample(gradeSystem.id);
    } else if (action === 'keep') {
      // When keeping data, calculate only with compatible courses
      calculateWithCompatibleCourses(gradeSystem, { precision });
    }
    setShowIncompatibilityWarning(false);
  };

  // Auto-calculate when courses or precision changes
  useEffect(() => {
    if (courses.length > 0 && !showIncompatibilityWarning) {
      // Only calculate if all courses have required fields
      const hasValidCourses = courses.every(course => 
        course.name?.trim() && 
        course.grade?.trim() && 
        course.credits > 0
      );
      
      if (hasValidCourses) {
        calculateWithCurrentCourses(gradeSystem, { precision });
      }
    }
  }, [courses, precision, calculateWithCurrentCourses, gradeSystem, showIncompatibilityWarning]);

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />
      
      <CalculatorLayout
        title="GPA Calculator"
        description="Calculate your Grade Point Average with support for multiple grading systems. Perfect for students, academic advisors, and international applicants."
        breadcrumbs={[
          { label: 'Calculators', href: '/calculator' },
          { label: 'GPA Calculator' }
        ]}
        currentTool="gpa"
        toolCategory="gpa"
      >
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="space-y-6">
              
              {/* Grade System Selector */}
              <GradePointSystemSelector
                system={gradeSystem}
                onSystemChange={setGradeSystem}
                supportedSystems={gradeSystems}
                showConversionTable={true}
                allowCustom={false}
              />

              {/* Course Data Input */}
              <GPADataInput
                courses={courses}
                gradeSystem={gradeSystem}
                onCoursesChange={(_newCourses) => {
                  // This would require a new method in useGPACalculation
                  // For now, we'll use the existing methods
                }}
                onAddCourse={addCourse}
                onUpdateCourse={updateCourse}
                onRemoveCourse={removeCourse}
                onClearAll={clearAll}
                maxCourses={50}
              />

              {/* Course Statistics */}
              {courses.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Course Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium text-blue-700">{courseStatistics.totalCourses}</div>
                      <div className="text-blue-600">Total Courses</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-700">{courseStatistics.totalCredits}</div>
                      <div className="text-blue-600">Total Credits</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-700">{courseStatistics.excludedCourses}</div>
                      <div className="text-blue-600">Excluded</div>
                    </div>
                    <div>
                      <div className="font-medium text-blue-700">{courseStatistics.retakes}</div>
                      <div className="text-blue-600">Retakes</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Summary */}
              {!validationSummary.isValid && courses.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center text-yellow-800">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Validation Issues</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    {validationSummary.errorCount} errors, {validationSummary.warningCount} warnings
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">{validationSummary.message}</p>
                </div>
              )}

              {/* Precision Control */}
              <PrecisionControl
                precision={precision}
                onPrecisionChange={setPrecision}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 justify-center pt-2">
                {result && (
                  <button
                    onClick={() => setShowVisualization(!showVisualization)}
                    className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
                      showVisualization 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4 inline mr-1" />
                    Charts
                  </button>
                )}
                
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  title="Clear all courses"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">GPA Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.gpa.toFixed(precision)}
                  </div>
                  <div className="text-sm text-gray-600">Current GPA</div>
                  <div className="text-xs text-gray-500">{gradeSystem.name}</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.totalCredits}</div>
                  <div className="text-sm text-gray-600">Total Credits</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {result.academicStanding.level}
                  </div>
                  <div className="text-sm text-gray-600">Academic Standing</div>
                </div>
              </div>

              {/* GPA Analysis Charts */}
              {showVisualization && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    <BarChart3 className="w-5 h-5 inline mr-2" />
                    GPA Analysis Charts
                  </h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Grade Distribution Chart */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Grade Distribution</h4>
                      <div className="space-y-2">
                        {result.statistics.distribution.map((dist, index) => (
                          <div key={index} className="flex items-center">
                            <div className="w-12 text-sm font-mono text-gray-600 mr-3">
                              {dist.grade}
                            </div>
                            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${dist.percentage}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                                {dist.count} course{dist.count !== 1 ? 's' : ''} ({dist.percentage.toFixed(1)}%)
                              </div>
                            </div>
                            <div className="w-16 text-sm text-gray-500 ml-3">
                              {dist.credits} cr
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* GPA Performance Gauge */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">GPA Performance</h4>
                      <div className="relative">
                        <div className="w-48 h-24 mx-auto mb-4">
                          <svg viewBox="0 0 200 100" className="w-full h-full">
                            <path
                              d="M 20 80 A 80 80 0 0 1 180 80"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="8"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 20 80 A 80 80 0 0 1 180 80"
                              fill="none"
                              stroke={
                                result.gpa >= gradeSystem.scale * 0.9 ? '#10b981' :
                                result.gpa >= gradeSystem.scale * 0.75 ? '#3b82f6' :
                                result.gpa >= gradeSystem.scale * 0.6 ? '#f59e0b' : '#ef4444'
                              }
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeDasharray={`${(result.gpa / gradeSystem.scale) * 251.33} 251.33`}
                              className="transition-all duration-1000 ease-out"
                            />
                            <text
                              x="100"
                              y="70"
                              textAnchor="middle"
                              className="fill-gray-900 text-2xl font-bold"
                            >
                              {result.gpa.toFixed(precision)}
                            </text>
                            <text
                              x="100"
                              y="85"
                              textAnchor="middle"
                              className="fill-gray-500 text-xs"
                            >
                              / {gradeSystem.scale}
                            </text>
                          </svg>
                        </div>
                        
                        <div className="text-center">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            result.academicStanding.level === 'Excellent' ? 'bg-green-100 text-green-800' :
                            result.academicStanding.level === 'Good' ? 'bg-blue-100 text-blue-800' :
                            result.academicStanding.level === 'Satisfactory' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {result.academicStanding.level}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            {result.academicStanding.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Academic Performance</h3>
                <p className="text-sm text-gray-700 mb-3">{result.academicStanding.description}</p>
                
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-gray-800">Recommendations:</h4>
                  {result.academicStanding.recommendations.map((rec, index) => (
                    <p key={index} className="text-sm text-gray-600">• {rec}</p>
                  ))}
                </div>
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

          {/* Toggle Buttons */}
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

          {/* Help Section */}
          {showHelp && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <HelpCircle className="w-5 h-5 inline mr-2" />
                GPA Calculator Help
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">What is GPA?</h4>
                  <p className="text-gray-700">
                    Grade Point Average (GPA) is a standardized way to measure academic performance. 
                    It&apos;s calculated by dividing total grade points by total credit hours.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How to Use This Calculator</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Select your grading system (4.0, 4.3, or 4.5 scale)</li>
                    <li>Add courses using manual entry, transcript paste, or file upload</li>
                    <li>Your GPA will be calculated automatically</li>
                    <li>View detailed calculation steps and academic performance insights</li>
                    <li>Export your results or save custom grading systems</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Grading Systems</h4>
                  <ul className="text-gray-700 space-y-1">
                    <li><strong>4.0 Scale:</strong> Standard US system (A=4.0, B=3.0, etc.)</li>
                    <li><strong>4.3 Scale:</strong> Canadian system (A+=4.3, A=4.0, etc.)</li>
                    <li><strong>4.5 Scale:</strong> German system with different grade mappings</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center text-red-800">
                <span className="font-medium">Error:</span>
              </div>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Grading System Incompatibility Warning */}
          {showIncompatibilityWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                <div className="flex items-center text-amber-600 mb-4">
                  <HelpCircle className="w-6 h-6 mr-2" />
                  <h3 className="text-lg font-semibold">Grading System Change</h3>
                </div>
                
                <p className="text-gray-700 mb-4">
                  You&apos;ve switched to <strong>{gradeSystem.name}</strong>, but some of your current grades 
                  are not compatible with this grading system.
                </p>
                
                <p className="text-sm text-gray-600 mb-6">
                  How would you like to proceed?
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handleIncompatibilityResolution('clear')}
                    className="w-full px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-left"
                  >
                    <div className="font-medium">Clear All Data</div>
                    <div className="text-sm text-red-600">Remove all courses and start fresh</div>
                  </button>
                  
                  <button
                    onClick={() => handleIncompatibilityResolution('loadExample')}
                    className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-left"
                  >
                    <div className="font-medium">Load Example Data</div>
                    <div className="text-sm text-blue-600">Replace with sample courses for {gradeSystem.name}</div>
                  </button>
                  
                  <button
                    onClick={() => handleIncompatibilityResolution('keep')}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-left"
                  >
                    <div className="font-medium">Keep Current Data</div>
                    <div className="text-sm text-gray-600">
                      Calculate GPA using only courses compatible with {gradeSystem.name}
                    </div>
                  </button>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    You can manually edit individual course grades later to match the new grading system.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CalculatorLayout>
    </>
  );
}