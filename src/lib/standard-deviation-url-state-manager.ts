/**
 * URL State Manager for Standard Deviation Calculator
 * Handles encoding/decoding of calculator state for sharing and persistence
 * Supports compression and validation for optimal URL lengths
 */

import { 
  StandardDeviationCalculatorState,
  StandardDeviationResult,
  StandardDeviationShareableState,
  DataPoint
} from '@/types/standardDeviation';

export class StandardDeviationURLStateManager {
  private static readonly VERSION = '1.0';
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly COMPRESSION_MAP = {
    // Compress common field names
    dataPoints: 'dp',
    inputMode: 'im',
    calculationType: 'ct',
    precision: 'p',
    userMode: 'um',
    showSteps: 'ss',
    showOutliers: 'so',
    showVisualization: 'sv',
    excludeOutliers: 'eo',
    outlierMethod: 'om',
    outlierThreshold: 'ot',
    useWeights: 'uw',
    normalityTest: 'nt',
    confidenceInterval: 'ci',
    metadata: 'md',
    timestamp: 'ts',
    version: 'v'
  };

  private static readonly REVERSE_COMPRESSION_MAP = Object.fromEntries(
    Object.entries(this.COMPRESSION_MAP).map(([key, value]) => [value, key])
  );

  /**
   * Encode calculator state to URL-safe string
   */
  static encodeState(state: StandardDeviationCalculatorState): string {
    try {
      // Create a minimal state object
      const minimalState = this.createMinimalState(state);
      
      // Apply compression
      const compressedState = this.compressStateKeys(minimalState);
      
      // Serialize and encode
      const jsonString = JSON.stringify(compressedState);
      if (jsonString === undefined) {
        throw new Error('Failed to serialize state');
      }
      
      const base64Encoded = btoa(jsonString);
      
      // Check URL length and truncate if necessary
      if (base64Encoded.length > this.MAX_URL_LENGTH) {
        return this.createTruncatedState(state);
      }
      
      return base64Encoded;
    } catch (error) {
      throw new Error('Failed to encode standard deviation calculator state');
    }
  }

  /**
   * Decode URL-safe string to calculator state
   */
  static decodeState(encoded: string): StandardDeviationCalculatorState {
    try {
      // Decode from base64
      const jsonString = atob(encoded);
      const compressedState = JSON.parse(jsonString);
      
      // Decompress keys
      const decompressedState = this.decompressStateKeys(compressedState);
      
      // Validate and fill defaults
      return this.validateAndFillDefaults(decompressedState);
    } catch (error) {
      throw new Error('Invalid or corrupted standard deviation calculator state data');
    }
  }

  /**
   * Validate state object
   */
  static validateState(state: any): boolean {
    if (!state || typeof state !== 'object') return false;
    
    // Check required fields
    const requiredFields = ['dataPoints', 'calculationType', 'precision', 'userMode'];
    for (const field of requiredFields) {
      if (!(field in state)) return false;
    }
    
    // Validate data points
    if (!Array.isArray(state.dataPoints)) return false;
    for (const point of state.dataPoints) {
      if (!point || typeof point.value !== 'number' || isNaN(point.value)) return false;
    }
    
    // Validate precision
    if (typeof state.precision !== 'number' || state.precision < 0 || state.precision > 10) {
      return false;
    }
    
    // Validate user mode
    if (!['student', 'research', 'teacher'].includes(state.userMode)) return false;
    
    // Validate calculation type
    if (!['sample', 'population', 'both'].includes(state.calculationType)) return false;
    
    return true;
  }

