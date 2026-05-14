import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateCheckMacValue } from '@/lib/ecpay'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const params: Record<string, string> = {}
    formData.forEach((val, key) => {
      if (key !== 'CheckMacValue') params[key] = String(val)
    })

    const receivedMac = formData.get('CheckMacValue') as string
    const hashKey = process.env.ECPAY_HASH_KEY ?? ''
    const hashIV = process.env.ECPAY_HASH_IV ?? ''
    const expectedMac = generateCheckMacValue(params, hashKey, hashIV)

    if (receivedMac.toUpperCase() !== expectedMac.toUpperCase()) {
      console.error('[ecpay/callback] CheckMacValue mismatch')
      return new NextResponse('0|Error', { status: 200 })
    }

    const rtnCode = params['RtnCode']
    const merchantTradeNo = params['MerchantTradeNo']
    const ecpayTradeNo = params['TradeNo'] ?? ''
    const isPaid = rtnCode === '1'

    const payload = await getPayload({ config: configPromise })

    const result = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: merchantTradeNo } },
      overrideAccess: true,
    })

    const order = result.docs[0] as any
    if (!order) {
      console.error('[ecpay/callback] Order not found:', merchantTradeNo)
      return new NextResponse('0|Error', { status: 200 })
    }

    // Idempotency guard
    if (order.status === 'paid') {
      return new NextResponse('1|OK', { status: 200 })
    }

    if (isPaid) {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'paid',
          ecpayTradeNo,
          paidAt: new Date().toISOString(),
        },
        overrideAccess: true,
      })

      // Decrement stock for each item (only if trackStock === true)
      for (const item of order.items ?? []) {
        if (!item.productId) continue
        try {
          const product = await payload.findByID({
            collection: 'products',
            id: String(item.productId),
            overrideAccess: true,
          }) as any
          if (product?.trackStock) {
            const newStock = Math.max(0, (product.stock ?? 0) - (item.quantity ?? 1))
            await payload.update({
              collection: 'products',
              id: String(item.productId),
              data: { stock: newStock },
              overrideAccess: true,
            })
          }
        } catch (e) {
          console.error('[ecpay/callback] stock decrement failed for product', item.productId, e)
        }
      }

      // Send order confirmation email (non-blocking)
      if (order.customerEmail) {
        sendOrderConfirmation({
          orderNumber: merchantTradeNo,
          customerName: order.customerName ?? '顧客',
          customerEmail: order.customerEmail,
          items: (order.items ?? []).map((i: any) => ({
            productName: i.productName,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          subtotal: order.subtotal ?? order.totalAmount ?? 0,
          shippingFee: order.shippingFee ?? 0,
          totalAmount: order.totalAmount ?? 0,
        }).catch((e) => console.error('[email] order confirmation failed:', e))
      }
    } else {
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: { status: 'failed', ecpayTradeNo },
        overrideAccess: true,
      })
    }

    return new NextResponse('1|OK', { status: 200 })
  } catch (err) {
    console.error('[ecpay/callback]', err)
    return new NextResponse('0|Error', { status: 200 })
  }
}
