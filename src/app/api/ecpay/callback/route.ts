import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateCheckMacValue } from '@/lib/ecpay'

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
      const totalAmount: number = order.totalAmount ?? 0
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

      // Award loyalty points to customer (if order is linked to a customer account)
      if (customerId) {
        const customerResult = await payload.findByID({
          collection: 'customers',
          id: customerId,
          overrideAccess: true,
        })
        const customer = customerResult as any
        const currentPoints: number = customer.points ?? 0
        const currentTotalSpent: number = customer.totalSpent ?? 0
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
