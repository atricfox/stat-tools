"use client";
/**
 * FinalGradeCalculator - Complete final grade prediction calculator component
 * Implements US-019: 学生预测期末考试所需分数
 */

import React from 'react';
import useFinalGradeCalculation from '@/hooks/useFinalGradeCalculation';
import GradeInput from './shared/GradeInput';
import WeightSlider from './shared/WeightSlider';
import ResultDisplay from './shared/ResultDisplay';
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
    initialGrades: [
      {
        id: 'sample-1',
        name: '期中考试',
        score: 0,
        weight: 30,
        category: 'exam'
      }
    ],
    initialFinalWeight: 50,
    initialTargetGrade: 85,
    autoCalculate: true
  });

  // Notify parent component about result changes
  React.useEffect(() => {
    onResultChange?.(result !== null);
  }, [result, onResultChange]);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Calculator Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          期末成绩预测计算器
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          输入当前已有成绩和权重，设定目标分数，预测期末考试需要达到的分数
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Grades Input */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <GradeInput
              grades={grades}
              onGradesChange={setGrades}
              maxItems={10}
              allowWeightEdit={true}
              showWeightTotal={true}
              placeholder={{
                name: '作业/考试名称',
                score: '已得分数',
                weight: '权重 (%)'
              }}
            />
          </div>

          {/* Configuration Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">计算设置</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Final Exam Weight */}
              <div>
                <WeightSlider
                  label="期末考试权重"
                  value={finalExamWeight}
                  onChange={setFinalExamWeight}
                  min={1}
                  max={Math.min(100, remainingWeight + finalExamWeight)}
                  step={1}
                  unit="%"
                  description={`当前剩余可分配权重: ${remainingWeight.toFixed(1)}%`}
                />
              </div>

              {/* Target Grade */}
              <div>
                <WeightSlider
                  label="目标总分"
                  value={targetGrade}
                  onChange={setTargetGrade}
                  min={1}
                  max={100}
                  step={0.1}
                  unit="分"
                  description="希望在这门课程中达到的总分"
                />
              </div>
            </div>

            {/* Grading Scale Selection */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                评分制度
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
                    {scale === 'percentage' ? '百分制' : 
                     scale === '4.0' ? '4.0制' : '5.0制'}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Calculate Button */}
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">当前状态</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-700">已有成绩数量:</span>
                <span className="font-medium text-blue-900">{grades.length} 项</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">当前加权分数:</span>
                <span className="font-medium text-blue-900">
                  {currentWeightedScore.toFixed(1)} 分
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">已分配权重:</span>
                <span className="font-medium text-blue-900">
                  {(grades.reduce((sum, grade) => sum + grade.weight, 0)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">期末考试权重:</span>
                <span className="font-medium text-blue-900">{finalExamWeight}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-700">目标总分:</span>
                <span className="font-medium text-blue-900">{targetGrade} 分</span>
              </div>
            </div>
          </div>

          {/* Results Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <ResultDisplay
              result={result}
              type="final-grade"
              showDetails={true}
              className="p-6"
            />
          </div>

          {/* Quick Tips */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-green-800 font-semibold mb-2">💡 使用提示</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• 权重总和应该等于100%</li>
              <li>• 可以添加多个已完成的作业和考试</li>
              <li>• 系统会自动计算并更新结果</li>
              <li>• 红色表示目标可能无法达到</li>
              <li>• 绿色表示目标容易达到</li>
            </ul>
          </div>

          {/* Study Motivation */}
          {result?.isAchievable && result?.difficultyLevel && (
            <div className={`p-4 rounded-lg border ${
              result.difficultyLevel === 'easy' 
                ? 'bg-green-50 border-green-200'
                : result.difficultyLevel === 'moderate'
                ? 'bg-blue-50 border-blue-200'
                : result.difficultyLevel === 'challenging'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-semibold mb-2 ${
                result.difficultyLevel === 'easy' 
                  ? 'text-green-800'
                  : result.difficultyLevel === 'moderate'
                  ? 'text-blue-800'
                  : result.difficultyLevel === 'challenging'
                  ? 'text-orange-800'
                  : 'text-red-800'
              }`}>
                {result.difficultyLevel === 'easy' && '🎯 轻松达成'}
                {result.difficultyLevel === 'moderate' && '📈 努力可达'}
                {result.difficultyLevel === 'challenging' && '💪 需要冲刺'}
                {result.difficultyLevel === 'impossible' && '🚨 调整目标'}
              </h4>
              <p className={`text-sm ${
                result.difficultyLevel === 'easy' 
                  ? 'text-green-700'
                  : result.difficultyLevel === 'moderate'
                  ? 'text-blue-700'
                  : result.difficultyLevel === 'challenging'
                  ? 'text-orange-700'
                  : 'text-red-700'
              }`}>
                {result.difficultyLevel === 'easy' && '保持当前学习状态，你很有希望获得理想成绩！'}
                {result.difficultyLevel === 'moderate' && '适当增加学习时间，制定复习计划，成功在望！'}
                {result.difficultyLevel === 'challenging' && '需要全力以赴！建议寻求额外帮助和资源。'}
                {result.difficultyLevel === 'impossible' && '当前目标可能过高，考虑调整期望或寻求课程帮助。'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
