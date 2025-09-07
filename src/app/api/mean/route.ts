import { NextRequest } from 'next/server'
import { createRequestContext } from '@/lib/observability'
import * as Sentry from '@sentry/nextjs'

type MeanRequest = {
  numbers?: number[]
  precision?: number
}

export async function POST(req: NextRequest) {
  const ctx = createRequestContext({ path: '/api/mean' })
  const requestId = ctx.requestId
  try {
    const res = await Sentry.startSpan({ name: 'api:mean', attributes: { path: '/api/mean', requestId } }, async () => {
      const body = (await req.json()) as MeanRequest
      const numbers = Array.isArray(body?.numbers) ? body!.numbers!.filter(n => Number.isFinite(n)) : []
      const precision = Number.isFinite(body?.precision as number) ? Math.min(Math.max(Number(body!.precision), 0), 10) : 4

      if (!numbers.length) {
        return new Response(
          JSON.stringify({ error_code: 'INVALID_INPUT', message: 'numbers must be a non-empty array of finite numbers', requestId }),
          { status: 400, headers: { 'content-type': 'application/json', 'x-request-id': requestId } }
        )
      }

      const sum = numbers.reduce((acc, n) => acc + n, 0)
      const mean = sum / numbers.length

      return new Response(
        JSON.stringify({ mean: Number(mean.toFixed(precision)), count: numbers.length, precisionUsed: precision, requestId }),
        { status: 200, headers: { 'content-type': 'application/json', 'x-request-id': requestId } }
      )
    })
    ctx.finish(200)
    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    Sentry.captureException(err, { tags: { requestId, path: '/api/mean' } })
    ctx.finish(500, { error_code: 'SERVER_ERROR' })
    return new Response(
      JSON.stringify({ error_code: 'SERVER_ERROR', message, requestId }),
      { status: 500, headers: { 'content-type': 'application/json', 'x-request-id': requestId } }
    )
  }
}
