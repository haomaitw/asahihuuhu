'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type FormState = { tagline1: LocalizedStr; tagline2: LocalizedStr; heroLede: LocalizedStr }

function initForm(data?: any): FormState {
  return {
    tagline1: { 'zh-TW': data?.tagline1 ?? '', en: '', ja: '' },
    tagline2: { 'zh-TW': data?.tagline2 ?? '', en: '', ja: '' },
    heroLede: { 'zh-TW': data?.heroLede ?? '', en: '', ja: '' },
  }
}

export function HomePageForm({ initialData }: { initialData?: any }) {
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    Promise.all(LOCALES.map(async ({ key }) => {
      const r = await fetch(`/api/globals/home-page?locale=${key}`, { credentials: 'include' })
      return { key, data: await r.json() }
    })).then((results) => {
      setForm({
        tagline1: { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.tagline1 ?? '', en: results.find((r) => r.key === 'en')?.data.tagline1 ?? '', ja: results.find((r) => r.key === 'ja')?.data.tagline1 ?? '' },
        tagline2: { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.tagline2 ?? '', en: results.find((r) => r.key === 'en')?.data.tagline2 ?? '', ja: results.find((r) => r.key === 'ja')?.data.tagline2 ?? '' },
        heroLede: { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.heroLede ?? '', en: results.find((r) => r.key === 'en')?.data.heroLede ?? '', ja: results.find((r) => r.key === 'ja')?.data.heroLede ?? '' },
      })
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await Promise.all(LOCALES.map(({ key }) =>
        fetch(`/api/globals/home-page?locale=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ tagline1: form.tagline1[key as keyof LocalizedStr], tagline2: form.tagline2[key as keyof LocalizedStr], heroLede: form.heroLede[key as keyof LocalizedStr] }),
        })
      ))
      toast.success('首頁設定已儲存')
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const setLoc = (field: keyof FormState, val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">首頁設定</h1>
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>儲存設定</Button>
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
          <Input label={`主標語第一行 (${locale})`} value={form.tagline1[locale]} onChange={(e) => setLoc('tagline1', e.target.value)} placeholder="職人堅持的日式刨冰" />
          <Input label={`主標語第二行 (${locale})`} value={form.tagline2[locale]} onChange={(e) => setLoc('tagline2', e.target.value)} placeholder="午後與大自然的一場沁涼約會" />
          <div className="space-y-1.5">
            <Label>Hero 副說明 ({locale})</Label>
            <textarea value={form.heroLede[locale]} onChange={(e) => setLoc('heroLede', e.target.value)} rows={3} placeholder="主視覺區的副標說明文字"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
