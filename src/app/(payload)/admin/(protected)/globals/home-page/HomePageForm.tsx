'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Upload, X, Film, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type MediaRef = { id: string | number; url: string; mimeType?: string; filename?: string } | null

type FormState = {
  tagline1: LocalizedStr
  tagline2: LocalizedStr
  heroLede: LocalizedStr
  seasonalTitle: LocalizedStr
  seasonalDesc: LocalizedStr
  heroVideo: MediaRef
  heroPoster: MediaRef
  seasonalVideo: MediaRef
  seasonalImage: MediaRef
}

function initForm(data?: any): FormState {
  return {
    tagline1:      { 'zh-TW': data?.tagline1 ?? '', en: '', ja: '' },
    tagline2:      { 'zh-TW': data?.tagline2 ?? '', en: '', ja: '' },
    heroLede:      { 'zh-TW': data?.heroLede ?? '', en: '', ja: '' },
    seasonalTitle: { 'zh-TW': data?.seasonalTitle ?? '', en: '', ja: '' },
    seasonalDesc:  { 'zh-TW': data?.seasonalDesc ?? '', en: '', ja: '' },
    heroVideo:     null,
    heroPoster:    null,
    seasonalVideo: null,
    seasonalImage: null,
  }
}

function MediaUploadField({
  label, description, value, onChange, accept, icon
}: {
  label: string
  description?: string
  value: MediaRef
  onChange: (v: MediaRef) => void
  accept: string
  icon: React.ReactNode
}) {
  const [uploading, setUploading] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
      const r = await fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' })
      const { doc } = await r.json()
      onChange({ id: doc.id, url: doc.url ?? '', mimeType: doc.mimeType, filename: doc.filename })
      toast.success('上傳成功')
    } catch { toast.error('上傳失敗') } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-xs text-adm-text-tertiary">{description}</p>}
      {value ? (
        <div className="flex items-center gap-3 rounded-adm-lg border border-adm-border-default bg-adm-bg-elevated p-3">
          {value.mimeType?.startsWith('video') ? (
            <Film className="h-8 w-8 text-adm-brand-400 shrink-0" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt="" className="h-12 w-12 rounded-adm-md object-cover bg-adm-bg-sunken shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-adm-text-primary truncate">{value.filename ?? value.url}</p>
          </div>
          <button onClick={() => onChange(null)} className="text-adm-danger-500 hover:text-adm-danger-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 rounded-adm-lg border-2 border-dashed border-adm-border-default bg-adm-bg-elevated hover:border-adm-brand-400 hover:bg-adm-brand-50/30 transition-colors py-4 text-sm text-adm-text-tertiary"
        >
          {uploading ? <span className="animate-spin h-4 w-4 border-2 border-adm-brand-400 border-t-transparent rounded-full" /> : icon}
          <span>{uploading ? '上傳中…' : '點擊上傳'}</span>
        </button>
      )}
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleUpload} />
    </div>
  )
}

