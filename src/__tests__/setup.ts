/**
 * Jest setup file for React Testing Library and custom matchers
 * Configures the testing environment for React components
 */

import '@testing-library/jest-dom'
import React from 'react'

// Ensure this file is treated as a module, not a test
export {}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return React.createElement('img', props)
  },
}))


// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve('')),
  },
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Suppress console warnings in tests unless VERBOSE_TESTS is set
if (!process.env.VERBOSE_TESTS) {
  const originalConsoleWarn = console.warn
  console.warn = (...args: any[]) => {
    if (
      args[0]?.includes?.('React does not recognize') ||
      args[0]?.includes?.('Warning: ReactDOM.render') ||
      args[0]?.includes?.('Warning: componentWillReceiveProps')
    ) {
      return
    }
    originalConsoleWarn(...args)
  }
}

// Global test timeout
jest.setTimeout(30000)