// Global polyfills for Next.js 15 edge-runtime compatibility
// This fixes the "self is not defined" error in server-side rendering

// Polyfill for 'self' in Node.js environment
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

// For environments where 'self' is accessed via variable
if (typeof self === 'undefined') {
  if (typeof global !== 'undefined') {
    global.self = global;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.self = globalThis;
  }
}