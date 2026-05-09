import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

/**
 * Applies a standard set of security headers to the given response.
 * HSTS is added unconditionally (harmless in dev, required in prod).
 * CSP is intentionally omitted — the Payload + asset stack is too complex
 * for a strict policy without breakage.
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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Skip admin, api, static assets — but still apply security headers
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return applySecurityHeaders(NextResponse.next())
  }

  // Check maintenance mode (fetch from Payload API — always fresh, 2 s timeout)
  try {
    const base =
      process.env.NEXT_PRIVATE_SERVER_URL ??       // internal URL (non-public)
      process.env.NEXT_PUBLIC_SERVER_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`
    const res = await fetch(`${base}/api/globals/site-settings?depth=0`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.maintenanceMode?.enabled === true) {
        // Allow /maintenance path through so it renders
        if (!pathname.includes('/maintenance')) {
          const url = req.nextUrl.clone()
          url.pathname = '/maintenance'
          return applySecurityHeaders(NextResponse.rewrite(url))
        }
      }
    }
  } catch {
    // If the fetch fails (e.g. cold start), continue normally
  }

  return applySecurityHeaders(intlMiddleware(req) as NextResponse)
}

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
