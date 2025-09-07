import { NextRequest } from 'next/server'
import { createRequestContext } from '@/lib/observability'
import * as Sentry from '@sentry/nextjs'

type ExportCsvRequest = {
  tool?: string
  params?: Record<string, unknown>
  consent?: boolean
}

export async function POST(req: NextRequest) {
  const ctx = createRequestContext({ path: '/api/export/csv' })
  const requestId = ctx.requestId
  try {
    const res = await Sentry.startSpan({ name: 'api:export:csv', attributes: { path: '/api/export/csv', requestId } }, async () => {
      const body = (await req.json()) as ExportCsvRequest
      if (!body?.tool || typeof body.tool !== 'string') {
        return new Response(
          JSON.stringify({ error_code: 'INVALID_INPUT', message: 'tool is required', requestId }),
          { status: 400, headers: { 'content-type': 'application/json', 'x-request-id': requestId } }
        )
      }

      // In a real implementation, enqueue a background job to generate CSV and upload to R2
      const taskId = crypto.randomUUID()

      return new Response(JSON.stringify({ taskId, status: 'queued', requestId }), {
        status: 202,
        headers: {
          'content-type': 'application/json',
          'x-request-id': requestId,
          // Explicitly prevent caching task creation responses
          'cache-control': 'no-store',
        },
      })
    })
    ctx.finish(202)
    return res
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    Sentry.captureException(err, { tags: { requestId, path: '/api/export/csv' } })
    ctx.finish(500, { error_code: 'SERVER_ERROR' })
    return new Response(
      JSON.stringify({ error_code: 'SERVER_ERROR', message, requestId }),
      { status: 500, headers: { 'content-type': 'application/json', 'x-request-id': requestId } }
    )
  }
}
