/**
 * Statistical Visualization Component
 * Interactive charts for standard deviation analysis
 * Supports histogram, box plot, scatter plot, and normal curve overlay
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart3, 
  Box, 
  Scatter, 
  TrendingUp, 
  Settings,
  Download,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  StandardDeviationResult, 
  StatisticalVisualizationConfig 
} from '@/types/standardDeviation';

interface StatisticalVisualizationProps {
  result: StandardDeviationResult;
  config: StatisticalVisualizationConfig;
  onConfigChange: (config: StatisticalVisualizationConfig) => void;
  userMode: 'student' | 'research' | 'teacher';
  className?: string;
}

const StatisticalVisualization: React.FC<StatisticalVisualizationProps> = ({
  result,
  config,
  onConfigChange,
  userMode,
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate histogram data
  const histogramData = useMemo(() => {
    if (!result || result.validDataPoints.length === 0) return [];

    const values = result.validDataPoints.map(p => p.value);
    const bins = config.bins || Math.ceil(Math.sqrt(values.length));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / bins;

    const histogramBins = Array.from({ length: bins }, (_, i) => ({
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      count: 0,
      percentage: 0,
      values: [] as number[]
    }));

    // Distribute values into bins
    values.forEach(value => {
      let binIndex = Math.floor((value - min) / binWidth);
      if (binIndex >= bins) binIndex = bins - 1; // Handle edge case
      if (binIndex < 0) binIndex = 0;
      
      histogramBins[binIndex].count++;
      histogramBins[binIndex].values.push(value);
    });

    // Calculate percentages
    histogramBins.forEach(bin => {
      bin.percentage = (bin.count / values.length) * 100;
    });

    return histogramBins;
  }, [result, config.bins]);

  // Generate normal curve points for overlay
  const normalCurveData = useMemo(() => {
    if (!result || !config.showNormalCurve) return [];

    const mean = result.mean;
    const stdDev = result.sampleStandardDeviation;
    const min = Math.min(...result.validDataPoints.map(p => p.value));
    const max = Math.max(...result.validDataPoints.map(p => p.value));
    
    const points = [];
    const steps = 100;
    const range = max - min;
    const start = min - range * 0.2;
    const end = max + range * 0.2;
    const step = (end - start) / steps;

    for (let x = start; x <= end; x += step) {
      const exponent = -0.5 * Math.pow((x - mean) / stdDev, 2);
      const y = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
      points.push({ x, y: y * result.count * ((max - min) / (config.bins || 10)) });
    }

    return points;
  }, [result, config.showNormalCurve, config.bins]);

  // Box plot data
  const boxPlotData = useMemo(() => {
    if (!result) return null;

    return {
      min: result.min,
      q1: result.q1,
      median: result.median,
      q3: result.q3,
      max: result.max,
      outliers: result.outliers.map(o => o.value),
      mean: result.mean
    };
  }, [result]);

  // Generate SVG histogram
  const renderHistogram = useCallback(() => {
    if (!histogramData.length) return null;

    const width = config.width || 600;
    const height = config.height || 300;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const maxCount = Math.max(...histogramData.map(bin => bin.count));
    const xScale = (index: number) => (index * chartWidth) / histogramData.length;
    const yScale = (count: number) => chartHeight - (count / maxCount) * chartHeight;
    const barWidth = chartWidth / histogramData.length - 2;

    return (
      <svg width={width} height={height} className="border border-gray-200 rounded">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />
        
        {/* Chart area */}
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => (
            <g key={ratio}>
              <line
                x1={0}
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#f3f4f6"
                strokeWidth={1}
              />
              <text
                x={-10}
                y={chartHeight * ratio + 4}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {Math.round(maxCount * (1 - ratio))}
              </text>
            </g>
          ))}
          
          {/* Bars */}
          {histogramData.map((bin, index) => (
            <rect
              key={index}
              x={xScale(index) + 1}
              y={yScale(bin.count)}
              width={barWidth}
              height={chartHeight - yScale(bin.count)}
              fill="#3b82f6"
              fillOpacity={0.7}
              stroke="#1d4ed8"
              strokeWidth={1}
            />
          ))}
          
          {/* Mean line */}
          {config.showMean && result && (
            <line
              x1={((result.mean - result.min) / (result.max - result.min)) * chartWidth}
              y1={0}
              x2={((result.mean - result.min) / (result.max - result.min)) * chartWidth}
              y2={chartHeight}
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="4,2"
            />
          )}
          
          {/* Median line */}
          {config.showMedian && result && (
            <line
              x1={((result.median - result.min) / (result.max - result.min)) * chartWidth}
              y1={0}
              x2={((result.median - result.min) / (result.max - result.min)) * chartWidth}
              y2={chartHeight}
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="4,2"
            />
          )}
          
          {/* Normal curve overlay */}
          {config.showNormalCurve && normalCurveData.length > 0 && (
            <path
              d={normalCurveData.map((point, index) => {
                const x = ((point.x - result.min) / (result.max - result.min)) * chartWidth;
                const y = yScale(point.y);
                return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth={2}
              opacity={0.8}
            />
          )}
          
          {/* X-axis */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#374151" strokeWidth={1} />
          
          {/* X-axis labels */}
          {histogramData.map((bin, index) => (
            <text
              key={index}
              x={xScale(index) + barWidth / 2}
              y={chartHeight + 20}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {bin.start.toFixed(1)}
            </text>
          ))}
          
          {/* Y-axis */}
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#374151" strokeWidth={1} />
        </g>
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" className="text-sm fill-gray-700">
          Value
        </text>
        <text 
          x={15} 
          y={height / 2} 
          textAnchor="middle" 
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-sm fill-gray-700"
        >
          Frequency
        </text>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" className="text-lg font-medium fill-gray-900">
          Distribution Histogram
        </text>
      </svg>
    );
  }, [histogramData, config, result, normalCurveData]);

  // Generate SVG box plot
  const renderBoxPlot = useCallback(() => {
    if (!boxPlotData) return null;

    const width = config.width || 600;
    const height = config.height || 200;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const dataRange = boxPlotData.max - boxPlotData.min;
    const xScale = (value: number) => ((value - boxPlotData.min) / dataRange) * chartWidth;
    const boxHeight = chartHeight * 0.4;
    const boxY = (chartHeight - boxHeight) / 2;

    return (
      <svg width={width} height={height} className="border border-gray-200 rounded">
        {/* Background */}
        <rect width={width} height={height} fill="#ffffff" />
        
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Whiskers */}
          <line
            x1={xScale(boxPlotData.min)}
            y1={chartHeight / 2}
            x2={xScale(boxPlotData.q1)}
            y2={chartHeight / 2}
            stroke="#374151"
            strokeWidth={2}
          />
          <line
            x1={xScale(boxPlotData.q3)}
            y1={chartHeight / 2}
            x2={xScale(boxPlotData.max)}
            y2={chartHeight / 2}
            stroke="#374151"
            strokeWidth={2}
          />
          
          {/* Whisker caps */}
          <line
            x1={xScale(boxPlotData.min)}
            y1={boxY}
            x2={xScale(boxPlotData.min)}
            y2={boxY + boxHeight}
            stroke="#374151"
            strokeWidth={2}
          />
          <line
            x1={xScale(boxPlotData.max)}
            y1={boxY}
            x2={xScale(boxPlotData.max)}
            y2={boxY + boxHeight}
            stroke="#374151"
            strokeWidth={2}
          />
          
          {/* Box */}
          <rect
            x={xScale(boxPlotData.q1)}
            y={boxY}
            width={xScale(boxPlotData.q3) - xScale(boxPlotData.q1)}
            height={boxHeight}
            fill="#3b82f6"
            fillOpacity={0.3}
            stroke="#1d4ed8"
            strokeWidth={2}
          />
          
          {/* Median line */}
          <line
            x1={xScale(boxPlotData.median)}
            y1={boxY}
            x2={xScale(boxPlotData.median)}
            y2={boxY + boxHeight}
            stroke="#1d4ed8"
            strokeWidth={3}
          />
          
          {/* Mean point */}
          {config.showMean && (
            <circle
              cx={xScale(boxPlotData.mean)}
              cy={chartHeight / 2}
              r={4}
              fill="#ef4444"
              stroke="#dc2626"
              strokeWidth={2}
            />
          )}
          
          {/* Outliers */}
          {config.showOutliers && boxPlotData.outliers.map((outlier, index) => (
            <circle
              key={index}
              cx={xScale(outlier)}
              cy={chartHeight / 2}
              r={3}
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth={1}
            />
          ))}
          
          {/* X-axis */}
          <line x1={0} y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="#374151" strokeWidth={1} />
          
          {/* Scale markers */}
          {[boxPlotData.min, boxPlotData.q1, boxPlotData.median, boxPlotData.q3, boxPlotData.max].map((value, index) => (
            <g key={index}>
              <line
                x1={xScale(value)}
                y1={chartHeight - 15}
                x2={xScale(value)}
                y2={chartHeight - 5}
                stroke="#374151"
                strokeWidth={1}
              />
              <text
                x={xScale(value)}
                y={chartHeight + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {value.toFixed(1)}
              </text>
            </g>
          ))}
        </g>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" className="text-lg font-medium fill-gray-900">
          Box Plot
        </text>
        
        {/* Legend */}
        <g transform={`translate(20, ${height - 40})`}>
          <circle cx={5} cy={5} r={3} fill="#ef4444" />
          <text x={15} y={9} className="text-xs fill-gray-700">Mean</text>
          <circle cx={60} cy={5} r={3} fill="#f59e0b" />
          <text x={70} y={9} className="text-xs fill-gray-700">Outliers</text>
        </g>
      </svg>
    );
  }, [boxPlotData, config]);

  // Export visualization
  const exportVisualization = useCallback(async () => {
    setIsGenerating(true);
    try {
      // In a real implementation, you would generate and download the chart
      // For now, we'll just simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a temporary canvas to export
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = config.width || 600;
        canvas.height = config.height || 300;
        
        // Draw a simple placeholder
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#374151';
        ctx.font = '16px Arial';
        ctx.fillText('Statistical Visualization Export', 20, 30);
        
        // Download
        const link = document.createElement('a');
        link.download = `statistical-chart-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } finally {
      setIsGenerating(false);
    }
  }, [config]);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Statistical Visualization</h3>
          <p className="text-sm text-gray-600">
            Visual representation of your data distribution and key statistics
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </button>
          <button
            onClick={exportVisualization}
            disabled={isGenerating}
            className="flex items-center px-3 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-1" />
            )}
            Export
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Visualization Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Type
              </label>
              <select
                value={config.chartType}
                onChange={(e) => onConfigChange({ 
                  ...config, 
                  chartType: e.target.value as any 
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="histogram">Histogram</option>
                <option value="boxplot">Box Plot</option>
                <option value="scatter">Scatter Plot</option>
                <option value="qq">Q-Q Plot</option>
              </select>
            </div>
            
            {config.chartType === 'histogram' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Bins
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  value={config.bins || 10}
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    bins: parseInt(e.target.value) || 10
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chart Width
              </label>
              <input
                type="number"
                min="300"
                max="1200"
                step="50"
                value={config.width || 600}
                onChange={(e) => onConfigChange({ 
                  ...config, 
                  width: parseInt(e.target.value) || 600
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: 'showMean', label: 'Show Mean' },
              { key: 'showMedian', label: 'Show Median' },
              { key: 'showOutliers', label: 'Show Outliers' },
              { key: 'showNormalCurve', label: 'Normal Curve Overlay' }
            ].map(option => (
              <label key={option.key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={config[option.key as keyof StatisticalVisualizationConfig] as boolean}
                  onChange={(e) => onConfigChange({ 
                    ...config, 
                    [option.key]: e.target.checked
                  })}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Chart Display */}
      <div className="mb-6">
        <div className="flex justify-center">
          {config.chartType === 'histogram' && renderHistogram()}
          {config.chartType === 'boxplot' && renderBoxPlot()}
          {(config.chartType === 'scatter' || config.chartType === 'qq') && (
            <div className="w-full h-64 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p>Chart type "{config.chartType}" coming soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Statistical Interpretation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">
          {userMode === 'student' && 'Visual Learning'}
          {userMode === 'research' && 'Data Interpretation'}
          {userMode === 'teacher' && 'Teaching Points'}
        </h4>
        <div className="text-sm text-blue-800 space-y-2">
          {config.chartType === 'histogram' && (
            <>
              <p>
                The histogram shows how your data is distributed. Each bar represents how many values fall within that range.
              </p>
              {result && (
                <div className="mt-2">
                  <strong>Key observations:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Distribution shape: {result.distributionType || 'Mixed'}</li>
                    <li>Most common range: Around {result.median.toFixed(1)}</li>
                    {result.skewness && Math.abs(result.skewness) > 0.5 && (
                      <li>The data is {result.skewness > 0 ? 'right' : 'left'}-skewed</li>
                    )}
                    {result.outliers.length > 0 && (
                      <li>{result.outliers.length} outlier(s) detected</li>
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
          
          {config.chartType === 'boxplot' && (
            <>
              <p>
                The box plot shows the five-number summary and highlights outliers. The box represents the middle 50% of your data.
              </p>
              {result && (
                <div className="mt-2">
                  <strong>Reading the box plot:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Left whisker to box: Bottom 25% of data</li>
                    <li>Box: Middle 50% (interquartile range)</li>
                    <li>Line in box: Median (50th percentile)</li>
                    <li>Red dot: Mean (average)</li>
                    <li>Orange dots: Outliers</li>
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticalVisualization;