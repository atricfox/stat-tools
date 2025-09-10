// Setup global variables for Node.js environment
// This must be loaded before any Next.js code runs

// Set self immediately and definitively
const globalTarget = globalThis || global || {};

if (!globalTarget.self) {
  globalTarget.self = globalTarget;
}

// Also set on the global object directly
if (typeof global !== 'undefined') {
  global.self = globalTarget;
}

// Set on globalThis if it exists
if (typeof globalThis !== 'undefined') {
  globalThis.self = globalTarget;
}