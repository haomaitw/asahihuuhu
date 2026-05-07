import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
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
      shippingAddress?: {
        zip?: string
        city?: string
        district?: string
        address?: string
      }
      couponCode?: string
      couponDiscount?: number
      pointsRedeemed?: number
      customerId?: string
    }

    const {
      items, locale, customerName, customerEmail, customerPhone,
      shippingAddress, couponCode, couponDiscount = 0,
      pointsRedeemed = 0, customerId,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: '購物車是空的' }, { status: 400 })
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const totalAmount = Math.max(1, subtotal - couponDiscount - pointsRedeemed)
    const orderNumber = generateOrderNumber()

    const payload = await getPayload({ config: configPromise })

    // Create order in Payload
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        status: 'pending_payment',
        fulfillmentStatus: 'pending',
        customerName,
        customerEmail,
        customerPhone,
        ...(customerId ? { customer: customerId } : {}),
        shippingAddress: shippingAddress ?? {},
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        subtotal,
        shippingFee: 0,
        couponCode: couponCode ?? '',
        couponDiscount,
        pointsRedeemed,
        totalAmount,
      },
    })

    // If coupon used, increment its usage count
    if (couponCode) {
      const couponResult = await payload.find({
        collection: 'coupons',
        where: { code: { equals: couponCode.toUpperCase() } },
        limit: 1,
        overrideAccess: true,
      })
      if (couponResult.docs[0]) {
        const coupon = couponResult.docs[0] as any
        await payload.update({
          collection: 'coupons',
          id: coupon.id,
          data: { currentUses: (coupon.currentUses ?? 0) + 1 },
          overrideAccess: true,
        })
      }
    }

    const { url, fields } = buildEcpayForm(items, orderNumber, locale, totalAmount)
    return NextResponse.json({ url, fields, orderNumber })
  } catch (err) {
    console.error('[ecpay/checkout]', err)
    return NextResponse.json({ error: '建立訂單失敗，請稍後再試' }, { status: 500 })
  }
}
