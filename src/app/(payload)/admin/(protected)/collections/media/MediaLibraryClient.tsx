'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'

type MediaDoc = { id: string | number; url?: string; filename?: string; filesize?: number; width?: number; height?: number; mimeType?: string }

export function MediaLibraryClient({ docs: initial, total }: { docs: MediaDoc[]; total: number }) {
  const [docs, setDocs] = React.useState(initial)
  const [uploading, setUploading] = React.useState(false)
  const [selected, setSelected] = React.useState<Set<string | number>>(new Set())
  const fileRef = React.useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(files.map(async (file) => {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('alt', file.name.replace(/\.[^.]+$/, ''))
        const r = await fetch('/api/media', { method: 'POST', body: fd, credentials: 'include' })
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body?.errors?.[0]?.message ?? body?.message ?? `HTTP ${r.status}`)
        }
        const { doc } = await r.json()
        return doc as MediaDoc
      }))
      setDocs((prev) => [...uploaded.filter(Boolean), ...prev])
      toast.success(`已上傳 ${uploaded.length} 個檔案`)
    } catch { toast.error('上傳失敗') } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleDelete = async () => {
    if (!selected.size || !confirm(`確定刪除 ${selected.size} 個檔案？`)) return
    try {
      await Promise.all([...selected].map((id) =>
        fetch(`/api/media/${id}`, { method: 'DELETE', credentials: 'include' })
      ))
      setDocs((prev) => prev.filter((d) => !selected.has(d.id)))
      setSelected(new Set())
      toast.success('已刪除')
    } catch { toast.error('刪除失敗') }
  }

  const toggle = (id: string | number) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })

  const fmtSize = (bytes?: number) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">媒體庫</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {docs.length} 個檔案</p>
        </div>
        <div className="flex gap-2">
          {selected.size > 0 && (
            <Button variant="danger" size="md" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" /> 刪除 ({selected.size})
            </Button>
          )}
          <Button variant="primary" size="md" loading={uploading} onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> 上傳圖片
          </Button>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />

      {docs.length === 0 ? (
        <div className="rounded-adm-2xl border border-adm-border-subtle bg-adm-bg-elevated">
          <EmptyState icon={<ImageIcon className="h-6 w-6" />} title="媒體庫為空" description="點擊「上傳圖片」新增媒體檔案" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {docs.map((doc) => {
            const isSelected = selected.has(doc.id)
            return (
              <button
                key={doc.id}
                onClick={() => toggle(doc.id)}
                className={`group relative aspect-square rounded-adm-lg overflow-hidden border-2 transition-all ${
                  isSelected ? 'border-adm-brand-500 ring-2 ring-adm-brand-500/20' : 'border-transparent hover:border-adm-border-strong'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={doc.url ?? ''} alt={doc.filename ?? ''} className="w-full h-full object-cover bg-adm-bg-sunken" />
                {isSelected && (
                  <div className="absolute inset-0 bg-adm-brand-500/20 flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-adm-brand-500 flex items-center justify-center">
                      <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{doc.filename}</p>
                  <p className="text-[10px] text-white/70">{fmtSize(doc.filesize)}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
