import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { CheckoutForm } from './CheckoutForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'checkout' })
  return { title: t('title') }
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return (
    <section className="bg-paper-50 min-h-dvh py-24">
      <div className="container-content max-w-2xl">
        <CheckoutForm locale={locale} />
      </div>
    </section>
  )
}
