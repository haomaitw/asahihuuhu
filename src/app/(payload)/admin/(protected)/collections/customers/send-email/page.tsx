'use client'

import { useState } from 'react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const AUDIENCE_OPTIONS = [
  { value: 'all', label: '全部會員' },
  { value: 'marketing', label: '僅行銷同意的會員' },
  { value: 'gold', label: '金卡會員' },
  { value: 'silver_and_above', label: '銀卡會員及以上' },
]

const INPUT_CLASS =
  'w-full rounded-adm-md border border-adm-border-default bg-adm-bg-elevated px-3 py-2.5 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

export default function SendMarketingEmailPage() {
  const [audience, setAudience] = useState('all')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [previewHtml, setPreviewHtml] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; sent?: number; failed?: number; total?: number; error?: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/admin/send-marketing-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ audience, subject, content }),
      })
      const data = await res.json()
      if (!res.ok) {
        setResult({ ok: false, error: data.error ?? '發送失敗' })
      } else {
        setResult({ ok: true, sent: data.sent, failed: data.failed, total: data.total })
      }
    } catch (err: any) {
      setResult({ ok: false, error: err.message ?? '發送失敗' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/admin/collections/customers"
          className="inline-flex items-center gap-1 text-xs text-adm-text-tertiary hover:text-adm-brand-600 transition-colors mb-3"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回會員管理
        </Link>
        <h1 className="text-2xl font-semibold text-adm-text-primary">發送行銷信</h1>
        <p className="text-sm text-adm-text-tertiary mt-0.5">選擇收件對象並撰寫郵件內容，系統將依序發送</p>
      </div>

      {/* Result banner */}
      {result && (
        <div
          className={`rounded-adm-md px-4 py-3 text-sm ${
            result.ok
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {result.ok
            ? `✓ 已排入發送佇列，系統將依序發送給符合條件的會員（共 ${result.total} 位，成功 ${result.sent}，失敗 ${result.failed}）`
            : `✕ ${result.error}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Audience */}
        <div className="rounded-adm-md border border-adm-border-default bg-adm-bg-elevated p-4 space-y-3">
          <p className="text-sm font-medium text-adm-text-primary">收件對象</p>
          <div className="space-y-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="radio"
                  name="audience"
                  value={opt.value}
                  checked={audience === opt.value}
                  onChange={() => setAudience(opt.value)}
                  className="accent-adm-brand-600 w-4 h-4"
                />
                <span className="text-sm text-adm-text-secondary group-hover:text-adm-text-primary transition-colors">
                  {opt.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">
            主旨 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="請輸入郵件主旨"
            className={INPUT_CLASS}
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-adm-text-primary">
            電子郵件內容 <span className="text-red-500">*</span>
          </label>
          <textarea
            required
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="請輸入郵件內容（支援 HTML 標籤）"
            className={`${INPUT_CLASS} font-mono resize-y`}
          />
        </div>

        {/* Preview toggle */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="previewHtml"
            checked={previewHtml}
            onChange={(e) => setPreviewHtml(e.target.checked)}
            className="accent-adm-brand-600 w-4 h-4"
          />
          <label htmlFor="previewHtml" className="text-sm text-adm-text-secondary cursor-pointer">
            預覽 HTML
          </label>
        </div>

        {/* HTML preview */}
        {previewHtml && content && (
          <div className="rounded-adm-md border border-adm-border-default bg-white p-5">
            <p className="text-2xs uppercase tracking-wider text-adm-text-tertiary font-medium mb-3">HTML 預覽</p>
            <div
              className="text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br>') }}
            />
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-sm px-4 py-2.5 rounded-adm-md bg-adm-brand-600 text-white hover:bg-adm-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                發送中…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,12 2,6" />
                </svg>
                發送行銷信
              </>
            )}
          </button>
          <Link
            href="/admin/collections/customers"
            className="text-sm text-adm-text-tertiary hover:text-adm-text-primary transition-colors"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
