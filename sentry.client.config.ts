import * as Sentry from '@sentry/nextjs'

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || ''

Sentry.init({
  dsn: dsn || undefined,
  enabled: process.env.NODE_ENV === 'production' && !!dsn,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.0),
  replaysSessionSampleRate: Number(process.env.SENTRY_REPLAYS_SAMPLE_RATE || 0.0),
})

