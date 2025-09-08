/**
 * Data quality indicator component
 * Shows warnings, suggestions, and quality metrics for parsed data
 */

'use client'

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, TrendingUp, Users, Target } from 'lucide-react';
import { ValidationError } from '@/lib/validation';
import { ParseResult } from '@/lib/parsers';

export interface DataQualityIndicatorProps {
  parseResult: ParseResult | null;
  validationErrors: ValidationError[];
  validationWarnings: ValidationError[];
  context?: 'student' | 'research' | 'teacher';
  className?: string;
}

const DataQualityIndicator: React.FC<DataQualityIndicatorProps> = ({
  parseResult,
  validationErrors,
  validationWarnings,
  context = 'student',
  className = ''
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!parseResult || (validationErrors.length === 0 && validationWarnings.length === 0 && parseResult.metadata.duplicates.length === 0)) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Calculate quality score
  const calculateQualityScore = (): { score: number; level: 'excellent' | 'good' | 'fair' | 'poor' } => {
    let score = 100;
    
    // Deduct points for errors and warnings
    score -= validationErrors.length * 20;
    score -= validationWarnings.length * 10;
    score -= parseResult.metadata.duplicates.length * 5;
    
    // Deduct for low sample size
    if (parseResult.validNumbers.length < 5) score -= 15;
    if (parseResult.validNumbers.length < 3) score -= 25;
    
    // Deduct for high invalid ratio
    const invalidRatio = parseResult.invalidEntries.length / (parseResult.validNumbers.length + parseResult.invalidEntries.length);
    score -= invalidRatio * 30;
    
    score = Math.max(0, Math.min(100, score));
    
    const level = score >= 90 ? 'excellent' : 
                  score >= 75 ? 'good' : 
                  score >= 50 ? 'fair' : 'poor';
    
    return { score, level };
  };

  const quality = calculateQualityScore();

  const contextualRecommendations = {
    student: [
      'Double-check your numbers for typos',
      'Remove any non-numeric characters',
      'Consider if all grades are on the same scale'
    ],
    research: [
      'Verify measurement precision consistency',
      'Check for systematic errors in data collection',
      'Consider outlier analysis for unusual values'
    ],
    teacher: [
      'Ensure all grades are from the same assignment type',
      'Verify grade scale consistency across entries',
      'Check for missing or incomplete student data'
    ]
  };

  const getQualityColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'fair': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Quality Score Overview */}
      <div className={`border rounded-lg p-4 ${getQualityColor(quality.level)}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {quality.level === 'excellent' && <CheckCircle className="h-5 w-5 mr-2" />}
            {quality.level === 'good' && <CheckCircle className="h-5 w-5 mr-2" />}
            {quality.level === 'fair' && <Info className="h-5 w-5 mr-2" />}
            {quality.level === 'poor' && <AlertTriangle className="h-5 w-5 mr-2" />}
            <span className="font-medium">Data Quality: {quality.level.charAt(0).toUpperCase() + quality.level.slice(1)}</span>
          </div>
          <div className="text-sm font-medium">{Math.round(quality.score)}%</div>
        </div>
        
        {/* Quality Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              quality.level === 'excellent' ? 'bg-green-500' :
              quality.level === 'good' ? 'bg-blue-500' :
              quality.level === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${quality.score}%` }}
          />
        </div>

        <div className="text-sm">
          {quality.level === 'excellent' && 'Your data looks great! Ready for accurate calculations.'}
          {quality.level === 'good' && 'Data quality is good with minor issues that won\'t affect results significantly.'}
          {quality.level === 'fair' && 'Some data quality issues detected. Review recommendations below.'}
          {quality.level === 'poor' && 'Data quality issues may affect calculation accuracy. Please review.'}
        </div>
      </div>

      {/* Errors Section */}
      {validationErrors.length > 0 && (
        <div className="border border-red-200 rounded-lg">
          <button
            onClick={() => toggleSection('errors')}
            className="w-full px-4 py-3 text-left bg-red-50 hover:bg-red-100 transition-colors rounded-t-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="font-medium text-red-800">
                  {validationErrors.length} Error{validationErrors.length > 1 ? 's' : ''} Found
                </span>
              </div>
              <div className="text-sm text-red-600">
                {expandedSection === 'errors' ? 'Hide' : 'Show'} Details
              </div>
            </div>
          </button>
          
          {expandedSection === 'errors' && (
            <div className="px-4 py-3 border-t border-red-200">
              {validationErrors.map((error, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="text-sm font-medium text-red-800 mb-1">
                    {error.message}
                  </div>
                  {error.details && (
                    <div className="text-xs text-red-600">
                      {error.code}: {JSON.stringify(error.details)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warnings Section */}
      {validationWarnings.length > 0 && (
        <div className="border border-yellow-200 rounded-lg">
          <button
            onClick={() => toggleSection('warnings')}
            className="w-full px-4 py-3 text-left bg-yellow-50 hover:bg-yellow-100 transition-colors rounded-t-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Info className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">
                  {validationWarnings.length} Warning{validationWarnings.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="text-sm text-yellow-600">
                {expandedSection === 'warnings' ? 'Hide' : 'Show'} Details
              </div>
            </div>
          </button>
          
          {expandedSection === 'warnings' && (
            <div className="px-4 py-3 border-t border-yellow-200">
              {validationWarnings.map((warning, index) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="text-sm font-medium text-yellow-800 mb-1">
                    {warning.message}
                  </div>
                  {warning.details && (
                    <div className="text-xs text-yellow-600">
                      Additional info: {Array.isArray(warning.details.invalidEntries) 
                        ? warning.details.invalidEntries.join(', ')
                        : JSON.stringify(warning.details)
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Insights */}
      {parseResult.metadata.duplicates.length > 0 && (
        <div className="border border-blue-200 rounded-lg">
          <button
            onClick={() => toggleSection('insights')}
            className="w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 transition-colors rounded-t-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Data Insights</span>
              </div>
              <div className="text-sm text-blue-600">
                {expandedSection === 'insights' ? 'Hide' : 'Show'} Details
              </div>
            </div>
          </button>
          
          {expandedSection === 'insights' && (
            <div className="px-4 py-3 border-t border-blue-200">
              <div className="space-y-3">
                {parseResult.metadata.duplicates.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Duplicate Values Detected
                    </div>
                    <div className="text-sm text-blue-700">
                      Found {parseResult.metadata.duplicates.length} duplicate value{parseResult.metadata.duplicates.length > 1 ? 's' : ''}: {' '}
                      {parseResult.metadata.duplicates.slice(0, 5).join(', ')}
                      {parseResult.metadata.duplicates.length > 5 && ` (+${parseResult.metadata.duplicates.length - 5} more)`}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="text-sm font-medium text-blue-800 mb-1">Data Format</div>
                  <div className="text-sm text-blue-700">
                    Detected format: {parseResult.metadata.formatDetected}
                  </div>
                </div>

                {parseResult.metadata.statistics && (
                  <div>
                    <div className="text-sm font-medium text-blue-800 mb-1">Range Analysis</div>
                    <div className="text-sm text-blue-700">
                      Range: {parseResult.metadata.statistics.min} to {parseResult.metadata.statistics.max} 
                      (spread: {parseResult.metadata.statistics.range})
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Context-Specific Recommendations */}
      <div className="border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('recommendations')}
          className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {context === 'student' && <Target className="h-4 w-4 text-gray-600 mr-2" />}
              {context === 'research' && <TrendingUp className="h-4 w-4 text-gray-600 mr-2" />}
              {context === 'teacher' && <Users className="h-4 w-4 text-gray-600 mr-2" />}
              <span className="font-medium text-gray-800">
                {context === 'student' && 'Student Tips'}
                {context === 'research' && 'Research Best Practices'}
                {context === 'teacher' && 'Teaching Insights'}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {expandedSection === 'recommendations' ? 'Hide' : 'Show'} Tips
            </div>
          </div>
        </button>
        
        {expandedSection === 'recommendations' && (
          <div className="px-4 py-3 border-t border-gray-200">
            <ul className="space-y-2 text-sm text-gray-700">
              {contextualRecommendations[context].map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2 mt-1">•</span>
                  {recommendation}
                </li>
              ))}
            </ul>
            
            {/* Sample Size Recommendation */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-sm">
                <span className="font-medium text-gray-800">Sample Size: </span>
                {parseResult.validNumbers.length < 5 ? (
                  <span className="text-yellow-700">
                    Consider adding more data points for better statistical reliability
                  </span>
                ) : parseResult.validNumbers.length >= 30 ? (
                  <span className="text-green-700">
                    Excellent sample size for robust statistical analysis
                  </span>
                ) : (
                  <span className="text-blue-700">
                    Good sample size for basic statistical calculations
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataQualityIndicator;