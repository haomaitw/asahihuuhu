'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const TIER_OPTIONS = [
  { value: 'regular', label: '一般會員' },
  { value: 'silver',  label: '銀卡會員' },
  { value: 'gold',    label: '金卡會員' },
]

const TIER_BADGES: Record<string, { label: string; variant: 'neutral' | 'info' | 'warning' }> = {
  regular: { label: '一般會員', variant: 'neutral' },
  silver:  { label: '銀卡會員', variant: 'info' },
  gold:    { label: '金卡會員', variant: 'warning' },
}

const PT_TYPE_LABELS: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'neutral' }> = {
  earn:               { label: '購物獲得',  variant: 'success' },
  redeem:             { label: '兌換折扣',  variant: 'warning' },
  expire:             { label: '點數到期',  variant: 'danger' },
  adjust:             { label: '手動調整',  variant: 'info' },
  registration_bonus: { label: '註冊獎勵',  variant: 'brand' },
  birthday_bonus:     { label: '生日獎勵',  variant: 'neutral' },
}

const ORDER_STATUS_LABELS: Record<string, { label: string; variant: 'warning' | 'success' | 'danger' | 'neutral' }> = {
  pending:  { label: '待付款', variant: 'warning' },
  paid:     { label: '已付款', variant: 'success' },
  failed:   { label: '付款失敗', variant: 'danger' },
  refunded: { label: '已退款', variant: 'neutral' },
}

type Props = { customer: any }

