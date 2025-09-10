/**
 * URL state management for research scenarios
 * Enables saving and sharing calculation states via URL parameters
 */

'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { MeanCalculationResult } from './calculations';

export interface CalculatorState {
  data: number[];
  precision: number;
  context: 'student' | 'research' | 'teacher';
  showSteps: boolean;
  showAdvancedStats: boolean;
  timestamp: number;
  version: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    author?: string;
  };
}

export interface ShareableState {
  id: string;
  url: string;
  shortUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
  accessCount?: number;
  isPublic: boolean;
}

export class URLStateManager {
  private static readonly VERSION = '1.0';
  private static readonly MAX_URL_LENGTH = 2048;
  private static readonly COMPRESSION_THRESHOLD = 1000;

  /**
   * Encode calculator state to URL parameters
   */
  static encodeState(state: CalculatorState): string {
    try {
      const compressedState = this.compressState(state);
      const encoded = btoa(JSON.stringify(compressedState));
      
      if (encoded.length > this.MAX_URL_LENGTH) {
        throw new Error('State too large for URL encoding');
      }
      
      return encoded;
    } catch (error) {
      console.error('Failed to encode state:', error);
      if (error instanceof Error && error.message === 'State too large for URL encoding') {
        throw error; // Re-throw the original error
      }
      throw new Error('Failed to encode calculator state');
    }
  }

  /**
   * Decode calculator state from URL parameters
   */
  static decodeState(encoded: string): CalculatorState {
    try {
      const decoded = JSON.parse(atob(encoded));
      return this.decompressState(decoded);
    } catch (error) {
      console.error('Failed to decode state:', error);
      throw new Error('Invalid or corrupted state data');
    }
  }

  /**
   * Validate calculator state
   */
  static validateState(state: any): state is CalculatorState {
    if (!state || typeof state !== 'object') {
      return false;
    }
    
    return (
      Array.isArray(state.data) &&
      state.data.every((n: any) => typeof n === 'number' && !isNaN(n)) &&
      typeof state.precision === 'number' &&
      state.precision >= 0 &&
      state.precision <= 20 &&
      ['student', 'research', 'teacher'].includes(state.context) &&
      typeof state.showSteps === 'boolean' &&
      typeof state.showAdvancedStats === 'boolean' &&
      typeof state.timestamp === 'number' &&
      typeof state.version === 'string'
    );
  }

  /**
   * Create shareable URL from state
   */
  static createShareableUrl(
    state: CalculatorState,
    baseUrl: string = '',
    options: {
      includeMetadata?: boolean;
      expiresIn?: number; // hours
    } = {}
  ): ShareableState {
    try {
      const encoded = this.encodeState(state);
      const searchParams = new URLSearchParams();
      
      searchParams.set('state', encoded);
      if (options.includeMetadata && state.metadata?.title) {
        searchParams.set('title', state.metadata.title);
      }
      
      const url = `${baseUrl}?${searchParams.toString()}`;
      const id = this.generateStateId(state);
      
      const shareableState: ShareableState = {
        id,
        url,
        isPublic: true
      };

      if (options.expiresIn) {
        shareableState.expiresAt = new Date(Date.now() + options.expiresIn * 60 * 60 * 1000);
      }

      return shareableState;
    } catch (error) {
      console.error('Failed to create shareable URL:', error);
      throw new Error('Failed to create shareable URL');
    }
  }

  /**
   * Generate QR code data URL for sharing
   */
  static async generateQRCode(url: string): Promise<string> {
    // This would integrate with a QR code library like qrcode
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <text x="100" y="100" text-anchor="middle" font-family="Arial" font-size="12">
          QR Code for: ${url.substring(0, 20)}...
        </text>
      </svg>
    `)}`;
  }

  // Private helper methods
  private static compressState(state: CalculatorState): any {
    // Basic compression: remove redundant data, use shorter keys
    return {
      d: state.data,
      p: state.precision,
      c: state.context.charAt(0), // 's', 'r', 't'
      s: state.showSteps,
      a: state.showAdvancedStats,
      t: state.timestamp,
      v: state.version,
      ...(state.metadata && { m: this.compressMetadata(state.metadata) })
    };
  }

  private static decompressState(compressed: any): CalculatorState {
    const contextMap: Record<string, 'student' | 'research' | 'teacher'> = {
      's': 'student',
      'r': 'research',
      't': 'teacher'
    };

    return {
      data: compressed.d || [],
      precision: compressed.p || 2,
      context: contextMap[compressed.c] || 'student',
      showSteps: compressed.s || false,
      showAdvancedStats: compressed.a || false,
      timestamp: compressed.t || Date.now(),
      version: compressed.v || this.VERSION,
      ...(compressed.m && { metadata: this.decompressMetadata(compressed.m) })
    };
  }

