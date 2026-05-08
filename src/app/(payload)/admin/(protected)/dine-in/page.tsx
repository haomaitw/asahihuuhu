import type { Metadata } from 'next'
import Link from 'next/link'
import { Lock, QrCode, Smartphone, Bell, Monitor, CreditCard, LayoutGrid } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = { title: 'QR 碼桌邊點餐系統' }

const FEATURES = [
  { icon: LayoutGrid, label: '桌位 QR Code 管理' },
  { icon: Smartphone, label: '數位菜單展示' },
  { icon: Bell, label: '即時點餐通知' },
  { icon: Monitor, label: '廚房顯示系統' },
  { icon: CreditCard, label: '線上付款整合' },
]

export default function DineInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-16 px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-10 flex flex-col items-center gap-6 text-center">
          {/* Lock + icon stack */}
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-adm-bg-sunken">
            <QrCode className="h-10 w-10 text-adm-text-tertiary" />
            <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-adm-bg-base border border-adm-border-subtle shadow-sm">
              <Lock className="h-3.5 w-3.5 text-adm-text-tertiary" />
            </span>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-semibold text-adm-text-primary">QR 碼桌邊點餐系統</h1>
            </div>
            <p className="text-sm text-adm-text-secondary leading-relaxed max-w-sm">
              顧客掃描桌上 QR Code 即可瀏覽菜單、點餐並線上付款。廚房端即時收到通知，提升出餐效率。
            </p>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="md">開發中</Badge>
            <Badge variant="neutral" size="md">預計開放 2026 Q3</Badge>
          </div>

          {/* Feature list */}
          <div className="w-full rounded-adm-lg border border-adm-border-subtle bg-adm-bg-base divide-y divide-adm-border-subtle">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-adm-md bg-adm-bg-sunken shrink-0">
                  <Icon className="h-3.5 w-3.5 text-adm-text-tertiary" />
                </div>
                <span className="text-sm text-adm-text-secondary">{label}</span>
                <Lock className="ml-auto h-3 w-3 text-adm-text-tertiary shrink-0" />
              </div>
            ))}
          </div>

          {/* Admin note */}
          <p className="text-xs text-adm-text-tertiary border border-adm-border-subtle rounded-adm-md px-4 py-2.5 bg-adm-bg-base w-full">
            此功能僅供超級管理員預覽
          </p>

          <Link
            href="/admin/dashboard"
            className="text-xs text-adm-brand-600 hover:underline"
          >
            返回 Dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