  /**
   * Create shareable URL with metadata
   */
  static createShareableUrl(
    state: StandardDeviationCalculatorState,
    result?: StandardDeviationResult,
    baseUrl: string = '',
    options: {
      includeMetadata?: boolean;
      expiresIn?: number; // hours
      makeShort?: boolean;
      title?: string;
    } = {}
  ): StandardDeviationShareableState {
    const id = this.generateShareId(state);
    const encodedState = this.encodeState(state);
    
    // Build URL parameters
    const params = new URLSearchParams();
    params.set('sdstate', encodedState);
    params.set('v', this.VERSION);
    
    if (options.includeMetadata && state.metadata) {
      if (state.metadata.title) params.set('title', state.metadata.title);
      if (state.metadata.description) params.set('desc', state.metadata.description);
      if (state.metadata.dataset) params.set('dataset', state.metadata.dataset);
    }
    
    if (options.title) {
      params.set('title', options.title);
    }
    
    const fullUrl = baseUrl ? `${baseUrl}?${params.toString()}` : `?${params.toString()}`;
    
    // Generate short URL if requested
    let shortUrl: string | undefined;
    if (options.makeShort) {
      shortUrl = this.generateShortUrl(fullUrl);
    }
    
    // Calculate expiration
    let expiresAt: Date | undefined;
    if (options.expiresIn) {
      expiresAt = new Date(Date.now() + options.expiresIn * 60 * 60 * 1000);
    }
    
    // Create preview data
    const preview = {
      dataPointCount: state.dataPoints.length,
      mean: result?.mean,
      standardDeviation: result ? (
        state.calculationType === 'population' ? result.populationStandardDeviation : result.sampleStandardDeviation
      ) : undefined,
      calculationType: state.calculationType,
      title: options.title || state.metadata?.title
    };
    
    return {
      id,
      url: fullUrl,
      shortUrl,
      expiresAt,
      isPublic: true,
      calculatorType: 'standard-deviation',
      preview
    };
  }

