import { NextResponse, type NextRequest } from 'next/server'

function genNonce() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  let str = ''
  for (let i = 0; i < arr.length; i++) str += String.fromCharCode(arr[i])
  // base64 encode
  return btoa(str)
}

function buildCsp(nonce: string) {
  const directives = [
    "default-src 'self'",
    // allow only nonce-based scripts; staging may switch to Report-Only first
    `script-src 'self' 'nonce-${nonce}'`,
    // Tailwind and Next style tags require inline styles unless hashed
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]
  return directives.join('; ')
}

export function middleware(req: NextRequest) {
  const nonce = genNonce()
  const url = req.nextUrl
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'production'
  const isStaging = /staging|preview|development/i.test(env)

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-csp-nonce', nonce)

  const res = NextResponse.next({ request: { headers: requestHeaders } })

  const csp = buildCsp(nonce)
  const cspHeaderKey = isStaging ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy'
  res.headers.set(cspHeaderKey, csp)

  // baseline security headers
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  return res
}

export const config = {
  matcher: [
    // apply to all paths except static assets and api routes can still use it
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

