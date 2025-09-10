/**
 * WeightSlider - Interactive slider component for adjusting grade weights
 * Provides visual feedback and real-time updates
 */

import React, { useCallback } from 'react';

interface WeightSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showValue?: boolean;
  showPercentage?: boolean;
  disabled?: boolean;
  description?: string;
  className?: string;
}

export default function WeightSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '%',
  showValue = true,
  showPercentage = true,
  disabled = false,
  description,
  className = ''
}: WeightSliderProps) {
  
  // Handle slider change
  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  }, [onChange]);

  // Handle direct input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  }, [onChange, min, max]);

  // Calculate percentage for visual feedback
  const percentage = ((value - min) / (max - min)) * 100;

  // Get color based on value
  const getSliderColor = () => {
    if (disabled) return 'bg-gray-400';
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getTrackColor = () => {
    if (disabled) return 'bg-gray-200';
    return 'bg-gray-300';
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label and Value */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {showValue && (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              disabled={disabled}
              className={`w-16 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-center ${
                disabled 
                  ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
                  : 'border-gray-300'
              }`}
            />
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        )}
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          disabled={disabled}
          className="sr-only"
          id={`slider-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />
        
        {/* Custom Slider Track */}
        <div 
          className={`w-full h-2 rounded-full ${getTrackColor()}`}
          onClick={(e) => {
            if (disabled) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            const newValue = min + (max - min) * percentage;
            const steppedValue = Math.round(newValue / step) * step;
            const clampedValue = Math.max(min, Math.min(max, steppedValue));
            onChange(clampedValue);
          }}
        >
          {/* Progress Fill */}
          <div 
            className={`h-full rounded-full transition-all duration-200 ${getSliderColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Slider Thumb */}
        <div 
          className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
            disabled 
              ? 'bg-gray-400 cursor-not-allowed' 
              : `${getSliderColor()} cursor-pointer hover:scale-110`
          }`}
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>

      {/* Scale Indicators */}
      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}{unit}</span>
        {showPercentage && (
          <span className={`font-medium ${
            disabled ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {value.toFixed(1)}{unit}
          </span>
        )}
        <span>{max}{unit}</span>
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 mt-1">
          {description}
        </p>
      )}

      {/* Visual feedback for extreme values */}
      {!disabled && (
        <>
          {value >= max * 0.9 && (
            <div className="flex items-center space-x-1 text-xs text-red-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span>High weight - please confirm if reasonable</span>
            </div>
          )}
          {value <= max * 0.1 && value > 0 && (
            <div className="flex items-center space-x-1 text-xs text-yellow-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Low weight - may have minimal impact</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}