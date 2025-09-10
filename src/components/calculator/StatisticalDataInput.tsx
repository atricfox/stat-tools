/**
 * Statistical Data Input Component
 * Multi-format data input with CSV, JSON, and manual entry support
 * Features validation, batch processing, and educational guidance
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, 
  Plus, 
  Trash2, 
  FileText, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Copy,
  RefreshCw
} from 'lucide-react';
import { 
  DataPoint, 
  StatisticalDataInputMode,
  StatisticalDataInputConfig,
  BatchProcessingOptions,
  DataValidationResult
} from '@/types/standardDeviation';

interface StatisticalDataInputProps {
  dataPoints: DataPoint[];
  onDataPointsChange: (dataPoints: DataPoint[]) => void;
  inputMode: StatisticalDataInputMode | StatisticalDataInputConfig;
  onInputModeChange: (mode: any) => void;
  userMode: 'student' | 'research' | 'teacher';
  maxDataPoints?: number;
  enableBatchProcessing?: boolean;
  onBatchProcess?: (file: File, options: BatchProcessingOptions) => void;
  isProcessing?: boolean;
  processingProgress?: number;
  validationResult?: DataValidationResult;
}

const StatisticalDataInput: React.FC<StatisticalDataInputProps> = ({
  dataPoints = [],
  onDataPointsChange,
  inputMode,
  onInputModeChange,
  userMode,
  maxDataPoints = 1000,
  enableBatchProcessing = false,
  onBatchProcess,
  isProcessing = false,
  processingProgress = 0,
  validationResult
}) => {
  const [newValue, setNewValue] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [csvData, setCsvData] = useState('');
  const [jsonData, setJsonData] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add individual data point
  const addDataPoint = useCallback(() => {
    const value = parseFloat(newValue);
    if (isNaN(value)) {
      return;
    }

    if (dataPoints.length >= maxDataPoints) {
      return;
    }

    const newPoint: DataPoint = {
      id: `point-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      value,
      label: newLabel || `Data Point ${dataPoints.length + 1}`
    };

    onDataPointsChange([...dataPoints, newPoint]);
    setNewValue('');
    setNewLabel('');
  }, [newValue, newLabel, dataPoints, maxDataPoints, onDataPointsChange]);

  // Remove data point
  const removeDataPoint = useCallback((id: string) => {
    onDataPointsChange(dataPoints.filter(point => point.id !== id));
  }, [dataPoints, onDataPointsChange]);

  // Update data point
  const updateDataPoint = useCallback((id: string, field: keyof DataPoint, value: any) => {
    onDataPointsChange(
      dataPoints.map(point => 
        point.id === id 
          ? { ...point, [field]: field === 'value' ? parseFloat(value) || 0 : value }
          : point
      )
    );
  }, [dataPoints, onDataPointsChange]);

  // Toggle data point exclusion
  const toggleExcluded = useCallback((id: string) => {
    updateDataPoint(id, 'excluded', !dataPoints.find(p => p.id === id)?.excluded);
  }, [dataPoints, updateDataPoint]);

  // Parse CSV data
  const parseCsvData = useCallback(() => {
    if (!csvData.trim()) return;

    const lines = csvData.trim().split('\n');
    const hasHeaders = (inputMode as any).hasHeaders && lines.length > 1;
    const dataLines = hasHeaders ? lines.slice(1) : lines;
    
    const newPoints: DataPoint[] = [];
    
    dataLines.forEach((line, rowIndex) => {
      const values = line.split(((inputMode as any).delimiter || ',')).map(v => v.trim());
      
      if ((inputMode as any).columnMapping) {
        const { value: valueCol, label: labelCol } = (inputMode as any).columnMapping;
        
        if (valueCol < values.length) {
          const value = parseFloat(values[valueCol]);
          if (!isNaN(value)) {
            newPoints.push({
              id: `csv-${rowIndex}-${Date.now()}`,
              value,
              label: labelCol !== undefined && labelCol < values.length 
                ? values[labelCol] 
                : `Row ${rowIndex + 1}`
            });
          }
        }
      } else {
        // Auto-detect: first column as value, second as label
        const value = parseFloat(values[0]);
        if (!isNaN(value)) {
          newPoints.push({
            id: `csv-${rowIndex}-${Date.now()}`,
            value,
            label: values.length > 1 ? values[1] : `Row ${rowIndex + 1}`
          });
        }
      }
    });

    onDataPointsChange([...dataPoints, ...newPoints.slice(0, maxDataPoints - dataPoints.length)]);
    setCsvData('');
  }, [csvData, inputMode, dataPoints, maxDataPoints, onDataPointsChange]);

  // Parse JSON data
  const parseJsonData = useCallback(() => {
    if (!jsonData.trim()) return;

    try {
      const parsed = JSON.parse(jsonData);
      const newPoints: DataPoint[] = [];

      if (Array.isArray(parsed)) {
        parsed.forEach((item, index) => {
          if (typeof item === 'number') {
            newPoints.push({
              id: `json-${index}-${Date.now()}`,
              value: item,
              label: `Item ${index + 1}`
            });
          } else if (typeof item === 'object' && item.value !== undefined) {
            const value = parseFloat(item.value);
            if (!isNaN(value)) {
              newPoints.push({
                id: item.id || `json-${index}-${Date.now()}`,
                value,
                label: item.label || `Item ${index + 1}`,
                weight: item.weight ? parseFloat(item.weight) : undefined
              });
            }
          }
        });
      }

      onDataPointsChange([...dataPoints, ...newPoints.slice(0, maxDataPoints - dataPoints.length)]);
      setJsonData('');
    } catch (error) {
      console.error('Invalid JSON format:', error);
    }
  }, [jsonData, dataPoints, maxDataPoints, onDataPointsChange]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    if (!enableBatchProcessing || !onBatchProcess) {
      return;
    }

    const options: BatchProcessingOptions = {
      chunkSize: 100,
      enableProgressTracking: true,
      maxRecords: maxDataPoints,
      validationRules: {
        allowNegative: true,
        requireLabels: false
      }
    };

    onBatchProcess(file, options);
  }, [enableBatchProcessing, onBatchProcess, maxDataPoints]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type === 'text/csv' || file.type === 'application/json')) {
      handleFileUpload(file);
    }
  }, [handleFileUpload]);

  // Generate sample data for educational purposes
  const generateSampleData = useCallback(() => {
    const sampleSets = {
      student: [
        { value: 85, label: 'Math Exam 1' },
        { value: 78, label: 'Math Exam 2' },
        { value: 92, label: 'Math Exam 3' },
        { value: 88, label: 'Math Final' },
        { value: 79, label: 'Math Quiz Average' }
      ],
      research: [
        { value: 12.5, label: 'Sample A' },
        { value: 14.2, label: 'Sample B' },
        { value: 11.8, label: 'Sample C' },
        { value: 13.6, label: 'Sample D' },
        { value: 15.1, label: 'Sample E' },
        { value: 12.9, label: 'Sample F' }
      ],
      teacher: [
        { value: 82, label: 'Student 1' },
        { value: 76, label: 'Student 2' },
        { value: 91, label: 'Student 3' },
        { value: 87, label: 'Student 4' },
        { value: 73, label: 'Student 5' },
        { value: 94, label: 'Student 6' },
        { value: 79, label: 'Student 7' },
        { value: 85, label: 'Student 8' }
      ]
    };

    const sampleData = sampleSets[userMode] || sampleSets.student;
    const newPoints: DataPoint[] = sampleData.map((item, index) => ({
      id: `sample-${index}-${Date.now()}`,
      value: item.value,
      label: item.label
    }));

    onDataPointsChange(newPoints);
  }, [userMode, onDataPointsChange]);

  // Export data
  const exportData = useCallback((format: 'csv' | 'json') => {
    if (dataPoints.length === 0) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      const header = 'Value,Label,Excluded';
      const rows = dataPoints.map(point => 
        `${point.value},"${point.label || ''}",${point.excluded || false}`
      );
      content = [header, ...rows].join('\n');
      filename = 'statistical_data.csv';
      mimeType = 'text/csv';
    } else {
      content = JSON.stringify(dataPoints, null, 2);
      filename = 'statistical_data.json';
      mimeType = 'application/json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [dataPoints]);

  const validDataPointsCount = dataPoints.filter(p => !p.excluded).length;
  const hasValidationErrors = validationResult && !validationResult.isValid;
  const hasValidationWarnings = validationResult && validationResult.warnings.length > 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Input</h3>
        <p className="text-sm text-gray-600">
          Enter your data points for statistical analysis. You can add data manually, paste CSV data, or upload files.
        </p>
      </div>

      {/* Input Mode Selection */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => onInputModeChange({ type: 'manual' })}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              (inputMode as any).type === 'manual'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Manual Entry
          </button>
          <button
            onClick={() => onInputModeChange({ type: 'csv', delimiter: ',', hasHeaders: false })}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              (inputMode as any).type === 'csv'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            CSV Data
          </button>
          <button
            onClick={() => onInputModeChange({ type: 'json' })}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              (inputMode as any).type === 'json'
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            JSON Data
          </button>
          {enableBatchProcessing && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                isProcessing
                  ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Upload className="w-4 h-4 inline mr-2" />
              Upload File
            </button>
          )}
        </div>
      </div>

      {/* Manual Entry */}
      {(inputMode as any).type === 'manual' && (
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value *
              </label>
              <input
                type="number"
                step="any"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDataPoint()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter numeric value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Label (optional)
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDataPoint()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Description or label"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addDataPoint}
                disabled={!newValue || isNaN(parseFloat(newValue)) || dataPoints.length >= maxDataPoints}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Data Point
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Input */}
      {(inputMode as any).type === 'csv' && (
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV Data
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="value1,label1&#10;value2,label2&#10;value3,label3"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delimiter
              </label>
              <select
                value={(inputMode as any).delimiter || ','}
                onChange={(e) => onInputModeChange({ ...(inputMode as any), delimiter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={(inputMode as any).hasHeaders || false}
                onChange={(e) => onInputModeChange({ ...(inputMode as any), hasHeaders: e.target.checked })}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">First row contains headers</label>
            </div>
            <div className="flex items-end">
              <button
                onClick={parseCsvData}
                disabled={!csvData.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Parse CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Input */}
      {(inputMode as any).type === 'json' && (
        <div className="mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              JSON Data
            </label>
            <textarea
              value={jsonData}
              onChange={(e) => setJsonData(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder='[{"value": 10.5, "label": "Sample 1"}, {"value": 12.3, "label": "Sample 2"}]'
            />
          </div>
          <button
            onClick={parseJsonData}
            disabled={!jsonData.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Parse JSON
          </button>
        </div>
      )}

      {/* File Upload (Hidden Input) */}
      {enableBatchProcessing && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="hidden"
        />
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Processing file...</span>
            <span>{processingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${processingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Validation Results */}
      {hasValidationErrors && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center text-red-800 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="font-medium">Validation Errors</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {validationResult!.errors.map((error, index) => (
              <li key={index}>Row {error.row}: {error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {hasValidationWarnings && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center text-yellow-800 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" />
            <span className="font-medium">Validation Warnings</span>
          </div>
          <ul className="text-sm text-yellow-700 space-y-1">
            {validationResult!.warnings.map((warning, index) => (
              <li key={index}>Row {warning.row}: {warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Points Summary */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-gray-700">
            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
            <span className="font-medium">
              {validDataPointsCount} valid data points
              {dataPoints.length !== validDataPointsCount && 
                ` (${dataPoints.length - validDataPointsCount} excluded)`
              }
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={generateSampleData}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              Load Sample Data
            </button>
            {dataPoints.length > 0 && (
              <>
                <button
                  onClick={() => exportData('csv')}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Export CSV
                </button>
                <button
                  onClick={() => exportData('json')}
                  className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => onDataPointsChange([])}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Data Points List */}
      {dataPoints.length > 0 && (
        <div className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {dataPoints.map((point, index) => (
              <div
                key={point.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  point.excluded 
                    ? 'bg-red-50 border-red-200 opacity-60' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
                  <input
                    type="number"
                    step="any"
                    value={point.value}
                    onChange={(e) => updateDataPoint(point.id, 'value', e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={point.label || ''}
                    onChange={(e) => updateDataPoint(point.id, 'label', e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Label"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleExcluded(point.id)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      point.excluded
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {point.excluded ? 'Excluded' : 'Included'}
                  </button>
                  <button
                    onClick={() => removeDataPoint(point.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Educational Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">
          {userMode === 'student' && 'Study Tip'}
          {userMode === 'research' && 'Research Note'}
          {userMode === 'teacher' && 'Teaching Point'}
        </h4>
        <p className="text-sm text-blue-800">
          {userMode === 'student' && 
            'Standard deviation measures how spread out your data points are from the average. More spread = higher standard deviation!'
          }
          {userMode === 'research' && 
            'Ensure your sample size is adequate for meaningful results. Consider outliers carefully - they may represent important phenomena.'
          }
          {userMode === 'teacher' && 
            'Use the batch processing feature to analyze entire classes quickly. Export results for grade book integration.'
          }
        </p>
      </div>
    </div>
  );
};

export default StatisticalDataInput;
