/**
 * Precision control component for decimal places
 * Provides slider and input controls for setting calculation precision
 */

'use client'

import React from 'react';

export interface PrecisionControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
  showPresets?: boolean;
}

const PrecisionControl: React.FC<PrecisionControlProps> = ({
  value,
  onChange,
  min = 0,
  max = 10,
  label = 'Decimal Places',
  className = '',
  showPresets = true
}) => {
  const presets = [
    { value: 0, label: '0 (whole numbers)' },
    { value: 1, label: '1 (tenths)' },
    { value: 2, label: '2 (hundredths)' },
    { value: 4, label: '4 (high precision)' }
  ].filter(preset => preset.value >= min && preset.value <= max);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handlePresetClick = (presetValue: number) => {
    onChange(presetValue);
  };

  return (
    <div className={className}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}: {value}
      </label>

      {/* Slider Control */}
      <div className="mb-4">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((value - min) / (max - min)) * 100}%, #e5e7eb ${((value - min) / (max - min)) * 100}%, #e5e7eb 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{min}</span>
          <span>{Math.floor((min + max) / 2)}</span>
          <span>{max}</span>
        </div>
      </div>

      {/* Direct Input */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm text-gray-600">Exact value:</label>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Preset Buttons */}
      {showPresets && presets.length > 0 && (
        <div>
          <div className="text-xs text-gray-600 mb-2">Quick presets:</div>
          <div className="flex flex-wrap gap-1">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetClick(preset.value)}
                className={`px-2 py-1 text-xs rounded transition-colors duration-200 ${
                  value === preset.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example */}
      <div className="mt-3 text-xs text-gray-500">
        Example: 3.14159 → {(3.14159).toFixed(value)}
      </div>
    </div>
  );
};

export default PrecisionControl;