import { getTranslations, setRequestLocale } from 'next-intl/server'
import Link from 'next/link'

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

  const isSuccess = sp['RtnCode'] === '1'
  const orderNumber = sp['MerchantTradeNo'] ?? ''

  return (
    <section className="bg-paper-50 min-h-dvh flex items-center justify-center py-24">
      <div className="text-center space-y-6 max-w-md px-6">
        {isSuccess ? (
          <>
            <div className="text-5xl">🌸</div>
            <h1 className="font-serif text-2xl tracking-wide">{t('success')}</h1>
            <p className="text-sm text-ink/50">
              {t('orderNumber')}: {orderNumber}
            </p>
            <p className="text-sm text-ink/60">{t('successMessage')}</p>
          </>
        ) : (
          <>
            <div className="text-5xl">⚠️</div>
            <h1 className="font-serif text-2xl tracking-wide">{t('failed')}</h1>
            <p className="text-sm text-ink/60">{t('failedMessage')}</p>
          </>
        )}
        <Link
          href={`/${locale}/shop`}
          className="btn-primary inline-block px-8 py-3 text-sm tracking-widest"
        >
          {t('backToShop')}
        </Link>
      </div>
    </section>
  )
}
