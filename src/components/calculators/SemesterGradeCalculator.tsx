"use client";
/**
 * SemesterGradeCalculator - Complete semester grade calculator component
 * Implements US-022: 学生计算学期总成绩
 */

import React from 'react';
import useSemesterGradeCalculation from '@/hooks/useSemesterGradeCalculation';
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
    setGradingScale,
    calculate,
    reset,
    isValid,
    validationErrors,
    totalCredits,
    courseCount,
    canCalculate
  } = useSemesterGradeCalculation({
    initialCourses: [
      {
        id: 'sample-1',
        name: '高等数学',
        grade: 'B+',
        credits: 4,
        isIncluded: true
      }
    ],
    initialGradingScale: '4.0',
    autoCalculate: true
  });

  // Notify parent component about result changes
  React.useEffect(() => {
    onResultChange?.(result !== null);
  }, [result, onResultChange]);

  // Helper function to get grade input component based on grading scale
  const renderGradeInput = (course: Course) => {
    if (gradingScale === 'percentage') {
      return (
        <input
          type="number"
          value={typeof course.grade === 'number' ? course.grade : parseFloat(course.grade as string) || 0}
          onChange={(e) => updateCourse(course.id, { grade: parseFloat(e.target.value) || 0 })}
          min="0"
          max="100"
          step="0.1"
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          placeholder="85"
        />
      );
    } else if (gradingScale === '4.0') {
      const grades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
      return (
        <select
          value={course.grade as string}
          onChange={(e) => updateCourse(course.id, { grade: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          {grades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      );
    } else { // 5.0 scale
      const grades = ['A', 'B', 'C', 'D', 'F'];
      return (
        <select
          value={course.grade as string}
          onChange={(e) => updateCourse(course.id, { grade: e.target.value })}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
        >
          {grades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      );
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Calculator Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          学期总成绩计算器
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          计算学期GPA和总成绩，支持多种评分制度，提供详细的成绩分析
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grading Scale Selection */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">评分制度</h3>
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
                  {scale === 'percentage' ? '百分制 (0-100)' : 
                   scale === '4.0' ? '4.0制 (A-F)' : '5.0制 (A-F)'}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Input */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">课程成绩</h3>
              <div className="text-sm text-gray-600">
                已添加 {courseCount} 门课程，总学分 {totalCredits}
              </div>
            </div>

            {/* Course List */}
            <div className="space-y-4">
              {courses.map((course, index) => (
                <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
                  {/* Course Name */}
                  <div className="md:col-span-4">
                    <label htmlFor={`name-${course.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      课程名称
                    </label>
                    <input
                      id={`name-${course.id}`}
                      type="text"
                      value={course.name}
                      onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                      placeholder={`课程 ${index + 1}`}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    />
                  </div>

                  {/* Grade */}
                  <div className="md:col-span-3">
                    <label htmlFor={`grade-${course.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      {gradingScale === 'percentage' ? '成绩 (分)' : '成绩等级'}
                    </label>
                    {renderGradeInput(course)}
                  </div>

                  {/* Credits */}
                  <div className="md:col-span-2">
                    <label htmlFor={`credits-${course.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                      学分
                    </label>
                    <input
                      id={`credits-${course.id}`}
                      type="number"
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
                      min="0.1"
                      max="20"
                      step="0.5"
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                    />
                  </div>

                  {/* Include Toggle */}
                  <div className="md:col-span-2 flex items-end">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={course.isIncluded !== false}
                        onChange={(e) => updateCourse(course.id, { isIncluded: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">计入GPA</span>
                    </label>
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-1 flex items-end">
                    <button
                      onClick={() => removeCourse(course.id)}
                      className="w-full md:w-auto px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                      title="删除课程"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Course Button */}
            <button
              onClick={addCourse}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>添加课程</span>
            </button>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={calculate}
                disabled={!canCalculate || isCalculating}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  canCalculate && !isCalculating
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isCalculating ? '计算中...' : '重新计算'}
              </button>
              
              <button
                onClick={reset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                重置
              </button>
            </div>

            {/* Validation Errors */}
            {!isValid && validationErrors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h4 className="text-sm font-medium text-red-800">输入验证错误</h4>
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

            {/* General Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Results and Summary */}
        <div className="space-y-6">
          {/* Current Status Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-900 mb-4">学期概况</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-700">课程数量:</span>
                <span className="font-medium text-green-900">{courseCount} 门</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">总学分:</span>
                <span className="font-medium text-green-900">{totalCredits} 分</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">评分制度:</span>
                <span className="font-medium text-green-900">
                  {gradingScale === 'percentage' ? '百分制' : 
                   gradingScale === '4.0' ? '4.0制' : '5.0制'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-700">学期GPA:</span>
                <span className="font-medium text-green-900">
                  {result ? result.semesterGPA.toFixed(2) : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ResultDisplay
              result={result}
              type="semester"
              showDetails={true}
              className="p-6"
            />
          </div>

          {/* Quick Tips */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h4 className="text-blue-800 font-semibold mb-2">💡 使用提示</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 可以添加多门课程进行计算</li>
              <li>• 支持不同的评分制度转换</li>
              <li>• 可以选择是否将课程计入GPA</li>
              <li>• 系统会自动分析成绩分布</li>
              <li>• 提供个性化学习建议</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
