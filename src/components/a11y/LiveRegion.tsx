/**
 * Live region component for screen reader announcements
 */

'use client';

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  type?: 'polite' | 'assertive';
  clearAfter?: number;
}

export default function LiveRegion({ 
  message, 
  type = 'polite',
  clearAfter = 5000 
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!message || !regionRef.current) return;
    
    // Announce the message
    regionRef.current.textContent = message;
    
    // Clear after delay if specified
    if (clearAfter > 0) {
      const timer = setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = '';
        }
      }, clearAfter);
      
      return () => clearTimeout(timer);
    }
  }, [message, clearAfter]);
  
  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

/**
 * Hook for managing live region announcements
 */
export function useLiveAnnounce() {
  const announce = (message: string, type: 'polite' | 'assertive' = 'polite') => {
    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', type);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.textContent = message;
    
    document.body.appendChild(region);
    
    setTimeout(() => {
      document.body.removeChild(region);
    }, 5000);
  };
  
  return { announce };
}