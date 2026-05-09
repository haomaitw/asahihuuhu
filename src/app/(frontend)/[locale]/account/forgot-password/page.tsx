'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { BrandMark } from '@/components/BrandMark'

export default function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = use(params)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

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
          <p className="font-sans font-light text-2xl tracking-[0.3em] text-ink mb-2">朝日夫婦</p>
          <p className="text-sm text-ink/50 tracking-wide">重設密碼</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm border border-paper-200 rounded-2xl p-8 shadow-sm">
          <BrandMark variant="black" className="h-8 mb-6 mx-auto" />
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-sea-50 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sea-400">
                  <path d="M22 16.5a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 16.5v-9A2.5 2.5 0 014.5 5h15A2.5 2.5 0 0122 7.5v9z" />
                  <polyline points="2,7 12,13 22,7" />
                </svg>
              </div>
              <h2 className="font-sans font-light text-lg text-ink">確認信已寄出</h2>
              <p className="text-sm text-ink/60 leading-relaxed">
                若您的 Email 已在系統中登錄，您將收到一封包含重設密碼連結的郵件，請在 1 小時內完成重設。
              </p>
              <Link
                href={`/${locale}/account/login`}
                className="inline-block text-sm text-sea-500 hover:text-sea-400 mt-2"
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
                  className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50 transition-colors"
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
                className="w-full btn-primary disabled:opacity-50 py-3.5 text-sm tracking-widest"
              >
                {loading ? '發送中…' : '發送重設信'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-ink/50 mt-6">
          <Link href={`/${locale}/account/login`} className="text-sea-500 hover:text-sea-400">
            ← 返回登入
          </Link>
        </p>
      </div>
    </main>
  )
}
