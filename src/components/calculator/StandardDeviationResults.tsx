/**
 * Standard Deviation Results Component
 * Comprehensive display of statistical analysis results with educational insights
 * Supports sample/population modes and advanced statistical measures
 */

'use client';

import React, { useState, useCallback } from 'react';
import { 
  Copy, 
  Download, 
  Info, 
  TrendingUp, 
  BarChart3, 
  Target,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { StandardDeviationResult } from '@/types/standardDeviation';

interface StandardDeviationResultsProps {
  result: StandardDeviationResult | null;
  userMode: 'student' | 'research' | 'teacher';
  precision: number;
  onCopy?: (text: string) => void;
  onDownload?: (result: StandardDeviationResult, format: 'csv' | 'json' | 'pdf') => void;
  showAdvancedStats?: boolean;
  showDistributionAnalysis?: boolean;
}

const StandardDeviationResults: React.FC<StandardDeviationResultsProps> = ({
  result,
  userMode,
  precision = 2,
  onCopy,
  onDownload,
  showAdvancedStats = false,
  showDistributionAnalysis = false
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'distribution' | 'steps'>('summary');
  const [showOutliers, setShowOutliers] = useState(false);
  const [showDeviations, setShowDeviations] = useState(false);

  if (!result) {
    return null;
  }

  // Format number with precision
  const formatNumber = useCallback((value: number, customPrecision?: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    return value.toFixed(customPrecision ?? precision);
  }, [precision]);

  // Generate copyable text
  const generateCopyText = useCallback((): string => {
    const lines = [
      'Standard Deviation Analysis Results',
      '=' .repeat(40),
      '',
      'Basic Statistics:',
      `Mean (Average): ${formatNumber(result.mean)}`,
      `Sample Standard Deviation: ${formatNumber(result.sampleStandardDeviation)}`,
      `Population Standard Deviation: ${formatNumber(result.populationStandardDeviation)}`,
      `Sample Variance: ${formatNumber(result.sampleVariance)}`,
      `Count: ${result.count}`,
      '',
      'Descriptive Statistics:',
      `Minimum: ${formatNumber(result.min)}`,
      `Maximum: ${formatNumber(result.max)}`,
      `Range: ${formatNumber(result.range)}`,
      `Median: ${formatNumber(result.median)}`,
      `Q1 (25th percentile): ${formatNumber(result.q1)}`,
      `Q3 (75th percentile): ${formatNumber(result.q3)}`,
      `Interquartile Range (IQR): ${formatNumber(result.iqr)}`,
      ''
    ];

    if (showAdvancedStats) {
      lines.push(
        'Advanced Statistics:',
        `Skewness: ${formatNumber(result.skewness)}`,
        `Kurtosis: ${formatNumber(result.kurtosis)}`,
        `Coefficient of Variation: ${formatNumber(result.coefficientOfVariation)}%`,
        `Standard Error: ${formatNumber(result.standardError)}`,
        ''
      );
    }

    if (result.outliers.length > 0) {
      lines.push(
        'Outliers Detected:',
        ...result.outliers.map(outlier => `${outlier.label}: ${formatNumber(outlier.value)}`),
        ''
      );
    }

    lines.push(`Analysis completed: ${result.timestamp}`);

    return lines.join('\n');
  }, [result, formatNumber, showAdvancedStats]);

  // Handle copy action
  const handleCopy = useCallback(() => {
    const text = generateCopyText();
    if (onCopy) {
      onCopy(text);
    } else {
      navigator.clipboard?.writeText(text);
    }
  }, [generateCopyText, onCopy]);

  // Interpret statistical measures for educational purposes
  const getInterpretation = useCallback((metric: string, value: number) => {
    switch (metric) {
      case 'skewness':
        if (Math.abs(value) < 0.5) return 'approximately symmetric';
        if (value > 0.5) return 'right-skewed (tail extends right)';
        return 'left-skewed (tail extends left)';
      
      case 'kurtosis':
        if (Math.abs(value) < 0.5) return 'normal peak (mesokurtic)';
        if (value > 0.5) return 'sharper peak (leptokurtic)';
        return 'flatter peak (platykurtic)';
      
      case 'cv':
        if (value < 15) return 'low variability';
        if (value < 30) return 'moderate variability';
        return 'high variability';
      
      default:
        return '';
    }
  }, []);

  // Get user-specific insights
  const getUserInsight = useCallback(() => {
    const cv = result.coefficientOfVariation;
    const hasOutliers = result.outliers.length > 0;
    
    switch (userMode) {
      case 'student':
        return {
          title: 'Student Insight',
          content: `Your data has ${getInterpretation('cv', cv)} relative to the mean. ${
            hasOutliers 
              ? `There ${result.outliers.length === 1 ? 'is' : 'are'} ${result.outliers.length} outlier(s) that may represent unusual scores.`
              : 'No unusual outliers detected in your data.'
          } The standard deviation tells you how spread out your individual scores are from the average.`
        };
      
      case 'research':
        return {
          title: 'Research Interpretation',
          content: `The coefficient of variation (${formatNumber(cv)}%) indicates ${getInterpretation('cv', cv)}. ${
            hasOutliers 
              ? `${result.outliers.length} outlier(s) detected - consider investigating these data points for measurement errors or significant findings.`
              : 'Data appears consistent without extreme outliers.'
          } Consider the sample size (n=${result.count}) when interpreting these results.`
        };
      
      case 'teacher':
        return {
          title: 'Class Summary',
          content: `Class performance shows ${getInterpretation('cv', cv)} (CV: ${formatNumber(cv)}%). ${
            hasOutliers 
              ? `${result.outliers.length} student(s) scored significantly differently - they may need additional attention.`
              : 'Student performance is relatively consistent.'
          } The standard deviation of ${formatNumber(result.sampleStandardDeviation)} indicates the typical spread from the class average.`
        };
      
      default:
        return { title: 'Analysis', content: '' };
    }
  }, [result, userMode, formatNumber, getInterpretation]);

  const userInsight = getUserInsight();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Statistical Analysis Results</h3>
          <p className="text-sm text-gray-600 mt-1">
            {result.calculationType === 'sample' ? 'Sample' : 
             result.calculationType === 'population' ? 'Population' : 'Complete'} analysis of {result.count} data points
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            title="Copy results"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </button>
          {onDownload && (
            <div className="flex space-x-1">
              <button
                onClick={() => onDownload(result, 'csv')}
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                CSV
              </button>
              <button
                onClick={() => onDownload(result, 'json')}
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'summary', label: 'Summary', icon: BarChart3 },
          { id: 'detailed', label: 'Detailed', icon: Target },
          { id: 'distribution', label: 'Distribution', icon: TrendingUp },
          { id: 'steps', label: 'Steps', icon: Info }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Mean (Average)</div>
              <div className="text-2xl font-bold text-blue-900">{formatNumber(result.mean)}</div>
              <div className="text-xs text-blue-600 mt-1">Central tendency</div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="text-sm text-green-600 font-medium">
                {result.calculationType === 'population' ? 'Population' : 'Sample'} Std Dev
              </div>
              <div className="text-2xl font-bold text-green-900">
                {formatNumber(result.calculationType === 'population' ? 
                  result.populationStandardDeviation : result.sampleStandardDeviation)}
              </div>
              <div className="text-xs text-green-600 mt-1">Data spread</div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Coefficient of Variation</div>
              <div className="text-2xl font-bold text-purple-900">{formatNumber(result.coefficientOfVariation)}%</div>
              <div className="text-xs text-purple-600 mt-1">Relative variability</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Count</div>
              <div className="text-lg font-semibold text-gray-900">{result.count}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Range</div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(result.range)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Median</div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(result.median)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">IQR</div>
              <div className="text-lg font-semibold text-gray-900">{formatNumber(result.iqr)}</div>
            </div>
          </div>

          {/* User Insight */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">{userInsight.title}</h4>
            </div>
            <p className="text-sm text-gray-700">{userInsight.content}</p>
          </div>

          {/* Outliers Alert */}
          {result.outliers.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-900">
                  {result.outliers.length} Outlier{result.outliers.length > 1 ? 's' : ''} Detected
                </h4>
              </div>
              <button
                onClick={() => setShowOutliers(!showOutliers)}
                className="text-sm text-yellow-700 hover:text-yellow-900 transition-colors"
              >
                {showOutliers ? 'Hide' : 'Show'} outlier details
              </button>
              {showOutliers && (
                <div className="mt-3 space-y-1">
                  {result.outliers.map((outlier, index) => (
                    <div key={index} className="text-sm text-yellow-800">
                      <span className="font-medium">{outlier.label}:</span> {formatNumber(outlier.value)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detailed Tab */}
      {activeTab === 'detailed' && (
        <div className="space-y-6">
          {/* Complete Statistics Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-600 font-medium">Statistic</th>
                  <th className="text-right py-2 text-gray-600 font-medium">Value</th>
                  <th className="text-left py-2 text-gray-600 font-medium pl-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-2 text-gray-900">Mean</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.mean)}</td>
                  <td className="py-2 text-gray-600 pl-4">Arithmetic average of all values</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Sample Standard Deviation</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.sampleStandardDeviation)}</td>
                  <td className="py-2 text-gray-600 pl-4">Spread using n-1 degrees of freedom</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Population Standard Deviation</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.populationStandardDeviation)}</td>
                  <td className="py-2 text-gray-600 pl-4">Spread using n degrees of freedom</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Sample Variance</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.sampleVariance)}</td>
                  <td className="py-2 text-gray-600 pl-4">Average squared deviation (sample)</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Standard Error</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.standardError)}</td>
                  <td className="py-2 text-gray-600 pl-4">Standard deviation of the mean</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Minimum</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.min)}</td>
                  <td className="py-2 text-gray-600 pl-4">Smallest value in dataset</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Maximum</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.max)}</td>
                  <td className="py-2 text-gray-600 pl-4">Largest value in dataset</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Range</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.range)}</td>
                  <td className="py-2 text-gray-600 pl-4">Difference between max and min</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Median (Q2)</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.median)}</td>
                  <td className="py-2 text-gray-600 pl-4">50th percentile</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">First Quartile (Q1)</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.q1)}</td>
                  <td className="py-2 text-gray-600 pl-4">25th percentile</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Third Quartile (Q3)</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.q3)}</td>
                  <td className="py-2 text-gray-600 pl-4">75th percentile</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-900">Interquartile Range (IQR)</td>
                  <td className="py-2 text-right font-mono">{formatNumber(result.iqr)}</td>
                  <td className="py-2 text-gray-600 pl-4">Q3 - Q1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Individual Deviations */}
          {result.deviations && result.deviations.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Individual Deviations from Mean</h4>
                <button
                  onClick={() => setShowDeviations(!showDeviations)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showDeviations ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                  {showDeviations ? 'Hide' : 'Show'} deviations
                </button>
              </div>
              
              {showDeviations && (
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="text-left px-3 py-2 text-gray-600 font-medium">Value</th>
                        <th className="text-right px-3 py-2 text-gray-600 font-medium">Deviation</th>
                        <th className="text-right px-3 py-2 text-gray-600 font-medium">Squared Deviation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {result.deviations.map((item, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 font-mono">{formatNumber(item.value)}</td>
                          <td className="px-3 py-2 text-right font-mono">{formatNumber(item.deviation)}</td>
                          <td className="px-3 py-2 text-right font-mono">{formatNumber(item.squaredDeviation)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Distribution Tab */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          {/* Shape Characteristics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Shape Analysis</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Skewness</span>
                    <span className="font-mono text-sm">{formatNumber(result.skewness, 3)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Distribution is {getInterpretation('skewness', result.skewness)}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Kurtosis</span>
                    <span className="font-mono text-sm">{formatNumber(result.kurtosis, 3)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Distribution has a {getInterpretation('kurtosis', result.kurtosis)}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Variability</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Coefficient of Variation</span>
                    <span className="font-mono text-sm">{formatNumber(result.coefficientOfVariation)}%</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getInterpretation('cv', result.coefficientOfVariation)} relative to the mean
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Distribution Type</span>
                    <span className="text-sm font-medium capitalize">{result.distributionType || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Five Number Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Five Number Summary</h4>
            <div className="flex justify-between items-center">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatNumber(result.min)}</div>
                <div className="text-xs text-gray-600">Min</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatNumber(result.q1)}</div>
                <div className="text-xs text-gray-600">Q1</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{formatNumber(result.median)}</div>
                <div className="text-xs text-gray-600">Median</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatNumber(result.q3)}</div>
                <div className="text-xs text-gray-600">Q3</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatNumber(result.max)}</div>
                <div className="text-xs text-gray-600">Max</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Steps Tab */}
      {activeTab === 'steps' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Step-by-Step Calculation</h4>
            </div>
            <p className="text-sm text-blue-800">
              Follow these steps to understand how the standard deviation was calculated:
            </p>
          </div>
          
          <div className="space-y-3">
            {result.steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 text-sm text-gray-700 font-mono leading-relaxed">
                  {step}
                </div>
              </div>
            ))}
          </div>

          {/* Formula Reference */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Formula Reference</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div>
                <strong>Sample Standard Deviation:</strong>
                <div className="font-mono bg-white p-2 rounded mt-1 border">
                  s = √[Σ(x - x̄)² / (n - 1)]
                </div>
              </div>
              <div>
                <strong>Population Standard Deviation:</strong>
                <div className="font-mono bg-white p-2 rounded mt-1 border">
                  σ = √[Σ(x - μ)² / n]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardDeviationResults;