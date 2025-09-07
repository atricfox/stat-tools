declare module '@sentry/nextjs' {
  // Minimal ambient types to satisfy TS when package is not installed locally
  export function init(options?: any): void
  export function captureException(error: any, context?: any): void
  export function startSpan<T>(context: any, callback: () => T | Promise<T>): Promise<T>
}

