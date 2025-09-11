import React from 'react';
import { RotateCcw } from 'lucide-react';

interface DualValueInputProps {
  theoreticalValue: string;
  experimentalValue: string;
  onTheoreticalChange: (value: string) => void;
  onExperimentalChange: (value: string) => void;
  theoreticalLabel?: string;
  experimentalLabel?: string;
  theoreticalPlaceholder?: string;
  experimentalPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  userMode?: 'student' | 'teacher' | 'research';
  onLoadExample?: () => void;
  onClear?: () => void;
}

export default function DualValueInput({
  theoreticalValue,
  experimentalValue,
  onTheoreticalChange,
  onExperimentalChange,
  theoreticalLabel = "Theoretical Value",
  experimentalLabel = "Experimental Value",
  theoreticalPlaceholder = "Enter theoretical value",
  experimentalPlaceholder = "Enter experimental value",
  disabled = false,
  error,
  userMode = 'student',
  onLoadExample,
  onClear
}: DualValueInputProps) {
  // Adjust labels based on user mode
  const getLabels = () => {
    switch (userMode) {
      case 'teacher':
        return {
          theoretical: "Expected Value",
          experimental: "Student Result",
          theoreticalPlaceholder: "Enter expected score",
          experimentalPlaceholder: "Enter student score"
        };
      case 'research':
        return {
          theoretical: "Theoretical Value",
          experimental: "Measured Value",
          theoreticalPlaceholder: "Enter theoretical value",
          experimentalPlaceholder: "Enter measured value"
        };
      default:
        return {
          theoretical: "Theoretical Value",
          experimental: "Experimental Value",
          theoreticalPlaceholder: "Enter theoretical value",
          experimentalPlaceholder: "Enter experimental value"
        };
    }
  };

  const labels = getLabels();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Theoretical Value Input */}
        <div>
          <label 
            htmlFor="theoretical-input" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {theoreticalLabel || labels.theoretical}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="theoretical-input"
            type="text"
            value={theoreticalValue}
            onChange={(e) => onTheoreticalChange(e.target.value)}
            placeholder={theoreticalPlaceholder || labels.theoreticalPlaceholder}
            disabled={disabled}
            className={`
              w-full px-4 py-3 text-lg border rounded-lg shadow-sm
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            inputMode="decimal"
            autoComplete="off"
          />
        </div>

        {/* Experimental Value Input */}
        <div>
          <label 
            htmlFor="experimental-input" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {experimentalLabel || labels.experimental}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            id="experimental-input"
            type="text"
            value={experimentalValue}
            onChange={(e) => onExperimentalChange(e.target.value)}
            placeholder={experimentalPlaceholder || labels.experimentalPlaceholder}
            disabled={disabled}
            className={`
              w-full px-4 py-3 text-lg border rounded-lg shadow-sm
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? 'border-red-300 bg-red-50' : 'border-gray-300'}
            `}
            inputMode="decimal"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg 
              className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Input Hints */}
      <div className="text-sm text-gray-500">
        <p className="mb-1">
          <strong>Input Format:</strong> Supports integers, decimals, and scientific notation
          {userMode === 'research' && ' (e.g., 1.23e-5)'}
        </p>
        {userMode === 'teacher' && (
          <p className="text-blue-600">
            <strong>Tip:</strong> Suitable for grade analysis, typically range 0-150 points
          </p>
        )}
        {userMode === 'student' && (
          <p className="text-green-600">
            <strong>Example:</strong> Theoretical 9.8, Experimental 9.6
          </p>
        )}
        {userMode === 'research' && (
          <p className="text-purple-600">
            <strong>Research Mode:</strong> Supports high-precision values and scientific notation
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(onLoadExample || onClear) && (
        <div className="flex gap-2 pt-2">
          {onLoadExample && (
            <button
              onClick={onLoadExample}
              disabled={disabled}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Load Example
            </button>
          )}
          {onClear && (
            <button
              onClick={onClear}
              disabled={disabled}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
              title="Clear all values"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}