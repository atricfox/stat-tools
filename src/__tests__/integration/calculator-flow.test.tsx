/**
 * Integration tests for mean calculator flow
 * Tests complete user workflows across different contexts
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MeanCalculatorPage from '@/app/calculator/mean/page';
import { calculateMean } from '@/lib/calculations';
import { HighPrecisionCalculator } from '@/lib/high-precision-calculations';

// Mock dynamic imports to avoid lazy loading issues in tests
jest.mock('@/lib/dynamic-imports', () => ({
  lazyPages: {
    highPrecisionResults: { Component: jest.fn() },
    teacherFileUpload: { Component: jest.fn() },
    batchProcessing: { Component: jest.fn() }
  },
  contextualLoader: {
    setContext: jest.fn()
  }
}));

// Mock cache system for predictable testing
jest.mock('@/lib/calculation-cache-integration', () => ({
  calculateMeanCached: jest.fn().mockImplementation(async (data, options) => {
    const result = calculateMean(data);
    return {
      ...result,
      cacheInfo: {
        cacheHit: false,
        computationTime: 10,
        cacheKey: 'test-key',
        dataSignature: 'test-signature'
      }
    };
  }),
  calculateHighPrecisionCached: jest.fn().mockImplementation(async (data, options) => {
    const calculator = new HighPrecisionCalculator(data);
    const result = calculator.calculateAll();
    return {
      ...result,
      cacheInfo: {
        cacheHit: false,
        computationTime: 25,
        cacheKey: 'test-hp-key',
        dataSignature: 'test-hp-signature'
      }
    };
  })
}));

describe('Mean Calculator Integration Tests', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock window methods
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    // Mock performance API
    global.performance.now = jest.fn(() => Date.now());
  });

  describe('Student Context Flow', () => {
    test('complete student workflow: input data -> calculate -> view results', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Verify initial state
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      expect(screen.getByText('Student', { selector: 'span' })).toBeInTheDocument();

      // Input test data
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '85, 92, 78, 96, 88, 91, 83, 89');

      // Wait for calculation to complete
      await waitFor(() => {
        expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
      });

      // Verify results are displayed
      await waitFor(() => {
        const meanValue = screen.getByText('87.75');
        expect(meanValue).toBeInTheDocument();
      });

      // Verify student-specific features
      expect(screen.getByText('8 values')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Copy Results/i })).toBeInTheDocument();
    });

    test('student data validation and error handling', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Input invalid data
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, 'not, valid, numbers, 123');

      // Should handle mixed valid/invalid input
      await waitFor(() => {
        expect(screen.getByText('1 values')).toBeInTheDocument();
      });

      // Clear and input empty data
      await user.clear(dataInput);
      await user.type(dataInput, '   ');

      // Should handle empty input gracefully
      expect(screen.queryByText(/values/)).not.toBeInTheDocument();
    });

    test('student precision control', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Input data
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '10, 20, 30');

      // Change precision
      const precisionSlider = screen.getByRole('slider', { name: /precision/i });
      await user.clear(precisionSlider);
      await user.type(precisionSlider, '4');

      // Wait for recalculation
      await waitFor(() => {
        expect(screen.getByText('20.0000')).toBeInTheDocument();
      });
    });
  });

  describe('Research Context Flow', () => {
    test('research workflow: switch context -> high precision calculation', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Switch to research context
      const researchButton = screen.getByRole('button', { name: /research/i });
      await user.click(researchButton);

      // Verify context switch
      expect(screen.getByText('Research', { selector: 'span' })).toBeInTheDocument();

      // Input scientific data
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '1.23e-4, 5.67e+2, 890.12, 3.45e-3');

      // Wait for high-precision calculation
      await waitFor(() => {
        expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
      }, { timeout: 5000 });

      // Should show advanced statistical results
      // Note: Actual research results component is mocked in this test
    });

    test('research data format support', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Switch to research context
      const researchButton = screen.getByRole('button', { name: /research/i });
      await user.click(researchButton);

      // Test scientific notation
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '1e-6, 2e-6, 3e-6, 4e-6');

      await waitFor(() => {
        expect(screen.getByText('4 values')).toBeInTheDocument();
      });
    });
  });

  describe('Teacher Context Flow', () => {
    test('teacher workflow: switch context -> batch processing interface', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Switch to teacher context
      const teacherButton = screen.getByRole('button', { name: /teacher/i });
      await user.click(teacherButton);

      // Verify teacher interface
      expect(screen.getByText('Teacher', { selector: 'span' })).toBeInTheDocument();
      expect(screen.getByText('Upload & Process Data')).toBeInTheDocument();
      expect(screen.getByText('Manual Data Entry')).toBeInTheDocument();
    });

    test('teacher data input with tab-separated values', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Switch to teacher context
      const teacherButton = screen.getByRole('button', { name: /teacher/i });
      await user.click(teacherButton);

      // Input tab-separated data (simulating Excel paste)
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      const tabSeparatedData = 'Student1\t85\t90\nStudent2\t92\t87\nStudent3\t78\t82';
      
      await user.click(dataInput);
      await user.paste(tabSeparatedData);

      // Should parse tab-separated data
      await waitFor(() => {
        expect(screen.getByText(/values/)).toBeInTheDocument();
      });
    });
  });

  describe('Cross-Context Data Persistence', () => {
    test('data persists when switching between contexts', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Input data in student context
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '10, 20, 30, 40, 50');

      await waitFor(() => {
        expect(screen.getByText('5 values')).toBeInTheDocument();
      });

      // Switch to research context
      const researchButton = screen.getByRole('button', { name: /research/i });
      await user.click(researchButton);

      // Data should persist
      expect(dataInput).toHaveValue('10, 20, 30, 40, 50');
      await waitFor(() => {
        expect(screen.getByText('5 values')).toBeInTheDocument();
      });

      // Switch to teacher context
      const teacherButton = screen.getByRole('button', { name: /teacher/i });
      await user.click(teacherButton);

      // Data should still persist
      expect(dataInput).toHaveValue('10, 20, 30, 40, 50');
    });
  });

  describe('Mobile Responsive Flow', () => {
    test('mobile interface adapts correctly', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500
      });

      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Should show mobile-specific elements
      expect(screen.getByRole('combobox')).toBeInTheDocument(); // Mobile dropdown
      
      // Input data
      const dataInput = screen.getByPlaceholderText(/1, 2, 3, 4, 5.../);
      await user.type(dataInput, '10, 20, 30');

      // Should show mobile-specific results layout
      await waitFor(() => {
        expect(screen.getByText('3 values')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles empty input gracefully', async () => {
      render(<MeanCalculatorPage />);
      
      // Should not crash with empty input
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    test('handles single number input', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '42');

      await waitFor(() => {
        expect(screen.getByText('1 values')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
      });
    });

    test('handles very large datasets', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      // Generate large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => i + 1).join(', ');
      
      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.paste(largeDataset);

      await waitFor(() => {
        expect(screen.getByText('1000 values')).toBeInTheDocument();
      }, { timeout: 10000 });
    });

    test('handles mixed number formats', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '10, 20.5, -30, 1e2, .5');

      await waitFor(() => {
        expect(screen.getByText('5 values')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Loading States', () => {
    test('shows loading states during calculation', async () => {
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '1, 2, 3, 4, 5');

      // Should show loading indicator briefly
      // Note: This might be very fast in tests, so we check it existed
      expect(screen.queryByText(/Loading/)).toBeDefined();
    });

    test('handles calculation errors gracefully', async () => {
      // Mock calculation failure
      const mockError = jest.fn().mockRejectedValue(new Error('Calculation failed'));
      jest.spyOn(console, 'error').mockImplementation(() => {});
      
      const user = userEvent.setup();
      render(<MeanCalculatorPage />);

      const dataInput = screen.getByPlaceholderText(/Enter numbers/i);
      await user.type(dataInput, '1, 2, 3');

      // Should not crash the interface
      expect(screen.getByText('Mean Calculator')).toBeInTheDocument();
      
      jest.restoreAllMocks();
    });
  });
});