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

    const payload = await getPayload({ config: configPromise })

    // 結帳前驗證庫存
    for (const item of items) {
      try {
        const result = await payload.find({
          collection: 'products',
          where: { slug: { equals: item.id } },
          limit: 1,
          overrideAccess: true,
        })
        const product = result.docs[0] as any
        if (!product) continue
        if (!product.isAvailable) {
          return NextResponse.json(
            { error: `「${item.name}」目前無法購買` },
            { status: 400 },
          )
        }
        if (product.trackStock && (product.stock ?? 0) < item.quantity) {
          const left = product.stock ?? 0
          return NextResponse.json(
            { error: left === 0 ? `「${item.name}」已售完` : `「${item.name}」庫存不足（剩 ${left} 件）` },
            { status: 400 },
          )
        }
      } catch {
        // 查詢失敗不阻擋結帳
      }
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const shippingFee = 120 // 黑貓宅急便冷凍宅配固定運費
    const totalAmount = Math.max(1, subtotal + shippingFee - couponDiscount - pointsRedeemed)
    const orderNumber = generateOrderNumber()

    // Create order in Payload
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        status: 'pending_payment',
        fulfillmentStatus: 'unfulfilled',
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
        shippingFee,
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