  /**
   * Generate QR code for URL
   */
  static async generateQRCode(
    url: string, 
    options: {
      size?: number;
      title?: string;
      includePreview?: boolean;
    } = {}
  ): Promise<string> {
    const size = options.size || 200;
    const title = options.title || 'Standard Deviation Calculator';
    
    // In a real implementation, you would use a QR code library
    // For now, we'll create a simple SVG placeholder
    const svg = `
      <svg width="${size}" height="${size + 40}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="white" stroke="black" stroke-width="2"/>
        <text x="${size/2}" y="${size + 25}" text-anchor="middle" font-size="12" font-family="Arial">
          ${title}
        </text>
        <!-- QR Code pattern placeholder -->
        <rect x="20" y="20" width="10" height="10" fill="black"/>
        <rect x="40" y="20" width="10" height="10" fill="black"/>
        <rect x="20" y="40" width="10" height="10" fill="black"/>
        <rect x="40" y="40" width="10" height="10" fill="black"/>
        <!-- More pattern elements would go here -->
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Create minimal state for encoding
   */
  private static createMinimalState(state: StandardDeviationCalculatorState): any {
    const minimal: any = {
      dataPoints: state.dataPoints.slice(0, 50).map(dp => ({
        id: dp.id,
        value: Number(dp.value.toFixed(6)), // Limit precision
        label: dp.label ? dp.label.substring(0, 20) : undefined, // Limit label length
        excluded: dp.excluded || undefined,
        weight: dp.weight || undefined
      })),
      calculationType: state.calculationType,
      precision: state.precision,
      userMode: state.userMode,
      showSteps: state.showSteps || undefined,
      showOutliers: state.showOutliers || undefined,
      excludeOutliers: state.excludeOutliers || undefined,
      outlierMethod: state.outlierMethod !== 'iqr' ? state.outlierMethod : undefined,
      outlierThreshold: state.outlierThreshold !== 1.5 ? state.outlierThreshold : undefined,
      useWeights: state.useWeights || undefined,
      normalityTest: state.normalityTest || undefined,
      confidenceInterval: state.confidenceInterval !== 95 ? state.confidenceInterval : undefined,
      version: this.VERSION
    };
    
    // Include metadata only if present and significant
    if (state.metadata && Object.keys(state.metadata).length > 0) {
      minimal.metadata = {
        title: state.metadata.title?.substring(0, 50),
        description: state.metadata.description?.substring(0, 100),
        dataset: state.metadata.dataset?.substring(0, 30),
        tags: state.metadata.tags?.slice(0, 3)
      };
    }
    
    return minimal;
  }

  /**
   * Create truncated state when URL is too long
   */
  private static createTruncatedState(state: StandardDeviationCalculatorState): string {
    const truncatedState = {
      dataPoints: state.dataPoints.slice(0, 10).map(dp => ({
        id: dp.id,
        value: Number(dp.value.toFixed(3)),
        label: dp.label?.substring(0, 10)
      })),
      calculationType: state.calculationType,
      precision: state.precision,
      userMode: state.userMode,
      version: this.VERSION
    };
    
    const compressedState = this.compressStateKeys(truncatedState);
    return btoa(JSON.stringify(compressedState));
  }

  /**
   * Compress state keys for shorter URLs
   */
  private static compressStateKeys(state: any): any {
    const compressed: any = {};
    
    for (const [key, value] of Object.entries(state)) {
      const compressedKey = this.COMPRESSION_MAP[key as keyof typeof this.COMPRESSION_MAP] || key;
      
      if (Array.isArray(value)) {
        compressed[compressedKey] = value.map(item => 
          typeof item === 'object' ? this.compressStateKeys(item) : item
        );
      } else if (value && typeof value === 'object') {
        compressed[compressedKey] = this.compressStateKeys(value);
      } else if (value !== undefined && value !== null && value !== false && value !== '') {
        compressed[compressedKey] = value;
      }
    }
    
    return compressed;
  }

  /**
   * Decompress state keys
   */
  private static decompressStateKeys(compressed: any): any {
    const decompressed: any = {};
    
    for (const [compressedKey, value] of Object.entries(compressed)) {
      const originalKey = this.REVERSE_COMPRESSION_MAP[compressedKey] || compressedKey;
      
      if (Array.isArray(value)) {
        decompressed[originalKey] = value.map(item => 
          typeof item === 'object' ? this.decompressStateKeys(item) : item
        );
      } else if (value && typeof value === 'object') {
        decompressed[originalKey] = this.decompressStateKeys(value);
      } else {
        decompressed[originalKey] = value;
      }
    }
    
    return decompressed;
  }

  /**
   * Validate and fill default values
   */
  private static validateAndFillDefaults(state: any): StandardDeviationCalculatorState {
    const defaults: StandardDeviationCalculatorState = {
      dataPoints: [],
      inputMode: { type: 'manual' },
      calculationType: 'sample',
      precision: 2,
      userMode: 'student',
      showSteps: false,
      showOutliers: true,
      showVisualization: false,
      excludeOutliers: false,
      outlierMethod: 'iqr',
      outlierThreshold: 1.5,
      useWeights: false,
      normalityTest: false,
      confidenceInterval: 95,
      timestamp: Date.now(),
      version: this.VERSION
    };
    
    // Merge with defaults
    const merged = { ...defaults, ...state };
    
    // Ensure data points have required fields
    merged.dataPoints = (state.dataPoints || []).map((dp: any, index: number) => ({
      id: dp.id || `point-${index}`,
      value: typeof dp.value === 'number' ? dp.value : 0,
      label: dp.label || `Data Point ${index + 1}`,
      excluded: !!dp.excluded,
      weight: dp.weight
    }));
    
    return merged;
  }

  /**
   * Generate unique share ID
   */
  private static generateShareId(state: StandardDeviationCalculatorState): string {
    const dataHash = state.dataPoints
      .map(dp => `${dp.value}-${dp.label}`)
      .join('|');
    const stateString = `${dataHash}-${state.calculationType}-${state.userMode}`;
    
    // Simple hash function (in production, use a proper hash)
    let hash = 0;
    for (let i = 0; i < stateString.length; i++) {
      const char = stateString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  /**
   * Generate short URL (simplified implementation)
   */
  private static generateShortUrl(fullUrl: string): string {
    // In a real implementation, this would involve a URL shortening service
    const id = Math.random().toString(36).substring(2, 8);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://statcal.com';
    return `${origin}/s/${id}`;
  }
}

export default StandardDeviationURLStateManager;