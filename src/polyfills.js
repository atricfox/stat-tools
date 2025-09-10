// Global polyfills for Node.js environment compatibility
// This fixes the "self is not defined" error in server-side rendering

if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}