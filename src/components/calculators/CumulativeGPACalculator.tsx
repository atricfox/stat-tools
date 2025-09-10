"use client";
/**
 * CumulativeGPACalculator - Complete cumulative GPA calculator component
 * Implements US-018: 学生计算累积GPA申请研究生
 */

import React from 'react';
import useCumulativeGPACalculation from '@/hooks/useCumulativeGPACalculation';
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
    initialCourses: [
      {
        id: 'sample-1',
        name: '微积分I',
        grade: 'A-',
        credits: 4,
        semester: '2023秋季',
        isIncluded: true
      },
      {
        id: 'sample-2',
        name: '计算机程序设计',
        grade: 'B+',
        credits: 3,
        semester: '2023秋季',
        isIncluded: true
      }
    ],
    initialSourceGradingSystem: '4.0',
    initialTargetGradingSystem: '4.0',
    autoCalculate: true
  });

  // Notify parent component about result changes
  React.useEffect(() => {
    onResultChange?.(result !== null);
  }, [result, onResultChange]);

  // Helper function to get grade input component based on grading scale
  const renderGradeInput = (course: Course) => {
    if (sourceGradingSystem === 'percentage') {
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
    } else if (sourceGradingSystem === '4.0') {
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

  // Get unique semesters for organization
  const semesters = Array.from(
    new Set(
      courses
        .map(c => c.semester)
        .filter((s): s is string => Boolean(s))
    )
  ).sort();

  // Group courses by semester
  const coursesBySemester = semesters.reduce((acc, semester) => {
    acc[semester] = courses.filter(c => c.semester === semester);
    return acc;
  }, {} as Record<string, Course[]>);

  // Handle semester addition
  const handleAddSemester = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 8 ? '秋季' : currentMonth >= 2 ? '春季' : '冬季';
    const semesterName = `${currentYear}${season}`;
    addSemester(semesterName);
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Calculator Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          累积GPA计算器
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          计算多学期累积GPA，支持不同评分制度转换，为研究生申请提供准确的成绩分析
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Grading System Configuration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">评分制度设置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Grading System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  成绩输入制度
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
                      {scale === 'percentage' ? '百分制' : 
                       scale === '4.0' ? '4.0制' : '5.0制'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Grading System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  目标GPA制度
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
                      {scale === 'percentage' ? '百分制' : 
                       scale === '4.0' ? '4.0制' : '5.0制'}
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
                    系统将自动进行评分制度转换：{sourceGradingSystem} → {targetGradingSystem}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Courses Input */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">课程成绩</h3>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {semesterCount} 个学期，{courseCount} 门课程，{totalCredits} 学分
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleAddSemester}
                    className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-md transition-colors"
                  >
                    + 学期
                  </button>
                  <button
                    onClick={addCourse}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    + 课程
                  </button>
                </div>
              </div>
            </div>

            {/* Courses organized by semester */}
            <div className="space-y-6">
              {semesters.map(semester => (
                <div key={semester} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">{semester}</h4>
                  <div className="space-y-3">
                    {coursesBySemester[semester].map((course) => (
                      <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-md">
                        {/* Course Name */}
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                            placeholder="课程名称"
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                          />
                        </div>

                        {/* Grade */}
                        <div className="md:col-span-3">
                          {renderGradeInput(course)}
                        </div>

                        {/* Credits */}
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            value={course.credits}
                            onChange={(e) => updateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
                            min="0.1"
                            max="20"
                            step="0.5"
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                            placeholder="学分"
                          />
                        </div>

                        {/* Semester */}
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={course.semester || ''}
                            onChange={(e) => updateCourse(course.id, { semester: e.target.value })}
                            placeholder="学期"
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                          />
                        </div>

                        {/* Include Toggle */}
                        <div className="md:col-span-1 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={course.isIncluded !== false}
                            onChange={(e) => updateCourse(course.id, { isIncluded: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            title="计入GPA"
                          />
                        </div>

                        {/* Remove Button */}
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button
                            onClick={() => removeCourse(course.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                            title="删除课程"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Courses without semester */}
              {courses.filter(c => !c.semester).length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-3">未分类课程</h4>
                  <div className="space-y-3">
                    {courses.filter(c => !c.semester).map((course) => (
                      <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-md">
                        {/* Similar structure as above */}
                        <div className="md:col-span-3">
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => updateCourse(course.id, { name: e.target.value })}
                            placeholder="课程名称"
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                        <div className="md:col-span-3">{renderGradeInput(course)}</div>
                        <div className="md:col-span-2">
                          <input
                            type="number"
                            value={course.credits}
                            onChange={(e) => updateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
                            min="0.1" max="20" step="0.5"
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                            placeholder="学分"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={course.semester || ''}
                            onChange={(e) => updateCourse(course.id, { semester: e.target.value })}
                            placeholder="学期"
                            className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={course.isIncluded !== false}
                            onChange={(e) => updateCourse(course.id, { isIncluded: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                        <div className="md:col-span-1 flex items-center justify-center">
                          <button
                            onClick={() => removeCourse(course.id)}
                            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

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
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">累积统计</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-purple-700">学期数量:</span>
                <span className="font-medium text-purple-900">{semesterCount} 个</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">课程总数:</span>
                <span className="font-medium text-purple-900">{courseCount} 门</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">总学分:</span>
                <span className="font-medium text-purple-900">{totalCredits} 分</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-700">累积GPA:</span>
                <span className="font-medium text-purple-900">
                  {result ? result.cumulativeGPA.toFixed(2) : '--'}
                </span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ResultDisplay
              result={result}
              type="cumulative-gpa"
              showDetails={true}
              className="p-6"
            />
          </div>

          {/* Application Tips */}
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <h4 className="text-amber-800 font-semibold mb-2">🎓 研究生申请提示</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• 大多数研究生院要求GPA ≥ 3.0</li>
              <li>• 顶尖院校通常要求GPA ≥ 3.5</li>
              <li>• 考虑重修低分课程提高GPA</li>
              <li>• 专业课成绩比选修课更重要</li>
              <li>• 成绩呈上升趋势更有优势</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
