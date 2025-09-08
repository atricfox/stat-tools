/**
 * Component performance tests
 * Tests React component rendering performance and optimization effectiveness
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { performance } from 'perf_hooks';

// Import components to test
import MeanCalculatorPage from '@/app/calculator/mean/page';
import DataInput from '@/components/calculator/DataInput';
import MobileResultsDisplay from '@/components/calculator/MobileResultsDisplay';
import LazyComponentWrapper from '@/components/common/LazyComponentWrapper';

// Mock heavy dependencies for consistent performance testing
jest.mock('@/lib/calculation-cache-integration', () => ({
  calculateMeanCached: jest.fn().mockImplementation(async (data) => {
    // Simulate calculation time
    await new Promise(resolve => setTimeout(resolve, 10));
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    return {
      mean,
      count: data.length,
      sum: data.reduce((a, b) => a + b, 0),
      standardDeviation: 5,
      variance: 25,
      min: Math.min(...data),
      max: Math.max(...data),
      range: Math.max(...data) - Math.min(...data),
      cacheInfo: {
        cacheHit: Math.random() > 0.5,
        computationTime: 10,
        cacheKey: 'test-key',
        dataSignature: 'test-signature'
      }
    };
  }),
  calculateHighPrecisionCached: jest.fn().mockImplementation(async (data) => {
    await new Promise(resolve => setTimeout(resolve, 25));
    return {
      mean: data.reduce((a, b) => a + b, 0) / data.length,
      precision: 8,
      cacheInfo: { cacheHit: false, computationTime: 25 }
    };
  })
}));

jest.mock('@/lib/dynamic-imports', () => ({
  lazyPages: {
    highPrecisionResults: { Component: () => <div>Mock Research Results</div> },
    teacherFileUpload: { Component: () => <div>Mock File Upload</div> },
    batchProcessing: { Component: () => <div>Mock Batch Processing</div> }
  },
  contextualLoader: { setContext: jest.fn() }
}));

describe('Component Performance Tests', () => {
  
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1024, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: 768, configurable: true });
    
    // Clear any previous performance marks
    if (performance.clearMarks) {
      performance.clearMarks();
    }
  });

  describe('Calculator Page Performance', () => {
    test('initial page render performance', async () => {
      const renderStart = performance.now();
      
      render(<MeanCalculatorPage />);
      
      // Wait for initial render to complete
      await waitFor(() => {
        expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      });
      
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      console.log(`Calculator page initial render: ${renderTime.toFixed(2)}ms`);
      
      // Initial render should be fast
      expect(renderTime).toBeLessThan(200);
    });

    test('context switching performance', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      await waitFor(() => {
        expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      });

      const contextSwitches = ['research', 'teacher', 'student'];
      const switchTimes = [];

      for (const context of contextSwitches) {
        const switchStart = performance.now();
        
        const contextButton = screen.getByRole('button', { name: new RegExp(context, 'i') });
        await user.click(contextButton);
        
        // Wait for context switch to complete
        await waitFor(() => {
          expect(screen.getByText(context, { selector: 'span' })).toBeInTheDocument();
        });
        
        const switchEnd = performance.now();
        const switchTime = switchEnd - switchStart;
        switchTimes.push(switchTime);
      }

      console.log('Context switch times:', switchTimes.map(t => `${t.toFixed(2)}ms`).join(', '));
      
      // Context switches should be fast
      switchTimes.forEach(time => {
        expect(time).toBeLessThan(100);
      });

      const averageSwitchTime = switchTimes.reduce((a, b) => a + b) / switchTimes.length;
      expect(averageSwitchTime).toBeLessThan(50);
    });

    test('large data input performance', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      await waitFor(() => {
        expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      });

      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => i + 1).join(', ');
      
      const inputStart = performance.now();
      
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.click(dataInput);
      await user.paste(largeDataset);
      
      // Wait for processing to complete
      await waitFor(() => {
        expect(screen.getByText('1000 values')).toBeInTheDocument();
      }, { timeout: 5000 });
      
      const inputEnd = performance.now();
      const inputTime = inputEnd - inputStart;
      
      console.log(`Large data input processing: ${inputTime.toFixed(2)}ms`);
      
      // Large input should still be responsive
      expect(inputTime).toBeLessThan(2000);
    });

    test('mobile responsiveness performance', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true });
      
      const mobileRenderStart = performance.now();
      
      render(<MeanCalculatorPage />);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument(); // Mobile dropdown
      });
      
      const mobileRenderEnd = performance.now();
      const mobileRenderTime = mobileRenderEnd - mobileRenderStart;
      
      console.log(`Mobile layout render: ${mobileRenderTime.toFixed(2)}ms`);
      
      // Mobile rendering should not add significant overhead
      expect(mobileRenderTime).toBeLessThan(300);
    });
  });

  describe('Data Input Component Performance', () => {
    test('real-time parsing performance', async () => {
      const user = userEvent.setup();
      const onValidation = jest.fn();
      const onChange = jest.fn();

      render(
        <DataInput
          value=""
          onChange={onChange}
          onValidation={onValidation}
          context="student"
        />
      );

      const input = screen.getByRole('textbox');
      const testInputs = [
        '1, 2, 3',
        '1, 2, 3, 4, 5, 6, 7, 8, 9, 10',
        '85, 92, 78, 96, 88, 91, 83, 89, 87, 94, 75, 82, 90, 88, 79',
        Array.from({ length: 100 }, (_, i) => i + 1).join(', ')
      ];

      const parsingTimes = [];

      for (const testInput of testInputs) {
        onChange.mockClear();
        onValidation.mockClear();
        
        const parseStart = performance.now();
        
        await user.clear(input);
        await user.type(input, testInput);
        
        // Wait for debounced parsing
        await waitFor(() => {
          expect(onValidation).toHaveBeenCalled();
        }, { timeout: 1000 });
        
        const parseEnd = performance.now();
        const parseTime = parseEnd - parseStart;
        
        parsingTimes.push({
          inputLength: testInput.length,
          parseTime,
          itemCount: testInput.split(',').length
        });
      }

      console.log('Data input parsing performance:');
      parsingTimes.forEach(({ inputLength, parseTime, itemCount }) => {
        console.log(`  ${itemCount} items (${inputLength} chars): ${parseTime.toFixed(2)}ms`);
      });

      // Parsing should scale reasonably with input size
      parsingTimes.forEach(({ parseTime, itemCount }) => {
        expect(parseTime).toBeLessThan(itemCount * 2); // Less than 2ms per item
      });
    });

    test('context switching impact on input performance', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      const contexts: Array<'student' | 'research' | 'teacher'> = ['student', 'research', 'teacher'];
      const contextPerformance = [];

      for (const context of contexts) {
        const { rerender } = render(
          <DataInput
            value=""
            onChange={onChange}
            context={context}
          />
        );

        const contextStart = performance.now();
        
        // Simulate input with context-specific format
        const contextInput = context === 'research' 
          ? '1.23e-4, 5.67e+2, 890.12' 
          : context === 'teacher' 
            ? 'Student1\t85\t90\nStudent2\t92\t87' 
            : '85, 92, 78, 96';

        const input = screen.getByRole('textbox');
        await user.type(input, contextInput);
        
        const contextEnd = performance.now();
        const contextTime = contextEnd - contextStart;
        
        contextPerformance.push({ context, contextTime });
      }

      console.log('Context-specific input performance:');
      contextPerformance.forEach(({ context, contextTime }) => {
        console.log(`  ${context}: ${contextTime.toFixed(2)}ms`);
      });

      // All contexts should perform similarly
      const maxTime = Math.max(...contextPerformance.map(cp => cp.contextTime));
      const minTime = Math.min(...contextPerformance.map(cp => cp.contextTime));
      const variance = maxTime / minTime;
      
      expect(variance).toBeLessThan(3); // No context should be 3x slower than others
    });
  });

  describe('Results Display Performance', () => {
    test('results rendering performance with different data sizes', async () => {
      const dataSizes = [10, 100, 1000];
      const renderTimes = [];

      for (const size of dataSizes) {
        const testData = Array.from({ length: size }, (_, i) => i + Math.random());
        const mockResults = {
          mean: testData.reduce((a, b) => a + b) / testData.length,
          count: size,
          sum: testData.reduce((a, b) => a + b),
          standardDeviation: 5,
          variance: 25,
          min: Math.min(...testData),
          max: Math.max(...testData),
          range: Math.max(...testData) - Math.min(...testData)
        };

        const renderStart = performance.now();
        
        render(
          <MobileResultsDisplay
            results={mockResults}
            precision={2}
            userContext="student"
            isMobile={false}
          />
        );
        
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        
        renderTimes.push({ size, renderTime });
      }

      console.log('Results display rendering performance:');
      renderTimes.forEach(({ size, renderTime }) => {
        console.log(`  ${size} data points: ${renderTime.toFixed(2)}ms`);
      });

      // Results rendering should not significantly degrade with data size
      renderTimes.forEach(({ renderTime }) => {
        expect(renderTime).toBeLessThan(50);
      });
    });

    test('precision changes performance impact', async () => {
      const mockResults = {
        mean: 87.753,
        count: 8,
        sum: 702.024,
        standardDeviation: 5.234,
        variance: 27.395,
        min: 78,
        max: 96,
        range: 18
      };

      const precisions = [0, 2, 4, 6, 8];
      const precisionTimes = [];

      for (const precision of precisions) {
        const precisionStart = performance.now();
        
        const { rerender } = render(
          <MobileResultsDisplay
            results={mockResults}
            precision={precision}
            userContext="student"
            isMobile={false}
          />
        );

        // Force re-render with new precision
        rerender(
          <MobileResultsDisplay
            results={mockResults}
            precision={precision}
            userContext="student"
            isMobile={false}
          />
        );
        
        const precisionEnd = performance.now();
        const precisionTime = precisionEnd - precisionStart;
        
        precisionTimes.push({ precision, precisionTime });
      }

      console.log('Precision change performance:');
      precisionTimes.forEach(({ precision, precisionTime }) => {
        console.log(`  ${precision} decimals: ${precisionTime.toFixed(2)}ms`);
      });

      // Precision changes should be fast
      precisionTimes.forEach(({ precisionTime }) => {
        expect(precisionTime).toBeLessThan(20);
      });
    });
  });

  describe('Lazy Loading Performance', () => {
    test('lazy component loading time', async () => {
      const MockLazyComponent = React.lazy(async () => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 100));
        return { 
          default: () => <div>Lazy Loaded Component</div> 
        };
      });

      const loadStart = performance.now();
      
      render(
        <LazyComponentWrapper name="Test Component">
          <MockLazyComponent />
        </LazyComponentWrapper>
      );

      // Wait for lazy component to load
      await waitFor(() => {
        expect(screen.getByText('Lazy Loaded Component')).toBeInTheDocument();
      });

      const loadEnd = performance.now();
      const loadTime = loadEnd - loadStart;
      
      console.log(`Lazy component loading: ${loadTime.toFixed(2)}ms`);
      
      // Should show loading state quickly and load within reasonable time
      expect(loadTime).toBeLessThan(200);
    });

    test('loading state performance', async () => {
      const { rerender } = render(
        <LazyComponentWrapper name="Test Component">
          <div>Initial Content</div>
        </LazyComponentWrapper>
      );

      const loadingStateStart = performance.now();
      
      // Simulate component switching to loading state
      const LoadingComponent = React.lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, 50));
        return { default: () => <div>New Content</div> };
      });

      rerender(
        <LazyComponentWrapper name="Test Component">
          <LoadingComponent />
        </LazyComponentWrapper>
      );

      // Wait for loading indicator
      await waitFor(() => {
        expect(screen.getByText(/Loading/)).toBeInTheDocument();
      });

      const loadingStateEnd = performance.now();
      const loadingStateTime = loadingStateEnd - loadingStateStart;
      
      console.log(`Loading state display: ${loadingStateTime.toFixed(2)}ms`);
      
      // Loading state should appear immediately
      expect(loadingStateTime).toBeLessThan(10);
    });
  });

  describe('Memory Usage During Component Operations', () => {
    test('component re-render memory stability', async () => {
      const user = userEvent.setup();
      
      render(<MeanCalculatorPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      });

      const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      const memoryMeasurements = [];

      // Perform multiple operations that trigger re-renders
      const operations = [
        () => user.click(screen.getByRole('button', { name: /research/i })),
        () => user.click(screen.getByRole('button', { name: /teacher/i })),
        () => user.click(screen.getByRole('button', { name: /student/i })),
      ];

      for (let i = 0; i < 10; i++) {
        const operation = operations[i % operations.length];
        await operation();
        
        // Wait for re-render
        await new Promise(resolve => setTimeout(resolve, 50));
        
        if (performance.memory) {
          const currentMemory = performance.memory.usedJSHeapSize;
          memoryMeasurements.push({
            iteration: i,
            memory: currentMemory,
            delta: currentMemory - initialMemory
          });
        }
      }

      if (memoryMeasurements.length > 0) {
        console.log('Memory usage during re-renders:');
        memoryMeasurements.forEach(({ iteration, memory, delta }) => {
          console.log(`  Iteration ${iteration}: ${(memory/1024/1024).toFixed(1)}MB (${(delta/1024).toFixed(1)}KB delta)`);
        });

        // Memory should not grow excessively
        const finalDelta = memoryMeasurements[memoryMeasurements.length - 1].delta;
        expect(finalDelta).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth
      }
    });
  });
});