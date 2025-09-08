import React, { useState, useEffect } from 'react';
import { GraduationCap, Users, TrendingUp, Copy, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import RelatedTools from '../components/RelatedTools';
import PopularTools from '../components/PopularTools';
import GoogleAdsPlaceholder from '../components/GoogleAdsPlaceholder';

const TeacherMeanCalculator = () => {
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(1);
  const [result, setResult] = useState<{
    classMean: number;
    studentCount: number;
    validScores: number[];
    invalidEntries: string[];
    scoreRange: { min: number; max: number };
    gradeDistribution: { [key: string]: number };
    sum: number;
    steps: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDistribution, setShowDistribution] = useState(false);

  const parseGrades = (inputText: string) => {
    // Handle Excel-style data with potential formatting
    const entries = inputText
      .replace(/[\t]/g, ' ') // Replace tabs with spaces
      .split(/[,\n\s]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);

    const validScores: number[] = [];
    const invalidEntries: string[] = [];

    entries.forEach(entry => {
      // Remove common non-numeric characters but preserve the entry for reporting
      const cleanEntry = entry.replace(/[^\d.-]/g, '');
      const num = parseFloat(cleanEntry);
      
      if (!isNaN(num) && isFinite(num)) {
        // Basic range validation for typical grading scales
        if (num >= 0 && num <= 150) { // Allow for extra credit
          validScores.push(num);
        } else {
          invalidEntries.push(entry);
        }
      } else if (entry.length > 0) {
        // Common non-numeric entries in grade books
        const commonInvalid = ['absent', 'excused', 'makeup', 'incomplete', 'n/a', 'na', '-', ''];
        if (!commonInvalid.includes(entry.toLowerCase())) {
          invalidEntries.push(entry);
        }
      }
    });

    return { validScores, invalidEntries };
  };

  const calculateGradeDistribution = (scores: number[]) => {
    const distribution: { [key: string]: number } = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    scores.forEach(score => {
      if (score >= 90) distribution['A (90-100)']++;
      else if (score >= 80) distribution['B (80-89)']++;
      else if (score >= 70) distribution['C (70-79)']++;
      else if (score >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });

    return distribution;
  };

  const calculateClassStats = () => {
    if (!input.trim()) {
      setResult(null);
      return;
    }

    const { validScores, invalidEntries } = parseGrades(input);

    if (validScores.length === 0) {
      setResult({
        classMean: 0,
        studentCount: 0,
        validScores: [],
        invalidEntries,
        scoreRange: { min: 0, max: 0 },
        gradeDistribution: {},
        sum: 0,
        steps: ['No valid grades found in input']
      });
      return;
    }

    const sum = validScores.reduce((acc, score) => acc + score, 0);
    const classMean = sum / validScores.length;
    const scoreRange = {
      min: Math.min(...validScores),
      max: Math.max(...validScores)
    };
    const gradeDistribution = calculateGradeDistribution(validScores);

    const steps = [
      `Found ${validScores.length} valid student grades`,
      `Grade range: ${scoreRange.min} - ${scoreRange.max}`,
      `Sum of all grades: ${sum.toFixed(1)}`,
      `Class average: ${sum.toFixed(1)} ÷ ${validScores.length} = ${classMean.toFixed(precision)}`
    ];

    if (invalidEntries.length > 0) {
      steps.unshift(`Excluded ${invalidEntries.length} non-numeric entries: ${invalidEntries.join(', ')}`);
    }

    setResult({
      classMean: parseFloat(classMean.toFixed(precision)),
      studentCount: validScores.length,
      validScores,
      invalidEntries,
      scoreRange,
      gradeDistribution,
      sum: parseFloat(sum.toFixed(1)),
      steps
    });
  };

  const copyResult = async () => {
    if (!result) return;
    
    const text = `Class Average: ${result.classMean}
Students: ${result.studentCount}
Range: ${result.scoreRange.min} - ${result.scoreRange.max}
Sum: ${result.sum}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setResult(null);
    setShowDistribution(false);
  };

  const loadExample = () => {
    setInput(`92, 88, 95, 87, 91, 89, 94, 86, 90, 93
85, 88, 92, 89, 87, 91, 94, 88, 90, 86
89, 92, 87, 90, 88, 91, 85, 93, 89, 94`);
  };

  useEffect(() => {
    if (input.trim()) {
      calculateClassStats();
    } else {
      setResult(null);
    }
  }, [input, precision]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    if (grade.startsWith('D')) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Calculators', href: '/#tools' },
        { label: 'Teacher Grade Calculator' }
      ]} />
      
      {/* Top Banner Ad - Full Width */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <GoogleAdsPlaceholder size="leaderboard" position="top" />
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Teacher Grade Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Quickly calculate class averages from your gradebook. Supports Excel copy-paste and 
            automatically handles common grade book entries.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Grade Input</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="grades" className="block text-sm font-medium text-gray-700 mb-2">
                  Student Grades (copy from Excel or enter manually)
                </label>
                <textarea
                  id="grades"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="92, 88, 95, 87, 91, 89, 94, 86, 90, 93..."
                  className="w-full h-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supports: Excel paste, comma/space/line separated. Automatically excludes "absent", "excused", etc.
                </p>
              </div>

              <div>
                <label htmlFor="precision" className="block text-sm font-medium text-gray-700 mb-2">
                  Decimal Places: {precision}
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setPrecision(1)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      precision === 1 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    1 decimal
                  </button>
                  <button
                    onClick={() => setPrecision(2)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      precision === 2 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    2 decimals
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={loadExample}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                >
                  Load Example Class
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
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Class Statistics</h2>
            
            {!result ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Enter student grades to calculate class average</p>
              </div>
            ) : result.studentCount === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-orange-500" />
                <p className="text-orange-600 font-medium">No valid grades found</p>
                <p className="text-sm text-gray-500 mt-1">Check your input format</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Main Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {result.classMean}
                    </div>
                    <div className="text-sm text-blue-600">Class Average</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {result.studentCount}
                    </div>
                    <div className="text-sm text-green-600">Students</div>
                  </div>
                </div>

                {/* Score Range */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Lowest Score</div>
                      <div className="text-xl font-semibold text-gray-900">{result.scoreRange.min}</div>
                    </div>
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Highest Score</div>
                      <div className="text-xl font-semibold text-gray-900">{result.scoreRange.max}</div>
                    </div>
                  </div>
                </div>

                {/* Invalid Entries Warning */}
                {result.invalidEntries.length > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                      <span className="text-sm font-medium text-orange-800">
                        Excluded {result.invalidEntries.length} entries
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
                        Copy Results
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDistribution(!showDistribution)}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                  >
                    Grade Distribution
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Sidebar Components */}
          <GoogleAdsPlaceholder size="rectangle" position="sidebar" />
          <RelatedTools currentTool="Teacher Mean Calculator" category="statistics" />
          <PopularTools />
        </div>
        </div>

        {/* Grade Distribution */}
        {showDistribution && result && result.studentCount > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
              {Object.entries(result.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className={`rounded-lg p-4 text-center ${getGradeColor(grade)}`}>
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className="text-sm font-medium">{grade}</div>
                  <div className="text-xs mt-1">
                    {((count / result.studentCount) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calculation Steps */}
        {result && result.studentCount > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Summary</h3>
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
          </div>
        )}

        {/* Teacher Tips */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for Teachers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Excel Integration</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Select and copy grades directly from Excel</li>
                <li>• Paste into the text area - formatting is handled automatically</li>
                <li>• Non-numeric entries (absent, excused) are automatically excluded</li>
                <li>• Works with both comma and tab-separated data</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Grade Analysis</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• View grade distribution to identify class performance patterns</li>
                <li>• Check score range to spot potential data entry errors</li>
                <li>• Use 1 decimal place for standard grade reporting</li>
                <li>• Copy results directly to your grade management system</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Banner Ad */}
        <div className="mt-8">
          <GoogleAdsPlaceholder size="banner" position="bottom" />
        </div>
      </div>
    </div>
  );
};

export default TeacherMeanCalculator;