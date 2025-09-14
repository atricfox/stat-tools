'use client';

import React, { useEffect } from 'react';

interface AccessibilityUtilsProps {
  children: React.ReactNode;
}

/**
 * Accessibility utilities for legal pages
 * Includes:
 * - Keyboard navigation enhancements
 * - Screen reader announcements
 * - Focus trap management
 * - High contrast detection
 */
export function AccessibilityUtils({ children }: AccessibilityUtilsProps) {
  useEffect(() => {
    // Add keyboard navigation improvements
    const handleKeyDown = (event: KeyboardEvent) => {
      // Enhanced tab navigation for better focus management
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      // Remove keyboard navigation class when using mouse
      document.body.classList.remove('keyboard-navigation');
    };

    // Detect high contrast mode
    const checkHighContrast = () => {
      const testElement = document.createElement('div');
      testElement.style.color = 'rgb(255, 0, 0)';
      testElement.style.position = 'absolute';
      testElement.style.top = '-9999px';
      document.body.appendChild(testElement);

      const computedColor = window.getComputedStyle(testElement).color;
      const isHighContrast = computedColor !== 'rgb(255, 0, 0)';

      document.body.classList.toggle('high-contrast', isHighContrast);
      document.body.removeChild(testElement);
    };

    // Add ARIA live region for announcements
    const createLiveRegion = () => {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'accessibility-announcements';
      document.body.appendChild(liveRegion);

      return liveRegion;
    };

    // Initialize utilities
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    checkHighContrast();
    const liveRegion = createLiveRegion();

    // Check high contrast on theme changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handleContrastChange = () => checkHighContrast();
    mediaQuery.addEventListener('change', handleContrastChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
      mediaQuery.removeEventListener('change', handleContrastChange);
      if (liveRegion.parentNode) {
        liveRegion.parentNode.removeChild(liveRegion);
      }
    };
  }, []);

  return <>{children}</>;
}

/**
 * Hook for making screen reader announcements
 */
export function useScreenReaderAnnouncer() {
  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const liveRegion = document.getElementById('accessibility-announcements');
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;

      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  };

  return { announce };
}

/**
 * Component for accessible modal/dialog behavior
 */
interface FocusTrapProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function FocusTrap({ children, isOpen, onClose }: FocusTrapProps) {
  useEffect(() => {
    if (!isOpen) return;

    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const modal = document.querySelector('[role="dialog"]');

    if (!modal) return;

    const firstFocusableElement = modal.querySelectorAll(focusableElements)[0] as HTMLElement;
    const focusableContent = modal.querySelectorAll(focusableElements);
    const lastFocusableElement = focusableContent[focusableContent.length - 1] as HTMLElement;

    // Focus first element
    if (firstFocusableElement) {
      firstFocusableElement.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // If shift key pressed for shift tab
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus();
            event.preventDefault();
          }
        } else {
          // If tab key is pressed
          if (document.activeElement === lastFocusableElement) {
            firstFocusableElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return <>{children}</>;
}