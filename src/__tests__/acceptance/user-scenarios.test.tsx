/**
 * User Acceptance Tests for Statistical Calculator
 * Tests complete user scenarios and workflows from end-user perspective
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MeanCalculatorPage from '@/app/calculator/mean/page';

// Mock the complex dependencies for cleaner acceptance testing
jest.mock('@/lib/calculation-cache-integration', () => ({
  calculateMeanCached: jest.fn().mockImplementation(async (data, options) => {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const sum = data.reduce((a, b) => a + b, 0);
    const min = Math.min(...data);
    const max = Math.max(...data);
    const variance = data.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / data.length;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      mean: parseFloat(mean.toFixed(options.precision || 2)),
      count: data.length,
      sum,
      min,
      max,
      range: max - min,
      standardDeviation: parseFloat(standardDeviation.toFixed(options.precision || 2)),
      variance: parseFloat(variance.toFixed(options.precision || 2)),
      cacheInfo: {
        cacheHit: false,
        computationTime: Math.random() * 20 + 5,
        cacheKey: `test-${Date.now()}`,
        dataSignature: data.slice(0, 5).join(',')
      },
      qualityMetrics: {
        confidence: data.length >= 30 ? 95 : data.length >= 10 ? 80 : 60,
        reliability: data.length >= 30 ? 'high' : data.length >= 10 ? 'moderate' : 'low',
        suggestions: data.length < 10 ? ['Consider collecting more data'] : []
      }
    };
  }),
  calculateHighPrecisionCached: jest.fn().mockImplementation(async (data, options) => {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    return {
      mean: parseFloat(mean.toFixed(6)),
      precision: 6,
      confidenceInterval95: {
        lower: mean - 1.96 * Math.sqrt(data.length),
        upper: mean + 1.96 * Math.sqrt(data.length)
      },
      cacheInfo: { cacheHit: false, computationTime: 25 }
    };
  })
}));

jest.mock('@/lib/dynamic-imports', () => ({
  lazyPages: {
    highPrecisionResults: { 
      Component: ({ data, precision }) => (
        <div data-testid="research-results">
          <h3>Advanced Statistical Analysis</h3>
          <div>Sample Size: {data?.length || 0}</div>
          <div>Precision: {precision} digits</div>
          <div>Confidence Intervals Available</div>
        </div>
      ) 
    },
    teacherFileUpload: { 
      Component: ({ onDataExtracted }) => (
        <div data-testid="teacher-upload">
          <button onClick={() => onDataExtracted([85, 90, 88, 92, 87])}>
            Upload Sample Data
          </button>
        </div>
      ) 
    },
    batchProcessing: { 
      Component: () => (
        <div data-testid="batch-processing">
          <h3>Batch Processing Manager</h3>
          <div>Ready to process multiple datasets</div>
        </div>
      )
    }
  },
  contextualLoader: { setContext: jest.fn() }
}));

describe('User Acceptance Tests - Student Scenarios', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
  });

  test('US-001: Student calculates test scores average', async () => {
    const user = userEvent.setup();
    
    // User Story: As a student, I want to calculate my test scores average
    // So that I can know my current grade in the class
    
    render(<MeanCalculatorPage />);

    // Student opens the calculator
    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Student should see student mode is already selected
    expect(screen.getByText('Student', { selector: 'span' })).toBeInTheDocument();

    // Student enters their test scores
    const testScores = '85, 92, 78, 96, 88, 91, 83, 89';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, testScores);

    // Student sees immediate feedback about data entry
    await waitFor(() => {
      expect(screen.getByText('8 values')).toBeInTheDocument();
    });

    // Student sees the calculated average
    await waitFor(() => {
      expect(screen.getByText('87.75')).toBeInTheDocument(); // Expected average
    });

    // Student can see additional statistics
    expect(screen.getByText('87.75')).toBeInTheDocument(); // Mean
    expect(screen.getByText('702')).toBeInTheDocument(); // Sum (approximately)

    // Student can copy results for their records
    const copyButton = screen.getByRole('button', { name: /copy results/i });
    expect(copyButton).toBeInTheDocument();

    // Student can share results
    const shareButton = screen.getByRole('button', { name: /share/i });
    expect(shareButton).toBeInTheDocument();

    console.log('✅ US-001: Student successfully calculated test scores average');
  });

  test('US-001 Extended: Student adjusts precision for better accuracy', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Student enters grades with decimal points
    const preciseScores = '85.5, 92.3, 78.7, 96.2, 88.1, 91.4, 83.8, 89.0';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, preciseScores);

    // Student wants more precision for better accuracy
    const precisionSlider = screen.getByRole('slider', { name: /precision/i });
    await user.clear(precisionSlider);
    await user.type(precisionSlider, '3');

    // Student sees more precise results
    await waitFor(() => {
      expect(screen.getByText(/87\.625/)).toBeInTheDocument(); // More precise average
    });

    console.log('✅ US-001 Extended: Student successfully adjusted precision');
  });

  test('US-001 Mobile: Student uses calculator on mobile device', async () => {
    const user = userEvent.setup();
    
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
    
    render(<MeanCalculatorPage />);
    
    // Trigger resize event
    fireEvent(window, new Event('resize'));

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Student should see mobile-optimized interface
    expect(screen.getByRole('combobox')).toBeInTheDocument(); // Mobile dropdown

    // Student enters data in mobile-friendly input
    const mobileInput = screen.getByPlaceholderText(/1, 2, 3, 4, 5.../);
    await user.type(mobileInput, '85, 90, 88');

    // Student sees mobile-optimized results
    await waitFor(() => {
      expect(screen.getByText('3 values')).toBeInTheDocument();
    });

    console.log('✅ US-001 Mobile: Student successfully used mobile interface');
  });
});

describe('User Acceptance Tests - Research Scenarios', () => {
  test('US-002: Research assistant analyzes experimental data', async () => {
    const user = userEvent.setup();
    
    // User Story: As a research assistant, I want to analyze experimental measurements
    // So that I can provide accurate statistical analysis for the research paper
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Research assistant switches to research mode
    const researchButton = screen.getByRole('button', { name: /research/i });
    await user.click(researchButton);

    // Verify research mode is active
    expect(screen.getByText('Research', { selector: 'span' })).toBeInTheDocument();

    // Research assistant enters scientific measurements
    const scientificData = '1.234e-3, 2.567e-3, 1.89e-3, 2.123e-3, 1.567e-3';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, scientificData);

    // Research assistant sees data has been processed
    await waitFor(() => {
      expect(screen.getByText('5 values')).toBeInTheDocument();
    });

    // Research assistant sees advanced statistical analysis
    await waitFor(() => {
      expect(screen.getByTestId('research-results')).toBeInTheDocument();
    });

    // Research assistant sees high-precision results
    expect(screen.getByText('Advanced Statistical Analysis')).toBeInTheDocument();
    expect(screen.getByText('Confidence Intervals Available')).toBeInTheDocument();

    console.log('✅ US-002: Research assistant successfully analyzed experimental data');
  });

  test('US-002 Extended: Research assistant uses high precision settings', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Switch to research mode
    const researchButton = screen.getByRole('button', { name: /research/i });
    await user.click(researchButton);

    // Research assistant sets high precision
    const precisionSlider = screen.getByRole('slider', { name: /precision/i });
    await user.clear(precisionSlider);
    await user.type(precisionSlider, '6');

    // Enter high-precision measurements
    const precisionData = '3.141592653, 2.718281828, 1.414213562';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, precisionData);

    // Verify high precision is being used
    await waitFor(() => {
      expect(screen.getByTestId('research-results')).toBeInTheDocument();
      expect(screen.getByText('Precision: 6 digits')).toBeInTheDocument();
    });

    console.log('✅ US-002 Extended: Research assistant successfully used high precision');
  });
});

describe('User Acceptance Tests - Teacher Scenarios', () => {
  test('US-003: Teacher processes student grades in bulk', async () => {
    const user = userEvent.setup();
    
    // User Story: As a teacher, I want to process multiple students\' grades at once
    // So that I can quickly analyze class performance
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Teacher switches to teacher mode
    const teacherButton = screen.getByRole('button', { name: /teacher/i });
    await user.click(teacherButton);

    // Verify teacher mode interface
    expect(screen.getByText('Teacher', { selector: 'span' })).toBeInTheDocument();
    expect(screen.getByText('Upload & Process Data')).toBeInTheDocument();
    expect(screen.getByText('Manual Data Entry')).toBeInTheDocument();

    // Teacher sees file upload option
    expect(screen.getByTestId('teacher-upload')).toBeInTheDocument();

    // Teacher can upload sample data
    const uploadButton = screen.getByText('Upload Sample Data');
    await user.click(uploadButton);

    // Teacher sees data has been processed
    await waitFor(() => {
      expect(screen.getByText('5 values')).toBeInTheDocument();
    });

    // Teacher can also see batch processing interface
    expect(screen.getByTestId('batch-processing')).toBeInTheDocument();
    expect(screen.getByText('Batch Processing Manager')).toBeInTheDocument();

    console.log('✅ US-003: Teacher successfully processed student grades in bulk');
  });

  test('US-003 Extended: Teacher enters tabulated grade data', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Switch to teacher mode
    const teacherButton = screen.getByRole('button', { name: /teacher/i });
    await user.click(teacherButton);

    // Teacher enters Excel-style data (tab-separated)
    const gradebookData = `Student1\t85\t92\t78
Student2\t96\t88\t91
Student3\t83\t89\t87`;

    const manualInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.click(manualInput);
    await user.paste(gradebookData);

    // Teacher sees the parsed data
    await waitFor(() => {
      expect(screen.getByText(/values/i)).toBeInTheDocument();
    });

    console.log('✅ US-003 Extended: Teacher successfully entered tabulated data');
  });
});

describe('Cross-Scenario User Acceptance Tests', () => {
  test('Data persistence across context switches', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // User enters data in student mode
    const testData = '10, 20, 30, 40, 50';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, testData);

    await waitFor(() => {
      expect(screen.getByText('5 values')).toBeInTheDocument();
    });

    // User switches to research mode
    const researchButton = screen.getByRole('button', { name: /research/i });
    await user.click(researchButton);

    // Data should persist
    expect(dataInput).toHaveValue(testData);
    await waitFor(() => {
      expect(screen.getByText('5 values')).toBeInTheDocument();
    });

    // User switches to teacher mode
    const teacherButton = screen.getByRole('button', { name: /teacher/i });
    await user.click(teacherButton);

    // Data should still persist
    expect(dataInput).toHaveValue(testData);

    console.log('✅ Data persistence: Successfully maintained data across context switches');
  });

  test('Error handling and user feedback', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // User enters invalid data
    const invalidData = 'abc, def, 123, xyz';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, invalidData);

    // Should handle mixed valid/invalid gracefully
    await waitFor(() => {
      expect(screen.getByText('1 values')).toBeInTheDocument(); // Only 123 is valid
    });

    // User enters empty data
    await user.clear(dataInput);
    await user.type(dataInput, '   ');

    // Should handle empty input gracefully
    expect(screen.queryByText(/values/)).not.toBeInTheDocument();

    console.log('✅ Error handling: Successfully handled invalid and empty input');
  });

  test('Accessibility and keyboard navigation', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Test keyboard navigation between context buttons
    const studentButton = screen.getByRole('button', { name: /student/i });
    const researchButton = screen.getByRole('button', { name: /research/i });
    const teacherButton = screen.getByRole('button', { name: /teacher/i });

    // All buttons should be accessible
    expect(studentButton).toBeInTheDocument();
    expect(researchButton).toBeInTheDocument();
    expect(teacherButton).toBeInTheDocument();

    // Test tab navigation
    await user.tab(); // Should focus on first interactive element
    
    // Input should be accessible
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    expect(dataInput).toBeInTheDocument();
    expect(dataInput).toHaveAttribute('id'); // Should have proper labeling

    console.log('✅ Accessibility: Interface elements are properly accessible');
  });

  test('Performance under typical usage patterns', async () => {
    const user = userEvent.setup();
    
    const startTime = performance.now();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    const initialRenderTime = performance.now() - startTime;
    expect(initialRenderTime).toBeLessThan(500); // Should render quickly

    // Test typical user interaction speed
    const interactionStart = performance.now();

    // User enters data
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, '85, 90, 88, 92, 87');

    // Wait for calculation
    await waitFor(() => {
      expect(screen.getByText('5 values')).toBeInTheDocument();
    });

    // User changes precision
    const precisionSlider = screen.getByRole('slider', { name: /precision/i });
    await user.clear(precisionSlider);
    await user.type(precisionSlider, '3');

    // User switches context
    const researchButton = screen.getByRole('button', { name: /research/i });
    await user.click(researchButton);

    const totalInteractionTime = performance.now() - interactionStart;
    
    console.log(`Performance test: Initial render ${initialRenderTime.toFixed(2)}ms, Interactions ${totalInteractionTime.toFixed(2)}ms`);
    
    // Interactions should be responsive
    expect(totalInteractionTime).toBeLessThan(2000);

    console.log('✅ Performance: Application responds within acceptable time limits');
  });
});

describe('Edge Cases and Stress Testing', () => {
  test('Large dataset handling', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Generate large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => i + 1).join(', ');
    
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.click(dataInput);
    await user.paste(largeDataset);

    // Should handle large dataset
    await waitFor(() => {
      expect(screen.getByText('1000 values')).toBeInTheDocument();
    }, { timeout: 10000 });

    console.log('✅ Large dataset: Successfully processed 1000 data points');
  });

  test('Extreme precision requirements', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Switch to research mode for high precision
    const researchButton = screen.getByRole('button', { name: /research/i });
    await user.click(researchButton);

    // Set maximum precision
    const precisionSlider = screen.getByRole('slider', { name: /precision/i });
    await user.clear(precisionSlider);
    await user.type(precisionSlider, '8');

    // Enter high-precision data
    const highPrecisionData = '3.141592653589793, 2.718281828459045, 1.4142135623730951';
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, highPrecisionData);

    // Should handle high precision
    await waitFor(() => {
      expect(screen.getByText('3 values')).toBeInTheDocument();
    });

    console.log('✅ High precision: Successfully processed high-precision calculations');
  });

  test('Rapid context switching stress test', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // Enter data first
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, '10, 20, 30');

    // Rapidly switch between contexts multiple times
    const contexts = ['research', 'teacher', 'student'];
    
    for (let i = 0; i < 6; i++) {
      const contextName = contexts[i % 3];
      const contextButton = screen.getByRole('button', { name: new RegExp(contextName, 'i') });
      await user.click(contextButton);
      
      // Should maintain stability
      await waitFor(() => {
        expect(screen.getByText(contextName, { selector: 'span' })).toBeInTheDocument();
      });
    }

    // Data should still be present
    expect(dataInput).toHaveValue('10, 20, 30');

    console.log('✅ Context switching stress test: Application remained stable');
  });
});

describe('User Experience Validation', () => {
  test('Complete user journey satisfaction', async () => {
    const user = userEvent.setup();
    
    // Simulate a complete user journey
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // 1. User discovers the interface
    expect(screen.getByText('Calculate mean with step-by-step explanations')).toBeInTheDocument();

    // 2. User understands the context options
    expect(screen.getByRole('button', { name: /student/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /research/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /teacher/i })).toBeInTheDocument();

    // 3. User successfully enters data
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, '85, 92, 78, 96, 88');

    // 4. User sees immediate feedback
    await waitFor(() => {
      expect(screen.getByText('5 values')).toBeInTheDocument();
    });

    // 5. User gets meaningful results
    await waitFor(() => {
      expect(screen.getByText('87.8')).toBeInTheDocument(); // Expected mean
    });

    // 6. User can take action with results
    expect(screen.getByRole('button', { name: /copy results/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();

    // 7. User can adjust for their needs
    const precisionSlider = screen.getByRole('slider', { name: /precision/i });
    expect(precisionSlider).toBeInTheDocument();

    console.log('✅ User journey: Complete user experience validated successfully');
  });

  test('Error recovery and user guidance', async () => {
    const user = userEvent.setup();
    
    render(<MeanCalculatorPage />);

    await waitFor(() => {
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
    });

    // User makes a mistake
    const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
    await user.type(dataInput, 'not numbers at all');

    // System should provide guidance (not crash)
    expect(screen.getByText('Mean Calculator')).toBeInTheDocument();

    // User corrects their input
    await user.clear(dataInput);
    await user.type(dataInput, '10, 20, 30');

    // System should recover gracefully
    await waitFor(() => {
      expect(screen.getByText('3 values')).toBeInTheDocument();
    });

    console.log('✅ Error recovery: System gracefully handles user mistakes');
  });
});