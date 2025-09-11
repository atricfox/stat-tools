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
  calculatorType?: 'mean' | 'weighted-mean' | 'standard-deviation' | 'final-grade' | 'semester-grade' | 'cumulative-gpa' | 'gpa' | 'percent-error' | 'range';
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
            'Data: Math(90, 3 credits), English(85, 4 credits) → Weighted Mean = 87.14',
            'Grades: 90×3 + 85×4 = 610, Total weights: 3+4 = 7, Result: 610÷7 = 87.14'
          ]
        },
        {
          id: 'input-formats',
          title: 'Supported Input Formats',
          content: 'You can enter value-weight pairs separated by commas, spaces, or new lines. The calculator automatically handles different formats.',
          examples: [
            'Pairs format: 85:3, 90:4, 78:2',
            'Colon format: 85:3\n90:4\n78:2',
            'Tab separated: 85\t3\n90\t4\n78\t2'
          ]
        }
      ],
      formulas: [
        {
          id: 'basic-formula',
          title: 'Weighted Mean Formula',
          content: 'Weighted Mean = Σ(value × weight) ÷ Σ(weight)',
          examples: ['Σ(vᵢ × wᵢ) ÷ Σ(wᵢ) where vᵢ = value, wᵢ = weight']
        }
      ],
      examples: [
        {
          id: 'simple-example',
          title: 'Simple Example',
          content: 'Calculate weighted mean of: Math(90, 3 credits), English(85, 4 credits), Science(88, 2 credits)',
          examples: [
            'Step 1: Multiply values by weights → 90×3, 85×4, 88×2',
            'Step 2: Calculate weighted values → 270 + 340 + 176 = 786',
            'Step 3: Sum weights → 3 + 4 + 2 = 9',
            'Step 4: Divide weighted sum by total weight → 786 ÷ 9 = 87.33',
            'Answer: The weighted mean is 87.33'
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
            'Ensure each value has a corresponding weight',
            'Use consistent formatting for value-weight pairs'
          ]
        }
      ]
    };

    // Content for Final Grade Calculator
    const finalGradeContent = {
      basics: [
        {
          id: 'what-is-final-grade-prediction',
          title: 'What is Final Grade Prediction?',
          content: 'Final Grade Prediction helps you determine the minimum score needed on your final exam to achieve your desired overall grade in a course. It calculates the required final exam score based on your current performance and the weight of the final exam in your course.',
          examples: [
            'Current grade: 85%, Final exam weight: 30%, Target: 90% → Required final score: 101.7%',
            'Current grade: 78%, Final exam weight: 40%, Target: 85% → Required final score: 95.5%'
          ]
        },
        {
          id: 'input-methods',
          title: 'Input Methods',
          content: 'You can add your current grades using multiple convenient methods to ensure accuracy.',
          examples: [
            'Manual Entry: Add grades one by one with names, scores, and weights',
            'Gradebook Paste: Copy-paste from your online gradebook',
            'Spreadsheet Import: Import from Excel or Google Sheets',
            'CSV Upload: Upload a CSV file with your grade data'
          ]
        }
      ],
      formulas: [
        {
          id: 'final-grade-formula',
          title: 'Final Grade Calculation Formula',
          content: 'Final Grade = (Current Weighted Score × Current Weight) + (Final Exam Score × Final Weight)',
          examples: [
            'Required Final Score = (Target Grade - Current Weighted Score × Current Weight) / Final Weight',
            'If result > 100%, the target grade may not be achievable'
          ]
        }
      ],
      examples: [
        {
          id: 'detailed-example',
          title: 'Step-by-Step Example',
          content: 'Calculate required final exam score with multiple assignments',
          examples: [
            'Assignments: Homework (90%, 20%), Midterm (85%, 25%), Quiz (88%, 15%)',
            'Current weighted score: 90×0.20 + 85×0.25 + 88×0.15 = 18 + 21.25 + 13.2 = 52.45%',
            'Current weight used: 20% + 25% + 15% = 60%',
            'Final exam weight: 40%, Target grade: 87%',
            'Required final score: (87 - 52.45) / 0.40 = 86.375%',
            'Answer: You need at least 86.4% on your final exam'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'impossible-grades',
          title: 'When Target Grades Are Impossible',
          content: 'If the required final exam score exceeds 100%, your target grade may not be achievable with the current grading structure.',
          tips: [
            'Consider adjusting your target grade to a more realistic level',
            'Check if there are extra credit opportunities available',
            'Verify that you entered all assignments and their weights correctly',
            'Speak with your instructor about grade improvement options'
          ]
        },
        {
          id: 'weight-validation',
          title: 'Weight Validation Issues',
          content: 'Make sure all assignment weights and the final exam weight add up correctly for accurate predictions.',
          tips: [
            'Total weights should equal 100% (all assignments + final exam)',
            'Check your syllabus for the correct final exam weight',
            'Ensure individual assignment weights match your syllabus',
            'Account for dropped lowest grades or bonus points if applicable'
          ]
        }
      ]
    };

    // Content for Semester Grade Calculator
    const semesterGradeContent = {
      basics: [
        {
          id: 'what-is-semester-gpa',
          title: 'What is Semester GPA?',
          content: 'Semester GPA is the Grade Point Average for courses taken during a single academic term. It calculates your performance for just that semester, distinct from cumulative GPA which includes all terms.',
          examples: [
            'Fall 2024: Math (A, 3 cr), English (B+, 4 cr), History (A-, 2 cr) → Semester GPA: 3.67',
            'Spring 2024: 5 courses, 15 credits, various grades → Calculate weighted average'
          ]
        },
        {
          id: 'input-methods',
          title: 'Multiple Input Methods',
          content: 'Add your semester courses using the method most convenient for you.',
          examples: [
            'Manual Entry: Add each course with name, grade, and credits',
            'Paste Transcript: Copy-paste directly from your academic transcript',
            'Spreadsheet Import: Import from Excel or Google Sheets',
            'CSV Upload: Upload a formatted CSV file with course data'
          ]
        }
      ],
      formulas: [
        {
          id: 'semester-gpa-formula',
          title: 'Semester GPA Formula',
          content: 'Semester GPA = Σ(Grade Points × Credits) ÷ Σ(Credits)',
          examples: [
            'Grade Points vary by system: A=4.0, B=3.0, C=2.0, etc.',
            'Each course contributes: Grade Points × Credit Hours',
            'Total divided by total credit hours for semester'
          ]
        }
      ],
      examples: [
        {
          id: 'semester-example',
          title: 'Complete Semester Example',
          content: 'Calculate semester GPA for a typical course load',
          examples: [
            'Course 1: Calculus I (A, 4.0 points, 4 credits) → 4.0 × 4 = 16 quality points',
            'Course 2: English 101 (B+, 3.3 points, 3 credits) → 3.3 × 3 = 9.9 quality points',
            'Course 3: Psychology (A-, 3.7 points, 3 credits) → 3.7 × 3 = 11.1 quality points',
            'Course 4: Chemistry Lab (B, 3.0 points, 1 credit) → 3.0 × 1 = 3.0 quality points',
            'Total: 40.0 quality points ÷ 11 credits = 3.64 Semester GPA'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'grade-conversion',
          title: 'Grade System Conversion',
          content: 'Make sure you are using the correct grading scale for your institution.',
          tips: [
            'Check your school\'s official grading scale (4.0, 4.3, or 5.0 scale)',
            'Verify plus/minus grade values (B+ vs B vs B-)',
            'Some schools don\'t use plus/minus grades',
            'International students: convert to your target country\'s system'
          ]
        },
        {
          id: 'credit-hours',
          title: 'Credit Hours Accuracy',
          content: 'Ensure credit hours are entered correctly for accurate GPA calculation.',
          tips: [
            'Check your transcript for official credit hours',
            'Lab courses often have different credit values than lectures',
            'Some courses may have variable credits (1-3 credits)',
            'Pass/Fail courses typically don\'t count toward GPA'
          ]
        }
      ]
    };

    // Content for Cumulative GPA Calculator
    const cumulativeGPAContent = {
      basics: [
        {
          id: 'what-is-cumulative-gpa',
          title: 'What is Cumulative GPA?',
          content: 'Cumulative GPA is your overall Grade Point Average across all semesters and courses throughout your academic career. It calculates the weighted average of all your grades, giving more weight to courses with more credit hours.',
          examples: [
            'All semesters combined: Freshman through Senior year → Single cumulative GPA',
            'Graduate school applications typically require cumulative undergraduate GPA',
            'Different from semester GPA which only covers one term'
          ]
        },
        {
          id: 'grading-system-conversion',
          title: 'Grading System Conversions',
          content: 'This calculator supports conversion between different grading systems for international students and different institutions.',
          examples: [
            'Input System: Your school\'s grades (4.0, 5.0, or percentage)',
            'Target System: Convert to desired scale for applications',
            'Automatic conversion: Enter grades in one scale, get results in another',
            'Common conversions: US 4.0 ↔ European percentage ↔ Other scales'
          ]
        }
      ],
      formulas: [
        {
          id: 'cumulative-gpa-formula',
          title: 'Cumulative GPA Calculation',
          content: 'Cumulative GPA = Total Grade Points ÷ Total Credit Hours (across all terms)',
          examples: [
            'Grade Points = Grade Value × Credit Hours (for each course)',
            'Sum all grade points from all courses across all semesters',
            'Sum all credit hours from all courses',
            'Divide total grade points by total credit hours'
          ]
        }
      ],
      examples: [
        {
          id: 'multi-semester-example',
          title: 'Multi-Semester Calculation',
          content: 'Calculate cumulative GPA across multiple semesters',
          examples: [
            'Semester 1: GPA 3.2, 15 credits → 48.0 grade points',
            'Semester 2: GPA 3.6, 16 credits → 57.6 grade points', 
            'Semester 3: GPA 3.8, 14 credits → 53.2 grade points',
            'Total: 158.8 grade points ÷ 45 credits = 3.53 Cumulative GPA',
            'Note: You can exclude courses by unchecking them'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'grade-exclusions',
          title: 'Including/Excluding Courses',
          content: 'Use the checkboxes to control which courses count toward your GPA calculation.',
          tips: [
            'Uncheck pass/fail courses that don\'t affect GPA',
            'Exclude repeated courses if your school uses grade replacement',
            'Include all courses for most accurate cumulative GPA',
            'Check your school\'s policy on GPA calculation rules'
          ]
        },
        {
          id: 'transfer-credits',
          title: 'Transfer and AP Credits',
          content: 'Handle transfer credits and advanced placement courses correctly.',
          tips: [
            'Most transfer credits count toward total credits but not GPA',
            'AP credits typically provide credits but no grade points',
            'Check if your school includes transfer grades in GPA',
            'Consult your registrar for official GPA calculation policies'
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
            'Data: 2, 4, 4, 4, 5, 5, 7, 9 → Sample SD = 2.14',
            'Low SD: Test scores 85, 87, 86, 88, 84 → SD ≈ 1.6',
            'High SD: Test scores 70, 95, 60, 90, 85 → SD ≈ 14.8'
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
          title: 'Standard Deviation Formulas',
          content: 'Sample SD = √[Σ(x - x̄)² / (n-1)] and Population SD = √[Σ(x - μ)² / n]',
          examples: ['Sample SD uses (n-1) for unbiased estimation', 'Population SD uses n for complete data sets']
        }
      ],
      examples: [
        {
          id: 'simple-example',
          title: 'Simple Example',
          content: 'Calculate standard deviation of: 2, 4, 4, 4, 5, 5, 7, 9',
          examples: [
            'Step 1: Calculate mean → (2+4+4+4+5+5+7+9)/8 = 5',
            'Step 2: Find deviations → -3, -1, -1, -1, 0, 0, 2, 4',
            'Step 3: Square deviations → 9, 1, 1, 1, 0, 0, 4, 16',
            'Step 4: Sum squared deviations → 32',
            'Step 5: Sample SD → √(32/7) = 2.14'
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

    // Content for Percent Error Calculator
    const percentErrorContent = {
      basics: [
        {
          id: 'what-is-percent-error',
          title: 'What is Percent Error?',
          content: 'Percent error measures the accuracy of an experimental or measured value compared to a theoretical or expected value. It shows how far off your measurement is as a percentage.',
          examples: [
            'Theoretical: 9.8 m/s², Experimental: 9.6 m/s² → Percent Error = 2.04%',
            'Expected grade: 100, Actual grade: 95 → Percent Error = 5.00%',
            'Target value: 25.00, Measured: 24.75 → Percent Error = 1.00%'
          ]
        },
        {
          id: 'input-requirements',
          title: 'Input Requirements',
          content: 'You need two values: a theoretical (expected) value and an experimental (measured) value. The theoretical value cannot be zero.',
          examples: [
            'Theoretical value: The expected or true value',
            'Experimental value: The measured or observed value',
            'Both values must be numerical'
          ]
        }
      ],
      formulas: [
        {
          id: 'basic-formula',
          title: 'Percent Error Formula',
          content: 'Percent Error = (|Experimental - Theoretical| / |Theoretical|) × 100%',
          examples: [
            'Absolute error = |Experimental - Theoretical|',
            'Relative error = Absolute error / |Theoretical|',
            'Accuracy = 100% - Percent Error'
          ]
        }
      ],
      examples: [
        {
          id: 'physics-example',
          title: 'Physics Measurement',
          content: 'Measuring gravitational acceleration',
          examples: [
            'Theoretical g: 9.8 m/s²',
            'Experimental g: 9.6 m/s²',
            'Absolute Error: |9.6 - 9.8| = 0.2 m/s²',
            'Percent Error: (0.2 / 9.8) × 100% = 2.04%'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'zero-theoretical',
          title: 'Theoretical Value Cannot Be Zero',
          content: 'Division by zero is undefined. Make sure your theoretical value is not zero.',
          tips: [
            'Check if you entered values in the correct fields',
            'Verify your theoretical value is correct',
            'Use a different reference point if needed'
          ]
        }
      ]
    };

    // Content for Range Calculator
    const rangeContent = {
      basics: [
        {
          id: 'what-is-range',
          title: 'What is Data Range?',
          content: 'The range is the difference between the maximum and minimum values in a dataset. It provides a simple measure of how spread out your data is.',
          examples: [
            'Data: 12, 15, 8, 22, 18, 7, 25, 14, 19, 11 → Range = 25 - 7 = 18',
            'Test scores: 85, 92, 78, 96, 88 → Range = 96 - 78 = 18',
            'Temperatures: -5°C, 2°C, 8°C → Range = 8 - (-5) = 13°C'
          ]
        },
        {
          id: 'input-formats',
          title: 'Supported Input Formats',
          content: 'Enter numbers separated by commas, spaces, or new lines. At least 2 numbers are needed to calculate a range.',
          examples: [
            'Comma separated: 12, 15, 8, 22, 18',
            'Space separated: 12 15 8 22 18',
            'Line by line:\n12\n15\n8\n22\n18'
          ]
        }
      ],
      formulas: [
        {
          id: 'basic-formula',
          title: 'Range and Distribution Formulas',
          content: 'Range = Maximum - Minimum, IQR = Q3 - Q1, Outliers detected using 1.5×IQR method',
          examples: [
            'Range shows total spread of data',
            'IQR (Interquartile Range) shows middle 50% spread',
            'Outliers: Values beyond Q1 - 1.5×IQR or Q3 + 1.5×IQR'
          ]
        }
      ],
      examples: [
        {
          id: 'grade-analysis',
          title: 'Grade Distribution Analysis',
          content: 'Analyzing student grades: 95, 87, 92, 78, 89, 94, 81, 88, 90, 85',
          examples: [
            'Minimum: 78, Maximum: 95',
            'Range: 95 - 78 = 17',
            'Q1: 85, Q3: 92, IQR: 7',
            'No outliers detected'
          ]
        }
      ],
      troubleshooting: [
        {
          id: 'single-value',
          title: 'Single Value Input',
          content: 'Range is 0 when only one value is provided. You need at least 2 values to calculate a meaningful range.',
          tips: [
            'Add more data points to your dataset',
            'Check if some values were not recognized',
            'Ensure proper formatting of your input'
          ]
        }
      ]
    };

    // Choose content based on calculator type
    const baseContent = calculatorType === 'standard-deviation' ? standardDeviationContent : 
                       calculatorType === 'weighted-mean' ? weightedMeanContent : 
                       calculatorType === 'final-grade' ? finalGradeContent :
                       calculatorType === 'semester-grade' ? semesterGradeContent :
                       calculatorType === 'cumulative-gpa' ? cumulativeGPAContent :
                       calculatorType === 'gpa' ? cumulativeGPAContent :
                       calculatorType === 'percent-error' ? percentErrorContent :
                       calculatorType === 'range' ? rangeContent :
                       meanContent;

    const contextSpecific = {
      student: {
        basics: baseContent.basics,
        examples: baseContent.examples,
        formulas: baseContent.formulas,
        troubleshooting: baseContent.troubleshooting
      },
      research: {
        basics: baseContent.basics,
        examples: baseContent.examples,
        formulas: baseContent.formulas,
        troubleshooting: baseContent.troubleshooting
      },
      teacher: {
        basics: baseContent.basics,
        examples: baseContent.examples,
        formulas: baseContent.formulas,
        troubleshooting: baseContent.troubleshooting
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
    <div className={className}>
      {/* Tabs */}
      <div className="mb-4">
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
              ) : calculatorType === 'final-grade' ? (
                <>
                  <div>• Be realistic with target grades - check if they're achievable</div>
                  <div>• Include all assignments and their correct weights</div>
                  <div>• Use this tool early in the semester for better planning</div>
                </>
              ) : calculatorType === 'semester-grade' ? (
                <>
                  <div>• Double-check your grading system matches your school's scale</div>
                  <div>• Include all courses from the semester, including labs</div>
                  <div>• Verify credit hours from your official transcript</div>
                </>
              ) : (calculatorType === 'cumulative-gpa' || calculatorType === 'gpa') ? (
                <>
                  <div>• Organize courses by semester for better tracking</div>
                  <div>• Use grade exclusion features for pass/fail courses</div>
                  <div>• Consider retaking courses with very low grades</div>
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
              ) : calculatorType === 'final-grade' ? (
                <>
                  <div>• Analyze grade prediction patterns across different scenarios</div>
                  <div>• Consider statistical implications of final exam weighting</div>
                  <div>• Document assumptions about grading scale conversions</div>
                </>
              ) : calculatorType === 'semester-grade' ? (
                <>
                  <div>• Compare semester GPA trends across different academic periods</div>
                  <div>• Analyze credit distribution patterns and their impact</div>
                  <div>• Document grading scale variations across institutions</div>
                </>
              ) : (calculatorType === 'cumulative-gpa' || calculatorType === 'gpa') ? (
                <>
                  <div>• Track GPA trends across multiple academic years</div>
                  <div>• Analyze impact of grading system conversions</div>
                  <div>• Model different academic scenarios and outcomes</div>
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
              ) : calculatorType === 'final-grade' ? (
                <>
                  <div>• Help students set realistic target grades early</div>
                  <div>• Use predictions to identify at-risk students</div>
                  <div>• Adjust final exam weights to ensure fair assessment</div>
                </>
              ) : calculatorType === 'semester-grade' ? (
                <>
                  <div>• Monitor semester GPA trends to assess student progress</div>
                  <div>• Use batch import features for class-wide calculations</div>
                  <div>• Help students understand credit hour impact on GPA</div>
                </>
              ) : (calculatorType === 'cumulative-gpa' || calculatorType === 'gpa') ? (
                <>
                  <div>• Track student academic progress across multiple years</div>
                  <div>• Identify students at risk for academic probation</div>
                  <div>• Guide students on graduation requirements and GPA goals</div>
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
  );
};

export default HelpSection;