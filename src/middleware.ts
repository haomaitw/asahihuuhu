import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(req: NextRequest) {
  // Skip admin, api, static assets
  const { pathname } = req.nextUrl
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next')
  ) {
    return NextResponse.next()
  }

  // Check maintenance mode (fetch from Payload API — use internal URL)
  try {
    const base =
      process.env.NEXT_PUBLIC_SERVER_URL ??
      `http://localhost:${process.env.PORT ?? 3000}`
    const res = await fetch(`${base}/api/globals/site-settings?depth=0`, {
      next: { revalidate: 30 },
    })
    if (res.ok) {
      const data = await res.json()
      if (data?.maintenanceMode?.enabled === true) {
        // Allow /maintenance path through so it renders
        if (!pathname.includes('/maintenance')) {
          const url = req.nextUrl.clone()
          url.pathname = '/maintenance'
          return NextResponse.rewrite(url)
        }
      }
    }
  } catch {
    // If the fetch fails (e.g. cold start), continue normally
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!admin|api|_next|_vercel|.*\\..*).*)'],
}
