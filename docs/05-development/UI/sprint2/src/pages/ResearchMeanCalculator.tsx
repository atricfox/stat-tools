import React, { useState, useEffect } from 'react';
import { Microscope, Share2, Download, AlertTriangle, CheckCircle, Copy, RotateCcw } from 'lucide-react';

const ResearchMeanCalculator = () => {
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(4);
  const [ignoreOutliers, setIgnoreOutliers] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [result, setResult] = useState<{
    mean: number;
    count: number;
    sum: number;
    stdError: number;
    confidenceInterval: [number, number];
    outliers: number[];
    validNumbers: number[];
    steps: string[];
    shareUrl: string;
  } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [copied, setCopied] = useState(false);

  const detectOutliers = (numbers: number[]) => {
    if (numbers.length < 4) return [];
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return numbers.filter(num => num < lowerBound || num > upperBound);
  };

  const calculateStats = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    const entries = input
      .split(/[,\n\s]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);

    const validNumbers = entries
      .map(entry => parseFloat(entry))
      .filter(num => !isNaN(num) && isFinite(num));

    if (validNumbers.length === 0) {
      setResult(null);
      return;
    }

    const outliers = detectOutliers(validNumbers);
    const dataToUse = ignoreOutliers 
      ? validNumbers.filter(num => !outliers.includes(num))
      : validNumbers;

    if (dataToUse.length === 0) {
      setResult(null);
      return;
    }

    const sum = dataToUse.reduce((acc, num) => acc + num, 0);
    const mean = sum / dataToUse.length;
    
    // Calculate standard error
    const variance = dataToUse.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / (dataToUse.length - 1);
    const stdError = Math.sqrt(variance / dataToUse.length);
    
    // Calculate confidence interval
    const tValue = getTValue(confidenceLevel, dataToUse.length - 1);
    const marginOfError = tValue * stdError;
    const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError];

    const steps = [
      `Dataset: ${dataToUse.length} data points`,
      `Sum = ${sum.toFixed(precision)}`,
      `Mean = ${sum.toFixed(precision)} ÷ ${dataToUse.length} = ${mean.toFixed(precision)}`,
      `Standard Error = ${stdError.toFixed(precision)}`,
      `${confidenceLevel}% Confidence Interval: [${confidenceInterval[0].toFixed(precision)}, ${confidenceInterval[1].toFixed(precision)}]`
    ];

    if (outliers.length > 0) {
      steps.unshift(`Detected ${outliers.length} potential outliers: ${outliers.map(o => o.toFixed(2)).join(', ')}`);
      if (ignoreOutliers) {
        steps.push(`Outliers excluded from calculation`);
      }
    }

    // Generate share URL
    const params = new URLSearchParams({
      data: input,
      precision: precision.toString(),
      ignoreOutliers: ignoreOutliers.toString(),
      confidence: confidenceLevel.toString()
    });
    const shareUrl = `${window.location.origin}${window.location.pathname}?${params.toString()}`;

    setResult({
      mean: parseFloat(mean.toFixed(precision)),
      count: dataToUse.length,
      sum: parseFloat(sum.toFixed(precision)),
      stdError: parseFloat(stdError.toFixed(precision)),
      confidenceInterval: [
        parseFloat(confidenceInterval[0].toFixed(precision)),
        parseFloat(confidenceInterval[1].toFixed(precision))
      ],
      outliers,
      validNumbers,
      steps,
      shareUrl
    });
  };

  const getTValue = (confidence: number, df: number) => {
    // Simplified t-value lookup for common confidence levels
    const tTable: { [key: number]: { [key: number]: number } } = {
      90: { 1: 6.314, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697, 100: 1.660 },
      95: { 1: 12.706, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042, 100: 1.984 },
      99: { 1: 63.657, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750, 100: 2.626 }
    };

    const confidenceTable = tTable[confidence] || tTable[95];
    const dfKeys = Object.keys(confidenceTable).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < dfKeys.length; i++) {
      if (df <= dfKeys[i]) {
        return confidenceTable[dfKeys[i]];
      }
    }
    
    return confidenceTable[100] || 1.96;
  };

  const copyShareUrl = async () => {
    if (!result) return;
    
    await navigator.clipboard.writeText(result.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportReport = () => {
    if (!result) return;

    const report = `Research Mean Calculation Report
Generated: ${new Date().toLocaleString()}

Dataset Summary:
- Sample Size: ${result.count}
- Mean: ${result.mean}
- Standard Error: ${result.stdError}
- ${confidenceLevel}% Confidence Interval: [${result.confidenceInterval[0]}, ${result.confidenceInterval[1]}]

${result.outliers.length > 0 ? `Outliers Detected: ${result.outliers.join(', ')}` : 'No outliers detected'}

Calculation Steps:
${result.steps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

Parameters Used:
- Precision: ${precision} decimal places
- Outlier Treatment: ${ignoreOutliers ? 'Excluded' : 'Included'}
- Confidence Level: ${confidenceLevel}%

Data: ${result.validNumbers.join(', ')}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mean-calculation-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
  };

  const loadExample = () => {
    setInput('23.45, 24.12, 23.89, 24.56, 23.78, 24.23, 23.67, 24.01, 23.95, 24.34');
  };

  useEffect(() => {
    if (input.trim()) {
      calculateStats();
    } else {
      setResult(null);
    }
  }, [input, precision, ignoreOutliers, confidenceLevel]);

  // Load from URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get('data');
    const prec = params.get('precision');
    const outliers = params.get('ignoreOutliers');
    const conf = params.get('confidence');

    if (data) setInput(data);
    if (prec) setPrecision(parseInt(prec));
    if (outliers) setIgnoreOutliers(outliers === 'true');
    if (conf) setConfidenceLevel(parseInt(conf));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Microscope className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Research Mean Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Professional statistical analysis with confidence intervals, outlier detection, and reproducible results.
            Perfect for research assistants and academic work.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Input</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-2">
                    Experimental Data
                  </label>
                  <textarea
                    id="data"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="23.45, 24.12, 23.89, 24.56..."
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="precision" className="block text-sm font-medium text-gray-700 mb-2">
                    Precision: {precision} decimal places
                  </label>
                  <input
                    id="precision"
                    type="range"
                    min="1"
                    max="10"
                    value={precision}
                    onChange={(e) => setPrecision(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label htmlFor="confidence" className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Level: {confidenceLevel}%
                  </label>
                  <select
                    id="confidence"
                    value={confidenceLevel}
                    onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={90}>90%</option>
                    <option value={95}>95%</option>
                    <option value={99}>99%</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="outliers"
                    type="checkbox"
                    checked={ignoreOutliers}
                    onChange={(e) => setIgnoreOutliers(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="outliers" className="ml-2 block text-sm text-gray-700">
                    Exclude outliers from calculation
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={loadExample}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    Example
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Statistical Results</h2>
                {result && (
                  <div className="flex gap-2">
                    <button
                      onClick={copyShareUrl}
                      className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200 text-sm font-medium"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </>
                      )}
                    </button>
                    <button
                      onClick={exportReport}
                      className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200 text-sm font-medium"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </button>
                  </div>
                )}
              </div>
              
              {!result ? (
                <div className="text-center py-12 text-gray-500">
                  <Microscope className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Enter your experimental data to begin analysis</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {result.mean}
                      </div>
                      <div className="text-sm text-blue-600">Mean</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        ±{result.stdError}
                      </div>
                      <div className="text-sm text-green-600">Standard Error</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {result.count}
                      </div>
                      <div className="text-sm text-purple-600">Sample Size</div>
                    </div>
                  </div>

                  {/* Confidence Interval */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-2">
                      {confidenceLevel}% Confidence Interval
                    </h3>
                    <div className="text-lg font-mono text-gray-700">
                      [{result.confidenceInterval[0]}, {result.confidenceInterval[1]}]
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      We are {confidenceLevel}% confident that the true population mean lies within this interval.
                    </p>
                  </div>

                  {/* Outliers Warning */}
                  {result.outliers.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                        <span className="font-medium text-orange-800">
                          {result.outliers.length} Potential Outlier{result.outliers.length > 1 ? 's' : ''} Detected
                        </span>
                      </div>
                      <div className="text-sm text-orange-700 mb-2">
                        Values: {result.outliers.map(o => o.toFixed(precision)).join(', ')}
                      </div>
                      <div className="text-xs text-orange-600">
                        {ignoreOutliers ? 'These values were excluded from the calculation.' : 'These values were included in the calculation.'}
                      </div>
                    </div>
                  )}

                  {/* Calculation Steps */}
                  <div>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 mb-3"
                    >
                      Calculation Details
                      <span className="ml-1">{showAdvanced ? '▼' : '▶'}</span>
                    </button>
                    
                    {showAdvanced && (
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2">
                          {result.steps.map((step, index) => (
                            <div key={index} className="flex items-start">
                              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                                {index + 1}
                              </div>
                              <div className="text-sm text-gray-700 font-mono">{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Methodology Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistical Methodology</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Outlier Detection</h4>
              <p className="text-sm text-gray-600">
                Uses the Interquartile Range (IQR) method. Values beyond Q1 - 1.5×IQR or Q3 + 1.5×IQR 
                are flagged as potential outliers.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Confidence Intervals</h4>
              <p className="text-sm text-gray-600">
                Calculated using the t-distribution for small samples. The interval represents the range 
                where the true population mean is likely to fall.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Standard Error</h4>
              <p className="text-sm text-gray-600">
                Measures the precision of the sample mean as an estimate of the population mean. 
                Calculated as σ/√n where σ is the sample standard deviation.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Reproducibility</h4>
              <p className="text-sm text-gray-600">
                All calculations can be reproduced using the share URL, which preserves your data 
                and parameter settings for verification by colleagues.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchMeanCalculator;