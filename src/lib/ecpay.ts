import crypto from 'crypto'
import type { CartItem } from '@/store/cart'

export function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase()
  return `ASH${y}${m}${d}${rand}`
}

export function formatEcpayDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  const s = String(date.getSeconds()).padStart(2, '0')
  return `${y}/${m}/${d} ${h}:${min}:${s}`
}

export function generateCheckMacValue(
  params: Record<string, string>,
  hashKey: string,
  hashIV: string
): string {
  const sorted = Object.keys(params)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join('&')

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`

  let encoded = encodeURIComponent(raw)

  encoded = encoded
    .replace(/%2d/gi, '-')
    .replace(/%5f/gi, '_')
    .replace(/%2e/gi, '.')
    .replace(/%21/gi, '!')
    .replace(/%2a/gi, '*')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')

  const lower = encoded.toLowerCase()
  return crypto.createHash('sha256').update(lower).digest('hex').toUpperCase()
}

export function buildEcpayForm(
  cartItems: CartItem[],
  orderNumber: string,
  locale: string,
  overrideTotal?: number
): { url: string; fields: Record<string, string> } {
  const merchantId = process.env.ECPAY_MERCHANT_ID ?? ''
  const hashKey = process.env.ECPAY_HASH_KEY ?? ''
  const hashIV = process.env.ECPAY_HASH_IV ?? ''
  const isTest = process.env.ECPAY_IS_TEST === 'true'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const url = isTest
    ? 'https://payment-stage.ecpay.com.tw/Checkout/AioCheckout'
    : 'https://payment.ecpay.com.tw/Checkout/AioCheckout'

  const totalAmount = overrideTotal ?? cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const itemName = cartItems.map((i) => `${i.name} x${i.quantity}`).join('#')
  const tradeDate = formatEcpayDate(new Date())

  const params: Record<string, string> = {
    MerchantID: merchantId,
    MerchantTradeNo: orderNumber,
    MerchantTradeDate: tradeDate,
    PaymentType: 'aio',
    TotalAmount: String(totalAmount),
    TradeDesc: '朝日夫婦商店',
    ItemName: itemName,
    ReturnURL: `${siteUrl}/api/ecpay/callback`,
    OrderResultURL: `${siteUrl}/${locale}/checkout/result`,
    ChoosePayment: 'ALL',
    EncryptType: '1',
  }

  const checkMacValue = generateCheckMacValue(params, hashKey, hashIV)

  return { url, fields: { ...params, CheckMacValue: checkMacValue } }
}
