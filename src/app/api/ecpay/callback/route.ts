import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateCheckMacValue } from '@/lib/ecpay'
import { sendOrderConfirmation } from '@/lib/email'

// Points rule: NT$10 spent = 1 point
const POINTS_PER_NT = 10

// Tier thresholds (by totalSpent)
function computeTier(totalSpent: number): string {
  if (totalSpent >= 10000) return 'gold'
  if (totalSpent >= 3000) return 'silver'
  return 'regular'
}

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
    const status = isPaid ? 'paid' : 'failed'

    const payload = await getPayload({ config: configPromise })

    // Find the order
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

    // Already processed — idempotency guard
    if (order.status === 'paid') {
      return new NextResponse('1|OK', { status: 200 })
    }

    if (isPaid) {
      const totalAmount: number = Number(order.totalAmount ?? 0)
      const pointsEarned = Math.floor(totalAmount / POINTS_PER_NT)
      const customerId = typeof order.customer === 'object' ? order.customer?.id : order.customer

      // Update order
      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: 'paid',
          ecpayTradeNo,
          paidAt: new Date().toISOString(),
          pointsEarned,
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

      // Award loyalty points to customer (if order is linked to a customer account)
      if (customerId) {
        const customerResult = await payload.findByID({
          collection: 'customers',
          id: customerId,
          overrideAccess: true,
        })
        const customer = customerResult as any
        const currentPoints: number = Number(customer.points ?? 0)
        const currentTotalSpent: number = Number(customer.totalSpent ?? 0)
        const newTotalSpent = currentTotalSpent + totalAmount
        const newPoints = currentPoints + pointsEarned

        // Update customer points + totalSpent + tier
        await payload.update({
          collection: 'customers',
          id: customerId,
          data: {
            points: newPoints,
            totalSpent: newTotalSpent,
            tier: computeTier(newTotalSpent),
          },
          overrideAccess: true,
        })

        // Record point transaction
        if (pointsEarned > 0) {
          await payload.create({
            collection: 'point-transactions',
            data: {
              customer: customerId,
              order: order.id,
              type: 'earn',
              points: pointsEarned,
              balance: newPoints,
              description: `訂單 ${merchantTradeNo} 消費累點`,
            },
            overrideAccess: true,
          })
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
          couponDiscount: order.couponDiscount ?? 0,
          pointsRedeemed: order.pointsRedeemed ?? 0,
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
