import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Lightbulb, 
  Users, 
  Calculator, 
  ChevronRight, 
  ChevronDown, 
  ExternalLink,
  Play,
  FileText,
  Target,
  AlertCircle
} from 'lucide-react';
import { UserMode } from './UserModeSelector';

interface HelpSectionProps {
  userMode: UserMode;
  calculatorType?: 'mean' | 'weighted-mean' | 'standard-deviation';
  className?: string;
}

interface HelpTopic {
  id: string;
  title: string;
  content: string;
  examples?: string[];
  tips?: string[];
  links?: { title: string; url: string }[];
}

const HelpSection: React.FC<HelpSectionProps> = ({ userMode, calculatorType = 'mean', className = '' }) => {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basics' | 'formulas' | 'examples' | 'troubleshooting'>('basics');

  const getHelpContent = (): { [key: string]: HelpTopic[] } => {
    // Content for Mean Calculator
    const meanContent = {
      basics: [
        {
          id: 'what-is-mean',
          title: 'What is the Mean?',
          content: 'The mean (or average) is the sum of all values divided by the number of values. It represents the central tendency of your data.',
          examples: [
            'Data: 2, 4, 6, 8 → Mean = (2+4+6+8) ÷ 4 = 5',
            'Test scores: 85, 90, 78, 92 → Mean = 86.25'
          ]
        },
        {
          id: 'input-formats',
          title: 'Supported Input Formats',
          content: 'You can enter numbers separated by commas, spaces, or new lines. The calculator automatically handles different formats.',
          examples: [
            'Comma separated: 1, 2, 3, 4, 5',
            'Space separated: 1 2 3 4 5',
            'Line by line:\n1\n2\n3\n4\n5'
          ]
        }
      ],
      formulas: [
        {
          id: 'basic-formula',
          title: 'Basic Mean Formula',
          content: 'Mean = (Sum of all values) ÷ (Number of values)',
          examples: ['Mean = (x₁ + x₂ + x₃ + ... + xₙ) ÷ n']
        }
      ],
      examples: [
        {
          id: 'simple-example',
          title: 'Simple Example',
          content: 'Calculate the mean of: 10, 20, 30',
          examples: [
            'Step 1: Add all numbers → 10 + 20 + 30 = 60',
            'Step 2: Count the numbers → 3 numbers',
            'Step 3: Divide sum by count → 60 ÷ 3 = 20',
            'Answer: The mean is 20'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'invalid-data',
          title: 'Invalid Data Entries',
          content: 'The calculator will ignore non-numeric entries and show you which entries were excluded.',
          tips: [
            'Check for typos in your numbers',
            'Remove any text or special characters',
            'Use decimal points (.) not commas for decimals'
          ]
        }
      ]
    };

    // Content for Weighted Mean Calculator
    const weightedMeanContent = {
      basics: [
        {
          id: 'what-is-weighted-mean',
          title: 'What is Weighted Mean?',
          content: 'The weighted mean is an average where some values contribute more than others. Each value is multiplied by its weight, then all results are summed and divided by the total weight.',
          examples: [
            'Grades: Math(90, 3 credits), English(85, 4 credits)',
            'Weighted Mean = (90×3 + 85×4) ÷ (3+4) = 87.14'
          ]
        },
        {
          id: 'input-formats-weighted',
          title: 'Supported Input Formats',
          content: 'Enter value-weight pairs using different formats. The calculator supports multiple input methods for flexibility.',
          examples: [
            'Pairs format: 85:3, 90:4, 78:2',
            'Colon format: 85:3\n90:4\n78:2',
            'Comma format: 85,3\n90,4\n78,2'
          ]
        },
        {
          id: 'when-to-use',
          title: 'When to Use Weighted Mean',
          content: 'Use weighted mean when different data points have varying levels of importance or frequency.',
          examples: [
            'GPA calculation (courses with different credit hours)',
            'Portfolio returns (investments of different sizes)',
            'Survey results (responses from different demographics)'
          ]
        }
      ],
      formulas: [
        {
          id: 'weighted-mean-formula',
          title: 'Weighted Mean Formula',
          content: 'Weighted Mean = Σ(value × weight) ÷ Σ(weight)',
          examples: [
            'Σ(vᵢ × wᵢ) ÷ Σ(wᵢ)',
            'Where vᵢ = value, wᵢ = weight'
          ]
        },
        {
          id: 'step-by-step',
          title: 'Calculation Steps',
          content: 'The weighted mean calculation follows these steps:',
          examples: [
            'Step 1: Multiply each value by its weight',
            'Step 2: Sum all weighted values',
            'Step 3: Sum all weights',
            'Step 4: Divide weighted sum by total weight'
          ]
        }
      ],
      examples: [
        {
          id: 'gpa-example',
          title: 'GPA Calculation Example',
          content: 'Calculate GPA for: Math A(4.0, 3 credits), English B+(3.3, 4 credits), Science A-(3.7, 3 credits)',
          examples: [
            'Step 1: Calculate weighted values',
            '  Math: 4.0 × 3 = 12.0',
            '  English: 3.3 × 4 = 13.2',
            '  Science: 3.7 × 3 = 11.1',
            'Step 2: Sum weighted values = 12.0 + 13.2 + 11.1 = 36.3',
            'Step 3: Sum weights = 3 + 4 + 3 = 10',
            'Step 4: GPA = 36.3 ÷ 10 = 3.63'
          ]
        },
        {
          id: 'investment-example',
          title: 'Investment Portfolio Example',
          content: 'Calculate portfolio return: Stock A(8%, $1000), Stock B(12%, $2000), Stock C(5%, $500)',
          examples: [
            'Weighted values: 8%×$1000 + 12%×$2000 + 5%×$500',
            '= $80 + $240 + $25 = $345',
            'Total investment: $1000 + $2000 + $500 = $3500',
            'Portfolio return: $345 ÷ $3500 = 9.86%'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'zero-weights',
          title: 'Zero or Negative Weights',
          content: 'Weights should be positive numbers. Zero weights are ignored, and negative weights may cause errors.',
          tips: [
            'Ensure all weights are positive numbers',
            'Zero weights will be excluded from calculation',
            'Check that weight format matches your input method'
          ]
        },
        {
          id: 'mismatched-pairs',
          title: 'Mismatched Value-Weight Pairs',
          content: 'Each value must have a corresponding weight. Unmatched entries will be excluded.',
          tips: [
            'Count your values and weights - they should match',
            'Use consistent formatting for all pairs',
            'Check for missing colons, commas, or spaces'
          ]
        }
      ]
    };

    // Content for Standard Deviation Calculator
    const standardDeviationContent = {
      basics: [
        {
          id: 'what-is-standard-deviation',
          title: 'What is Standard Deviation?',
          content: 'Standard deviation measures how spread out data points are from the mean. A low standard deviation means data points are close to the mean, while a high standard deviation means they are spread out over a wide range.',
          examples: [
            'Low SD: Test scores 85, 87, 86, 88, 84 → SD ≈ 1.6',
            'High SD: Test scores 70, 95, 60, 90, 85 → SD ≈ 14.8'
          ]
        },
        {
          id: 'sample-vs-population',
          title: 'Sample vs Population Standard Deviation',
          content: 'Sample standard deviation (s) uses n-1 in the denominator, while population standard deviation (σ) uses n. Use sample standard deviation when working with a subset of data.',
          examples: [
            'Sample SD: s = √[Σ(x - x̄)² / (n-1)]',
            'Population SD: σ = √[Σ(x - μ)² / n]'
          ]
        },
        {
          id: 'input-formats-sd',
          title: 'Supported Input Formats',
          content: 'Enter numbers in various formats. The calculator supports manual entry, CSV files, JSON data, and batch processing for large datasets.',
          examples: [
            'Manual: 1, 2, 3, 4, 5',
            'CSV file: Upload data files',
            'Batch: Process multiple datasets at once'
          ]
        }
      ],
      formulas: [
        {
          id: 'sample-formula',
          title: 'Sample Standard Deviation Formula',
          content: 's = √[Σ(xᵢ - x̄)² / (n-1)]',
          examples: [
            'x̄ = sample mean',
            'xᵢ = individual data point',
            'n = sample size'
          ]
        },
        {
          id: 'population-formula',
          title: 'Population Standard Deviation Formula',
          content: 'σ = √[Σ(xᵢ - μ)² / n]',
          examples: [
            'μ = population mean',
            'xᵢ = individual data point', 
            'n = population size'
          ]
        },
        {
          id: 'variance-formula',
          title: 'Variance Formula',
          content: 'Variance is the square of standard deviation. It measures the average squared deviation from the mean.',
          examples: [
            'Sample variance: s² = Σ(xᵢ - x̄)² / (n-1)',
            'Population variance: σ² = Σ(xᵢ - μ)² / n'
          ]
        }
      ],
      examples: [
        {
          id: 'simple-sd-example',
          title: 'Simple Standard Deviation Example',
          content: 'Calculate standard deviation for: 2, 4, 4, 4, 5, 5, 7, 9',
          examples: [
            'Step 1: Calculate mean → (2+4+4+4+5+5+7+9)/8 = 5',
            'Step 2: Find deviations → -3, -1, -1, -1, 0, 0, 2, 4',
            'Step 3: Square deviations → 9, 1, 1, 1, 0, 0, 4, 16',
            'Step 4: Sum squared deviations → 32',
            'Step 5: Sample SD → √(32/7) = 2.14'
          ]
        },
        {
          id: 'outlier-example',
          title: 'Outlier Detection Example',
          content: 'Identify outliers in dataset: 12, 14, 15, 13, 16, 45, 14, 13',
          examples: [
            'Q1 = 13, Q3 = 15.5, IQR = 2.5',
            'Lower bound: 13 - 1.5×2.5 = 9.25',
            'Upper bound: 15.5 + 1.5×2.5 = 19.25',
            'Outlier: 45 (exceeds upper bound)'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'insufficient-data',
          title: 'Insufficient Data Points',
          content: 'Standard deviation requires at least 2 data points. For meaningful results, use 3 or more points.',
          tips: [
            'Minimum 2 points for calculation',
            'At least 3-5 points for reliable results',
            'Large samples (n≥30) for normal distribution assumptions'
          ]
        },
        {
          id: 'zero-variance',
          title: 'Zero Standard Deviation',
          content: 'When all data points are identical, standard deviation equals zero, indicating no variability.',
          tips: [
            'Check for data entry errors',
            'Verify measurement precision',
            'Consider if zero variance is expected'
          ]
        }
      ]
    };

    // Choose content based on calculator type
    const baseContent = calculatorType === 'standard-deviation' ? standardDeviationContent : 
                       calculatorType === 'weighted-mean' ? weightedMeanContent : meanContent;

    const contextSpecific = {
      student: {
        basics: [
          ...baseContent.basics,
          {
            id: 'why-important',
            title: calculatorType === 'standard-deviation' ? 'Why is Standard Deviation Important?' :
                   calculatorType === 'weighted-mean' ? 'Why is Weighted Mean Important?' : 'Why is the Mean Important?',
            content: calculatorType === 'standard-deviation' 
              ? 'Standard deviation helps you understand data variability and reliability. It\'s essential for quality control, risk assessment, and determining if your data follows expected patterns.'
              : calculatorType === 'weighted-mean' 
              ? 'Weighted mean gives more importance to certain values, making it essential for accurate GPA calculations, portfolio analysis, and situations where not all data points are equally significant.'
              : 'The mean helps you understand the typical value in your data set. It\'s commonly used to calculate grade averages, compare performance, and analyze trends.',
            examples: calculatorType === 'standard-deviation' 
              ? [
                  'Assess consistency in test scores',
                  'Measure manufacturing quality control',
                  'Evaluate investment risk and volatility'
                ]
              : calculatorType === 'weighted-mean' 
              ? [
                  'Calculate accurate GPA with course credits',
                  'Analyze portfolio returns by investment size',
                  'Weight survey responses by sample size'
                ]
              : [
                  'Calculate your semester GPA',
                  'Find average test scores',
                  'Compare class performance'
                ]
          }
        ],
        examples: [
          ...baseContent.examples,
          ...(calculatorType === 'standard-deviation' ? [
            {
              id: 'test-score-variability',
              title: 'Test Score Variability Example',
              content: 'Compare consistency between two students with same average (85%):',
              examples: [
                'Student A scores: 83, 85, 87, 84, 86 → SD = 1.58 (consistent)',
                'Student B scores: 70, 90, 85, 95, 75 → SD = 10.95 (inconsistent)',
                'Both have mean = 85%, but Student A is more consistent'
              ]
            }
          ] : [
            {
              id: 'grade-example',
              title: 'Grade Average Example',
              content: 'Calculate your course average from test scores: 88, 92, 76, 94, 85',
              examples: [
                'Sum: 88 + 92 + 76 + 94 + 85 = 435',
                'Count: 5 tests',
                'Average: 435 ÷ 5 = 87',
                'Your course average is 87%'
              ]
            }
          ])
        ]
      },
      research: {
        basics: [
          ...baseContent.basics,
          ...(calculatorType === 'standard-deviation' ? [
            {
              id: 'advanced-statistics',
              title: 'Advanced Statistical Analysis',
              content: 'Standard deviation enables advanced statistical measures like coefficient of variation, skewness, and kurtosis for comprehensive data analysis.',
              examples: [
                'CV = (SD/Mean) × 100% - measures relative variability',
                'Skewness - measures asymmetry of distribution',
                'Kurtosis - measures tail heaviness of distribution'
              ]
            }
          ] : [
            {
              id: 'sample-vs-population',
              title: 'Sample vs Population Mean',
              content: 'Understand the difference between sample mean (x̄) and population mean (μ) for proper statistical inference.',
              examples: [
                'Sample mean: represents a subset of data',
                'Population mean: represents all possible data'
              ]
            }
          ])
        ],
        formulas: [
          ...baseContent.formulas,
          ...(calculatorType === 'standard-deviation' ? [
            {
              id: 'coefficient-variation',
              title: 'Coefficient of Variation',
              content: 'CV = (σ/μ) × 100% - standardized measure of dispersion',
              examples: [
                'Low CV (<15%): Low relative variability',
                'Medium CV (15-35%): Moderate variability',
                'High CV (>35%): High relative variability'
              ]
            },
            {
              id: 'normality-testing',
              title: 'Normality Assessment',
              content: 'Use skewness and kurtosis to assess if data follows normal distribution',
              examples: [
                'Normal: Skewness ≈ 0, Kurtosis ≈ 3',
                'Right-skewed: Skewness > 0',
                'Left-skewed: Skewness < 0'
              ]
            }
          ] : [
            {
              id: 'confidence-intervals',
              title: 'Confidence Intervals',
              content: 'CI = x̄ ± (t × SE), where SE = s/√n',
              examples: [
                't = critical t-value from t-distribution',
                'SE = standard error of the mean',
                's = sample standard deviation',
                'n = sample size'
              ]
            },
            {
              id: 'outlier-detection',
              title: 'Outlier Detection (IQR Method)',
              content: 'Outliers are values beyond Q1 - 1.5×IQR or Q3 + 1.5×IQR',
              examples: [
                'Q1 = 25th percentile',
                'Q3 = 75th percentile', 
                'IQR = Q3 - Q1'
              ]
            }
          ])
        ]
      },
      teacher: {
        basics: [
          ...baseContent.basics,
          {
            id: calculatorType === 'standard-deviation' ? 'performance-variability' : 'grade-analysis',
            title: calculatorType === 'standard-deviation' ? 'Class Performance Variability Analysis' : 'Grade Distribution Analysis',
            content: calculatorType === 'standard-deviation' 
              ? 'Standard deviation reveals how consistently students are learning. Low SD indicates uniform understanding, while high SD suggests mixed comprehension levels that may require differentiated instruction.'
              : 'Use the mean alongside grade distribution to understand overall class performance and identify learning gaps.',
            examples: calculatorType === 'standard-deviation' 
              ? [
                  'Low SD (< 10): Class understands material uniformly',
                  'Medium SD (10-20): Some students need extra support',
                  'High SD (> 20): Wide range of understanding - differentiate instruction'
                ]
              : [
                  'Class average below 70: review curriculum',
                  'High standard deviation: varied understanding',
                  'Grade distribution: identify struggling students'
                ]
          }
        ],
        examples: [
          ...baseContent.examples,
          ...(calculatorType === 'standard-deviation' ? [
            {
              id: 'class-assessment-analysis',
              title: 'Class Assessment Variability Analysis',
              content: 'Compare two classes with the same mean (75%) but different standard deviations:',
              examples: [
                'Class A: Mean = 75%, SD = 8 → Most students scored 67-83%',
                'Class B: Mean = 75%, SD = 18 → Students scored 57-93%',
                'Class A shows consistent understanding',
                'Class B needs differentiated instruction strategies'
              ],
              tips: [
                'Low SD: Effective uniform teaching approach',
                'High SD: Implement tiered assignments',
                'Monitor SD trends across multiple assessments'
              ]
            }
          ] : [
            {
              id: 'class-analysis',
              title: 'Class Performance Analysis',
              content: 'Analyze a class of 30 students with an average of 78%',
              examples: [
                'Grade A (90-100): 6 students (20%)',
                'Grade B (80-89): 12 students (40%)',
                'Grade C (70-79): 8 students (27%)',
                'Grade D (60-69): 3 students (10%)',
                'Grade F (0-59): 1 student (3%)'
              ],
              tips: [
                'Focus extra help on D/F students',
                'Consider advanced material for A students',
                'Class mean of 78% indicates good overall understanding'
              ]
            }
          ])
        ]
      }
    };

    return contextSpecific[userMode] || baseContent;
  };

  const helpContent = getHelpContent();
  const currentTopics = helpContent[activeTab] || [];

  const toggleTopic = (topicId: string) => {
    setExpandedTopic(expandedTopic === topicId ? null : topicId);
  };

  const getModeIcon = () => {
    switch (userMode) {
      case 'student': return <BookOpen className="h-4 w-4" />;
      case 'research': return <Target className="h-4 w-4" />;
      case 'teacher': return <Users className="h-4 w-4" />;
      default: return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getModeColor = () => {
    switch (userMode) {
      case 'student': return 'blue';
      case 'research': return 'purple';
      case 'teacher': return 'green';
      default: return 'gray';
    }
  };

  const color = getModeColor();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center">
          <div className={`p-2 bg-${color}-100 rounded-lg mr-3`}>
            {getModeIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Help & Guide</h3>
            <p className="text-sm text-gray-600 capitalize">{userMode} Mode Resources</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {(['basics', 'formulas', 'examples', 'troubleshooting'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? `bg-white text-${color}-600 shadow-sm`
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center justify-center">
                {tab === 'basics' && <Lightbulb className="h-4 w-4 mr-1" />}
                {tab === 'formulas' && <Calculator className="h-4 w-4 mr-1" />}
                {tab === 'examples' && <Play className="h-4 w-4 mr-1" />}
                {tab === 'troubleshooting' && <AlertCircle className="h-4 w-4 mr-1" />}
                <span className="capitalize">{tab}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {currentTopics.map((topic) => (
            <div key={topic.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleTopic(topic.id)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{topic.title}</span>
                {expandedTopic === topic.id ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
              </button>
              
              {expandedTopic === topic.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="text-gray-700 mb-3">{topic.content}</p>
                  
                  {topic.examples && topic.examples.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Examples:</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                        {topic.examples.map((example, index) => (
                          <div key={index} className="text-sm font-mono text-gray-700">
                            {example}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {topic.tips && topic.tips.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Tips:</h5>
                      <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3`}>
                        {topic.tips.map((tip, index) => (
                          <div key={index} className={`text-sm text-${color}-800 flex items-start mb-1 last:mb-0`}>
                            <span className="mr-2">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {topic.links && topic.links.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Learn More:</h5>
                      <div className="space-y-1">
                        {topic.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`text-sm text-${color}-600 hover:text-${color}-800 flex items-center`}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            {link.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className={`mt-6 p-4 bg-${color}-50 border border-${color}-200 rounded-lg`}>
          <h4 className={`text-sm font-medium text-${color}-900 mb-2 flex items-center`}>
            <Lightbulb className="h-4 w-4 mr-1" />
            Quick Tips for {userMode === 'student' ? 'Students' : userMode === 'research' ? 'Researchers' : 'Teachers'}
          </h4>
          <div className={`text-sm text-${color}-800 space-y-1`}>
            {userMode === 'student' && (
              <>
                {calculatorType === 'standard-deviation' ? (
                  <>
                    <div>• Use sample SD for homework unless specified as population</div>
                    <div>• Check the calculation steps to understand the process</div>
                    <div>• Compare different datasets to understand variability</div>
                  </>
                ) : calculatorType === 'weighted-mean' ? (
                  <>
                    <div>• Enter your course grades and credit hours for accurate GPA</div>
                    <div>• Use the calculation steps to understand weighting</div>
                    <div>• Adjust precision for official transcripts (usually 2 decimals)</div>
                  </>
                ) : (
                  <>
                    <div>• Use the precision control to match your assignment requirements</div>
                    <div>• Check the calculation steps to understand the process</div>
                    <div>• Copy results for easy submission in your homework</div>
                  </>
                )}
              </>
            )}
            {userMode === 'research' && (
              <>
                {calculatorType === 'standard-deviation' ? (
                  <>
                    <div>• Use outlier detection to identify anomalous data points</div>
                    <div>• Consider coefficient of variation for relative comparisons</div>
                    <div>• Assess normality using skewness and kurtosis measures</div>
                  </>
                ) : calculatorType === 'weighted-mean' ? (
                  <>
                    <div>• Consider weight distribution in your analysis</div>
                    <div>• Use high precision for scientific calculations</div>
                    <div>• Validate that weights represent true importance</div>
                  </>
                ) : (
                  <>
                    <div>• Enable outlier detection to identify unusual data points</div>
                    <div>• Use confidence intervals for population parameter estimation</div>
                    <div>• Consider statistical assumptions before interpreting results</div>
                  </>
                )}
              </>
            )}
            {userMode === 'teacher' && (
              <>
                {calculatorType === 'standard-deviation' ? (
                  <>
                    <div>• Monitor SD trends to assess teaching effectiveness</div>
                    <div>• High SD indicates need for differentiated instruction</div>
                    <div>• Use visualization to show students data distribution</div>
                  </>
                ) : calculatorType === 'weighted-mean' ? (
                  <>
                    <div>• Set appropriate weights for different assignments</div>
                    <div>• Consider assignment difficulty when weighting</div>
                    <div>• Export weighted grades for final grade calculation</div>
                  </>
                ) : (
                  <>
                    <div>• Use grade distribution to identify learning patterns</div>
                    <div>• Compare class averages across different assignments</div>
                    <div>• Export results for gradebook integration</div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSection;