/**
 * Precision control component for numerical results
 * Provides adjustable decimal places for different user contexts
 */

'use client'

import React, { useState } from 'react';
import { 
  Settings, 
  Target, 
  Zap, 
  Info,
  ChevronDown,
  Hash
} from 'lucide-react';

export interface PrecisionControlProps {
  precision: number;
  onPrecisionChange: (precision: number) => void;
  userContext?: 'student' | 'research' | 'teacher';
  showAdvanced?: boolean;
  maxPrecision?: number;
  minPrecision?: number;
  isMobile?: boolean;
  className?: string;
}

const PrecisionControl: React.FC<PrecisionControlProps> = ({
  precision,
  onPrecisionChange,
  userContext = 'student',
  showAdvanced = false,
  maxPrecision = 10,
  minPrecision = 0,
  isMobile = false,
  className = ''
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);

  // Preset values for different contexts  
  const presets = {
    student: [
      { value: 0, label: 'Whole', description: 'No decimal places' },
      { value: 1, label: '1 Decimal', description: 'Example: 12.3' },
      { value: 2, label: '2 Decimals', description: 'Example: 12.34' },
      { value: 3, label: '3 Decimals', description: 'Example: 12.345' }
    ],
    research: [
      { value: 2, label: 'Standard', description: 'Standard precision (2 places)' },
      { value: 4, label: 'High', description: 'High precision (4 places)' },
      { value: 6, label: 'Scientific', description: 'Scientific calculation (6 places)' },
      { value: 8, label: 'Ultra-High', description: 'Ultra-high precision (8 places)' }
    ],
    teacher: [
      { value: 0, label: 'Whole', description: 'Integer results' },
      { value: 1, label: 'Tenths', description: 'Tenths place' },
      { value: 2, label: 'Hundredths', description: 'Hundredths place' },
      { value: 4, label: 'Detailed', description: 'Detailed results' }
    ]
  };

  const contextPresets = presets[userContext];
  const currentPreset = contextPresets.find(p => p.value === precision);

  // Smart precision suggestions based on context
  const getSuggestion = () => {
    if (userContext === 'student') {
      return precision > 3 ? 'Student assignments typically use 2-3 decimal places' : '';
    } else if (userContext === 'research') {
      return precision < 4 ? 'Research analysis recommends 4+ decimal places' : '';
    } else {
      return precision > 4 ? 'Teaching demonstrations suggest fewer decimal places' : '';
    }
  };

  const handlePresetClick = (value: number) => {
    onPrecisionChange(value);
  };

  const handleSliderChange = (value: number) => {
    onPrecisionChange(Math.max(minPrecision, Math.min(maxPrecision, value)));
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${isMobile ? 'p-3' : 'p-4'} ${className}`}>
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <div className="flex items-center">
          <Target className={`text-blue-600 mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          <h3 className={`font-medium text-gray-900 ${isMobile ? 'text-xs' : 'text-sm'}`}>Precision</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Current precision display */}
          <div className={`flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Hash className={`mr-1 ${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
            {precision}
          </div>

          {/* Info tooltip */}
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <Info className="h-4 w-4" />
            </button>
            {showTooltip && (
              <div className="absolute right-0 top-6 bg-gray-900 text-white text-xs p-2 rounded shadow-lg z-10 w-48">
                Controls the number of decimal places in results. Higher precision is suitable for scientific calculations, lower precision for daily use.
              </div>
            )}
          </div>

          {/* Advanced toggle */}
          {showAdvanced && (
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`p-1 rounded transition-colors ${
                advancedMode ? 'bg-gray-200 text-gray-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Settings className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quick preset buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {contextPresets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePresetClick(preset.value)}
            className={`p-2 text-left border rounded-lg text-xs transition-all ${
              precision === preset.value
                ? 'border-blue-300 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{preset.label}</div>
            <div className="text-gray-500 text-xs">{preset.description}</div>
          </button>
        ))}
      </div>

      {/* Slider control for advanced mode */}
      {advancedMode && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-700">Custom Precision</label>
            <input
              type="number"
              value={precision}
              onChange={(e) => handleSliderChange(parseInt(e.target.value) || 0)}
              min={minPrecision}
              max={maxPrecision}
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
          <input
            type="range"
            value={precision}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            min={minPrecision}
            max={maxPrecision}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{minPrecision} places</span>
            <span>{maxPrecision} places</span>
          </div>
        </div>
      )}


      {/* Smart suggestions */}
      {getSuggestion() && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <Zap className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Suggestion:</strong> {getSuggestion()}
            </div>
          </div>
        </div>
      )}

      {/* Context-specific tips */}
      {userContext === 'student' && (
        <div className="mt-3 text-xs text-gray-600">
          <strong>Tip:</strong> Assignments and exams typically use 2 decimal places. More digits may make answers appear more complex.
        </div>
      )}
      
      {userContext === 'research' && precision >= 6 && (
        <div className="mt-3 text-xs text-blue-600">
          <strong>Scientific Computing:</strong> High precision is suitable for research analysis, but pay attention to the actual measurement precision of your data.
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .slider::-webkit-slider-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #e5e7eb;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default PrecisionControl;