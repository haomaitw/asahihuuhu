'use client'
import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Upload, X, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const LOCALES = [{ key: 'zh-TW', label: '中文' }, { key: 'en', label: 'EN' }, { key: 'ja', label: 'JA' }]
type LocalizedStr = { 'zh-TW': string; en: string; ja: string }

type FormState = {
  name: LocalizedStr
  position: LocalizedStr
  bio: LocalizedStr
  photo: { id: string | number; url: string } | null
  order: number
}

function toLocStr(val: any): LocalizedStr {
  if (!val) return { 'zh-TW': '', en: '', ja: '' }
  if (typeof val === 'string') return { 'zh-TW': val, en: '', ja: '' }
  return { 'zh-TW': val['zh-TW'] ?? '', en: val.en ?? '', ja: val.ja ?? '' }
}

function initForm(data?: any): FormState {
  return {
    name:     toLocStr(data?.name),
    position: toLocStr(data?.position),
    bio:      toLocStr(data?.bio),
    photo:    data?.photo ? { id: data.photo.id ?? data.photo, url: data.photo.url ?? (typeof data.photo === 'string' ? data.photo : '') } : null,
    order:    data?.order ?? 0,
  }
}

export function StaffForm({ initialData, isEdit }: { initialData?: any; isEdit?: boolean }) {
  const router = useRouter()
  const id = initialData?.id
  const [form, setForm] = React.useState<FormState>(() => initForm(initialData))
  const [locale, setLocale] = React.useState<'zh-TW' | 'en' | 'ja'>('zh-TW')
  const [loading, setLoading] = React.useState(false)
  const [uploading, setUploading] = React.useState(false)
  const photoRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isEdit || !id) return
    fetch(`/api/admin/staff/${id}`, { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setForm(initForm(data)) })
      .catch(() => {})
  }, [isEdit, id])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
      const r = await fetch('/api/admin/media', { method: 'POST', body: fd, credentials: 'include' })
      const { doc } = await r.json()
      setForm((p) => ({ ...p, photo: { id: doc.id, url: doc.url ?? '' } }))
      toast.success('照片上傳成功')
    } catch {
      toast.error('照片上傳失敗')
    } finally {
      setUploading(false)
      if (photoRef.current) photoRef.current.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.name['zh-TW'].trim()) { toast.error('請填寫姓名'); return }
    setLoading(true)
    try {
      const payload = {
        name:     form.name,
        position: form.position,
        bio:      form.bio,
        photo:    form.photo?.url ?? null,
        order:    form.order,
      }
      const url = isEdit ? `/api/admin/staff/${id}` : '/api/admin/staff'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.error ?? '儲存失敗')
        return
      }
      toast.success(isEdit ? '成員已更新' : '成員已建立')
      router.push('/admin/collections/staff')
      router.refresh()
    } catch {
      toast.error('儲存失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit || !id || !confirm('確定刪除此成員？')) return
    try {
      await fetch(`/api/admin/staff/${id}`, { method: 'DELETE', credentials: 'include' })
      toast.success('已刪除')
      router.push('/admin/collections/staff')
      router.refresh()
    } catch {
      toast.error('刪除失敗')
    }
  }

  const setLoc = (field: 'name' | 'position' | 'bio', val: string) =>
    setForm((p) => ({ ...p, [field]: { ...p[field], [locale]: val } }))

  return (
    <div className="space-y-6 max-w-xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-adm-text-primary">{isEdit ? '編輯成員' : '新增成員'}</h1>
        <div className="flex gap-2">
          {isEdit && <Button variant="danger" size="md" onClick={handleDelete}>刪除</Button>}
          <Button variant="primary" size="md" loading={loading} onClick={handleSave}>儲存</Button>
        </div>
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

      {/* Photo */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <Label>個人照片</Label>
          <div className="flex items-center gap-4">
            {form.photo?.url ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.photo.url} alt="照片預覽" className="h-20 w-20 rounded-full object-cover bg-adm-bg-sunken" />
                <button onClick={() => setForm((p) => ({ ...p, photo: null }))}
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-adm-danger-500 text-white flex items-center justify-center hover:bg-adm-danger-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div className="h-20 w-20 rounded-full bg-adm-bg-sunken border-2 border-dashed border-adm-border-default flex items-center justify-center">
                <UserCircle className="h-10 w-10 text-adm-text-tertiary" />
              </div>
            )}
            <Button variant="secondary" size="sm" loading={uploading} onClick={() => photoRef.current?.click()}>
              <Upload className="h-4 w-4" /> {form.photo ? '更換照片' : '上傳照片'}
            </Button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <Input
            label={`姓名 (${locale})`}
            value={form.name[locale]}
            onChange={(e) => setLoc('name', e.target.value)}
            placeholder="如：李大明"
          />
          <Input
            label={`職稱 (${locale})`}
            value={form.position[locale]}
            onChange={(e) => setLoc('position', e.target.value)}
            placeholder="如：攝影師 / Photographer"
          />
          <div className="space-y-1.5">
            <Label>自我介紹 ({locale})</Label>
            <textarea value={form.bio[locale]} onChange={(e) => setLoc('bio', e.target.value)} rows={4}
              placeholder="簡短自我介紹…"
              className="w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15 resize-none" />
          </div>
          <Input
            label="排列順序"
            type="number"
            value={String(form.order)}
            onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
