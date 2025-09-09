/**
 * Enhanced URL state management for Weighted Mean Calculator
 * Supports sharing and saving weighted calculation configurations
 */

'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { WeightedPair, WeightingStrategy, WeightedMeanResult } from '@/types/weightedMean';

export interface WeightedCalculatorState {
  pairs: WeightedPair[];
  precision: number;
  userMode: 'student' | 'research' | 'teacher';
  inputMode: 'pairs' | 'columns' | 'manual';
  strategy: WeightingStrategy;
  showSteps: boolean;
  showHelp: boolean;
  timestamp: number;
  version: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    author?: string;
    course?: string; // For student mode
    subject?: string; // For research mode
    class?: string; // For teacher mode
  };
}

export interface WeightedShareableState {
  id: string;
  url: string;
  shortUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
  accessCount?: number;
  isPublic: boolean;
  calculatorType: 'weighted-mean';
  preview: {
    pairCount: number;
    weightedMean?: number;
    totalWeight?: number;
    title?: string;
  };
}

export class WeightedURLStateManager {
  private static readonly VERSION = '2.0';
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly COMPRESSION_THRESHOLD = 800;

  /**
   * Encode weighted calculator state to URL parameters
   */
  static encodeState(state: WeightedCalculatorState): string {
    try {
      const compressedState = this.compressState(state);
      const encoded = btoa(JSON.stringify(compressedState));
      
      if (encoded.length > this.MAX_URL_LENGTH) {
        // Try more aggressive compression
        const minimalState = this.createMinimalState(state);
        const minimalEncoded = btoa(JSON.stringify(this.compressState(minimalState)));
        
        if (minimalEncoded.length > this.MAX_URL_LENGTH) {
          throw new Error('State too large for URL encoding even with minimal compression');
        }
        
        return minimalEncoded;
      }
      
      return encoded;
    } catch (error) {
      console.error('Failed to encode weighted state:', error);
      if (error instanceof Error && error.message.includes('State too large')) {
        throw error;
      }
      throw new Error('Failed to encode weighted calculator state');
    }
  }

  /**
   * Decode weighted calculator state from URL parameters
   */
  static decodeState(encoded: string): WeightedCalculatorState {
    try {
      const decoded = JSON.parse(atob(encoded));
      return this.decompressState(decoded);
    } catch (error) {
      console.error('Failed to decode weighted state:', error);
      throw new Error('Invalid or corrupted weighted state data');
    }
  }

  /**
   * Validate weighted calculator state
   */
  static validateState(state: any): state is WeightedCalculatorState {
    if (!state || typeof state !== 'object') {
      return false;
    }

    return (
      Array.isArray(state.pairs) &&
      state.pairs.every((pair: any) => 
        typeof pair.value === 'number' && !isNaN(pair.value) &&
        typeof pair.weight === 'number' && !isNaN(pair.weight)
      ) &&
      typeof state.precision === 'number' &&
      state.precision >= 0 &&
      state.precision <= 10 &&
      ['student', 'research', 'teacher'].includes(state.userMode) &&
      ['pairs', 'columns', 'manual'].includes(state.inputMode) &&
      state.strategy &&
      typeof state.strategy === 'object' &&
      typeof state.showSteps === 'boolean' &&
      typeof state.showHelp === 'boolean' &&
      typeof state.timestamp === 'number' &&
      typeof state.version === 'string'
    );
  }

  /**
   * Create shareable URL from weighted state
   */
  static createShareableUrl(
    state: WeightedCalculatorState,
    result?: WeightedMeanResult,
    baseUrl: string = '',
    options: {
      includeMetadata?: boolean;
      expiresIn?: number; // hours
      makeShort?: boolean;
    } = {}
  ): WeightedShareableState {
    try {
      const encoded = this.encodeState(state);
      const searchParams = new URLSearchParams();
      
      searchParams.set('wstate', encoded);
      searchParams.set('v', this.VERSION);
      
      if (options.includeMetadata && state.metadata?.title) {
        searchParams.set('title', state.metadata.title);
      }
      
      const url = `${baseUrl}?${searchParams.toString()}`;
      const id = this.generateStateId(state);
      
      // Create preview for sharing
      const preview = {
        pairCount: state.pairs.length,
        weightedMean: result?.weightedMean,
        totalWeight: result?.totalWeights,
        title: state.metadata?.title
      };

      const shareableState: WeightedShareableState = {
        id,
        url,
        isPublic: true,
        calculatorType: 'weighted-mean',
        preview
      };

      if (options.expiresIn) {
        shareableState.expiresAt = new Date(Date.now() + options.expiresIn * 60 * 60 * 1000);
      }

      if (options.makeShort) {
        shareableState.shortUrl = this.createShortUrl(url);
      }

      return shareableState;
    } catch (error) {
      console.error('Failed to create shareable weighted URL:', error);
      throw new Error('Failed to create shareable URL for weighted calculator');
    }
  }

