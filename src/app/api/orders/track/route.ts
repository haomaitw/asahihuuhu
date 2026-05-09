import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

/**
 * GET /api/orders/track?orderNumber=XXX&email=YYY
 *
 * Public endpoint — no auth required.
 * Matches on both orderNumber AND customerEmail to prevent enumeration attacks.
 * Returns only safe, non-sensitive fields.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const orderNumber = searchParams.get('orderNumber')?.trim()
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!orderNumber || !email) {
    return NextResponse.json({ error: '請提供訂單編號與電子郵件' }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config: configPromise })

    const { docs } = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { orderNumber: { equals: orderNumber } },
          { customerEmail: { equals: email } },
        ],
      },
      overrideAccess: true,
      limit: 1,
      depth: 1,
    })

    if (!docs.length) {
      // Always return 404 — never reveal whether the order exists without matching email
      return NextResponse.json({ error: '找不到符合的訂單' }, { status: 404 })
    }

    const order = docs[0] as any

    // Return only safe fields — no full address, no internal IDs
    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      fulfillmentStatus: order.fulfillmentStatus,
      trackingNumber: order.trackingNumber ?? null,
      tcatOrderNo: order.tcatOrderNo ?? null,
      createdAt: order.createdAt,
      shippingCity: order.shippingAddress?.city ?? null,
      shippingDistrict: order.shippingAddress?.district ?? null,
      items: Array.isArray(order.items)
        ? order.items.map((item: any) => ({
            productName: item.productName ?? item.product?.name ?? '商品',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? item.price ?? 0,
          }))
        : [],
    })
  } catch (err: any) {
    console.error('[api/orders/track]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
