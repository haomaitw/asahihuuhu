'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]

// Extract plain text from either a plain string or legacy Payload Lexical JSON
function fromBody(body: any): string {
  if (!body) return ''
  if (typeof body === 'string') return body
  if (body?.root?.children) {
    return body.root.children
      .map((node: any) => node.children?.map((c: any) => c.text ?? '').join('') ?? '')
      .join('\n')
  }
  return ''
}

type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type FormState = {
  title: LocalizedStr
  slug: string
  date: string
  status: string
  body: LocalizedStr
}

function initForm(data?: any): FormState {
  return {
    title: { 'zh-TW': data?.title ?? '', en: '', ja: '' },
    slug: data?.slug ?? '',
    date: data?.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    status: data?.status ?? 'draft',
    body: { 'zh-TW': fromBody(data?.body), en: '', ja: '' },
  }
}

export function NewsForm({ initialData, id }: { initialData?: any; id?: string }) {
  const router = useRouter()
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const isEdit = !!id

  React.useEffect(() => {
    if (!id) return
    fetch(`/api/admin/news/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          title: {
            'zh-TW': data.title?.['zh-TW'] ?? prev.title['zh-TW'],
            en:      data.title?.en ?? '',
            ja:      data.title?.ja ?? '',
          },
          body: {
            'zh-TW': fromBody(data.body?.['zh-TW'] ?? data.body),
            en:      fromBody(data.body?.en ?? ''),
            ja:      fromBody(data.body?.ja ?? ''),
          },
          slug:   data.slug ?? prev.slug,
          date:   data.date ? new Date(data.date).toISOString().split('T')[0] : prev.date,
          status: data.status ?? prev.status,
        }))
      })
  }, [id])

  const handleSave = async () => {
    if (!form.slug) { toast.error('請填寫 Slug'); return }
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/news/${id}` : '/api/admin/news'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload = {
        title:  { 'zh-TW': form.title['zh-TW'], en: form.title.en, ja: form.title.ja },
        body:   { 'zh-TW': form.body['zh-TW'],  en: form.body.en,  ja: form.body.ja },
        slug:   form.slug,
        date:   form.date,
        status: form.status,
      }
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      toast.success(isEdit ? '消息已更新' : '消息已建立')
      router.push('/admin/collections/news')
      router.refresh()
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const handleDelete = async () => {
    if (!id || !confirm('確定刪除？')) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/news/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('消息已刪除')
      router.push('/admin/collections/news')
      router.refresh()
    } catch { toast.error('刪除失敗') } finally { setDeleting(false) }
  }

  const setLoc = (field: 'title' | 'body', val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">{isEdit ? '編輯消息' : '新增消息'}</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">
            <Link href="/admin/collections/news" className="hover:underline">最新消息</Link> / {isEdit ? form.title['zh-TW'] || id : '新增'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEdit && <Button variant="danger" size="md" loading={deleting} onClick={handleDelete}><Trash2 className="h-4 w-4" /> 刪除</Button>}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>{isEdit ? '儲存變更' : '發布消息'}</Button>
        </div>
      </div>

      {/* Common fields */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="news-slug" className="font-mono" />
            <Input label="發布日期" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>狀態</Label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15">
              <option value="draft">草稿</option>
              <option value="published">已發布</option>
            </select>
          </div>
        </CardContent>
      </Card>

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
          <Input label={`標題 (${locale})`} value={form.title[locale]} onChange={(e) => setLoc('title', e.target.value)} placeholder="消息標題" />
          <div className="space-y-1.5">
            <Label>內容 ({locale})</Label>
            <textarea value={form.body[locale]} onChange={(e) => setLoc('body', e.target.value)} placeholder="消息內容…" rows={10}
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-y" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
