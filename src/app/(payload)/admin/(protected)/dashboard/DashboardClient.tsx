'use client'
import * as React from 'react'
import Link from 'next/link'
import {
  Package,
  Clock,
  ShoppingBag,
  Newspaper,
  ArrowRight,
  Image as ImageIcon,
  Settings2,
  Users,
  TrendingUp,
  Truck,
  AlertTriangle,
  Tag,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Stats = {
  totalProducts: number
  pendingShipmentCount: number
  processingOrders: number
  todayOrders: number
  totalCustomers: number
  totalRevenue: number
}

type Order = {
  id: string | number
  orderNumber?: string
  status?: string
  fulfillmentStatus?: string
  totalAmount?: number
  createdAt?: string
  customerName?: string
}

type LowStockProduct = {
  id: string | number
  name: string
  stock: number
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

type KpiVariant = 'brand' | 'warning' | 'info' | 'neutral'

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  variant = 'neutral',
  formatted,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
  variant?: KpiVariant
  formatted?: string
}) {
  const isWarning = variant === 'warning' && value > 0
  const iconBg: Record<KpiVariant, string> = {
    brand:   'bg-adm-brand-50',
    warning: isWarning ? 'bg-adm-warning-50' : 'bg-adm-bg-base',
    info:    'bg-adm-info-50',
    neutral: 'bg-adm-bg-base',
  }
  const iconColor: Record<KpiVariant, string> = {
    brand:   'text-adm-brand-500',
    warning: isWarning ? 'text-adm-warning-600' : 'text-adm-text-tertiary',
    info:    'text-adm-info-600',
    neutral: 'text-adm-text-tertiary',
  }
  const valueColor: Record<KpiVariant, string> = {
    brand:   'text-adm-brand-600',
    warning: isWarning ? 'text-adm-warning-600' : 'text-adm-text-primary',
    info:    'text-adm-info-600',
    neutral: 'text-adm-text-primary',
  }

  return (
    <Link href={href}>
      <Card interactive className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-adm-text-tertiary">{label}</p>
          <div className={`p-2 rounded-adm-lg ${iconBg[variant]}`}>
            <Icon className={`h-4 w-4 ${iconColor[variant]}`} />
          </div>
        </div>
        <p className={`text-3xl font-bold tabular-nums ${valueColor[variant]}`}>
          {formatted ?? value.toLocaleString()}
        </p>
      </Card>
    </Link>
  )
}

// ── Status badges ─────────────────────────────────────────────────────────────

function paymentBadge(status?: string) {
  const map: Record<string, { label: string; variant: 'warning' | 'info' | 'danger' | 'neutral' | 'success' }> = {
    pending_payment: { label: '待付款', variant: 'warning' },
    paid:            { label: '已付款', variant: 'success' },
    failed:          { label: '付款失敗', variant: 'danger' },
    refunded:        { label: '已退款', variant: 'neutral' },
    // legacy
    pending:         { label: '待付款', variant: 'warning' },
  }
  const s = map[status ?? ''] ?? { label: status ?? '—', variant: 'neutral' as const }
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>
}

function fulfillmentBadge(status?: string) {
  const map: Record<string, { label: string; variant: 'warning' | 'info' | 'danger' | 'neutral' | 'success' }> = {
    unfulfilled: { label: '未出貨', variant: 'warning' },
    processing:  { label: '備貨中', variant: 'info' },
    shipped:     { label: '已出貨', variant: 'success' },
    delivered:   { label: '已送達', variant: 'neutral' },
    cancelled:   { label: '已取消', variant: 'danger' },
  }
  const s = map[status ?? ''] ?? { label: status ?? '—', variant: 'neutral' as const }
  return <Badge variant={s.variant} size="sm">{s.label}</Badge>
}