  /**
   * Generate QR code for weighted calculator sharing
   */
  static async generateQRCode(url: string, options: {
    size?: number;
    includePreview?: boolean;
    title?: string;
  } = {}): Promise<string> {
    const { size = 200, includePreview = true, title } = options;
    
    // Enhanced QR code with calculator-specific information
    const qrContent = includePreview 
      ? `Weighted Mean Calculator: ${title || 'Calculation'}\n${url}`
      : url;

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size + 40}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size + 40}" fill="white" stroke="#e5e7eb" stroke-width="1"/>
        
        <!-- QR Code placeholder -->
        <rect x="10" y="10" width="${size - 20}" height="${size - 20}" fill="#f3f4f6" stroke="#d1d5db"/>
        
        <!-- QR modules simulation -->
        ${this.generateQRModules(size - 20).map((module, i) => 
          `<rect x="${module.x + 10}" y="${module.y + 10}" width="4" height="4" fill="${module.filled ? '#000' : 'none'}"/>`
        ).join('')}
        
        <!-- Title and info -->
        <text x="${size/2}" y="${size + 15}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#374151">
          Weighted Mean Calculator
        </text>
        ${title ? `<text x="${size/2}" y="${size + 30}" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#6b7280">${title.substring(0, 20)}${title.length > 20 ? '...' : ''}</text>` : ''}
      </svg>
    `)}`;
  }

  /**
   * Create short URL using simple hash-based approach
   */
  private static createShortUrl(longUrl: string): string {
    const hash = this.simpleHash(longUrl);
    const shortId = hash.toString(36).substring(0, 8);
    
    // This would typically integrate with a URL shortening service
    // For now, return a placeholder format
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/s/${shortId}`;
  }

  /**
   * Generate QR code modules for visualization
   */
  private static generateQRModules(size: number): Array<{x: number, y: number, filled: boolean}> {
    const modules = [];
    const moduleSize = 4;
    const gridSize = Math.floor(size / moduleSize);
    
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        // Simple pattern for QR code simulation
        const filled = (x + y) % 3 === 0 || 
                      (x < 7 && y < 7) || 
                      (x > gridSize - 8 && y < 7) || 
                      (x < 7 && y > gridSize - 8);
        
        modules.push({
          x: x * moduleSize,
          y: y * moduleSize,
          filled
        });
      }
    }
    
    return modules;
  }

  // Private helper methods
  private static compressState(state: WeightedCalculatorState): any {
    return {
      p: state.pairs.map(pair => [pair.value, pair.weight, pair.id]), // Compress pairs
      pr: state.precision,
      u: state.userMode.charAt(0), // 's', 'r', 't'
      i: state.inputMode.charAt(0), // 'p', 'c', 'm'
      st: {
        z: state.strategy.zeroWeightStrategy.charAt(0), // 'i', 'e', 'i'
        m: state.strategy.missingWeightStrategy.charAt(0), // 'z', 'i', 'e'
        n: state.strategy.normalizeWeights,
        p: state.strategy.precision
      },
      s: state.showSteps,
      h: state.showHelp,
      t: state.timestamp,
      v: state.version,
      ...(state.metadata && { m: this.compressMetadata(state.metadata) })
    };
  }

  private static decompressState(compressed: any): WeightedCalculatorState {
    const userModeMap: Record<string, 'student' | 'research' | 'teacher'> = {
      's': 'student', 'r': 'research', 't': 'teacher'
    };
    
    const inputModeMap: Record<string, 'pairs' | 'columns' | 'manual'> = {
      'p': 'pairs', 'c': 'columns', 'm': 'manual'
    };
    
    const strategyMap = {
      'i': 'ignore' as const,
      'e': 'error' as const,
      'z': 'zero' as const
    };

    return {
      pairs: (compressed.p || []).map((p: any[], index: number) => ({
        value: p[0],
        weight: p[1],
        id: p[2] || `pair-${index}`
      })),
      precision: compressed.pr || 2,
      userMode: userModeMap[compressed.u] || 'student',
      inputMode: inputModeMap[compressed.i] || 'pairs',
      strategy: {
        zeroWeightStrategy: strategyMap[compressed.st?.z] || 'ignore',
        missingWeightStrategy: strategyMap[compressed.st?.m] || 'zero',
        normalizeWeights: compressed.st?.n || false,
        precision: compressed.st?.p || 2
      },
      showSteps: compressed.s || false,
      showHelp: compressed.h || false,
      timestamp: compressed.t || Date.now(),
      version: compressed.v || this.VERSION,
      ...(compressed.m && { metadata: this.decompressMetadata(compressed.m) })
    };
  }

  private static createMinimalState(state: WeightedCalculatorState): WeightedCalculatorState {
    // Keep only essential data for URL sharing
    return {
      ...state,
      pairs: state.pairs.slice(0, 20), // Limit pairs for URL length
      metadata: state.metadata ? {
        title: state.metadata.title?.substring(0, 50) // Truncate title
      } : undefined
    };
  }

  private static compressMetadata(metadata: WeightedCalculatorState['metadata']): any {
    if (!metadata) return undefined;
    return {
      ...(metadata.title && { t: metadata.title }),
      ...(metadata.description && { d: metadata.description.substring(0, 100) }),
      ...(metadata.tags && { g: metadata.tags.slice(0, 5) }),
      ...(metadata.author && { a: metadata.author }),
      ...(metadata.course && { c: metadata.course }),
      ...(metadata.subject && { s: metadata.subject }),
      ...(metadata.class && { cl: metadata.class })
    };
  }

  private static decompressMetadata(compressed: any): WeightedCalculatorState['metadata'] {
    return {
      ...(compressed.t && { title: compressed.t }),
      ...(compressed.d && { description: compressed.d }),
      ...(compressed.g && { tags: compressed.g }),
      ...(compressed.a && { author: compressed.a }),
      ...(compressed.c && { course: compressed.c }),
      ...(compressed.s && { subject: compressed.s }),
      ...(compressed.cl && { class: compressed.cl })
    };
  }

  private static generateStateId(state: WeightedCalculatorState): string {
    const hash = this.simpleHash(JSON.stringify({
      pairs: state.pairs.length,
      userMode: state.userMode,
      timestamp: Math.floor(state.timestamp / 1000) // Round to seconds for consistency
    }));
    return hash.toString(36).substring(0, 12);
  }

  private static simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * React hook for weighted calculator URL state management
 */
export function useWeightedURLState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<WeightedCalculatorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load state from URL on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      const encodedState = searchParams.get('wstate');
      if (encodedState) {
        const decodedState = WeightedURLStateManager.decodeState(encodedState);
        
        if (WeightedURLStateManager.validateState(decodedState)) {
          setState(decodedState);
        } else {
          throw new Error('Invalid weighted state format');
        }
      } else {
        // Default state
        setState({
          pairs: [],
          precision: 2,
          userMode: 'student',
          inputMode: 'pairs',
          strategy: {
            zeroWeightStrategy: 'ignore',
            missingWeightStrategy: 'zero',
            normalizeWeights: false,
            precision: 2
          },
          showSteps: false,
          showHelp: false,
          timestamp: Date.now(),
          version: WeightedURLStateManager['VERSION']
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load weighted state');
      // Set default state on error
      setState({
        pairs: [],
        precision: 2,
        userMode: 'student',
        inputMode: 'pairs',
        strategy: {
          zeroWeightStrategy: 'ignore',
          missingWeightStrategy: 'zero',
          normalizeWeights: false,
          precision: 2
        },
        showSteps: false,
        showHelp: false,
        timestamp: Date.now(),
        version: WeightedURLStateManager['VERSION']
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Update URL when state changes
  const updateState = useCallback((newState: Partial<WeightedCalculatorState>) => {
    if (!state) return;

    const updatedState = {
      ...state,
      ...newState,
      timestamp: Date.now()
    };

    try {
      const encoded = WeightedURLStateManager.encodeState(updatedState);
      const params = new URLSearchParams(searchParams);
      params.set('wstate', encoded);
      params.set('v', WeightedURLStateManager['VERSION']);

      // Update URL without navigation
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      setState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update weighted state');
    }
  }, [state, searchParams, router, pathname]);

  // Clear state and URL parameters
  const clearState = useCallback(() => {
    const defaultState: WeightedCalculatorState = {
      pairs: [],
      precision: 2,
      userMode: 'student',
      inputMode: 'pairs',
      strategy: {
        zeroWeightStrategy: 'ignore',
        missingWeightStrategy: 'zero',
        normalizeWeights: false,
        precision: 2
      },
      showSteps: false,
      showHelp: false,
      timestamp: Date.now(),
      version: WeightedURLStateManager['VERSION']
    };

    setState(defaultState);
    router.replace(pathname);
  }, [router, pathname]);

  // Create shareable URL
  const createShareableUrl = useCallback((
    result?: WeightedMeanResult,
    options: {
      includeMetadata?: boolean;
      expiresIn?: number;
      makeShort?: boolean;
      title?: string;
    } = {}
  ) => {
    if (!state) return null;

    // Add title to metadata if provided
    const stateWithTitle = options.title ? {
      ...state,
      metadata: {
        ...state.metadata,
        title: options.title
      }
    } : state;

    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${pathname}`
      : '';

    return WeightedURLStateManager.createShareableUrl(stateWithTitle, result, baseUrl, options);
  }, [state, pathname]);

  // Generate QR code for current state
  const generateQRCode = useCallback(async (options: {
    size?: number;
    title?: string;
  } = {}) => {
    const shareableUrl = createShareableUrl(undefined, { includeMetadata: true });
    if (!shareableUrl) return null;

    return WeightedURLStateManager.generateQRCode(shareableUrl.url, {
      size: options.size,
      includePreview: true,
      title: options.title || state?.metadata?.title
    });
  }, [createShareableUrl, state]);

  return {
    state,
    isLoading,
    error,
    updateState,
    clearState,
    createShareableUrl,
    generateQRCode
  };
}

export default WeightedURLStateManager;