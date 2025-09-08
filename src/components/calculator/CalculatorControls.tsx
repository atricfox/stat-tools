/**
 * Calculator controls component
 * Includes precision control, calculation modes, and action buttons
 */

'use client'

import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Bookmark, 
  Clock,
  Zap,
  Target
} from 'lucide-react';
import PrecisionControl from '@/components/ui/PrecisionControl';

export interface CalculatorControlsProps {
  precision: number;
  onPrecisionChange: (precision: number) => void;
  onCalculate: () => void;
  onClear: () => void;
  onLoadExample: () => void;
  onSaveState?: () => void;
  onLoadState?: () => void;
  autoCalculate?: boolean;
  onAutoCalculateToggle?: (enabled: boolean) => void;
  isCalculating?: boolean;
  showAdvanced?: boolean;
  context?: 'student' | 'research' | 'teacher';
  className?: string;
}

const CalculatorControls: React.FC<CalculatorControlsProps> = ({
  precision,
  onPrecisionChange,
  onCalculate,
  onClear,
  onLoadExample,
  onSaveState,
  onLoadState,
  autoCalculate = true,
  onAutoCalculateToggle,
  isCalculating = false,
  showAdvanced = false,
  context = 'student',
  className = ''
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [calculationMode, setCalculationMode] = useState<'standard' | 'precise' | 'fast'>('standard');

  const contextExamples = {
    student: {
      label: 'Load Grade Example',
      description: 'Typical exam scores'
    },
    research: {
      label: 'Load Research Data',
      description: 'Scientific measurements'
    },
    teacher: {
      label: 'Load Class Data',
      description: 'Student grade sheet'
    }
  };

  const precisionPresets = {
    student: [
      { value: 1, label: 'Basic (0.0)', description: 'Simple grade averages' },
      { value: 2, label: 'Standard (0.00)', description: 'Most grade calculations' },
      { value: 3, label: 'Detailed (0.000)', description: 'Precise GPA calculations' }
    ],
    research: [
      { value: 4, label: 'Standard (0.0000)', description: 'Most measurements' },
      { value: 6, label: 'High (0.000000)', description: 'Precise instruments' },
      { value: 8, label: 'Ultra (0.00000000)', description: 'Lab-grade precision' }
    ],
    teacher: [
      { value: 1, label: 'Whole (0.0)', description: 'Letter grades' },
      { value: 2, label: 'Standard (0.00)', description: 'Grade percentages' },
      { value: 3, label: 'Precise (0.000)', description: 'Weighted averages' }
    ]
  };

  const handleModeChange = (mode: 'standard' | 'precise' | 'fast') => {
    setCalculationMode(mode);
    
    // Adjust precision based on mode
    if (mode === 'fast') {
      onPrecisionChange(1);
    } else if (mode === 'precise') {
      onPrecisionChange(context === 'research' ? 6 : 4);
    } else {
      onPrecisionChange(context === 'research' ? 4 : 2);
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Calculator Settings</h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* Main Controls */}
      <div className="space-y-6">
        {/* Precision Control */}
        <div>
          <PrecisionControl
            value={precision}
            onChange={onPrecisionChange}
            label="Decimal Precision"
            min={0}
            max={context === 'research' ? 10 : 6}
            showPresets={true}
            className="w-full"
          />
          
          {/* Context-specific precision presets */}
          <div className="mt-3">
            <div className="text-xs text-gray-600 mb-2">Quick Presets:</div>
            <div className="flex flex-wrap gap-2">
              {precisionPresets[context].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => onPrecisionChange(preset.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    precision === preset.value
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Mode */}
        {showAdvanced && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calculation Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mode: 'fast' as const, icon: Zap, label: 'Fast', desc: 'Quick calculations' },
                { mode: 'standard' as const, icon: Target, label: 'Standard', desc: 'Balanced accuracy' },
                { mode: 'precise' as const, icon: Settings, label: 'Precise', desc: 'Maximum precision' }
              ].map(({ mode, icon: Icon, label, desc }) => (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    calculationMode === mode
                      ? 'border-blue-300 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 mx-auto mb-1" />
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-xs text-gray-500">{desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Auto-calculation Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto-calculate</label>
            <p className="text-xs text-gray-500">Update results as you type</p>
          </div>
          <button
            onClick={() => onAutoCalculateToggle?.(!autoCalculate)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              autoCalculate ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoCalculate ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-3">
            {/* Primary Actions */}
            <button
              onClick={onCalculate}
              disabled={isCalculating || autoCalculate}
              className={`flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                isCalculating || autoCalculate
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isCalculating ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Calculating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Calculate
                </>
              )}
            </button>

            <button
              onClick={onClear}
              className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </button>

            {/* Secondary Actions */}
            <button
              onClick={onLoadExample}
              className="flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 font-medium transition-colors"
              title={contextExamples[context].description}
            >
              <Upload className="h-4 w-4 mr-2" />
              {contextExamples[context].label}
            </button>

            {onSaveState && (
              <button
                onClick={onSaveState}
                className="flex items-center justify-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium transition-colors"
              >
                <Bookmark className="h-4 w-4 mr-2" />
                Save State
              </button>
            )}
          </div>

          {/* Advanced Actions */}
          {showAdvanced && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {onLoadState && (
                <button
                  onClick={onLoadState}
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm transition-colors"
                >
                  <Clock className="h-3 w-3 mr-2" />
                  Load Saved
                </button>
              )}

              <button
                onClick={() => {/* Implement export settings */}}
                className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 text-sm transition-colors"
              >
                <Download className="h-3 w-3 mr-2" />
                Export Config
              </button>
            </div>
          )}
        </div>

        {/* Context-specific Help */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {context === 'student' && 'Student Tips'}
            {context === 'research' && 'Research Guidelines'}
            {context === 'teacher' && 'Teaching Tools'}
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            {context === 'student' && (
              <>
                <div>• Use 2 decimal places for most grade calculations</div>
                <div>• Auto-calculate helps you see results immediately</div>
                <div>• Save your work to review later</div>
              </>
            )}
            {context === 'research' && (
              <>
                <div>• Higher precision preserves measurement accuracy</div>
                <div>• Precise mode recommended for publication data</div>
                <div>• Document your precision settings for reproducibility</div>
              </>
            )}
            {context === 'teacher' && (
              <>
                <div>• Standard precision works for most grade books</div>
                <div>• Save configurations for different classes</div>
                <div>• Fast mode good for quick grade checks</div>
              </>
            )}
          </div>
        </div>

        {/* Advanced Settings Panel */}
        {showSettings && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Advanced Settings</h4>
            <div className="space-y-4">
              {/* Rounding Method */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Rounding Method
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Round Half Up</option>
                  <option>Round Half Down</option>
                  <option>Round Half to Even</option>
                  <option>Truncate</option>
                </select>
              </div>

              {/* Output Format */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Number Format
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Decimal</option>
                  <option>Scientific Notation</option>
                  <option>Engineering Notation</option>
                </select>
              </div>

              {/* Validation Level */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Data Validation
                </label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Standard</option>
                  <option>Strict</option>
                  <option>Permissive</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalculatorControls;