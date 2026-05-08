'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm({ locale }: { locale: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) setError('連結無效或已過期，請重新申請重設密碼')
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('兩次輸入的密碼不一致'); return }
    if (password.length < 8) { setError('密碼至少需要 8 個字元'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setDone(true)
        setTimeout(() => router.push(`/${locale}/account/login`), 2500)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.errors?.[0]?.message ?? '重設失敗，連結可能已過期')
      }
    } catch {
      setError('無法連線，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-sand-200 rounded-2xl p-8 shadow-sm">
      {done ? (
        <div className="text-center space-y-4">
          <div className="text-4xl">✅</div>
          <h2 className="font-serif text-lg text-ink">密碼重設成功！</h2>
          <p className="text-sm text-ink/60">正在為您跳轉至登入頁面…</p>
        </div>
      ) : !token ? (
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-sm text-red-500">{error}</p>
          <Link href={`/${locale}/account/forgot-password`} className="text-sm text-brand-700 hover:underline">
            重新申請重設密碼
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">新密碼</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="至少 8 個字元"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">確認新密碼</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="再次輸入密碼"
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
            {loading ? '重設中…' : '重設密碼'}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('zh-TW')
  if (typeof window !== 'undefined') {
    params.then((p) => setLocale(p.locale)).catch(() => {})
  }

  return (
    <main className="min-h-dvh bg-paper-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="font-serif text-3xl text-ink tracking-widest mb-2">朝日夫婦</p>
          <p className="text-sm text-ink/50 tracking-wide">設定新密碼</p>
        </div>
        <Suspense fallback={<div className="text-center text-ink/40 text-sm">載入中…</div>}>
          <ResetPasswordForm locale={locale} />
        </Suspense>
        <p className="text-center text-sm text-ink/50 mt-6">
          <Link href={`/${locale}/account/login`} className="text-brand-700 hover:underline">
            ← 返回登入
          </Link>
        </p>
      </div>
    </main>
  )
}
