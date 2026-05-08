import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * GET /api/orders
 * - Customers: returns their own orders (filtered by customer ID)
 * - Admins: supports ?where[customer][equals]=X&sort=...&limit=N
 */
export async function GET(req: NextRequest) {
  try {
    const headersList = await headers()
    const payload = await getPayload({ config: configPromise })

    let currentUser: any = null
    try {
      const { user } = await payload.auth({ headers: headersList })
      currentUser = user
    } catch {}

    if (!currentUser) {
      return NextResponse.json({ error: '請先登入' }, { status: 401 })
    }

    const sp = req.nextUrl.searchParams
    const sort = (sp.get('sort') ?? '-createdAt') as string
    const limit = Math.min(parseInt(sp.get('limit') ?? '20', 10), 100)

    let where: any = {}
    let overrideAccess = false

    if (currentUser.collection === 'customers') {
      // Customer: always filter to their own orders
      where = { customer: { equals: currentUser.id } }
    } else if (currentUser.collection === 'users') {
      // Admin: build where from query params (Payload-style)
      overrideAccess = true
      // Parse where[field][operator]=value patterns
      sp.forEach((value, key) => {
        if (key.startsWith('where[')) {
          const match = key.match(/^where\[([^\]]+)\]\[([^\]]+)\]$/)
          if (match) {
            const [, field, operator] = match
            where[field] = { [operator]: value }
          }
        }
      })
    } else {
      return NextResponse.json({ error: '無權限' }, { status: 403 })
    }

    const result = await payload.find({
      collection: 'orders',
      where,
      sort,
      limit,
      depth: 0,
      overrideAccess,
    })

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('[api/orders]', err)
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 })
  }
}
