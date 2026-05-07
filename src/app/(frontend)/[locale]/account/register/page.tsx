'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

export default function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const router = useRouter()
  const { register, isLoading } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    marketingConsent: false,
  })
  const [error, setError] = useState('')

  if (typeof window !== 'undefined') {
    params.then((p) => setLocale(p.locale)).catch(() => {})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('兩次輸入的密碼不一致')
      return
    }
    if (form.password.length < 8) {
      setError('密碼至少需要 8 個字元')
      return
    }
    const result = await register({
      email: form.email,
      password: form.password,
      name: form.name,
      phone: form.phone,
      marketingConsent: form.marketingConsent,
    })
    if (result.ok) {
      router.push(`/${locale}/account`)
    } else {
      setError(result.error ?? '註冊失敗')
    }
  }

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  return (
    <main className="min-h-dvh bg-paper-50 flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="font-serif text-3xl text-ink tracking-widest mb-2">朝日夫婦</p>
          <p className="text-sm text-ink/50 tracking-wide">建立會員帳號</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-sand-200 rounded-2xl p-8 space-y-4 shadow-sm"
        >
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">姓名 *</label>
            <input
              required
              value={form.name}
              onChange={set('name')}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="王小明"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">電子郵件 *</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">手機號碼</label>
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="0912-345-678"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">密碼 *（至少 8 字元）</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={set('password')}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs text-ink/60 mb-1.5 tracking-wide">確認密碼 *</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              className="w-full border border-sand-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-400 bg-paper-50"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-start gap-2 text-xs text-ink/60 cursor-pointer">
            <input
              type="checkbox"
              checked={form.marketingConsent}
              onChange={set('marketingConsent')}
              className="mt-0.5 accent-brand-700"
            />
            我同意接收朝日夫婦的最新優惠及活動通知
          </label>

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
            {isLoading ? '註冊中…' : '立即加入'}
          </button>

          <p className="text-center text-xs text-ink/40">
            註冊即表示您同意我們的服務條款與隱私政策
          </p>
        </form>

        <p className="text-center text-sm text-ink/50 mt-6">
          已有帳號？
          <Link href={`/${locale}/account/login`} className="text-brand-700 hover:underline ml-1">
            立即登入
          </Link>
        </p>
      </div>
    </main>
  )
}
