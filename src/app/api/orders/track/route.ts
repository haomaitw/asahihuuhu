import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const orderNumber = searchParams.get('orderNumber')?.trim()
  const email = searchParams.get('email')?.trim().toLowerCase()

  if (!orderNumber || !email) {
    return NextResponse.json({ error: '請提供訂單編號與電子郵件' }, { status: 400 })
  }

  try {
    const snap = await adminDb
      .collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get()

    if (snap.empty) {
      return NextResponse.json({ error: '找不到符合的訂單' }, { status: 404 })
    }

    const order = snap.docs[0].data() as any

    if ((order.customerEmail ?? '').toLowerCase() !== email) {
      return NextResponse.json({ error: '找不到符合的訂單' }, { status: 404 })
    }

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
            productName: item.productName ?? '商品',
            quantity: item.quantity ?? 1,
            unitPrice: item.unitPrice ?? 0,
          }))
        : [],
    })
  } catch (err: any) {
    console.error('[api/orders/track]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
