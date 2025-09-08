/**
 * Research-grade statistical results display component
 * Provides comprehensive statistical analysis for research scenarios
 */

'use client'

import React, { useState, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Download,
  FileText,
  Calculator,
  Activity,
  Layers,
  PieChart,
  GitBranch,
  Award,
  Brain,
  Settings
} from 'lucide-react';
import HighPrecisionCalculator, { HighPrecisionResult, StatisticalTest, BootstrapResult } from '@/lib/high-precision-calculations';

export interface ResearchResultsProps {
  data: number[];
  precision?: number;
  showBootstrap?: boolean;
  showTests?: boolean;
  showVisualization?: boolean;
  className?: string;
}

const ResearchResults: React.FC<ResearchResultsProps> = ({
  data,
  precision = 6,
  showBootstrap = true,
  showTests = true,
  showVisualization = true,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed' | 'tests' | 'bootstrap' | 'visualization'>('summary');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

  // Calculate results using high-precision calculator
  const results = useMemo(() => {
    if (data.length === 0) return null;
    
    try {
      const calculator = new HighPrecisionCalculator(data);
      return calculator.calculateAll();
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }, [data]);

  // Statistical tests
  const statisticalTests = useMemo(() => {
    if (!results || data.length < 3) return null;

    try {
      const calculator = new HighPrecisionCalculator(data);
      const tests = {
        oneSampleTTest: calculator.oneSampleTTest(results.mean),
        normalityTest: calculator.normalityTest()
      };
      return tests;
    } catch (error) {
      console.error('Statistical tests error:', error);
      return null;
    }
  }, [data, results]);

  // Bootstrap analysis
  const bootstrapResults = useMemo(() => {
    if (!results || data.length < 5 || !showBootstrap) return null;

    try {
      const calculator = new HighPrecisionCalculator(data);
      return calculator.bootstrap(5000, 0.95);
    } catch (error) {
      console.error('Bootstrap analysis error:', error);
      return null;
    }
  }, [data, results, showBootstrap]);

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const formatNumber = (value: any, digits: number = precision) => {
    if (!value || typeof value.toFixed !== 'function') return 'N/A';
    return value.toFixed(digits);
  };

  const getDistributionShape = (skewness: any, kurtosis: any) => {
    if (!skewness || !kurtosis) return 'Unknown';
    
    const skew = parseFloat(skewness.toString());
    const kurt = parseFloat(kurtosis.toString());
    
    if (Math.abs(skew) < 0.5 && Math.abs(kurt) < 0.5) return 'Normal-like';
    if (skew > 0.5) return 'Right-skewed';
    if (skew < -0.5) return 'Left-skewed';
    if (kurt > 0.5) return 'Heavy-tailed';
    if (kurt < -0.5) return 'Light-tailed';
    return 'Non-normal';
  };

  const getOutlierSeverity = (outliers: HighPrecisionResult['outliers']) => {
    const total = outliers.mild.length + outliers.extreme.length;
    const percentage = (total / data.length) * 100;
    
    if (percentage === 0) return { level: 'none', color: 'green', message: 'No outliers detected' };
    if (percentage < 5) return { level: 'low', color: 'yellow', message: 'Few outliers detected' };
    if (percentage < 15) return { level: 'moderate', color: 'orange', message: 'Moderate outliers present' };
    return { level: 'high', color: 'red', message: 'Many outliers detected' };
  };

  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Key Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Mean</p>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(results?.mean, 3)}</p>
            </div>
            <Calculator className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-xs text-blue-600 mt-1">
            95% CI: [{formatNumber(results?.confidenceInterval95.lower, 3)}, {formatNumber(results?.confidenceInterval95.upper, 3)}]
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Std Deviation</p>
              <p className="text-2xl font-bold text-green-900">{formatNumber(results?.standardDeviation, 3)}</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-xs text-green-600 mt-1">
            CV: {formatNumber(results?.coefficientOfVariation, 1)}%
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Sample Size</p>
              <p className="text-2xl font-bold text-purple-900">{results?.count || 0}</p>
            </div>
            <Layers className="h-8 w-8 text-purple-600" />
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Range: {formatNumber(results?.range, 2)}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Distribution</p>
              <p className="text-sm font-bold text-orange-900">
                {getDistributionShape(results?.skewness, results?.kurtosis)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Skew: {formatNumber(results?.skewness, 2)}
          </p>
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2" />
          Data Quality Assessment
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sample Size Assessment */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
              data.length >= 30 ? 'bg-green-100 text-green-600' :
              data.length >= 10 ? 'bg-yellow-100 text-yellow-600' :
              'bg-red-100 text-red-600'
            }`}>
              <Layers className="h-8 w-8" />
            </div>
            <p className="font-medium">Sample Size</p>
            <p className="text-sm text-gray-600">
              {data.length >= 30 ? 'Excellent (n≥30)' :
               data.length >= 10 ? 'Adequate (n≥10)' :
               'Small (n<10)'}
            </p>
          </div>

          {/* Outlier Assessment */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
              results ? `bg-${getOutlierSeverity(results.outliers).color}-100 text-${getOutlierSeverity(results.outliers).color}-600` : 'bg-gray-100 text-gray-600'
            }`}>
              <Target className="h-8 w-8" />
            </div>
            <p className="font-medium">Outliers</p>
            <p className="text-sm text-gray-600">
              {results ? getOutlierSeverity(results.outliers).message : 'N/A'}
            </p>
          </div>

          {/* Normality Assessment */}
          <div className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-2 ${
              statisticalTests?.normalityTest?.significant ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
            }`}>
              <Activity className="h-8 w-8" />
            </div>
            <p className="font-medium">Normality</p>
            <p className="text-sm text-gray-600">
              {statisticalTests?.normalityTest?.significant ? 'Non-normal' : 'Normal-like'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Brain className="h-5 w-5 mr-2" />
          Statistical Recommendations
        </h3>
        
        <div className="space-y-3 text-sm">
          {data.length < 30 && (
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
              <p className="text-gray-700">
                <strong>Small sample size:</strong> Consider collecting more data for robust statistical inference. 
                Current n={data.length}, recommended n≥30 for central limit theorem assumptions.
              </p>
            </div>
          )}
          
          {results && getOutlierSeverity(results.outliers).level !== 'none' && (
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-orange-600 mr-2 mt-0.5" />
              <p className="text-gray-700">
                <strong>Outliers detected:</strong> {results.outliers.extreme.length} extreme and {results.outliers.mild.length} mild outliers found. 
                Consider investigating these values or using robust statistical methods.
              </p>
            </div>
          )}

          {statisticalTests?.normalityTest?.significant && (
            <div className="flex items-start">
              <Info className="h-4 w-4 text-blue-600 mr-2 mt-0.5" />
              <p className="text-gray-700">
                <strong>Non-normal distribution:</strong> Data may not follow normal distribution. 
                Consider non-parametric tests or data transformation for statistical inference.
              </p>
            </div>
          )}

          {results && parseFloat(results.coefficientOfVariation.toString()) > 30 && (
            <div className="flex items-start">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
              <p className="text-gray-700">
                <strong>High variability:</strong> Coefficient of variation is {formatNumber(results.coefficientOfVariation, 1)}%. 
                Data shows high relative variability which may affect statistical power.
              </p>
            </div>
          )}

          <div className="flex items-start">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5" />
            <p className="text-gray-700">
              <strong>Precision level:</strong> Results are displayed with {precision} decimal places. 
              Adjust precision based on your measurement accuracy and research requirements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailedTab = () => (
    <div className="space-y-6">
      {/* Descriptive Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('descriptive')}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Descriptive Statistics
          </h3>
          {expandedSections.has('descriptive') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
        
        {expandedSections.has('descriptive') && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Central Tendency</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mean:</span>
                    <span className="font-mono">{formatNumber(results?.mean)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Median:</span>
                    <span className="font-mono">{formatNumber(results?.median)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode:</span>
                    <span className="font-mono">
                      {results?.mode && results.mode.length > 0 
                        ? results.mode.map(m => formatNumber(m)).join(', ')
                        : 'None'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Variability</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variance:</span>
                    <span className="font-mono">{formatNumber(results?.variance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Std Deviation:</span>
                    <span className="font-mono">{formatNumber(results?.standardDeviation)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Std Error:</span>
                    <span className="font-mono">{formatNumber(results?.standardError)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">CV:</span>
                    <span className="font-mono">{formatNumber(results?.coefficientOfVariation)}%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Range & Quartiles</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min:</span>
                    <span className="font-mono">{formatNumber(results?.min)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Q1:</span>
                    <span className="font-mono">{formatNumber(results?.quartiles.q1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Q3:</span>
                    <span className="font-mono">{formatNumber(results?.quartiles.q3)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max:</span>
                    <span className="font-mono">{formatNumber(results?.max)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">IQR:</span>
                    <span className="font-mono">{formatNumber(results?.quartiles.iqr)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shape Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <button
          onClick={() => toggleSection('shape')}
          className="w-full flex items-center justify-between p-6 text-left"
        >
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Distribution Shape
          </h3>
          {expandedSections.has('shape') ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
        
        {expandedSections.has('shape') && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Skewness & Kurtosis</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skewness:</span>
                    <span className="font-mono">{formatNumber(results?.skewness)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Excess Kurtosis:</span>
                    <span className="font-mono">{formatNumber(results?.kurtosis)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shape:</span>
                    <span className="text-gray-900">{getDistributionShape(results?.skewness, results?.kurtosis)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Interpretation</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Skewness = 0: Symmetric distribution</p>
                  <p>• Skewness {'>'} 0: Right-tailed (positive skew)</p>
                  <p>• Skewness {'<'} 0: Left-tailed (negative skew)</p>
                  <p>• Kurtosis = 0: Normal-like peakedness</p>
                  <p>• Kurtosis {'>'} 0: Heavy tails</p>
                  <p>• Kurtosis {'<'} 0: Light tails</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (!results) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl p-6 text-center ${className}`}>
        <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No data available for analysis</p>
        <p className="text-sm text-gray-500 mt-2">Enter numerical data to see comprehensive statistical results</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Statistical Analysis Results
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Settings className="h-4 w-4" />
            Precision: {precision} digits
          </div>
        </div>
        
        <div className="flex space-x-1 px-6">
          {[
            { id: 'summary', label: 'Summary', icon: Award },
            { id: 'detailed', label: 'Detailed', icon: BarChart3 },
            ...(showTests ? [{ id: 'tests', label: 'Tests', icon: Target }] : []),
            ...(showBootstrap ? [{ id: 'bootstrap', label: 'Bootstrap', icon: GitBranch }] : []),
            ...(showVisualization ? [{ id: 'visualization', label: 'Charts', icon: PieChart }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-1" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'summary' && renderSummaryTab()}
        {activeTab === 'detailed' && renderDetailedTab()}
        {/* Additional tabs would be implemented here */}
      </div>
    </div>
  );
};

export default ResearchResults;