import { setUserProperties, trackEvent } from './gtag'

export type UtmParams = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  gclid?: string
};

const STORAGE_KEY = 'statcal_utm_attribution_v1';

export function parseUtmFromLocation(search?: string): UtmParams | null {
  if (typeof window === 'undefined') return null;
  const q = typeof search === 'string' ? search : window.location.search;
  const sp = new URLSearchParams(q);
  const params: UtmParams = {
    utm_source: sp.get('utm_source') || undefined,
    utm_medium: sp.get('utm_medium') || undefined,
    utm_campaign: sp.get('utm_campaign') || undefined,
    utm_term: sp.get('utm_term') || undefined,
    utm_content: sp.get('utm_content') || undefined,
    gclid: sp.get('gclid') || undefined,
  };
  // if no meaningful value, return null
  const hasValue = Object.values(params).some(Boolean);
  return hasValue ? params : null;
}

export function loadUtm(): UtmParams | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveUtm(utm: UtmParams) {
  if (typeof window === 'undefined') return;
  const data = JSON.stringify(utm);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, data);
  } catch {}
  try {
    window.localStorage.setItem(STORAGE_KEY, data);
  } catch {}
  if (!window.__statcal) window.__statcal = {};
  window.__statcal.utm = utm as Record<string, string>;
}

export function applyUtmToUserProperties(utm: UtmParams) {
  setUserProperties({
    utm_source: utm.utm_source,
    utm_medium: utm.utm_medium,
    utm_campaign: utm.utm_campaign,
    utm_term: utm.utm_term,
    utm_content: utm.utm_content,
    gclid: utm.gclid,
  });
}

export function maybeFireUtmSessionStart(utm: UtmParams) {
  if (typeof window === 'undefined') return;
  if (!window.__statcal) window.__statcal = {};
  if (window.__statcal.utmSessionStarted) return;
  window.__statcal.utmSessionStarted = true;
  trackEvent('utm_session_start', {
    ...utm,
  });
}

