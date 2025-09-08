import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Copy, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import RelatedTools from '../components/RelatedTools';
import PopularTools from '../components/PopularTools';
import GoogleAdsPlaceholder from '../components/GoogleAdsPlaceholder';

interface CoursePair {
  grade: string;
  credits: string;
}

const WeightedGPACalculator = () => {
  const [inputMode, setInputMode] = useState<'pairs' | 'columns' | 'manual'>('pairs');
  const [pairsInput, setPairsInput] = useState('');
  const [gradesInput, setGradesInput] = useState('');
  const [creditsInput, setCreditsInput] = useState('');
  const [manualCourses, setManualCourses] = useState<CoursePair[]>([
    { grade: '', credits: '' }
  ]);
  const [precision, setPrecision] = useState(2);
  const [ignoreZeroCredits, setIgnoreZeroCredits] = useState(true);
  const [result, setResult] = useState<{
    weightedGPA: number;
    totalCredits: number;
    totalPoints: number;
    courseBreakdown: Array<{
      grade: number;
      credits: number;
      points: number;
      contribution: number;
    }>;
    steps: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const parsePairsInput = (input: string) => {
    const pairs: Array<{ grade: number; credits: number }> = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
      // Support formats: "grade:credits", "grade,credits", "grade credits"
      const match = line.match(/([0-9.]+)[\s:,]+([0-9.]+)/);
      if (match) {
        const grade = parseFloat(match[1]);
        const credits = parseFloat(match[2]);
        if (!isNaN(grade) && !isNaN(credits)) {
          pairs.push({ grade, credits });
        }
      }
    });
    
    return pairs;
  };

  const parseColumnsInput = (gradesText: string, creditsText: string) => {
    const grades = gradesText.split(/[,\n\s]+/).map(g => parseFloat(g.trim())).filter(g => !isNaN(g));
    const credits = creditsText.split(/[,\n\s]+/).map(c => parseFloat(c.trim())).filter(c => !isNaN(c));
    
    const pairs: Array<{ grade: number; credits: number }> = [];
    const minLength = Math.min(grades.length, credits.length);
    
    for (let i = 0; i < minLength; i++) {
      pairs.push({ grade: grades[i], credits: credits[i] });
    }
    
    return pairs;
  };

  const parseManualInput = () => {
    const pairs: Array<{ grade: number; credits: number }> = [];
    
    manualCourses.forEach(course => {
      const grade = parseFloat(course.grade);
      const credits = parseFloat(course.credits);
      if (!isNaN(grade) && !isNaN(credits)) {
        pairs.push({ grade, credits });
      }
    });
    
    return pairs;
  };

  const calculateWeightedGPA = () => {
    let coursePairs: Array<{ grade: number; credits: number }> = [];
    
    switch (inputMode) {
      case 'pairs':
        coursePairs = parsePairsInput(pairsInput);
        break;
      case 'columns':
        coursePairs = parseColumnsInput(gradesInput, creditsInput);
        break;
      case 'manual':
        coursePairs = parseManualInput();
        break;
    }

    if (coursePairs.length === 0) {
      setResult(null);
      return;
    }

    // Filter out zero credit courses if option is enabled
    const filteredPairs = ignoreZeroCredits 
      ? coursePairs.filter(pair => pair.credits > 0)
      : coursePairs;

    if (filteredPairs.length === 0) {
      setResult(null);
      return;
    }

    let totalPoints = 0;
    let totalCredits = 0;
    const courseBreakdown: Array<{
      grade: number;
      credits: number;
      points: number;
      contribution: number;
    }> = [];

    filteredPairs.forEach(pair => {
      const points = pair.grade * pair.credits;
      totalPoints += points;
      totalCredits += pair.credits;
      
      courseBreakdown.push({
        grade: pair.grade,
        credits: pair.credits,
        points: points,
        contribution: 0 // Will be calculated after we have totalCredits
      });
    });

    // Calculate contribution percentages
    courseBreakdown.forEach(course => {
      course.contribution = (course.credits / totalCredits) * 100;
    });

    const weightedGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

    const steps = [
      `Found ${filteredPairs.length} courses with valid grades and credits`,
      `Total grade points: ${courseBreakdown.map(c => `${c.grade} × ${c.credits} = ${c.points.toFixed(1)}`).join(' + ')} = ${totalPoints.toFixed(1)}`,
      `Total credits: ${courseBreakdown.map(c => c.credits).join(' + ')} = ${totalCredits}`,
      `Weighted GPA: ${totalPoints.toFixed(1)} ÷ ${totalCredits} = ${weightedGPA.toFixed(precision)}`
    ];

    if (ignoreZeroCredits && coursePairs.length > filteredPairs.length) {
      steps.unshift(`Excluded ${coursePairs.length - filteredPairs.length} zero-credit courses`);
    }

    setResult({
      weightedGPA: parseFloat(weightedGPA.toFixed(precision)),
      totalCredits,
      totalPoints: parseFloat(totalPoints.toFixed(1)),
      courseBreakdown,
      steps
    });
  };

  const addManualCourse = () => {
    setManualCourses([...manualCourses, { grade: '', credits: '' }]);
  };

  const removeManualCourse = (index: number) => {
    if (manualCourses.length > 1) {
      setManualCourses(manualCourses.filter((_, i) => i !== index));
    }
  };

  const updateManualCourse = (index: number, field: 'grade' | 'credits', value: string) => {
    const updated = [...manualCourses];
    updated[index][field] = value;
    setManualCourses(updated);
  };

  const copyResult = async () => {
    if (!result) return;
    
    const text = `Weighted GPA: ${result.weightedGPA}
Total Credits: ${result.totalCredits}
Total Grade Points: ${result.totalPoints}`;
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setPairsInput('');
    setGradesInput('');
    setCreditsInput('');
    setManualCourses([{ grade: '', credits: '' }]);
    setResult(null);
    setShowBreakdown(false);
  };

  const loadExample = () => {
    switch (inputMode) {
      case 'pairs':
        setPairsInput(`92:3
88:4
95:3
87:2
91:3`);
        break;
      case 'columns':
        setGradesInput('92, 88, 95, 87, 91');
        setCreditsInput('3, 4, 3, 2, 3');
        break;
      case 'manual':
        setManualCourses([
          { grade: '92', credits: '3' },
          { grade: '88', credits: '4' },
          { grade: '95', credits: '3' },
          { grade: '87', credits: '2' },
          { grade: '91', credits: '3' }
        ]);
        break;
    }
  };

  useEffect(() => {
    calculateWeightedGPA();
  }, [pairsInput, gradesInput, creditsInput, manualCourses, precision, ignoreZeroCredits, inputMode]);

  const getGPAInterpretation = (gpa: number) => {
    if (gpa >= 97) return { text: 'Excellent (A+)', color: 'text-green-600' };
    if (gpa >= 93) return { text: 'Excellent (A)', color: 'text-green-600' };
    if (gpa >= 90) return { text: 'Very Good (A-)', color: 'text-green-500' };
    if (gpa >= 87) return { text: 'Good (B+)', color: 'text-blue-600' };
    if (gpa >= 83) return { text: 'Good (B)', color: 'text-blue-600' };
    if (gpa >= 80) return { text: 'Satisfactory (B-)', color: 'text-blue-500' };
    if (gpa >= 77) return { text: 'Fair (C+)', color: 'text-yellow-600' };
    if (gpa >= 73) return { text: 'Fair (C)', color: 'text-yellow-600' };
    if (gpa >= 70) return { text: 'Below Average (C-)', color: 'text-orange-600' };
    return { text: 'Poor (D or F)', color: 'text-red-600' };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[
        { label: 'Calculators', href: '/#tools' },
        { label: 'Weighted GPA Calculator' }
      ]} />
      
      {/* Top Banner Ad - Full Width */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <GoogleAdsPlaceholder size="leaderboard" position="top" />
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Award className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Weighted GPA Calculator</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Calculate your Grade Point Average with credit hour weighting. Perfect for students tracking 
            their academic performance across courses with different credit values.
          </p>
        </div>

        {/* Input Mode Selection */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
              <button
                onClick={() => setInputMode('pairs')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'pairs'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Grade:Credit Pairs
              </button>
              <button
                onClick={() => setInputMode('columns')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'columns'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Separate Columns
              </button>
              <button
                onClick={() => setInputMode('manual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  inputMode === 'manual'
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Manual Entry
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Data Input</h2>
              
              {/* Pairs Input Mode */}
              {inputMode === 'pairs' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pairs" className="block text-sm font-medium text-gray-700 mb-2">
                      Enter grade:credit pairs (one per line)
                    </label>
                    <textarea
                      id="pairs"
                      value={pairsInput}
                      onChange={(e) => setPairsInput(e.target.value)}
                      placeholder="92:3&#10;88:4&#10;95:3&#10;87:2"
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Format: grade:credits (also supports grade,credits or grade credits)
                    </p>
                  </div>
                </div>
              )}

              {/* Columns Input Mode */}
              {inputMode === 'columns' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="grades" className="block text-sm font-medium text-gray-700 mb-2">
                        Grades
                      </label>
                      <textarea
                        id="grades"
                        value={gradesInput}
                        onChange={(e) => setGradesInput(e.target.value)}
                        placeholder="92, 88, 95, 87, 91"
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                        Credits
                      </label>
                      <textarea
                        id="credits"
                        value={creditsInput}
                        onChange={(e) => setCreditsInput(e.target.value)}
                        placeholder="3, 4, 3, 2, 3"
                        className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter grades and credits in the same order, separated by commas or spaces
                  </p>
                </div>
              )}

              {/* Manual Input Mode */}
              {inputMode === 'manual' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {manualCourses.map((course, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Grade"
                            value={course.grade}
                            onChange={(e) => updateManualCourse(index, 'grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.1"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            placeholder="Credits"
                            value={course.credits}
                            onChange={(e) => updateManualCourse(index, 'credits', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            step="0.5"
                            min="0"
                            max="10"
                          />
                        </div>
                        <button
                          onClick={() => removeManualCourse(index)}
                          disabled={manualCourses.length === 1}
                          className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addManualCourse}
                    className="flex items-center px-3 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Course
                  </button>
                </div>
              )}

              {/* Settings */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div>
                  <label htmlFor="precision" className="block text-sm font-medium text-gray-700 mb-2">
                    Decimal Places: {precision}
                  </label>
                  <input
                    id="precision"
                    type="range"
                    min="1"
                    max="4"
                    value={precision}
                    onChange={(e) => setPrecision(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="ignoreZero"
                    type="checkbox"
                    checked={ignoreZeroCredits}
                    onChange={(e) => setIgnoreZeroCredits(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ignoreZero" className="ml-2 block text-sm text-gray-700">
                    Ignore zero-credit courses (Pass/Fail, Audits)
                  </label>
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
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your GPA</h2>
              
              {!result ? (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Enter course data to calculate GPA</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Main GPA Display */}
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {result.weightedGPA}
                    </div>
                    <div className="text-sm text-blue-600 mb-2">Weighted GPA</div>
                    <div className={`text-sm font-medium ${getGPAInterpretation(result.weightedGPA).color}`}>
                      {getGPAInterpretation(result.weightedGPA).text}
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Total Credits</span>
                      <span className="font-medium text-gray-900">{result.totalCredits}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Grade Points</span>
                      <span className="font-medium text-gray-900">{result.totalPoints}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Courses</span>
                      <span className="font-medium text-gray-900">{result.courseBreakdown.length}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={copyResult}
                      className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy GPA
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowBreakdown(!showBreakdown)}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                    >
                      {showBreakdown ? 'Hide' : 'Show'} Course Breakdown
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <GoogleAdsPlaceholder size="rectangle" position="sidebar" />
            <RelatedTools currentTool="Weighted GPA Calculator" category="gpa" />
            <PopularTools />
          </div>
        </div>

        {/* Course Breakdown */}
        {showBreakdown && result && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Contribution Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Course</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Grade</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Credits</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Points</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-900">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {result.courseBreakdown.map((course, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-700">Course {index + 1}</td>
                      <td className="py-2 px-3 text-right font-mono">{course.grade}</td>
                      <td className="py-2 px-3 text-right font-mono">{course.credits}</td>
                      <td className="py-2 px-3 text-right font-mono">{course.points.toFixed(1)}</td>
                      <td className="py-2 px-3 text-right font-mono">{course.contribution.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-medium">
                    <td className="py-2 px-3 text-gray-900">Total</td>
                    <td className="py-2 px-3 text-right">—</td>
                    <td className="py-2 px-3 text-right font-mono">{result.totalCredits}</td>
                    <td className="py-2 px-3 text-right font-mono">{result.totalPoints}</td>
                    <td className="py-2 px-3 text-right font-mono">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Calculation Steps */}
        {result && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How It's Calculated</h3>
            <div className="space-y-3">
              {result.steps.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <div className="text-gray-700 font-mono text-sm">{step}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Understanding Weighted GPA</h4>
              <p className="text-sm text-blue-800">
                Weighted GPA accounts for the credit hours of each course. Courses with more credits 
                have a greater impact on your overall GPA. The calculation multiplies each grade by 
                its credit hours, sums all grade points, then divides by total credit hours.
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Format Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Grade:Credit Pairs</h4>
              <div className="text-sm text-gray-600 space-y-1 font-mono bg-gray-50 p-3 rounded">
                <div>92:3</div>
                <div>88:4</div>
                <div>95:3</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">One course per line</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Separate Columns</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="font-mono bg-gray-50 p-2 rounded">Grades: 92, 88, 95</div>
                <div className="font-mono bg-gray-50 p-2 rounded">Credits: 3, 4, 3</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Same order in both fields</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Manual Entry</h4>
              <div className="text-sm text-gray-600">
                <div className="bg-gray-50 p-3 rounded">
                  Individual input fields for each course with add/remove buttons
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Most flexible option</p>
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

export default WeightedGPACalculator;