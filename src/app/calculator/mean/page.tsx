'use client'

import React, { useState } from 'react';
import { Calculator, TrendingUp, Users, GraduationCap, FlaskConical, Smartphone } from 'lucide-react';
import DataInput from '@/components/calculator/DataInput';
import MobileResultsDisplay from '@/components/calculator/MobileResultsDisplay';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import CalculationSteps from '@/components/calculator/CalculationSteps';
import CopyResults from '@/components/calculator/CopyResults';
import ShareManager from '@/components/calculator/ShareManager';
import LazyComponentWrapper, { LoadingFallbacks } from '@/components/common/LazyComponentWrapper';
import { lazyPages, contextualLoader } from '@/lib/dynamic-imports';
import { calculateMean } from '@/lib/calculations';
import { HighPrecisionCalculator } from '@/lib/high-precision-calculations';
import { 
  calculateMeanCached, 
  calculateHighPrecisionCached 
} from '@/lib/calculation-cache-integration';
import { URLStateManager } from '@/lib/url-state-manager';

type UserContext = 'student' | 'research' | 'teacher';

// Lazy loaded components
const LazyResearchResults = lazyPages.highPrecisionResults.Component;
const LazyTeacherFileUpload = lazyPages.teacherFileUpload.Component;
const LazyBatchProcessing = lazyPages.batchProcessing.Component;

