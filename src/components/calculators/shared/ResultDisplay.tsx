/**
 * ResultDisplay - Component for displaying calculation results with visual feedback
 * Supports different result types and formatting options
 */

import React from 'react';
import type { 
  FinalGradeResult, 
  SemesterGradeResult, 
  CumulativeGPAResult 
} from '@/types/education';

interface ResultDisplayProps {
  result: FinalGradeResult | SemesterGradeResult | CumulativeGPAResult | null;
  type: 'final-grade' | 'semester' | 'cumulative-gpa';
  showDetails?: boolean;
  className?: string;
}

export default function ResultDisplay({
  result,
  type,
  showDetails = true,
  className = ''
}: ResultDisplayProps) {
  if (!result) {
    return (
      <div className={`p-6 bg-gray-50 border border-gray-200 rounded-lg ${className}`}>
        <p className="text-gray-500 text-center">No calculation results yet</p>
      </div>
    );
  }

  // Render Final Grade Result
  if (type === 'final-grade') {
    const finalResult = result as FinalGradeResult;
    
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
        <div className={`p-6 border rounded-lg ${getDifficultyColor(finalResult.difficultyLevel)}`}>
          <div className="flex items-center space-x-3 mb-4">
            {getDifficultyIcon(finalResult.difficultyLevel)}
            <h3 className="text-lg font-semibold">Final Exam Score Prediction</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm opacity-75">Required Final Score</p>
              <p className="text-3xl font-bold">
                {finalResult.isAchievable ? `${finalResult.requiredScore.toFixed(1)}%` : 'Not Achievable'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-75">Current Weighted Score</p>
              <p className="text-xl font-semibold">
                {finalResult.currentWeightedScore.toFixed(1)}%
              </p>
            </div>
          </div>

          {!finalResult.isAchievable && (
            <div className="mt-4 p-3 bg-white bg-opacity-50 rounded">
              <p className="text-sm">
                Maximum Possible Grade: <strong>{finalResult.maxPossibleGrade.toFixed(1)}%</strong>
              </p>
            </div>
          )}
        </div>

        {/* Recommendation */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Recommendation</h4>
          <p className="text-blue-700">{finalResult.recommendation}</p>
        </div>

        {/* Calculation Steps */}
        {showDetails && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Calculation Steps</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              {finalResult.calculationSteps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  }

  // Render Semester Result
  if (type === 'semester') {
    const semesterResult = result as SemesterGradeResult;
    
    const getGPAColor = (gpa: number) => {
      if (gpa >= 3.5) return 'text-green-600 bg-green-50 border-green-200';
      if (gpa >= 3.0) return 'text-blue-600 bg-blue-50 border-blue-200';
      if (gpa >= 2.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Main Result */}
        <div className={`p-6 border rounded-lg ${getGPAColor(semesterResult.semesterGPA)}`}>
          <h3 className="text-lg font-semibold mb-4">Semester Grade Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-sm opacity-75">Semester GPA</p>
              <p className="text-3xl font-bold">{semesterResult.semesterGPA.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-75">Total Credits</p>
              <p className="text-xl font-semibold">{semesterResult.totalCredits}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-75">Course Count</p>
              <p className="text-xl font-semibold">{semesterResult.courseCount}</p>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        {showDetails && semesterResult.performanceAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Highest Performing */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Top Performing Courses</h4>
              <div className="space-y-2">
                {semesterResult.performanceAnalysis.highestPerforming.slice(0, 3).map((course, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-green-700">{course.name}</span>
                    <span className="font-medium text-green-800">{course.grade}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lowest Performing */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3">Courses Needing Attention</h4>
              <div className="space-y-2">
                {semesterResult.performanceAnalysis.lowestPerforming.slice(0, 3).map((course, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-yellow-700">{course.name}</span>
                    <span className="font-medium text-yellow-800">{course.grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {semesterResult.recommendations && semesterResult.recommendations.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Recommendations</h4>
            <ul className="space-y-1 text-blue-700">
              {semesterResult.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  // Render Cumulative GPA Result
  if (type === 'cumulative-gpa') {
    const cumulativeResult = result as CumulativeGPAResult;
    
    const getGPAColor = (gpa: number) => {
      if (gpa >= 3.8) return 'text-green-600 bg-green-50 border-green-200';
      if (gpa >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-200';
      if (gpa >= 3.0) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      return 'text-red-600 bg-red-50 border-red-200';
    };

    const getCompetitiveLevelText = (level: string) => {
      switch (level) {
        case 'excellent': return 'Excellent';
        case 'good': return 'Good';
        case 'average': return 'Average';
        case 'below-average': return 'Below Average';
        default: return level;
      }
    };

    return (
      <div className={`space-y-6 ${className}`}>
        {/* Main Result */}
        <div className={`p-6 border rounded-lg ${getGPAColor(cumulativeResult.cumulativeGPA)}`}>
          <h3 className="text-lg font-semibold mb-4">Cumulative GPA Results</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm opacity-75">Cumulative GPA</p>
              <p className="text-3xl font-bold">{cumulativeResult.cumulativeGPA.toFixed(2)}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-75">Total Credits</p>
              <p className="text-xl font-semibold">{cumulativeResult.totalCredits}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-75">Total Courses</p>
              <p className="text-xl font-semibold">{cumulativeResult.courseCount}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm opacity-75">Competitive Level</p>
              <p className="text-lg font-semibold">
                {getCompetitiveLevelText(cumulativeResult.competitiveAnalysis.competitiveLevel)}
              </p>
            </div>
          </div>
        </div>

        {/* Competitive Analysis */}
        {showDetails && (
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-800 mb-3">Competitive Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-indigo-700">
                  Your GPA exceeds <strong>{cumulativeResult.competitiveAnalysis.percentile}%</strong> of students
                </p>
                <div className="w-full bg-indigo-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cumulativeResult.competitiveAnalysis.percentile}%` }}
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-indigo-800">
                  {cumulativeResult.competitiveAnalysis.percentile}%
                </p>
                <p className="text-sm text-indigo-600">Percentile Ranking</p>
              </div>
            </div>
          </div>
        )}

        {/* Improvement Suggestions */}
        {cumulativeResult.competitiveAnalysis.improvementSuggestions.length > 0 && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Improvement Suggestions</h4>
            <ul className="space-y-1 text-blue-700">
              {cumulativeResult.competitiveAnalysis.improvementSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return null;
}