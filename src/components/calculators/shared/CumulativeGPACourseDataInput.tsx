/**
 * Cumulative GPA Course Data Input Component
 * Handles multi-semester course information input with multiple input methods:
 * - Manual single course entry
 * - Transcript text pasting with semester parsing
 * - CSV/Excel batch import with semester grouping
 * - Copy-paste from spreadsheets with semester columns
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
import type { Course, GradingScale } from '@/types/education';

interface CumulativeGPACourseDataInputProps {
  courses: Course[];
  sourceGradingSystem: GradingScale;
  targetGradingSystem: GradingScale;
  onCoursesChange: (courses: Course[]) => void;
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUpdateCourse: (courseId: string, updates: Partial<Course>) => void;
  onRemoveCourse: (courseId: string) => void;
  onClearAll: () => void;
  onAddSemester: (semesterName: string) => void;
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
    description: 'Add courses by semester'
  },
  {
    type: 'transcript',
    label: 'Paste Transcript',
    icon: ClipboardPaste,
    description: 'Parse multi-semester transcript'
  },
  {
    type: 'batch',
    label: 'Spreadsheet',
    icon: FileText,
    description: 'Import from Excel/Sheets'
  },
  {
    type: 'csv',
    label: 'Upload File',
    icon: Upload,
    description: 'Upload CSV file'
  }
];

export default function CumulativeGPACourseDataInput({
  courses,
  sourceGradingSystem,
  targetGradingSystem,
  onCoursesChange,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  onClearAll,
  onAddSemester,
  maxCourses = 50,
  className = ''
}: CumulativeGPACourseDataInputProps) {
  const [activeInputMode, setActiveInputMode] = useState<'manual' | 'transcript' | 'batch' | 'csv'>('manual');
  const [transcriptText, setTranscriptText] = useState('');
  const [batchText, setBatchText] = useState('');
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [showParseResults, setShowParseResults] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get available grades for the current grading scale
  const getAvailableGrades = () => {
    if (sourceGradingSystem === 'percentage') {
      return []; // Numeric input
    } else if (sourceGradingSystem === '4.0') {
      return ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
    } else { // 5.0 scale
      return ['A', 'B', 'C', 'D', 'F'];
    }
  };

  const availableGrades = getAvailableGrades();

  const handleAddNewCourse = useCallback(() => {
    if (courses.length >= maxCourses) {
      setParseErrors([`Maximum ${maxCourses} courses allowed`]);
      return;
    }

    const defaultGrade = sourceGradingSystem === 'percentage' ? 85 : 
                        sourceGradingSystem === '4.0' ? 'B' : 'C';

    onAddCourse({
      name: '',
      grade: defaultGrade,
      credits: 3,
      semester: 'Current',
      isIncluded: true
    });
  }, [courses.length, maxCourses, sourceGradingSystem, onAddCourse]);

  const handleAddSampleCourses = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const sampleCourses = sourceGradingSystem === 'percentage' ? [
      { name: 'Calculus I', grade: 87, credits: 4, semester: `Fall ${currentYear-1}`, isIncluded: true },
      { name: 'Physics I', grade: 92, credits: 4, semester: `Fall ${currentYear-1}`, isIncluded: true },
      { name: 'Computer Science I', grade: 88, credits: 3, semester: `Spring ${currentYear}`, isIncluded: true },
      { name: 'English Composition', grade: 85, credits: 3, semester: `Spring ${currentYear}`, isIncluded: true }
    ] : sourceGradingSystem === '4.0' ? [
      { name: 'Calculus I', grade: 'A-', credits: 4, semester: `Fall ${currentYear-1}`, isIncluded: true },
      { name: 'Physics I', grade: 'A', credits: 4, semester: `Fall ${currentYear-1}`, isIncluded: true },
      { name: 'Computer Science I', grade: 'B+', credits: 3, semester: `Spring ${currentYear}`, isIncluded: true },
      { name: 'English Composition', grade: 'B', credits: 3, semester: `Spring ${currentYear}`, isIncluded: true }
    ] : [
      { name: 'Calculus I', grade: 'A', credits: 4, semester: `Fall ${currentYear-1}`, isIncluded: true },
      { name: 'Physics I', grade: 'A', credits: 4, semester: `Fall ${currentYear-1}`, isIncluded: true },
      { name: 'Computer Science I', grade: 'B', credits: 3, semester: `Spring ${currentYear}`, isIncluded: true },
      { name: 'English Composition', grade: 'B', credits: 3, semester: `Spring ${currentYear}`, isIncluded: true }
    ];

    const coursesToAdd = sampleCourses.slice(0, Math.min(4, maxCourses - courses.length));
    coursesToAdd.forEach(course => onAddCourse(course));
  }, [courses.length, maxCourses, sourceGradingSystem, onAddCourse]);

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
    let currentSemester = 'Imported';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if line looks like a semester header
      const semesterMatch = line.match(/^(Fall|Spring|Summer|Winter)\s+(\d{4})|^(\d{4})\s+(Fall|Spring|Summer|Winter)|^Semester:\s*(.+)$/i);
      if (semesterMatch) {
        currentSemester = semesterMatch[5] || `${semesterMatch[1] || semesterMatch[4]} ${semesterMatch[2] || semesterMatch[3]}`;
        continue;
      }

      // Try to parse course formats
      // Format 1: "Course Name, Grade, Credits, Semester"
      let match = line.match(/^(.+?),\s*([A-Z][+-]?|\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),?\s*(.*)$/i);
      
      if (!match) {
        // Format 2: "Course Name    Grade    Credits    Semester" (tab/space separated)
        match = line.match(/^(.+?)\s+([A-Z][+-]?|\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(.+)$/i);
      }
      
      if (!match) {
        // Format 3: "Course Name    Grade    Credits" (no semester)
        match = line.match(/^(.+?)\s+([A-Z][+-]?|\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)$/i);
        if (match) {
          // Add current semester as 4th element
          match = [match[0], match[1], match[2], match[3], currentSemester];
        }
      }

      if (match) {
        const [, name, gradeStr, creditsStr, semesterStr = currentSemester] = match;
        const credits = parseFloat(creditsStr);
        
        // Validate credits
        if (isNaN(credits) || credits <= 0 || credits > 10) {
          warnings.push(`Line ${i + 1}: Invalid credits "${creditsStr}" for "${name.trim()}"`);
          continue;
        }

        // Validate grade based on grading scale
        let validGrade: string | number = gradeStr;
        if (sourceGradingSystem === 'percentage') {
          const gradeNum = parseFloat(gradeStr);
          if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
            warnings.push(`Line ${i + 1}: Invalid percentage grade "${gradeStr}" for "${name.trim()}"`);
            continue;
          }
          validGrade = gradeNum;
        } else {
          const gradeUpper = gradeStr.toUpperCase();
          if (!availableGrades.includes(gradeUpper)) {
            warnings.push(`Line ${i + 1}: Grade "${gradeStr}" not found in ${sourceGradingSystem} system`);
            continue;
          }
          validGrade = gradeUpper;
        }

        parsedCourses.push({
          name: name.trim(),
          grade: validGrade,
          credits: Math.round(credits * 2) / 2, // Round to nearest 0.5
          semester: semesterStr.trim() || currentSemester,
          isIncluded: true
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
  }, [sourceGradingSystem, availableGrades, maxCourses, courses.length, onAddCourse]);

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
      firstLine.includes('grade') || 
      firstLine.includes('credits') ||
      firstLine.includes('semester')
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
        errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Expected at least 3 columns (name, grade, credits)`);
        continue;
      }

      const name = parts[0]?.trim();
      const gradeStr = parts[1]?.trim();
      const creditsStr = parts[2]?.trim();
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

      // Validate grade based on grading scale
      let validGrade: string | number = gradeStr;
      if (sourceGradingSystem === 'percentage') {
        const gradeNum = parseFloat(gradeStr);
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
          errors.push(`Row ${i + (hasHeaders ? 2 : 1)}: Invalid percentage grade "${gradeStr}"`);
          continue;
        }
        validGrade = gradeNum;
      } else {
        const gradeUpper = gradeStr.toUpperCase();
        if (!availableGrades.includes(gradeUpper)) {
          warnings.push(`Row ${i + (hasHeaders ? 2 : 1)}: Grade "${gradeStr}" not found in ${sourceGradingSystem} system`);
          continue;
        }
        validGrade = gradeUpper;
      }

      parsedCourses.push({
        name: name,
        grade: validGrade,
        credits: Math.round(credits * 2) / 2,
        semester: semester,
        isIncluded: true
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
  }, [sourceGradingSystem, availableGrades, maxCourses, courses.length, onAddCourse]);

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
      content = 'Course Name,Grade,Credits,Semester,Included\n';
      content += courses.map(course => 
        `"${course.name}",${course.grade},${course.credits},"${course.semester}",${course.isIncluded ? 'Yes' : 'No'}`
      ).join('\n');
    } else {
      content = courses.map(course => 
        `${course.name}\t${course.grade}\t${course.credits}\t${course.semester}\t${course.isIncluded ? 'Yes' : 'No'}`
      ).join('\n');
    }

    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cumulative_gpa_courses.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [courses]);

  const renderGradeInput = (course: Course) => {
    if (sourceGradingSystem === 'percentage') {
      return (
        <input
          type="number"
          value={typeof course.grade === 'number' ? course.grade : parseFloat(course.grade as string) || 0}
          onChange={(e) => onUpdateCourse(course.id, { grade: parseFloat(e.target.value) || 0 })}
          min="0"
          max="100"
          step="0.1"
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
          placeholder="85"
        />
      );
    } else {
      return (
        <select
          value={course.grade as string}
          onChange={(e) => onUpdateCourse(course.id, { grade: e.target.value })}
          className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
        >
          {availableGrades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>
      );
    }
  };

  // Get unique semesters for organization
  const semesters = Array.from(
    new Set(
      courses
        .map(c => c.semester)
        .filter((s): s is string => Boolean(s))
    )
  ).sort();

  // Group courses by semester
  const coursesBySemester = semesters.reduce((acc, semester) => {
    acc[semester] = courses.filter(c => c.semester === semester);
    return acc;
  }, {} as Record<string, Course[]>);

  // Handle semester addition
  const handleAddSemester = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const season = currentMonth >= 8 ? 'Fall' : currentMonth >= 2 ? 'Spring' : 'Winter';
    const semesterName = `${season} ${currentYear}`;
    onAddSemester(semesterName);
  };

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
                Paste Multi-Semester Transcript
              </label>
              <textarea
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={`Paste your transcript with semester headers. Formats supported for ${sourceGradingSystem} scale:${
                  sourceGradingSystem === 'percentage' 
                    ? '\n\nFall 2023\nCalculus I, 87, 4\nPhysics I, 92, 4\n\nSpring 2024\nCS I, 88, 3'
                    : '\n\nFall 2023\nCalculus I, A-, 4\nPhysics I, A, 4\n\nSpring 2024\nCS I, B+, 3'
                }`}
                rows={12}
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
                Copy and paste from Excel/Google Sheets. Expected columns: Course Name, Grade, Credits, Semester (optional)
              </div>
              <textarea
                value={batchText}
                onChange={(e) => setBatchText(e.target.value)}
                placeholder={`Course Name&#9;Grade&#9;Credits&#9;Semester${
                  sourceGradingSystem === 'percentage' 
                    ? '\nCalculus I&#9;87&#9;4&#9;Fall 2023\nPhysics I&#9;92&#9;4&#9;Fall 2023'
                    : '\nCalculus I&#9;A-&#9;4&#9;Fall 2023\nPhysics I&#9;A&#9;4&#9;Fall 2023'
                }`}
                rows={10}
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
                Upload a CSV file with columns: Course Name, Grade, Credits, Semester (optional)
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
                Add Courses by Semester
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleAddSampleCourses}
                  className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Load Sample Data
                </button>
                {courses.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Clear all courses"
                  >
                    <RotateCcw className="h-4 w-4 inline mr-1" />
                    Clear
                  </button>
                )}
                <button
                  onClick={handleAddSemester}
                  className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  + Semester
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
            Use the options above to add your courses by semester
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
        
        {/* Courses organized by semester */}
        <div className="space-y-6">
          {semesters.map(semester => (
            <div key={semester} className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">{semester}</h4>
              <div className="space-y-3">
                {coursesBySemester[semester].map((course) => (
                  <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-md">
                    {/* Course Name */}
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
                        placeholder="Course Name"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                      />
                    </div>

                    {/* Grade */}
                    <div className="md:col-span-3">
                      {renderGradeInput(course)}
                    </div>

                    {/* Credits */}
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        value={course.credits}
                        onChange={(e) => onUpdateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
                        min="0.1"
                        max="20"
                        step="0.5"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                        placeholder="Credits"
                      />
                    </div>

                    {/* Semester */}
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={course.semester || ''}
                        onChange={(e) => onUpdateCourse(course.id, { semester: e.target.value })}
                        placeholder="Semester"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                      />
                    </div>

                    {/* Include Toggle */}
                    <div className="md:col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={course.isIncluded !== false}
                        onChange={(e) => onUpdateCourse(course.id, { isIncluded: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        title="Include in GPA"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => onRemoveCourse(course.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Remove course"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Courses without semester */}
          {courses.filter(c => !c.semester).length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 mb-3">Uncategorized Courses</h4>
              <div className="space-y-3">
                {courses.filter(c => !c.semester).map((course) => (
                  <div key={course.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3 bg-gray-50 rounded-md">
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        value={course.name}
                        onChange={(e) => onUpdateCourse(course.id, { name: e.target.value })}
                        placeholder="Course Name"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="md:col-span-3">{renderGradeInput(course)}</div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        value={course.credits}
                        onChange={(e) => onUpdateCourse(course.id, { credits: parseFloat(e.target.value) || 0 })}
                        min="0.1" max="20" step="0.5"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                        placeholder="Credits"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={course.semester || ''}
                        onChange={(e) => onUpdateCourse(course.id, { semester: e.target.value })}
                        placeholder="Semester"
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={course.isIncluded !== false}
                        onChange={(e) => onUpdateCourse(course.id, { isIncluded: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center justify-center">
                      <button
                        onClick={() => onRemoveCourse(course.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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