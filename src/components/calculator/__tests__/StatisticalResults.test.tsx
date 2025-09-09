/**
 * Unit tests for StatisticalResults component
 * Tests rendering for both Mean and Weighted Mean results
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StatisticalResults from '../StatisticalResults';
import { MeanResult } from '@/hooks/useMeanCalculation';
import { WeightedMeanResult } from '@/types/weightedMean';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('StatisticalResults', () => {
  const mockOnCopy = jest.fn();
  const mockOnDownload = jest.fn();

  beforeEach(() => {
    mockWriteText.mockClear();
    mockOnCopy.mockClear();
    mockOnDownload.mockClear();
  });

  describe('MeanResult rendering', () => {
    const meanResult: MeanResult = {
      mean: 85.5,
      sum: 342,
      count: 4,
      steps: ['Step 1', 'Step 2'],
      invalidEntries: [],
      timestamp: '2025-01-01T00:00:00Z'
    };

    it('renders mean result correctly', () => {
      render(
        <StatisticalResults
          result={meanResult}
          userMode="student"
          precision={2}
          onCopy={mockOnCopy}
          onDownload={mockOnDownload}
        />
      );

      expect(screen.getByText('Statistical Results')).toBeInTheDocument();
      expect(screen.getByText('Mean (Average)')).toBeInTheDocument();
      expect(screen.getByText('85.50')).toBeInTheDocument();
      expect(screen.getByText('Sample Size')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Sum Total')).toBeInTheDocument();
      expect(screen.getByText('342.00')).toBeInTheDocument();
    });

    it('handles copy functionality for mean result', () => {
      render(
        <StatisticalResults
          result={meanResult}
          userMode="student"
          precision={2}
          onCopy={mockOnCopy}
        />
      );

      const copyButton = screen.getByTitle('Copy results');
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledWith('Mean: 85.50\nCount: 4\nSum: 342.00');
    });
  });

  describe('WeightedMeanResult rendering', () => {
    const weightedResult: WeightedMeanResult = {
      weightedMean: 87.5,
      totalWeights: 12,
      totalWeightedValue: 1050,
      validPairs: 4,
      excludedPairs: 1,
      pairs: [
        { value: 90, weight: 3, id: 'math', contribution: 25.7, normalizedWeight: 0.25, points: 270 },
        { value: 85, weight: 4, id: 'english', contribution: 32.4, normalizedWeight: 0.33, points: 340 },
        { value: 92, weight: 3, id: 'science', contribution: 26.3, normalizedWeight: 0.25, points: 276 },
        { value: 88, weight: 2, id: 'history', contribution: 15.6, normalizedWeight: 0.17, points: 176 }
      ],
      steps: ['Step 1: Validation', 'Step 2: Calculation'],
      weightDistribution: {
        min: 2,
        max: 4,
        mean: 3,
        std: 0.8
      },
      metadata: {
        inputMode: 'pairs' as const,
        strategy: {
          zeroWeightStrategy: 'ignore' as const,
          missingWeightStrategy: 'zero' as const,
          normalizeWeights: false,
          precision: 2
        },
        timestamp: '2025-01-01T00:00:00Z',
        hasZeroWeights: false,
        hasMissingWeights: false
      }
    };

    it('renders weighted mean result correctly', () => {
      render(
        <StatisticalResults
          result={weightedResult}
          userMode="student"
          precision={2}
          onCopy={mockOnCopy}
          onDownload={mockOnDownload}
        />
      );

      expect(screen.getByText('Statistical Results')).toBeInTheDocument();
      expect(screen.getByText('Weighted Mean')).toBeInTheDocument();
      expect(screen.getByText('87.50')).toBeInTheDocument();
      expect(screen.getByText('Valid Pairs')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('Total Weight')).toBeInTheDocument();
      expect(screen.getByText('12.00')).toBeInTheDocument();
    });

    it('handles copy functionality for weighted result', () => {
      render(
        <StatisticalResults
          result={weightedResult}
          userMode="student"
          precision={2}
          onCopy={mockOnCopy}
        />
      );

      const copyButton = screen.getByTitle('Copy results');
      fireEvent.click(copyButton);

      expect(mockOnCopy).toHaveBeenCalledWith('Weighted Mean: 87.50\nValid Pairs: 4\nTotal Weight: 12.00');
    });

    it('handles download functionality', () => {
      render(
        <StatisticalResults
          result={weightedResult}
          userMode="student"
          precision={2}
          onDownload={mockOnDownload}
        />
      );

      // Click CSV download directly (simplified test)
      const csvButton = screen.getByText('CSV');
      fireEvent.click(csvButton);

      expect(mockOnDownload).toHaveBeenCalledWith(weightedResult, 'csv');
    });
  });

  describe('User mode specific content', () => {
    const weightedResult: WeightedMeanResult = {
      weightedMean: 87.5,
      totalWeights: 12,
      totalWeightedValue: 1050,
      validPairs: 4,
      excludedPairs: 0,
      pairs: [],
      steps: [],
      weightDistribution: { min: 1, max: 5, mean: 3, std: 1 },
      metadata: {
        inputMode: 'pairs' as const,
        strategy: {
          zeroWeightStrategy: 'ignore' as const,
          missingWeightStrategy: 'zero' as const,
          normalizeWeights: false,
          precision: 2
        },
        timestamp: '2025-01-01T00:00:00Z',
        hasZeroWeights: false,
        hasMissingWeights: false
      }
    };

    it('shows student-specific insights for weighted mean', () => {
      render(
        <StatisticalResults
          result={weightedResult}
          userMode="student"
          precision={2}
        />
      );

      expect(screen.getByText('Student Insight')).toBeInTheDocument();
      expect(screen.getByText(/weighted mean considers the importance/i)).toBeInTheDocument();
    });

    it('shows research-specific insights for weighted mean', () => {
      render(
        <StatisticalResults
          result={weightedResult}
          userMode="research"
          precision={2}
        />
      );

      expect(screen.getByText('Research Interpretation')).toBeInTheDocument();
      expect(screen.getByText(/relative importance of each observation/i)).toBeInTheDocument();
    });

    it('shows teacher-specific insights for weighted mean', () => {
      render(
        <StatisticalResults
          result={weightedResult}
          userMode="teacher"
          precision={2}
        />
      );

      expect(screen.getByText('Class Summary')).toBeInTheDocument();
      expect(screen.getByText(/weighted calculation considers/i)).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('returns null for no result', () => {
      const { container } = render(
        <StatisticalResults
          result={null}
          userMode="student"
          precision={2}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('handles undefined values gracefully', () => {
      const incompleteResult = {
        weightedMean: undefined,
        totalWeights: 12,
        validPairs: 4
      } as unknown as WeightedMeanResult;

      render(
        <StatisticalResults
          result={incompleteResult}
          userMode="student"
          precision={2}
        />
      );

      expect(screen.getByText('0')).toBeInTheDocument(); // Should show 0 for undefined values
    });
  });
});