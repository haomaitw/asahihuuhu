'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// ── Flag definitions ───────────────────────────────────────────────────────────

type FlagKey =
  | 'shopEnabled'
  | 'guestCheckoutEnabled'
  | 'couponsEnabled'
  | 'pointsEnabled'
  | 'orderTrackingEnabled'
  | 'dineInEnabled'
  | 'customerServiceEnabled'
  | 'reviewsEnabled'

type FlagDef = {
  key: FlagKey
  label: string
  description: string
  wip?: boolean
}

const FLAGS: FlagDef[] = [
  {
    key: 'shopEnabled',
    label: '商城（前台購物）',
    description: '關閉後前台商品頁、購物車、結帳功能全部停用。',
  },
  {
    key: 'guestCheckoutEnabled',
    label: '訪客結帳',
    description: '允許未登入的訪客直接結帳；關閉後需先登入會員。',
  },
  {
    key: 'couponsEnabled',
    label: '優惠券',
    description: '結帳頁顯示折扣碼輸入欄位。',
  },
  {
    key: 'pointsEnabled',
    label: '會員點數',
    description: '啟用點數累積與折抵功能。',
  },
  {
    key: 'orderTrackingEnabled',
    label: '訂單追蹤頁（/track）',
    description: '公開的訂單查詢頁，訪客可透過訂單編號 + Email 查詢出貨狀態。',
  },
  {
    key: 'dineInEnabled',
    label: 'QR 碼點餐系統',
    description: '掃碼點餐與廚房顯示系統。',
    wip: true,
  },
  {
    key: 'customerServiceEnabled',
    label: '線上客服',
    description: '即時客服對話視窗。',
    wip: true,
  },
  {
    key: 'reviewsEnabled',
    label: '商品評價',
    description: '顧客留下商品評分與評論。',
    wip: true,
  },
]

type State = Record<FlagKey, boolean>

function initState(data?: any): State {
  return {
    shopEnabled:            data?.shopEnabled            ?? true,
    guestCheckoutEnabled:   data?.guestCheckoutEnabled   ?? true,
    couponsEnabled:         data?.couponsEnabled         ?? true,
    pointsEnabled:          data?.pointsEnabled          ?? true,
    orderTrackingEnabled:   data?.orderTrackingEnabled   ?? true,
    dineInEnabled:          data?.dineInEnabled          ?? false,
    customerServiceEnabled: data?.customerServiceEnabled ?? false,
    reviewsEnabled:         data?.reviewsEnabled         ?? false,
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export function FeatureFlagsForm({ initialData }: { initialData?: any }) {
  const [flags,   setFlags]   = React.useState<State>(() => initState(initialData))
  const [saving,  setSaving]  = React.useState(false)
  const [dirty,   setDirty]   = React.useState(false)

  function toggle(key: FlagKey) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/globals/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(flags),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('功能開關已儲存')
      setDirty(false)
    } catch (err: any) {
      toast.error(`儲存失敗：${err?.message ?? 'Unknown error'}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs tracking-[0.2em] text-adm-text-tertiary uppercase mb-1">代管商專區</p>
        <h1 className="text-xl font-semibold text-adm-text-primary">功能開關</h1>
        <p className="mt-1 text-sm text-adm-text-secondary">
          只有代管商（異想天開影像）可以修改此設定。開關控制前台功能的可見性，可用於功能上線前的預備與測試。
        </p>
      </div>

      <Card>
        <CardContent className="p-0 divide-y divide-adm-border-subtle">
          {FLAGS.map((flag) => (
            <div key={flag.key} className="flex items-start gap-4 px-5 py-4">
              {/* Toggle */}
              <button
                type="button"
                role="switch"
                aria-checked={flags[flag.key]}
                onClick={() => toggle(flag.key)}
                className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-adm-brand-400 ${
                  flags[flag.key] ? 'bg-adm-brand-500' : 'bg-adm-border-subtle'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    flags[flag.key] ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-adm-text-primary">{flag.label}</p>
                  {flag.wip && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium tracking-wide">
                      開發中
                    </span>
                  )}
                  <span className={`ml-auto text-xs font-medium ${flags[flag.key] ? 'text-emerald-600' : 'text-adm-text-tertiary'}`}>
                    {flags[flag.key] ? '已開啟' : '已關閉'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-adm-text-tertiary leading-relaxed">{flag.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-5 flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving || !dirty} className="min-w-24">
          {saving ? '儲存中…' : '儲存設定'}
        </Button>
        {dirty && (
          <p className="text-xs text-amber-600">有未儲存的變更</p>
        )}
      </div>
    </div>
  )
}
