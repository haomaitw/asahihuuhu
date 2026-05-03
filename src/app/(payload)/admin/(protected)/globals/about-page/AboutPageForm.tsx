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

type FormState = { heroSubtitle: LocalizedStr; storyP1: LocalizedStr; storyP2: LocalizedStr; storyP3: LocalizedStr }

function initForm(data?: any): FormState {
  return {
    heroSubtitle: { 'zh-TW': data?.heroSubtitle ?? '', en: '', ja: '' },
    storyP1:      { 'zh-TW': data?.storyP1 ?? '', en: '', ja: '' },
    storyP2:      { 'zh-TW': data?.storyP2 ?? '', en: '', ja: '' },
    storyP3:      { 'zh-TW': data?.storyP3 ?? '', en: '', ja: '' },
  }
}

export function AboutPageForm({ initialData }: { initialData?: any }) {
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    Promise.all(LOCALES.map(async ({ key }) => {
      const r = await fetch(`/api/globals/about-page?locale=${key}`, { credentials: 'include' })
      return { key, data: await r.json() }
    })).then((results) => {
      const g = (k: string, field: string) => results.find((r) => r.key === k)?.data[field] ?? ''
      setForm({
        heroSubtitle: { 'zh-TW': g('zh-TW', 'heroSubtitle'), en: g('en', 'heroSubtitle'), ja: g('ja', 'heroSubtitle') },
        storyP1:      { 'zh-TW': g('zh-TW', 'storyP1'),      en: g('en', 'storyP1'),      ja: g('ja', 'storyP1') },
        storyP2:      { 'zh-TW': g('zh-TW', 'storyP2'),      en: g('en', 'storyP2'),      ja: g('ja', 'storyP2') },
        storyP3:      { 'zh-TW': g('zh-TW', 'storyP3'),      en: g('en', 'storyP3'),      ja: g('ja', 'storyP3') },
      })
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await Promise.all(LOCALES.map(({ key }) =>
        fetch(`/api/globals/about-page?locale=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ heroSubtitle: form.heroSubtitle[key as keyof LocalizedStr], storyP1: form.storyP1[key as keyof LocalizedStr], storyP2: form.storyP2[key as keyof LocalizedStr], storyP3: form.storyP3[key as keyof LocalizedStr] }),
        })
      ))
      toast.success('關於設定已儲存')
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const setLoc = (field: keyof FormState, val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">關於設定</h1>
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
          <Input label={`Hero 副標 (${locale})`} value={form.heroSubtitle[locale]} onChange={(e) => setLoc('heroSubtitle', e.target.value)} placeholder="關於我們的副標語" />
          {(['storyP1', 'storyP2', 'storyP3'] as const).map((field, i) => (
            <div key={field} className="space-y-1.5">
              <Label>故事段落 {i + 1} ({locale})</Label>
              <textarea value={form[field][locale]} onChange={(e) => setLoc(field, e.target.value)} rows={4} placeholder={`第 ${i + 1} 段品牌故事…`}
                className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
