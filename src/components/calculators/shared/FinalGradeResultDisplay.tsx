/**
 * FinalGradeResultDisplay - Specialized result display for final grade calculations
 * English-only version with clean interface
 */

import React from 'react';
import type { FinalGradeResult } from '@/types/education';

interface FinalGradeResultDisplayProps {
  result: FinalGradeResult;
  showDetails?: boolean;
  className?: string;
}

export default function FinalGradeResultDisplay({
  result,
  showDetails = true,
  className = ''
}: FinalGradeResultDisplayProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'moderate': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'challenging': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'impossible': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
      case 'moderate':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
      case 'challenging':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
      case 'impossible':
        return <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Result */}
      <div className={`p-6 border rounded-lg ${getDifficultyColor(result.difficultyLevel)}`}>
        <div className="flex items-center space-x-3 mb-4">
          {getDifficultyIcon(result.difficultyLevel)}
          <h3 className="text-lg font-semibold">Final Exam Score Prediction</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <div className="space-y-2">
            <p className="text-sm opacity-75">Required Final Score</p>
            <p className="text-3xl font-bold">
              {result.isAchievable ? `${result.requiredScore.toFixed(1)}%` : 'Not Achievable'}
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm opacity-75">Current Weighted Score</p>
            <p className="text-xl font-semibold">
              {result.currentWeightedScore.toFixed(1)}%
            </p>
          </div>
        </div>

        {!result.isAchievable && (
          <div className="mt-4 p-3 bg-white bg-opacity-50 rounded text-center">
            <p className="text-sm">
              Maximum Possible Grade: <strong>{result.maxPossibleGrade.toFixed(1)}%</strong>
            </p>
          </div>
        )}
      </div>

      {/* Recommendation */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <h4 className="font-semibold text-blue-800 mb-2">Recommendation</h4>
        <p className="text-blue-700">{result.recommendation}</p>
      </div>
    </div>
  );
}