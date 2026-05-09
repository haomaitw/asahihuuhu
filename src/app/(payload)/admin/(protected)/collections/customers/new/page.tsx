'use client'

import { useState } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const INPUT_CLASS =
  'w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2.5 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

export default function NewCustomerPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [tier, setTier] = useState('regular')
  const [points, setPoints] = useState(0)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password, phone, tier, points, marketingConsent }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.errors?.[0]?.message ?? data.message ?? '建立失敗，請稍後再試')
      } else {
        window.location.href = `/admin/collections/customers/${data.doc.id}`
      }
    } catch (err: any) {
      setError(err.message ?? '建立失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/collections/customers"
          className="inline-flex items-center gap-1 text-xs text-adm-text-tertiary hover:text-adm-brand-600 transition-colors mb-3"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回會員管理
        </Link>
        <h1 className="text-2xl font-semibold text-adm-text-primary">新增會員帳號</h1>
        <p className="text-sm text-adm-text-tertiary mt-0.5">手動建立新的會員帳號</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-adm-md px-4 py-3 text-sm bg-red-50 border border-red-200 text-red-700">
          ✕ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">
            姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入姓名"
            className={INPUT_CLASS}
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">
            電子郵件 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            className={INPUT_CLASS}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">
            密碼 <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="至少 8 個字元"
            className={INPUT_CLASS}
          />
          <p className="text-xs text-adm-text-tertiary">會員首次登入後可自行修改</p>
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">手機</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xx-xxx-xxx（選填）"
            className={INPUT_CLASS}
          />
        </div>

        {/* Tier */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">等級</label>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className={INPUT_CLASS}
          >
            <option value="regular">一般會員</option>
            <option value="silver">銀卡會員</option>
            <option value="gold">金卡會員</option>
          </select>
        </div>

        {/* Points */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">初始點數</label>
          <input
            type="number"
            min={0}
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            className={INPUT_CLASS}
          />
        </div>

        {/* Marketing consent */}
        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="marketingConsent"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            className="accent-adm-brand-600 w-4 h-4"
          />
          <label htmlFor="marketingConsent" className="text-sm text-adm-text-secondary cursor-pointer">
            行銷同意（同意接收行銷郵件）
          </label>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-adm-md bg-adm-brand-600 text-white hover:bg-adm-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                建立中…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                新增會員
              </>
            )}
          </button>
          <Link
            href="/admin/collections/customers"
            className="text-sm text-adm-text-tertiary hover:text-adm-text-primary transition-colors"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
