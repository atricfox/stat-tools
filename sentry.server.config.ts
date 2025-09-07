import * as Sentry from '@sentry/nextjs'

const dsn = process.env.SENTRY_DSN || ''

Sentry.init({
  dsn: dsn || undefined,
  enabled: process.env.NODE_ENV === 'production' && !!dsn,
  environment: process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.2),
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE || 0.0),
})

