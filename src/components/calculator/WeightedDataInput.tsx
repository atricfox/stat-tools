/**
 * Weighted data input component for weighted mean calculations
 * Supports three input modes: pairs, columns, and manual entry
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Calculator, 
  FileText, 
  Edit3, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Plus,
  Trash2,
  RotateCcw 
} from 'lucide-react';
import { WeightedPair, InputMode, UserMode } from '@/types/weightedMean';
import { parseNumericValue } from '@/lib/weightedMeanCalculation';

export interface WeightedDataInputProps {
  inputMode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onDataChange: (pairs: WeightedPair[]) => void;
  userMode: UserMode;
  className?: string;
  disabled?: boolean;
}

interface ManualPair {
  value: string;
  weight: string;
  id: string;
}

const WeightedDataInput: React.FC<WeightedDataInputProps> = ({
  inputMode,
  onModeChange,
  onDataChange,
  userMode,
  className = '',
  disabled = false
}) => {
  // Input state for different modes
  const [pairsInput, setPairsInput] = useState('');
  const [valuesInput, setValuesInput] = useState('');
  const [weightsInput, setWeightsInput] = useState('');
  const [manualPairs, setManualPairs] = useState<ManualPair[]>([
    { value: '', weight: '', id: 'pair-0' }
  ]);

  // Validation and feedback state
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    parsedCount: number;
  } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // Context-specific configurations
  const modeConfig = {
    pairs: {
      label: 'Value:Weight Pairs',
      placeholder: userMode === 'student' 
        ? 'Enter grade:credits pairs (one per line)\nExample:\n92:3\n88:4\n95:3'
        : userMode === 'research'
        ? 'Enter value:weight pairs\nExample:\n12.5:0.3\n15.2:0.25\n11.8:0.45'
        : 'Enter score:weight pairs\nExample:\n85:0.3\n92:0.4\n88:0.3',
      helpText: 'One pair per line, supports formats: value:weight, value,weight, or value weight',
      icon: FileText
    },
    columns: {
      label: 'Separate Columns',
      placeholder: {
        values: userMode === 'student' ? 'Grades: 92, 88, 95, 87' : 'Values: 12.5, 15.2, 11.8',
        weights: userMode === 'student' ? 'Credits: 3, 4, 3, 2' : 'Weights: 0.3, 0.25, 0.45'
      },
      helpText: 'Enter values and weights in separate fields, same order in both',
      icon: Calculator
    },
    manual: {
      label: 'Manual Entry',
      helpText: 'Add pairs one by one with individual input fields',
      icon: Edit3
    }
  };

  /**
   * Parse pairs input (value:weight format)
   */
  const parsePairsInput = useCallback((input: string): WeightedPair[] => {
    const pairs: WeightedPair[] = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      // Support formats: "value:weight", "value,weight", "value weight"
      const match = line.match(/([+-]?[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?)[\s:,]+([+-]?[0-9]*\.?[0-9]+(?:[eE][+-]?[0-9]+)?)/);
      if (match) {
        const value = parseNumericValue(match[1]);
        const weight = parseNumericValue(match[2]);
        
        if (value !== null && weight !== null) {
          pairs.push({ 
            value, 
            weight, 
            id: `pair-${index}` 
          });
        }
      }
    });
    
    return pairs;
  }, []);

  /**
   * Parse columns input (separate values and weights)
   */
  const parseColumnsInput = useCallback((valuesText: string, weightsText: string): WeightedPair[] => {
    const values = valuesText.split(/[,\n\s]+/)
      .map(v => parseNumericValue(v.trim()))
      .filter(v => v !== null) as number[];
    
    const weights = weightsText.split(/[,\n\s]+/)
      .map(w => parseNumericValue(w.trim()))
      .filter(w => w !== null) as number[];
    
    const pairs: WeightedPair[] = [];
    const minLength = Math.min(values.length, weights.length);
    
    for (let i = 0; i < minLength; i++) {
      pairs.push({
        value: values[i],
        weight: weights[i],
        id: `pair-${i}`
      });
    }
    
    return pairs;
  }, []);

  /**
   * Parse manual input pairs
   */
  const parseManualInput = useCallback((): WeightedPair[] => {
    const pairs: WeightedPair[] = [];
    
    manualPairs.forEach(pair => {
      const value = parseNumericValue(pair.value);
      const weight = parseNumericValue(pair.weight);
      
      if (value !== null && weight !== null) {
        pairs.push({
          value,
          weight,
          id: pair.id
        });
      }
    });
    
    return pairs;
  }, [manualPairs]);

  /**
   * Validate and parse data based on current input mode
   */
  const validateAndParseData = useCallback(() => {
    let pairs: WeightedPair[] = [];
    
    try {
      switch (inputMode) {
        case 'pairs':
          pairs = parsePairsInput(pairsInput);
          break;
        case 'columns':
          pairs = parseColumnsInput(valuesInput, weightsInput);
          break;
        case 'manual':
          pairs = parseManualInput();
          break;
      }

      const isValid = pairs.length > 0;
      const message = isValid 
        ? `Successfully parsed ${pairs.length} value:weight pairs`
        : 'No valid pairs found. Please check your input format.';

      setValidationResult({
        isValid,
        message,
        parsedCount: pairs.length
      });

      onDataChange(pairs);
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: error instanceof Error ? error.message : 'Parsing error occurred',
        parsedCount: 0
      });
      onDataChange([]);
    }
  }, [inputMode, pairsInput, valuesInput, weightsInput, manualPairs, parsePairsInput, parseColumnsInput, parseManualInput, onDataChange]);

  // Auto-validate when inputs change
  useEffect(() => {
    const timeoutId = setTimeout(validateAndParseData, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [validateAndParseData]);

  /**
   * Manual mode functions
   */
  const addManualPair = () => {
    const newId = `pair-${Date.now()}`;
    setManualPairs([...manualPairs, { value: '', weight: '', id: newId }]);
  };

  const removeManualPair = (id: string) => {
    if (manualPairs.length > 1) {
      setManualPairs(manualPairs.filter(pair => pair.id !== id));
    }
  };

  const updateManualPair = (id: string, field: 'value' | 'weight', newValue: string) => {
    setManualPairs(manualPairs.map(pair => 
      pair.id === id ? { ...pair, [field]: newValue } : pair
    ));
  };

  /**
   * Clear all inputs
   */
  const clearAllInputs = () => {
    setPairsInput('');
    setValuesInput('');
    setWeightsInput('');
    setManualPairs([{ value: '', weight: '', id: 'pair-0' }]);
    setValidationResult(null);
    onDataChange([]);
  };

  /**
   * Load example data
   */
  const loadExample = () => {
    const exampleData = userMode === 'student' 
      ? { pairs: '92:3\n88:4\n95:3\n87:2\n91:3', values: '92, 88, 95, 87, 91', weights: '3, 4, 3, 2, 3' }
      : userMode === 'research'
      ? { pairs: '12.5:0.3\n15.2:0.25\n11.8:0.45\n14.1:0.15\n13.7:0.1', values: '12.5, 15.2, 11.8, 14.1, 13.7', weights: '0.3, 0.25, 0.45, 0.15, 0.1' }
      : { pairs: '85:0.3\n92:0.4\n88:0.2\n90:0.1', values: '85, 92, 88, 90', weights: '0.3, 0.4, 0.2, 0.1' };

    switch (inputMode) {
      case 'pairs':
        setPairsInput(exampleData.pairs);
        break;
      case 'columns':
        setValuesInput(exampleData.values);
        setWeightsInput(exampleData.weights);
        break;
      case 'manual':
        const pairLines = exampleData.pairs.split('\n');
        const newManualPairs = pairLines.map((line, index) => {
          const [value, weight] = line.split(':');
          return { value, weight, id: `pair-${index}` };
        });
        setManualPairs(newManualPairs);
        break;
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header with mode selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Data Input</h3>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Show input format help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>

        {/* Input mode selector */}
        <div className="flex bg-gray-50 rounded-lg p-1">
          {(['pairs', 'columns', 'manual'] as const).map((mode) => {
            const config = modeConfig[mode];
            const Icon = config.icon;
            return (
              <button
                key={mode}
                onClick={() => onModeChange(mode)}
                disabled={disabled}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
                  inputMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input content area */}
      <div className="p-6">
        {/* Help text */}
        {showHelp && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex">
              <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">{modeConfig[inputMode].label}</p>
                <p>{modeConfig[inputMode].helpText}</p>
              </div>
            </div>
          </div>
        )}

        {/* Pairs input mode */}
        {inputMode === 'pairs' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modeConfig.pairs.label}
              </label>
              <textarea
                value={pairsInput}
                onChange={(e) => setPairsInput(e.target.value)}
                placeholder={modeConfig.pairs.placeholder}
                disabled={disabled}
                className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm disabled:opacity-50"
              />
            </div>
          </div>
        )}

        {/* Columns input mode */}
        {inputMode === 'columns' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userMode === 'student' ? 'Grades' : 'Values'}
                </label>
                <textarea
                  value={valuesInput}
                  onChange={(e) => setValuesInput(e.target.value)}
                  placeholder={modeConfig.columns.placeholder.values}
                  disabled={disabled}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userMode === 'student' ? 'Credits' : 'Weights'}
                </label>
                <textarea
                  value={weightsInput}
                  onChange={(e) => setWeightsInput(e.target.value)}
                  placeholder={modeConfig.columns.placeholder.weights}
                  disabled={disabled}
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Manual input mode */}
        {inputMode === 'manual' && (
          <div className="space-y-4">
            <div className="space-y-3">
              {manualPairs.map((pair, index) => (
                <div key={pair.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={userMode === 'student' ? 'Grade' : 'Value'}
                      value={pair.value}
                      onChange={(e) => updateManualPair(pair.id, 'value', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder={userMode === 'student' ? 'Credits' : 'Weight'}
                      value={pair.weight}
                      onChange={(e) => updateManualPair(pair.id, 'weight', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>
                  <button
                    onClick={() => removeManualPair(pair.id)}
                    disabled={disabled || manualPairs.length === 1}
                    className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                    title="Remove pair"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addManualPair}
              disabled={disabled}
              className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add {userMode === 'student' ? 'Course' : 'Pair'}
            </button>
          </div>
        )}

        {/* Validation feedback */}
        {validationResult && (
          <div className={`mt-4 p-3 rounded-lg border ${
            validationResult.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex">
              {validationResult.isValid ? (
                <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
              )}
              <p className={`text-sm ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.message}
              </p>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={loadExample}
            disabled={disabled}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
          >
            Load Example
          </button>
          <button
            onClick={clearAllInputs}
            disabled={disabled}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50"
            title="Clear all inputs"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeightedDataInput;