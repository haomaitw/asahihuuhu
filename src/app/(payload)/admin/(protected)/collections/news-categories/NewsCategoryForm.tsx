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

type FormState = { name: LocalizedStr; slug: string }

function toLocStr(val: any): LocalizedStr {
  if (!val) return { 'zh-TW': '', en: '', ja: '' }
  if (typeof val === 'string') return { 'zh-TW': val, en: '', ja: '' }
  return { 'zh-TW': val['zh-TW'] ?? '', en: val.en ?? '', ja: val.ja ?? '' }
}

function initForm(data?: any): FormState {
  return {
    name: toLocStr(data?.name),
    slug: data?.slug ?? '',
  }
}

export function NewsCategoryForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter()
  const id = initialData?.id
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!isEdit || !id) return
    fetch(`/api/admin/news-categories/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setForm(initForm(data)))
      .catch(() => {})
  }, [isEdit, id])

  const handleSave = async () => {
    if (!form.slug.trim()) { toast.error('請填寫 Slug'); return }
    setLoading(true)
    try {
      const r = await fetch(
        isEdit ? `/api/admin/news-categories/${id}` : '/api/admin/news-categories',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ slug: form.slug, name: form.name }),
        }
      )
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err?.error ?? '儲存失敗')
      }
      toast.success(isEdit ? '分類已更新' : '分類已建立')
      router.push('/admin/collections/news-categories')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? '儲存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit || !id || !confirm('確定刪除此分類？')) return
    try {
      await fetch(`/api/admin/news-categories/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('已刪除')
      router.push('/admin/collections/news-categories')
      router.refresh()
    } catch { toast.error('刪除失敗') }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">{isEdit ? '編輯文章分類' : '新增文章分類'}</h1>
        <div className="flex gap-2">
          {isEdit && <Button variant="danger" size="md" onClick={handleDelete}>刪除</Button>}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>儲存</Button>
        </div>
      </div>

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
            placeholder="如：最新消息"
          />
          <Input
            label="Slug（英文識別碼）"
            value={form.slug}
            onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
            placeholder="如：announcement"
          />
        </CardContent>
      </Card>
    </div>
  )
}
