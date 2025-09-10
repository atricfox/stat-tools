export async function GET() {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`
  return new Response('ok', {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-request-id': requestId,
    },
  })
}
