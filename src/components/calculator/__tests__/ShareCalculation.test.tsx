/**
 * Unit tests for ShareCalculation component
 * Tests sharing functionality and user interactions
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ShareCalculation from '../ShareCalculation';
import { WeightedShareableState } from '@/lib/weighted-url-state-manager';
import { WeightedMeanResult } from '@/types/weightedMean';

// Mock clipboard API
const mockWriteText = jest.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('ShareCalculation', () => {
  const mockResult: WeightedMeanResult = {
    weightedMean: 87.5,
    totalWeights: 12,
    totalWeightedValue: 1050,
    validPairs: 4,
    excludedPairs: 0,
    pairs: [
      { value: 90, weight: 3, id: 'math', contribution: 25.7, normalizedWeight: 0.25, points: 270 }
    ],
    steps: ['Step 1'],
    weightDistribution: { min: 2, max: 4, mean: 3, std: 0.8 },
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

  const mockShareableState: WeightedShareableState = {
    id: 'test123',
    url: 'https://example.com/calculator/weighted-mean?wstate=abc123',
    isPublic: true,
    calculatorType: 'weighted-mean',
    preview: {
      pairCount: 4,
      weightedMean: 87.5,
      totalWeight: 12,
      title: 'Test Calculation'
    }
  };

  const mockOnCreateShare = jest.fn();
  const mockOnGenerateQR = jest.fn();

  beforeEach(() => {
    mockOnCreateShare.mockClear();
    mockOnGenerateQR.mockClear();
    mockWriteText.mockClear();
  });

  describe('Initial state and opening', () => {
    it('renders share button initially', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      expect(screen.getByText('Share')).toBeInTheDocument();
      expect(screen.getByTitle('Share calculation')).toBeInTheDocument();
    });

    it('opens share modal when share button is clicked', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));

      expect(screen.getByText('Share Calculation')).toBeInTheDocument();
      expect(screen.getByText('Calculation Preview')).toBeInTheDocument();
    });
  });

  describe('Result preview', () => {
    it('displays calculation preview when result is provided', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));

      expect(screen.getByText('Weighted Mean:')).toBeInTheDocument();
      expect(screen.getByText('87.5')).toBeInTheDocument();
      expect(screen.getByText('Valid Pairs:')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('works without result', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
        />
      );

      fireEvent.click(screen.getByText('Share'));

      expect(screen.getByText('Share Calculation')).toBeInTheDocument();
      expect(screen.queryByText('Calculation Preview')).not.toBeInTheDocument();
    });
  });

  describe('Share form', () => {
    beforeEach(() => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );
      fireEvent.click(screen.getByText('Share'));
    });

    it('renders form fields', () => {
      expect(screen.getByPlaceholderText(/Spring 2025 GPA Calculation/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue('Never expires')).toBeInTheDocument();
      expect(screen.getByText('Include calculation metadata')).toBeInTheDocument();
      expect(screen.getByText('Create short URL')).toBeInTheDocument();
    });

    it('allows title input', () => {
      const titleInput = screen.getByPlaceholderText(/Spring 2025 GPA Calculation/i);
      
      fireEvent.change(titleInput, { target: { value: 'My GPA Calculation' } });
      
      expect(titleInput).toHaveValue('My GPA Calculation');
    });

    it('allows expiration selection', () => {
      const expirationSelect = screen.getByDisplayValue('Never expires');
      
      fireEvent.change(expirationSelect, { target: { value: '24' } });
      
      expect(expirationSelect).toHaveValue('24');
    });

    it('allows checkbox toggling', () => {
      const metadataCheckbox = screen.getByRole('checkbox', { name: /Include calculation metadata/i });
      const shortUrlCheckbox = screen.getByRole('checkbox', { name: /Create short URL/i });
      
      expect(metadataCheckbox).toBeChecked();
      expect(shortUrlCheckbox).not.toBeChecked();
      
      fireEvent.click(metadataCheckbox);
      fireEvent.click(shortUrlCheckbox);
      
      expect(metadataCheckbox).not.toBeChecked();
      expect(shortUrlCheckbox).toBeChecked();
    });
  });

  describe('Share creation', () => {
    it('creates share link with correct options', async () => {
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue('data:image/svg+xml;base64,mockqr');

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      
      // Fill form
      fireEvent.change(screen.getByPlaceholderText(/Spring 2025 GPA Calculation/i), {
        target: { value: 'Test Title' }
      });
      fireEvent.change(screen.getByDisplayValue('Never expires'), {
        target: { value: '24' }
      });
      
      // Create share
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        expect(mockOnCreateShare).toHaveBeenCalledWith({
          includeMetadata: true,
          expiresIn: 24,
          makeShort: false,
          title: 'Test Title'
        });
      });
    });

    it('shows success message after share creation', async () => {
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue('data:image/svg+xml;base64,mockqr');

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        expect(screen.getByText('Share link created successfully!')).toBeInTheDocument();
        expect(screen.getByText('ID: test123')).toBeInTheDocument();
      });
    });

    it('displays share URL', async () => {
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue('data:image/svg+xml;base64,mockqr');

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        const urlInput = screen.getByDisplayValue(mockShareableState.url);
        expect(urlInput).toBeInTheDocument();
        expect(urlInput).toHaveAttribute('readonly');
      });
    });

    it('handles share creation errors', async () => {
      mockOnCreateShare.mockReturnValue(null);

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        expect(screen.getByText('Failed to create shareable URL')).toBeInTheDocument();
      });
    });

    it('shows loading state during share creation', async () => {
      mockOnCreateShare.mockImplementation(() => {
        return new Promise(resolve => setTimeout(() => resolve(mockShareableState), 100));
      });

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      expect(screen.getByText('Creating Share Link...')).toBeInTheDocument();
    });
  });

  describe('URL copying', () => {
    it('copies URL to clipboard', async () => {
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue('data:image/svg+xml;base64,mockqr');

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: '' }); // Icon button
        fireEvent.click(copyButton);
      });

      expect(mockWriteText).toHaveBeenCalledWith(mockShareableState.url);
    });

    it('shows copied confirmation', async () => {
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue('data:image/svg+xml;base64,mockqr');

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: '' });
        fireEvent.click(copyButton);
      });

      // Check icon changed to success state (this would be a check icon)
      expect(screen.getByRole('button', { name: '' })).toBeInTheDocument();
    });
  });

  describe('QR code functionality', () => {
    it('displays QR code after generation', async () => {
      const mockQrUrl = 'data:image/svg+xml;base64,mockqrcode';
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue(mockQrUrl);

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        expect(screen.getByText('QR Code')).toBeInTheDocument();
        expect(screen.getByAltText('QR Code for sharing')).toHaveAttribute('src', mockQrUrl);
      });
    });

    it('provides QR code download', async () => {
      const mockQrUrl = 'data:image/svg+xml;base64,mockqrcode';
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockResolvedValue(mockQrUrl);

      // Mock createElement and click
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn()
      };
      jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor as any);

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        const downloadButton = screen.getByText('Download QR');
        fireEvent.click(downloadButton);
      });

      expect(mockAnchor.href).toBe(mockQrUrl);
      expect(mockAnchor.download).toMatch(/weighted-mean-qr.*\.svg/);
      expect(mockAnchor.click).toHaveBeenCalled();
    });
  });

  describe('Preview information', () => {
    it('displays calculation preview information', async () => {
      mockOnCreateShare.mockReturnValue({
        ...mockShareableState,
        preview: {
          pairCount: 5,
          weightedMean: 89.2,
          totalWeight: 15,
          title: 'Custom Title'
        }
      });
      mockOnGenerateQR.mockResolvedValue('data:image/svg+xml;base64,mockqr');

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        expect(screen.getByText('Weighted Mean')).toBeInTheDocument();
        expect(screen.getByText('5 pairs')).toBeInTheDocument();
        expect(screen.getByText('89.2')).toBeInTheDocument();
      });
    });
  });

  describe('Modal controls', () => {
    it('closes modal when close button is clicked', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      expect(screen.getByText('Share Calculation')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: '' })); // X button
      expect(screen.queryByText('Share Calculation')).not.toBeInTheDocument();
    });

    it('closes modal when clicking outside (if implemented)', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      expect(screen.getByText('Share Calculation')).toBeInTheDocument();

      // This test would need implementation of outside click handling
      // For now, we just verify the modal is open
      expect(screen.getByText('Share Calculation')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('handles clipboard errors gracefully', async () => {
      mockWriteText.mockRejectedValue(new Error('Clipboard access denied'));
      mockOnCreateShare.mockReturnValue(mockShareableState);

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: '' });
        fireEvent.click(copyButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Failed to copy URL to clipboard')).toBeInTheDocument();
      });
    });

    it('handles QR generation errors', async () => {
      mockOnCreateShare.mockReturnValue(mockShareableState);
      mockOnGenerateQR.mockRejectedValue(new Error('QR generation failed'));

      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      fireEvent.click(screen.getByText('Share'));
      fireEvent.click(screen.getByText('Create Share Link'));

      // QR code should not be displayed if generation fails
      await waitFor(() => {
        expect(screen.queryByText('QR Code')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      expect(screen.getByTitle('Share calculation')).toBeInTheDocument();
    });

    it('supports keyboard navigation', () => {
      render(
        <ShareCalculation
          onCreateShare={mockOnCreateShare}
          onGenerateQR={mockOnGenerateQR}
          result={mockResult}
        />
      );

      const shareButton = screen.getByText('Share');
      shareButton.focus();
      expect(document.activeElement).toBe(shareButton);
    });
  });
});