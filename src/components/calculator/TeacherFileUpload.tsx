/**
 * Teacher-focused file upload component for Excel/CSV data processing
 * Supports gradebooks, attendance sheets, and batch data processing
 */

'use client'

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload,
  FileText,
  Table,
  AlertCircle,
  CheckCircle,
  Users,
  BarChart3,
  Settings,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  Zap,
  Info,
  Target
} from 'lucide-react';
import AdvancedExcelParser, { 
  ParsedExcelData, 
  TeacherDataFormat, 
  ExcelSheet,
  ExcelParseOptions 
} from '@/lib/excel-advanced-parser';

export interface TeacherFileUploadProps {
  onDataExtracted: (data: number[], metadata?: any) => void;
  onMultipleDataSets?: (datasets: Array<{ name: string; data: number[]; metadata?: any }>) => void;
  maxFileSize?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
  enableBatchProcessing?: boolean;
  className?: string;
}

const TeacherFileUpload: React.FC<TeacherFileUploadProps> = ({
  onDataExtracted,
  onMultipleDataSets,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFormats = ['.xlsx', '.xls', '.csv'],
  showPreview = true,
  enableBatchProcessing = true,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [parseOptions, setParseOptions] = useState<ExcelParseOptions>({
    headerRow: 0,
    skipEmptyRows: true,
    detectDataTypes: true
  });
  const [teacherFormat, setTeacherFormat] = useState<TeacherDataFormat | null>(null);
  const [previewMode, setPreviewMode] = useState<'grid' | 'analysis'>('grid');
  const [selectedColumns, setSelectedColumns] = useState<number[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setParsedData(null);
    setTeacherFormat(null);

    try {
      // Validate file size
      if (file.size > maxFileSize) {
        throw new Error(`File too large. Maximum size is ${maxFileSize / 1024 / 1024}MB`);
      }

      // Parse the file
      const parsed = await AdvancedExcelParser.parseFile(file, parseOptions);
      setParsedData(parsed);
      
      // Auto-select best sheet
      if (parsed.selectedSheet) {
        setSelectedSheet(parsed.selectedSheet.name);
        
        // Analyze teacher data format
        const format = AdvancedExcelParser.analyzeTeacherData(parsed.selectedSheet);
        setTeacherFormat(format);
        
        // Auto-select data columns
        setSelectedColumns(format.structure.dataColumns);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtractData = (extractionType: 'simple' | 'grades' | 'batch') => {
    if (!parsedData || !parsedData.selectedSheet) return;

    try {
      switch (extractionType) {
        case 'simple':
          onDataExtracted(parsedData.numbers, {
            source: 'excel',
            sheet: selectedSheet,
            totalRows: parsedData.selectedSheet.rowCount,
            warnings: parsedData.metadata.warnings
          });
          break;

        case 'grades':
          if (selectedColumns.length === 0) {
            setError('Please select at least one column to extract grades from');
            return;
          }
          
          const gradeResult = AdvancedExcelParser.extractGrades(
            parsedData.selectedSheet,
            selectedColumns[0],
            {
              skipStudentNames: false,
              convertToPercentage: false
            }
          );
          
          onDataExtracted(gradeResult.grades, {
            source: 'gradebook',
            statistics: gradeResult.statistics,
            studentNames: gradeResult.studentNames,
            assignment: `Column ${selectedColumns[0] + 1}`
          });
          break;

        case 'batch':
          if (!onMultipleDataSets) {
            setError('Batch processing not supported in this context');
            return;
          }

          const batchResult = AdvancedExcelParser.batchProcessGradebook(
            parsedData.selectedSheet,
            selectedColumns,
            {
              assignmentNames: selectedColumns.map((_, i) => `Assignment ${i + 1}`)
            }
          );

          const datasets = batchResult.assignments.map(assignment => ({
            name: assignment.name,
            data: assignment.grades,
            metadata: {
              source: 'gradebook_batch',
              statistics: assignment.statistics
            }
          }));

          onMultipleDataSets(datasets);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract data');
    }
  };

  const renderFileInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        File Information
      </h3>
      <div className="text-sm text-blue-800 space-y-1">
        <div className="flex justify-between">
          <span>Sheets:</span>
          <span>{parsedData?.metadata.totalSheets}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Rows:</span>
          <span>{parsedData?.metadata.totalRows.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Parse Time:</span>
          <span>{parsedData?.metadata.parseTime.toFixed(0)}ms</span>
        </div>
        {parsedData?.metadata.warnings.length > 0 && (
          <div className="mt-2">
            <span className="font-medium">Warnings:</span>
            <ul className="list-disc list-inside mt-1">
              {parsedData.metadata.warnings.map((warning, index) => (
                <li key={index} className="text-xs">{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const renderTeacherFormatAnalysis = () => {
    if (!teacherFormat) return null;

    const getFormatIcon = () => {
      switch (teacherFormat.type) {
        case 'grades': return <BarChart3 className="h-5 w-5 text-green-600" />;
        case 'attendance': return <Calendar className="h-5 w-5 text-blue-600" />;
        case 'scores': return <TrendingUp className="h-5 w-5 text-purple-600" />;
        default: return <Table className="h-5 w-5 text-gray-600" />;
      }
    };

    const getFormatColor = () => {
      switch (teacherFormat.type) {
        case 'grades': return 'green';
        case 'attendance': return 'blue';
        case 'scores': return 'purple';
        default: return 'gray';
      }
    };

    const color = getFormatColor();

    return (
      <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-4`}>
        <h3 className={`text-sm font-medium text-${color}-900 mb-3 flex items-center`}>
          {getFormatIcon()}
          <span className="ml-2">Data Format Analysis</span>
        </h3>
        
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={`text-${color}-700 font-medium`}>Type:</span>
              <span className={`ml-2 text-${color}-800 capitalize`}>{teacherFormat.type}</span>
            </div>
            <div>
              <span className={`text-${color}-700 font-medium`}>Headers:</span>
              <span className={`ml-2 text-${color}-800`}>
                {teacherFormat.structure.hasHeaders ? 'Detected' : 'None'}
              </span>
            </div>
          </div>

          <div>
            <span className={`text-${color}-700 font-medium text-sm`}>Suggestions:</span>
            <div className={`mt-1 text-xs text-${color}-800 space-y-1`}>
              <div>• Use column {teacherFormat.suggestions.columnToUse + 1} for primary data</div>
              <div>• Data range: {teacherFormat.suggestions.dataRange}</div>
              <div>• Expected format: {teacherFormat.suggestions.expectedFormat}</div>
            </div>
          </div>

          {teacherFormat.structure.dataColumns.length > 1 && enableBatchProcessing && (
            <div className={`mt-3 p-2 bg-${color}-100 rounded text-xs text-${color}-800`}>
              <strong>Batch Processing Available:</strong> Found {teacherFormat.structure.dataColumns.length} data columns. 
              You can process multiple assignments at once.
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderDataPreview = () => {
    const sheet = parsedData?.sheets.find(s => s.name === selectedSheet);
    if (!sheet) return null;

    const maxPreviewRows = 10;
    const maxPreviewCols = 6;
    const previewData = sheet.data.slice(0, maxPreviewRows);

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 flex items-center">
            <Eye className="h-4 w-4 mr-1" />
            Data Preview
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewMode(previewMode === 'grid' ? 'analysis' : 'grid')}
              className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                previewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {previewMode === 'grid' ? 'Show Analysis' : 'Show Grid'}
            </button>
          </div>
        </div>

        {previewMode === 'grid' ? (
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  {sheet.headers?.slice(0, maxPreviewCols).map((header, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-gray-900 border-b">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedColumns.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedColumns([...selectedColumns, index]);
                            } else {
                              setSelectedColumns(selectedColumns.filter(col => col !== index));
                            }
                          }}
                          className="mr-2 h-3 w-3"
                        />
                        {header || `Col ${index + 1}`}
                      </div>
                    </th>
                  )) || Array(maxPreviewCols).fill(0).map((_, index) => (
                    <th key={index} className="px-3 py-2 text-left font-medium text-gray-900 border-b">
                      Col {index + 1}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.slice(0, maxPreviewCols).map((cell, colIndex) => (
                      <td key={colIndex} className="px-3 py-2 border-b border-gray-200">
                        {cell === null || cell === undefined ? (
                          <span className="text-gray-400 italic">empty</span>
                        ) : (
                          String(cell).substring(0, 50)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {sheet.rowCount > maxPreviewRows && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Showing {maxPreviewRows} of {sheet.rowCount} rows
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{sheet.rowCount}</div>
                <div className="text-xs text-gray-600">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{sheet.columnCount}</div>
                <div className="text-xs text-gray-600">Columns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {teacherFormat?.structure.dataColumns.length || 0}
                </div>
                <div className="text-xs text-gray-600">Data Columns</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {parsedData?.numbers.length || 0}
                </div>
                <div className="text-xs text-gray-600">Numeric Values</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={() => handleExtractData('simple')}
          className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={!parsedData}
        >
          <Target className="h-4 w-4 mr-2" />
          Extract All Numbers
        </button>

        <button
          onClick={() => handleExtractData('grades')}
          className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          disabled={!parsedData || selectedColumns.length === 0}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Extract as Grades
        </button>

        {enableBatchProcessing && onMultipleDataSets && (
          <button
            onClick={() => handleExtractData('batch')}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            disabled={!parsedData || selectedColumns.length < 2}
          >
            <Users className="h-4 w-4 mr-2" />
            Batch Process
          </button>
        )}
      </div>

      {selectedColumns.length > 0 && (
        <div className="text-sm text-gray-600 text-center">
          Selected columns: {selectedColumns.map(col => col + 1).join(', ')}
        </div>
      )}
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Upload Zone */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        {isProcessing ? (
          <div className="space-y-4">
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            <div>
              <p className="text-lg font-medium text-gray-900">Processing file...</p>
              <p className="text-sm text-gray-600">This may take a moment for large files</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your Excel or CSV file here
              </p>
              <p className="text-sm text-gray-600 mt-1">
                or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse to upload
                </button>
              </p>
            </div>
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>Supports: {acceptedFormats.join(', ')}</span>
              <span>•</span>
              <span>Max: {maxFileSize / 1024 / 1024}MB</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Upload Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success and Data Analysis */}
      {parsedData && (
        <div className="space-y-6">
          {/* Sheet Selection */}
          {parsedData.sheets.length > 1 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Sheet to Process:
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => {
                  setSelectedSheet(e.target.value);
                  const sheet = parsedData.sheets.find(s => s.name === e.target.value);
                  if (sheet) {
                    const format = AdvancedExcelParser.analyzeTeacherData(sheet);
                    setTeacherFormat(format);
                    setSelectedColumns(format.structure.dataColumns);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {parsedData.sheets.map(sheet => (
                  <option key={sheet.name} value={sheet.name}>
                    {sheet.name} ({sheet.rowCount} rows)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              {renderFileInfo()}
              {renderTeacherFormatAnalysis()}
            </div>

            <div className="lg:col-span-2 space-y-4">
              {showPreview && renderDataPreview()}
              {renderActionButtons()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherFileUpload;