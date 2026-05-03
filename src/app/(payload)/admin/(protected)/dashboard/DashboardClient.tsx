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
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type Stats = {
  totalProducts: number
  pendingOrders: number
  totalOrders: number
  totalNews: number
}

type Order = {
  id: string | number
  orderNumber?: string
  status?: string
  totalAmount?: number
  createdAt?: string
  customerName?: string
}

function KpiCard({
  label,
  value,
  icon: Icon,
  href,
  highlight,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  href: string
  highlight?: boolean
}) {
  return (
    <Link href={href}>
      <Card interactive className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-adm-text-tertiary">{label}</p>
          <div
            className={`p-2 rounded-adm-lg ${
              highlight && value > 0 ? 'bg-adm-warning-50' : 'bg-adm-bg-base'
            }`}
          >
            <Icon
              className={`h-4 w-4 ${
                highlight && value > 0 ? 'text-adm-warning-600' : 'text-adm-text-tertiary'
              }`}
            />
          </div>
        </div>
        <p
          className={`text-3xl font-bold tabular-nums ${
            highlight && value > 0 ? 'text-adm-warning-600' : 'text-adm-text-primary'
          }`}
        >
          {value.toLocaleString()}
        </p>
      </Card>
    </Link>
  )
}

function statusBadge(status?: string) {
  const map: Record<string, { label: string; variant: 'warning' | 'info' | 'danger' | 'neutral' }> = {
    pending:  { label: '待付款', variant: 'warning' },
    paid:     { label: '已付款', variant: 'info' },
    failed:   { label: '付款失敗', variant: 'danger' },
    refunded: { label: '已退款', variant: 'neutral' },
  }
  const s = map[status ?? ''] ?? { label: status ?? '—', variant: 'neutral' as const }
  return (
    <Badge variant={s.variant} size="sm">
      {s.label}
    </Badge>
  )
}

const QUICK_LINKS = [
  { label: '新增商品', href: '/admin/collections/products/create', icon: Package },
  { label: '查看訂單', href: '/admin/collections/orders', icon: ShoppingBag },
  { label: '發布消息', href: '/admin/collections/news/create', icon: Newspaper },
  { label: '媒體庫', href: '/admin/collections/media', icon: ImageIcon },
  { label: '網站設定', href: '/admin/globals/site-settings', icon: Settings2 },
  { label: '使用者', href: '/admin/collections/users', icon: Users },
]

export function DashboardClient({
  stats,
  recentOrders,
}: {
  stats: Stats
  recentOrders: Order[]
}) {
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-adm-text-primary">Dashboard</h1>
        <p className="text-sm text-adm-text-tertiary mt-1">{today}</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="上架商品"
          value={stats.totalProducts}
          icon={Package}
          href="/admin/collections/products"
        />
        <KpiCard
          label="待處理訂單"
          value={stats.pendingOrders}
          icon={Clock}
          href="/admin/collections/orders"
          highlight
        />
        <KpiCard
          label="所有訂單"
          value={stats.totalOrders}
          icon={ShoppingBag}
          href="/admin/collections/orders"
        />
        <KpiCard
          label="最新消息"
          value={stats.totalNews}
          icon={Newspaper}
          href="/admin/collections/news"
        />
      </div>

      {/* Recent orders */}
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
            <table className="w-full">
              <thead>
                <tr className="border-b border-adm-border-subtle bg-adm-bg-base">
                  {['訂單號', '顧客', '狀態', '金額', '日期'].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium"
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
                    <td className="px-6 py-3.5 text-sm font-medium text-adm-text-primary">
                      {order.orderNumber ?? `#${order.id}`}
                    </td>
                    <td className="px-6 py-3.5 text-sm text-adm-text-secondary">
                      {order.customerName ?? '—'}
                    </td>
                    <td className="px-6 py-3.5">{statusBadge(order.status)}</td>
                    <td className="px-6 py-3.5 text-sm tabular-nums text-adm-text-primary">
                      {order.totalAmount ? `NT$ ${order.totalAmount.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-adm-text-tertiary">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('zh-TW')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Quick links */}
      <div>
        <h2 className="text-base font-semibold text-adm-text-primary mb-4">快速入口</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card interactive className="flex flex-col items-center gap-2 p-4 text-center">
                <link.icon className="h-5 w-5 text-adm-brand-500" />
                <span className="text-xs text-adm-text-secondary">{link.label}</span>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
