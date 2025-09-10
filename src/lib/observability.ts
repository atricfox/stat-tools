export function createRequestContext(init?: { requestId?: string; path?: string }) {
  const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const requestId = init?.requestId || generateId()
  const path = init?.path || ''
  const startedAt = Date.now()

  const log = (level: 'info' | 'error' | 'warn', event: string, extra?: Record<string, unknown>) => {
    // minimal structured log to console; can be redirected to APM later
    // avoid noisy logs in test unless explicitly enabled
    if (process.env.NODE_ENV === 'test') return
    const payload = { level, event, requestId, path, ts: new Date().toISOString(), ...(extra || {}) }
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload))
  }

  const finish = (status: number, extra?: Record<string, unknown>) => {
    const duration_ms = Date.now() - startedAt
    log('info', 'request.finish', { status, duration_ms, ...(extra || {}) })
  }

  return { requestId, log, finish }
}

