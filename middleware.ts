import { NextRequest, NextResponse } from 'next/server'

// Explicitly use Node.js runtime instead of edge
export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
  runtime: 'nodejs',
}

export function middleware(request: NextRequest) {
  // Simple pass-through middleware to ensure Node.js runtime
  return NextResponse.next()
}