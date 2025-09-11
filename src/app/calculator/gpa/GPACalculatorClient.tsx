'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle,
  BarChart3,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import GradePointSystemSelector from '@/components/calculator/GradePointSystemSelector';
import GPADataInput from '@/components/calculator/GPADataInput';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
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
  const [showHelp, setShowHelp] = useState(true); // Default expanded for SEO
  const [showVisualization, setShowVisualization] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showIncompatibilityWarning, setShowIncompatibilityWarning] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const downloadMenuRef = useRef<HTMLDivElement>(null);

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
    // Don't auto-calculate if incompatibility warning is showing
    if (showIncompatibilityWarning) {
      return;
    }
    
    if (courses.length > 0) {
      // Check if all courses are compatible with current grading system
      const hasIncompatibleGrades = courses.some(course => {
        if (!course.grade) return false;
        return !gradeSystem.mappings.some(mapping => 
          mapping.letterGrade === course.grade
        );
      });
      
      // Don't calculate if there are incompatible grades
      if (hasIncompatibleGrades) {
        return;
      }
      
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

  // Close download menu when clicking outside
  useEffect(() => {
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

  // Handle copy results
  const handleCopyResults = () => {
    if (!result) return;
    const text = `GPA: ${result.gpa.toFixed(precision)}\nTotal Credits: ${result.totalCredits}\nAcademic Standing: ${result.academicStanding.level}\nGrading System: ${gradeSystem.name}`;
    navigator.clipboard.writeText(text);
  };

  // Handle share results
  const handleShareResults = () => {
    if (!result) return;
    const shareText = `GPA: ${result.gpa.toFixed(precision)}, Total Credits: ${result.totalCredits}, Academic Standing: ${result.academicStanding.level}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'GPA Calculator Results',
        text: shareText,
        url: window.location.href
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
        }
      });
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
    }
  };

  // Handle download results
  const handleDownloadResults = (format: 'csv' | 'json') => {
    if (!result) return;
    
    let content = '';
    const fileName = `gpa-results.${format}`;
    
    if (format === 'json') {
      content = JSON.stringify({
        gpa: result.gpa,
        totalCredits: result.totalCredits,
        academicStanding: result.academicStanding,
        system: gradeSystem.name,
        courses: result.courses.map(cr => ({
          name: cr.course.name,
          credits: cr.course.credits,
          grade: cr.course.grade,
          gradePoints: cr.gradePoints,
          qualityPoints: cr.qualityPoints
        })),
        statistics: result.statistics,
        timestamp: result.timestamp
      }, null, 2);
    } else {
      content = 'Course Name,Credits,Grade,Grade Points,Quality Points\n';
      content += result.courses.map(cr => 
        `"${cr.course.name}",${cr.course.credits},"${cr.course.grade}",${cr.gradePoints},${cr.qualityPoints}`
      ).join('\n');
      content += `\n\nGPA:,${result.gpa.toFixed(precision)}\n`;
      content += `Total Credits:,${result.totalCredits}\n`;
      content += `Academic Standing:,${result.academicStanding.level}\n`;
      content += `Grading System:,${gradeSystem.name}`;
    }

    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

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
                onCoursesChange={() => {
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

              {/* Action Buttons - Clear button moved to GPADataInput */}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">GPA Results</h2>
                <div className="flex items-center space-x-2">
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
                  <button
                    onClick={() => handleCopyResults()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Copy results"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                  </button>
                  <button
                    onClick={() => handleShareResults()}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    title="Share results"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                    </svg>
                  </button>
                  <div className="relative" ref={downloadMenuRef}>
                    <button
                      onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      title="Download results"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                    {showDownloadMenu && (
                      <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                        <button
                          onClick={() => {
                            handleDownloadResults('csv');
                            setShowDownloadMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                        >
                          CSV
                        </button>
                        <button
                          onClick={() => {
                            handleDownloadResults('json');
                            setShowDownloadMenu(false);
                          }}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-b-lg"
                        >
                          JSON
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
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
                        <div className="w-48 h-32 mx-auto mb-4">
                          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
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
                GPA Calculator Help
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${
                showHelp ? 'rotate-180' : ''
              }`} />
            </button>
            
            {showHelp && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <HelpSection
                  userMode="student"
                  calculatorType="gpa"
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