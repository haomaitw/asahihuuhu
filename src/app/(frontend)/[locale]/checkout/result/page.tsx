import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import { adminDb } from '@/lib/firebase/admin'
import { ResultProcessing } from './ResultProcessing'

export const dynamic = 'force-dynamic'

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

  // orderNumber is embedded in the URL query string by buildEcpayForm so it
  // survives ECPay's POST redirect. RtnCode from POST body is NOT available here.
  const orderNumber = sp['orderNumber'] ?? sp['MerchantTradeNo'] ?? ''

  // Fetch order from DB (the server-side ReturnURL callback updates status first)
  let order: any = null
  if (orderNumber) {
    try {
      const snap = await adminDb.collection('orders').where('orderNumber', '==', orderNumber).limit(1).get()
      order = snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
    } catch {}
  }

  const status: 'paid' | 'failed' | 'pending' =
    order?.status === 'paid'
      ? 'paid'
      : order?.status === 'failed'
        ? 'failed'
        : 'pending'

  // "pending" means the order exists but payment callback hasn't arrived yet —
  // the client component will auto-refresh every 2 s for up to 30 s.
  if (status === 'pending') {
    return (
      <section className="bg-paper-50 min-h-dvh flex items-center justify-center py-24 px-4">
        <ResultProcessing orderNumber={orderNumber} locale={locale} />
      </section>
    )
  }

  if (status === 'paid') {
    return (
      <section className="bg-paper-50 min-h-dvh flex items-center justify-center py-24 px-4">
        <div className="text-center space-y-6 max-w-md w-full">
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
              {(order.shippingFee ?? 0) > 0 && (
                <div className="flex justify-between text-sm text-ink/50">
                  <span>運費（黑貓冷凍宅配）</span>
                  <span>NT${(order.shippingFee).toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-sand-100 pt-3 flex justify-between font-serif text-base">
                <span>實付金額</span>
                <span>NT${(order.totalAmount ?? 0).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link
              href={`/${locale}/track?order=${encodeURIComponent(orderNumber)}`}
              className="bg-brand-700 hover:bg-brand-800 text-white font-serif tracking-widest py-3.5 rounded-xl transition-colors text-sm block"
            >
              查看訂單狀態
            </Link>
            <Link
              href={`/${locale}/shop`}
              className="border border-sand-200 hover:border-brand-300 text-ink/70 py-3.5 rounded-xl transition-colors text-sm block"
            >
              🍧 繼續選購
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // failed / unknown
  return (
    <section className="bg-paper-50 min-h-dvh flex items-center justify-center py-24 px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="w-20 h-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center text-4xl">
          ⚠️
        </div>
        <h1 className="font-serif text-2xl tracking-wide text-ink">{t('failed')}</h1>
        <p className="text-sm text-ink/60">{t('failedMessage')}</p>
        {orderNumber && (
          <p className="text-xs text-ink/40 font-mono">{orderNumber}</p>
        )}
        <div className="flex flex-col gap-3">
          <Link
            href={`/${locale}/shop`}
            className="bg-brand-700 hover:bg-brand-800 text-white font-serif tracking-widest py-3.5 rounded-xl transition-colors text-sm block"
          >
            {t('backToShop')}
          </Link>
          <Link
            href={`/${locale}/track`}
            className="border border-sand-200 hover:border-brand-300 text-ink/70 py-3.5 rounded-xl transition-colors text-sm block"
          >
            查詢訂單狀態
          </Link>
        </div>
      </div>
    </section>
  )
}
