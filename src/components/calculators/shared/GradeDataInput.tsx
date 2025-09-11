/**
 * Grade Data Input Component
 * Handles grade item input with multiple input methods:
 * - Manual single grade entry
 * - Gradebook text pasting
 * - CSV/Excel batch import
 * - Copy-paste from spreadsheets
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { 
  Plus,
  Upload,
  ClipboardPaste,
  FileText,
  X,
  Download,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Trash2,
  RotateCcw
} from 'lucide-react';
import type { GradeItem } from '@/types/education';

interface GradeDataInputProps {
  grades: GradeItem[];
  onGradesChange: (grades: GradeItem[]) => void;
  onAddGrade: (grade: Omit<GradeItem, 'id'>) => void;
  onUpdateGrade: (gradeId: string, updates: Partial<GradeItem>) => void;
  onRemoveGrade: (gradeId: string) => void;
  onClearAll: () => void;
  maxGrades?: number;
  className?: string;
}

interface InputMode {
  type: 'manual' | 'gradebook' | 'batch' | 'csv';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const INPUT_MODES: InputMode[] = [
  {
    type: 'manual',
    label: 'Manual Entry',
    icon: Plus,
    description: 'Add grades one by one'
  },
  {
    type: 'gradebook',
    label: 'Paste Gradebook',
    icon: ClipboardPaste,
    description: 'Paste text from gradebook'
  },
  {
    type: 'batch',
    label: 'Spreadsheet',
    icon: FileText,
    description: 'Copy from Excel/Sheets'
  },
  {
    type: 'csv',
    label: 'Upload File',
    icon: Upload,
    description: 'Upload CSV/Excel file'
  }
];

export default function GradeDataInput({
  grades,
  onGradesChange,
  onAddGrade,
  onUpdateGrade,
  onRemoveGrade,
  onClearAll,
  maxGrades = 20,
  className = ''
}: GradeDataInputProps) {
  const [activeInputMode, setActiveInputMode] = useState<'manual' | 'gradebook' | 'batch' | 'csv'>('manual');
  const [gradebookText, setGradebookText] = useState('');
  const [batchText, setBatchText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [showParseResults, setShowParseResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNewGrade = useCallback(() => {
    if (grades.length >= maxGrades) {
      setParseErrors([`Maximum ${maxGrades} grade items allowed`]);
      return;
    }

    onAddGrade({
      name: '',
      score: 0,
      weight: 10,
      category: 'assignment'
    });
  }, [grades.length, maxGrades, onAddGrade]);

  const handleAddSampleGrades = useCallback(() => {
    const sampleGrades = [
      { name: 'Midterm Exam', score: 85, weight: 30, category: 'exam' as const },
      { name: 'Homework Average', score: 92, weight: 25, category: 'assignment' as const },
      { name: 'Quiz Average', score: 88, weight: 20, category: 'quiz' as const },
      { name: 'Project', score: 90, weight: 15, category: 'project' as const }
    ];

    const gradesToAdd = sampleGrades.slice(0, Math.min(4, maxGrades - grades.length));
    gradesToAdd.forEach(grade => onAddGrade(grade));
  }, [grades.length, maxGrades, onAddGrade]);

  const parseGradebookText = useCallback((text: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const parsedGrades: Omit<GradeItem, 'id'>[] = [];

    if (!text.trim()) {
      errors.push('Please enter gradebook text');
      setParseErrors(errors);
      return;
    }

    const lines = text.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try to parse different gradebook formats
      // Format 1: "Grade Name, Score, Weight"
      let match = line.match(/^(.+?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)$/i);
      
      if (!match) {
        // Format 2: "Grade Name    Score    Weight" (tab/space separated)
        match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/i);
      }
      
      if (!match) {
        // Format 3: "Score% Grade Name Weight%" (gradebook style)
        match = line.match(/^(\d+(?:\.\d+)?)%?\s+(.+?)\s+(\d+(?:\.\d+)?)%?$/i);
        if (match) {
          // Reorder to [full, name, score, weight]
          match = [match[0], match[2], match[1], match[3]];
        }
      }

      if (match) {
        const [, name, scoreStr, weightStr] = match;
        const score = parseFloat(scoreStr);
        const weight = parseFloat(weightStr);
        
        // Validate score
        if (isNaN(score) || score < 0 || score > 100) {
          warnings.push(`Line ${i + 1}: Invalid score "${scoreStr}" for "${name.trim()}"`);
          continue;
        }

        // Validate weight
        if (isNaN(weight) || weight <= 0 || weight > 100) {
          warnings.push(`Line ${i + 1}: Invalid weight "${weightStr}" for "${name.trim()}"`);
          continue;
        }

        // Determine category based on name
        const nameLower = name.toLowerCase();
        let category: GradeItem['category'] = 'assignment';
        if (nameLower.includes('exam') || nameLower.includes('test')) {
          category = 'exam';
        } else if (nameLower.includes('quiz')) {
          category = 'quiz';
        } else if (nameLower.includes('project') || nameLower.includes('paper')) {
          category = 'project';
        } else if (nameLower.includes('participation') || nameLower.includes('attendance')) {
          category = 'participation';
        }

        parsedGrades.push({
          name: name.trim(),
          score: Math.round(score * 10) / 10, // Round to 1 decimal
          weight: Math.round(weight * 10) / 10,
          category: category
        });
      } else {
        errors.push(`Line ${i + 1}: Could not parse "${line}"`);
      }
    }

    setParseErrors(errors);
    setParseWarnings(warnings);
    setShowParseResults(true);

    if (errors.length === 0 && parsedGrades.length > 0) {
      const gradesToAdd = parsedGrades.slice(0, maxGrades - grades.length);
      if (gradesToAdd.length < parsedGrades.length) {
        warnings.push(`Only adding first ${gradesToAdd.length} grades (max ${maxGrades} total)`);
        setParseWarnings(warnings);
      }
      
      gradesToAdd.forEach(grade => onAddGrade(grade));
      setGradebookText('');
      setActiveInputMode('manual');
    }
  }, [maxGrades, grades.length, onAddGrade]);

  const parseBatchText = useCallback((text: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const parsedGrades: Omit<GradeItem, 'id'>[] = [];

    if (!text.trim()) {
      errors.push('Please paste spreadsheet data');
      setParseErrors(errors);
      return;
    }

    const lines = text.split('\n').filter(line => line.trim());
    let hasHeaders = false;

    // Check if first line looks like headers
    const firstLine = lines[0]?.toLowerCase();
    if (firstLine && (
      firstLine.includes('grade') || 
      firstLine.includes('name') || 
      firstLine.includes('score') || 
      firstLine.includes('weight')
    )) {
      hasHeaders = true;
    }

    const dataLines = hasHeaders ? lines.slice(1) : lines;

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i].trim();
      if (!line) continue;

      // Split by tabs first, then by commas if no tabs
      let parts = line.split('\t');
      if (parts.length < 3) {
        parts = line.split(',');
      }

      if (parts.length < 3) {
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Expected at least 3 columns (name, score, weight)`);
        continue;
      }

      const name = parts[0]?.trim();
      const scoreStr = parts[1]?.trim();
      const weightStr = parts[2]?.trim();
      const category = parts[3]?.trim().toLowerCase() || 'assignment';

      // Validate name
      if (!name) {
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Grade name is required`);
        continue;
      }

      // Validate score
      const score = parseFloat(scoreStr);
      if (isNaN(score) || score < 0 || score > 100) {
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid score "${scoreStr}"`);
        continue;
      }

      // Validate weight
      const weight = parseFloat(weightStr);
      if (isNaN(weight) || weight <= 0 || weight > 100) {
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid weight "${weightStr}"`);
        continue;
      }

      // Determine valid category
      let validCategory: GradeItem['category'] = 'assignment';
      if (['exam', 'quiz', 'project', 'participation'].includes(category)) {
        validCategory = category as GradeItem['category'];
      }

      parsedGrades.push({
        name: name,
        score: Math.round(score * 10) / 10,
        weight: Math.round(weight * 10) / 10,
        category: validCategory
      });
    }

    setParseErrors(errors);
    setParseWarnings(warnings);
    setShowParseResults(true);

    if (errors.length === 0 && parsedGrades.length > 0) {
      const gradesToAdd = parsedGrades.slice(0, maxGrades - grades.length);
      if (gradesToAdd.length < parsedGrades.length) {
        warnings.push(`Only adding first ${gradesToAdd.length} grades (max ${maxGrades} total)`);
        setParseWarnings(warnings);
      }
      
      gradesToAdd.forEach(grade => onAddGrade(grade));
      setBatchText('');
      setActiveInputMode('manual');
    }
  }, [maxGrades, grades.length, onAddGrade]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (file.name.toLowerCase().endsWith('.csv')) {
        parseBatchText(text);
      } else {
        setParseErrors(['Only CSV files are supported for now']);
        setShowParseResults(true);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  }, [parseBatchText]);

  const exportGrades = useCallback((format: 'csv' | 'txt' = 'csv') => {
    if (grades.length === 0) return;

    let content = '';
    
    if (format === 'csv') {
      content = 'Grade Name,Score,Weight,Category\n';
      content += grades.map(grade => 
        `"${grade.name}",${grade.score},${grade.weight},"${grade.category}"`
      ).join('\n');
    } else {
      content = grades.map(grade => 
        `${grade.name}\t${grade.score}\t${grade.weight}\t${grade.category}`
      ).join('\n');
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `final_grade_items.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [grades]);

  const renderInputModeSelector = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      {INPUT_MODES.map(mode => {
        const IconComponent = mode.icon;
        const isActive = activeInputMode === mode.type;
        
        return (
          <button
            key={mode.type}
            onClick={() => setActiveInputMode(mode.type)}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <IconComponent className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div>{mode.label}</div>
              <div className="text-xs opacity-75">{mode.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderParseResults = () => {
    if (!showParseResults) return null;

    return (
      <div className="mb-4 space-y-2">
        {parseErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-red-800 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Parsing Errors</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {parseErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {parseWarnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center text-yellow-800 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Warnings</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {parseWarnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
        
        {parseErrors.length === 0 && parseWarnings.length === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center text-green-800">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Grades imported successfully!</span>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setShowParseResults(false)}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          Dismiss
        </button>
      </div>
    );
  };

  const renderInputMode = () => {
    switch (activeInputMode) {
      case 'gradebook':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Gradebook Text
              </label>
              <textarea
                value={gradebookText}
                onChange={(e) => setGradebookText(e.target.value)}
                placeholder="Paste your gradebook text here. Supported formats:&#10;• Grade Name, Score, Weight&#10;• Grade Name    Score    Weight&#10;• Score% Grade Name Weight%"
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => parseGradebookText(gradebookText)}
                disabled={!gradebookText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Parse Gradebook
              </button>
              <button
                onClick={() => setGradebookText('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        );
        
      case 'batch':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Spreadsheet Data
              </label>
              <div className="text-sm text-gray-600 mb-2">
                Copy and paste from Excel/Google Sheets. Expected columns: Grade Name, Score, Weight, Category (optional)
              </div>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Grade Name&#9;Score&#9;Weight&#9;Category&#10;Midterm Exam&#9;85&#9;30&#9;exam&#10;Homework Average&#9;92&#9;25&#9;assignment"
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => parseBatchText(batchText)}
                disabled={!batchText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import Data
              </button>
              <button
                onClick={() => setBatchText('')}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear
              </button>
            </div>
          </div>
        );
        
      case 'csv':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <div className="text-sm text-gray-600 mb-3">
                Upload a CSV file with columns: Grade Name, Score, Weight, Category (optional)
              </div>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">
                  Click to select a CSV file or drag and drop
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Select File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        );
        
      default: // manual
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Add Grade Items Manually
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSampleGrades}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Load Sample Data
                </button>
                {grades.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Clear all grades"
                  >
                    <RotateCcw className="h-4 w-4 inline mr-1" />
                    Clear
                  </button>
                )}
                <button
                  onClick={handleAddNewGrade}
                  disabled={grades.length >= maxGrades}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Grade
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderGradesList = () => {
    if (grades.length === 0) {
      return (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No grade items added yet</p>
          <p className="text-sm text-gray-500">
            Use the options above to add your grade items
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Grade Items ({grades.length}/{maxGrades})
          </span>
          <button
            onClick={() => exportGrades('csv')}
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <Download className="w-3 h-3 inline mr-1" />
            Export
          </button>
        </div>
        
        {grades.map((grade) => (
          <div key={grade.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Grade item name"
              value={grade.name}
              onChange={(e) => onUpdateGrade(grade.id, { name: e.target.value })}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Score"
              value={grade.score}
              onChange={(e) => onUpdateGrade(grade.id, { score: parseFloat(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
            <input
              type="number"
              placeholder="Weight %"
              value={grade.weight}
              onChange={(e) => onUpdateGrade(grade.id, { weight: parseFloat(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              max="100"
              step="0.1"
            />
            <select
              value={grade.category}
              onChange={(e) => onUpdateGrade(grade.id, { category: e.target.value as GradeItem['category'] })}
              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="assignment">Assignment</option>
              <option value="exam">Exam</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
              <option value="participation">Participation</option>
            </select>
            <button
              onClick={() => onRemoveGrade(grade.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
              title="Remove grade item"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {renderInputModeSelector()}
      {renderParseResults()}
      {renderInputMode()}
      <div className="border-t pt-4">
        {renderGradesList()}
      </div>
    </div>
  );
}