export function HomePageForm({ initialData }: { initialData?: any }) {
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    Promise.all(LOCALES.map(async ({ key }) => {
      const r = await fetch(`/api/globals/home-page?locale=${key}&depth=1`, { credentials: 'include' })
      return { key, data: await r.json() }
    })).then((results) => {
      const g = (k: string, f: string) => results.find((r) => r.key === k)?.data[f] ?? ''
      const zhData = results.find((r) => r.key === 'zh-TW')?.data
      const toRef = (d: any): MediaRef => d ? { id: d.id ?? d, url: d.url ?? '', mimeType: d.mimeType, filename: d.filename } : null
      setForm({
        tagline1:      { 'zh-TW': g('zh-TW', 'tagline1'),      en: g('en', 'tagline1'),      ja: g('ja', 'tagline1') },
        tagline2:      { 'zh-TW': g('zh-TW', 'tagline2'),      en: g('en', 'tagline2'),      ja: g('ja', 'tagline2') },
        heroLede:      { 'zh-TW': g('zh-TW', 'heroLede'),      en: g('en', 'heroLede'),      ja: g('ja', 'heroLede') },
        seasonalTitle: { 'zh-TW': g('zh-TW', 'seasonalTitle'), en: g('en', 'seasonalTitle'), ja: g('ja', 'seasonalTitle') },
        seasonalDesc:  { 'zh-TW': g('zh-TW', 'seasonalDesc'),  en: g('en', 'seasonalDesc'),  ja: g('ja', 'seasonalDesc') },
        heroVideo:     toRef(zhData?.heroVideo),
        heroPoster:    toRef(zhData?.heroPoster),
        seasonalVideo: toRef(zhData?.seasonalVideo),
        seasonalImage: toRef(zhData?.seasonalImage),
      })
    })
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const sharedPayload = {
        heroVideo:     form.heroVideo?.id ?? null,
        heroPoster:    form.heroPoster?.id ?? null,
        seasonalVideo: form.seasonalVideo?.id ?? null,
        seasonalImage: form.seasonalImage?.id ?? null,
      }
      await Promise.all(LOCALES.map(({ key }) =>
        fetch(`/api/globals/home-page?locale=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...sharedPayload,
            tagline1:      form.tagline1[key as keyof LocalizedStr],
            tagline2:      form.tagline2[key as keyof LocalizedStr],
            heroLede:      form.heroLede[key as keyof LocalizedStr],
            seasonalTitle: form.seasonalTitle[key as keyof LocalizedStr],
            seasonalDesc:  form.seasonalDesc[key as keyof LocalizedStr],
          }),
        })
      ))
      toast.success('首頁設定已儲存')
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const setLoc = (field: keyof Pick<FormState, 'tagline1' | 'tagline2' | 'heroLede' | 'seasonalTitle' | 'seasonalDesc'>, val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">首頁設定</h1>
        <Button variant="primary" size="md" loading={loading} onClick={handleSave}>儲存設定</Button>
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

      {/* Hero text */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">英雄區文字</p>
          <Input label={`主標語第一行 (${locale})`} value={form.tagline1[locale]} onChange={(e) => setLoc('tagline1', e.target.value)} placeholder="職人堅持的日式刨冰" />
          <Input label={`主標語第二行 (${locale})`} value={form.tagline2[locale]} onChange={(e) => setLoc('tagline2', e.target.value)} placeholder="午後與大自然的一場沁涼約會" />
          <div className="space-y-1.5">
            <Label>Hero 副說明 ({locale})</Label>
            <textarea value={form.heroLede[locale]} onChange={(e) => setLoc('heroLede', e.target.value)} rows={3} placeholder="主視覺區的副標說明文字"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
          </div>
        </CardContent>
      </Card>

      {/* Hero media */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">英雄區影片 / 圖片</p>
          <MediaUploadField
            label="英雄區影片（MP4）"
            description="首頁主視覺背景影片，建議解析度 1920×1080"
            value={form.heroVideo}
            onChange={(v) => setForm((p) => ({ ...p, heroVideo: v }))}
            accept="video/*"
            icon={<Film className="h-5 w-5" />}
          />
          <MediaUploadField
            label="英雄區封面圖"
            description="影片載入前的預覽圖，建議尺寸 1920×1080"
            value={form.heroPoster}
            onChange={(v) => setForm((p) => ({ ...p, heroPoster: v }))}
            accept="image/*"
            icon={<ImageIcon className="h-5 w-5" />}
          />
        </CardContent>
      </Card>

      {/* Seasonal section */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">季節限定區</p>
          <Input label={`季節標題 (${locale})`} value={form.seasonalTitle[locale]} onChange={(e) => setLoc('seasonalTitle', e.target.value)} placeholder="季節限定" />
          <div className="space-y-1.5">
            <Label>季節說明 ({locale})</Label>
            <textarea value={form.seasonalDesc[locale]} onChange={(e) => setLoc('seasonalDesc', e.target.value)} rows={2} placeholder="季節限定產品說明文字"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
          </div>
          <MediaUploadField
            label="季節限定背景影片（MP4）"
            value={form.seasonalVideo}
            onChange={(v) => setForm((p) => ({ ...p, seasonalVideo: v }))}
            accept="video/*"
            icon={<Film className="h-5 w-5" />}
          />
          <MediaUploadField
            label="季節限定背景圖片"
            value={form.seasonalImage}
            onChange={(v) => setForm((p) => ({ ...p, seasonalImage: v }))}
            accept="image/*"
            icon={<ImageIcon className="h-5 w-5" />}
          />
        </CardContent>
      </Card>
    </div>
  )
}
