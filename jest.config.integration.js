/**
 * Jest configuration for integration tests
 * Optimized for comprehensive testing of component interactions
 */

const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Test environment setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  
  // Test file patterns for integration tests
  testMatch: [
    '<rootDir>/src/__tests__/integration/**/*.test.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/__tests__/integration/**/*.{js,jsx,ts,tsx}'
  ],
  
  // Module path mapping
  moduleNameMap: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1'
  },

  // Test timeout for integration tests (longer than unit tests)
  testTimeout: 30000,

  // Coverage configuration for integration tests
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**'
  ],
  
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 75,
      statements: 75
    },
    // Specific thresholds for critical integration paths
    'src/lib/calculation-cache-integration.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/lib/optimized-calculations.ts': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    },
    'src/app/calculator/mean/page.tsx': {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // Performance and memory settings
  maxWorkers: '50%',
  workerIdleMemoryLimit: '512MB',
  
  // Reporter configuration
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results/integration',
        outputName: 'integration-results.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true
      }
    ],
    [
      'jest-html-reporters',
      {
        publicPath: 'test-results/integration',
        filename: 'integration-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Integration Test Report'
      }
    ]
  ],

  // Global setup and teardown
  globalSetup: '<rootDir>/jest.global-setup.js',
  globalTeardown: '<rootDir>/jest.global-teardown.js',

  // Mock configuration
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
  },

  // Handle static assets and CSS
  moduleNameMap: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },

  // Environment variables for tests
  setupFiles: ['<rootDir>/jest.env.js'],

  // Verbose output for debugging
  verbose: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Cache configuration
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',

  // Watch mode configuration
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)