  private static compressMetadata(metadata: CalculatorState['metadata']): any {
    if (!metadata) return undefined;
    return {
      ...(metadata.title && { t: metadata.title }),
      ...(metadata.description && { d: metadata.description }),
      ...(metadata.tags && { g: metadata.tags }),
      ...(metadata.author && { a: metadata.author })
    };
  }

  private static decompressMetadata(compressed: any): CalculatorState['metadata'] {
    return {
      ...(compressed.t && { title: compressed.t }),
      ...(compressed.d && { description: compressed.d }),
      ...(compressed.g && { tags: compressed.g }),
      ...(compressed.a && { author: compressed.a })
    };
  }

  private static generateStateId(state: CalculatorState): string {
    const hash = this.simpleHash(JSON.stringify(state));
    return hash.toString(36).substring(0, 8);
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
 * React hook for URL state management
 */
export function useURLState() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<CalculatorState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load state from URL on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      setError(null);

      const encodedState = searchParams.get('state');
      if (encodedState) {
        const decodedState = URLStateManager.decodeState(encodedState);
        
        if (URLStateManager.validateState(decodedState)) {
          setState(decodedState);
        } else {
          throw new Error('Invalid state format');
        }
      } else {
        // Default state
        setState({
          data: [],
          precision: 4,
          context: 'research',
          showSteps: true,
          showAdvancedStats: true,
          timestamp: Date.now(),
          version: '1.0'
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load state');
      // Set default state on error
      setState({
        data: [],
        precision: 4,
        context: 'research',
        showSteps: true,
        showAdvancedStats: true,
        timestamp: Date.now(),
        version: '1.0'
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Update URL when state changes
  const updateState = useCallback((newState: Partial<CalculatorState>) => {
    if (!state) return;

    const updatedState = {
      ...state,
      ...newState,
      timestamp: Date.now()
    };

    try {
      const encoded = URLStateManager.encodeState(updatedState);
      const params = new URLSearchParams(searchParams);
      params.set('state', encoded);

      // Update URL without navigation
      router.replace(`${pathname}?${params.toString()}` as any);
      setState(updatedState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update state');
    }
  }, [state, searchParams, router, pathname]);

  // Clear state and URL parameters
  const clearState = useCallback(() => {
    const defaultState: CalculatorState = {
      data: [],
      precision: 4,
      context: 'research',
      showSteps: true,
      showAdvancedStats: true,
      timestamp: Date.now(),
      version: '1.0'
    };

    setState(defaultState);
    router.replace(pathname as any);
  }, [router, pathname]);

  // Create shareable URL
  const createShareableUrl = useCallback((options: {
    includeMetadata?: boolean;
    expiresIn?: number;
  } = {}) => {
    if (!state) return null;

    const baseUrl = typeof window !== 'undefined' 
      ? `${window.location.origin}${pathname}`
      : '';

    return URLStateManager.createShareableUrl(state, baseUrl, options);
  }, [state, pathname]);

  // Generate QR code for current state
  const generateQRCode = useCallback(async () => {
    const shareableUrl = createShareableUrl();
    if (!shareableUrl) return null;

    return URLStateManager.generateQRCode(shareableUrl.url);
  }, [createShareableUrl]);

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

/**
 * Utility functions for working with shared states
 */
export class SharedStateManager {
  private static readonly STORAGE_KEY = 'statcal_shared_states';

  /**
   * Save shared state locally
   */
  static saveSharedState(shareableState: ShareableState): void {
    if (typeof window === 'undefined') return;

    try {
      const existing = this.getSharedStates();
      const updated = [
        shareableState,
        ...existing.filter(s => s.id !== shareableState.id)
      ].slice(0, 50); // Keep only last 50 states

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save shared state:', error);
    }
  }

  /**
   * Get all saved shared states
   */
  static getSharedStates(): ShareableState[] {
    if (typeof window === 'undefined') return [];

    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Failed to load shared states:', error);
      return [];
    }
  }

  /**
   * Delete expired shared states
   */
  static cleanupExpiredStates(): void {
    const states = this.getSharedStates();
    const now = new Date();
    
    const active = states.filter(state => 
      !state.expiresAt || new Date(state.expiresAt) > now
    );

    if (active.length !== states.length) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(active));
      }
    }
  }

  /**
   * Get state by ID
   */
  static getSharedState(id: string): ShareableState | null {
    const states = this.getSharedStates();
    return states.find(state => state.id === id) || null;
  }

  /**
   * Delete shared state
   */
  static deleteSharedState(id: string): void {
    const states = this.getSharedStates();
    const filtered = states.filter(state => state.id !== id);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }
  }
}

export default URLStateManager;