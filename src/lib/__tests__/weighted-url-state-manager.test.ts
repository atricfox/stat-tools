/**
 * Unit tests for WeightedURLStateManager
 * Tests URL state encoding, decoding, and sharing functionality
 */

import { WeightedURLStateManager, WeightedCalculatorState } from '../weighted-url-state-manager';
import { WeightedMeanResult } from '@/types/weightedMean';

describe('WeightedURLStateManager', () => {
  const mockState: WeightedCalculatorState = {
    pairs: [
      { value: 90, weight: 3, id: 'math' },
      { value: 85, weight: 4, id: 'english' },
      { value: 92, weight: 2, id: 'science' }
    ],
    precision: 2,
    userMode: 'student',
    inputMode: 'pairs',
    strategy: {
      zeroWeightStrategy: 'ignore',
      missingWeightStrategy: 'zero',
      normalizeWeights: false,
      precision: 2
    },
    showSteps: true,
    showHelp: false,
    timestamp: 1640995200000, // Fixed timestamp for consistent tests
    version: '2.0',
    metadata: {
      title: 'Spring 2025 GPA',
      description: 'Semester GPA calculation',
      tags: ['gpa', 'spring-2025'],
      author: 'Student',
      course: 'Computer Science'
    }
  };

  const mockResult: WeightedMeanResult = {
    weightedMean: 87.44,
    totalWeights: 9,
    totalWeightedValue: 787,
    validPairs: 3,
    excludedPairs: 0,
    pairs: [
      { value: 90, weight: 3, id: 'math', contribution: 34.3, normalizedWeight: 0.33, points: 270 },
      { value: 85, weight: 4, id: 'english', contribution: 43.2, normalizedWeight: 0.44, points: 340 },
      { value: 92, weight: 2, id: 'science', contribution: 22.5, normalizedWeight: 0.22, points: 184 }
    ],
    steps: ['Step 1', 'Step 2'],
    weightDistribution: { min: 2, max: 4, mean: 3, std: 1 },
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

  describe('State encoding and decoding', () => {
    it('should encode state to URL-safe string', () => {
      const encoded = WeightedURLStateManager.encodeState(mockState);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      expect(/^[A-Za-z0-9+/=]+$/.test(encoded)).toBe(true); // Base64 format
    });

    it('should decode encoded state correctly', () => {
      const encoded = WeightedURLStateManager.encodeState(mockState);
      const decoded = WeightedURLStateManager.decodeState(encoded);
      
      expect(decoded.pairs).toEqual(mockState.pairs);
      expect(decoded.precision).toBe(mockState.precision);
      expect(decoded.userMode).toBe(mockState.userMode);
      expect(decoded.inputMode).toBe(mockState.inputMode);
      expect(decoded.strategy).toEqual(mockState.strategy);
      expect(decoded.metadata).toEqual(mockState.metadata);
    });

    it('should handle round-trip encoding/decoding', () => {
      const encoded = WeightedURLStateManager.encodeState(mockState);
      const decoded = WeightedURLStateManager.decodeState(encoded);
      const reencoded = WeightedURLStateManager.encodeState(decoded);
      const redecoded = WeightedURLStateManager.decodeState(reencoded);
      
      expect(redecoded).toEqual(decoded);
    });

    it('should handle states without metadata', () => {
      const stateWithoutMetadata = { ...mockState, metadata: undefined };
      const encoded = WeightedURLStateManager.encodeState(stateWithoutMetadata);
      const decoded = WeightedURLStateManager.decodeState(encoded);
      
      expect(decoded.metadata).toBeUndefined();
      expect(decoded.pairs).toEqual(stateWithoutMetadata.pairs);
    });

    it('should throw error for invalid encoded data', () => {
      expect(() => {
        WeightedURLStateManager.decodeState('invalid-base64!');
      }).toThrow('Invalid or corrupted weighted state data');
    });

    it('should handle large states by creating minimal versions', () => {
      const largeState = {
        ...mockState,
        pairs: Array.from({ length: 100 }, (_, i) => ({
          value: 80 + Math.random() * 20,
          weight: 1 + Math.random() * 4,
          id: `course-${i}`
        })),
        metadata: {
          title: 'A very long title that exceeds normal length limits for URL parameters',
          description: 'An extremely detailed description that would normally make the URL too long for practical sharing purposes'
        }
      };
      
      const encoded = WeightedURLStateManager.encodeState(largeState);
      expect(encoded.length).toBeLessThanOrEqual(2048); // Should not exceed max URL length
      
      const decoded = WeightedURLStateManager.decodeState(encoded);
      expect(decoded.pairs.length).toBeLessThanOrEqual(20); // Should be truncated
    });
  });

  describe('State validation', () => {
    it('should validate correct state', () => {
      expect(WeightedURLStateManager.validateState(mockState)).toBe(true);
    });

    it('should reject invalid state objects', () => {
      expect(WeightedURLStateManager.validateState(null)).toBe(false);
      expect(WeightedURLStateManager.validateState(undefined)).toBe(false);
      expect(WeightedURLStateManager.validateState('string')).toBe(false);
      expect(WeightedURLStateManager.validateState(123)).toBe(false);
    });

    it('should reject states with invalid pairs', () => {
      const invalidPairs = { ...mockState, pairs: 'not-an-array' };
      expect(WeightedURLStateManager.validateState(invalidPairs)).toBe(false);
      
      const invalidPairData = { 
        ...mockState, 
        pairs: [{ value: 'not-a-number', weight: 3, id: 'test' }] 
      };
      expect(WeightedURLStateManager.validateState(invalidPairData)).toBe(false);
    });

    it('should reject states with invalid precision', () => {
      const negativePrecision = { ...mockState, precision: -1 };
      expect(WeightedURLStateManager.validateState(negativePrecision)).toBe(false);
      
      const tooHighPrecision = { ...mockState, precision: 15 };
      expect(WeightedURLStateManager.validateState(tooHighPrecision)).toBe(false);
    });

    it('should reject states with invalid user modes', () => {
      const invalidUserMode = { ...mockState, userMode: 'invalid-mode' };
      expect(WeightedURLStateManager.validateState(invalidUserMode)).toBe(false);
    });

    it('should reject states with invalid input modes', () => {
      const invalidInputMode = { ...mockState, inputMode: 'invalid-input' };
      expect(WeightedURLStateManager.validateState(invalidInputMode)).toBe(false);
    });
  });

  describe('Shareable URL creation', () => {
    it('should create shareable URL with basic options', () => {
      const baseUrl = 'https://example.com/calculator/weighted-mean';
      const shareableState = WeightedURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        baseUrl
      );
      
      expect(shareableState).toMatchObject({
        id: expect.any(String),
        url: expect.stringContaining(baseUrl),
        isPublic: true,
        calculatorType: 'weighted-mean',
        preview: {
          pairCount: 3,
          weightedMean: 87.44,
          totalWeight: 9,
          title: 'Spring 2025 GPA'
        }
      });
      
      expect(shareableState.url).toContain('wstate=');
      expect(shareableState.url).toContain('v=2.0');
    });

    it('should include metadata in URL when requested', () => {
      const baseUrl = 'https://example.com/calculator/weighted-mean';
      const shareableState = WeightedURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        baseUrl,
        { includeMetadata: true }
      );
      
      expect(shareableState.url).toContain('title=');
    });

    it('should set expiration when specified', () => {
      const shareableState = WeightedURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        '',
        { expiresIn: 24 }
      );
      
      expect(shareableState.expiresAt).toBeInstanceOf(Date);
      expect(shareableState.expiresAt!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should create short URL when requested', () => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        value: { origin: 'https://example.com' },
        writable: true
      });
      
      const shareableState = WeightedURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        'https://example.com/calculator/weighted-mean',
        { makeShort: true }
      );
      
      expect(shareableState.shortUrl).toMatch(/^https:\/\/example\.com\/s\/[a-z0-9]{6,8}$/);
    });

    it('should handle missing result gracefully', () => {
      const shareableState = WeightedURLStateManager.createShareableUrl(
        mockState,
        undefined,
        'https://example.com/calculator/weighted-mean'
      );
      
      expect(shareableState.preview).toEqual({
        pairCount: 3,
        weightedMean: undefined,
        totalWeight: undefined,
        title: 'Spring 2025 GPA'
      });
    });
  });

  describe('QR Code generation', () => {
    it('should generate QR code SVG data URL', async () => {
      const url = 'https://example.com/calculator/weighted-mean?wstate=abc123';
      const qrCode = await WeightedURLStateManager.generateQRCode(url);
      
      expect(qrCode).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(atob(qrCode.split(',')[1])).toContain('<svg');
      expect(atob(qrCode.split(',')[1])).toContain('Weighted Mean Calculator');
    });

    it('should include title in QR code when provided', async () => {
      const url = 'https://example.com/calculator/weighted-mean?wstate=abc123';
      const qrCode = await WeightedURLStateManager.generateQRCode(url, {
        title: 'My GPA Calculation',
        includePreview: true
      });
      
      const svgContent = atob(qrCode.split(',')[1]);
      expect(svgContent).toContain('My GPA Calculation');
    });

    it('should support custom QR code size', async () => {
      const url = 'https://example.com/calculator/weighted-mean?wstate=abc123';
      const qrCode = await WeightedURLStateManager.generateQRCode(url, { size: 300 });
      
      const svgContent = atob(qrCode.split(',')[1]);
      expect(svgContent).toContain('width="300"');
      expect(svgContent).toContain('height="340"'); // 300 + 40 for text
    });
  });

  describe('Compression and optimization', () => {
    it('should compress state keys for shorter URLs', () => {
      const encoded = WeightedURLStateManager.encodeState(mockState);
      const decoded = WeightedURLStateManager.decodeState(encoded);
      
      // Compression should work but preserve all data
      expect(decoded).toEqual(mockState);
      expect(encoded.length).toBeLessThan(JSON.stringify(mockState).length);
    });

    it('should handle minimal metadata compression', () => {
      const stateWithMinimalMetadata = {
        ...mockState,
        metadata: {
          title: 'Test'
        }
      };
      
      const encoded = WeightedURLStateManager.encodeState(stateWithMinimalMetadata);
      const decoded = WeightedURLStateManager.decodeState(encoded);
      
      expect(decoded.metadata).toEqual({ title: 'Test' });
    });

    it('should generate consistent IDs for same state', () => {
      const shareableState1 = WeightedURLStateManager.createShareableUrl(mockState);
      const shareableState2 = WeightedURLStateManager.createShareableUrl(mockState);
      
      // IDs should be the same for identical states (within same second)
      expect(shareableState1.id).toBe(shareableState2.id);
    });
  });

  describe('Error handling', () => {
    it('should handle encoding errors gracefully', () => {
      // Create a circular reference that would cause JSON.stringify to fail
      const circularState = { ...mockState } as any;
      circularState.circular = circularState;
      
      expect(() => {
        WeightedURLStateManager.encodeState(circularState);
      }).toThrow();
    });

    it('should handle decoding errors gracefully', () => {
      expect(() => {
        WeightedURLStateManager.decodeState('clearly-not-valid-base64!@#$');
      }).toThrow('Invalid or corrupted weighted state data');
    });

    it('should handle URL creation errors gracefully', () => {
      const invalidState = { invalid: 'state' } as any;
      
      expect(() => {
        WeightedURLStateManager.createShareableUrl(invalidState);
      }).toThrow();
    });
  });
});