/**
 * Data preview component showing parsed numbers and statistics
 * Helps users verify their input was parsed correctly
 */

'use client'

import React, { useState } from 'react';
import { Eye, EyeOff, Download, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { ParseResult } from '@/lib/parsers';
import { formatNumber } from '@/lib/formatters';

export interface DataPreviewProps {
  parseResult: ParseResult | null;
  className?: string;
  showStatistics?: boolean;
  maxPreviewItems?: number;
}

const DataPreview: React.FC<DataPreviewProps> = ({
  parseResult,
  className = '',
  showStatistics = true,
  maxPreviewItems = 20
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);

  if (!parseResult || parseResult.validNumbers.length === 0) {
    return null;
  }

  const { validNumbers, invalidEntries, metadata } = parseResult;
  const previewNumbers = isExpanded ? validNumbers : validNumbers.slice(0, maxPreviewItems);
  const hasMoreNumbers = validNumbers.length > maxPreviewItems;

  // Calculate quick statistics
  const stats = metadata.statistics || {
    min: Math.min(...validNumbers),
    max: Math.max(...validNumbers),
    range: Math.max(...validNumbers) - Math.min(...validNumbers)
  };

  const exportData = () => {
    const data = {
      numbers: validNumbers,
      count: validNumbers.length,
      statistics: stats,
      metadata,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <BarChart3 className="h-4 w-4 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-900">
            Data Preview ({validNumbers.length} numbers)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasMoreNumbers && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
            >
              {isExpanded ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {isExpanded ? 'Show Less' : `Show All (${validNumbers.length})`}
            </button>
          )}
          <button
            onClick={exportData}
            className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Numbers Grid */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
          {previewNumbers.map((num, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-mono"
            >
              {formatNumber(num, { precision: num % 1 === 0 ? 0 : 2 })}
            </span>
          ))}
          {hasMoreNumbers && !isExpanded && (
            <span className="inline-flex items-center px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
              +{validNumbers.length - maxPreviewItems} more
            </span>
          )}
        </div>
      </div>

      {/* Statistics */}
      {showStatistics && (
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <div className="text-xs text-gray-500">Min</div>
            <div className="text-sm font-medium text-gray-900">
              {formatNumber(stats.min, { precision: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Max</div>
            <div className="text-sm font-medium text-gray-900">
              {formatNumber(stats.max, { precision: 2 })}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Range</div>
            <div className="text-sm font-medium text-gray-900">
              {formatNumber(stats.range, { precision: 2 })}
            </div>
          </div>
        </div>
      )}

      {/* Format Info */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Format: {metadata.formatDetected}</span>
        {metadata.duplicates.length > 0 && (
          <span className="text-yellow-600">
            {metadata.duplicates.length} duplicate{metadata.duplicates.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Invalid Entries */}
      {invalidEntries.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => setShowInvalid(!showInvalid)}
            className="flex items-center text-xs text-orange-600 hover:text-orange-800 mb-2"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {invalidEntries.length} invalid entr{invalidEntries.length > 1 ? 'ies' : 'y'}
          </button>
          {showInvalid && (
            <div className="flex flex-wrap gap-1">
              {invalidEntries.slice(0, 10).map((entry, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                >
                  {entry}
                </span>
              ))}
              {invalidEntries.length > 10 && (
                <span className="text-xs text-gray-500">
                  +{invalidEntries.length - 10} more
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Special Context Info */}
      {'researchInfo' in parseResult && parseResult.researchInfo && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-purple-600 mb-1">
            <TrendingUp className="h-3 w-3 mr-1" />
            Research Data Insights
          </div>
          <div className="text-xs text-gray-600 space-y-1">
            {parseResult.researchInfo.hasScientificNotation && (
              <div>• Contains scientific notation</div>
            )}
            <div>• Suggested precision: {parseResult.researchInfo.suggestedSignificantFigures} sig figs</div>
            {parseResult.researchInfo.outlierCandidates.length > 0 && (
              <div>• {parseResult.researchInfo.outlierCandidates.length} potential outlier(s)</div>
            )}
          </div>
        </div>
      )}

      {'gradingInfo' in parseResult && parseResult.gradingInfo && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center text-xs text-green-600 mb-1">
            <BarChart3 className="h-3 w-3 mr-1" />
            Grade Distribution
          </div>
          <div className="text-xs text-gray-600">
            <div>• Valid grades: {parseResult.gradingInfo.validGrades.length}</div>
            {parseResult.gradingInfo.outOfRange.length > 0 && (
              <div>• Out of range: {parseResult.gradingInfo.outOfRange.length}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreview;