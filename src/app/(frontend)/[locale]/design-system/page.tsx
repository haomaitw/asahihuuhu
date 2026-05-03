'use client'
import * as React from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import {
  Package,
  ShoppingCart,
  Settings,
  Users,
  BarChart2,
  FileText,
  Search,
  Bell,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Download,
} from 'lucide-react'

import '@/styles/admin-tokens.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'
import { Pagination } from '@/components/ui/pagination'
import { DataTable } from '@/components/ui/data-table'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { CommandMenu } from '@/components/ui/command-menu'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-adm-text-primary">{title}</h2>
        <div className="mt-2 h-px bg-adm-border-subtle" />
      </div>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider font-medium text-adm-text-tertiary">{title}</h3>
      {children}
    </div>
  )
}

// ── Color swatch ─────────────────────────────────────────────────────────────

function ColorSwatch({ label, value, textDark }: { label: string; value: string; textDark?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-10 w-full rounded-adm-md border border-adm-border-subtle"
        style={{ backgroundColor: value }}
      />
      <span className="text-2xs text-adm-text-tertiary">{label}</span>
      <span className="text-2xs font-mono text-adm-text-disabled">{value}</span>
    </div>
  )
}

// ── Sample order data ─────────────────────────────────────────────────────────

type Order = {
  id: string
  customer: string
  product: string
  amount: number
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded'
  date: string
}

const sampleOrders: Order[] = [
  { id: 'ORD-001', customer: '田中 太郎', product: '朝日夫婦 經典醬油 × 2', amount: 520, status: 'paid',      date: '2026-05-01' },
  { id: 'ORD-002', customer: '林 美玲',   product: '朝日夫婦 味噌禮盒',       amount: 880, status: 'shipped',   date: '2026-04-30' },
  { id: 'ORD-003', customer: '陳 大明',   product: '朝日夫婦 柚子醋 × 3',    amount: 660, status: 'pending',   date: '2026-04-29' },
  { id: 'ORD-004', customer: '王 小芳',   product: '朝日夫婦 黑蒜醬油',       amount: 350, status: 'cancelled', date: '2026-04-28' },
  { id: 'ORD-005', customer: '佐藤 花子', product: '朝日夫婦 春季限定組',     amount: 1240, status: 'refunded', date: '2026-04-27' },
]

const statusConfig: Record<Order['status'], { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'neutral' }> = {
  pending:   { label: '待付款', variant: 'warning' },
  paid:      { label: '已付款', variant: 'success' },
  shipped:   { label: '已出貨', variant: 'info' },
  cancelled: { label: '已取消', variant: 'danger' },
  refunded:  { label: '已退款', variant: 'neutral' },
}

const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: '訂單編號',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-adm-text-secondary">{getValue() as string}</span>
    ),
    size: 100,
  },
  {
    accessorKey: 'customer',
    header: '客戶',
    cell: ({ getValue }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarFallback className="text-[10px]">{(getValue() as string).slice(0, 1)}</AvatarFallback>
        </Avatar>
        <span className="text-sm text-adm-text-primary">{getValue() as string}</span>
      </div>
    ),
  },
  {
    accessorKey: 'product',
    header: '商品',
  },
  {
    accessorKey: 'amount',
    header: '金額',
    cell: ({ getValue }) => (
      <span className="tabular-nums font-medium">NT$ {(getValue() as number).toLocaleString()}</span>
    ),
    size: 110,
  },
  {
    accessorKey: 'status',
    header: '狀態',
    cell: ({ getValue }) => {
      const s = getValue() as Order['status']
      const cfg = statusConfig[s]
      return <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
    },
    size: 100,
  },
  {
    accessorKey: 'date',
    header: '日期',
    cell: ({ getValue }) => (
      <span className="text-xs text-adm-text-tertiary">{getValue() as string}</span>
    ),
    size: 110,
  },
]

// ── Command menu items ────────────────────────────────────────────────────────

