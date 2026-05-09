import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

/**
 * Applies a standard set of security headers to the given response.
 * HSTS is added unconditionally (harmless in dev, required in prod).
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains',
  )
  return response
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip admin, api, static assets — but still apply security headers
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Maintenance mode is checked in (frontend)/[locale]/layout.tsx via
  // Payload local API — far more reliable than an HTTP fetch from Edge middleware.

  return applySecurityHeaders(intlMiddleware(req) as NextResponse)
}

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
