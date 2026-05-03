import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateOrderNumber, buildEcpayForm } from '@/lib/ecpay'
import type { CartItem } from '@/store/cart'

export async function POST(req: NextRequest) {
  try {
    const { items, locale, customerName, customerEmail, customerPhone } = (await req.json()) as {
      items: CartItem[]
      locale: string
      customerName: string
      customerEmail: string
      customerPhone: string
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const orderNumber = generateOrderNumber()
    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

    const payload = await getPayload({ config: configPromise })
    await payload.create({
      collection: 'orders',
      data: {
        orderNumber,
        status: 'pending',
        items: items.map((i) => ({
          productId: i.id,
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
        totalAmount,
        customerName,
        customerEmail,
        customerPhone,
      },
    })

    const { url, fields } = buildEcpayForm(items, orderNumber, locale)
    return NextResponse.json({ url, fields, orderNumber })
  } catch (err) {
    console.error('[ecpay/checkout]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