export function CustomerDetailClient({ customer }: Props) {
  const router = useRouter()

  // Tier state
  const [tier, setTier] = React.useState(customer.tier ?? 'regular')
  const [tierLoading, setTierLoading] = React.useState(false)

  // Points adjustment state
  const [pointsDelta, setPointsDelta] = React.useState('')
  const [pointsReason, setPointsReason] = React.useState('')
  const [pointsLoading, setPointsLoading] = React.useState(false)

  // Fetch related data
  const [pointTxns, setPointTxns] = React.useState<any[]>([])
  const [orders, setOrders] = React.useState<any[]>([])
  const [dataLoading, setDataLoading] = React.useState(true)

  React.useEffect(() => {
    const load = async () => {
      try {
        const [ptRes, ordRes] = await Promise.all([
          fetch(`/api/point-transactions?where[customer][equals]=${customer.id}&sort=-createdAt&limit=50`, { credentials: 'include' }),
          fetch(`/api/orders?where[customer][equals]=${customer.id}&sort=-createdAt&limit=50`, { credentials: 'include' }),
        ])
        const [ptData, ordData] = await Promise.all([ptRes.json(), ordRes.json()])
        setPointTxns(ptData.docs ?? [])
        setOrders(ordData.docs ?? [])
      } catch {
        // silent
      } finally {
        setDataLoading(false)
      }
    }
    load()
  }, [customer.id])

  const handleSaveTier = async () => {
    setTierLoading(true)
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier }),
      })
      if (!res.ok) throw new Error()
      toast.success('會員等級已更新')
      router.refresh()
    } catch {
      toast.error('更新失敗')
    } finally {
      setTierLoading(false)
    }
  }

  const handleAdjustPoints = async () => {
    const delta = parseInt(pointsDelta, 10)
    if (isNaN(delta) || delta === 0) {
      toast.error('請輸入有效的點數數量（非零整數）')
      return
    }
    if (!pointsReason.trim()) {
      toast.error('請輸入調整原因')
      return
    }
    setPointsLoading(true)
    try {
      const currentPoints = Number(customer.points ?? 0)
      const newBalance = currentPoints + delta
      if (newBalance < 0) {
        toast.error(`調整後點數餘額不可為負數（目前 ${currentPoints} 點，扣 ${Math.abs(delta)} 點 = ${newBalance} 點）`)
        setPointsLoading(false)
        return
      }
      // 1. Create point transaction record
      const txRes = await fetch('/api/point-transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          customer: customer.id,
          type: 'adjust',
          points: delta,
          balance: newBalance,
          description: pointsReason.trim(),
        }),
      })
      if (!txRes.ok) throw new Error('建立點數紀錄失敗')

      // 2. Update customer points balance
      const cusRes = await fetch(`/api/customers/${customer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ points: newBalance }),
      })
      if (!cusRes.ok) throw new Error('更新顧客點數失敗')

      toast.success(`點數已調整（${delta > 0 ? '+' : ''}${delta} 點，現餘 ${newBalance} 點）`)
      setPointsDelta('')
      setPointsReason('')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? '調整失敗')
    } finally {
      setPointsLoading(false)
    }
  }

  const tierBadge = TIER_BADGES[customer.tier ?? 'regular'] ?? TIER_BADGES.regular

  const row = (label: string, value: React.ReactNode) => (
    <div className="flex py-3 border-b border-adm-border-subtle last:border-0">
      <dt className="w-32 shrink-0 text-xs text-adm-text-tertiary uppercase tracking-wider font-medium pt-0.5">{label}</dt>
      <dd className="flex-1 text-sm text-adm-text-primary">{value ?? '—'}</dd>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/collections/customers"
            className="inline-flex items-center gap-1 text-xs text-adm-text-tertiary hover:text-adm-text-primary mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> 會員列表
          </Link>
          <h1 className="text-2xl font-semibold text-adm-text-primary">{customer.name ?? '—'}</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">{customer.email}</p>
        </div>
        <Badge variant={tierBadge.variant} size="md">{tierBadge.label}</Badge>
      </div>

      {/* Basic Info */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">基本資料</h2>
        </div>
        <CardContent className="p-5">
          <dl>
            {row('姓名', customer.name)}
            {row('Email', customer.email)}
            {row('電話', customer.phone)}
            {row('生日', customer.birthday ? new Date(customer.birthday).toLocaleDateString('zh-TW') : null)}
            {row('性別', customer.gender === 'male' ? '男' : customer.gender === 'female' ? '女' : customer.gender === 'other' ? '不透露' : null)}
            {row('等級', <Badge variant={tierBadge.variant} size="sm">{tierBadge.label}</Badge>)}
            {row('可用點數', <span className="font-semibold tabular-nums">{Number(customer.points ?? 0).toLocaleString()} 點</span>)}
            {row('累計消費', <span className="tabular-nums">NT$ {Number(customer.totalSpent ?? 0).toLocaleString()}</span>)}
            {row('行銷同意', customer.marketingConsent ? '已同意' : '未同意')}
            {row('加入日期', customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('zh-TW') : null)}
          </dl>
        </CardContent>
      </Card>

      {/* Default Address */}
      {customer.defaultAddress && (
        <Card>
          <div className="px-5 py-4 border-b border-adm-border-subtle">
            <h2 className="text-sm font-semibold text-adm-text-primary">預設收件地址</h2>
          </div>
          <CardContent className="p-5">
            <dl>
              {row('收件人', customer.defaultAddress.recipient)}
              {row('收件電話', customer.defaultAddress.phone)}
              {row('地址', [
                customer.defaultAddress.zip,
                customer.defaultAddress.city,
                customer.defaultAddress.district,
                customer.defaultAddress.address,
              ].filter(Boolean).join(' ') || null)}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Admin: Update Tier */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">管理員操作 — 更新等級</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tier-select">會員等級</Label>
            <select
              id="tier-select"
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full max-w-xs rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
            >
              {TIER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <Button variant="primary" size="md" loading={tierLoading} onClick={handleSaveTier}>
            儲存等級
          </Button>
        </CardContent>
      </Card>

      {/* Admin: Adjust Points */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">管理員操作 — 手動調整點數</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="points-delta">點數數量（正數=增加，負數=扣除）</Label>
              <input
                id="points-delta"
                type="number"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(e.target.value)}
                placeholder="例：100 或 -50"
                className="h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="points-reason">調整原因</Label>
              <input
                id="points-reason"
                type="text"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="例：活動補點、誤扣補回"
                className="h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
              />
            </div>
          </div>
          <p className="text-xs text-adm-text-tertiary">
            目前點數餘額：<strong className="text-adm-text-primary tabular-nums">{Number(customer.points ?? 0).toLocaleString()} 點</strong>
            {pointsDelta && !isNaN(parseInt(pointsDelta, 10)) && (
              <span className="ml-2">
                → 調整後：<strong className="text-adm-brand-600 tabular-nums">
                  {(Number(customer.points ?? 0) + parseInt(pointsDelta, 10)).toLocaleString()} 點
                </strong>
              </span>
            )}
          </p>
          <Button variant="primary" size="md" loading={pointsLoading} onClick={handleAdjustPoints}>
            送出調整
          </Button>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">點數紀錄</h2>
        </div>
        {dataLoading ? (
          <div className="py-10 text-center text-sm text-adm-text-tertiary">載入中…</div>
        ) : pointTxns.length === 0 ? (
          <div className="py-10 text-center text-sm text-adm-text-tertiary">尚無點數紀錄</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['類型', '點數', '餘額', '說明', '日期'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pointTxns.map((tx: any) => {
                  const tl = PT_TYPE_LABELS[tx.type] ?? { label: tx.type, variant: 'neutral' as const }
                  return (
                    <tr key={tx.id} className="border-b border-adm-border-subtle last:border-0">
                      <td className="px-5 py-3.5">
                        <Badge variant={tl.variant as any} size="sm">{tl.label}</Badge>
                      </td>
                      <td className={`px-5 py-3.5 text-sm tabular-nums font-medium ${tx.points >= 0 ? 'text-adm-success-600' : 'text-adm-danger-600'}`}>
                        {tx.points >= 0 ? `+${tx.points}` : tx.points}
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-secondary">{tx.balance ?? '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-adm-text-secondary">{tx.description ?? '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('zh-TW') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Order History */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">訂單紀錄</h2>
        </div>
        {dataLoading ? (
          <div className="py-10 text-center text-sm text-adm-text-tertiary">載入中…</div>
        ) : orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-adm-text-tertiary">尚無訂單紀錄</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['訂單號', '狀態', '金額', '日期', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => {
                  const sl = ORDER_STATUS_LABELS[o.status ?? ''] ?? { label: o.status ?? '—', variant: 'neutral' as const }
                  return (
                    <tr key={o.id} className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-adm-text-primary font-mono">
                        {o.orderNumber ?? `#${o.id}`}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={sl.variant as any} size="sm">{sl.label}</Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm tabular-nums text-adm-text-primary">
                        {o.totalAmount ? `NT$ ${o.totalAmount.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString('zh-TW') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/admin/collections/orders/${o.id}`} className="text-xs text-adm-brand-600 hover:underline">
                          檢視
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
