import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createHmac } from 'crypto'

// Mock worker implementation
const worker = {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url)
    if (url.pathname === '/generate') {
      const body = await request.json()
      const key = body.key || `export-${Date.now()}.csv`
      const content = body.content || 'a,b,c\\n1,2,3'

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

describe('Signed URL Worker', () => {
  let mockEnv: any
  let mockBucket: any

  beforeEach(() => {
    // Mock R2 bucket
    mockBucket = {
      put: vi.fn(),
      get: vi.fn()
    }

    mockEnv = {
      EXPORT_BUCKET: mockBucket,
      SIGN_SECRET: 'test-secret-key'
    }

    // Reset mocks
    vi.clearAllMocks()
  })

  describe('POST /generate', () => {
    it('should generate signed URL with default values', async () => {
      const request = new Request('https://example.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      })

      const response = await worker.fetch(request, mockEnv)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.url).toMatch(/https:\/\/example\.com\/download\/export-\d+\.csv\?expires=\d+&token=[a-f0-9]+/)
      expect(mockBucket.put).toHaveBeenCalledWith(expect.stringMatching(/export-\d+\.csv/), 'a,b,c\\n1,2,3')
    })

    it('should generate signed URL with custom key and content', async () => {
      const testKey = 'custom-export.csv'
      const testContent = 'name,age\\nJohn,30'

      const request = new Request('https://example.com/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: testKey,
          content: testContent
        })
      })

      const response = await worker.fetch(request, mockEnv)
      const result = await response.json()

      expect(response.status).toBe(200)
      expect(result.url).toContain(`/download/${testKey}`)
      expect(mockBucket.put).toHaveBeenCalledWith(testKey, testContent)
    })
  })

  describe('GET /download', () => {
    it('should return 400 for missing parameters', async () => {
      const request = new Request('https://example.com/download/test.csv')
      const response = await worker.fetch(request, mockEnv)

      expect(response.status).toBe(400)
      expect(await response.text()).toBe('missing params')
    })

    it('should return 403 for expired token', async () => {
      const expiredTime = Date.now() - 1000 // 1 second ago
      const request = new Request(`https://example.com/download/test.csv?expires=${expiredTime}&token=invalid`)
      
      const response = await worker.fetch(request, mockEnv)

      expect(response.status).toBe(403)
      expect(await response.text()).toBe('expired')
    })

    it('should return 403 for invalid token', async () => {
      const futureTime = Date.now() + 1000000
      const request = new Request(`https://example.com/download/test.csv?expires=${futureTime}&token=invalid`)
      
      const response = await worker.fetch(request, mockEnv)

      expect(response.status).toBe(403)
      expect(await response.text()).toBe('invalid token')
    })

    it('should return 404 for non-existent file', async () => {
      const key = 'test.csv'
      const expires = Date.now() + 1000000
      
      // Generate valid token
      const hmac = createHmac('sha256', 'test-secret-key')
      hmac.update(`${key}:${expires}`)
      const token = hmac.digest('hex')

      // Mock bucket.get to return null (file not found)
      mockBucket.get.mockResolvedValue(null)

      const request = new Request(`https://example.com/download/${key}?expires=${expires}&token=${token}`)
      const response = await worker.fetch(request, mockEnv)

      expect(response.status).toBe(404)
      expect(await response.text()).toBe('not found')
    })

    it('should return file content for valid token', async () => {
      const key = 'test.csv'
      const expires = Date.now() + 1000000
      const testContent = 'name,age\\nAlice,25'
      
      // Generate valid token
      const hmac = createHmac('sha256', 'test-secret-key')
      hmac.update(`${key}:${expires}`)
      const token = hmac.digest('hex')

      // Mock bucket.get to return file content
      mockBucket.get.mockResolvedValue({
        text: () => Promise.resolve(testContent)
      })

      const request = new Request(`https://example.com/download/${key}?expires=${expires}&token=${token}`)
      const response = await worker.fetch(request, mockEnv)

      expect(response.status).toBe(200)
      expect(response.headers.get('Content-Type')).toBe('text/csv')
      expect(await response.text()).toBe(testContent)
    })
  })

  describe('Default route', () => {
    it('should return OK for other paths', async () => {
      const request = new Request('https://example.com/health')
      const response = await worker.fetch(request, mockEnv)

      expect(response.status).toBe(200)
      expect(await response.text()).toBe('OK')
    })
  })
})