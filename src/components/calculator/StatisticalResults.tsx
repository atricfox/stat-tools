import React from 'react';
import { BarChart3, Target, TrendingUp, AlertTriangle, CheckCircle, Info, Download, ArrowUp, ArrowDown, Hash } from 'lucide-react';
import { MeanResult } from '@/hooks/useMeanCalculation';
import { MedianResult } from '@/hooks/useMedianCalculation';
import { WeightedMeanResult } from '@/types/weightedMean';
import { StandardDeviationResult } from '@/types/standardDeviation';
import { PercentErrorResult } from '@/hooks/usePercentErrorCalculation';
import { RangeResult } from '@/hooks/useRangeCalculation';
import { VarianceResult } from '@/types/variance';
import { UserMode } from './UserModeSelector';
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';

interface StatisticalResultsProps {
  result: MeanResult | MedianResult | WeightedMeanResult | StandardDeviationResult | PercentErrorResult | RangeResult | VarianceResult | null;
  userMode: UserMode;
  precision: number;
  className?: string;
  onCopy?: (text: string) => void;
  onDownload?: (data: any, format: 'csv' | 'json') => void;
  onShare?: (data: any) => void;
}

const StatisticalResults: React.FC<StatisticalResultsProps> = ({
  result,
  userMode,
  precision,
  className = '',
  onCopy,
  onDownload,
  onShare
}) => {
  const [showDownloadMenu, setShowDownloadMenu] = React.useState(false);
  const downloadMenuRef = React.useRef<HTMLDivElement>(null);
  
  // Close download menu when clicking outside
  React.useEffect(() => {
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
  
  if (!result) return null;

  const formatNumber = (num: number | undefined) => 
    num !== undefined && num !== null ? formatForCalculationSteps(num, userMode, precision) : '0';
  
  // Type guards to determine result type
  const isMeanResult = (result: any): result is MeanResult => 
    result && 'mean' in result && 'count' in result && 'sum' in result && !('sampleStandardDeviation' in result) && !('median' in result);
    
  const isMedianResult = (result: any): result is MedianResult => 
    result && 'median' in result && 'count' in result && 'mean' in result && 'sortedData' in result;
    
  const isWeightedResult = (result: any): result is WeightedMeanResult => 
    result && 'weightedMean' in result && 'totalWeights' in result;

  const isStandardDeviationResult = (result: any): result is StandardDeviationResult => 
    result && 'sampleStandardDeviation' in result && 'populationStandardDeviation' in result && 'mean' in result;

  const isPercentErrorResult = (result: any): result is PercentErrorResult => 
    result && 'percentError' in result && 'absoluteError' in result && 'theoreticalValue' in result && 'experimentalValue' in result;

  const isRangeResult = (result: any): result is RangeResult =>
    result && 'range' in result && 'minimum' in result && 'maximum' in result && 'count' in result;

  const isVarianceResult = (result: any): result is VarianceResult =>
    result && 'sampleVariance' in result && 'populationVariance' in result && 'mean' in result && 'calculationType' in result;

  const copyResult = () => {
    let text = '';
    if (isMeanResult(result)) {
      text = `Mean: ${formatNumber(result.mean)}\nCount: ${result.count}\nSum: ${formatNumber(result.sum)}`;
    } else if (isMedianResult(result)) {
      text = `Median: ${formatNumber(result.median)}\nMean: ${formatNumber(result.mean)}\nCount: ${result.count}\nQ1: ${formatNumber(result.q1)}\nQ3: ${formatNumber(result.q3)}\nIQR: ${formatNumber(result.iqr)}`;
    } else if (isWeightedResult(result)) {
      text = `Weighted Mean: ${formatNumber(result.weightedMean)}\nValid Pairs: ${result.validPairs}\nTotal Weight: ${formatNumber(result.totalWeights)}`;
    } else if (isStandardDeviationResult(result)) {
      const stdDev = result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation;
      text = `Standard Deviation: ${formatNumber(stdDev)}\nMean: ${formatNumber(result.mean)}\nCount: ${result.count}`;
    } else if (isPercentErrorResult(result)) {
      text = `Percent Error: ${formatNumber(result.percentError)}%\nAbsolute Error: ${formatNumber(result.absoluteError)}\nTheoretical: ${formatNumber(result.theoreticalValue)}\nExperimental: ${formatNumber(result.experimentalValue)}`;
    } else if (isRangeResult(result)) {
      text = `Range: ${formatNumber(result.range)}\nMinimum: ${formatNumber(result.minimum)}\nMaximum: ${formatNumber(result.maximum)}\nCount: ${result.count}`;
    } else if (isVarianceResult(result)) {
      const variance = result.calculationType === 'population' ? result.populationVariance : result.sampleVariance;
      text = `Variance: ${formatNumber(variance)}\nMean: ${formatNumber(result.mean)}\nStandard Deviation: ${formatNumber(result.standardDeviation)}\nCount: ${result.count}`;
    }
    onCopy?.(text);
  };

  const downloadData = (format: 'csv' | 'json') => {
    onDownload?.(result, format);
  };

  const shareResult = () => {
    onShare?.(result);
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
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
            </button>
            <button
              onClick={shareResult}
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
                <Download className="h-4 w-4" />
              </button>
              {showDownloadMenu && (
                <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                  <button
                    onClick={() => {
                      downloadData('csv');
                      setShowDownloadMenu(false);
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    CSV
                  </button>
                  <button
                    onClick={() => {
                      downloadData('json');
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
      </div>

      <div className="p-6">
        {/* Main Results */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {isStandardDeviationResult(result) ? 'Standard Deviation' :
                 isMedianResult(result) ? 'Median (Middle Value)' :
                 isWeightedResult(result) ? 'Weighted Mean' :
                 isPercentErrorResult(result) ? 'Percent Error' :
                 isRangeResult(result) ? 'Data Range' :
                 isVarianceResult(result) ? 'Variance' : 'Mean (Average)'}
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {isMeanResult(result) ? formatNumber(result.mean) :
               isMedianResult(result) ? formatNumber(result.median) :
               isWeightedResult(result) ? formatNumber(result.weightedMean) :
               isStandardDeviationResult(result) ? formatNumber(result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation) :
               isPercentErrorResult(result) ? `${formatNumber(result.percentError)}%` :
               isRangeResult(result) ? formatNumber(result.range) :
               isVarianceResult(result) ? formatNumber(result.calculationType === 'population' ? result.populationVariance : result.sampleVariance) : '0'}
            </div>
            <div className="text-sm text-blue-700 mt-1">
              {isStandardDeviationResult(result) ? (result.calculationType === 'population' ? 'Population (σ)' : 'Sample (s)') :
               isMedianResult(result) ? (userMode === 'teacher' ? 'Class Median' : 'Middle Value') :
               isPercentErrorResult(result) ? 'Error Percentage' :
               isRangeResult(result) ? (userMode === 'teacher' ? 'Score Spread' : 'Data Spread') :
               isVarianceResult(result) ? (result.calculationType === 'population' ? 'Population Variance (σ²)' : 'Sample Variance (s²)') :
               userMode === 'teacher' ? 'Class Average' :
               isWeightedResult(result) ? 'Weighted Average' : 'Arithmetic Mean'}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              {isRangeResult(result) ? <ArrowUp className="h-5 w-5 text-green-600" /> : <CheckCircle className="h-5 w-5 text-green-600" />}
              <span className="text-sm font-medium text-green-800">
                {isStandardDeviationResult(result) ? 'Mean' :
                 isWeightedResult(result) ? 'Valid Pairs' :
                 isPercentErrorResult(result) ? 'Absolute Error' :
                 isRangeResult(result) ? 'Maximum Value' :
                 isVarianceResult(result) ? 'Standard Deviation' : 'Sample Size'}
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {isMeanResult(result) ? result.count :
               isMedianResult(result) ? result.count :
               isWeightedResult(result) ? result.validPairs :
               isStandardDeviationResult(result) ? formatNumber(result.mean) :
               isPercentErrorResult(result) ? formatNumber(result.absoluteError) :
               isRangeResult(result) ? formatNumber(result.maximum) :
               isVarianceResult(result) ? formatNumber(result.standardDeviation) : 0}
            </div>
            <div className="text-sm text-green-700 mt-1">
              {isStandardDeviationResult(result) ? 'Average Value' :
               isMedianResult(result) ? (userMode === 'teacher' ? 'Students' : 'Data Points') :
               isPercentErrorResult(result) ? 'Error Magnitude' :
               isRangeResult(result) ? 'Highest Value' :
               isVarianceResult(result) ? 'Square root of variance' :
               userMode === 'teacher' ? 'Students' :
               isWeightedResult(result) ? 'Value-Weight Pairs' : 'Data Points'}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              {isRangeResult(result) ? <Hash className="h-5 w-5 text-gray-600" /> : <TrendingUp className="h-5 w-5 text-gray-600" />}
              <span className="text-sm font-medium text-gray-800">
                {isStandardDeviationResult(result) ? 'Sample Size' :
                 isWeightedResult(result) ? 'Total Weight' :
                 isPercentErrorResult(result) ? (result.accuracy !== undefined ? 'Accuracy' : 'Theoretical Value') :
                 isRangeResult(result) ? 'Sample Size' :
                 isVarianceResult(result) ? 'Mean' : 'Sum Total'}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {isMeanResult(result) ? formatNumber(result.sum) :
               isWeightedResult(result) ? formatNumber(result.totalWeights) :
               isStandardDeviationResult(result) ? result.count :
               isPercentErrorResult(result) ? (result.accuracy !== undefined ? `${formatNumber(result.accuracy)}%` : formatNumber(result.theoreticalValue)) :
               isRangeResult(result) ? result.count :
               isVarianceResult(result) ? formatNumber(result.mean) : '0'}
            </div>
            <div className="text-sm text-gray-700 mt-1">
              {isStandardDeviationResult(result) ? 'Data Points' :
               isWeightedResult(result) ? 'Sum of all weights' :
               isPercentErrorResult(result) ? (result.accuracy !== undefined ? 'Measurement Accuracy' : 'Expected Value') :
               isRangeResult(result) ? (userMode === 'teacher' ? 'Students' : 'Data Points') :
               isVarianceResult(result) ? 'Average of all values' : 'Sum of all values'}
            </div>
          </div>
        </div>

        {/* Median Quartiles Display */}
        {isMedianResult(result) && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 text-indigo-600 mr-2" />
              Quartiles and Range Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-sm font-medium text-indigo-800 mb-1">Q1 (First Quartile)</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.q1)}</div>
                <div className="text-xs text-indigo-700 mt-1">25th percentile</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-sm font-medium text-indigo-800 mb-1">Q3 (Third Quartile)</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.q3)}</div>
                <div className="text-xs text-indigo-700 mt-1">75th percentile</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <div className="text-sm font-medium text-indigo-800 mb-1">IQR (Interquartile Range)</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.iqr)}</div>
                <div className="text-xs text-indigo-700 mt-1">Q3 - Q1</div>
              </div>
            </div>
            
            {/* Additional statistics for median */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-800 mb-1">Range</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(result.max - result.min)}
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  Min: {formatNumber(result.min)} | Max: {formatNumber(result.max)}
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-800 mb-1">Mean vs Median</div>
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(Math.abs(result.mean - result.median))}
                </div>
                <div className="text-xs text-gray-700 mt-1">
                  {result.mean > result.median ? 'Right-skewed' : result.mean < result.median ? 'Left-skewed' : 'Symmetric'}
                </div>
              </div>
            </div>

            {/* Outliers for research mode */}
            {userMode === 'research' && result.outliers && result.outliers.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Outliers Detected</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      {result.outliers.length} outlier{result.outliers.length !== 1 ? 's' : ''}: {result.outliers.map(o => formatNumber(o)).join(', ')}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Values outside 1.5 × IQR from Q1 and Q3
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Range Calculator Display */}
        {isRangeResult(result) && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
              Range Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                  <div className="text-sm font-medium text-blue-800">Maximum Value</div>
                </div>
                <div className="text-lg font-bold text-blue-900">{formatNumber(result.maximum)}</div>
                <div className="text-xs text-blue-700 mt-1">Highest value in dataset</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <ArrowDown className="h-5 w-5 text-blue-600" />
                  <div className="text-sm font-medium text-blue-800">Minimum Value</div>
                </div>
                <div className="text-lg font-bold text-blue-900">{formatNumber(result.minimum)}</div>
                <div className="text-xs text-blue-700 mt-1">Lowest value in dataset</div>
              </div>
            </div>
            
            {/* Research mode features */}
            {userMode === 'research' && result.quartiles && result.interquartileRange && (
              <div className="mt-4">
                <h5 className="text-md font-medium text-gray-800 mb-2">Quartile Analysis</h5>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-indigo-800 mb-1">Q1</div>
                    <div className="text-lg font-bold text-indigo-900">{formatNumber(result.quartiles.q1)}</div>
                    <div className="text-xs text-indigo-700 mt-1">25th percentile</div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-indigo-800 mb-1">Q2 (Median)</div>
                    <div className="text-lg font-bold text-indigo-900">{formatNumber(result.quartiles.q2)}</div>
                    <div className="text-xs text-indigo-700 mt-1">50th percentile</div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-indigo-800 mb-1">Q3</div>
                    <div className="text-lg font-bold text-indigo-900">{formatNumber(result.quartiles.q3)}</div>
                    <div className="text-xs text-indigo-700 mt-1">75th percentile</div>
                  </div>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-indigo-800 mb-1">IQR</div>
                    <div className="text-lg font-bold text-indigo-900">{formatNumber(result.interquartileRange)}</div>
                    <div className="text-xs text-indigo-700 mt-1">Q3 - Q1</div>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher mode grade distribution */}
            {userMode === 'teacher' && result.gradeDistribution && (
              <div className="mt-4">
                <h5 className="text-md font-medium text-gray-800 mb-2">Grade Distribution</h5>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(result.gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-sm font-medium text-green-800">{grade}</div>
                      <div className="text-xl font-bold text-green-900">{count}</div>
                      <div className="text-xs text-green-700">students</div>
                    </div>
                  ))}
                </div>
                {result.spreadAnalysis && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="text-sm text-gray-700">{result.spreadAnalysis}</div>
                  </div>
                )}
              </div>
            )}

            {/* Outliers for research mode */}
            {userMode === 'research' && result.outliers && result.outliers.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Outliers Detected</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      {result.outliers.length} outlier{result.outliers.length !== 1 ? 's' : ''}: {result.outliers.map(o => formatNumber(o)).join(', ')}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Values outside 1.5 × IQR from Q1 and Q3
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Variance Calculator Display */}
        {isVarianceResult(result) && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <BarChart3 className="h-4 w-4 text-purple-600 mr-2" />
              Variance Analysis
            </h4>

            {/* Main variance statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-1">Sample Variance</div>
                <div className="text-lg font-bold text-purple-900">{formatNumber(result.sampleVariance)}</div>
                <div className="text-xs text-purple-700 mt-1">s² = Σ(x - x̄)² / (n-1)</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-1">Population Variance</div>
                <div className="text-lg font-bold text-purple-900">{formatNumber(result.populationVariance)}</div>
                <div className="text-xs text-purple-700 mt-1">σ² = Σ(x - μ)² / n</div>
              </div>
            </div>

            {/* Quartile analysis */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="text-sm font-medium text-indigo-800 mb-1">Q1</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.q1)}</div>
                <div className="text-xs text-indigo-700 mt-1">25th percentile</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="text-sm font-medium text-indigo-800 mb-1">Median</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.median)}</div>
                <div className="text-xs text-indigo-700 mt-1">50th percentile</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="text-sm font-medium text-indigo-800 mb-1">Q3</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.q3)}</div>
                <div className="text-xs text-indigo-700 mt-1">75th percentile</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                <div className="text-sm font-medium text-indigo-800 mb-1">IQR</div>
                <div className="text-lg font-bold text-indigo-900">{formatNumber(result.iqr)}</div>
                <div className="text-xs text-indigo-700 mt-1">Q3 - Q1</div>
              </div>
            </div>

            {/* Advanced statistics for research mode */}
            {userMode === 'research' && (
              <div className="mt-4">
                <h5 className="text-md font-medium text-gray-800 mb-2">Advanced Statistics</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-800 mb-1">Skewness</div>
                    <div className="text-lg font-bold text-gray-900">{formatNumber(result.skewness)}</div>
                    <div className="text-xs text-gray-700 mt-1">
                      {result.skewness > 0.5 ? 'Right-skewed' : result.skewness < -0.5 ? 'Left-skewed' : 'Symmetric'}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-800 mb-1">Kurtosis</div>
                    <div className="text-lg font-bold text-gray-900">{formatNumber(result.kurtosis)}</div>
                    <div className="text-xs text-gray-700 mt-1">
                      {Math.abs(result.kurtosis) < 0.5 ? 'Normal' : Math.abs(result.kurtosis) > 1 ? 'Heavy-tailed' : 'Moderate'}
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-800 mb-1">Coefficient of Variation</div>
                    <div className="text-lg font-bold text-gray-900">{formatNumber(result.coefficientOfVariation)}%</div>
                    <div className="text-xs text-gray-700 mt-1">Relative variability</div>
                  </div>
                </div>
              </div>
            )}

            {/* Outliers detection */}
            {result.outliers && result.outliers.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-yellow-800">Outliers Detected</div>
                    <div className="text-sm text-yellow-700 mt-1">
                      {result.outliers.length} outlier{result.outliers.length !== 1 ? 's' : ''}: {result.outliers.map(o => formatNumber(o.value)).join(', ')}
                    </div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Values outside 1.5 × IQR from Q1 and Q3
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data quality info */}
            {result.excludedDataPoints && result.excludedDataPoints.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-red-800">Excluded Data Points</div>
                    <div className="text-sm text-red-700 mt-1">
                      {result.excludedDataPoints.length} data point{result.excludedDataPoints.length !== 1 ? 's were' : ' was'} excluded from calculation
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Excluded: {result.excludedDataPoints.map(p => formatNumber(p.value)).join(', ')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Percent Error Calculator Display */}
        {isPercentErrorResult(result) && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <Target className="h-4 w-4 text-red-600 mr-2" />
              Error Analysis
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm font-medium text-red-800 mb-1">Theoretical Value</div>
                <div className="text-lg font-bold text-red-900">{formatNumber(result.theoreticalValue)}</div>
                <div className="text-xs text-red-700 mt-1">Expected/true value</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm font-medium text-red-800 mb-1">Experimental Value</div>
                <div className="text-lg font-bold text-red-900">{formatNumber(result.experimentalValue)}</div>
                <div className="text-xs text-red-700 mt-1">Measured/observed value</div>
              </div>
            </div>
            
            {/* Research mode additional metrics */}
            {userMode === 'research' && result.relativeError !== undefined && result.accuracy !== undefined && (
              <div className="mt-4">
                <h5 className="text-md font-medium text-gray-800 mb-2">Advanced Metrics</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-800 mb-1">Relative Error</div>
                    <div className="text-lg font-bold text-purple-900">{formatNumber(result.relativeError)}</div>
                    <div className="text-xs text-purple-700 mt-1">Fractional error</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-purple-800 mb-1">Accuracy</div>
                    <div className="text-lg font-bold text-purple-900">{formatNumber(result.accuracy)}%</div>
                    <div className="text-xs text-purple-700 mt-1">100% - Percent Error</div>
                  </div>
                </div>
              </div>
            )}

            {/* Teacher mode grade assessment */}
            {userMode === 'teacher' && result.gradeEquivalent && result.interpretation && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">Assessment</div>
                <div className="text-lg font-bold text-blue-900 mb-2">{result.gradeEquivalent}</div>
                <div className="text-sm text-blue-700">{result.interpretation}</div>
              </div>
            )}
          </div>
        )}

        {/* Research Mode - Advanced Statistics */}
        {userMode === 'research' && isMeanResult(result) && result.stdError && result.confidenceInterval && result.confidenceInterval.length >= 2 && (
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
                    ) : isStandardDeviationResult(result) ? (
                      <>Standard deviation measures how spread out your data is from the mean. With {result.count} data points
                      and a mean of {formatNumber(result.mean)}, your {result.calculationType} standard deviation is {formatNumber(result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation)}.</>
                    ) : isVarianceResult(result) ? (
                      <>Variance measures how spread out your data is from the mean. With {result.count} data points and a mean of {formatNumber(result.mean)},
                      your {result.calculationType} variance is {formatNumber(result.calculationType === 'population' ? result.populationVariance : result.sampleVariance)}.
                      The standard deviation is {formatNumber(result.standardDeviation)}, which is the square root of variance.</>
                    ) : null}
                  </div>
                </>
              )}
              {userMode === 'research' && (
                <>
                  <div className="font-medium text-blue-800 mb-1">Research Interpretation</div>
                  <div className="text-blue-700">
                    {isMeanResult(result) ? (
                      <>Sample mean with {result.count} observations.{result.confidenceInterval && result.confidenceInterval.length >= 2 ? (
                        <> The 95% confidence interval suggests the population mean likely falls between {formatNumber(result.confidenceInterval[0])} and {formatNumber(result.confidenceInterval[1])}.</>
                      ) : (
                        <> This provides a point estimate of the population parameter.</>
                      )}</>
                    ) : isWeightedResult(result) ? (
                      <>Weighted mean with {result.validPairs} value-weight pairs. The calculation considers the 
                      relative importance of each observation based on its weight in the analysis.</>
                    ) : isStandardDeviationResult(result) ? (
                      <>{result.calculationType === 'population' ? 'Population' : 'Sample'} standard deviation with {result.count} observations.
                      A standard deviation of {formatNumber(result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation)} indicates
                      {result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation < result.mean * 0.1 ? ' low variability' :
                       result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation > result.mean * 0.3 ? ' high variability' : ' moderate variability'} in your dataset.</>
                    ) : isVarianceResult(result) ? (
                      <>{result.calculationType === 'population' ? 'Population' : 'Sample'} variance with {result.count} observations.
                      A variance of {formatNumber(result.calculationType === 'population' ? result.populationVariance : result.sampleVariance)} indicates
                      {result.calculationType === 'population' ? result.populationVariance : result.sampleVariance < result.mean * 0.01 ? ' low dispersion' :
                       result.calculationType === 'population' ? result.populationVariance : result.sampleVariance > result.mean * 0.09 ? ' high dispersion' : ' moderate dispersion'} in your dataset.
                      The coefficient of variation is {formatNumber(result.coefficientOfVariation)}%, suggesting {result.coefficientOfVariation < 15 ? ' low' : result.coefficientOfVariation > 35 ? ' high' : ' moderate'} relative variability.</>
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
                    ) : isStandardDeviationResult(result) ? (
                      <>Your class of {result.count} students shows a standard deviation of {formatNumber(result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation)}
                      with an average score of {formatNumber(result.mean)}. This indicates
                      {result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation < 10 ? ' consistent performance' :
                       result.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation > 20 ? ' varied performance levels' : ' moderate score spread'} across your students.</>
                    ) : isVarianceResult(result) ? (
                      <>Your class of {result.count} students shows a variance of {formatNumber(result.calculationType === 'population' ? result.populationVariance : result.sampleVariance)}
                      with an average score of {formatNumber(result.mean)} and standard deviation of {formatNumber(result.standardDeviation)}. This indicates
                      {result.calculationType === 'population' ? result.populationVariance : result.sampleVariance < 100 ? ' consistent performance' :
                       result.calculationType === 'population' ? result.populationVariance : result.sampleVariance > 400 ? ' varied performance levels' : ' moderate score spread'} across your students.
                      The quartile analysis shows Q1={formatNumber(result.q1)}, Median={formatNumber(result.median)}, Q3={formatNumber(result.q3)}, with an IQR of {formatNumber(result.iqr)}.</>
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