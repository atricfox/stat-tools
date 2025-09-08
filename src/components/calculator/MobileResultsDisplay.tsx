/**
 * Mobile-optimized results display component
 * Simplified design focused on essential information
 */

'use client'

import React from 'react';
import { BarChart3, TrendingUp, Target, Users } from 'lucide-react';

export interface MobileResultsDisplayProps {
  results: any | null;
  precision?: number;
  userContext?: 'student' | 'research' | 'teacher';
  isMobile?: boolean;
  className?: string;
}

const MobileResultsDisplay: React.FC<MobileResultsDisplayProps> = ({
  results,
  precision = 2,
  userContext = 'student',
  isMobile = false,
  className = ''
}) => {
  if (!results) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-4' : 'p-6'} text-center ${className}`}>
        <BarChart3 className={`mx-auto mb-3 text-gray-300 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
        <h3 className={`font-medium text-gray-900 mb-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
          No Results Yet
        </h3>
        <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
          Enter numbers to calculate the mean
        </p>
      </div>
    );
  }

  const formatValue = (value: number) => {
    return value.toFixed(precision);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Main Result Card */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-gray-100`}>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className={`text-blue-600 mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
              Mean (Average)
            </h3>
          </div>
          <div className={`font-bold text-blue-600 mb-1 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {formatValue(results.mean)}
          </div>
          <div className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Based on {results.count} values
          </div>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className={`${isMobile ? 'p-3' : 'p-4'}`}>
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 sm:grid-cols-4 gap-4'}`}>
          
          {/* Count */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className={`text-purple-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
            <div className={`font-semibold text-purple-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {results.count}
            </div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Count
            </div>
          </div>

          {/* Standard Deviation */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className={`text-green-600 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            </div>
            <div className={`font-semibold text-green-600 ${isMobile ? 'text-lg' : 'text-xl'}`}>
              {formatValue(results.standardDeviation)}
            </div>
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Std Dev
            </div>
          </div>

          {/* Range (Mobile: Second Row) */}
          {isMobile ? (
            <>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="w-3 h-3 bg-orange-600 rounded-sm"></span>
                </div>
                <div className="font-semibold text-orange-600 text-lg">
                  {formatValue(results.min)}
                </div>
                <div className="text-gray-600 text-xs">Min</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="w-3 h-3 bg-red-600 rounded-sm"></span>
                </div>
                <div className="font-semibold text-red-600 text-lg">
                  {formatValue(results.max)}
                </div>
                <div className="text-gray-600 text-xs">Max</div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="w-4 h-4 bg-orange-600 rounded-sm"></span>
                </div>
                <div className="font-semibold text-orange-600 text-xl">
                  {formatValue(results.min)}
                </div>
                <div className="text-gray-600 text-sm">Min</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="w-4 h-4 bg-red-600 rounded-sm"></span>
                </div>
                <div className="font-semibold text-red-600 text-xl">
                  {formatValue(results.max)}
                </div>
                <div className="text-gray-600 text-sm">Max</div>
              </div>
            </>
          )}
        </div>

        {/* Range Bar (Mobile-optimized) */}
        <div className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Range: {formatValue(results.range)}</span>
            <span>Sum: {formatValue(results.sum)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{formatValue(results.min)}</span>
            <span className="font-medium text-blue-600">μ = {formatValue(results.mean)}</span>
            <span>{formatValue(results.max)}</span>
          </div>
        </div>

        {/* Context-specific additional info */}
        {userContext === 'student' && isMobile && (
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <div className="text-xs text-blue-800">
              <strong>Quick Check:</strong> The mean is the sum ({formatValue(results.sum)}) divided by the count ({results.count})
            </div>
          </div>
        )}

        {userContext === 'research' && results.confidenceInterval && (
          <div className={`${isMobile ? 'mt-3 p-2' : 'mt-4 p-3'} bg-green-50 rounded-md`}>
            <div className={`text-green-800 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <strong>95% CI:</strong> [{formatValue(results.confidenceInterval.lower)}, {formatValue(results.confidenceInterval.upper)}]
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileResultsDisplay;