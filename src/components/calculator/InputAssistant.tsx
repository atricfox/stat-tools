/**
 * Input assistant component providing smart suggestions and quick actions
 * Helps users format their data correctly and provides contextual tips
 */

'use client'

import React, { useState } from 'react';
import { Lightbulb, Wand2, FileText, Clipboard, X } from 'lucide-react';

export interface InputAssistantProps {
  context: 'student' | 'research' | 'teacher';
  onSuggestionApply: (suggestion: string) => void;
  onInsertTemplate: (template: string) => void;
  className?: string;
}

const InputAssistant: React.FC<InputAssistantProps> = ({
  context,
  onSuggestionApply,
  onInsertTemplate,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = {
    student: [
      {
        name: 'Exam Scores',
        description: 'Common exam score format',
        template: '85, 92, 78, 96, 88, 91, 83, 89, 87, 94'
      },
      {
        name: 'Assignment Points',
        description: 'Points out of 100',
        template: '95/100, 88/100, 91/100, 87/100, 93/100'
      },
      {
        name: 'Quiz Grades',
        description: 'Multiple quiz scores',
        template: `Quiz 1: 88
Quiz 2: 92
Quiz 3: 85
Quiz 4: 90
Quiz 5: 87`
      }
    ],
    research: [
      {
        name: 'Scientific Measurements',
        description: 'Precise measurements with uncertainty',
        template: '1.234e-4, 5.678e-4, 2.345e-4, 8.901e-4, 3.456e-4'
      },
      {
        name: 'Concentration Data',
        description: 'Molarity concentrations',
        template: '0.00123, 0.00567, 0.00234, 0.00891, 0.00345'
      },
      {
        name: 'Temperature Readings',
        description: 'Precise temperature data',
        template: '298.15, 298.23, 298.18, 298.31, 298.09, 298.27'
      }
    ],
    teacher: [
      {
        name: 'Grade Book',
        description: 'Student grades with IDs',
        template: `Student001	85	90	88
Student002	92	87	91
Student003	78	82	79
Student004	96	94	98
Student005	83	86	84`
      },
      {
        name: 'Class Averages',
        description: 'Multiple class sections',
        template: 'Period 1: 87.5, Period 2: 91.2, Period 3: 84.8, Period 4: 89.1'
      },
      {
        name: 'Weighted Scores',
        description: 'Scores with different weights',
        template: `Homework: 85 (20%)
Midterm: 92 (30%)  
Final: 88 (30%)
Participation: 95 (20%)`
      }
    ]
  };

  const tips = {
    student: [
      'Separate multiple scores with commas or spaces',
      'You can paste grades directly from emails or documents',
      'Use decimal points for partial credit (e.g., 87.5)',
      'Invalid entries like letters will be automatically ignored'
    ],
    research: [
      'Scientific notation is fully supported (1.23e-4)',
      'High precision decimals are preserved',
      'Outliers will be automatically detected and flagged',
      'Export functionality preserves full precision'
    ],
    teacher: [
      'Paste directly from Excel or Google Sheets',
      'Tab-separated data is automatically detected',
      'Student names and IDs will be filtered out automatically',
      'Batch processing handles large class sizes efficiently'
    ]
  };

  const quickActions = {
    student: [
      { label: 'Format as List', action: 'convert-to-list' },
      { label: 'Remove Duplicates', action: 'remove-duplicates' },
      { label: 'Sort Numbers', action: 'sort-ascending' }
    ],
    research: [
      { label: 'Convert to Scientific', action: 'convert-scientific' },
      { label: 'Normalize Precision', action: 'normalize-precision' },
      { label: 'Remove Outliers', action: 'remove-outliers' }
    ],
    teacher: [
      { label: 'Extract Numbers Only', action: 'extract-numbers' },
      { label: 'Convert Percentages', action: 'convert-percentages' },
      { label: 'Group by Range', action: 'group-ranges' }
    ]
  };

  const handleTemplateSelect = (template: { name: string; template: string }) => {
    setSelectedTemplate(template.name);
    onInsertTemplate(template.template);
  };

  const handleQuickAction = (action: string) => {
    // This would implement the actual transformation logic
    onSuggestionApply(`Applied ${action}`);
  };

  if (!isExpanded) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center text-sm text-blue-700 hover:text-blue-900"
        >
          <Lightbulb className="h-4 w-4 mr-2" />
          Need help with data formatting? Click for assistance
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Lightbulb className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-blue-900">Input Assistant</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-blue-600 hover:text-blue-800"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Quick Templates */}
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <FileText className="h-4 w-4 mr-1" />
            Quick Templates
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {templates[context].map((template, index) => (
              <button
                key={index}
                onClick={() => handleTemplateSelect(template)}
                className="text-left p-2 bg-white border border-blue-200 rounded hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-blue-900 text-xs">{template.name}</div>
                <div className="text-blue-700 text-xs">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <Wand2 className="h-4 w-4 mr-1" />
            Quick Actions
          </h4>
          <div className="flex flex-wrap gap-2">
            {quickActions[context].map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action.action)}
                className="px-3 py-1 bg-white text-blue-700 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context Tips */}
        <div>
          <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
            <Clipboard className="h-4 w-4 mr-1" />
            Tips for {context === 'student' ? 'Students' : context === 'research' ? 'Researchers' : 'Teachers'}
          </h4>
          <ul className="space-y-1">
            {tips[context].map((tip, index) => (
              <li key={index} className="text-xs text-blue-700 flex items-start">
                <span className="text-blue-500 mr-1 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Template Preview */}
        {selectedTemplate && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
            <div className="text-xs text-green-800">
              ✓ Template "{selectedTemplate}" has been applied to your input
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputAssistant;