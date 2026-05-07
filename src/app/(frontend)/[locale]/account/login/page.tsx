'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

export default function CustomerLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const router = useRouter()
  const { login, isLoading } = useCustomerStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [locale, setLocale] = useState('zh-TW')

  // Extract locale from params
  if (typeof window !== 'undefined') {
    params.then((p) => setLocale(p.locale)).catch(() => {})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if (result.ok) {
      router.push(`/${locale}/account`)
    } else {
      setError(result.error ?? '登入失敗')
    }
  }

  return (
    <main className="min-h-dvh bg-paper-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <p className="font-serif text-3xl text-ink tracking-widest mb-2">朝日夫婦</p>
          <p className="text-sm text-ink/50 tracking-wide">會員登入</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-sand-200 rounded-2xl p-8 space-y-5 shadow-sm"
        >
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
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">密碼</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-50 text-white font-serif tracking-widest py-3.5 rounded-xl transition-colors text-sm"
          >
            {isLoading ? '登入中…' : '登入'}
          </button>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          還沒有帳號？
          <Link href={`/${locale}/account/register`} className="text-brand-700 hover:underline ml-1">
            立即註冊
          </Link>
        </p>
      </div>
    </main>
  )
}
