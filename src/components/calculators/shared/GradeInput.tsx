"use client";
/**
 * GradeInput - Reusable component for inputting grade items
 * Supports dynamic grade entry with weights and validation
 */

import React, { useState, useCallback } from 'react';
import type { GradeItem } from '@/types/education';

interface GradeInputProps {
  grades: GradeItem[];
  onGradesChange: (grades: GradeItem[]) => void;
  maxItems?: number;
  allowWeightEdit?: boolean;
  showWeightTotal?: boolean;
  placeholder?: {
    name?: string;
    score?: string;
    weight?: string;
  };
  className?: string;
}

export default function GradeInput({
  grades,
  onGradesChange,
  maxItems = 10,
  allowWeightEdit = true,
  showWeightTotal = true,
  placeholder = {},
  className = ''
}: GradeInputProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate total weight
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);

  // Add new grade item
  const addGradeItem = useCallback(() => {
    if (grades.length >= maxItems) return;

    const newGrade: GradeItem = {
      id: `grade-${Date.now()}`,
      name: '',
      score: 0,
      weight: allowWeightEdit ? Math.max(0, 100 - totalWeight) : 0,
      category: 'exam'
    };

    onGradesChange([...grades, newGrade]);
  }, [grades, maxItems, allowWeightEdit, totalWeight, onGradesChange]);

  // Remove grade item
  const removeGradeItem = useCallback((id: string) => {
    const updatedGrades = grades.filter(grade => grade.id !== id);
    onGradesChange(updatedGrades);
    
    // Clear errors for removed item
    const newErrors = { ...errors };
    delete newErrors[`${id}-name`];
    delete newErrors[`${id}-score`];
    delete newErrors[`${id}-weight`];
    setErrors(newErrors);
  }, [grades, onGradesChange, errors]);

  // Update grade item
  const updateGradeItem = useCallback((id: string, field: keyof GradeItem, value: any) => {
    const updatedGrades = grades.map(grade => {
      if (grade.id === id) {
        return { ...grade, [field]: value };
      }
      return grade;
    });

    // Validate the updated value
    const newErrors = { ...errors };
    const errorKey = `${id}-${field}`;

    if (field === 'name' && (!value || value.trim() === '')) {
      newErrors[errorKey] = '请输入作业/考试名称';
    } else if (field === 'score' && (isNaN(value) || value < 0 || value > 100)) {
      newErrors[errorKey] = '分数必须在0-100之间';
    } else if (field === 'weight' && allowWeightEdit && (isNaN(value) || value < 0 || value > 100)) {
      newErrors[errorKey] = '权重必须在0-100之间';
    } else {
      delete newErrors[errorKey];
    }

    setErrors(newErrors);
    onGradesChange(updatedGrades);
  }, [grades, onGradesChange, errors, allowWeightEdit]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">成绩输入</h3>
        {showWeightTotal && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">权重总计:</span>
            <span className={`text-sm font-medium ${
              Math.abs(totalWeight - 100) > 0.01 ? 'text-red-600' : 'text-green-600'
            }`}>
              {totalWeight.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Grade Items */}
      <div className="space-y-3">
        {grades.map((grade, index) => (
          <div key={grade.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg">
            {/* Grade Name */}
            <div className="md:col-span-5">
              <label htmlFor={`name-${grade.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                {placeholder.name || '作业/考试名称'}
              </label>
              <input
                id={`name-${grade.id}`}
                type="text"
                value={grade.name}
                onChange={(e) => updateGradeItem(grade.id, 'name', e.target.value)}
                placeholder={`作业 ${index + 1}`}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${grade.id}-name`] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors[`${grade.id}-name`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`${grade.id}-name`]}</p>
              )}
            </div>

            {/* Score */}
            <div className="md:col-span-3">
              <label htmlFor={`score-${grade.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                {placeholder.score || '分数'}
              </label>
              <input
                id={`score-${grade.id}`}
                type="number"
                value={grade.score}
                onChange={(e) => updateGradeItem(grade.id, 'score', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[`${grade.id}-score`] ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors[`${grade.id}-score`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`${grade.id}-score`]}</p>
              )}
            </div>

            {/* Weight */}
            <div className="md:col-span-3">
              <label htmlFor={`weight-${grade.id}`} className="block text-sm font-medium text-gray-700 mb-1">
                {placeholder.weight || '权重 (%)'}
              </label>
              <input
                id={`weight-${grade.id}`}
                type="number"
                value={grade.weight}
                onChange={(e) => updateGradeItem(grade.id, 'weight', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.1"
                disabled={!allowWeightEdit}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  !allowWeightEdit ? 'bg-gray-100 cursor-not-allowed' : ''
                } ${errors[`${grade.id}-weight`] ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors[`${grade.id}-weight`] && (
                <p className="mt-1 text-xs text-red-600">{errors[`${grade.id}-weight`]}</p>
              )}
            </div>

            {/* Remove Button */}
            <div className="md:col-span-1 flex items-end">
              <button
                onClick={() => removeGradeItem(grade.id)}
                className="w-full md:w-auto px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                title="删除该项"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Button */}
      {grades.length < maxItems && (
        <button
          onClick={addGradeItem}
          className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>添加成绩项目</span>
        </button>
      )}

      {/* Weight Warning */}
      {showWeightTotal && allowWeightEdit && Math.abs(totalWeight - 100) > 0.01 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-yellow-800">
              权重总和为 {totalWeight.toFixed(1)}%，建议调整至100%以获得准确的计算结果。
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {grades.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            已添加 {grades.length} 个成绩项目，权重总计 {totalWeight.toFixed(1)}%
          </p>
        </div>
      )}
    </div>
  );
}
