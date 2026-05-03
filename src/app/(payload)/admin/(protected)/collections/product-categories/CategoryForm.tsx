'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type FormState = { name: LocalizedStr; slug: string; order: number }

function initForm(data?: any): FormState {
  return {
    name: { 'zh-TW': data?.name ?? '', en: '', ja: '' },
    slug: data?.slug ?? '',
    order: data?.order ?? 0,
  }
}

export function CategoryForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter()
  const id = initialData?.id
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!isEdit || !id) return
    Promise.all(LOCALES.map(async ({ key }) => {
      const r = await fetch(`/api/product-categories/${id}?locale=${key}`, { credentials: 'include' })
      return { key, data: await r.json() }
    })).then((results) => {
      const g = (k: string, f: string) => results.find((r) => r.key === k)?.data[f] ?? ''
      setForm((prev) => ({
        ...prev,
        name: { 'zh-TW': g('zh-TW', 'name'), en: g('en', 'name'), ja: g('ja', 'name') },
      }))
    })
  }, [isEdit, id])

  const handleSave = async () => {
    if (!form.slug.trim()) { toast.error('請填寫 Slug'); return }
    setLoading(true)
    try {
      const basePayload = { slug: form.slug, order: form.order }
      await Promise.all(LOCALES.map(({ key }) =>
        fetch(isEdit ? `/api/product-categories/${id}?locale=${key}` : `/api/product-categories?locale=${key}`, {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...basePayload, name: form.name[key as keyof LocalizedStr] }),
        })
      ))
      toast.success(isEdit ? '分類已更新' : '分類已建立')
      router.push('/admin/collections/product-categories')
      router.refresh()
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!isEdit || !id || !confirm('確定刪除此分類？')) return
    try {
      await fetch(`/api/product-categories/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('已刪除')
      router.push('/admin/collections/product-categories')
      router.refresh()
    } catch { toast.error('刪除失敗') }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">{isEdit ? '編輯商品分類' : '新增商品分類'}</h1>
        <div className="flex gap-2">
          {isEdit && (
            <Button variant="danger" size="md" onClick={handleDelete}>刪除</Button>
          )}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>儲存</Button>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 border-b border-adm-border-subtle">
        {LOCALES.map(({ key, label }) => (
          <button key={key} onClick={() => setLocale(key as any)}
            className={cn('px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              locale === key ? 'border-adm-brand-500 text-adm-brand-600' : 'border-transparent text-adm-text-tertiary hover:text-adm-text-primary')}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <Input
            label={`分類名稱 (${locale})`}
            value={form.name[locale]}
            onChange={(e) => setForm((p) => ({ ...p, name: { ...p.name, [locale]: e.target.value } }))}
            placeholder="如：季節限定"
          />
          <Input
            label="Slug（英文識別碼）"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            placeholder="如：seasonal"
          />
          <Input
            label="排列順序"
            type="number"
            value={String(form.order)}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
