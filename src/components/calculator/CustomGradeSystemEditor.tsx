/**
 * Custom Grade System Editor Component
 * Allows users to create, edit, and manage custom grading systems
 * Features: grade mapping rules, validation, import/export, templates
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus,
  Trash2,
  Download,
  Upload,
  Settings,
  Check,
  X,
  AlertCircle,
  Info,
  Copy,
  RotateCcw,
  Save,
  FileText,
  Star
} from 'lucide-react';
import { GradePointSystem, GradeMapping, ValidationResult } from '@/types/gpa';

interface CustomGradeSystemEditorProps {
  system?: GradePointSystem;
  onSystemChange: (system: GradePointSystem) => void;
  onSave?: (system: GradePointSystem) => void;
  onCancel?: () => void;
  className?: string;
}

interface SystemTemplate {
  id: string;
  name: string;
  description: string;
  country?: string;
  scale: number;
  mappings: GradeMapping[];
}

const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    id: 'template-basic-4.0',
    name: 'Basic 4.0 Scale',
    description: 'Simple A-F grading system',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A', numericMin: 90, numericMax: 100, gradePoints: 4.0, percentageMin: 90, percentageMax: 100 },
      { letterGrade: 'B', numericMin: 80, numericMax: 89, gradePoints: 3.0, percentageMin: 80, percentageMax: 89 },
      { letterGrade: 'C', numericMin: 70, numericMax: 79, gradePoints: 2.0, percentageMin: 70, percentageMax: 79 },
      { letterGrade: 'D', numericMin: 60, numericMax: 69, gradePoints: 1.0, percentageMin: 60, percentageMax: 69 },
      { letterGrade: 'F', numericMin: 0, numericMax: 59, gradePoints: 0.0, percentageMin: 0, percentageMax: 59 }
    ]
  },
  {
    id: 'template-plus-minus',
    name: 'Plus/Minus System',
    description: 'Extended grading with + and - modifiers',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A+', numericMin: 97, numericMax: 100, gradePoints: 4.0, percentageMin: 97, percentageMax: 100 },
      { letterGrade: 'A', numericMin: 93, numericMax: 96, gradePoints: 4.0, percentageMin: 93, percentageMax: 96 },
      { letterGrade: 'A-', numericMin: 90, numericMax: 92, gradePoints: 3.7, percentageMin: 90, percentageMax: 92 },
      { letterGrade: 'B+', numericMin: 87, numericMax: 89, gradePoints: 3.3, percentageMin: 87, percentageMax: 89 },
      { letterGrade: 'B', numericMin: 83, numericMax: 86, gradePoints: 3.0, percentageMin: 83, percentageMax: 86 },
      { letterGrade: 'B-', numericMin: 80, numericMax: 82, gradePoints: 2.7, percentageMin: 80, percentageMax: 82 },
      { letterGrade: 'C+', numericMin: 77, numericMax: 79, gradePoints: 2.3, percentageMin: 77, percentageMax: 79 },
      { letterGrade: 'C', numericMin: 73, numericMax: 76, gradePoints: 2.0, percentageMin: 73, percentageMax: 76 },
      { letterGrade: 'C-', numericMin: 70, numericMax: 72, gradePoints: 1.7, percentageMin: 70, percentageMax: 72 },
      { letterGrade: 'D', numericMin: 60, numericMax: 69, gradePoints: 1.0, percentageMin: 60, percentageMax: 69 },
      { letterGrade: 'F', numericMin: 0, numericMax: 59, gradePoints: 0.0, percentageMin: 0, percentageMax: 59 }
    ]
  },
  {
    id: 'template-numerical',
    name: 'Numerical Grades (1-5)',
    description: 'European-style numerical grading system',
    scale: 5.0,
    mappings: [
      { letterGrade: '1', numericMin: 90, numericMax: 100, gradePoints: 5.0, percentageMin: 90, percentageMax: 100, description: 'Excellent' },
      { letterGrade: '2', numericMin: 80, numericMax: 89, gradePoints: 4.0, percentageMin: 80, percentageMax: 89, description: 'Good' },
      { letterGrade: '3', numericMin: 70, numericMax: 79, gradePoints: 3.0, percentageMin: 70, percentageMax: 79, description: 'Satisfactory' },
      { letterGrade: '4', numericMin: 60, numericMax: 69, gradePoints: 2.0, percentageMin: 60, percentageMax: 69, description: 'Sufficient' },
      { letterGrade: '5', numericMin: 0, numericMax: 59, gradePoints: 0.0, percentageMin: 0, percentageMax: 59, description: 'Insufficient' }
    ]
  }
];

export default function CustomGradeSystemEditor({
  system,
  onSystemChange,
  onSave,
  onCancel,
  className = ''
}: CustomGradeSystemEditorProps) {
  const [editingSystem, setEditingSystem] = useState<GradePointSystem>(() => 
    system || {
      id: `custom-${Date.now()}`,
      name: '',
      scale: 4.0,
      country: '',
      description: '',
      isOfficial: false,
      mappings: []
    }
  );
  
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  });
  
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Validate the grading system
  const validateSystem = useCallback((system: GradePointSystem): ValidationResult => {
    const errors = [];
    const warnings = [];

    // Basic required fields
    if (!system.name.trim()) {
      errors.push({ field: 'name', message: 'System name is required', value: system.name, code: 'required' });
    }

    if (!system.country.trim()) {
      warnings.push({ field: 'country', message: 'Country/region is recommended for clarity', value: system.country, suggestion: 'Add country or region information' });
    }

    if (!system.description.trim()) {
      warnings.push({ field: 'description', message: 'Description helps users understand the system', value: system.description, suggestion: 'Add a brief description' });
    }

    // Scale validation
    if (system.scale <= 0 || system.scale > 10) {
      errors.push({ field: 'scale', message: 'Scale must be between 0.1 and 10.0', value: system.scale, code: 'range' });
    }

    // Mappings validation
    if (system.mappings.length === 0) {
      errors.push({ field: 'mappings', message: 'At least one grade mapping is required', value: system.mappings, code: 'required' });
    } else {
      // Check for duplicate letter grades
      const letterGrades = system.mappings.map(m => m.letterGrade.toUpperCase());
      const duplicates = letterGrades.filter((grade, index) => letterGrades.indexOf(grade) !== index);
      if (duplicates.length > 0) {
        errors.push({ field: 'mappings', message: `Duplicate letter grades: ${duplicates.join(', ')}`, value: duplicates, code: 'duplicate' });
      }

      // Check grade points ranges
      system.mappings.forEach((mapping, index) => {
        if (mapping.gradePoints < 0 || mapping.gradePoints > system.scale) {
          errors.push({ field: `mappings.${index}.gradePoints`, message: `Grade points must be between 0 and ${system.scale}`, value: mapping.gradePoints, code: 'range' });
        }

        if (!mapping.letterGrade.trim()) {
          errors.push({ field: `mappings.${index}.letterGrade`, message: 'Letter grade is required', value: mapping.letterGrade, code: 'required' });
        }

        // Check numeric ranges
        if (mapping.numericMin >= mapping.numericMax) {
          errors.push({ field: `mappings.${index}.range`, message: 'Minimum must be less than maximum', value: [mapping.numericMin, mapping.numericMax], code: 'range' });
        }

        if (mapping.percentageMin && mapping.percentageMax && mapping.percentageMin >= mapping.percentageMax) {
          errors.push({ field: `mappings.${index}.percentage`, message: 'Percentage minimum must be less than maximum', value: [mapping.percentageMin, mapping.percentageMax], code: 'range' });
        }
      });

      // Check for gaps in coverage
      const sortedMappings = [...system.mappings].sort((a, b) => b.numericMin - a.numericMin);
      for (let i = 0; i < sortedMappings.length - 1; i++) {
        const current = sortedMappings[i];
        const next = sortedMappings[i + 1];
        if (current.numericMin > next.numericMax + 1) {
          warnings.push({ 
            field: 'mappings', 
            message: `Gap in coverage between ${next.letterGrade} and ${current.letterGrade}`, 
            value: [next.numericMax, current.numericMin],
            suggestion: 'Consider adjusting ranges to ensure full coverage'
          });
        }
      }

      // Check for overlaps
      for (let i = 0; i < sortedMappings.length - 1; i++) {
        const current = sortedMappings[i];
        const next = sortedMappings[i + 1];
        if (current.numericMin <= next.numericMax) {
          errors.push({ 
            field: 'mappings', 
            message: `Overlap between ${next.letterGrade} and ${current.letterGrade}`, 
            value: [current, next],
            code: 'overlap'
          });
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // Update validation when system changes
  useEffect(() => {
    const result = validateSystem(editingSystem);
    setValidation(result);
  }, [editingSystem, validateSystem]);

  const updateSystemField = useCallback((field: keyof GradePointSystem, value: any) => {
    setEditingSystem(prev => {
      const updated = { ...prev, [field]: value };
      onSystemChange(updated);
      setIsDirty(true);
      return updated;
    });
  }, [onSystemChange]);

  const addMapping = useCallback(() => {
    const newMapping: GradeMapping = {
      letterGrade: '',
      numericMin: 0,
      numericMax: 100,
      gradePoints: 0,
      percentageMin: 0,
      percentageMax: 100,
      description: ''
    };

    updateSystemField('mappings', [...editingSystem.mappings, newMapping]);
  }, [editingSystem.mappings, updateSystemField]);

  const updateMapping = useCallback((index: number, field: keyof GradeMapping, value: any) => {
    const updatedMappings = [...editingSystem.mappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    updateSystemField('mappings', updatedMappings);
  }, [editingSystem.mappings, updateSystemField]);

  const removeMapping = useCallback((index: number) => {
    const updatedMappings = editingSystem.mappings.filter((_, i) => i !== index);
    updateSystemField('mappings', updatedMappings);
  }, [editingSystem.mappings, updateSystemField]);

  const loadTemplate = useCallback((template: SystemTemplate) => {
    const customSystem: GradePointSystem = {
      id: `custom-${Date.now()}`,
      name: template.name,
      scale: template.scale,
      country: template.country || '',
      description: template.description,
      isOfficial: false,
      mappings: [...template.mappings]
    };

    setEditingSystem(customSystem);
    onSystemChange(customSystem);
    setShowTemplates(false);
    setIsDirty(true);
  }, [onSystemChange]);

  const exportSystem = useCallback(() => {
    const dataStr = JSON.stringify(editingSystem, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${editingSystem.name.replace(/\s+/g, '_')}_grading_system.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [editingSystem]);

  const importSystem = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        
        // Validate imported system structure
        if (imported && typeof imported === 'object' && imported.mappings && Array.isArray(imported.mappings)) {
          const customSystem: GradePointSystem = {
            id: `custom-${Date.now()}`,
            name: imported.name || 'Imported System',
            scale: imported.scale || 4.0,
            country: imported.country || '',
            description: imported.description || 'Imported grading system',
            isOfficial: false,
            mappings: imported.mappings
          };

          setEditingSystem(customSystem);
          onSystemChange(customSystem);
          setIsDirty(true);
        } else {
          alert('Invalid grading system file format');
        }
      } catch (error) {
        alert('Error reading file: ' + (error as Error).message);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  }, [onSystemChange]);

  const handleSave = useCallback(() => {
    if (validation.isValid && onSave) {
      onSave(editingSystem);
      setIsDirty(false);
    }
  }, [editingSystem, validation.isValid, onSave]);

  const resetToDefault = useCallback(() => {
    if (system) {
      setEditingSystem({ ...system });
      onSystemChange({ ...system });
      setIsDirty(false);
    }
  }, [system, onSystemChange]);

  const renderValidationResults = () => {
    if (validation.errors.length === 0 && validation.warnings.length === 0) {
      return null;
    }

    return (
      <div className="space-y-2 mb-4">
        {validation.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-red-800 mb-2">
              <AlertCircle className="w-4 h-4 mr-2" />
              <span className="font-medium">Validation Errors</span>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>• {error.message}</li>
              ))}
            </ul>
          </div>
        )}

        {validation.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center text-yellow-800 mb-2">
              <Info className="w-4 h-4 mr-2" />
              <span className="font-medium">Suggestions</span>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              {validation.warnings.map((warning, index) => (
                <li key={index}>
                  • {warning.message}
                  {warning.suggestion && <span className="text-yellow-600 ml-1">({warning.suggestion})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderTemplateSelector = () => {
    if (!showTemplates) return null;

    return (
      <div className="mb-6 bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">Choose a Template</h4>
          <button
            onClick={() => setShowTemplates(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SYSTEM_TEMPLATES.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
              onClick={() => loadTemplate(template)}
            >
              <div className="flex items-center mb-2">
                <Star className="w-4 h-4 text-blue-500 mr-2" />
                <h5 className="font-medium text-gray-900">{template.name}</h5>
              </div>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              <div className="text-xs text-gray-500">
                Scale: {template.scale} • {template.mappings.length} grades
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMappingEditor = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Grade Mappings</h4>
          <button
            onClick={addMapping}
            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Add Grade
          </button>
        </div>

        {editingSystem.mappings.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No grade mappings defined</p>
            <p className="text-sm text-gray-500">Add grade mappings to define your grading system</p>
          </div>
        ) : (
          <div className="space-y-3">
            {editingSystem.mappings.map((mapping, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Letter Grade
                    </label>
                    <input
                      type="text"
                      value={mapping.letterGrade}
                      onChange={(e) => updateMapping(index, 'letterGrade', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="A+"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Grade Points
                    </label>
                    <input
                      type="number"
                      value={mapping.gradePoints}
                      onChange={(e) => updateMapping(index, 'gradePoints', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max={editingSystem.scale}
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Min %
                    </label>
                    <input
                      type="number"
                      value={mapping.numericMin}
                      onChange={(e) => updateMapping(index, 'numericMin', parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Max %
                    </label>
                    <input
                      type="number"
                      value={mapping.numericMax}
                      onChange={(e) => updateMapping(index, 'numericMax', parseInt(e.target.value) || 100)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={mapping.description || ''}
                      onChange={(e) => updateMapping(index, 'description', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Excellent"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => removeMapping(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Remove mapping"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Settings className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Custom Grading System
          </h3>
          {isDirty && (
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
              Unsaved
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Use Template
          </button>
          
          <input
            type="file"
            accept=".json"
            onChange={importSystem}
            className="hidden"
            id="import-system"
          />
          <label
            htmlFor="import-system"
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 inline mr-1" />
            Import
          </label>
          
          <button
            onClick={exportSystem}
            disabled={!editingSystem.name}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
          >
            <Download className="w-4 h-4 inline mr-1" />
            Export
          </button>
        </div>
      </div>

      {renderTemplateSelector()}
      {renderValidationResults()}

      {/* Basic System Information */}
      <div className="bg-white rounded-lg border p-6 space-y-4">
        <h4 className="font-medium text-gray-900">System Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingSystem.name}
              onChange={(e) => updateSystemField('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Custom Grading System"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country/Region
            </label>
            <input
              type="text"
              value={editingSystem.country}
              onChange={(e) => updateSystemField('country', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="United States"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={editingSystem.description}
            onChange={(e) => updateSystemField('description', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Describe your grading system..."
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Scale <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={editingSystem.scale}
            onChange={(e) => updateSystemField('scale', parseFloat(e.target.value) || 4.0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0.1"
            max="10"
            step="0.1"
          />
          <p className="text-xs text-gray-500 mt-1">
            The highest grade points possible in this system
          </p>
        </div>
      </div>

      {/* Grade Mappings */}
      <div className="bg-white rounded-lg border p-6">
        {renderMappingEditor()}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {system && (
            <button
              onClick={resetToDefault}
              disabled={!isDirty}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 transition-colors"
            >
              <RotateCcw className="w-4 h-4 inline mr-1" />
              Reset
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
          
          {onSave && (
            <button
              onClick={handleSave}
              disabled={!validation.isValid}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4 inline mr-1" />
              Save System
            </button>
          )}
        </div>
      </div>
    </div>
  );
}