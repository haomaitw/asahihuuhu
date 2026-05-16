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
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type FormState = {
  question: LocalizedStr
  answer: LocalizedStr
  order: string
}

function toLocStr(val: any): LocalizedStr {
  if (!val) return { 'zh-TW': '', en: '', ja: '' }
  if (typeof val === 'string') return { 'zh-TW': val, en: '', ja: '' }
  return { 'zh-TW': val['zh-TW'] ?? '', en: val.en ?? '', ja: val.ja ?? '' }
}

function initForm(data?: any): FormState {
  return {
    question: toLocStr(data?.question),
    answer:   toLocStr(data?.answer),
    order:    data?.order?.toString() ?? '0',
  }
}

export function FAQForm({ initialData, id }: { initialData?: any; id?: string }) {
  const router = useRouter()
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const isEdit = !!id

  React.useEffect(() => {
    if (!id) return
    fetch(`/api/admin/faqs/${id}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setForm(initForm(data)))
      .catch(() => {})
  }, [id])

  const handleSave = async () => {
    setLoading(true)
    try {
      const r = await fetch(isEdit ? `/api/admin/faqs/${id}` : '/api/admin/faqs', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question: form.question,
          answer:   form.answer,
          order:    parseInt(form.order) || 0,
        }),
      })
      if (!r.ok) {
        const err = await r.json().catch(() => ({}))
        throw new Error(err?.error ?? '儲存失敗')
      }
      toast.success(isEdit ? '問答已更新' : '問答已建立')
      router.push('/admin/collections/faqs')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? '儲存失敗')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('確定刪除？')) return
    setDeleting(true)
    try {
      await fetch(`/api/admin/faqs/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('問答已刪除')
      router.push('/admin/collections/faqs')
      router.refresh()
    } catch { toast.error('刪除失敗') } finally { setDeleting(false) }
  }

  const setLoc = (field: 'question' | 'answer', val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">{isEdit ? '編輯問答' : '新增問答'}</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">
            <Link href="/admin/collections/faqs" className="hover:underline">常見問答</Link> / {isEdit ? form.question['zh-TW'] || id : '新增'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEdit && <Button variant="danger" size="md" loading={deleting} onClick={handleDelete}><Trash2 className="h-4 w-4" /> 刪除</Button>}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>{isEdit ? '儲存變更' : '建立問答'}</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5">
          <Input label="排列順序" type="number" value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))} placeholder="0" className="w-32" />
        </CardContent>
      </Card>

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
          <Input label={`問題 (${locale})`} value={form.question[locale]} onChange={(e) => setLoc('question', e.target.value)} placeholder="常見問題…" />
          <div className="space-y-1.5">
            <Label>回答 ({locale})</Label>
            <textarea value={form.answer[locale]} onChange={(e) => setLoc('answer', e.target.value)} placeholder="詳細解答…" rows={6}
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-y" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
