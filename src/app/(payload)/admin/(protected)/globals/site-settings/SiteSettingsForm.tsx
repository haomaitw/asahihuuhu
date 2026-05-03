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

type FormState = {
  address: LocalizedStr
  contact: LocalizedStr
  hoursWeekday: LocalizedStr
  hoursClosed: LocalizedStr
  facebookUrl: string
  instagramUrl: string
}

function initForm(data?: any): FormState {
  return {
    address:      { 'zh-TW': data?.address ?? '', en: '', ja: '' },
    contact:      { 'zh-TW': data?.contact ?? '', en: '', ja: '' },
    hoursWeekday: { 'zh-TW': data?.hoursWeekday ?? '', en: '', ja: '' },
    hoursClosed:  { 'zh-TW': data?.hoursClosed ?? '', en: '', ja: '' },
    facebookUrl:  data?.facebookUrl ?? '',
    instagramUrl: data?.instagramUrl ?? '',
  }
}

export function SiteSettingsForm({ initialData }: { initialData?: any }) {
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    Promise.all(LOCALES.map(async ({ key }) => {
      const r = await fetch(`/api/globals/site-settings?locale=${key}`, { credentials: 'include' })
      return { key, data: await r.json() }
    })).then((results) => {
      setForm((prev) => ({
        ...prev,
        address:      { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.address ?? prev.address['zh-TW'], en: results.find((r) => r.key === 'en')?.data.address ?? '', ja: results.find((r) => r.key === 'ja')?.data.address ?? '' },
        contact:      { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.contact ?? '', en: results.find((r) => r.key === 'en')?.data.contact ?? '', ja: results.find((r) => r.key === 'ja')?.data.contact ?? '' },
        hoursWeekday: { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.hoursWeekday ?? '', en: results.find((r) => r.key === 'en')?.data.hoursWeekday ?? '', ja: results.find((r) => r.key === 'ja')?.data.hoursWeekday ?? '' },
        hoursClosed:  { 'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.hoursClosed ?? '', en: results.find((r) => r.key === 'en')?.data.hoursClosed ?? '', ja: results.find((r) => r.key === 'ja')?.data.hoursClosed ?? '' },
      }))
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      await Promise.all(LOCALES.map(({ key }) =>
        fetch(`/api/globals/site-settings?locale=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            address: form.address[key as keyof LocalizedStr],
            contact: form.contact[key as keyof LocalizedStr],
            hoursWeekday: form.hoursWeekday[key as keyof LocalizedStr],
            hoursClosed: form.hoursClosed[key as keyof LocalizedStr],
            facebookUrl: form.facebookUrl,
            instagramUrl: form.instagramUrl,
          }),
        })
      ))
      toast.success('設定已儲存')
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const setLoc = (field: keyof Pick<FormState, 'address' | 'contact' | 'hoursWeekday' | 'hoursClosed'>, val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">網站設定</h1>
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>儲存設定</Button>
      </div>

      {/* Social links - not localized */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">社群媒體</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <Input label="Facebook URL" value={form.facebookUrl} onChange={(e) => setForm((f) => ({ ...f, facebookUrl: e.target.value }))} placeholder="https://facebook.com/..." />
          <Input label="Instagram URL" value={form.instagramUrl} onChange={(e) => setForm((f) => ({ ...f, instagramUrl: e.target.value }))} placeholder="https://instagram.com/..." />
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
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">地址與聯絡 ({locale})</h2>
        </div>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>地址 ({locale})</Label>
            <textarea value={form.address[locale]} onChange={(e) => setLoc('address', e.target.value)} rows={2} placeholder="店家地址"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
          </div>
          <Input label={`聯絡方式 (${locale})`} value={form.contact[locale]} onChange={(e) => setLoc('contact', e.target.value)} placeholder="電話或 LINE" />
          <Input label={`平日營業時間 (${locale})`} value={form.hoursWeekday[locale]} onChange={(e) => setLoc('hoursWeekday', e.target.value)} placeholder="週二～週日 10:00–18:00" />
          <Input label={`公休日 (${locale})`} value={form.hoursClosed[locale]} onChange={(e) => setLoc('hoursClosed', e.target.value)} placeholder="每週一公休" />
        </CardContent>
      </Card>
    </div>
  )
}
