/**
 * Component for displaying step-by-step calculation explanations
 * Educational tool to help users understand the mathematical process
 */

'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, HelpCircle } from 'lucide-react';

export interface CalculationStepsProps {
  steps: string[];
  title?: string;
  explanation?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const CalculationSteps: React.FC<CalculationStepsProps> = ({
  steps,
  title = 'Step-by-Step Calculation',
  explanation,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (steps.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 text-blue-500 mr-2" />
          <span className="text-lg font-semibold text-gray-900">{title}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6">
          {/* Steps */}
          <div className="space-y-3 mb-6">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  {index + 1}
                </div>
                <div className="text-gray-700 leading-relaxed">{step}</div>
              </div>
            ))}
          </div>

          {/* Educational Explanation */}
          {explanation && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  {explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalculationSteps;