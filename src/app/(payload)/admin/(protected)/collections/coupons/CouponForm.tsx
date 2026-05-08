'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type CouponData = {
  id?: string
  code?: string
  description?: string
  type?: string
  value?: number | null
  minOrderAmount?: number | null
  maxDiscountAmount?: number | null
  maxUses?: number | null
  maxUsesPerCustomer?: number | null
  validFrom?: string | null
  validUntil?: string | null
  isActive?: boolean
}

type Props = {
  initialData?: CouponData
}

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return ''
  // Payload stores dates as ISO strings; input[datetime-local] needs "YYYY-MM-DDTHH:mm"
  return iso.slice(0, 16)
}

function fieldCls(className?: string) {
  return `h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 disabled:bg-adm-bg-sunken disabled:cursor-not-allowed disabled:text-adm-text-disabled ${className ?? ''}`
}

export function CouponForm({ initialData }: Props) {
  const router = useRouter()
  const isEdit = !!initialData?.id

  const [code, setCode] = React.useState(initialData?.code ?? '')
  const [description, setDescription] = React.useState(initialData?.description ?? '')
  const [type, setType] = React.useState(initialData?.type ?? 'percentage')
  const [value, setValue] = React.useState(initialData?.value?.toString() ?? '')
  const [minOrderAmount, setMinOrderAmount] = React.useState(initialData?.minOrderAmount?.toString() ?? '')
  const [maxDiscountAmount, setMaxDiscountAmount] = React.useState(initialData?.maxDiscountAmount?.toString() ?? '')
  const [maxUses, setMaxUses] = React.useState(initialData?.maxUses?.toString() ?? '')
  const [maxUsesPerCustomer, setMaxUsesPerCustomer] = React.useState(initialData?.maxUsesPerCustomer?.toString() ?? '1')
  const [validFrom, setValidFrom] = React.useState(toDatetimeLocal(initialData?.validFrom))
  const [validUntil, setValidUntil] = React.useState(toDatetimeLocal(initialData?.validUntil))
  const [isActive, setIsActive] = React.useState(initialData?.isActive ?? true)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) {
      toast.error('請填寫折扣碼')
      return
    }
    if (!type) {
      toast.error('請選擇折扣類型')
      return
    }

    const body: Record<string, any> = {
      code: code.toUpperCase().trim(),
      description: description.trim() || undefined,
      type,
      isActive,
    }

    if (type !== 'free_shipping' && value !== '') {
      body.value = parseFloat(value)
    }
    if (minOrderAmount !== '') body.minOrderAmount = parseFloat(minOrderAmount)
    if (type === 'percentage' && maxDiscountAmount !== '') {
      body.maxDiscountAmount = parseFloat(maxDiscountAmount)
    }
    if (maxUses !== '') body.maxUses = parseInt(maxUses, 10)
    if (maxUsesPerCustomer !== '') body.maxUsesPerCustomer = parseInt(maxUsesPerCustomer, 10)
    if (validFrom) body.validFrom = new Date(validFrom).toISOString()
    if (validUntil) body.validUntil = new Date(validUntil).toISOString()

    setLoading(true)
    try {
      const url = isEdit ? `/api/coupons/${initialData.id}` : '/api/coupons'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.errors?.[0]?.message ?? '儲存失敗')
      }
      toast.success(isEdit ? '優惠券已更新' : '優惠券已建立')
      router.push('/admin/collections/coupons')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? '儲存失敗，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  const sectionHeader = (title: string) => (
    <div className="px-5 py-4 border-b border-adm-border-subtle">
      <h2 className="text-sm font-semibold text-adm-text-primary">{title}</h2>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/collections/coupons"
            className="inline-flex items-center gap-1 text-xs text-adm-text-tertiary hover:text-adm-text-primary mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> 優惠券列表
          </Link>
          <h1 className="text-2xl font-semibold text-adm-text-primary">
            {isEdit ? `編輯 ${initialData?.code}` : '新增優惠券'}
          </h1>
        </div>
        <Button type="submit" variant="primary" size="md" loading={loading}>
          {isEdit ? '儲存變更' : '建立優惠券'}
        </Button>
      </div>

      {/* Basic */}
      <Card>
        {sectionHeader('基本設定')}
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="coupon-code" required>折扣碼</Label>
            <input
              id="coupon-code"
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER20"
              className={fieldCls('font-mono')}
              required
            />
            <p className="text-xs text-adm-text-tertiary">建議使用大寫英數，系統會自動轉換</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-desc">折扣描述</Label>
            <input
              id="coupon-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例：夏日優惠 8 折"
              className={fieldCls()}
            />
            <p className="text-xs text-adm-text-tertiary">顯示給顧客的說明文字</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="coupon-type" required>折扣類型</Label>
            <select
              id="coupon-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={fieldCls()}
            >
              <option value="percentage">百分比折扣（%）</option>
              <option value="fixed_amount">固定金額折扣（NT$）</option>
              <option value="free_shipping">免運費</option>
            </select>
          </div>

          {type !== 'free_shipping' && (
            <div className="space-y-1.5">
              <Label htmlFor="coupon-value">
                折扣值{type === 'percentage' ? '（%）' : '（NT$）'}
              </Label>
              <input
                id="coupon-value"
                type="number"
                min={0}
                step={type === 'percentage' ? 1 : 1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'percentage' ? '例：20（代表 8 折）' : '例：100'}
                className={fieldCls()}
              />
              {type === 'percentage' && (
                <p className="text-xs text-adm-text-tertiary">輸入 1–100 的整數，例如輸入 20 表示折扣 20%（即打 8 折）</p>
              )}
            </div>
          )}

          {type === 'percentage' && (
            <div className="space-y-1.5">
              <Label htmlFor="max-discount">最高折扣上限（NT$）</Label>
              <input
                id="max-discount"
                type="number"
                min={0}
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                placeholder="留空表示無上限"
                className={fieldCls()}
              />
              <p className="text-xs text-adm-text-tertiary">百分比折扣時，折扣金額最高不超過此值</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restrictions */}
      <Card>
        {sectionHeader('使用條件')}
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="min-order">最低訂單金額（NT$）</Label>
            <input
              id="min-order"
              type="number"
              min={0}
              value={minOrderAmount}
              onChange={(e) => setMinOrderAmount(e.target.value)}
              placeholder="留空表示無限制"
              className={fieldCls()}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="max-uses">最大使用次數</Label>
              <input
                id="max-uses"
                type="number"
                min={0}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="留空=無限次數"
                className={fieldCls()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="max-uses-per">每位會員限用次數</Label>
              <input
                id="max-uses-per"
                type="number"
                min={0}
                value={maxUsesPerCustomer}
                onChange={(e) => setMaxUsesPerCustomer(e.target.value)}
                placeholder="留空=無限制"
                className={fieldCls()}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="valid-from">有效開始時間</Label>
              <input
                id="valid-from"
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className={fieldCls()}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valid-until">有效結束時間</Label>
              <input
                id="valid-until"
                type="datetime-local"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className={fieldCls()}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card>
        {sectionHeader('狀態')}
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-adm-text-primary">啟用優惠券</p>
              <p className="text-xs text-adm-text-tertiary mt-0.5">停用後顧客將無法使用此折扣碼</p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit (bottom) */}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="md" loading={loading}>
          {isEdit ? '儲存變更' : '建立優惠券'}
        </Button>
      </div>
    </form>
  )
}
