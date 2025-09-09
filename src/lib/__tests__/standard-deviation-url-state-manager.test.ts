/**
 * Unit tests for StandardDeviationURLStateManager
 * Tests URL state encoding, decoding, and sharing functionality
 */

import { StandardDeviationURLStateManager } from '../standard-deviation-url-state-manager';
import { StandardDeviationCalculatorState, StandardDeviationResult } from '@/types/standardDeviation';

describe('StandardDeviationURLStateManager', () => {
  const mockState: StandardDeviationCalculatorState = {
    dataPoints: [
      { id: '1', value: 85, label: 'Math Exam' },
      { id: '2', value: 92, label: 'Science Test' },
      { id: '3', value: 78, label: 'History Quiz' },
      { id: '4', value: 88, label: 'English Essay' }
    ],
    inputMode: { type: 'manual' },
    calculationType: 'sample',
    precision: 2,
    userMode: 'student',
    showSteps: true,
    showOutliers: true,
    showVisualization: false,
    excludeOutliers: false,
    outlierMethod: 'iqr',
    outlierThreshold: 1.5,
    useWeights: false,
    normalityTest: false,
    confidenceInterval: 95,
    timestamp: 1640995200000,
    version: '1.0',
    metadata: {
      title: 'Fall 2023 Grades',
      description: 'Standard deviation analysis of semester grades',
      dataset: 'Academic Performance',
      tags: ['grades', 'statistics']
    }
  };

  const mockResult: StandardDeviationResult = {
    mean: 85.75,
    sampleStandardDeviation: 5.91,
    populationStandardDeviation: 5.12,
    variance: 34.92,
    sampleVariance: 34.92,
    count: 4,
    sum: 343,
    sumOfSquares: 29437,
    sumOfSquaredDeviations: 104.75,
    min: 78,
    max: 92,
    range: 14,
    median: 86.5,
    q1: 80.25,
    q3: 90.25,
    iqr: 10,
    skewness: -0.12,
    kurtosis: -1.23,
    coefficientOfVariation: 6.89,
    standardError: 2.95,
    validDataPoints: mockState.dataPoints,
    excludedDataPoints: [],
    outliers: [],
    calculationType: 'sample',
    timestamp: '2025-01-01T00:00:00Z',
    steps: [
      'Step 1: Count the data points: n = 4',
      'Step 2: Calculate the mean: x̄ = 85.75',
      'Step 3: Calculate deviations from mean',
      'Step 4: Square the deviations',
      'Step 5: Sum of squared deviations: 104.75',
      'Step 6: Calculate variance: σ² = 104.75 / 3 = 34.92',
      'Step 7: Calculate standard deviation: σ = √34.92 = 5.91'
    ],
    deviations: [
      { value: 85, deviation: -0.75, squaredDeviation: 0.5625 },
      { value: 92, deviation: 6.25, squaredDeviation: 39.0625 },
      { value: 78, deviation: -7.75, squaredDeviation: 60.0625 },
      { value: 88, deviation: 2.25, squaredDeviation: 5.0625 }
    ]
  };

  describe('State encoding and decoding', () => {
    it('should encode state to URL-safe string', () => {
      const encoded = StandardDeviationURLStateManager.encodeState(mockState);
      
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);
      expect(/^[A-Za-z0-9+/=]+$/.test(encoded)).toBe(true); // Base64 format
    });

    it('should decode encoded state correctly', () => {
      const encoded = StandardDeviationURLStateManager.encodeState(mockState);
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      
      expect(decoded.dataPoints.length).toBe(mockState.dataPoints.length);
      expect(decoded.calculationType).toBe(mockState.calculationType);
      expect(decoded.precision).toBe(mockState.precision);
      expect(decoded.userMode).toBe(mockState.userMode);
      expect(decoded.outlierMethod).toBe(mockState.outlierMethod);
      expect(decoded.outlierThreshold).toBe(mockState.outlierThreshold);
      
      // Check data points
      decoded.dataPoints.forEach((point, index) => {
        expect(point.value).toBeCloseTo(mockState.dataPoints[index].value, 6);
        expect(point.label).toBe(mockState.dataPoints[index].label);
      });
    });

    it('should handle round-trip encoding/decoding', () => {
      const encoded = StandardDeviationURLStateManager.encodeState(mockState);
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      const reencoded = StandardDeviationURLStateManager.encodeState(decoded);
      const redecoded = StandardDeviationURLStateManager.decodeState(reencoded);
      
      expect(redecoded.dataPoints.length).toBe(decoded.dataPoints.length);
      expect(redecoded.calculationType).toBe(decoded.calculationType);
      expect(redecoded.userMode).toBe(decoded.userMode);
    });

    it('should handle states without metadata', () => {
      const stateWithoutMetadata = { ...mockState, metadata: undefined };
      const encoded = StandardDeviationURLStateManager.encodeState(stateWithoutMetadata);
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      
      expect(decoded.metadata).toBeUndefined();
      expect(decoded.dataPoints.length).toBe(stateWithoutMetadata.dataPoints.length);
    });

    it('should compress state effectively', () => {
      const encoded = StandardDeviationURLStateManager.encodeState(mockState);
      const originalJSON = JSON.stringify(mockState);
      
      // Compressed version should be shorter than original JSON
      expect(encoded.length).toBeLessThan(originalJSON.length);
    });

    it('should handle large states by truncating', () => {
      const largeState = {
        ...mockState,
        dataPoints: Array.from({ length: 100 }, (_, i) => ({
          id: `point-${i}`,
          value: Math.random() * 100,
          label: `Data Point ${i + 1} with very long descriptive label that exceeds normal lengths`
        })),
        metadata: {
          title: 'A very long title that exceeds normal length limits for URL parameters and should be truncated appropriately',
          description: 'An extremely detailed description that would normally make the URL too long for practical sharing purposes and needs to be handled gracefully'
        }
      };
      
      const encoded = StandardDeviationURLStateManager.encodeState(largeState);
      expect(encoded.length).toBeLessThanOrEqual(2048);
      
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      expect(decoded.dataPoints.length).toBeLessThanOrEqual(50); // Should be truncated
    });
  });

  describe('State validation', () => {
    it('should validate correct state', () => {
      expect(StandardDeviationURLStateManager.validateState(mockState)).toBe(true);
    });

    it('should reject invalid state objects', () => {
      expect(StandardDeviationURLStateManager.validateState(null)).toBe(false);
      expect(StandardDeviationURLStateManager.validateState(undefined)).toBe(false);
      expect(StandardDeviationURLStateManager.validateState('string')).toBe(false);
      expect(StandardDeviationURLStateManager.validateState(123)).toBe(false);
      expect(StandardDeviationURLStateManager.validateState({})).toBe(false);
    });

    it('should reject states with invalid data points', () => {
      const invalidDataPoints = { ...mockState, dataPoints: 'not-an-array' };
      expect(StandardDeviationURLStateManager.validateState(invalidDataPoints)).toBe(false);
      
      const invalidPointData = { 
        ...mockState, 
        dataPoints: [{ id: '1', value: 'not-a-number', label: 'test' }] 
      };
      expect(StandardDeviationURLStateManager.validateState(invalidPointData)).toBe(false);
    });

    it('should reject states with invalid precision', () => {
      const negativePrecision = { ...mockState, precision: -1 };
      expect(StandardDeviationURLStateManager.validateState(negativePrecision)).toBe(false);
      
      const tooHighPrecision = { ...mockState, precision: 15 };
      expect(StandardDeviationURLStateManager.validateState(tooHighPrecision)).toBe(false);
    });

    it('should reject states with invalid user modes', () => {
      const invalidUserMode = { ...mockState, userMode: 'invalid-mode' };
      expect(StandardDeviationURLStateManager.validateState(invalidUserMode)).toBe(false);
    });

    it('should reject states with invalid calculation types', () => {
      const invalidCalculationType = { ...mockState, calculationType: 'invalid-type' };
      expect(StandardDeviationURLStateManager.validateState(invalidCalculationType)).toBe(false);
    });
  });

  describe('Shareable URL creation', () => {
    it('should create shareable URL with basic options', () => {
      const baseUrl = 'https://example.com/calculator/standard-deviation';
      const shareableState = StandardDeviationURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        baseUrl
      );
      
      expect(shareableState).toMatchObject({
        id: expect.any(String),
        url: expect.stringContaining(baseUrl),
        isPublic: true,
        calculatorType: 'standard-deviation',
        preview: {
          dataPointCount: 4,
          mean: 85.75,
          standardDeviation: 5.91,
          calculationType: 'sample',
          title: 'Fall 2023 Grades'
        }
      });
      
      expect(shareableState.url).toContain('sdstate=');
      expect(shareableState.url).toContain('v=1.0');
    });

    it('should include metadata in URL when requested', () => {
      const baseUrl = 'https://example.com/calculator/standard-deviation';
      const shareableState = StandardDeviationURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        baseUrl,
        { includeMetadata: true }
      );
      
      expect(shareableState.url).toContain('title=');
      expect(shareableState.url).toContain('desc=');
    });

    it('should set expiration when specified', () => {
      const shareableState = StandardDeviationURLStateManager.createShareableUrl(
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
      Object.defineProperty(global, 'window', {
        value: { location: { origin: 'https://example.com' } },
        writable: true
      });
      
      const shareableState = StandardDeviationURLStateManager.createShareableUrl(
        mockState,
        mockResult,
        'https://example.com/calculator/standard-deviation',
        { makeShort: true }
      );
      
      expect(shareableState.shortUrl).toMatch(/^https:\/\/example\.com\/s\/[a-z0-9]{6}$/);
    });

    it('should handle missing result gracefully', () => {
      const shareableState = StandardDeviationURLStateManager.createShareableUrl(
        mockState,
        undefined,
        'https://example.com/calculator/standard-deviation'
      );
      
      expect(shareableState.preview).toEqual({
        dataPointCount: 4,
        mean: undefined,
        standardDeviation: undefined,
        calculationType: 'sample',
        title: 'Fall 2023 Grades'
      });
    });

    it('should generate consistent IDs for same state', () => {
      const shareableState1 = StandardDeviationURLStateManager.createShareableUrl(mockState);
      const shareableState2 = StandardDeviationURLStateManager.createShareableUrl(mockState);
      
      expect(shareableState1.id).toBe(shareableState2.id);
    });
  });

  describe('QR Code generation', () => {
    it('should generate QR code SVG data URL', async () => {
      const url = 'https://example.com/calculator/standard-deviation?sdstate=abc123';
      const qrCode = await StandardDeviationURLStateManager.generateQRCode(url);
      
      expect(qrCode).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(atob(qrCode.split(',')[1])).toContain('<svg');
      expect(atob(qrCode.split(',')[1])).toContain('Standard Deviation Calculator');
    });

    it('should include title in QR code when provided', async () => {
      const url = 'https://example.com/calculator/standard-deviation?sdstate=abc123';
      const qrCode = await StandardDeviationURLStateManager.generateQRCode(url, {
        title: 'My Statistics Analysis',
        includePreview: true
      });
      
      const svgContent = atob(qrCode.split(',')[1]);
      expect(svgContent).toContain('My Statistics Analysis');
    });

    it('should support custom QR code size', async () => {
      const url = 'https://example.com/calculator/standard-deviation?sdstate=abc123';
      const qrCode = await StandardDeviationURLStateManager.generateQRCode(url, { size: 300 });
      
      const svgContent = atob(qrCode.split(',')[1]);
      expect(svgContent).toContain('width="300"');
      expect(svgContent).toContain('height="340"'); // 300 + 40 for text
    });
  });

  describe('Error handling', () => {
    it('should handle encoding errors gracefully', () => {
      // Mock btoa to throw an error
      const originalBtoa = global.btoa;
      global.btoa = () => {
        throw new Error('Base64 encoding failed');
      };
      
      try {
        expect(() => {
          StandardDeviationURLStateManager.encodeState(mockState);
        }).toThrow('Failed to encode standard deviation calculator state');
      } finally {
        global.btoa = originalBtoa;
      }
    });

    it('should handle decoding errors gracefully', () => {
      expect(() => {
        StandardDeviationURLStateManager.decodeState('clearly-not-valid-base64!@#$');
      }).toThrow('Invalid or corrupted standard deviation calculator state data');
    });

    it('should handle malformed JSON during decoding', () => {
      const invalidBase64 = btoa('{"invalid": json}'); // Missing quotes around property name
      
      expect(() => {
        StandardDeviationURLStateManager.decodeState(invalidBase64);
      }).toThrow('Invalid or corrupted standard deviation calculator state data');
    });
  });

  describe('Compression optimization', () => {
    it('should compress common field names', () => {
      const encoded = StandardDeviationURLStateManager.encodeState(mockState);
      const jsonString = atob(encoded);
      
      // Compressed keys should be present
      expect(jsonString).toContain('"dp"'); // dataPoints -> dp
      expect(jsonString).toContain('"ct"'); // calculationType -> ct
      expect(jsonString).toContain('"um"'); // userMode -> um
      expect(jsonString).toContain('"p"');  // precision -> p
    });

    it('should exclude undefined/false/empty values to reduce size', () => {
      const minimalState = {
        ...mockState,
        showSteps: false,
        showVisualization: false,
        useWeights: false,
        normalityTest: false
      };
      
      const encoded = StandardDeviationURLStateManager.encodeState(minimalState);
      const jsonString = atob(encoded);
      
      // These false values should not appear in compressed state
      expect(jsonString).not.toContain('false');
    });

    it('should limit data point precision for URL optimization', () => {
      const highPrecisionState = {
        ...mockState,
        dataPoints: [
          { id: '1', value: 85.123456789, label: 'Test' },
          { id: '2', value: 92.987654321, label: 'Test 2' }
        ]
      };
      
      const encoded = StandardDeviationURLStateManager.encodeState(highPrecisionState);
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      
      // Values should be limited to 6 decimal places
      expect(decoded.dataPoints[0].value).toBeCloseTo(85.123457, 5);
      expect(decoded.dataPoints[1].value).toBeCloseTo(92.987654, 5);
    });

    it('should truncate long labels', () => {
      const longLabelState = {
        ...mockState,
        dataPoints: [
          { 
            id: '1', 
            value: 85, 
            label: 'This is an extremely long label that exceeds the reasonable limit for URL encoding and should be truncated to save space'
          }
        ]
      };
      
      const encoded = StandardDeviationURLStateManager.encodeState(longLabelState);
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      
      expect(decoded.dataPoints[0].label!.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Default value handling', () => {
    it('should fill missing values with defaults', () => {
      const incompleteState = {
        dataPoints: [{ id: '1', value: 10, label: 'Test' }],
        calculationType: 'sample',
        precision: 2,
        userMode: 'student'
      };
      
      const encoded = btoa(JSON.stringify(incompleteState));
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      
      expect(decoded.outlierMethod).toBe('iqr');
      expect(decoded.outlierThreshold).toBe(1.5);
      expect(decoded.showSteps).toBe(false);
      expect(decoded.confidenceInterval).toBe(95);
    });

    it('should ensure data points have required fields', () => {
      const incompleteDataState = {
        dataPoints: [
          { value: 10 }, // Missing id and label
          { id: '2', value: 20 } // Missing label
        ],
        calculationType: 'sample',
        precision: 2,
        userMode: 'student'
      };
      
      const encoded = btoa(JSON.stringify(incompleteDataState));
      const decoded = StandardDeviationURLStateManager.decodeState(encoded);
      
      expect(decoded.dataPoints[0].id).toBe('point-0');
      expect(decoded.dataPoints[0].label).toBe('Data Point 1');
      expect(decoded.dataPoints[1].label).toBe('Data Point 2');
    });
  });
});