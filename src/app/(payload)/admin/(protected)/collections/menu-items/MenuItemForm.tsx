'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, X, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
const CATEGORIES = [
  { value: 'kakigori', label: '刨冰 (KAKIGORI)' },
  { value: 'crepes',   label: '可麗餅 (CREPES)' },
  { value: 'drinks',   label: '飲品 (DRINKS)' },
  { value: 'goods',    label: '商品 (GOODS)' },
]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type FormState = {
  name: LocalizedStr
  category: string
  image: string
  badge: string
  order: number
  isAvailable: boolean
}

function toLocStr(val: any): LocalizedStr {
  if (!val) return { 'zh-TW': '', en: '', ja: '' }
  if (typeof val === 'string') return { 'zh-TW': val, en: '', ja: '' }
  return { 'zh-TW': val['zh-TW'] ?? '', en: val.en ?? '', ja: val.ja ?? '' }
}

function initForm(data?: any): FormState {
  return {
    name:        toLocStr(data?.name),
    category:    data?.category ?? 'kakigori',
    image:       data?.image ?? '',
    badge:       data?.badge ?? '',
    order:       data?.order ?? 0,
    isAvailable: data?.isAvailable ?? true,
  }
}

const inputCls = 'w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

export function MenuItemForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter()
  const id = initialData?.id
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const imgRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isEdit || !id) return
    fetch(`/api/admin/menu-items/${id}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setForm(initForm(data)) })
      .catch(() => {})
  }, [isEdit, id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
      const r = await fetch('/api/admin/media', { method: 'POST', body: fd, credentials: 'include' })
      const { doc } = await r.json()
      setForm((p) => ({ ...p, image: doc.url ?? '' }))
      toast.success('圖片上傳成功')
    } catch {
      toast.error('圖片上傳失敗')
    } finally {
      setUploading(false)
      if (imgRef.current) imgRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.name['zh-TW'].trim()) { toast.error('請填寫品項名稱'); return }
    if (!form.category) { toast.error('請選擇分類'); return }
    setLoading(true)
    try {
      const payload = {
        name:        form.name,
        category:    form.category,
        image:       form.image || null,
        badge:       form.badge || null,
        order:       form.order,
        isAvailable: form.isAvailable,
      }
      const url = isEdit ? `/api/admin/menu-items/${id}` : '/api/admin/menu-items'
      const method = isEdit ? 'PATCH' : 'POST'
      const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err?.error ?? '儲存失敗')
      }
      toast.success(isEdit ? '品項已更新' : '品項已建立')
      router.push('/admin/collections/menu-items')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? '儲存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('確定刪除此品項？')) return
    try {
      await fetch(`/api/admin/menu-items/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('品項已刪除')
      router.push('/admin/collections/menu-items')
      router.refresh()
    } catch {
      toast.error('刪除失敗')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">{isEdit ? '編輯菜單品項' : '新增菜單品項'}</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">
            <a href="/admin/collections/menu-items" className="hover:underline">菜單管理</a>
            {' / '}{isEdit ? (form.name['zh-TW'] || id) : '新增'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <Button variant="danger" size="md" onClick={handleDelete}>刪除</Button>
          )}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
            {isEdit ? '儲存變更' : '建立品項'}
          </Button>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 border-b border-adm-border-subtle pb-0">
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLocale(key as any)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              locale === key
                ? 'border-adm-brand-500 text-adm-brand-600'
                : 'border-transparent text-adm-text-tertiary hover:text-adm-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <Input
            label={`品項名稱 (${locale})`}
            value={form.name[locale]}
            onChange={(e) => setForm((p) => ({ ...p, name: { ...p.name, [locale]: e.target.value } }))}
            placeholder="品項名稱"
          />
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">基本設定</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>分類</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className={inputCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>標籤</Label>
              <select
                value={form.badge}
                onChange={(e) => setForm((p) => ({ ...p, badge: e.target.value }))}
                className={inputCls}
              >
                <option value="">— 無 —</option>
                <option value="new">NEW 新品</option>
                <option value="seasonal">季節限定</option>
              </select>
            </div>
          </div>
          <Input
            label="排序"
            type="number"
            value={String(form.order)}
            onChange={(e) => setForm((p) => ({ ...p, order: parseInt(e.target.value, 10) || 0 }))}
            placeholder="0"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
              className="h-4 w-4 rounded border-adm-border-default accent-adm-brand-500"
            />
            <span className="text-sm text-adm-text-primary">顯示於菜單</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">品項圖片</h2>
        </div>
        <CardContent className="p-5 flex items-center gap-4">
          {form.image ? (
            <div className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="" className="h-28 w-28 rounded-adm-lg object-cover bg-adm-bg-sunken" />
              <button
                onClick={() => setForm((p) => ({ ...p, image: '' }))}
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-adm-danger-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-28 w-28 rounded-adm-lg bg-adm-bg-sunken flex items-center justify-center">
              <UtensilsCrossed className="h-8 w-8 text-adm-text-disabled" />
            </div>
          )}
          <div className="space-y-2">
            <Button variant="secondary" size="sm" loading={uploading} onClick={() => imgRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" />
              上傳圖片
            </Button>
            <p className="text-xs text-adm-text-tertiary">建議比例 1:1，JPG/PNG</p>
          </div>
          <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </CardContent>
      </Card>
    </div>
  )
}
