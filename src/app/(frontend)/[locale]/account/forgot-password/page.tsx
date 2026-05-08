'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('zh-TW')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  if (typeof window !== 'undefined') {
    params.then((p) => setLocale(p.locale)).catch(() => {})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customers/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Payload returns 200 regardless of whether email exists (security measure)
      if (res.ok || res.status === 200) {
        setSent(true)
      } else {
        setError('請求失敗，請稍後再試')
      }
    } catch {
      setError('無法連線，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-paper-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="font-serif text-3xl text-ink tracking-widest mb-2">朝日夫婦</p>
          <p className="text-sm text-ink/50 tracking-wide">重設密碼</p>
        </div>

        <div className="bg-white border border-sand-200 rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">📧</div>
              <h2 className="font-serif text-lg text-ink">確認信已寄出</h2>
              <p className="text-sm text-ink/60 leading-relaxed">
                若您的 Email 已在系統中登錄，您將收到一封包含重設密碼連結的郵件，請在 1 小時內完成重設。
              </p>
              <Link
                href={`/${locale}/account/login`}
                className="inline-block text-sm text-brand-700 hover:underline mt-2"
              >
                返回登入
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-ink/60">
                請輸入您的會員 Email，我們將寄送重設密碼連結。
              </p>
              <div>
                <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">電子郵件</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
                  placeholder="your@email.com"
                />
              </div>
              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-serif tracking-widest py-3.5 rounded-xl transition-colors text-sm"
              >
                {loading ? '發送中…' : '發送重設信'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink/50 mt-6">
          <Link href={`/${locale}/account/login`} className="text-brand-700 hover:underline">
            ← 返回登入
          </Link>
        </p>
      </div>
    </main>
  )
}
