import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { locale } = await params
  const sp = await searchParams
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'checkout' })

  const isEcpaySuccess = sp['RtnCode'] === '1'
  const orderNumber = sp['MerchantTradeNo'] ?? sp['orderNumber'] ?? ''

  // Fetch order details from DB
  let order: any = null
  if (orderNumber) {
    try {
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'orders',
        where: { orderNumber: { equals: orderNumber } },
        limit: 1,
        overrideAccess: true,
      })
      order = result.docs[0] ?? null
    } catch {}
  }

  const isPaid = order?.status === 'paid' || isEcpaySuccess

  return (
    <section className="bg-paper-50 min-h-dvh flex items-center justify-center py-24 px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        {isPaid ? (
          <>
            <div className="w-20 h-20 mx-auto bg-green-50 rounded-full flex items-center justify-center text-4xl">
              🌸
            </div>
            <div>
              <h1 className="font-serif text-2xl tracking-wide text-ink mb-2">{t('success')}</h1>
              {orderNumber && <p className="text-sm text-ink/40 font-mono">{orderNumber}</p>}
            </div>

            {order && (
              <div className="bg-white border border-sand-200 rounded-2xl p-5 text-left shadow-sm space-y-3">
                <div className="space-y-1.5">
                  {(order.items ?? []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink/70">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="text-ink">
                        NT${(item.unitPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-sand-100 pt-3 flex justify-between font-serif text-base">
                  <span>實付金額</span>
                  <span>NT${(order.totalAmount ?? 0).toLocaleString()}</span>
                </div>
                {(order.pointsEarned ?? 0) > 0 && (
                  <div className="bg-brand-50 rounded-lg px-4 py-2.5 text-center text-sm text-brand-700 font-medium">
                    ⭐ 本次獲得 {order.pointsEarned} 點！
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}/account/orders`}
                className="bg-brand-700 hover:bg-brand-800 text-white font-serif tracking-widest py-3.5 rounded-xl transition-colors text-sm block"
              >
                查看訂單
              </Link>
              <Link
                href={`/${locale}/shop`}
                className="border border-sand-200 hover:border-brand-300 text-ink/70 py-3.5 rounded-xl transition-colors text-sm block"
              >
                🍧 繼續選購
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-4xl">
              ⚠️
            </div>
            <h1 className="font-serif text-2xl tracking-wide text-ink">{t('failed')}</h1>
            <p className="text-sm text-ink/60">{t('failedMessage')}</p>
            <div className="flex flex-col gap-3">
              <Link
                href={`/${locale}/shop`}
                className="bg-brand-700 hover:bg-brand-800 text-white font-serif tracking-widest py-3.5 rounded-xl transition-colors text-sm block"
              >
                {t('backToShop')}
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
