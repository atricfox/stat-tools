/**
 * GPA Data Input Component
 * Handles course information input with multiple input methods:
 * - Manual single course entry
 * - Transcript text pasting
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
  Copy,
  RotateCcw
} from 'lucide-react';
import { Course, GradePointSystem } from '@/types/gpa';

interface GPADataInputProps {
  courses: Course[];
  gradeSystem: GradePointSystem;
  onCoursesChange: (courses: Course[]) => void;
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (courseId: string, updates: Partial<Course>) => void;
  onRemoveCourse: (courseId: string) => void;
  onClearAll: () => void;
  maxCourses?: number;
  className?: string;
}

interface InputMode {
  type: 'manual' | 'transcript' | 'batch' | 'csv';
  label: string;
  icon: React.ComponentType<any>;
  description: string;
}

const INPUT_MODES: InputMode[] = [
  {
    type: 'manual',
    label: 'Manual Entry',
    icon: Plus,
    description: 'Add courses one by one'
  },
  {
    type: 'transcript',
    label: 'Paste Transcript',
    icon: ClipboardPaste,
    description: 'Paste text from transcript'
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

export default function GPADataInput({
  courses,
  gradeSystem,
  onCoursesChange,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  onClearAll,
  maxCourses = 50,
  className = ''
}: GPADataInputProps) {
  const [activeInputMode, setActiveInputMode] = useState<'manual' | 'transcript' | 'batch' | 'csv'>('manual');
  const [transcriptText, setTranscriptText] = useState('');
  const [batchText, setBatchText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [showParseResults, setShowParseResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get available grades for the current system
  const availableGrades = gradeSystem.mappings.map(m => m.letterGrade);

  const handleAddNewCourse = useCallback(() => {
    if (courses.length >= maxCourses) {
      setParseErrors([`Maximum ${maxCourses} courses allowed`]);
      return;
    }

    onAddCourse({
      name: '',
      credits: 3,
      grade: '',
      semester: 'Current'
    });
  }, [courses.length, maxCourses, onAddCourse]);

  const handleAddSampleCourse = useCallback(() => {
    const sampleCourses = [
      { name: 'Calculus I', credits: 4, grade: 'A', semester: 'Fall 2023' },
      { name: 'English Composition', credits: 3, grade: 'A-', semester: 'Fall 2023' },
      { name: 'General Chemistry', credits: 4, grade: 'B+', semester: 'Fall 2023' },
      { name: 'World History', credits: 3, grade: 'B', semester: 'Spring 2024' },
      { name: 'Statistics', credits: 3, grade: 'A-', semester: 'Spring 2024' }
    ];

    const coursesToAdd = sampleCourses.slice(0, Math.min(5, maxCourses - courses.length));
    coursesToAdd.forEach(course => onAddCourse(course));
  }, [courses.length, maxCourses, onAddCourse]);

  const parseTranscriptText = useCallback((text: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const parsedCourses: Omit<Course, 'id'>[] = [];

    if (!text.trim()) {
      errors.push('Please enter transcript text');
      setParseErrors(errors);
      return;
    }

    const lines = text.split('\n').filter(line => line.trim());
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Try to parse different transcript formats
      // Format 1: "Course Name, Credits, Grade"
      let match = line.match(/^(.+?),\s*(\d+(?:\.\d+)?),\s*([A-Z][+-]?|\d+(?:\.\d+)?)$/i);
      
      if (!match) {
        // Format 2: "Course Name    Credits    Grade" (tab/space separated)
        match = line.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s+([A-Z][+-]?|\d+(?:\.\d+)?)$/i);
      }
      
      if (!match) {
        // Format 3: "Grade Course Name Credits" (transcript style)
        match = line.match(/^([A-Z][+-]?|\d+(?:\.\d+)?)\s+(.+?)\s+(\d+(?:\.\d+)?)$/i);
        if (match) {
          // Reorder to [full, name, credits, grade]
          match = [match[0], match[2], match[3], match[1]];
        }
      }

      if (match) {
        const [, name, creditsStr, grade] = match;
        const credits = parseFloat(creditsStr);
        
        // Validate credits
        if (isNaN(credits) || credits <= 0 || credits > 10) {
          warnings.push(`Line ${i + 1}: Invalid credits "${creditsStr}" for "${name.trim()}"`);
          continue;
        }

        // Validate grade
        const gradeUpper = grade.toUpperCase();
        if (!availableGrades.includes(gradeUpper)) {
          warnings.push(`Line ${i + 1}: Grade "${grade}" not found in ${gradeSystem.name} system`);
        }

        parsedCourses.push({
          name: name.trim(),
          credits: Math.round(credits * 2) / 2, // Round to nearest 0.5
          grade: gradeUpper,
          semester: 'Imported'
        });
      } else {
        errors.push(`Line ${i + 1}: Could not parse "${line}"`);
      }
    }

    setParseErrors(errors);
    setParseWarnings(warnings);
    setShowParseResults(true);

    if (errors.length === 0 && parsedCourses.length > 0) {
      const coursesToAdd = parsedCourses.slice(0, maxCourses - courses.length);
      if (coursesToAdd.length < parsedCourses.length) {
        warnings.push(`Only adding first ${coursesToAdd.length} courses (max ${maxCourses} total)`);
        setParseWarnings(warnings);
      }
      
      coursesToAdd.forEach(course => onAddCourse(course));
      setTranscriptText('');
      setActiveInputMode('manual');
    }
  }, [availableGrades, gradeSystem.name, maxCourses, courses.length, onAddCourse]);

  const parseBatchText = useCallback((text: string) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const parsedCourses: Omit<Course, 'id'>[] = [];

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
      firstLine.includes('course') || 
      firstLine.includes('name') || 
      firstLine.includes('credits') || 
      firstLine.includes('grade')
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
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Expected at least 3 columns (name, credits, grade)`);
        continue;
      }

      const name = parts[0]?.trim();
      const creditsStr = parts[1]?.trim();
      const grade = parts[2]?.trim();
      const semester = parts[3]?.trim() || 'Imported';

      // Validate name
      if (!name) {
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Course name is required`);
        continue;
      }

      // Validate credits
      const credits = parseFloat(creditsStr);
      if (isNaN(credits) || credits <= 0 || credits > 10) {
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid credits "${creditsStr}"`);
        continue;
      }

      // Validate grade
      const gradeUpper = grade.toUpperCase();
      if (!availableGrades.includes(gradeUpper)) {
        warnings.push(`Row ${i + (hasHeaders ? 2 : 1)}: Grade "${grade}" not found in ${gradeSystem.name} system`);
      }

      parsedCourses.push({
        name: name,
        credits: Math.round(credits * 2) / 2,
        grade: gradeUpper,
        semester: semester
      });
    }

    setParseErrors(errors);
    setParseWarnings(warnings);
    setShowParseResults(true);

    if (errors.length === 0 && parsedCourses.length > 0) {
      const coursesToAdd = parsedCourses.slice(0, maxCourses - courses.length);
      if (coursesToAdd.length < parsedCourses.length) {
        warnings.push(`Only adding first ${coursesToAdd.length} courses (max ${maxCourses} total)`);
        setParseWarnings(warnings);
      }
      
      coursesToAdd.forEach(course => onAddCourse(course));
      setBatchText('');
      setActiveInputMode('manual');
    }
  }, [availableGrades, gradeSystem.name, maxCourses, courses.length, onAddCourse]);

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

  const exportCourses = useCallback((format: 'csv' | 'txt' = 'csv') => {
    if (courses.length === 0) return;

    let content = '';
    
    if (format === 'csv') {
      content = 'Course Name,Credits,Grade,Semester\n';
      content += courses.map(course => 
        `"${course.name}",${course.credits},"${course.grade}","${course.semester || ''}"`
      ).join('\n');
    } else {
      content = courses.map(course => 
        `${course.name}\t${course.credits}\t${course.grade}`
      ).join('\n');
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gpa_courses.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [courses]);

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
              <span className="text-sm">Courses imported successfully!</span>
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
      case 'transcript':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paste Transcript Text
              </label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="Paste your transcript text here. Supported formats:&#10;• Course Name, Credits, Grade&#10;• Course Name    Credits    Grade&#10;• Grade Course Name Credits"
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => parseTranscriptText(transcriptText)}
                disabled={!transcriptText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Parse Transcript
              </button>
              <button
                onClick={() => setTranscriptText('')}
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
                Copy and paste from Excel/Google Sheets. Expected columns: Course Name, Credits, Grade, Semester (optional)
              </div>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder="Course Name&#9;Credits&#9;Grade&#9;Semester&#10;Calculus I&#9;4&#9;A&#9;Fall 2023&#10;English Comp&#9;3&#9;B+&#9;Fall 2023"
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
                Upload a CSV file with columns: Course Name, Credits, Grade, Semester (optional)
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
                Add Courses Manually
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSampleCourse}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Load Sample Data
                </button>
                <button
                  onClick={handleAddNewCourse}
                  disabled={courses.length >= maxCourses}
                  className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Course
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  const renderCoursesList = () => {
    if (courses.length === 0) {
      return (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No courses added yet</p>
          <p className="text-sm text-gray-500">
            Use the options above to add your courses
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Courses ({courses.length}/{maxCourses})
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => exportCourses('csv')}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Download className="w-3 h-3 inline mr-1" />
              Export
            </button>
            <button
              onClick={onClearAll}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-3 h-3 inline mr-1" />
              Clear All
            </button>
          </div>
        </div>
        
        {courses.map((course) => (
          <div key={course.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="text"
              placeholder="Course name"
              value={course.name}
              onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              placeholder="Credits"
              value={course.credits}
              onChange={(e) => onUpdateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.5"
              max="10"
              step="0.5"
            />
            <select
              value={course.grade}
              onChange={(e) => onUpdateCourse(course.id, { grade: e.target.value })}
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Grade</option>
              {availableGrades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Semester"
              value={course.semester || ''}
              onChange={(e) => onUpdateCourse(course.id, { semester: e.target.value })}
              className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onRemoveCourse(course.id)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
              title="Remove course"
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
        {renderCoursesList()}
      </div>
    </div>
  );
}