// ── Quick links ───────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: '新增商品',     href: '/admin/collections/products/create', icon: Package },
  { label: '查看訂單',     href: '/admin/collections/orders', icon: ShoppingBag },
  { label: '待出貨訂單',   href: '/admin/collections/orders?where[fulfillmentStatus][equals]=unfulfilled&where[status][equals]=paid', icon: Truck },
  { label: '顧客管理',     href: '/admin/collections/customers', icon: Users },
  { label: '優惠券管理',   href: '/admin/collections/coupons', icon: Tag },
  { label: '發布消息',     href: '/admin/collections/news/create', icon: Newspaper },
  { label: '媒體庫',       href: '/admin/collections/media', icon: ImageIcon },
  { label: '網站設定',     href: '/admin/globals/site-settings', icon: Settings2 },
]

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient({
  stats,
  recentOrders,
  lowStockProducts = [],
}: {
  stats: Stats
  recentOrders: Order[]
  lowStockProducts?: LowStockProduct[]
}) {
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const formattedRevenue = `NT$${stats.totalRevenue.toLocaleString()}`

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-adm-text-primary">Dashboard</h1>
        <p className="text-sm text-adm-text-tertiary mt-1">{today}</p>
      </div>

      {/* KPI Grid — 5 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          label="總營業額"
          value={stats.totalRevenue}
          formatted={formattedRevenue}
          icon={TrendingUp}
          href="/admin/collections/orders?where[status][equals]=paid"
          variant="brand"
        />
        <KpiCard
          label="待出貨"
          value={stats.pendingShipmentCount}
          icon={Clock}
          href="/admin/collections/orders?where[fulfillmentStatus][equals]=unfulfilled&where[status][equals]=paid"
          variant="warning"
        />
        <KpiCard
          label="今日訂單"
          value={stats.todayOrders}
          icon={ShoppingBag}
          href="/admin/collections/orders"
          variant="info"
        />
        <KpiCard
          label="會員數"
          value={stats.totalCustomers}
          icon={Users}
          href="/admin/collections/customers"
          variant="neutral"
        />
        <KpiCard
          label="上架商品"
          value={stats.totalProducts}
          icon={Package}
          href="/admin/collections/products"
          variant="neutral"
        />
      </div>

      {/* Alerts: low stock */}
      {lowStockProducts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-adm-text-primary flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-adm-warning-600" />
            庫存警示
          </h2>
          <div className="flex flex-col gap-2">
            {lowStockProducts.map((p) => (
              <Link key={p.id} href={`/admin/collections/products/${p.id}`}>
                <div className="flex items-center justify-between rounded-adm-lg border border-adm-warning-200 bg-adm-warning-50 px-4 py-3 hover:bg-adm-warning-100 transition-colors">
                  <span className="text-sm font-medium text-adm-warning-800">{p.name}</span>
                  <Badge variant="warning" size="sm">
                    {p.stock === 0 ? '售完' : `剩 ${p.stock}`}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders table */}
      <Card>
        <div className="flex items-center justify-between px-6 py-4 border-b border-adm-border-subtle">
          <h2 className="text-base font-semibold text-adm-text-primary">最近訂單</h2>
          <Link
            href="/admin/collections/orders"
            className="flex items-center gap-1 text-xs text-adm-brand-600 hover:underline"
          >
            查看全部 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <CardContent className="p-0">
          {recentOrders.length === 0 ? (
            <p className="py-12 text-center text-sm text-adm-text-tertiary">尚無訂單</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                    {['訂單號', '顧客', '金流狀態', '出貨狀態', '金額', '日期'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-adm-border-subtle last:border-0 hover:bg-adm-brand-50/40 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/admin/collections/orders/${order.id}`}
                          className="text-sm font-medium text-adm-brand-600 hover:underline"
                        >
                          {order.orderNumber ?? `#${order.id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-adm-text-secondary whitespace-nowrap">
                        {order.customerName ?? '—'}
                      </td>
                      <td className="px-4 py-3.5">{paymentBadge(order.status)}</td>
                      <td className="px-4 py-3.5">{fulfillmentBadge(order.fulfillmentStatus)}</td>
                      <td className="px-4 py-3.5 text-sm tabular-nums text-adm-text-primary whitespace-nowrap">
                        {order.totalAmount != null
                          ? `NT$ ${Number(order.totalAmount).toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-adm-text-tertiary whitespace-nowrap">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString('zh-TW')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick links — 8 shortcuts */}
      <div>
        <h2 className="text-base font-semibold text-adm-text-primary mb-4">快速入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card interactive className="flex flex-col items-center gap-2 p-4 text-center">
                <link.icon className="h-5 w-5 text-adm-brand-500" />
                <span className="text-xs text-adm-text-secondary leading-tight">{link.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
