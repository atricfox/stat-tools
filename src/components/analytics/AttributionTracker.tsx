"use client";

import { useEffect, useRef } from 'react';
import { applyUtmToUserProperties, loadUtm, maybeFireUtmSessionStart, parseUtmFromLocation, saveUtm } from '@/lib/analytics/utm';

/**
 * Client-only component that
 * - captures UTM params/gclid from URL
 * - persists them to storage
 * - sets GA4 user_properties for downstream events
 * - fires a single utm_session_start event per session
 */
export default function AttributionTracker() {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const current = parseUtmFromLocation();
    if (current) {
      saveUtm(current);
      applyUtmToUserProperties(current);
      maybeFireUtmSessionStart(current);
      // Push to dataLayer for GTM-based setups
      try {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({
          event: 'utm_context',
          ...current,
        });
      } catch {}
      return;
    }
    const existing = loadUtm();
    if (existing) {
      // Re-apply on new tabs
      applyUtmToUserProperties(existing);
      try {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).dataLayer.push({ event: 'utm_context', ...existing });
      } catch {}
    }
  }, []);

  return null;
}
