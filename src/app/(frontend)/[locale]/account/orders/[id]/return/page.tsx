'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

export default function ReturnRequestPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const router = useRouter()
  const { customer, fetchMe } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [orderId, setOrderId] = useState('')
  const [orderNumber, setOrderNumber] = useState('')

  const [type, setType] = useState<'退貨退款' | '換貨'>('退貨退款')
  const [reason, setReason] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    params
      .then((p) => {
        setLocale(p.locale)
        setOrderId(p.id)
      })
      .catch(() => {})
    fetchMe()
  }, [fetchMe, params])

  useEffect(() => {
    if (customer === null) router.push(`/${locale}/account/login`)
    if (!customer || !orderId) return
    fetch(`/api/orders/${orderId}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => setOrderNumber(d.orderNumber ?? ''))
      .catch(() => {})
  }, [customer, locale, orderId, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return
    setSubmitting(true)
    setError('')
    try {
      await fetch(`/api/orders/${orderId}/return`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, reason, bankAccount: bankAccount || undefined }),
      })
      setSubmitted(true)
    } catch {
      setError('送出失敗，請稍後再試')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-lg mx-auto">
        {/* Back link */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href={`/${locale}/account/orders/${orderId}`}
            className="text-ink/40 hover:text-ink text-sm"
          >
            ← 訂單詳情
          </Link>
          <h1 className="font-serif text-2xl text-ink">申請退換貨</h1>
        </div>

        {orderNumber && (
          <p className="text-sm text-ink/50 font-sans font-light mb-6">
            訂單編號：<span className="font-mono text-ink">{orderNumber}</span>
          </p>
        )}

        {submitted ? (
          <div className="bg-white border border-sand-200 rounded-2xl p-8 shadow-sm text-center">
            <p className="text-3xl mb-4">✉️</p>
            <p className="text-ink font-sans font-light leading-relaxed">
              申請已送出，我們將在 3 個工作天內與您聯繫
            </p>
            <Link
              href={`/${locale}/account/orders/${orderId}`}
              className="inline-block mt-6 text-sm text-sea-400 hover:underline"
            >
              返回訂單
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type */}
            <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-ink/60 mb-3 font-sans font-light">申請類型</p>
              <div className="flex gap-6">
                {(['退貨退款', '換貨'] as const).map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={opt}
                      checked={type === opt}
                      onChange={() => setType(opt)}
                      className="accent-sea-400 w-4 h-4"
                    />
                    <span className="text-sm text-ink font-sans font-light">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
              <label className="block text-sm text-ink/60 mb-2 font-sans font-light">
                退換貨原因 <span className="text-red-400">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                rows={4}
                placeholder="請說明退換貨原因…"
                className="w-full resize-none text-sm text-ink font-sans font-light bg-paper-50 border border-sand-200 rounded-xl px-3 py-2.5 outline-none focus:border-sea-400 transition-colors placeholder:text-ink/30"
              />
            </div>

            {/* Bank account — only for refund */}
            {type === '退貨退款' && (
              <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
                <label className="block text-sm text-ink/60 mb-2 font-sans font-light">
                  退款帳號（如需退款請填寫）
                </label>
                <input
                  type="text"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="銀行代碼 + 帳號"
                  className="w-full text-sm text-ink font-sans font-light bg-paper-50 border border-sand-200 rounded-xl px-3 py-2.5 outline-none focus:border-sea-400 transition-colors placeholder:text-ink/30"
                />
              </div>
            )}

            {error && <p className="text-xs text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={submitting || !reason.trim()}
              className="w-full py-3 rounded-2xl bg-sea-400 text-white text-sm font-sans font-light tracking-wide hover:bg-sea-400/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? '送出中…' : '送出申請'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
