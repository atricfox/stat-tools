'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, AlertCircle, Lightbulb, Hash } from 'lucide-react';
import type { THowToStep } from '@/lib/content/contentSchema';

interface HowToStepsProps {
  steps: THowToStep[];
  defaultExpanded?: boolean;
  onStepExpand?: (stepId: string, isExpanded: boolean) => void;
}

export default function HowToSteps({ steps, defaultExpanded = false, onStepExpand }: HowToStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Handle deep linking - expand step if hash matches
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.slice(1);
      if (hash.startsWith('step-')) {
        setExpandedSteps(new Set([hash]));
        // Scroll to the step after a brief delay
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      } else if (defaultExpanded) {
        // Expand all steps by default if specified
        setExpandedSteps(new Set(steps.map(s => s.id)));
      }
    }
  }, [steps, defaultExpanded]);

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    const isExpanding = !newExpanded.has(stepId);
    
    if (isExpanding) {
      newExpanded.add(stepId);
    } else {
      newExpanded.delete(stepId);
    }
    
    setExpandedSteps(newExpanded);
    
    // Track event
    if (onStepExpand) {
      onStepExpand(stepId, isExpanding);
    }
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'howto_step_expand', {
        step_id: stepId,
        action: isExpanding ? 'expand' : 'collapse',
        context: 'howto_steps',
      });
    }
  };

  const expandAll = () => {
    setExpandedSteps(new Set(steps.map(s => s.id)));
  };

  const collapseAll = () => {
    setExpandedSteps(new Set());
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Step-by-Step Instructions</h2>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-blue-600 hover:text-blue-700"
            aria-label="Expand all steps"
          >
            Expand All
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-blue-600 hover:text-blue-700"
            aria-label="Collapse all steps"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3" role="list">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          
          return (
            <div
              key={step.id}
              id={step.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden scroll-mt-24"
              role="listitem"
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                aria-expanded={isExpanded}
                aria-controls={`${step.id}-content`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{step.name}</h3>
                  {!isExpanded && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {step.description}
                    </p>
                  )}
                </div>
                
                <a
                  href={`#${step.id}`}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Direct link to ${step.name}`}
                >
                  <Hash className="w-4 h-4" />
                </a>
              </button>

              {/* Step Content */}
              {isExpanded && (
                <div
                  id={`${step.id}-content`}
                  className="px-4 pb-4 pl-14 space-y-3"
                >
                  <p className="text-gray-700">{step.description}</p>
                  
                  {step.tip && (
                    <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-900">Tip</p>
                        <p className="text-sm text-green-700">{step.tip}</p>
                      </div>
                    </div>
                  )}
                  
                  {step.warning && (
                    <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">Warning</p>
                        <p className="text-sm text-amber-700">{step.warning}</p>
                      </div>
                    </div>
                  )}
                  
                  {step.image && (
                    <div className="mt-3">
                      <img
                        src={step.image.url}
                        alt={step.image.alt}
                        className="rounded-lg border border-gray-200"
                        loading="lazy"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-start gap-3">
        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-green-900">All Done!</p>
          <p className="text-sm text-green-700 mt-1">
            You've completed all {steps.length} steps. Great job following along!
          </p>
        </div>
      </div>
    </div>
  );
}