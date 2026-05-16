'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Film, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type MediaRef = { id: string | number; url: string; mimeType?: string; filename?: string } | null

type FormState = {
  heroSubtitle: LocalizedStr
  storyP1: LocalizedStr
  storyP2: LocalizedStr
  storyP3: LocalizedStr
  heroVideo: MediaRef
  heroPoster: MediaRef
  storyImage1: MediaRef
  storyImage2: MediaRef
  storyImage3: MediaRef
}

function toLocStr(val: any): LocalizedStr {
  if (!val) return { 'zh-TW': '', en: '', ja: '' }
  if (typeof val === 'string') return { 'zh-TW': val, en: '', ja: '' }
  return { 'zh-TW': val['zh-TW'] ?? '', en: val.en ?? '', ja: val.ja ?? '' }
}

function toRef(d: any): MediaRef {
  if (!d) return null
  if (typeof d === 'string') return { id: d, url: d }
  return { id: d.id ?? d.url ?? '', url: d.url ?? '', mimeType: d.mimeType, filename: d.filename }
}

function initForm(data?: any): FormState {
  return {
    heroSubtitle: toLocStr(data?.heroSubtitle),
    storyP1:      toLocStr(data?.storyP1),
    storyP2:      toLocStr(data?.storyP2),
    storyP3:      toLocStr(data?.storyP3),
    heroVideo:    toRef(data?.heroVideo),
    heroPoster:   toRef(data?.heroPoster),
    storyImage1:  toRef(data?.storyImage1),
    storyImage2:  toRef(data?.storyImage2),
    storyImage3:  toRef(data?.storyImage3),
  }
}

function MediaUploadField({
  label, description, value, onChange, accept, icon
}: {
  label: string; description?: string; value: MediaRef
  onChange: (v: MediaRef) => void; accept: string; icon: React.ReactNode
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
      const r = await fetch('/api/admin/media', { method: 'POST', body: fd, credentials: 'include' })
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

export function AboutPageForm({ initialData }: { initialData?: any }) {
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    fetch('/api/admin/globals/about-page', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setForm(initForm(data)))
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/globals/about-page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          heroSubtitle: form.heroSubtitle,
          storyP1:      form.storyP1,
          storyP2:      form.storyP2,
          storyP3:      form.storyP3,
          heroVideo:    form.heroVideo ?? null,
          heroPoster:   form.heroPoster ?? null,
          storyImage1:  form.storyImage1 ?? null,
          storyImage2:  form.storyImage2 ?? null,
          storyImage3:  form.storyImage3 ?? null,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('關於設定已儲存')
    } catch { toast.error('儲存失敗') } finally { setLoading(false) }
  }

  const setLoc = (field: keyof Pick<FormState, 'heroSubtitle' | 'storyP1' | 'storyP2' | 'storyP3'>, val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">關於設定</h1>
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

      {/* Hero */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">英雄區</p>
          <Input label={`Hero 副標 (${locale})`} value={form.heroSubtitle[locale]} onChange={(e) => setLoc('heroSubtitle', e.target.value)} placeholder="關於我們的副標語" />
          <MediaUploadField
            label="英雄區影片（MP4）"
            description="關於頁主視覺背景影片，留空則使用預設 /asahi/hero-about.mp4"
            value={form.heroVideo}
            onChange={(v) => setForm((p) => ({ ...p, heroVideo: v }))}
            accept="video/*"
            icon={<Film className="h-5 w-5" />}
          />
          <MediaUploadField
            label="英雄區封面圖"
            value={form.heroPoster}
            onChange={(v) => setForm((p) => ({ ...p, heroPoster: v }))}
            accept="image/*"
            icon={<ImageIcon className="h-5 w-5" />}
          />
        </CardContent>
      </Card>

      {/* Story text */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">品牌故事</p>
          {(['storyP1', 'storyP2', 'storyP3'] as const).map((field, i) => (
            <div key={field} className="space-y-1.5">
              <Label>故事段落 {i + 1} ({locale})</Label>
              <textarea value={form[field][locale]} onChange={(e) => setLoc(field, e.target.value)} rows={4} placeholder={`第 ${i + 1} 段品牌故事…`}
                className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Story images */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">故事區圖片</p>
          {([
            { key: 'storyImage1' as const, label: '故事圖片 1' },
            { key: 'storyImage2' as const, label: '故事圖片 2' },
            { key: 'storyImage3' as const, label: '故事圖片 3' },
          ]).map(({ key, label }) => (
            <MediaUploadField
              key={key}
              label={label}
              value={form[key]}
              onChange={(v) => setForm((p) => ({ ...p, [key]: v }))}
              accept="image/*"
              icon={<ImageIcon className="h-5 w-5" />}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
