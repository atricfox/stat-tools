import React, { useState, useEffect } from 'react';
import { Calculator, Copy, RotateCcw, HelpCircle, CheckCircle, AlertCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import RelatedTools from '../components/RelatedTools';
import PopularTools from '../components/PopularTools';
import GoogleAdsPlaceholder from '../components/GoogleAdsPlaceholder';

const MeanCalculator = () => {
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  const [result, setResult] = useState<{
    mean: number;
    count: number;
    sum: number;
    steps: string[];
    validNumbers: number[];
    invalidEntries: string[];
  } | null>(null);
  const [showSteps, setShowSteps] = useState(false);
  const [copied, setCopied] = useState(false);

  const parseInput = (inputText: string) => {
    // Support comma, newline, and space separation
    const entries = inputText
      .split(/[,\n\s]+/)
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

    return { validNumbers, invalidEntries };
  };

  const calculateMean = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    const { validNumbers, invalidEntries } = parseInput(input);

    if (validNumbers.length === 0) {
      setResult({
        mean: 0,
        count: 0,
        sum: 0,
        steps: ['No valid numbers found in input'],
        validNumbers: [],
        invalidEntries
      });
      return;
    }

    const sum = validNumbers.reduce((acc, num) => acc + num, 0);
    const mean = sum / validNumbers.length;

    const steps = [
      `Found ${validNumbers.length} valid numbers: ${validNumbers.join(', ')}`,
      `Sum = ${validNumbers.join(' + ')} = ${sum}`,
      `Mean = Sum ÷ Count = ${sum} ÷ ${validNumbers.length} = ${mean.toFixed(precision)}`
    ];

    if (invalidEntries.length > 0) {
      steps.unshift(`Ignored ${invalidEntries.length} invalid entries: ${invalidEntries.join(', ')}`);
    }

    setResult({
      mean: parseFloat(mean.toFixed(precision)),
      count: validNumbers.length,
      sum,
      steps,
      validNumbers,
      invalidEntries
    });
  };

  const copyResult = async () => {
    if (!result) return;
    
    const text = `Mean: ${result.mean}\nCount: ${result.count}\nSum: ${result.sum}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
    setShowSteps(false);
  };

  const loadExample = () => {
    setInput('85, 92, 78, 96, 88, 91, 83, 89');
  };

  useEffect(() => {
    if (input.trim()) {
      calculateMean();
    } else {
      setResult(null);
    }
  }, [input, precision]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Calculators', href: '/#tools' },
        { label: 'Mean Calculator' }
      ]} />
      
      {/* Top Banner Ad - Full Width */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <GoogleAdsPlaceholder size="leaderboard" position="top" />
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Calculator className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Mean Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate the arithmetic mean (average) of your numbers with step-by-step explanations.
            Perfect for students working with exam scores and assignments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Input Your Numbers</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="numbers" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter numbers (separated by commas, spaces, or new lines)
                </label>
                <textarea
                  id="numbers"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="85, 92, 78, 96, 88, 91, 83, 89"
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label htmlFor="precision" className="block text-sm font-medium text-gray-700 mb-2">
                  Decimal Places: {precision}
                </label>
                <input
                  id="precision"
                  type="range"
                  min="0"
                  max="10"
                  value={precision}
                  onChange={(e) => setPrecision(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>5</span>
                  <span>10</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadExample}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                >
                  Load Example
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Results</h2>
            
            {!result ? (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Enter numbers to see the calculation</p>
              </div>
            ) : result.count === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-orange-500" />
                <p className="text-orange-600 font-medium">No valid numbers found</p>
                <p className="text-sm text-gray-500 mt-1">Please check your input format</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Main Result */}
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {result.mean}
                  </div>
                  <div className="text-sm text-blue-600">Mean (Average)</div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{result.count}</div>
                    <div className="text-xs text-gray-600">Numbers</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-900">{result.sum}</div>
                    <div className="text-xs text-gray-600">Sum</div>
                  </div>
                </div>

                {/* Invalid Entries Warning */}
                {result.invalidEntries.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-orange-800">
                        Ignored {result.invalidEntries.length} invalid entries
                      </span>
                    </div>
                    <div className="text-xs text-orange-700">
                      {result.invalidEntries.join(', ')}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={copyResult}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Result
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowSteps(!showSteps)}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    <HelpCircle className="h-4 w-4 mr-1" />
                    {showSteps ? 'Hide' : 'Show'} Steps
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar Components */}
          <GoogleAdsPlaceholder size="rectangle" position="sidebar" />
          <RelatedTools currentTool="Mean Calculator" category="statistics" />
          <PopularTools />
        </div>
        </div>

        {/* Calculation Steps */}
        {showSteps && result && result.count > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Step-by-Step Calculation</h3>
            <div className="space-y-3">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-gray-700">{step}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What is the Mean?</h4>
              <p className="text-sm text-blue-800">
                The mean (or arithmetic average) is calculated by adding all numbers together and dividing by the count of numbers. 
                It represents the central tendency of your data set and is commonly used in academic grading and statistical analysis.
              </p>
            </div>
          </div>
        )}
        
        {/* Bottom Banner Ad */}
        <div className="mt-8">
          <GoogleAdsPlaceholder size="banner" position="bottom" />
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Input Formats</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Comma separated: 85, 92, 78, 96</li>
                <li>• Space separated: 85 92 78 96</li>
                <li>• Line separated (one per line)</li>
                <li>• Mixed formats are supported</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatic invalid entry detection</li>
                <li>• Adjustable decimal precision</li>
                <li>• Step-by-step explanations</li>
                <li>• Copy results to clipboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeanCalculator;