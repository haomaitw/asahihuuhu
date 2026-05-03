'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Trash2, Upload, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [
  { key: 'zh-TW', label: '中文' },
  { key: 'en',    label: 'EN' },
  { key: 'ja',    label: 'JA' },
]

type LocalizedStr = { 'zh-TW': string; en: string; ja: string }
type MediaItem = { id: string | number; url?: string; filename?: string }

type FormState = {
  name: LocalizedStr
  slug: string
  price: string
  category: string
  shortDescription: LocalizedStr
  isAvailable: boolean
  images: MediaItem[]
}

function initForm(data?: any): FormState {
  const loc = (field: string) => ({
    'zh-TW': data?.[field] ?? '',
    en: '',
    ja: '',
  })
  return {
    name: loc('name'),
    slug: data?.slug ?? '',
    price: data?.price?.toString() ?? '',
    category: data?.category ?? 'goods',
    shortDescription: loc('shortDescription'),
    isAvailable: data?.isAvailable ?? true,
    images: (data?.images ?? []) as MediaItem[],
  }
}

export function ProductForm({ initialData, id }: { initialData?: any; id?: string }) {
  const router = useRouter()
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)
  const [mediaOpen, setMediaOpen] = React.useState(false)
  const [mediaItems, setMediaItems] = React.useState<MediaItem[]>([])
  const fileRef = React.useRef<HTMLInputElement>(null)

  const isEdit = !!id

  // Load all locales for edit mode
  React.useEffect(() => {
    if (!id) return
    Promise.all(
      LOCALES.map(async ({ key }) => {
        const res = await fetch(`/api/products/${id}?locale=${key}&depth=1`, { credentials: 'include' })
        return { key, data: await res.json() }
      })
    ).then((results) => {
      setForm((prev) => ({
        ...prev,
        name: {
          'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.name ?? prev.name['zh-TW'],
          en:      results.find((r) => r.key === 'en')?.data.name ?? '',
          ja:      results.find((r) => r.key === 'ja')?.data.name ?? '',
        },
        shortDescription: {
          'zh-TW': results.find((r) => r.key === 'zh-TW')?.data.shortDescription ?? '',
          en:      results.find((r) => r.key === 'en')?.data.shortDescription ?? '',
          ja:      results.find((r) => r.key === 'ja')?.data.shortDescription ?? '',
        },
      }))
    })
  }, [id])

  const fetchMedia = async () => {
    const res = await fetch('/api/media?limit=50', { credentials: 'include' })
    const data = await res.json()
    setMediaItems(data.docs ?? [])
    setMediaOpen(true)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
    toast.promise(
      fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' }).then(async (r) => {
        const { doc } = await r.json()
        setForm((prev) => ({ ...prev, images: [...prev.images, doc] }))
      }),
      { loading: '上傳中…', success: '圖片已上傳', error: '上傳失敗' }
    )
  }

  const removeImage = (imgId: string | number) =>
    setForm((prev) => ({ ...prev, images: prev.images.filter((i) => i.id !== imgId) }))

  const selectMedia = (item: MediaItem) => {
    if (!form.images.find((i) => i.id === item.id)) {
      setForm((prev) => ({ ...prev, images: [...prev.images, item] }))
    }
    setMediaOpen(false)
  }

  const handleSave = async () => {
    if (!form.slug || !form.price) {
      toast.error('請填寫 Slug 與售價')
      return
    }
    setLoading(true)
    try {
      const basePayload = {
        slug: form.slug,
        price: parseFloat(form.price),
        category: form.category,
        isAvailable: form.isAvailable,
        images: form.images.map((img) => img.id),
      }

      // Save each locale
      await Promise.all(
        LOCALES.map(({ key }) =>
          fetch(isEdit ? `/api/products/${id}?locale=${key}` : `/api/products?locale=${key}`, {
            method: isEdit ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              ...basePayload,
              name: form.name[key as keyof LocalizedStr],
              shortDescription: form.shortDescription[key as keyof LocalizedStr],
            }),
          })
        )
      )

      toast.success(isEdit ? '商品已更新' : '商品已建立')
      router.push('/admin/collections/products')
      router.refresh()
    } catch {
      toast.error('儲存失敗，請再試一次')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('確定刪除此商品？此操作無法復原。')) return
    setDeleting(true)
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('商品已刪除')
      router.push('/admin/collections/products')
      router.refresh()
    } catch {
      toast.error('刪除失敗')
    } finally {
      setDeleting(false)
    }
  }

  const setLoc = (field: 'name' | 'shortDescription', val: string) =>
    setForm((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">
            {isEdit ? '編輯商品' : '新增商品'}
          </h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">
            <a href="/admin/collections/products" className="hover:underline">商品管理</a>
            {' / '}{isEdit ? form.name['zh-TW'] || id : '新增'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEdit && (
            <Button variant="danger" size="md" loading={deleting} onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> 刪除
            </Button>
          )}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>
            {isEdit ? '儲存變更' : '建立商品'}
          </Button>
        </div>
      </div>

      {/* Locale tabs */}
      <div className="flex gap-1 border-b border-adm-border-subtle pb-0">
        {LOCALES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLocale(key as any)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              locale === key
                ? 'border-adm-brand-500 text-adm-brand-600'
                : 'border-transparent text-adm-text-tertiary hover:text-adm-text-primary'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Locale-specific fields */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <Input
            label={`商品名稱 (${locale})`}
            value={form.name[locale]}
            onChange={(e) => setLoc('name', e.target.value)}
            placeholder="商品名稱"
          />
          <div className="space-y-1.5">
            <Label>簡介 ({locale})</Label>
            <textarea
              value={form.shortDescription[locale]}
              onChange={(e) => setLoc('shortDescription', e.target.value)}
              placeholder="商品簡介（選填）"
              rows={3}
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* Common fields */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Slug"
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="product-slug"
              className="font-mono"
            />
            <Input
              label="售價 (NT$)"
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>類別</Label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15"
              >
                <option value="goods">Goods</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>上架狀態</Label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isAvailable}
                  onChange={(e) => setForm((f) => ({ ...f, isAvailable: e.target.checked }))}
                  className="h-4 w-4 rounded border-adm-border-default accent-adm-brand-500"
                />
                <span className="text-sm text-adm-text-primary">上架中（顧客可見）</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <div className="px-5 py-4 border-b border-adm-border-subtle">
          <h2 className="text-sm font-semibold text-adm-text-primary">商品圖片</h2>
        </div>
        <CardContent className="p-5">
          <div className="flex flex-wrap gap-3">
            {form.images.map((img) => (
              <div key={img.id} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url ?? ''}
                  alt=""
                  className="h-24 w-24 rounded-adm-md object-cover bg-adm-bg-sunken"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-adm-danger-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <button
                onClick={fetchMedia}
                className="h-24 w-24 rounded-adm-md border-2 border-dashed border-adm-border-strong flex flex-col items-center justify-center gap-1 text-adm-text-tertiary hover:border-adm-brand-400 hover:text-adm-brand-500 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="text-2xs">媒體庫</span>
              </button>
              <button
                onClick={() => fileRef.current?.click()}
                className="h-24 w-24 rounded-adm-md border-2 border-dashed border-adm-border-strong flex flex-col items-center justify-center gap-1 text-adm-text-tertiary hover:border-adm-brand-400 hover:text-adm-brand-500 transition-colors"
              >
                <Upload className="h-5 w-5" />
                <span className="text-2xs">上傳</span>
              </button>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </CardContent>
      </Card>

      {/* Media picker dialog */}
      {mediaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-adm-bg-overlay">
          <div className="bg-adm-bg-elevated rounded-adm-2xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-adm-border-subtle">
              <h3 className="text-base font-semibold text-adm-text-primary">選擇圖片</h3>
              <button onClick={() => setMediaOpen(false)} className="text-adm-text-tertiary hover:text-adm-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {mediaItems.length === 0 ? (
                <p className="text-sm text-adm-text-tertiary text-center py-8">媒體庫為空</p>
              ) : (
                <div className="grid grid-cols-4 gap-3">
                  {mediaItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectMedia(item)}
                      className="aspect-square rounded-adm-md overflow-hidden border-2 border-transparent hover:border-adm-brand-500 transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.url ?? ''} alt={item.filename ?? ''} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
