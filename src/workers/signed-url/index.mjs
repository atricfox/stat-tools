import { createHmac } from 'crypto'

const encoder = new TextEncoder()

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/generate') {
      const body = await request.json()
      const key = body.key || `export-${Date.now()}.csv`
      const content = body.content || 'a,b,c\n1,2,3'

      // write to R2
      await env.EXPORT_BUCKET.put(key, content)

      // generate simple HMAC token
      const expires = Date.now() + 7 * 24 * 60 * 60 * 1000
      const hmac = createHmac('sha256', env.SIGN_SECRET)
      hmac.update(`${key}:${expires}`)
      const token = hmac.digest('hex')

      const downloadUrl = `${url.origin}/download/${key}?expires=${expires}&token=${token}`
      return new Response(JSON.stringify({ url: downloadUrl }), { status: 200 })
    }

    if (url.pathname.startsWith('/download/')) {
      const key = url.pathname.replace('/download/', '')
      const expires = url.searchParams.get('expires')
      const token = url.searchParams.get('token')
      if (!expires || !token) return new Response('missing params', { status: 400 })
      if (Date.now() > Number(expires)) return new Response('expired', { status: 403 })

      const hmac = createHmac('sha256', env.SIGN_SECRET)
      hmac.update(`${key}:${expires}`)
      const expected = hmac.digest('hex')
      if (expected !== token) return new Response('invalid token', { status: 403 })

      const obj = await env.EXPORT_BUCKET.get(key)
      if (!obj) return new Response('not found', { status: 404 })
      const body = await obj.text()
      return new Response(body, {
        status: 200,
        headers: { 'Content-Type': 'text/csv' }
      })
    }

    return new Response('OK')
  }
}
