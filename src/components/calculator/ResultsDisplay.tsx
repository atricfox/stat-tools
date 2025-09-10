/**
 * Comprehensive results display component for statistical calculations
 * Shows results, statistics, visualizations, and step-by-step explanations
 */

'use client'

import React, { useState } from 'react';
import { Copy, CheckCircle, Download, Share2, TrendingUp, BarChart3, Eye, EyeOff } from 'lucide-react';
import { MeanCalculationResult } from '@/hooks/useMeanCalculator';
import { formatNumber, formatForExport, formatCalculationSteps } from '@/lib/formatters';
import { createShareableURL } from '@/lib/formatters';
import CalculationSteps from '@/components/ui/CalculationSteps';
import ResultCard from '@/components/ui/ResultCard';

export interface ResultsDisplayProps {
  results: any | null;
  userContext?: 'student' | 'research' | 'teacher';
  precision?: number;
  showAdvancedStats?: boolean;
  isMobile?: boolean;
  className?: string;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  userContext = 'student',
  precision = 2,
  showAdvancedStats = false,
  isMobile = false,
  className = ''
}) => {
  const [copiedResult, setCopiedResult] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [exportFormat, setExportFormat] = useState<'text' | 'json' | 'csv'>('text');

  if (!results) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${isMobile ? 'p-4' : 'p-8'} text-center ${className}`}>
        <BarChart3 className={`mx-auto mb-4 text-gray-300 ${isMobile ? 'h-8 w-8' : 'h-12 w-12'}`} />
        <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>No Results Yet</h3>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>Enter some numbers to see the calculation results.</p>
      </div>
    );
  }

  if (results.count === 0) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center ${className}`}>
        <div className="text-orange-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Valid Data</h3>
        <p className="text-gray-600">Please check your input format and try again.</p>
      </div>
    );
  }

  // Calculate additional statistics for advanced display
  const additionalStats = showAdvancedStats ? {
    median: (() => {
      const sorted = [...results.validNumbers].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
    })(),
    mode: (() => {
      const freq: { [key: number]: number } = {};
      (results.validNumbers as number[]).forEach((num: number) => {
        freq[num] = (freq[num] || 0) + 1;
      });
      const maxFreq = Math.max(...Object.values(freq));
      if (maxFreq === 1) return null; // No mode
      return Object.keys(freq)
        .filter(key => freq[Number(key)] === maxFreq)
        .map(Number);
    })(),
    stdDev: (() => {
      const mean = results.mean;
      const variance = (results.validNumbers as number[]).reduce((sum: number, num: number) => 
        sum + Math.pow(num - mean, 2), 0
      ) / (results.validNumbers as number[]).length;
      return Math.sqrt(variance);
    })(),
    quartiles: (() => {
      const sorted = [...results.validNumbers].sort((a, b) => a - b);
      const q1Index = Math.floor(sorted.length * 0.25);
      const q3Index = Math.floor(sorted.length * 0.75);
      return {
        q1: sorted[q1Index],
        q3: sorted[q3Index]
      };
    })()
  } : null;

  const copyResult = async () => {
    const text = formatForExport(results.mean, 'mean', results.validNumbers, precision);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedResult(true);
      setTimeout(() => setCopiedResult(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareResult = async () => {
    try {
      const url = createShareableURL(
        window.location.origin + window.location.pathname,
        results.validNumbers,
        precision,
        'mean'
      );
      await navigator.clipboard.writeText(url);
      // Could also implement a share modal here
    } catch (err) {
      console.error('Failed to create share link:', err);
    }
  };

  const exportData = () => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `mean-calculation-${new Date().toISOString().split('T')[0]}`;

    switch (exportFormat) {
      case 'json':
        content = JSON.stringify({
          result: {
            mean: results.mean,
            count: results.count,
            sum: results.sum,
            precision
          },
          data: results.validNumbers,
          invalidEntries: results.invalidEntries,
          statistics: additionalStats,
          timestamp: new Date().toISOString()
        }, null, 2);
        mimeType = 'application/json';
        filename += '.json';
        break;
      
      case 'csv':
        const csvHeaders = 'Index,Value\n';
        const csvData = (results.validNumbers as number[])
          .map((num: number, index: number) => `${index + 1},${num}`)
          .join('\n');
        const csvSummary = `\n\nSummary\nMean,${results.mean}\nCount,${results.count}\nSum,${results.sum}`;
        content = csvHeaders + csvData + csvSummary;
        mimeType = 'text/csv';
        filename += '.csv';
        break;
      
      default:
        content = formatForExport(results.mean, 'mean', results.validNumbers, precision);
        filename += '.txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Results Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {userContext === 'student' ? 'Your Grade Average' : 
             userContext === 'research' ? 'Statistical Results' : 
             'Class Statistics'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              {showDetails ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>

        {/* Primary Result */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <ResultCard
            value={formatNumber(results.mean, { precision })}
            label="Mean (Average)"
            highlighted={true}
            size="large"
            description={userContext === 'student' ? 'Your overall average' : 
                        userContext === 'research' ? 'Arithmetic mean' : 
                        'Class average'}
          />
          <ResultCard
            value={results.count}
            label="Sample Size"
            size="medium"
            description="Total numbers"
          />
          <ResultCard
            value={formatNumber(results.sum, { precision })}
            label="Sum"
            size="medium"
            description="Total sum"
          />
        </div>

        {/* Extended Statistics */}
        {showAdvancedStats && additionalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <ResultCard
              value={formatNumber(additionalStats.median, { precision })}
              label="Median"
              size="small"
              description="Middle value"
            />
            <ResultCard
              value={formatNumber(additionalStats.stdDev, { precision })}
              label="Std Deviation"
              size="small"
              description="Data spread"
            />
            <ResultCard
              value={formatNumber(additionalStats.quartiles.q1, { precision })}
              label="Q1"
              size="small"
              description="25th percentile"
            />
            <ResultCard
              value={formatNumber(additionalStats.quartiles.q3, { precision })}
              label="Q3"
              size="small"
              description="75th percentile"
            />
          </div>
        )}

        {/* Data Quality Indicators */}
        {(results.warnings && results.warnings.length > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Data Quality Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {(results.warnings as string[]).map((warning: string, index: number) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Invalid Entries Warning */}
        {results.invalidEntries && results.invalidEntries.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-orange-800 mb-2">
              Ignored {results.invalidEntries.length} Invalid Entr{results.invalidEntries.length > 1 ? 'ies' : 'y'}
            </h4>
            <div className="text-sm text-orange-700">
              {results.invalidEntries.slice(0, 5).join(', ')}
              {results.invalidEntries.length > 5 && ` (+${results.invalidEntries.length - 5} more)`}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={copyResult}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {copiedResult ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Result
              </>
            )}
          </button>
          
          <div className="flex items-center">
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as any)}
              className="px-2 py-2 border border-gray-300 rounded-l-lg text-sm"
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <button
              onClick={exportData}
              className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-r-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>

          {userContext !== 'student' && (
            <button
              onClick={shareResult}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Link
            </button>
          )}
        </div>
      </div>

      {/* Detailed View */}
      {showDetails && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Detailed Analysis
          </h3>
          
          {/* Data Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Data Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum:</span>
                  <span className="font-mono">{formatNumber(Math.min(...results.validNumbers), { precision })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum:</span>
                  <span className="font-mono">{formatNumber(Math.max(...results.validNumbers), { precision })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Range:</span>
                  <span className="font-mono">{formatNumber(Math.max(...results.validNumbers) - Math.min(...results.validNumbers), { precision })}</span>
                </div>
                {additionalStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Standard Deviation:</span>
                      <span className="font-mono">{formatNumber(additionalStats.stdDev, { precision })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coefficient of Variation:</span>
                      <span className="font-mono">{formatNumber((additionalStats.stdDev / results.mean) * 100, { precision: 1 })}%</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Context Insights</h4>
              <div className="text-sm text-gray-600 space-y-2">
                {userContext === 'student' && (
                  <>
                    <p>• This represents your overall performance average</p>
                    <p>• Consider the range to see consistency in your work</p>
                    {results.mean >= 90 && <p>• Excellent performance! Keep it up! 🎉</p>}
                    {results.mean >= 80 && results.mean < 90 && <p>• Good work! Room for improvement 📈</p>}
                    {results.mean < 80 && <p>• Consider reviewing material for better results 📚</p>}
                  </>
                )}
                {userContext === 'research' && (
                  <>
                    <p>• Sample size: {results.count} measurements</p>
                    <p>• Data precision appears appropriate for analysis</p>
                    {additionalStats && additionalStats.stdDev / results.mean < 0.1 && 
                      <p>• Low variability indicates consistent measurements ✓</p>
                    }
                  </>
                )}
                {userContext === 'teacher' && (
                  <>
                    <p>• Class average provides baseline performance metric</p>
                    <p>• Use range to identify students needing extra support</p>
                    {results.mean >= 85 && <p>• Class performing well overall! 👏</p>}
                    {results.count >= 20 && <p>• Good sample size for reliable statistics</p>}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Simple Visualization */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Data Distribution</h4>
            <div className="relative bg-gray-100 rounded-lg p-4 h-16">
              {/* Simple dot plot */}
              <div className="relative h-8 flex items-center">
                {(results.validNumbers as number[]).slice(0, 50).map((num: number, index: number) => {
                  const min = Math.min(...results.validNumbers);
                  const max = Math.max(...results.validNumbers);
                  const position = max === min ? 50 : ((num - min) / (max - min)) * 100;
                  return (
                    <div
                      key={index}
                      className="absolute w-2 h-2 bg-blue-500 rounded-full"
                      style={{ left: `${position}%` }}
                      title={num.toString()}
                    />
                  );
                })}
                {/* Mean indicator */}
                <div
                  className="absolute w-0.5 h-8 bg-red-500"
                  style={{ 
                    left: `${Math.max(0, Math.min(100, ((results.mean - Math.min(...results.validNumbers)) / (Math.max(...results.validNumbers) - Math.min(...results.validNumbers))) * 100))}%` 
                  }}
                  title={`Mean: ${results.mean}`}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>{formatNumber(Math.min(...results.validNumbers), { precision })}</span>
                <span className="text-red-600 font-medium">Mean: {formatNumber(results.mean, { precision })}</span>
                <span>{formatNumber(Math.max(...results.validNumbers), { precision })}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculation Steps */}
      <CalculationSteps
        steps={formatCalculationSteps(results.validNumbers, 'mean', results.mean, precision)}
        title="Step-by-Step Calculation"
        explanation={
          <div>
            <p className="mb-2">
              <strong>What is the arithmetic mean?</strong>
            </p>
            <p>
              The arithmetic mean (average) is calculated by adding all the numbers together 
              and dividing by the count of numbers. It represents the central tendency of your 
              data set and is widely used in {
                userContext === 'student' ? 'academic grading' :
                userContext === 'research' ? 'statistical analysis' :
                'educational assessment'
              }.
            </p>
            {userContext === 'research' && (
              <p className="mt-2">
                <em>Note: Consider using median for skewed distributions or when outliers are present.</em>
              </p>
            )}
          </div>
        }
        defaultExpanded={false}
      />
    </div>
  );
};

export default ResultsDisplay;
