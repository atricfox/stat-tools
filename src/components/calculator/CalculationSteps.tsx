/**
 * Calculation steps display component
 * Shows detailed mathematical steps for educational purposes
 */

'use client'

import React, { useState } from 'react';
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown, 
  Eye, 
  EyeOff,
  Calculator,
  Target,
  Lightbulb,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from 'lucide-react';

export interface CalculationStep {
  id: string;
  title: string;
  description: string;
  formula: string;
  calculation: string;
  result: string;
  explanation: string;
  tips?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
}

export interface CalculationStepsProps {
  steps: CalculationStep[];
  context?: 'student' | 'research' | 'teacher';
  showFormulas?: boolean;
  showExplanations?: boolean;
  interactive?: boolean;
  animationSpeed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const CalculationSteps: React.FC<CalculationStepsProps> = ({
  steps,
  context = 'student',
  showFormulas = true,
  showExplanations = true,
  interactive = true,
  animationSpeed = 'normal',
  className = ''
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAllFormulas, setShowAllFormulas] = useState(showFormulas);

  // Auto-play animation
  React.useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const delay = animationSpeed === 'slow' ? 3000 : animationSpeed === 'fast' ? 1000 : 2000;
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setExpandedSteps(prev => new Set([...prev, steps[currentStep + 1]?.id]));
      }, delay);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length, animationSpeed]);

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const copyStep = (step: CalculationStep) => {
    const text = `${step.title}\n${step.formula}\n${step.calculation}${step.result ? `\n${step.result}` : ''}`;
    navigator.clipboard.writeText(text);
  };

  const startAnimation = () => {
    setCurrentStep(-1);
    setExpandedSteps(new Set());
    setIsPlaying(true);
    setTimeout(() => setCurrentStep(0), 500);
  };

  const resetSteps = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
    setExpandedSteps(new Set());
  };

  const getDifficultyColor = (difficulty: string = 'basic') => {
    switch (difficulty) {
      case 'basic': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getContextualTips = () => {
    const tips = {
      student: [
        '💡 Check each calculation step carefully',
        '📝 Record the formula for each step',
        '🔍 Understand the meaning of each number'
      ],
      research: [
        '📊 Validate statistical assumptions',
        '🧮 Check calculation precision',
        '📈 Analyze statistical significance of results'
      ],
      teacher: [
        '👥 Emphasize conceptual understanding',
        '✏️ Provide practice opportunities',
        '🎯 Connect to real-world applications'
      ]
    };
    return tips[context];
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-gray-500">{steps.length} steps</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Formula toggle */}
            <button
              onClick={() => setShowAllFormulas(!showAllFormulas)}
              className={`p-2 rounded-lg transition-colors ${
                showAllFormulas 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={showAllFormulas ? 'Hide Formulas' : 'Show Formulas'}
            >
              {showAllFormulas ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>

            {/* Animation controls */}
            {interactive && (
              <>
                <button
                  onClick={isPlaying ? () => setIsPlaying(false) : startAnimation}
                  className={`p-2 rounded-lg transition-colors ${
                    isPlaying 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                  title={isPlaying ? 'Pause Animation' : 'Play Animation'}
                >
                  {isPlaying ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                </button>

                <button
                  onClick={resetSteps}
                  className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Reset Steps"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="p-4 space-y-3">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id);
          const isActive = currentStep >= index;
          const isCurrent = currentStep === index;
          
          return (
            <div
              key={step.id}
              className={`border rounded-lg transition-all duration-500 ${
                isCurrent 
                  ? 'border-blue-400 shadow-md bg-blue-50' 
                  : isActive 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Step Header */}
              <div 
                className={`p-4 cursor-pointer ${interactive ? 'hover:bg-gray-50' : ''}`}
                onClick={() => interactive && toggleStep(step.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    {/* Step number */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                      isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {isActive ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>

                    {/* Step title and difficulty */}
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className={`font-medium ${
                          isCurrent ? 'text-blue-900' : isActive ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h4>
                        {step.difficulty && (
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(step.difficulty)}`}>
                            {step.difficulty}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        isCurrent ? 'text-blue-700' : isActive ? 'text-green-700' : 'text-gray-600'
                      }`}>
                        {step.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyStep(step);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                      title="Copy Step"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                      </svg>
                    </button>
                    
                    {interactive && (
                      <ChevronRight 
                        className={`h-4 w-4 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`} 
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Step Content */}
              {(isExpanded || !interactive) && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  {/* Formula */}
                  {showAllFormulas && step.formula && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Target className="h-4 w-4 text-gray-600 mr-1" />
                        <span className="text-sm font-medium text-gray-700">Formula:</span>
                      </div>
                      <div className="font-mono text-sm text-gray-900 bg-white p-2 rounded border">
                        {step.formula}
                      </div>
                    </div>
                  )}

                  {/* Calculation */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Calculator className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm font-medium text-blue-700">Calculation:</span>
                    </div>
                    <div className="font-mono text-sm">
                      <div className="text-gray-700">{step.calculation}</div>
                      {step.result && (
                        <div className="text-blue-900 font-medium mt-1">{step.result}</div>
                      )}
                    </div>
                  </div>

                  {/* Explanation */}
                  {showExplanations && step.explanation && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center mb-1">
                        <Lightbulb className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-sm font-medium text-green-700">Explanation:</span>
                      </div>
                      <p className="text-sm text-green-800">{step.explanation}</p>
                    </div>
                  )}

                  {/* Tips */}
                  {step.tips && context === 'student' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start">
                        <Lightbulb className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <strong>Tip:</strong> {step.tips}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Context tips */}
      {context === 'student' && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Lightbulb className="h-4 w-4 mr-1" />
            Study Tips
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
            {getContextualTips().map((tip, index) => (
              <div key={index} className="text-gray-700 bg-white p-2 rounded">
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Animation progress */}
      {isPlaying && (
        <div className="px-4 pb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            Step {Math.max(0, currentStep + 1)} / {steps.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculationSteps;