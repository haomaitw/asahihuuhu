'use client'
/**
 * Member Centre — account dashboard
 *
 * The hero element is a virtual membership card styled after an ISO 7810
 * credit card (85.6 × 54 mm, aspect ~1.586:1).  Each card carries:
 *   • tier-appropriate gradient background
 *   • subtle shimmer overlay (glassmorphism)
 *   • BrandMark watermark (near-transparent)
 *   • member name + unique member number
 *   • points + cumulative spend
 *   • decorative barcode derived deterministically from the customer ID
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Star, User, ShoppingBag } from 'lucide-react'
import { useCustomerStore } from '@/store/customer'
import { BrandMark } from '@/components/BrandMark'

/* ── Tier meta ──────────────────────────────────────────────────────────── */

const TIER_LABEL: Record<string, string> = {
  regular: '一般會員',
  silver:  '銀卡會員',
  gold:    '金卡會員',
}

/** Gradient + badge style per tier */
const TIER_CARD: Record<string, { gradient: string; badge: string; badgeText: string }> = {
  regular: {
    gradient:  'linear-gradient(135deg, #0b1c2c 0%, #16364f 40%, #265989 75%, #3e88c3 100%)',
    badge:     'rgba(255,255,255,0.13)',
    badgeText: 'rgba(255,255,255,0.72)',
  },
  silver: {
    gradient:  'linear-gradient(135deg, #1a2030 0%, #2e3f54 40%, #4d6070 75%, #7a96a8 100%)',
    badge:     'rgba(200,215,228,0.22)',
    badgeText: 'rgba(215,230,240,0.90)',
  },
  gold: {
    gradient:  'linear-gradient(135deg, #1a1208 0%, #3d2d18 40%, #6b4f2a 72%, #c9a566 100%)',
    badge:     'rgba(255,215,100,0.18)',
    badgeText: 'rgba(255,215,100,0.92)',
  },
}

const TIER_NEXT: Record<string, { label: string; target: number }> = {
  regular: { label: '銀卡', target: 3000  },
  silver:  { label: '金卡', target: 10000 },
  gold:    { label: '最高等級', target: 10000 },
}

/* ── Barcode (decorative, derived from customer ID) ─────────────────────── */

function genBars(seed: string): { isBar: boolean; w: number }[] {
  const b: { isBar: boolean; w: number }[] = []
  // Start guard: ▌ space ▌
  b.push({ isBar: true, w: 2 }, { isBar: false, w: 1 }, { isBar: true, w: 1 })
  for (let i = 0; i < Math.min(seed.length, 22); i++) {
    const c = seed.charCodeAt(i)
    b.push(
      { isBar: true,  w: ((c >> 5) & 3) + 1 },
      { isBar: false, w: ((c >> 3) & 1) + 1 },
      { isBar: true,  w: (c & 3) + 1        },
      { isBar: false, w: 1                   },
    )
  }
  // End guard
  b.push({ isBar: false, w: 1 }, { isBar: true, w: 1 }, { isBar: false, w: 1 }, { isBar: true, w: 2 })
  return b
}

function MemberBarcode({ seed }: { seed: string }) {
  const bars  = genBars(seed)
  const total = bars.reduce((t, bar) => t + bar.w, 0)

  const rects: { x: number; w: number }[] = []
  let cx = 0
  for (const bar of bars) {
    if (bar.isBar) rects.push({ x: cx, w: bar.w })
    cx += bar.w
  }

  return (
    <svg
      viewBox={`0 0 ${total} 32`}
      className="w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={0} width={r.w} height={32} fill="rgba(255,255,255,0.55)" />
      ))}
    </svg>
  )
}

/* ── Main page ──────────────────────────────────────────────────────────── */

