'use client';

import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { 
  UnweightedCourse, 
  UnweightedGradingSystem,
  UI_CONTENT 
} from '@/types/unweightedGpa';

interface UnweightedGPADataInputProps {
  courses: UnweightedCourse[];
  gradingSystem: UnweightedGradingSystem;
  onAddCourse: (course: Omit<UnweightedCourse, 'id'>) => void;
  onUpdateCourse: (id: string, updates: Partial<UnweightedCourse>) => void;
  onRemoveCourse: (id: string) => void;
  onClearAll: () => void;
  onLoadExample: (systemId: string) => void;
  className?: string;
}

export default function UnweightedGPADataInput({
  courses,
  gradingSystem,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  onClearAll,
  onLoadExample,
  className = ''
}: UnweightedGPADataInputProps) {
  // New course form state
  const [newCourse, setNewCourse] = useState({
    courseName: '',
    credits: 3,
    letterGrade: ''
  });

  // Form validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleAddCourse = () => {
    // Reset validation errors
    setValidationErrors({});
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!newCourse.courseName.trim()) {
      errors.courseName = UI_CONTENT.validation.courseNameRequired;
    } else if (newCourse.courseName.length > 100) {
      errors.courseName = UI_CONTENT.validation.courseNameTooLong;
    }
    
    if (newCourse.credits < 0.5 || newCourse.credits > 10) {
      errors.credits = UI_CONTENT.validation.creditsRange;
    }
    
    if (!newCourse.letterGrade) {
      errors.letterGrade = UI_CONTENT.validation.gradeRequired;
    } else {
      const isValidGrade = gradingSystem.mappings.some(m => m.letterGrade === newCourse.letterGrade);
      if (!isValidGrade) {
        errors.letterGrade = UI_CONTENT.validation.invalidGrade;
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Add course
    onAddCourse(newCourse);
    
    // Reset form
    setNewCourse({
      courseName: '',
      credits: 3,
      letterGrade: ''
    });
  };

  const handleCourseUpdate = (id: string, field: keyof UnweightedCourse, value: string | number) => {
    onUpdateCourse(id, { [field]: value });
  };

  const handleClearAll = () => {
    if (courses.length > 0 && window.confirm('Are you sure you want to clear all courses? This action cannot be undone.')) {
      onClearAll();
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-0">
            Course Information
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onLoadExample(gradingSystem.id)}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {UI_CONTENT.buttons.loadExample}
            </button>
            {courses.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                {UI_CONTENT.buttons.clearAll}
              </button>
            )}
          </div>
        </div>

        {/* Course List */}
        {courses.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">
                    {UI_CONTENT.labels.courseName}
                  </th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-24">
                    {UI_CONTENT.labels.credits}
                  </th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-32">
                    {UI_CONTENT.labels.letterGrade}
                  </th>
                  <th className="text-left py-2 px-2 text-sm font-medium text-gray-700 w-16">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={course.courseName}
                        onChange={(e) => handleCourseUpdate(course.id, 'courseName', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={UI_CONTENT.placeholders.courseName}
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={course.credits}
                        onChange={(e) => handleCourseUpdate(course.id, 'credits', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={course.letterGrade}
                        onChange={(e) => handleCourseUpdate(course.id, 'letterGrade', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">{UI_CONTENT.placeholders.selectGrade}</option>
                        {gradingSystem.mappings.map((mapping) => (
                          <option key={mapping.letterGrade} value={mapping.letterGrade}>
                            {mapping.letterGrade} ({mapping.gradePoints})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => onRemoveCourse(course.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        title={UI_CONTENT.buttons.remove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add New Course Form */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h4 className="text-md font-medium text-gray-900 mb-4">Add New Course</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Course Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {UI_CONTENT.labels.courseName}
              </label>
              <input
                type="text"
                value={newCourse.courseName}
                onChange={(e) => setNewCourse(prev => ({ ...prev, courseName: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.courseName 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder={UI_CONTENT.placeholders.courseName}
              />
              {validationErrors.courseName && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.courseName}</p>
              )}
            </div>

            {/* Credits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {UI_CONTENT.labels.credits}
              </label>
              <input
                type="number"
                min="0.5"
                max="10"
                step="0.5"
                value={newCourse.credits}
                onChange={(e) => setNewCourse(prev => ({ ...prev, credits: parseFloat(e.target.value) || 0 }))}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.credits 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder={UI_CONTENT.placeholders.credits}
              />
              {validationErrors.credits && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.credits}</p>
              )}
            </div>

            {/* Letter Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {UI_CONTENT.labels.letterGrade}
              </label>
              <select
                value={newCourse.letterGrade}
                onChange={(e) => setNewCourse(prev => ({ ...prev, letterGrade: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.letterGrade 
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500'
                }`}
              >
                <option value="">{UI_CONTENT.placeholders.selectGrade}</option>
                {gradingSystem.mappings.map((mapping) => (
                  <option key={mapping.letterGrade} value={mapping.letterGrade}>
                    {mapping.letterGrade} ({mapping.gradePoints}) - {mapping.description}
                  </option>
                ))}
              </select>
              {validationErrors.letterGrade && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.letterGrade}</p>
              )}
            </div>
          </div>

          {/* Add Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAddCourse}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              {UI_CONTENT.buttons.addCourse}
            </button>
          </div>
        </div>

        {/* No courses message */}
        {courses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">No courses added yet</p>
            <p className="text-sm">Add your courses above or load example data to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}