const commandItems = [
  { id: '1', label: '新增商品',   group: '商品管理', icon: <Plus className="h-4 w-4" />,       shortcut: '⌘N' },
  { id: '2', label: '查看訂單',   group: '訂單管理', icon: <ShoppingCart className="h-4 w-4" />, shortcut: '⌘O' },
  { id: '3', label: '匯出報表',   group: '報表',     icon: <Download className="h-4 w-4" />,    shortcut: '⌘E' },
  { id: '4', label: '客戶列表',   group: '客戶管理', icon: <Users className="h-4 w-4" />,       shortcut: '⌘U' },
  { id: '5', label: '系統設定',   group: '設定',     icon: <Settings className="h-4 w-4" />,    shortcut: '⌘,' },
  { id: '6', label: '查看分析',   group: '報表',     icon: <BarChart2 className="h-4 w-4" />,   shortcut: '⌘A' },
]

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DesignSystemPage() {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [cmdOpen, setCmdOpen] = React.useState(false)
  const [checkboxA, setCheckboxA] = React.useState(false)
  const [checkboxB, setCheckboxB] = React.useState(true)
  const [switchA, setSwitchA] = React.useState(false)
  const [switchB, setSwitchB] = React.useState(true)
  const [selectedOrders, setSelectedOrders] = React.useState<Order[]>([])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen bg-adm-bg-base">
        {/* Header */}
        <div className="border-b border-adm-border-subtle bg-adm-bg-elevated">
          <div className="mx-auto max-w-5xl px-6 py-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-adm-text-primary">朝日夫婦 Design System</h1>
                <p className="mt-1.5 text-base text-adm-text-secondary">Admin UI component library — Step 1 of 5</p>
              </div>
              <Badge variant="brand" size="md">v1.0.0</Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-16">

          {/* ── 1. Color Palette ── */}
          <Section title="1. Color Palette">
            <SubSection title="Brand (warm brown)">
              <div className="grid grid-cols-5 gap-3 sm:grid-cols-10">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(n => (
                  <ColorSwatch key={n} label={String(n)} value={`var(--adm-brand-${n})`} />
                ))}
              </div>
            </SubSection>

            <SubSection title="Semantic">
              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-adm-text-tertiary uppercase tracking-wider">Success (matcha)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['50', '500', '600'].map(n => (
                      <ColorSwatch key={n} label={n} value={`var(--adm-success-${n})`} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-adm-text-tertiary uppercase tracking-wider">Warning (clay)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['50', '500', '600'].map(n => (
                      <ColorSwatch key={n} label={n} value={`var(--adm-warning-${n})`} />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-adm-text-tertiary uppercase tracking-wider">Danger (muted red)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['50', '500', '600'].map(n => (
                      <ColorSwatch key={n} label={n} value={`var(--adm-danger-${n})`} />
                    ))}
                  </div>
                </div>
              </div>
            </SubSection>

            <SubSection title="Backgrounds & Borders">
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-7">
                {[
                  { label: 'bg-base',     value: '#FAF7F2' },
                  { label: 'bg-elevated', value: '#FFFFFF' },
                  { label: 'bg-sunken',   value: '#F5F0E8' },
                  { label: 'border-subtle',  value: '#EFEAE0' },
                  { label: 'border-default', value: '#E5DFD2' },
                  { label: 'border-strong',  value: '#D4CCB8' },
                  { label: 'border-focus',   value: '#8B6F47' },
                ].map(s => <ColorSwatch key={s.label} label={s.label} value={s.value} />)}
              </div>
            </SubSection>

            <SubSection title="Text">
              <div className="grid grid-cols-5 gap-3">
                {[
                  { label: 'primary',   value: '#1A1614' },
                  { label: 'secondary', value: '#5C544A' },
                  { label: 'tertiary',  value: '#8B8275' },
                  { label: 'disabled',  value: '#B8B0A1' },
                  { label: 'inverse',   value: '#FAF7F2' },
                ].map(s => <ColorSwatch key={s.label} label={s.label} value={s.value} />)}
              </div>
            </SubSection>
          </Section>

          {/* ── 2. Typography ── */}
          <Section title="2. Typography Scale">
            <div className="space-y-4 bg-adm-bg-elevated rounded-adm-xl border border-adm-border-subtle p-6">
              {[
                { size: '4xl', label: '36px / 44px' },
                { size: '3xl', label: '28px / 36px' },
                { size: '2xl', label: '22px / 32px' },
                { size: 'xl',  label: '18px / 28px' },
                { size: 'lg',  label: '16px / 24px' },
                { size: 'base',label: '14px / 22px' },
                { size: 'sm',  label: '13px / 20px' },
                { size: 'xs',  label: '12px / 16px' },
                { size: '2xs', label: '11px / 14px' },
              ].map(({ size, label }) => (
                <div key={size} className="flex items-baseline gap-6 border-b border-adm-border-subtle pb-3 last:border-0 last:pb-0">
                  <span className={`font-mono text-2xs text-adm-text-tertiary w-14 shrink-0`}>{size}</span>
                  <span className={`text-adm-text-primary text-${size}`}>朝日夫婦 Admin — The quick brown fox</span>
                  <span className="ml-auto font-mono text-2xs text-adm-text-disabled shrink-0">{label}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* ── 3. Buttons ── */}
          <Section title="3. Buttons">
            <SubSection title="Variants">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="link">Link Button</Button>
              </div>
            </SubSection>

            <SubSection title="Sizes">
              <div className="flex items-center flex-wrap gap-3">
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="secondary" size="icon"><Plus className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon-sm"><Plus className="h-3.5 w-3.5" /></Button>
              </div>
            </SubSection>

            <SubSection title="States">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" loading>Loading…</Button>
                <Button variant="secondary" loading>Loading…</Button>
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="ghost" disabled>Disabled</Button>
              </div>
            </SubSection>

            <SubSection title="With icons">
              <div className="flex flex-wrap gap-3">
                <Button variant="primary"><Plus className="h-4 w-4" />新增商品</Button>
                <Button variant="secondary"><Download className="h-4 w-4" />匯出</Button>
                <Button variant="ghost"><Edit2 className="h-4 w-4" />編輯</Button>
                <Button variant="danger"><Trash2 className="h-4 w-4" />刪除</Button>
              </div>
            </SubSection>
          </Section>

          {/* ── 4. Badges ── */}
          <Section title="4. Badges">
            <SubSection title="All variants — size md">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral">中性</Badge>
                <Badge variant="brand">品牌</Badge>
                <Badge variant="success">成功</Badge>
                <Badge variant="warning">警告</Badge>
                <Badge variant="danger">危險</Badge>
                <Badge variant="info">資訊</Badge>
              </div>
            </SubSection>

            <SubSection title="All variants — size sm">
              <div className="flex flex-wrap gap-2">
                <Badge variant="neutral" size="sm">中性</Badge>
                <Badge variant="brand" size="sm">品牌</Badge>
                <Badge variant="success" size="sm">成功</Badge>
                <Badge variant="warning" size="sm">警告</Badge>
                <Badge variant="danger" size="sm">危險</Badge>
                <Badge variant="info" size="sm">資訊</Badge>
              </div>
            </SubSection>

            <SubSection title="Order status system">
              <div className="flex flex-wrap gap-2">
                <Badge variant="warning">待付款</Badge>
                <Badge variant="success">已付款</Badge>
                <Badge variant="info">已出貨</Badge>
                <Badge variant="neutral">已完成</Badge>
                <Badge variant="danger">已取消</Badge>
                <Badge variant="neutral">已退款</Badge>
              </div>
            </SubSection>
          </Section>

          {/* ── 5. Form Inputs ── */}
          <Section title="5. Form Inputs">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input placeholder="預設輸入框" />
              <Input label="電子郵件" placeholder="name@example.com" required />
              <Input
                label="搜尋商品"
                description="輸入商品名稱或 SKU"
                placeholder="朝日夫婦 醬油…"
                suffix={<Search className="h-4 w-4" />}
              />
              <Input
                label="訂單編號"
                error="此訂單編號不存在，請重新確認。"
                defaultValue="ORD-INVALID"
              />
              <Input label="已停用欄位" placeholder="無法編輯" disabled defaultValue="唯讀內容" />
              <Input type="password" label="密碼" placeholder="••••••••" required />
            </div>
          </Section>

          {/* ── 6. Textarea ── */}
          <Section title="6. Textarea">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Textarea placeholder="請輸入商品描述…" />
              <Textarea label="商品描述" description="最多 500 字" placeholder="精選台灣在地食材…" required />
              <Textarea label="客服備註" error="備註不可超過 500 字。" defaultValue="這是一段太長的備註文字，超過了系統允許的字數上限，請縮短後再提交。" />
              <Textarea label="已停用" disabled defaultValue="這個欄位目前不可編輯。" />
            </div>
          </Section>

          {/* ── 7. Checkbox & Switch ── */}
          <Section title="7. Checkbox & Switch">
            <div className="flex flex-wrap gap-10">
              <SubSection title="Checkbox">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Checkbox id="cb1" checked={checkboxA} onCheckedChange={(v) => setCheckboxA(!!v)} />
                    <Label htmlFor="cb1">未勾選 → 點擊切換</Label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Checkbox id="cb2" checked={checkboxB} onCheckedChange={(v) => setCheckboxB(!!v)} />
                    <Label htmlFor="cb2">已勾選 → 點擊取消</Label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Checkbox id="cb3" disabled />
                    <Label htmlFor="cb3" className="opacity-50">已停用（未勾選）</Label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Checkbox id="cb4" checked disabled />
                    <Label htmlFor="cb4" className="opacity-50">已停用（已勾選）</Label>
                  </div>
                </div>
              </SubSection>

              <SubSection title="Switch">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Switch id="sw1" checked={switchA} onCheckedChange={setSwitchA} />
                    <Label htmlFor="sw1">關閉 → 點擊開啟</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="sw2" checked={switchB} onCheckedChange={setSwitchB} />
                    <Label htmlFor="sw2">開啟 → 點擊關閉</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="sw3" disabled />
                    <Label htmlFor="sw3" className="opacity-50">已停用（關閉）</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch id="sw4" checked disabled />
                    <Label htmlFor="sw4" className="opacity-50">已停用（開啟）</Label>
                  </div>
                </div>
              </SubSection>
            </div>
          </Section>

          {/* ── 8. Cards ── */}
          <Section title="8. Cards">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Basic */}
              <Card>
                <CardContent>
                  <p className="text-sm text-adm-text-secondary">基本卡片，只有 CardContent。</p>
                </CardContent>
              </Card>

              {/* With header + footer */}
              <Card>
                <CardHeader>
                  <CardTitle>訂單總覽</CardTitle>
                  <CardDescription>2026 年 5 月份統計</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold text-adm-text-primary">¥ 128,400</p>
                  <p className="text-sm text-adm-success-600 mt-1">↑ 12.4% 較上月</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" />查看詳情</Button>
                </CardFooter>
              </Card>

              {/* Interactive */}
              <Card interactive>
                <CardHeader>
                  <CardTitle>互動卡片</CardTitle>
                  <CardDescription>hover 有動畫效果</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-adm-text-secondary">將滑鼠移過來試試看。卡片會微微上浮並加深邊框。</p>
                </CardContent>
              </Card>
            </div>
          </Section>

          {/* ── 9. Skeleton ── */}
          <Section title="9. Skeleton Loading">
            <SubSection title="Individual skeletons">
              <div className="flex items-center gap-4 p-4 bg-adm-bg-elevated rounded-adm-xl border border-adm-border-subtle">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24 rounded-adm-md" />
              </div>
            </SubSection>

            <SubSection title="SkeletonTable (5 rows)">
              <SkeletonTable rows={3} />
            </SubSection>
          </Section>

          {/* ── 10. EmptyState & ErrorState ── */}
          <Section title="10. Empty & Error States">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-adm-xl border border-adm-border-subtle bg-adm-bg-elevated overflow-hidden">
                <EmptyState
                  icon={<Package className="h-6 w-6" />}
                  title="尚無商品"
                  description="您還沒有新增任何商品。點擊下方按鈕開始建立。"
                  action={{ label: '新增第一個商品', onClick: () => alert('新增商品！') }}
                />
              </div>
              <div className="rounded-adm-xl border border-adm-border-subtle bg-adm-bg-elevated overflow-hidden">
                <ErrorState
                  title="無法載入訂單"
                  description="連線逾時，請檢查網路後重試。"
                  onRetry={() => alert('重試！')}
                />
              </div>
            </div>
          </Section>

          {/* ── 11. DataTable ── */}
          <Section title="11. DataTable">
            <div className="space-y-3">
              {selectedOrders.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-adm-text-secondary">
                  <span>已選取 {selectedOrders.length} 筆</span>
                  <Button variant="danger" size="sm"><Trash2 className="h-3.5 w-3.5" />批次刪除</Button>
                </div>
              )}
              <DataTable
                columns={orderColumns}
                data={sampleOrders}
                enableRowSelection
                onSelectionChange={setSelectedOrders}
                onRowClick={(row) => console.log('Row clicked:', row.id)}
                emptyTitle="沒有訂單"
                emptyDescription="目前沒有符合條件的訂單資料。"
              />
            </div>
          </Section>

          {/* ── 12. Pagination ── */}
          <Section title="12. Pagination">
            <div className="space-y-4">
              <div className="bg-adm-bg-elevated rounded-adm-xl border border-adm-border-subtle p-4">
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={247}
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
                />
              </div>
              <p className="text-xs text-adm-text-tertiary">目前在第 {page} 頁，每頁 {pageSize} 筆，共 247 筆。</p>
            </div>
          </Section>

          {/* ── 13. Dialog ── */}
          <Section title="13. Dialog">
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">開啟小型對話框 (sm)</Button>
                </DialogTrigger>
                <DialogContent size="sm">
                  <DialogHeader>
                    <DialogTitle>確認刪除</DialogTitle>
                    <DialogDescription>此操作無法復原，商品將從系統中永久刪除。</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-4">
                    <p className="text-sm text-adm-text-secondary">確定要刪除「朝日夫婦 經典醬油」嗎？</p>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">取消</Button>
                    <Button variant="danger">確認刪除</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="primary"><Plus className="h-4 w-4" />新增商品 (md)</Button>
                </DialogTrigger>
                <DialogContent size="md">
                  <DialogHeader>
                    <DialogTitle>新增商品</DialogTitle>
                    <DialogDescription>填寫以下資訊以建立新商品。</DialogDescription>
                  </DialogHeader>
                  <div className="px-6 py-5 space-y-4">
                    <Input label="商品名稱" placeholder="朝日夫婦 ..." required />
                    <Input label="SKU" placeholder="AH-001" required />
                    <Textarea label="商品描述" placeholder="精選台灣在地食材…" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input label="定價" placeholder="NT$ 0" type="number" />
                      <Input label="庫存" placeholder="0" type="number" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="secondary">取消</Button>
                    <Button variant="primary">建立商品</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </Section>

          {/* ── 14. Dropdown + Tooltip + CommandMenu ── */}
          <Section title="14. Dropdown, Tooltip & Command Menu">
            <div className="flex flex-wrap gap-4">
              {/* Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary">操作選單 ▾</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>商品操作</DropdownMenuLabel>
                  <DropdownMenuItem><Eye className="h-4 w-4" />查看詳情</DropdownMenuItem>
                  <DropdownMenuItem><Edit2 className="h-4 w-4" />編輯</DropdownMenuItem>
                  <DropdownMenuItem><Download className="h-4 w-4" />匯出</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-adm-danger-500 hover:!bg-adm-danger-50 focus:!bg-adm-danger-50">
                    <Trash2 className="h-4 w-4" />刪除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tooltip */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>通知中心</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <FileText className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">查看報表</TooltipContent>
              </Tooltip>

              {/* Command Menu */}
              <Button variant="secondary" onClick={() => setCmdOpen(true)}>
                <Search className="h-4 w-4" />開啟命令選單 (⌘K)
              </Button>
            </div>

            <CommandMenu
              open={cmdOpen}
              onOpenChange={setCmdOpen}
              items={commandItems}
            />
          </Section>

          {/* ── 15. Avatar ── */}
          <Section title="15. Avatar">
            <div className="flex items-center gap-4 flex-wrap">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://i.pravatar.cc/40?img=1" alt="用戶" />
                <AvatarFallback>田</AvatarFallback>
              </Avatar>
              <Avatar className="h-10 w-10">
                <AvatarFallback>林</AvatarFallback>
              </Avatar>
              <Avatar className="h-8 w-8">
                <AvatarFallback>王</AvatarFallback>
              </Avatar>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[9px]">陳</AvatarFallback>
              </Avatar>
              <div className="flex -space-x-2">
                {['田', '林', '王', '陳', '佐'].map((name, i) => (
                  <Avatar key={i} className="h-8 w-8 border-2 border-adm-bg-elevated">
                    <AvatarFallback>{name}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          </Section>

          {/* ── 16. Separator ── */}
          <Section title="16. Separator">
            <div className="space-y-4 bg-adm-bg-elevated rounded-adm-xl border border-adm-border-subtle p-6">
              <p className="text-sm text-adm-text-secondary">上方內容區塊</p>
              <Separator />
              <p className="text-sm text-adm-text-secondary">中間內容區塊</p>
              <div className="flex items-center gap-4 h-8">
                <span className="text-sm text-adm-text-secondary">左側</span>
                <Separator orientation="vertical" />
                <span className="text-sm text-adm-text-secondary">中間</span>
                <Separator orientation="vertical" />
                <span className="text-sm text-adm-text-secondary">右側</span>
              </div>
              <Separator />
              <p className="text-sm text-adm-text-secondary">下方內容區塊</p>
            </div>
          </Section>

          {/* Footer */}
          <div className="border-t border-adm-border-subtle pt-8 pb-4">
            <p className="text-xs text-adm-text-tertiary text-center">
              朝日夫婦 Admin Design System — Step 1 of 5 complete
            </p>
          </div>

        </div>
      </div>
    </TooltipProvider>
  )
}
