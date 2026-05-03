import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateCheckMacValue } from '@/lib/ecpay'

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
    const status = rtnCode === '1' ? 'paid' : 'failed'

    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: merchantTradeNo } },
    })
    if (result.docs[0]) {
      await payload.update({
        collection: 'orders',
        id: result.docs[0].id,
        data: { status, ecpayTradeNo },
      })
    }

    return new NextResponse('1|OK', { status: 200 })
  } catch (err) {
    console.error('[ecpay/callback]', err)
    return new NextResponse('0|Error', { status: 200 })
  }
}
