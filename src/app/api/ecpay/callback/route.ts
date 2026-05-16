import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
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
    const now = new Date().toISOString()

    // Find order by orderNumber
    const snap = await adminDb.collection('orders').where('orderNumber', '==', merchantTradeNo).limit(1).get()
    if (snap.empty) {
      console.error('[ecpay/callback] Order not found:', merchantTradeNo)
      return new NextResponse('0|Error', { status: 200 })
    }

    const orderDoc = snap.docs[0]
    const order = { id: orderDoc.id, ...orderDoc.data() } as any

    // Idempotency guard
    if (order.status === 'paid') {
      return new NextResponse('1|OK', { status: 200 })
    }

    if (isPaid) {
      await orderDoc.ref.update({ status: 'paid', ecpayTradeNo, paidAt: now, updatedAt: now })

      // Decrement stock
      for (const item of order.items ?? []) {
        if (!item.productId) continue
        try {
          const productSnap = await adminDb.collection('products').where('slug', '==', item.productId).limit(1).get()
          if (!productSnap.empty) {
            const productDoc = productSnap.docs[0]
            const product = productDoc.data() as any
            if (product?.trackStock) {
              const newStock = Math.max(0, (product.stock ?? 0) - (item.quantity ?? 1))
              await productDoc.ref.update({ stock: newStock, updatedAt: now })
            }
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
      await orderDoc.ref.update({ status: 'failed', ecpayTradeNo, updatedAt: now })
    }

    return new NextResponse('1|OK', { status: 200 })
  } catch (err) {
    console.error('[ecpay/callback]', err)
    return new NextResponse('0|Error', { status: 200 })
  }
}
