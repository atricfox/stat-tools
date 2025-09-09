/**
 * Enhanced data input component for statistical calculators
 * Supports multiple formats, real-time validation, and advanced parsing
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileSpreadsheet, HelpCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { parseMultiFormatInput, parseEducationalData, parseScientificData, ParseResult } from '@/lib/parsers';
import { validationHelpers, ValidationResult } from '@/lib/validation';
import { formatDataSummary, formatValidationMessage } from '@/lib/formatters';

export interface DataInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  context?: 'student' | 'research' | 'teacher';
  maxLength?: number;
  className?: string;
  onValidation?: (isValid: boolean, result: ParseResult) => void;
}

const DataInput: React.FC<DataInputProps> = ({
  value,
  onChange,
  placeholder = "Enter your numbers...",
  label = "Data Input",
  context = 'student',
  maxLength = 50000,
  className = '',
  onValidation
}) => {
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showFormatHelp, setShowFormatHelp] = useState(false);

  // Context-specific configurations
  const contextConfig = {
    student: {
      placeholder: "Enter your exam scores, homework grades, or assignment points\nExample: 85, 92, 78, 96, 88, 91, 83, 89",
      helpText: "Perfect for calculating test averages and course grades",
      parseFunction: parseEducationalData
    },
    research: {
      placeholder: "Enter your research data, measurements, or experimental results\nExample: 1.23e-4, 5.67e+2, 890.12, 3.45e-3",
      helpText: "Supports scientific notation and high-precision data",
      parseFunction: parseScientificData
    },
    teacher: {
      placeholder: "Paste student grades from spreadsheets or enter manually\nExample: Copy from Excel: Student1\t85\t92\nStudent2\t78\t88",
      helpText: "Optimized for batch processing and spreadsheet data",
      parseFunction: parseEducationalData
    }
  };

  const config = contextConfig[context];

  // Parse and validate input
  const processInput = useCallback((inputText: string) => {
    if (!inputText || !inputText.trim()) {
      setParseResult(null);
      setValidationResult(null);
      onValidation?.(true, {
        validNumbers: [],
        invalidEntries: [],
        metadata: { totalEntries: 0, formatDetected: 'empty', duplicates: [] }
      });
      return;
    }

    // Parse using context-appropriate parser
    let parseResult: ParseResult;
    if (context === 'research') {
      parseResult = parseScientificData(inputText);
    } else {
      parseResult = parseEducationalData(inputText);
    }

    // Additional validation
    const validation = validationHelpers.validateInput(inputText);
    
    setParseResult(parseResult);
    setValidationResult(validation);
    onValidation?.(validation.success, parseResult);
  }, [context, onValidation]);

  // Real-time processing
  useEffect(() => {
    const timeoutId = setTimeout(() => processInput(value || ''), 300);
    return () => clearTimeout(timeoutId);
  }, [value, processInput]);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.includes('text') || file.type.includes('csv'))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onChange(content);
      };
      reader.readAsText(file);
    }
  }, [onChange]);

  // Handle paste (Excel data detection)
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData('text');
    
    // Detect if it's likely Excel data (contains tabs)
    if (pastedData.includes('\t')) {
      // Add a brief visual indicator for Excel data
      setTimeout(() => {
        processInput(pastedData);
      }, 100);
    }
  }, [processInput]);

  // Load example data based on context
  const loadExample = useCallback(() => {
    const examples = {
      student: '85, 92, 78, 96, 88, 91, 83, 89, 87, 94',
      research: '1.23e-4, 5.67e+2, 890.12, 3.45e-3, 2.11e+1, 9.87e-2',
      teacher: `Student 1	85	90	88
Student 2	92	87	91  
Student 3	78	82	79
Student 4	96	94	98`
    };
    onChange(examples[context]);
  }, [context, onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Label and Help */}
      <div className="flex items-center justify-between">
        <label htmlFor="data-input" className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <button
          onClick={() => setShowFormatHelp(!showFormatHelp)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <HelpCircle className="h-4 w-4 mr-1" />
          Format Help
        </button>
      </div>

      {/* Format Help Panel */}
      {showFormatHelp && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Supported Input Formats</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-800 mb-1">Separators</div>
              <ul className="text-blue-700 space-y-1">
                <li>• Commas: 1, 2, 3, 4</li>
                <li>• Spaces: 1 2 3 4</li>
                <li>• New lines (one per line)</li>
                <li>• Tabs (Excel paste)</li>
              </ul>
            </div>
            <div>
              <div className="font-medium text-blue-800 mb-1">Number Formats</div>
              <ul className="text-blue-700 space-y-1">
                <li>• Decimals: 3.14, -2.5</li>
                <li>• Scientific: 1.23e-4</li>
                <li>• Percentages: 50%</li>
                <li>• Fractions: 3/4</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        <textarea
          id="data-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          placeholder={config.placeholder}
          className={`w-full h-40 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors ${
            isDragOver 
              ? 'border-blue-400 bg-blue-50' 
              : validationResult?.success === false 
                ? 'border-red-300' 
                : 'border-gray-300'
          }`}
          maxLength={maxLength}
        />
        
        {/* Character counter */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {(value || '').length}/{maxLength}
        </div>

        {/* Drag overlay */}
        {isDragOver && (
          <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
              <Upload className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">Drop your file here</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={loadExample}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Load Example
        </button>
        {context === 'teacher' && (
          <div className="flex items-center px-3 py-1.5 text-sm text-gray-600 bg-gray-50 rounded-md">
            <FileSpreadsheet className="h-4 w-4 mr-1" />
            Excel paste supported
          </div>
        )}
        <div className="flex items-center px-3 py-1.5 text-sm text-gray-600">
          <Info className="h-4 w-4 mr-1" />
          {config.helpText}
        </div>
      </div>

      {/* Validation Status */}
      {value && validationResult && (
        <div className="space-y-2">
          {/* Success/Error Status */}
          <div className="flex items-start space-x-2">
            {validationResult.success ? (
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              {parseResult && (
                <div className="text-sm">
                  {formatDataSummary(
                    parseResult.validNumbers.length,
                    parseResult.invalidEntries.length,
                    parseResult.metadata.formatDetected,
                    parseResult.metadata.duplicates.length
                  ).map((summary, index) => (
                    <div key={index} className={
                      summary.startsWith('✓') ? 'text-green-600' :
                      summary.startsWith('⚠') ? 'text-yellow-600' :
                      'text-blue-600'
                    }>
                      {summary}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Messages */}
          {validationResult.errors.map((error, index) => (
            <div key={`error-${index}`} className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-600">{error.message}</div>
            </div>
          ))}

          {/* Warning Messages */}
          {validationResult.warnings.map((warning, index) => (
            <div key={`warning-${index}`} className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">{warning.message}</div>
            </div>
          ))}
        </div>
      )}

      {/* Context-specific features */}
      {parseResult && context === 'research' && 'researchInfo' in parseResult && parseResult.researchInfo && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="text-sm text-purple-800">
            <div className="font-medium mb-1">Research Data Analysis</div>
            {(parseResult.researchInfo as any).hasScientificNotation && (
              <div>• Scientific notation detected</div>
            )}
            {(parseResult.researchInfo as any).precisionIssues?.length > 0 && (
              <div>• Precision notes: {(parseResult.researchInfo as any).precisionIssues[0]}</div>
            )}
            <div>• Suggested precision: {(parseResult.researchInfo as any).suggestedSignificantFigures || 3} significant figures</div>
          </div>
        </div>
      )}

      {parseResult && context === 'teacher' && 'gradingInfo' in parseResult && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-800">
            <div className="font-medium mb-1">Grade Analysis</div>
            <div>• Valid grades: {parseResult.gradingInfo.validGrades.length}</div>
            {parseResult.gradingInfo.outOfRange.length > 0 && (
              <div>• Out of range: {parseResult.gradingInfo.outOfRange.length} grades</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataInput;