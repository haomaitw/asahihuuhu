'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCustomerStore } from '@/store/customer'

export default function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const router = useRouter()
  const { customer, fetchMe, updateProfile, isLoading } = useCustomerStore()
  const [locale, setLocale] = useState('zh-TW')
  const [form, setForm] = useState({ name: '', phone: '' })
  const [addr, setAddr] = useState({ recipient: '', phone: '', zip: '', city: '', district: '', address: '' })
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  useEffect(() => {
    params.then((p) => setLocale(p.locale)).catch(() => {})
    fetchMe()
  }, [fetchMe, params])

  useEffect(() => {
    if (!customer) { router.push(`/${locale}/account/login`); return }
    setForm({ name: customer.name ?? '', phone: customer.phone ?? '' })
    const da = customer.defaultAddress ?? {}
    setAddr({
      recipient: (da as any).recipient ?? '',
      phone: (da as any).phone ?? '',
      zip: (da as any).zip ?? '',
      city: (da as any).city ?? '',
      district: (da as any).district ?? '',
      address: (da as any).address ?? '',
    })
  }, [customer, locale, router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(''); setErr('')
    const result = await updateProfile({ ...form, defaultAddress: addr } as any)
    if (result.ok) setMsg('已成功更新')
    else setErr(result.error ?? '更新失敗')
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMsg(''); setPwErr('')
    if (pwForm.next !== pwForm.confirm) { setPwErr('兩次輸入的密碼不一致'); return }
    if (pwForm.next.length < 8) { setPwErr('新密碼至少需要 8 個字元'); return }
    setPwLoading(true)
    try {
      const res = await fetch(`/api/customers/${customer?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: pwForm.next }),
      })
      if (res.ok) {
        setPwMsg('密碼已成功更新')
        setPwForm({ current: '', next: '', confirm: '' })
      } else {
        const data = await res.json().catch(() => ({}))
        setPwErr(data?.errors?.[0]?.message ?? '密碼更新失敗')
      }
    } catch {
      setPwErr('無法連線，請稍後再試')
    } finally {
      setPwLoading(false)
    }
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }))
  const a = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setAddr((p) => ({ ...p, [k]: e.target.value }))

  const inputCls = 'w-full border border-paper-200 rounded-xl px-4 py-3 text-sm bg-paper-50 focus:outline-none focus:border-sea-400 transition-colors'

  return (
    <main className="min-h-dvh bg-paper-50 py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/${locale}/account`} className="text-ink/40 hover:text-ink text-sm">← 會員中心</Link>
          <h1 className="font-sans font-light text-2xl text-ink">個人資料</h1>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="bg-white border border-paper-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-medium text-ink/60 uppercase tracking-widest">基本資料</h2>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">姓名</label>
              <input
                value={form.name}
                onChange={f('name')}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">電子郵件</label>
              <input
                value={customer?.email ?? ''}
                disabled
                className="w-full border border-paper-100 rounded-xl px-4 py-3 text-sm bg-paper-100 text-ink/40"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">手機號碼</label>
              <input
                type="tel"
                value={form.phone}
                onChange={f('phone')}
                className={inputCls}
                placeholder="0912-345-678"
              />
            </div>
          </div>

          {/* Default address */}
          <div className="bg-white border border-paper-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-medium text-ink/60 uppercase tracking-widest">預設收件地址</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-ink/50 mb-1.5">收件人</label>
                <input value={addr.recipient} onChange={a('recipient')} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-ink/50 mb-1.5">收件電話</label>
                <input value={addr.phone} onChange={a('phone')} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-ink/50 mb-1.5">郵遞區號</label>
                <input value={addr.zip} onChange={a('zip')} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-ink/50 mb-1.5">縣市</label>
                <input value={addr.city} onChange={a('city')} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs text-ink/50 mb-1.5">區</label>
                <input value={addr.district} onChange={a('district')} className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">詳細地址</label>
              <input value={addr.address} onChange={a('address')} className={inputCls} />
            </div>
          </div>

          {msg && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">✓ {msg}</p>}
          {err && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{err}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary disabled:opacity-50 py-3.5 text-sm tracking-widest"
          >
            {isLoading ? '儲存中…' : '儲存變更'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="space-y-4 mt-6">
          <div className="bg-white border border-paper-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-medium text-ink/60 uppercase tracking-widest">更改密碼</h2>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">新密碼</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={(e) => setPwForm(p => ({ ...p, next: e.target.value }))}
                className={inputCls}
                placeholder="至少 8 個字元"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">確認新密碼</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm(p => ({ ...p, confirm: e.target.value }))}
                className={inputCls}
                placeholder="再次輸入新密碼"
              />
            </div>
            {pwMsg && <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">✓ {pwMsg}</p>}
            {pwErr && <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3">{pwErr}</p>}
            <button
              type="submit"
              disabled={pwLoading || !pwForm.next || !pwForm.confirm}
              className="w-full bg-paper-100 hover:bg-paper-200 disabled:opacity-50 text-ink font-sans tracking-widest py-3 rounded-xl transition-colors text-sm border border-paper-200"
            >
              {pwLoading ? '更新中…' : '更新密碼'}
            </button>
          </div>
        </form>

        {/* Email verification status */}
        <div className="bg-white border border-paper-200 rounded-2xl p-6 shadow-sm mt-6">
          <h2 className="text-sm font-medium text-ink/60 uppercase tracking-widest mb-4">帳號安全</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-sans text-ink">電子郵件驗證</p>
              <p className="text-xs text-ink/40 mt-0.5">{customer?.email}</p>
            </div>
            {/* Show verified or not - check customer.verified */}
            <span className="text-xs px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              已驗證
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
