/**
 * Specialized input component for number data entry
 * Supports multiple formats and real-time validation
 */

'use client'

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  showPreview?: boolean;
  maxLength?: number;
  onValidation?: (isValid: boolean, validCount: number, invalidEntries: string[]) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onChange,
  placeholder = "Enter numbers separated by commas, spaces, or new lines",
  label = "Numbers",
  className = '',
  showPreview = true,
  maxLength = 10000,
  onValidation
}) => {
  const [validation, setValidation] = useState<{
    isValid: boolean;
    validCount: number;
    invalidEntries: string[];
    preview: string;
  }>({ isValid: true, validCount: 0, invalidEntries: [], preview: '' });

  useEffect(() => {
    if (!value.trim()) {
      setValidation({ isValid: true, validCount: 0, invalidEntries: [], preview: '' });
      onValidation?.(true, 0, []);
      return;
    }

    // Parse input and validate
    const entries = value
      .split(/[,\n\s\t]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);

    const validNumbers: number[] = [];
    const invalidEntries: string[] = [];

    entries.forEach(entry => {
      const num = parseFloat(entry);
      if (!isNaN(num) && isFinite(num)) {
        validNumbers.push(num);
      } else if (entry.length > 0) {
        invalidEntries.push(entry);
      }
    });

    const isValid = validNumbers.length > 0;
    const preview = validNumbers.slice(0, 5).join(', ') + 
      (validNumbers.length > 5 ? `... (+${validNumbers.length - 5} more)` : '');

    const newValidation = {
      isValid,
      validCount: validNumbers.length,
      invalidEntries,
      preview
    };

    setValidation(newValidation);
    onValidation?.(isValid, validNumbers.length, invalidEntries);
  }, [value, onValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Input Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full h-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            value && !validation.isValid 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          }`}
          rows={6}
        />
        
        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {value.length}/{maxLength}
        </div>
      </div>

      {/* Validation Status */}
      {value && (
        <div className="mt-2">
          {validation.isValid ? (
            <div className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              {validation.validCount} valid number{validation.validCount !== 1 ? 's' : ''} found
            </div>
          ) : (
            <div className="flex items-center text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              No valid numbers found
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {showPreview && validation.preview && (
        <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs font-medium text-blue-800 mb-1">Preview:</div>
          <div className="text-sm text-blue-700">{validation.preview}</div>
        </div>
      )}

      {/* Invalid Entries Warning */}
      {validation.invalidEntries.length > 0 && (
        <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
          <div className="flex items-center text-xs font-medium text-orange-800 mb-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            {validation.invalidEntries.length} invalid entr{validation.invalidEntries.length !== 1 ? 'ies' : 'y'} will be ignored
          </div>
          <div className="text-xs text-orange-700">
            {validation.invalidEntries.slice(0, 5).join(', ')}
            {validation.invalidEntries.length > 5 && ` (+${validation.invalidEntries.length - 5} more)`}
          </div>
        </div>
      )}
    </div>
  );
};

export default NumberInput;