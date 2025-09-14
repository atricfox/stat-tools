// Lightweight GA4 wrapper with safe no-ops
// Uses window.gtag if available

export type GAEventParams = Record<string, any>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    __statcal?: {
      utm?: Record<string, string> | null;
      utmSessionStarted?: boolean;
    };
  }
}

export function gtag(...args: any[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

export function setUserProperties(props: Record<string, string | undefined>) {
  const sanitized: Record<string, string> = {};
  Object.entries(props).forEach(([k, v]) => {
    if (typeof v === 'string' && v.length > 0) sanitized[k] = v;
  });
  if (Object.keys(sanitized).length > 0) {
    gtag('set', 'user_properties', sanitized);
  }
}

export function trackEvent(eventName: string, params: GAEventParams = {}) {
  // Attach UTM context if present as event parameters for session-scoped analysis
  const utm = (typeof window !== 'undefined' && window.__statcal?.utm) || null;
  const merged = utm ? { ...params, ...utm } : params;
  gtag('event', eventName, merged);
}

