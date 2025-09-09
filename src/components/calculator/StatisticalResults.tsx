import React from 'react';
import { BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle, Info, Copy, Download } from 'lucide-react';
import { MeanResult } from '@/hooks/useMeanCalculation';
import { WeightedMeanResult } from '@/types/weightedMean';
import { UserMode } from './UserModeSelector';

interface StatisticalResultsProps {
  result: MeanResult | WeightedMeanResult | null;
  userMode: UserMode;
  precision: number;
  className?: string;
  onCopy?: (text: string) => void;
  onDownload?: (data: MeanResult | WeightedMeanResult, format: 'csv' | 'json') => void;
}

const StatisticalResults: React.FC<StatisticalResultsProps> = ({
  result,
  userMode,
  precision,
  className = '',
  onCopy,
  onDownload
}) => {
  if (!result) return null;

  const formatNumber = (num: number | undefined) => num ? num.toFixed(precision) : '0';
  
  // Type guards to determine result type
  const isMeanResult = (result: any): result is MeanResult => 
    result && 'mean' in result && 'count' in result && 'sum' in result;
    
  const isWeightedResult = (result: any): result is WeightedMeanResult => 
    result && 'weightedMean' in result && 'totalWeights' in result;

  const copyResult = () => {
    let text = '';
    if (isMeanResult(result)) {
      text = `Mean: ${formatNumber(result.mean)}\nCount: ${result.count}\nSum: ${formatNumber(result.sum)}`;
    } else if (isWeightedResult(result)) {
      text = `Weighted Mean: ${formatNumber(result.weightedMean)}\nValid Pairs: ${result.validPairs}\nTotal Weight: ${formatNumber(result.totalWeights)}`;
    }
    onCopy?.(text);
  };

  const downloadData = (format: 'csv' | 'json') => {
    onDownload?.(result, format);
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Statistical Results</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyResult}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              title="Copy results"
            >
              <Copy className="h-4 w-4" />
            </button>
            <div className="relative group">
              <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                <Download className="h-4 w-4" />
              </button>
              <div className="hidden group-hover:block absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                <button
                  onClick={() => downloadData('csv')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  CSV
                </button>
                <button
                  onClick={() => downloadData('json')}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Main Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {isWeightedResult(result) ? 'Weighted Mean' : 'Mean (Average)'}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {isMeanResult(result) ? formatNumber(result.mean) : 
               isWeightedResult(result) ? formatNumber(result.weightedMean) : '0'}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {userMode === 'teacher' ? 'Class Average' : 
               isWeightedResult(result) ? 'Weighted Average' : 'Arithmetic Mean'}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {isWeightedResult(result) ? 'Valid Pairs' : 'Sample Size'}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {isMeanResult(result) ? result.count : 
               isWeightedResult(result) ? result.validPairs : 0}
            </div>
            <div className="text-sm text-green-700 mt-1">
              {userMode === 'teacher' ? 'Students' : 
               isWeightedResult(result) ? 'Value-Weight Pairs' : 'Data Points'}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">
                {isWeightedResult(result) ? 'Total Weight' : 'Sum Total'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isMeanResult(result) ? formatNumber(result.sum) : 
               isWeightedResult(result) ? formatNumber(result.totalWeights) : '0'}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              {isWeightedResult(result) ? 'Sum of all weights' : 'Sum of all values'}
            </div>
          </div>
        </div>

        {/* Research Mode - Advanced Statistics */}
        {userMode === 'research' && isMeanResult(result) && result.stdError && result.confidenceInterval && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 text-purple-600 mr-2" />
              Advanced Research Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-1">Standard Error</div>
                <div className="text-lg font-bold text-purple-900">{formatNumber(result.stdError)}</div>
                <div className="text-xs text-purple-700 mt-1">Precision of the mean estimate</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-1">95% Confidence Interval</div>
                <div className="text-lg font-bold text-purple-900">
                  [{formatNumber(result.confidenceInterval[0])}, {formatNumber(result.confidenceInterval[1])}]
                </div>
                <div className="text-xs text-purple-700 mt-1">Population mean likely range</div>
              </div>
            </div>

            {result.outliers && result.outliers.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Outliers Detected</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      {result.outliers.length} outlier{result.outliers.length !== 1 ? 's' : ''}: {result.outliers.map(o => formatNumber(o)).join(', ')}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Consider investigating these values for data quality
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Teacher Mode - Grade Analysis */}
        {userMode === 'teacher' && isMeanResult(result) && result.gradeDistribution && result.scoreRange && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 text-green-600 mr-2" />
              Grade Distribution Analysis
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700">Score Distribution</div>
                {Object.entries(result.gradeDistribution).map(([grade, count]) => (
                  <div key={grade} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{grade}</span>
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(count / result.count) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({Math.round((count / result.count) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800 mb-3">Class Performance</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Highest Score:</span>
                    <span className="font-medium text-green-900">{result.scoreRange.max}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Lowest Score:</span>
                    <span className="font-medium text-green-900">{result.scoreRange.min}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Range:</span>
                    <span className="font-medium text-green-900">
                      {result.scoreRange.max - result.scoreRange.min} points
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-green-200 pt-2 mt-2">
                    <span className="text-green-700">Class Average:</span>
                    <span className="font-bold text-green-900">{formatNumber(result.mean)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Quality Info */}
        {isMeanResult(result) && result.invalidEntries && result.invalidEntries.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-800">Invalid Entries Excluded</div>
                <div className="text-sm text-red-700 mt-1">
                  {result.invalidEntries.length} invalid entr{result.invalidEntries.length !== 1 ? 'ies' : 'y'} were excluded from calculation
                </div>
                <div className="text-xs text-red-600 mt-1">
                  Excluded: {result.invalidEntries.join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Context-specific insights */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm">
              {userMode === 'student' && (
                <>
                  <div className="font-medium text-blue-800 mb-1">Student Insight</div>
                  <div className="text-blue-700">
                    {isMeanResult(result) ? (
                      <>The mean represents the average value. In your dataset of {result.count} numbers, 
                      the sum is {formatNumber(result.sum)}, giving an average of {formatNumber(result.mean)}.</>
                    ) : isWeightedResult(result) ? (
                      <>The weighted mean considers the importance (weight) of each value. With {result.validPairs} pairs, 
                      the total weighted value is {formatNumber(result.totalWeightedValue)}, giving a weighted average of {formatNumber(result.weightedMean)}.</>
                    ) : null}
                  </div>
                </>
              )}
              {userMode === 'research' && (
                <>
                  <div className="font-medium text-blue-800 mb-1">Research Interpretation</div>
                  <div className="text-blue-700">
                    {isMeanResult(result) ? (
                      <>Sample mean with {result.count} observations. The 95% confidence interval suggests the 
                      population mean likely falls between {formatNumber(result.confidenceInterval![0])} and {formatNumber(result.confidenceInterval![1])}.</>
                    ) : isWeightedResult(result) ? (
                      <>Weighted mean with {result.validPairs} value-weight pairs. The calculation considers the 
                      relative importance of each observation based on its weight in the analysis.</>
                    ) : null}
                  </div>
                </>
              )}
              {userMode === 'teacher' && (
                <>
                  <div className="font-medium text-blue-800 mb-1">Class Summary</div>
                  <div className="text-blue-700">
                    {isMeanResult(result) ? (
                      <>Your class of {result.count} students achieved an average score of {formatNumber(result.mean)}. 
                      The grade distribution shows the performance spread across different achievement levels.</>
                    ) : isWeightedResult(result) ? (
                      <>The weighted calculation considers {result.validPairs} assignments with different weights. 
                      The total weighted score is {formatNumber(result.totalWeightedValue)} out of {formatNumber(result.totalWeights)} possible points, 
                      giving a weighted average of {formatNumber(result.weightedMean)}.</>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticalResults;