import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { generateOrderNumber, buildEcpayForm } from '@/lib/ecpay'
import type { CartItem } from '@/store/cart'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      items: CartItem[]
      locale: string
      customerName: string
      customerEmail: string
      customerPhone: string
      shippingAddress?: { zip?: string; city?: string; district?: string; address?: string }
      couponCode?: string
      couponDiscount?: number
      pointsRedeemed?: number
      note?: string
    }

    const {
      items, locale, customerName, customerEmail, customerPhone,
      shippingAddress, couponCode, couponDiscount = 0, pointsRedeemed = 0, note,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '購物車是空的' }, { status: 400 })
    }

    // Validate stock from Firestore
    for (const item of items) {
      try {
        const snap = await adminDb.collection('products').where('slug', '==', item.id).limit(1).get()
        const product = snap.docs[0]?.data() as any
        if (!product) continue
        if (!product.isAvailable) {
          return NextResponse.json({ error: `「${item.name}」目前無法購買` }, { status: 400 })
        }
        if (product.trackStock && (product.stock ?? 0) < item.quantity) {
          const left = product.stock ?? 0
          return NextResponse.json(
            { error: left === 0 ? `「${item.name}」已售完` : `「${item.name}」庫存不足（剩 ${left} 件）` },
            { status: 400 },
          )
        }
      } catch {
        // Query failure doesn't block checkout
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingFee = 120
    const totalAmount = Math.max(1, subtotal + shippingFee - couponDiscount - pointsRedeemed)
    const orderNumber = generateOrderNumber()
    const now = new Date().toISOString()

    // Create order in Firestore
    await adminDb.collection('orders').add({
      orderNumber,
      status: 'pending_payment',
      fulfillmentStatus: 'unfulfilled',
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: shippingAddress ?? {},
      items: items.map((i) => ({
        productId: i.id,
        productName: i.name,
        quantity: i.quantity,
        unitPrice: i.price,
      })),
      subtotal,
      shippingFee,
      couponCode: couponCode ?? '',
      couponDiscount,
      pointsRedeemed,
      totalAmount,
      note: note ?? '',
      createdAt: now,
      updatedAt: now,
    })

    // Increment coupon usage count
    if (couponCode) {
      const couponSnap = await adminDb.collection('coupons').where('code', '==', couponCode.toUpperCase()).limit(1).get()
      if (!couponSnap.empty) {
        const couponRef = couponSnap.docs[0].ref
        const currentUses = (couponSnap.docs[0].data() as any).currentUses ?? 0
        await couponRef.update({ currentUses: currentUses + 1 })
      }
    }

    const { url, fields } = buildEcpayForm(items, orderNumber, locale, totalAmount)
    return NextResponse.json({ url, fields, orderNumber })
  } catch (err) {
    console.error('[ecpay/checkout]', err)
    return NextResponse.json({ error: '建立訂單失敗，請稍後再試' }, { status: 500 })
  }
}
