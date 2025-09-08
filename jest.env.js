/**
 * Environment configuration for Jest tests
 * Sets up test-specific environment variables and global mocks
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_ENV = 'test';

// Mock Web APIs not available in Node.js test environment
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => [])
};

// Mock requestIdleCallback
global.requestIdleCallback = global.requestIdleCallback || function(cb) {
  return setTimeout(cb, 0);
};

global.cancelIdleCallback = global.cancelIdleCallback || function(id) {
  return clearTimeout(id);
};

// Mock ResizeObserver
global.ResizeObserver = global.ResizeObserver || class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = global.IntersectionObserver || class {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Blob constructor for cache size estimation
global.Blob = global.Blob || class {
  constructor(data) {
    this.size = JSON.stringify(data).length;
    this.type = 'application/json';
  }
};

// Mock crypto.getRandomValues for any random operations
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: arr => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    }
  }
});

// Suppress console warnings in tests unless explicitly testing them
const originalWarn = console.warn;
const originalError = console.error;

console.warn = jest.fn((message) => {
  // Allow specific warnings we want to test
  if (message.includes('test-expected-warning')) {
    originalWarn(message);
  }
});

console.error = jest.fn((message) => {
  // Allow specific errors we want to test
  if (message.includes('test-expected-error')) {
    originalError(message);
  }
});

// Global test utilities
global.testUtils = {
  // Utility to wait for async operations
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Utility to create test data
  createTestDataset: (size = 10, base = 0) => 
    Array.from({ length: size }, (_, i) => base + i + Math.random()),
  
  // Utility to mock component props
  createMockProps: (overrides = {}) => ({
    data: [10, 20, 30, 40, 50],
    precision: 2,
    userContext: 'student',
    onDataChange: jest.fn(),
    onContextChange: jest.fn(),
    ...overrides
  }),
  
  // Utility to simulate user interactions
  simulateUserActions: {
    typeInInput: async (element, value, userEvent) => {
      await userEvent.clear(element);
      await userEvent.type(element, value);
    },
    selectOption: async (select, value, userEvent) => {
      await userEvent.selectOptions(select, value);
    },
    clickButton: async (button, userEvent) => {
      await userEvent.click(button);
    }
  }
};