export default function MemberCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const router = useRouter()
  const { customer, logout, fetchMe } = useCustomerStore()
  const [locale,  setLocale]  = useState('zh-TW')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    params.then((p) => setLocale(p.locale)).catch(() => {})
    fetchMe()
    setMounted(true)
  }, [fetchMe, params])

  useEffect(() => {
    if (mounted && !customer) router.push(`/${locale}/account/login`)
  }, [mounted, customer, locale, router])

  if (!mounted || !customer) {
    return (
      <main className="min-h-dvh bg-paper-50 flex items-center justify-center">
        <div className="text-ink/30 text-sm tracking-widest">載入中…</div>
      </main>
    )
  }

  const tier       = customer.tier ?? 'regular'
  const cardStyle  = TIER_CARD[tier]
  const nextTier   = TIER_NEXT[tier]
  const progressPct =
    tier === 'gold'   ? 100 :
    tier === 'silver' ? Math.min(100, ((customer.totalSpent - 3000) / 7000) * 100) :
                        Math.min(100, (customer.totalSpent / 3000) * 100)

  const handleLogout = async () => {
    await logout()
    router.push(`/${locale}`)
  }

  /* Shorten member ID to last 8 hex chars, uppercase */
  const memberId = String(customer.id).replace(/[^a-zA-Z0-9]/g, '').slice(-10).toUpperCase()

  const quickLinks = [
    { href: `/${locale}/account/orders`, Icon: Package,  label: '我的訂單',  sub: '查看訂單狀態與出貨追蹤' },
    { href: `/${locale}/account/points`, Icon: Star,     label: '點數 & 折扣', sub: `${customer.points} 點可用` },
    { href: `/${locale}/account/profile`,Icon: User,     label: '個人資料',  sub: '編輯帳號與地址'           },
    { href: `/${locale}/shop`,           Icon: ShoppingBag, label: '繼續購物', sub: '探索當季刨冰與商品'    },
  ]

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-xl mx-auto space-y-6">

        {/*
          ── Membership Card ─────────────────────────────────────────────
          ISO 7810 ID-1 proportions: 85.6 × 54 mm → aspect-[856/540]
        */}
        <div
          className="relative w-full rounded-2xl shadow-2xl overflow-hidden"
          style={{
            aspectRatio: '856 / 540',
            background: cardStyle.gradient,
          }}
        >
          {/* Shimmer gloss overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(118deg, transparent 28%, rgba(255,255,255,0.07) 50%, transparent 72%)',
            }}
          />

          {/* BrandMark watermark — centred, very faint */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <BrandMark variant="white" className="w-2/3 opacity-[0.04]" />
          </div>

          {/* Card content */}
          <div className="absolute inset-0 flex flex-col p-[7%]">

            {/* ── Top row: brand + tier badge ──────────────────────── */}
            <div className="flex items-start justify-between">
              <BrandMark variant="white" className="h-[12%] max-h-8 opacity-80" />
              <span
                className="text-[10px] tracking-[0.18em] px-2.5 py-0.5 rounded-full border"
                style={{
                  background:   cardStyle.badge,
                  color:        cardStyle.badgeText,
                  borderColor:  cardStyle.badgeText,
                }}
              >
                {TIER_LABEL[tier]}
              </span>
            </div>

            <div className="flex-1" />

            {/* ── Member name + ID ─────────────────────────────────── */}
            <div className="mb-[4%]">
              <p className="font-sans font-light text-white tracking-[0.12em] leading-tight"
                 style={{ fontSize: 'clamp(14px, 4vw, 20px)' }}>
                {customer.name}
              </p>
              <p className="font-mono text-white/38 tracking-[0.22em] mt-0.5"
                 style={{ fontSize: 'clamp(9px, 2.4vw, 12px)' }}>
                MEMBER&nbsp;·&nbsp;#{memberId}
              </p>
            </div>

            {/* ── Stats row ────────────────────────────────────────── */}
            <div className="flex items-end justify-between mb-[3%]">
              <div>
                <p className="text-white/40 uppercase tracking-widest"
                   style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}>
                  Points
                </p>
                <p className="font-sans font-light text-white leading-none"
                   style={{ fontSize: 'clamp(18px, 5vw, 28px)' }}>
                  {customer.points.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/40 uppercase tracking-widest"
                   style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}>
                  Spent
                </p>
                <p className="font-sans font-light text-white/65 leading-none"
                   style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                  NT${customer.totalSpent.toLocaleString()}
                </p>
              </div>
            </div>

            {/* ── Barcode ──────────────────────────────────────────── */}
            <div>
              <MemberBarcode seed={customer.id} />
              <p className="font-mono text-center text-white/20 tracking-[0.28em] mt-1"
                 style={{ fontSize: 'clamp(7px, 1.8vw, 9px)' }}>
                {String(customer.id).toUpperCase()}
              </p>
            </div>

          </div>
        </div>

        {/* ── Tier progress (below card, if not max tier) ─────────────── */}
        {tier !== 'gold' && (
          <div className="bg-white border border-paper-200 rounded-xl px-5 py-4 shadow-sm">
            <div className="flex justify-between text-xs text-ink/45 mb-2">
              <span>累計消費 NT${customer.totalSpent.toLocaleString()}</span>
              <span>距離{nextTier.label} NT${Math.max(0, nextTier.target - customer.totalSpent).toLocaleString()}</span>
            </div>
            <div className="h-1.5 bg-paper-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-sea-400 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Quick links grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ href, Icon, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-paper-200 rounded-2xl p-5 hover:border-sea-300 hover:shadow-sm transition-all duration-200 group"
            >
              <Icon size={20} className="text-sea-400 group-hover:scale-110 transition-transform duration-200" />
              <p className="font-sans font-medium text-sm text-ink mt-2.5">{label}</p>
              <p className="text-xs text-ink/40 mt-0.5">{sub}</p>
            </Link>
          ))}
        </div>

        {/* ── Logout ──────────────────────────────────────────────────── */}
        <button
          onClick={handleLogout}
          className="w-full text-sm text-ink/35 hover:text-ink/55 py-3 tracking-wide transition-colors"
        >
          登出
        </button>

      </div>
    </main>
  )
}
