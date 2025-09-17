'use client'

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { HowtoStep } from '@/lib/services/structured-content';

interface StructuredHowtoStepsProps {
  steps: HowtoStep[];
  title?: string;
  className?: string;
}

export default function StructuredHowtoSteps({ 
  steps, 
  title = "Step-by-Step Guide", 
  className = "" 
}: StructuredHowtoStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1])); // First step expanded by default
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (stepOrder: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepOrder)) {
      newExpanded.delete(stepOrder);
    } else {
      newExpanded.add(stepOrder);
    }
    setExpandedSteps(newExpanded);
  };

  const toggleCompleted = (stepOrder: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepOrder)) {
      newCompleted.delete(stepOrder);
    } else {
      newCompleted.add(stepOrder);
    }
    setCompletedSteps(newCompleted);
  };

  const progressPercentage = (completedSteps.size / steps.length) * 100;

  if (steps.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 ${className}`}>
        <p className="text-gray-600 text-center">No structured steps available for this guide.</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <div className="text-sm text-gray-600">
            {completedSteps.size} of {steps.length} completed
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isExpanded = expandedSteps.has(step.step_order);
          const isCompleted = completedSteps.has(step.step_order);

          return (
            <div 
              key={step.id}
              className={`border rounded-lg transition-all duration-200 ${
                isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Step Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      onClick={() => toggleCompleted(step.step_order)}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-400'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="w-3 h-3" />}
                    </button>

                    {/* Step Content */}
                    <div className="flex-1">
                      <button
                        onClick={() => toggleStep(step.step_order)}
                        className="flex items-center space-x-2 text-left w-full group"
                      >
                        <h4 className={`font-medium transition-colors ${
                          isCompleted 
                            ? 'text-green-800 line-through' 
                            : 'text-gray-900 group-hover:text-blue-600'
                        }`}>
                          {step.name}
                        </h4>
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>

                      {/* Quick Description (always visible) */}
                      <p className={`mt-1 text-sm transition-colors ${
                        isCompleted ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.description.substring(0, 150)}
                        {step.description.length > 150 && '...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 ml-8 space-y-3">
                    {/* Full Description */}
                    {step.description.length > 150 && (
                      <div className="text-gray-700">
                        {step.description}
                      </div>
                    )}

                    {/* Tips and Warnings */}
                    {step.tip && (
                      <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-blue-800 text-sm">Tip</div>
                          <div className="text-blue-700 text-sm">{step.tip}</div>
                        </div>
                      </div>
                    )}

                    {step.warning && (
                      <div className="flex items-start space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-amber-800 text-sm">Warning</div>
                          <div className="text-amber-700 text-sm">{step.warning}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Summary */}
      {completedSteps.size === steps.length && steps.length > 0 && (
        <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <div className="font-medium text-green-800">Congratulations!</div>
              <div className="text-green-700 text-sm">
                You've completed all {steps.length} steps in this guide.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}