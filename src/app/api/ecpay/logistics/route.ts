import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { generateCheckMacValue, formatEcpayDate } from '@/lib/ecpay'

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json() as { orderId: string }
    if (!orderId) return NextResponse.json({ error: '缺少 orderId' }, { status: 400 })

    const orderSnap = await adminDb.collection('orders').doc(orderId).get()
    if (!orderSnap.exists) return NextResponse.json({ error: '找不到訂單' }, { status: 404 })
    const order = orderSnap.data() as any

    if (order.status !== 'paid') {
      return NextResponse.json({ error: '訂單尚未付款，無法建立出貨單' }, { status: 400 })
    }

    const settingsSnap = await adminDb.collection('settings').doc('site-settings').get()
    const tcat = (settingsSnap.data() as any)?.tcat ?? {}

    const merchantId = process.env.ECPAY_MERCHANT_ID ?? ''
    const hashKey = process.env.ECPAY_LOGISTICS_HASH_KEY ?? process.env.ECPAY_HASH_KEY ?? ''
    const hashIV = process.env.ECPAY_LOGISTICS_HASH_IV ?? process.env.ECPAY_HASH_IV ?? ''
    const isTest = process.env.ECPAY_IS_TEST === 'true'
    const apiUrl = isTest
      ? 'https://logistics-stage.ecpay.com.tw/Express/Create'
      : 'https://logistics.ecpay.com.tw/Express/Create'

    const merchantTradeNo = (order.orderNumber ?? orderId).replace(/[^A-Za-z0-9]/g, '').slice(0, 20)
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
    let allPayLogisticsID = ''
    let rtnCode = ''
    let rtnMsg = ''

    if (rawText.includes('=')) {
      const parsed = Object.fromEntries(new URLSearchParams(rawText))
      rtnCode = parsed['RtnCode'] ?? ''
      rtnMsg = parsed['RtnMsg'] ?? rawText
      allPayLogisticsID = parsed['AllPayLogisticsID'] ?? ''
    } else {
      const parts = rawText.split('|')
      rtnCode = parts[0]?.trim() ?? ''
      rtnMsg = parts[1]?.trim() ?? rawText
    }

    if (rtnCode !== '1') {
      return NextResponse.json({ error: `黑貓出貨單建立失敗：${rtnMsg || rawText}` }, { status: 400 })
    }

    const tcatOrderNo = allPayLogisticsID || rtnMsg
    await orderSnap.ref.update({ tcatOrderNo, fulfillmentStatus: 'processing', updatedAt: new Date().toISOString() })

    return NextResponse.json({ ok: true, tcatOrderNo, allPayLogisticsID })
  } catch (err) {
    console.error('[ecpay/logistics]', err)
    return NextResponse.json({ error: '建立出貨單失敗，請稍後再試' }, { status: 500 })
  }
}
