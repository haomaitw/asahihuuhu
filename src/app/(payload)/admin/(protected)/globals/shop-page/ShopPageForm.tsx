'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }
type MediaRef = { id: string | number; url: string } | null

type FormState = {
  heroTitle: LocalizedStr
  heroSubtitle: LocalizedStr
  heroImage: MediaRef
}

function toLocStr(val: any): LocalizedStr {
  if (!val) return { 'zh-TW': '', en: '', ja: '' }
  if (typeof val === 'string') return { 'zh-TW': val, en: '', ja: '' }
  return { 'zh-TW': val['zh-TW'] ?? '', en: val.en ?? '', ja: val.ja ?? '' }
}

function initForm(data?: any): FormState {
  return {
    heroTitle:    toLocStr(data?.heroTitle),
    heroSubtitle: toLocStr(data?.heroSubtitle),
    heroImage:    data?.heroImage ? { id: data.heroImage.id ?? data.heroImage, url: data.heroImage.url ?? (typeof data.heroImage === 'string' ? data.heroImage : '') } : null,
  }
}

export function ShopPageForm({ initialData }: { initialData?: any }) {
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const imgRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetch('/api/admin/globals/shop-page', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data && Object.keys(data).length > 0) setForm(initForm(data)) })
      .catch(() => {})
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', 'Shop page hero')
      const r = await fetch('/api/admin/media', { method: 'POST', body: fd, credentials: 'include' })
      const { doc } = await r.json()
      setForm((p) => ({ ...p, heroImage: { id: doc.id, url: doc.url ?? '' } }))
      toast.success('圖片上傳成功')
    } catch {
      toast.error('上傳失敗')
    } finally {
      setUploading(false)
      if (imgRef.current) imgRef.current.value = ''
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/globals/shop-page', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          heroTitle:    form.heroTitle,
          heroSubtitle: form.heroSubtitle,
          heroImage:    form.heroImage ?? null,
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      toast.success('商店頁面設定已儲存')
    } catch {
      toast.error('儲存失敗')
    } finally {
      setLoading(false)
    }
  }

  const setLoc = (field: 'heroTitle' | 'heroSubtitle', val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  const inputCls = 'w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">商店頁面設定</h1>
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

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">英雄區塊</p>
          <Input
            label={`主標題 (${locale})`}
            value={form.heroTitle[locale]}
            onChange={(e) => setLoc('heroTitle', e.target.value)}
            placeholder="線上選購"
          />
          <Input
            label={`副標題 (${locale})`}
            value={form.heroSubtitle[locale]}
            onChange={(e) => setLoc('heroSubtitle', e.target.value)}
            placeholder="精選冰品，宅配到府"
          />
          <div className="space-y-2">
            <p className="text-xs font-medium text-adm-text-secondary uppercase tracking-wider">英雄背景圖（選填）</p>
            {form.heroImage ? (
              <div className="flex items-center gap-3 rounded-adm-lg border border-adm-border-default bg-adm-bg-elevated p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.heroImage.url} alt="" className="h-12 w-20 rounded-adm-md object-cover bg-adm-bg-sunken shrink-0" />
                <span className="flex-1 text-sm text-adm-text-primary truncate">{form.heroImage.url}</span>
                <button onClick={() => setForm((p) => ({ ...p, heroImage: null }))} className="text-adm-danger-500 hover:text-adm-danger-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => imgRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-adm-lg border-2 border-dashed border-adm-border-default bg-adm-bg-elevated hover:border-adm-brand-400 hover:bg-adm-brand-50/30 transition-colors py-4 text-sm text-adm-text-tertiary"
              >
                {uploading ? <span className="animate-spin h-4 w-4 border-2 border-adm-brand-400 border-t-transparent rounded-full" /> : <ImageIcon className="h-4 w-4" />}
                <span>{uploading ? '上傳中…' : '點擊上傳背景圖'}</span>
              </button>
            )}
            <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