export default function MeanCalculatorPage() {
  const [userContext, setUserContext] = useState<UserContext>('student');
  const [numbers, setNumbers] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [precision, setPrecision] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  // Mobile detection and contextual loading
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Setup contextual loader
    contextualLoader.setContext(userContext);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [userContext]);

  // Calculate results based on user context with caching
  const getResults = React.useCallback(async () => {
    if (numbers.length === 0) return null;

    try {
      switch (userContext) {
        case 'student':
          return await calculateMeanCached(numbers, {
            userContext: 'student',
            precision,
            useCache: true,
            priority: 'normal'
          });
        case 'research':
          return await calculateHighPrecisionCached(numbers, {
            userContext: 'research',
            precision: Math.max(precision, 4), // Minimum 4 for research
            useCache: true,
            priority: 'high'
          });
        case 'teacher':
          return await calculateMeanCached(numbers, {
            userContext: 'teacher',
            precision,
            useCache: true,
            priority: 'normal'
          });
        default:
          return await calculateMeanCached(numbers, {
            userContext: 'student',
            precision,
            useCache: true
          });
      }
    } catch (error) {
      console.error('Calculation error:', error);
      // Fallback to non-cached calculation
      switch (userContext) {
        case 'research':
          const highPrecCalc = new HighPrecisionCalculator(numbers);
          return highPrecCalc.calculateAll();
        default:
          return calculateMean(numbers);
      }
    }
  }, [numbers, userContext, precision]);

  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate results when data changes
  React.useEffect(() => {
    if (numbers.length > 0) {
      setIsCalculating(true);
      getResults().then(calculationResult => {
        setResults(calculationResult);
        setIsCalculating(false);
      }).catch(error => {
        console.error('Failed to calculate results:', error);
        setIsCalculating(false);
      });
    } else {
      setResults(null);
      setIsCalculating(false);
    }
  }, [getResults]);

  const handleInputChange = (value: string) => {
    setInputValue(value);
    
    // Parse the input to extract numbers
    const parsed = value
      .split(/[,\s\n]+/)
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n) && isFinite(n));
    
    setNumbers(parsed);
  };

  const handleDataChange = (newNumbers: number[]) => {
    setNumbers(newNumbers);
  };

  const getUserContextIcon = (context: UserContext) => {
    switch (context) {
      case 'student': return <GraduationCap className="h-4 w-4" />;
      case 'research': return <FlaskConical className="h-4 w-4" />;
      case 'teacher': return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized header */}
      <header className={`bg-white border-b border-gray-200 ${isMobile ? 'sticky top-0 z-10' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`py-4 ${isMobile ? 'py-3' : 'py-6'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calculator className={`text-blue-600 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'} mr-3`} />
                <div>
                  <h1 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                    Mean Calculator
                  </h1>
                  {!isMobile && (
                    <p className="text-sm text-gray-600 mt-1">
                      Calculate mean with step-by-step explanations
                    </p>
                  )}
                </div>
              </div>
              
              {/* Mobile context indicator */}
              {isMobile && (
                <div className="flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {getUserContextIcon(userContext)}
                  <span className="ml-1 capitalize">{userContext}</span>
                </div>
              )}
            </div>
            
            {/* User context selector - mobile optimized */}
            {!isMobile ? (
              <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
                {(['student', 'research', 'teacher'] as UserContext[]).map((context) => (
                  <button
                    key={context}
                    onClick={() => setUserContext(context)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      userContext === context
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {getUserContextIcon(context)}
                    <span className="ml-2 capitalize">{context}</span>
                  </button>
                ))}
              </div>
            ) : (
              // Mobile dropdown selector
              <div className="mt-3">
                <select
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value as UserContext)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">👨‍🎓 Student Mode</option>
                  <option value="research">🔬 Research Mode</option>
                  <option value="teacher">👩‍🏫 Teacher Mode</option>
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className={`grid gap-6 ${
          isMobile 
            ? 'grid-cols-1' 
            : userContext === 'teacher' 
              ? 'grid-cols-1' 
              : 'lg:grid-cols-3'
        }`}>
          
          {/* Left column - Input & Controls */}
          <div className={`space-y-6 ${isMobile ? 'order-1' : userContext === 'teacher' ? 'w-full' : 'lg:col-span-1'}`}>
            
            {/* Teacher-specific file upload */}
            {userContext === 'teacher' && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="font-semibold text-gray-900 flex items-center">
                    <Smartphone className={`mr-2 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                    Upload & Process Data
                  </h2>
                </div>
                <div className="p-4">
                  <LazyComponentWrapper
                    name="Teacher File Upload"
                    fallback={<LoadingFallbacks.card name="File Upload" />}
                  >
                    <LazyTeacherFileUpload
                      onDataExtracted={(data) => {
                        if (data.length > 0 && typeof data[0] === 'number') {
                          setNumbers(data as number[]);
                        }
                      }}
                      className="w-full"
                    />
                  </LazyComponentWrapper>
                </div>
              </div>
            )}

            {/* Data Input */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <h2 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                  {userContext === 'teacher' ? 'Manual Data Entry' : 'Enter Your Data'}
                </h2>
                {!isMobile && (
                  <p className="text-xs text-gray-600 mt-1">
                    Enter numbers separated by commas, spaces, or new lines
                  </p>
                )}
              </div>
              <div className="p-4">
                <DataInput
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={isMobile 
                    ? "1, 2, 3, 4, 5..." 
                    : "Enter numbers separated by commas, spaces, or new lines..."
                  }
                  context={userContext}
                  className={`w-full ${isMobile ? 'min-h-[120px] text-sm' : 'min-h-[150px]'}`}
                />
                
                {/* Mobile-optimized data count */}
                {isMobile && numbers.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
                    <span>{numbers.length} values</span>
                    <TrendingUp className="h-3 w-3" />
                  </div>
                )}
              </div>
            </div>

            {/* Precision Control - Mobile optimized */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-4">
                <PrecisionControl
                  precision={precision}
                  onPrecisionChange={setPrecision}
                  userContext={userContext}
                  isMobile={isMobile}
                />
              </div>
            </div>

            {/* Mobile: Quick actions */}
            {isMobile && results && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4">
                  <div className="flex space-x-2">
                    <CopyResults 
                      results={results} 
                      precision={precision}
                      className="flex-1 justify-center text-sm py-2"
                    />
                    <ShareManager 
                      calculatorState={{
                        data: numbers,
                        precision,
                        userContext,
                        results: results || undefined
                      }}
                      className="flex-1 justify-center text-sm py-2"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right columns - Results */}
          {userContext !== 'teacher' && (
            <div className={`space-y-6 ${isMobile ? 'order-2' : 'lg:col-span-2'}`}>
              {/* Results Display */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-base'}`}>
                      Results
                    </h2>
                    {!isMobile && results && (
                      <div className="flex space-x-2">
                        <CopyResults results={results} precision={precision} />
                        <ShareManager 
                          calculatorState={{
                            data: numbers,
                            precision,
                            userContext,
                            results: results || undefined
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className={`p-4 ${isMobile ? 'p-3' : 'p-6'}`}>
                  {isCalculating ? (
                    <LoadingFallbacks.skeleton name="calculation results" />
                  ) : userContext === 'research' && results ? (
                    <LazyComponentWrapper
                      name="Research Results"
                      fallback={<LoadingFallbacks.research name="Statistical Analysis" />}
                    >
                      <LazyResearchResults 
                        data={numbers}
                        precision={precision}
                        showBootstrap={true}
                        showTests={true}
                        showVisualization={true}
                      />
                    </LazyComponentWrapper>
                  ) : (
                    <MobileResultsDisplay
                      results={results}
                      precision={precision}
                      userContext={userContext}
                      isMobile={isMobile}
                    />
                  )}
                </div>
              </div>

              {/* Calculation Steps - Mobile collapsible */}
              {results && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                  <div className={`p-4 ${isMobile ? 'p-3' : 'p-6'}`}>
                    <CalculationSteps
                      data={numbers}
                      results={results}
                      precision={precision}
                      userContext={userContext}
                      isMobile={isMobile}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Teacher mode - Full width batch processing */}
          {userContext === 'teacher' && (
            <div className="w-full">
              <LazyComponentWrapper
                name="Batch Processing"
                fallback={<LoadingFallbacks.card name="Batch Processing Manager" />}
              >
                <LazyBatchProcessing 
                  onResultsReady={(results, summary) => {
                    console.log('Batch processing completed', { results, summary });
                  }}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm p-6"
                />
              </LazyComponentWrapper>
            </div>
          )}
        </div>

        {/* Mobile: Bottom sticky actions */}
        {isMobile && numbers.length > 0 && !results && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
            <button 
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium"
              disabled={numbers.length === 0}
            >
              Calculate Mean ({numbers.length} values)
            </button>
          </div>
        )}
      </main>
    </div>
  );
}