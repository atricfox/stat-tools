/**
 * Data cleaning wizard for teacher scenarios
 * Provides intelligent data validation and cleaning with educational guidance
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Wand2,
  Eye,
  EyeOff,
  Settings,
  BarChart3,
  Target,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Lightbulb,
  TrendingUp,
  Users,
  FileText,
  Award
} from 'lucide-react';
import DataCleaner, {
  CleaningResult,
  DataIssue,
  TeacherDataProfile,
  CleaningOptions
} from '@/lib/data-cleaner';

export interface DataCleaningWizardProps {
  rawData: any[];
  onCleanedData: (cleanedData: number[], result: CleaningResult) => void;
  onProfileDetected?: (profile: TeacherDataProfile) => void;
  className?: string;
}

type WizardStep = 'analysis' | 'issues' | 'options' | 'review' | 'results';

const DataCleaningWizard: React.FC<DataCleaningWizardProps> = ({
  rawData,
  onCleanedData,
  onProfileDetected,
  className = ''
}) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('analysis');
  const [profile, setProfile] = useState<TeacherDataProfile | null>(null);
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [cleaningOptions, setCleaningOptions] = useState<Partial<CleaningOptions>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<Set<number>>(new Set());
  const [autoFixMode, setAutoFixMode] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  // Analyze data profile on mount or data change
  useEffect(() => {
    if (rawData.length > 0) {
      const dataProfile = DataCleaner.analyzeDataProfile(rawData);
      setProfile(dataProfile);
      setCleaningOptions(dataProfile.suggestions.recommendedOptions);
      onProfileDetected?.(dataProfile);
    }
  }, [rawData, onProfileDetected]);

  const handleAutoFix = useCallback(async () => {
    if (rawData.length === 0) return;

    const result = DataCleaner.autoFixData(rawData, autoFixMode);
    setCleaningResult(result);
    
    if (result.cleanedData.length > 0) {
      onCleanedData(result.cleanedData, result);
      setCurrentStep('results');
    }
  }, [rawData, autoFixMode, onCleanedData]);

  const handleCustomClean = useCallback(async () => {
    if (rawData.length === 0) return;

    const result = DataCleaner.cleanData(rawData, cleaningOptions);
    setCleaningResult(result);
    
    if (result.cleanedData.length > 0) {
      onCleanedData(result.cleanedData, result);
      setCurrentStep('results');
    }
  }, [rawData, cleaningOptions, onCleanedData]);

  const handleValidateGradebook = useCallback(() => {
    if (rawData.length === 0) return;

    const result = DataCleaner.validateGradebook(rawData);
    setCleaningResult(result);
    setCurrentStep('issues');
  }, [rawData]);

  const getSeverityColor = (severity: DataIssue['severity']) => {
    switch (severity) {
      case 'low': return 'text-yellow-600 bg-yellow-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'high': return 'text-red-600 bg-red-100';
      case 'critical': return 'text-red-800 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: DataIssue['type']) => {
    switch (type) {
      case 'missing': return <XCircle className="h-4 w-4" />;
      case 'invalid': return <AlertTriangle className="h-4 w-4" />;
      case 'outlier': return <TrendingUp className="h-4 w-4" />;
      case 'duplicate': return <Target className="h-4 w-4" />;
      case 'format': return <FileText className="h-4 w-4" />;
      case 'range': return <BarChart3 className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const renderAnalysisStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Analysis</h2>
        <p className="text-gray-600">Understanding your data to provide the best cleaning recommendations</p>
      </div>

      {profile && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Profile Detected</h3>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile.confidence > 0.8 ? 'bg-green-100 text-green-800' :
              profile.confidence > 0.6 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {Math.round(profile.confidence * 100)}% confidence
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pattern Analysis</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{profile.pattern}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Headers:</span>
                  <span className="font-medium">{profile.characteristics.hasHeaders ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Common Formats:</span>
                  <span className="font-medium">{profile.characteristics.commonFormats.join(', ') || 'None'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <div className="text-sm space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900 mb-1">Strategy:</div>
                  <div className="text-blue-800">{profile.suggestions.cleaningStrategy}</div>
                </div>
                {profile.suggestions.warnings.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="font-medium text-yellow-900 mb-1">Warnings:</div>
                    <ul className="text-yellow-800 text-xs space-y-1">
                      {profile.suggestions.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleAutoFix}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Auto-Fix (Recommended)
            </button>
            
            <button
              onClick={() => setCurrentStep('options')}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4 mr-2" />
              Custom Options
            </button>

            {profile.pattern === 'gradebook' && (
              <button
                onClick={handleValidateGradebook}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
              >
                <Award className="h-4 w-4 mr-2" />
                Gradebook Mode
              </button>
            )}
          </div>
        </div>
      )}

      {/* Auto-fix mode selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auto-Fix Aggressiveness</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              mode: 'conservative' as const,
              title: 'Conservative',
              description: 'Minimal changes, flag issues for review',
              icon: Shield,
              color: 'green'
            },
            {
              mode: 'moderate' as const,
              title: 'Moderate',
              description: 'Balance between cleaning and preservation',
              icon: Target,
              color: 'blue'
            },
            {
              mode: 'aggressive' as const,
              title: 'Aggressive',
              description: 'Maximum cleaning, may remove valid data',
              icon: Wand2,
              color: 'red'
            }
          ].map(({ mode, title, description, icon: Icon, color }) => (
            <button
              key={mode}
              onClick={() => setAutoFixMode(mode)}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                autoFixMode === mode
                  ? `border-${color}-300 bg-${color}-50`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon className={`h-6 w-6 ${autoFixMode === mode ? `text-${color}-600` : 'text-gray-400'} mb-2`} />
              <div className={`font-medium ${autoFixMode === mode ? `text-${color}-900` : 'text-gray-900'}`}>
                {title}
              </div>
              <div className={`text-sm mt-1 ${autoFixMode === mode ? `text-${color}-700` : 'text-gray-600'}`}>
                {description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIssuesStep = () => {
    if (!cleaningResult) return null;

    const issuesByType = cleaningResult.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, DataIssue[]>);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issues Detected</h2>
          <p className="text-gray-600">Review and decide how to handle each type of issue</p>
        </div>

        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Issues Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(issuesByType).map(([type, issues]) => (
              <div key={type} className="text-center">
                <div className="text-2xl font-bold text-red-600">{issues.length}</div>
                <div className="text-sm text-gray-600 capitalize">{type} Issues</div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Issues */}
        <div className="space-y-4">
          {Object.entries(issuesByType).map(([type, issues]) => (
            <div key={type} className="bg-white border border-gray-200 rounded-xl">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getTypeIcon(type as DataIssue['type'])}
                    <h4 className="font-medium text-gray-900 ml-2 capitalize">{type} Issues</h4>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      {issues.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newSelected = new Set(selectedIssues);
                      const issueIndices = issues.map((_, i) => parseInt(`${type}_${i}`));
                      
                      const allSelected = issueIndices.every(i => selectedIssues.has(i));
                      if (allSelected) {
                        issueIndices.forEach(i => newSelected.delete(i));
                      } else {
                        issueIndices.forEach(i => newSelected.add(i));
                      }
                      
                      setSelectedIssues(newSelected);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {issues.every((_, i) => selectedIssues.has(parseInt(`${type}_${i}`))) ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {issues.slice(0, 10).map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 border rounded-lg ${
                        selectedIssues.has(parseInt(`${type}_${index}`))
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedIssues.has(parseInt(`${type}_${index}`))}
                            onChange={(e) => {
                              const newSelected = new Set(selectedIssues);
                              const key = parseInt(`${type}_${index}`);
                              if (e.target.checked) {
                                newSelected.add(key);
                              } else {
                                newSelected.delete(key);
                              }
                              setSelectedIssues(newSelected);
                            }}
                            className="mr-3"
                          />
                          <span className="text-sm font-medium">Row {issue.index + 1}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        Value: <code className="bg-gray-100 px-1 rounded">{String(issue.value)}</code>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        {issue.message}
                      </div>

                      {issue.suggestions.length > 0 && (
                        <div className="text-xs text-gray-500">
                          <strong>Suggestions:</strong> {issue.suggestions.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {issues.length > 10 && (
                    <div className="text-sm text-gray-500 text-center py-2">
                      ... and {issues.length - 10} more issues
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentStep('analysis')}
            className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Back to Analysis
          </button>
          
          <button
            onClick={() => setCurrentStep('options')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Configure Cleaning Options
          </button>
        </div>
      </div>
    );
  };

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Settings className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Cleaning Options</h2>
        <p className="text-gray-600">Customize how your data should be cleaned</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="space-y-6">
          {/* Missing Values */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Handle Missing Values
            </label>
            <select
              value={cleaningOptions.handleMissing || 'remove'}
              onChange={(e) => setCleaningOptions(prev => ({
                ...prev,
                handleMissing: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="remove">Remove rows with missing values</option>
              <option value="mean">Replace with mean</option>
              <option value="median">Replace with median</option>
              <option value="zero">Replace with zero</option>
              <option value="flag">Flag for teacher review</option>
              <option value="interpolate">Interpolate from neighbors</option>
            </select>
          </div>

          {/* Outliers */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Outlier Detection Method
            </label>
            <select
              value={cleaningOptions.outlierMethod || 'iqr'}
              onChange={(e) => setCleaningOptions(prev => ({
                ...prev,
                outlierMethod: e.target.value as any
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">No outlier detection</option>
              <option value="iqr">Interquartile Range (IQR)</option>
              <option value="zscore">Z-Score</option>
              <option value="modified-zscore">Modified Z-Score</option>
            </select>
          </div>

          {/* Range Validation */}
          {profile?.pattern === 'gradebook' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Minimum Valid Score
                </label>
                <input
                  type="number"
                  value={cleaningOptions.validateRange?.min || 0}
                  onChange={(e) => setCleaningOptions(prev => ({
                    ...prev,
                    validateRange: {
                      ...prev.validateRange,
                      min: parseFloat(e.target.value) || 0,
                      max: prev.validateRange?.max || 100
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Maximum Valid Score
                </label>
                <input
                  type="number"
                  value={cleaningOptions.validateRange?.max || 100}
                  onChange={(e) => setCleaningOptions(prev => ({
                    ...prev,
                    validateRange: {
                      min: prev.validateRange?.min || 0,
                      max: parseFloat(e.target.value) || 100
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={cleaningOptions.removeDuplicates || false}
                onChange={(e) => setCleaningOptions(prev => ({
                  ...prev,
                  removeDuplicates: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Remove duplicate values</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={cleaningOptions.preserveOriginal !== false}
                onChange={(e) => setCleaningOptions(prev => ({
                  ...prev,
                  preserveOriginal: e.target.checked
                }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Preserve original data for comparison</span>
            </label>
          </div>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setCurrentStep('analysis')}
          className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleCustomClean}
          className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
        >
          Apply Cleaning
        </button>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    if (!cleaningResult) return null;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cleaning Complete</h2>
          <p className="text-gray-600">Your data has been successfully processed</p>
        </div>

        {/* Stats Summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{cleaningResult.stats.totalItems}</div>
              <div className="text-sm text-gray-600">Original Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{cleaningResult.stats.validItems}</div>
              <div className="text-sm text-gray-600">Valid Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{cleaningResult.stats.modifiedItems}</div>
              <div className="text-sm text-gray-600">Modified Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{cleaningResult.stats.removedItems}</div>
              <div className="text-sm text-gray-600">Removed Items</div>
            </div>
          </div>

          <div className={`p-4 rounded-lg ${
            cleaningResult.confidence >= 80 ? 'bg-green-50 border border-green-200' :
            cleaningResult.confidence >= 60 ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center mb-2">
              <Award className={`h-5 w-5 mr-2 ${
                cleaningResult.confidence >= 80 ? 'text-green-600' :
                cleaningResult.confidence >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`} />
              <span className="font-medium">Cleaning Confidence: {cleaningResult.confidence}%</span>
            </div>
            <p className={`text-sm ${
              cleaningResult.confidence >= 80 ? 'text-green-700' :
              cleaningResult.confidence >= 60 ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {cleaningResult.confidence >= 80 ? 'High confidence in cleaning quality' :
               cleaningResult.confidence >= 60 ? 'Moderate confidence - review recommended' :
               'Low confidence - manual review strongly recommended'}
            </p>
          </div>
        </div>

        {/* Recommendations */}
        {cleaningResult.recommendations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Recommendations
            </h3>
            <ul className="space-y-2">
              {cleaningResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 mr-3 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => {
              setCurrentStep('analysis');
              setCleaningResult(null);
            }}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Start New Cleaning
          </button>
        </div>
      </div>
    );
  };

  const stepComponents = {
    analysis: renderAnalysisStep,
    issues: renderIssuesStep,
    options: renderOptionsStep,
    review: renderOptionsStep, // Placeholder
    results: renderResultsStep
  };

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {(['analysis', 'options', 'results'] as WizardStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step
                  ? 'bg-blue-600 text-white'
                  : Object.keys(stepComponents).indexOf(currentStep) > index
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {Object.keys(stepComponents).indexOf(currentStep) > index ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 2 && (
                <div className={`w-12 h-1 mx-2 ${
                  Object.keys(stepComponents).indexOf(currentStep) > index ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-96">
        {stepComponents[currentStep]?.()}
      </div>
    </div>
  );
};

export default DataCleaningWizard;