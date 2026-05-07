'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

type Tx = {
  id: string
  type: string
  points: number
  balance: number
  description: string
  createdAt: string
}

const TYPE_LABEL: Record<string, string> = {
  earn: '消費累點',
  redeem: '兌換折抵',
  expire: '點數到期',
  adjust: '人工調整',
  registration_bonus: '註冊獎勵',
  birthday_bonus: '生日禮',
}
const TYPE_COLOR: Record<string, string> = {
  earn: 'text-green-600',
  redeem: 'text-amber-600',
  expire: 'text-red-400',
  adjust: 'text-blue-500',
  registration_bonus: 'text-brand-600',
  birthday_bonus: 'text-pink-500',
}

export default function PointsPage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const { customer, fetchMe } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [txs, setTxs] = useState<Tx[]>([])
  const [loading, setLoading] = useState(true)
  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState('')

  useEffect(() => {
    params.then((p) => setLocale(p.locale)).catch(() => {})
    fetchMe()
  }, [fetchMe, params])

  useEffect(() => {
    if (customer === null) { router.push(`/${locale}/account/login`); return }
    if (!customer) return
    fetch(`/api/point-transactions?sort=-createdAt&limit=30&where[customer][equals]=${customer.id}`, {
      credentials: 'include',
    })
      .then((r) => r.json())
      .then((d) => setTxs(d.docs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customer, locale, router])

  const handleCouponCheck = async () => {
    if (!couponCode) return
    setCouponMsg('')
    const res = await fetch(`/api/coupons/validate?code=${couponCode}&amount=999999`)
    const data = await res.json()
    if (data.valid) {
      const c = data.coupon
      setCouponMsg(
        `✓ 折扣碼有效！${c.description ?? ''} — ${
          c.type === 'percentage'
            ? `折抵 ${c.value}%`
            : c.type === 'fixed_amount'
            ? `折抵 NT$${c.value}`
            : '免運費'
        }`
      )
    } else {
      setCouponMsg(`✗ ${data.error}`)
    }
  }

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/${locale}/account`} className="text-ink/40 hover:text-ink text-sm">← 會員中心</Link>
          <h1 className="font-serif text-2xl text-ink">點數 & 折扣</h1>
        </div>

        {/* Points card */}
        <div className="bg-brand-700 text-white rounded-2xl p-6">
          <p className="text-xs opacity-60 mb-1">可用點數</p>
          <p className="font-serif text-5xl">{customer?.points?.toLocaleString() ?? 0}</p>
          <p className="text-xs opacity-50 mt-3">每消費 NT$10 獲得 1 點 · 1 點 = NT$1 折抵</p>
        </div>

        {/* Coupon check */}
        <div className="bg-white border border-sand-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-medium text-ink mb-3">查詢折扣碼</h2>
          <div className="flex gap-2">
            <input
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="輸入折扣碼"
              className="flex-1 border border-sand-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-400 bg-paper-50 font-mono"
            />
            <button
              onClick={handleCouponCheck}
              className="bg-brand-700 text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-800 transition-colors"
            >
              查詢
            </button>
          </div>
          {couponMsg && (
            <p className={`text-xs mt-2 ${couponMsg.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {couponMsg}
            </p>
          )}
        </div>

        {/* Transaction history */}
        <div className="bg-white border border-sand-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-sand-100">
            <h2 className="text-sm font-medium text-ink">點數紀錄</h2>
          </div>
          {loading && <p className="text-center text-ink/30 text-sm py-8">載入中…</p>}
          {!loading && txs.length === 0 && (
            <p className="text-center text-ink/30 text-sm py-8">尚無點數紀錄</p>
          )}
          <div className="divide-y divide-sand-100">
            {txs.map((tx) => (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink">{tx.description || TYPE_LABEL[tx.type] || tx.type}</p>
                  <p className="text-xs text-ink/40 mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-medium text-sm ${TYPE_COLOR[tx.type] ?? 'text-ink'}`}>
                    {tx.points > 0 ? '+' : ''}{tx.points} 點
                  </p>
                  <p className="text-xs text-ink/40 mt-0.5">餘額 {tx.balance}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
