/**
 * Quick actions toolbar for calculator operations
 * Provides one-click access to common functions and data transformations
 */

'use client'

import React, { useState } from 'react';
import { 
  Copy, 
  Share2, 
  Download, 
  Upload, 
  Shuffle, 
  SortAsc, 
  SortDesc, 
  Filter, 
  Zap,
  MoreHorizontal,
  FileText,
  Calculator
} from 'lucide-react';

export interface QuickActionsProps {
  onCopy: () => void;
  onShare: () => void;
  onExport: (format: 'txt' | 'json' | 'csv') => void;
  onImport: () => void;
  onSortAscending?: () => void;
  onSortDescending?: () => void;
  onShuffle?: () => void;
  onRemoveOutliers?: () => void;
  onGenerateReport?: () => void;
  hasData: boolean;
  hasResults: boolean;
  context?: 'student' | 'research' | 'teacher';
  className?: string;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCopy,
  onShare,
  onExport,
  onImport,
  onSortAscending,
  onSortDescending,
  onShuffle,
  onRemoveOutliers,
  onGenerateReport,
  hasData,
  hasResults,
  context = 'student',
  className = ''
}) => {
  const [showMore, setShowMore] = useState(false);
  const [exportFormat, setExportFormat] = useState<'txt' | 'json' | 'csv'>('txt');

  const primaryActions = [
    {
      id: 'copy',
      label: 'Copy',
      icon: Copy,
      action: onCopy,
      enabled: hasResults,
      tooltip: 'Copy results to clipboard'
    },
    {
      id: 'share',
      label: 'Share',
      icon: Share2,
      action: onShare,
      enabled: hasResults,
      tooltip: 'Share calculation link',
      show: context !== 'student' // Students might not need sharing
    },
    {
      id: 'export',
      label: 'Export',
      icon: Download,
      action: () => onExport(exportFormat),
      enabled: hasResults,
      tooltip: 'Download results'
    },
    {
      id: 'import',
      label: 'Import',
      icon: Upload,
      action: onImport,
      enabled: true,
      tooltip: 'Import data file'
    }
  ].filter(action => action.show !== false);

  const secondaryActions = [
    {
      id: 'sort-asc',
      label: 'Sort ↑',
      icon: SortAsc,
      action: onSortAscending,
      enabled: hasData && onSortAscending,
      tooltip: 'Sort numbers ascending'
    },
    {
      id: 'sort-desc',
      label: 'Sort ↓',
      icon: SortDesc,
      action: onSortDescending,
      enabled: hasData && onSortDescending,
      tooltip: 'Sort numbers descending'
    },
    {
      id: 'shuffle',
      label: 'Shuffle',
      icon: Shuffle,
      action: onShuffle,
      enabled: hasData && onShuffle,
      tooltip: 'Randomize order',
      show: context === 'teacher' // Useful for random sampling
    },
    {
      id: 'remove-outliers',
      label: 'Clean',
      icon: Filter,
      action: onRemoveOutliers,
      enabled: hasData && onRemoveOutliers,
      tooltip: 'Remove outliers',
      show: context === 'research'
    },
    {
      id: 'report',
      label: 'Report',
      icon: FileText,
      action: onGenerateReport,
      enabled: hasResults && onGenerateReport,
      tooltip: 'Generate detailed report'
    }
  ].filter(action => action.show !== false);

  const contextSpecificActions = {
    student: [
      { label: 'Grade Curve', action: () => {}, enabled: hasData },
      { label: 'What-if Analysis', action: () => {}, enabled: hasResults }
    ],
    research: [
      { label: 'Confidence Intervals', action: () => {}, enabled: hasResults },
      { label: 'Statistical Tests', action: () => {}, enabled: hasResults }
    ],
    teacher: [
      { label: 'Grade Distribution', action: () => {}, enabled: hasResults },
      { label: 'Parent Report', action: () => {}, enabled: hasResults }
    ]
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-3 ${className}`}>
      {/* Primary Actions */}
      <div className="flex items-center gap-2 mb-3">
        {primaryActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            disabled={!action.enabled}
            title={action.tooltip}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              action.enabled
                ? action.id === 'copy'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : action.id === 'share'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            <action.icon className="h-4 w-4 mr-1" />
            {action.label}
          </button>
        ))}

        {/* Export Format Selector */}
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value as any)}
          className="px-2 py-1 text-xs border border-gray-300 rounded bg-white"
          title="Export format"
        >
          <option value="txt">TXT</option>
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {secondaryActions.slice(0, showMore ? secondaryActions.length : 3).map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              disabled={!action.enabled}
              title={action.tooltip}
              className={`flex items-center px-2 py-1 rounded text-xs transition-colors ${
                action.enabled
                  ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </button>
          ))}
          
          {secondaryActions.length > 3 && (
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Context-specific Quick Access */}
        {hasResults && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">Quick:</span>
            {contextSpecificActions[context].slice(0, 2).map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                disabled={!action.enabled}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  action.enabled
                    ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className={`flex items-center ${hasData ? 'text-green-600' : ''}`}>
            <Calculator className="h-3 w-3 mr-1" />
            Data: {hasData ? 'Ready' : 'None'}
          </span>
          <span className={`flex items-center ${hasResults ? 'text-blue-600' : ''}`}>
            <Zap className="h-3 w-3 mr-1" />
            Results: {hasResults ? 'Available' : 'Pending'}
          </span>
        </div>

        {/* Context Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          context === 'student' ? 'bg-blue-100 text-blue-800' :
          context === 'research' ? 'bg-purple-100 text-purple-800' :
          'bg-green-100 text-green-800'
        }`}>
          {context.charAt(0).toUpperCase() + context.slice(1)} Mode
        </div>
      </div>
    </div>
  );
};

export default QuickActions;