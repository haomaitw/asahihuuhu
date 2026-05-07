'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

const TIER_LABEL: Record<string, string> = {
  regular: '一般會員',
  silver: '銀卡會員',
  gold: '金卡會員',
}
const TIER_COLOR: Record<string, string> = {
  regular: 'bg-sand-100 text-sand-700',
  silver: 'bg-gray-100 text-gray-600',
  gold: 'bg-amber-100 text-amber-700',
}
const TIER_NEXT: Record<string, { label: string; target: number }> = {
  regular: { label: '銀卡', target: 3000 },
  silver: { label: '金卡', target: 10000 },
  gold: { label: '最高等級', target: 10000 },
}

export default function MemberCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const router = useRouter()
  const { customer, logout, fetchMe } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    params.then((p) => setLocale(p.locale)).catch(() => {})
    fetchMe()
    setMounted(true)
  }, [fetchMe, params])

  useEffect(() => {
    if (mounted && !customer) {
      router.push(`/${locale}/account/login`)
    }
  }, [mounted, customer, locale, router])

  if (!mounted || !customer) {
    return (
      <main className="min-h-dvh bg-paper-50 flex items-center justify-center">
        <div className="text-ink/30 text-sm">載入中…</div>
      </main>
    )
  }

  const tier = customer.tier ?? 'regular'
  const nextTier = TIER_NEXT[tier]
  const progressPct =
    tier === 'gold'
      ? 100
      : tier === 'silver'
      ? Math.min(100, ((customer.totalSpent - 3000) / (10000 - 3000)) * 100)
      : Math.min(100, (customer.totalSpent / 3000) * 100)

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}`)
  }

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white border border-sand-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-serif text-xl text-ink">{customer.name}</p>
              <p className="text-sm text-ink/50 mt-0.5">{customer.email}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${TIER_COLOR[tier]}`}>
              {TIER_LABEL[tier]}
            </span>
          </div>

          {/* Points balance */}
          <div className="mt-5 bg-brand-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-ink/50 mb-0.5">可用點數</p>
              <p className="font-serif text-3xl text-brand-700">{customer.points.toLocaleString()}</p>
            </div>
            <Link
              href={`/${locale}/account/points`}
              className="text-xs text-brand-700 border border-brand-300 px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
            >
              查看明細
            </Link>
          </div>

          {/* Tier progress */}
          {tier !== 'gold' && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-ink/40 mb-1.5">
                <span>累計消費 NT${customer.totalSpent.toLocaleString()}</span>
                <span>距離{nextTier.label} NT${Math.max(0, nextTier.target - customer.totalSpent).toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-sand-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { href: `/${locale}/account/orders`, icon: '📦', label: '我的訂單', sub: '查看訂單狀態與出貨追蹤' },
            { href: `/${locale}/account/points`, icon: '⭐', label: '點數 & 折扣', sub: `${customer.points} 點可用` },
            { href: `/${locale}/account/profile`, icon: '👤', label: '個人資料', sub: '編輯帳號與地址' },
            { href: `/${locale}/shop`, icon: '🍧', label: '繼續購物', sub: '探索當季刨冰與商品' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border border-sand-200 rounded-2xl p-5 hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{item.icon}</span>
              <p className="font-medium text-sm text-ink mt-2">{item.label}</p>
              <p className="text-xs text-ink/40 mt-0.5">{item.sub}</p>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full text-sm text-ink/40 hover:text-ink/60 py-3 transition-colors"
        >
          登出
        </button>
      </div>
    </main>
  )
}
