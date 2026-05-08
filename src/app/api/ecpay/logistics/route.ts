import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateCheckMacValue, formatEcpayDate } from '@/lib/ecpay'

// POST /api/ecpay/logistics
// Body: { orderId: number | string }
// Creates a Black Cat (TCAT) home delivery shipment via ECPay Logistics API
// Returns { ok: true, tcatOrderNo, allPayLogisticsID } or { error: string }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { orderId: number | string }
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: '缺少 orderId' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch the order
    const order = await payload.findByID({
      collection: 'orders',
      id: String(orderId),
      overrideAccess: true,
    }) as any

    if (!order) {
      return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: '訂單尚未付款，無法建立出貨單' }, { status: 400 })
    }

    // Fetch site settings for sender info
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      overrideAccess: true,
    }) as any

    const tcat = settings?.tcat ?? {}

    const merchantId = process.env.ECPAY_MERCHANT_ID ?? ''
    const hashKey = process.env.ECPAY_LOGISTICS_HASH_KEY ?? process.env.ECPAY_HASH_KEY ?? ''
    const hashIV = process.env.ECPAY_LOGISTICS_HASH_IV ?? process.env.ECPAY_HASH_IV ?? ''
    const isTest = process.env.ECPAY_IS_TEST === 'true'

    const apiUrl = isTest
      ? 'https://logistics-stage.ecpay.com.tw/Express/Create'
      : 'https://logistics.ecpay.com.tw/Express/Create'

    // MerchantTradeNo: alphanumeric only, max 20 chars
    const merchantTradeNo = (order.orderNumber ?? String(order.id))
      .replace(/[^A-Za-z0-9]/g, '')
      .slice(0, 20)

    const receiverAddress = [
      order.shippingAddress?.city ?? '',
      order.shippingAddress?.district ?? '',
      order.shippingAddress?.address ?? '',
    ].join('')

    const params: Record<string, string> = {
      MerchantID:            merchantId,
      MerchantTradeNo:       merchantTradeNo,
      MerchantTradeDate:     formatEcpayDate(new Date()),
      LogisticsType:         'HOME',
      LogisticsSubType:      'TCAT',
      GoodsAmount:           String(Math.round(order.totalAmount ?? 1)),
      GoodsName:             '朝日夫婦商品',
      SenderName:            tcat.senderName ?? '朝日夫婦',
      SenderPhone:           tcat.senderPhone ?? '',
      SenderZipCode:         tcat.senderZip ?? '251',
      SenderAddress:         tcat.senderAddress ?? '',
      ReceiverName:          order.customerName ?? '',
      ReceiverPhone:         order.customerPhone ?? '',
      ReceiverCellPhone:     order.customerPhone ?? '',
      ReceiverZipCode:       order.shippingAddress?.zip ?? '',
      ReceiverAddress:       receiverAddress,
      Temperature:           tcat.temperature ?? '0003',
      Distance:              tcat.distance ?? '00',
      Specification:         '0001',
      ScheduledPickupTime:   '4',
      ScheduledDeliveryTime: '4',
      IsCollection:          'N',
    }

    const checkMacValue = generateCheckMacValue(params, hashKey, hashIV)
    const formBody = new URLSearchParams({ ...params, CheckMacValue: checkMacValue })

    const ecpayRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formBody.toString(),
    })

    const rawText = await ecpayRes.text()

    // ECPay returns URL-encoded response, e.g.:
    // 1|OK|AllPayLogisticsID=12345&BookingNote=...
    // or 0|error message
    if (!ecpayRes.ok) {
      console.error('[ecpay/logistics] HTTP error:', ecpayRes.status, rawText)
      return NextResponse.json({ error: `ECPay 回應錯誤 (${ecpayRes.status})` }, { status: 502 })
    }

    // Parse the response — ECPay returns plain text
    // Success format: "1|OK" followed by URL-encoded params on the same or next line
    // Full response is URL-encoded: RtnCode=1&RtnMsg=OK&AllPayLogisticsID=...
    let allPayLogisticsID = ''
    let rtnCode = ''
    let rtnMsg = ''

    if (rawText.includes('=')) {
      // URL-encoded key=value response
      const parsed = Object.fromEntries(new URLSearchParams(rawText))
      rtnCode = parsed['RtnCode'] ?? ''
      rtnMsg = parsed['RtnMsg'] ?? rawText
      allPayLogisticsID = parsed['AllPayLogisticsID'] ?? ''
    } else {
      // Plain pipe-delimited: "1|OK" or "0|message"
      const parts = rawText.split('|')
      rtnCode = parts[0]?.trim() ?? ''
      rtnMsg = parts[1]?.trim() ?? rawText
    }

    if (rtnCode !== '1') {
      console.error('[ecpay/logistics] ECPay error:', rtnCode, rtnMsg)
      return NextResponse.json(
        { error: `黑貓出貨單建立失敗：${rtnMsg || rawText}` },
        { status: 400 },
      )
    }

    const tcatOrderNo = allPayLogisticsID || rtnMsg

    // Update order with tcatOrderNo and fulfillmentStatus = 'processing'
    await payload.update({
      collection: 'orders',
      id: String(orderId),
      data: {
        tcatOrderNo,
        fulfillmentStatus: 'processing',
      },
      overrideAccess: true,
    })

    return NextResponse.json({ ok: true, tcatOrderNo, allPayLogisticsID })
  } catch (err) {
    console.error('[ecpay/logistics]', err)
    return NextResponse.json({ error: '建立出貨單失敗，請稍後再試' }, { status: 500 })
  }
}
