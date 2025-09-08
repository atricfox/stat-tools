/**
 * Batch processing manager for teacher scenarios
 * Handles multiple assignments, classes, and data comparisons
 */

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Play,
  Pause,
  Square,
  BarChart3,
  TrendingUp,
  Users,
  Award,
  Download,
  Trash2,
  Plus,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Layers,
  Filter,
  ArrowUpDown,
  FileText,
  PieChart
} from 'lucide-react';
import BatchProcessor, { 
  BatchDataset, 
  BatchResult, 
  BatchSummary, 
  BatchProcessingOptions,
  BatchUtils 
} from '@/lib/batch-processor';

export interface BatchProcessingManagerProps {
  initialDatasets?: BatchDataset[];
  onResultsReady?: (results: BatchResult[], summary: BatchSummary) => void;
  maxDatasets?: number;
  showComparisons?: boolean;
  enableExport?: boolean;
  className?: string;
}

type ProcessingStatus = 'idle' | 'running' | 'paused' | 'completed' | 'error';

const BatchProcessingManager: React.FC<BatchProcessingManagerProps> = ({
  initialDatasets = [],
  onResultsReady,
  maxDatasets = 50,
  showComparisons = true,
  enableExport = true,
  className = ''
}) => {
  const [datasets, setDatasets] = useState<BatchDataset[]>(initialDatasets);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentProcessing, setCurrentProcessing] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  const [options, setOptions] = useState<BatchProcessingOptions>({
    precision: 2,
    includeOutliers: true,
    calculateAdvancedStats: false,
    generateComparisons: true,
    enableWebWorker: false
  });

  const [filters, setFilters] = useState({
    sortBy: 'name' as 'name' | 'mean' | 'count' | 'processingTime',
    sortOrder: 'asc' as 'asc' | 'desc',
    showOnlyCompleted: false,
    minDataPoints: 0
  });

  const [showSettings, setShowSettings] = useState(false);
  const processingRef = useRef<{ abort: () => void } | null>(null);

  // Process all datasets
  const handleStartProcessing = useCallback(async () => {
    if (datasets.length === 0) {
      setError('No datasets to process');
      return;
    }

    setStatus('running');
    setProgress(0);
    setError(null);
    setResults([]);
    setSummary(null);

    try {
      const { results: batchResults, summary: batchSummary } = await BatchProcessor.processBatch(
        datasets,
        {
          ...options,
          progressCallback: (progress, current) => {
            setProgress(progress);
            setCurrentProcessing(current);
          }
        }
      );

      setResults(batchResults);
      setSummary(batchSummary);
      setStatus('completed');
      onResultsReady?.(batchResults, batchSummary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setStatus('error');
    }
  }, [datasets, options, onResultsReady]);

  // Add new dataset
  const handleAddDataset = useCallback((newDataset: Omit<BatchDataset, 'id'>) => {
    if (datasets.length >= maxDatasets) {
      setError(`Maximum ${maxDatasets} datasets allowed`);
      return;
    }

    const dataset: BatchDataset = {
      ...newDataset,
      id: `dataset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setDatasets(prev => [...prev, dataset]);
  }, [datasets.length, maxDatasets]);

  // Remove dataset
  const handleRemoveDataset = useCallback((id: string) => {
    setDatasets(prev => prev.filter(d => d.id !== id));
  }, []);

  // Clear all datasets
  const handleClearAll = useCallback(() => {
    setDatasets([]);
    setResults([]);
    setSummary(null);
    setStatus('idle');
    setProgress(0);
    setError(null);
  }, []);

  // Export results
  const handleExport = useCallback((format: 'csv' | 'json') => {
    if (results.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      content = BatchUtils.exportToCSV(results);
      filename = 'batch_results.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify({ results, summary }, null, 2);
      filename = 'batch_results.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [results, summary]);

  // Filter and sort results
  const filteredResults = results.filter(result => {
    if (filters.showOnlyCompleted && !result.result) return false;
    if (result.result && result.result.count < filters.minDataPoints) return false;
    return true;
  }).sort((a, b) => {
    let comparison = 0;
    
    switch (filters.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'mean':
        comparison = (a.result?.mean || 0) - (b.result?.mean || 0);
        break;
      case 'count':
        comparison = (a.result?.count || 0) - (b.result?.count || 0);
        break;
      case 'processingTime':
        comparison = a.processingTime - b.processingTime;
        break;
    }
    
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  const renderDatasetCard = (dataset: BatchDataset) => (
    <div key={dataset.id} className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 truncate">{dataset.name}</h4>
        <button
          onClick={() => handleRemoveDataset(dataset.id)}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="text-sm text-gray-600 space-y-1">
        <div className="flex justify-between">
          <span>Data Points:</span>
          <span>{dataset.data.length}</span>
        </div>
        {dataset.metadata?.source && (
          <div className="flex justify-between">
            <span>Source:</span>
            <span className="capitalize">{dataset.metadata.source}</span>
          </div>
        )}
        {dataset.metadata?.assignmentType && (
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="capitalize">{dataset.metadata.assignmentType}</span>
          </div>
        )}
      </div>
    </div>
  );

  const renderResultCard = (result: BatchResult) => (
    <div key={result.id} className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-900 truncate">{result.name}</h4>
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          {result.processingTime.toFixed(0)}ms
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-gray-600">Mean</div>
          <div className="font-medium text-lg text-blue-600">
            {result.result.mean.toFixed(options.precision || 2)}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Std Dev</div>
          <div className="font-medium text-green-600">
            {result.result.standardDeviation.toFixed(options.precision || 2)}
          </div>
        </div>
        <div>
          <div className="text-gray-600">Count</div>
          <div className="font-medium text-purple-600">{result.result.count}</div>
        </div>
        <div>
          <div className="text-gray-600">Range</div>
          <div className="font-medium text-orange-600">
            {(result.result.max - result.result.min).toFixed(1)}
          </div>
        </div>
      </div>

      {result.advancedStats && (
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>CI 95%:</span>
            <span>
              [{result.advancedStats.confidenceInterval95.lower.toFixed(1)}, 
               {result.advancedStats.confidenceInterval95.upper.toFixed(1)}]
            </span>
          </div>
        </div>
      )}
    </div>
  );

  const renderProgressBar = () => (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          {status === 'running' ? (
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin mr-2" />
          ) : status === 'completed' ? (
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
          ) : status === 'error' ? (
            <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
          ) : null}
          <span className="font-medium text-gray-900">
            {status === 'running' ? 'Processing...' : 
             status === 'completed' ? 'Completed' :
             status === 'error' ? 'Error' : 'Ready'}
          </span>
        </div>
        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            status === 'error' ? 'bg-red-500' :
            status === 'completed' ? 'bg-green-500' :
            'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {currentProcessing && (
        <div className="text-xs text-gray-600">{currentProcessing}</div>
      )}
    </div>
  );

  const renderSummaryStats = () => {
    if (!summary) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Batch Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{summary.successfulProcessing}</div>
            <div className="text-xs text-gray-600">Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {summary.overallStatistics.averageOfMeans.toFixed(1)}
            </div>
            <div className="text-xs text-gray-600">Avg of Means</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {summary.totalProcessingTime.toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Total Time (ms)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{summary.failedProcessing}</div>
            <div className="text-xs text-gray-600">Failed</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Extremes</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Highest Mean:</span>
                <span className="font-medium">
                  {summary.overallStatistics.highestMean.name} 
                  ({summary.overallStatistics.highestMean.value.toFixed(1)})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lowest Mean:</span>
                <span className="font-medium">
                  {summary.overallStatistics.lowestMean.name} 
                  ({summary.overallStatistics.lowestMean.value.toFixed(1)})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Consistency</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Most Consistent:</span>
                <span className="font-medium">
                  {summary.overallStatistics.mostConsistent.name} 
                  (CV: {summary.overallStatistics.mostConsistent.cv.toFixed(1)}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Least Consistent:</span>
                <span className="font-medium">
                  {summary.overallStatistics.leastConsistent.name} 
                  (CV: {summary.overallStatistics.leastConsistent.cv.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Batch Processing Manager
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="h-4 w-4" />
            </button>
            {enableExport && results.length > 0 && (
              <>
                <button
                  onClick={() => handleExport('csv')}
                  className="px-3 py-1 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
                >
                  Export JSON
                </button>
              </>
            )}
          </div>
        </div>

        {/* Processing Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleStartProcessing}
            disabled={status === 'running' || datasets.length === 0}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              status === 'running' || datasets.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Play className="h-4 w-4 mr-2" />
            Process All ({datasets.length})
          </button>

          <button
            onClick={handleClearAll}
            disabled={status === 'running'}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </button>

          <div className="text-sm text-gray-600">
            {datasets.length} datasets • {results.length} processed
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Processing Options</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precision (decimal places)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={options.precision || 2}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    precision: parseInt(e.target.value) || 2 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.calculateAdvancedStats || false}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      calculateAdvancedStats: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Advanced Statistics</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={options.generateComparisons || false}
                    onChange={(e) => setOptions(prev => ({ 
                      ...prev, 
                      generateComparisons: e.target.checked 
                    }))}
                    className="mr-2"
                  />
                  <span className="text-sm">Generate Comparisons</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort Results By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    sortBy: e.target.value as any 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="name">Name</option>
                  <option value="mean">Mean</option>
                  <option value="count">Count</option>
                  <option value="processingTime">Processing Time</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(status === 'running' || status === 'completed' || status === 'error') && renderProgressBar()}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Processing Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      {renderSummaryStats()}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Datasets */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Input Datasets ({datasets.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {datasets.map(renderDatasetCard)}
            {datasets.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No datasets added yet. Use the file upload component to add data.
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Results ({filteredResults.length})
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredResults.map(renderResultCard)}
            {filteredResults.length === 0 && results.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No results yet. Process datasets to see results here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchProcessingManager;