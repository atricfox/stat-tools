/**
 * Focus trap component for modals and overlays
 */

'use client';

import { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
  initialFocus?: string;
  onEscape?: () => void;
}

export default function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  initialFocus,
  onEscape,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (!active || !containerRef.current) return;
    
    // Store previous focus
    if (returnFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
    
    // Set initial focus
    const container = containerRef.current;
    const initialElement = initialFocus
      ? container.querySelector<HTMLElement>(initialFocus)
      : getFirstFocusable(container);
    
    initialElement?.focus();
    
    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }
      
      if (e.key !== 'Tab') return;
      
      const focusables = getFocusableElements(container);
      if (focusables.length === 0) return;
      
      const firstFocusable = focusables[0];
      const lastFocusable = focusables[focusables.length - 1];
      
      if (e.shiftKey) {
        // Shift+Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Restore focus
      if (returnFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [active, returnFocus, initialFocus, onEscape]);
  
  if (!active) {
    return <>{children}</>;
  }
  
  return (
    <div ref={containerRef} data-focus-trap="true">
      {children}
    </div>
  );
}

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');
  
  return Array.from(container.querySelectorAll<HTMLElement>(selector));
}

/**
 * Get the first focusable element
 */
function getFirstFocusable(container: HTMLElement): HTMLElement | null {
  const focusables = getFocusableElements(container);
  return focusables[0] || null;
}