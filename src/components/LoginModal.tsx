'use client'
/**
 * LoginModal — frosted glass, two-panel layout
 *
 * Left panel (md+): dark harbour sunset visual with BrandMark + taglines
 * Right panel:       Login / Register tabs + form
 *
 * State is stored in useModalStore (Zustand) so any component can trigger it.
 */

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useModalStore } from '@/store/modal'
import { useCustomerStore } from '@/store/customer'
import { BrandMark } from './BrandMark'

/* ── shared input class ───────────────────────────────────────────────── */
const INPUT =
  'w-full border border-paper-200 rounded-xl px-4 py-3 text-sm bg-paper-50 ' +
  'focus:outline-none focus:border-sea-400 transition-colors placeholder:text-ink/25'

export function LoginModal() {
  const { loginOpen, closeLogin } = useModalStore()
  const { login, register } = useCustomerStore()
  const router = useRouter()

  const [tab,     setTab]     = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  /* login fields */
  const [lEmail,    setLEmail]    = useState('')
  const [lPassword, setLPassword] = useState('')

  /* register fields */
  const [rName,     setRName]     = useState('')
  const [rEmail,    setREmail]    = useState('')
  const [rPassword, setRPassword] = useState('')
  const [rPhone,    setRPhone]    = useState('')
  const [rPrivacy,   setRPrivacy]   = useState(false)
  const [rMarketing, setRMarketing] = useState(false)
  const [rEmailSub,  setREmailSub]  = useState(false)

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setError('') }, [tab])

  useEffect(() => {
    document.body.style.overflow = loginOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [loginOpen])

  /* click-outside to close */
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeLogin()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const r = await login(lEmail, lPassword)
    setLoading(false)
    if (!r.ok) return setError(r.error ?? '帳號或密碼錯誤')
    closeLogin()
    router.push('/account')
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const r = await register({ email: rEmail, password: rPassword, name: rName, phone: rPhone || undefined, privacyConsent: rPrivacy, marketingConsent: rMarketing, emailConsent: rEmailSub })
    setLoading(false)
    if (!r.ok) return setError(r.error ?? '註冊失敗，請稍後再試')
    closeLogin()
    router.push('/account')
  }

  /* ── Spinner ─────────────────────────────────────────────────────── */
  const Spinner = () => (
    <span className="inline-block w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin" />
  )

  if (!loginOpen) return null

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 backdrop-blur-sm px-4"
      onClick={handleOverlay}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-[660px] rounded-2xl shadow-2xl overflow-hidden flex min-h-[500px]">

        {/*
          ── LEFT PANEL: brand visual ──────────────────────────────────
          Hidden on mobile (the form fills the whole card).
          Deep harbour blue gradient with a warm amber sun glow.
        */}
        <div
          className="hidden md:flex md:w-[42%] flex-col justify-between p-8 relative overflow-hidden shrink-0"
          style={{
            background:
              'linear-gradient(160deg, #0b1c2c 0%, #16364f 40%, #265989 75%, #3e88c3 100%)',
          }}
        >
          {/* Sun radial glow */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 220,
              height: 220,
              top: '46%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background:
                'radial-gradient(circle, rgba(255,237,150,0.55) 0%, rgba(251,191,36,0.28) 40%, transparent 68%)',
            }}
          />

          {/* Brand mark — top */}
          <BrandMark variant="white" className="h-11 relative z-10 opacity-90" />

          {/* Tagline — lower */}
          <div className="relative z-10 space-y-3">
            <p className="font-sans font-light text-base text-white/85 tracking-[0.09em] leading-snug">
              記憶裡的沖繩朝陽
            </p>
            <div className="flex items-center gap-1.5">
              <div className="h-px w-7 bg-white/38" />
              <div className="h-px w-3.5 bg-white/18" />
            </div>
            <p className="font-sans font-light text-sm text-white/50 tracking-[0.1em]">
              在淡水河畔重新盛開
            </p>
          </div>

          {/* Wave shape at bottom */}
          <div className="absolute bottom-0 left-0 right-0 leading-[0]">
            <svg
              viewBox="0 0 240 44"
              className="w-full block"
              preserveAspectRatio="none"
            >
              <path
                d="M0,22 C60,44 120,0 180,22 C210,33 228,11 240,22 L240,44 L0,44 Z"
                fill="rgba(90,160,215,0.28)"
              />
            </svg>
          </div>
        </div>

        {/*
          ── RIGHT PANEL: form ─────────────────────────────────────────
        */}
        <div className="flex-1 flex flex-col bg-white/95 backdrop-blur-xl p-7 md:p-8">

          {/* Close × */}
          <button
            onClick={closeLogin}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-ink/30 hover:text-ink hover:bg-paper-100 transition-colors z-10"
            aria-label="關閉"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="1" y1="1" x2="12" y2="12" />
              <line x1="12" y1="1" x2="1" y2="12" />
            </svg>
          </button>

          {/* Mobile-only brand mark */}
          <div className="md:hidden mb-5">
            <BrandMark variant="black" className="h-8" />
          </div>

          {/* Heading */}
          <div className="mb-5">
            <h2 className="font-sans font-light text-xl tracking-[0.08em] text-ink">
              {tab === 'login' ? '歡迎回來' : '建立帳號'}
            </h2>
            <p className="text-xs text-ink/38 tracking-wide mt-1">
              {tab === 'login'
                ? '登入您的朝日夫婦會員帳號'
                : '成為朝日夫婦會員，享受紅利回饋'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-paper-100 rounded-xl p-1">
            {(['login', 'register'] as const).map((t_) => (
              <button
                key={t_}
                onClick={() => setTab(t_)}
                className={`flex-1 py-2.5 rounded-lg text-sm tracking-widest transition-all duration-200 ${
                  tab === t_
                    ? 'bg-white shadow-sm text-ink font-light'
                    : 'text-ink/40 hover:text-ink/60'
                }`}
              >
                {t_ === 'login' ? '登入' : '註冊'}
              </button>
            ))}
          </div>

          {/* Error banner */}
          {error && (
            <div className="text-red-600 text-xs bg-red-50 border border-red-200/60 rounded-lg px-3 py-2.5 mb-4 flex items-start gap-2">
              <span className="mt-px">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── LOGIN FORM ─────────────────────────────────────────── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5 flex-1 flex flex-col">
              <div>
                <label className="block text-[11px] text-ink/45 mb-1.5 tracking-wide">電子郵件</label>
                <input type="email" required value={lEmail} onChange={(e) => setLEmail(e.target.value)}
                  autoComplete="email" placeholder="you@example.com" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] text-ink/45 mb-1.5 tracking-wide">密碼</label>
                <input type="password" required value={lPassword} onChange={(e) => setLPassword(e.target.value)}
                  autoComplete="current-password" placeholder="••••••••" className={INPUT} />
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    closeLogin()
                    router.push('/account/forgot-password')
                  }}
                  className="text-xs text-ink/40 hover:text-sea-400 transition-colors"
                >
                  忘記密碼？
                </button>
              </div>
              <div className="flex-1" />
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm tracking-widest disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? <><Spinner /> 登入中…</> : '登入'}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ──────────────────────────────────────── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3 flex-1 flex flex-col">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-ink/45 mb-1.5 tracking-wide">姓名 *</label>
                  <input type="text" required value={rName} onChange={(e) => setRName(e.target.value)}
                    autoComplete="name" placeholder="王小明" className={INPUT} />
                </div>
                <div>
                  <label className="block text-[11px] text-ink/45 mb-1.5 tracking-wide">手機（選填）</label>
                  <input type="tel" value={rPhone} onChange={(e) => setRPhone(e.target.value)}
                    autoComplete="tel" placeholder="09xx-xxx-xxx" className={INPUT} />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-ink/45 mb-1.5 tracking-wide">電子郵件 *</label>
                <input type="email" required value={rEmail} onChange={(e) => setREmail(e.target.value)}
                  autoComplete="email" placeholder="you@example.com" className={INPUT} />
              </div>
              <div>
                <label className="block text-[11px] text-ink/45 mb-1.5 tracking-wide">密碼 * <span className="text-ink/25">（至少 8 字元）</span></label>
                <input type="password" required minLength={8} value={rPassword} onChange={(e) => setRPassword(e.target.value)}
                  autoComplete="new-password" placeholder="至少 8 個字元" className={INPUT} />
              </div>
              <div className="space-y-2.5 py-1">
                {/* Privacy policy - required */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    checked={rPrivacy}
                    onChange={(e) => setRPrivacy(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-paper-300 accent-sea-400 cursor-pointer"
                  />
                  <span className="text-xs text-ink/55 leading-snug">
                    我已閱讀並同意{' '}
                    <a href="/privacy" target="_blank" rel="noopener" className="text-sea-400 underline underline-offset-2">
                      《隱私權政策》
                    </a>
                    {' '}<span className="text-red-400">*</span>
                  </span>
                </label>
                {/* Marketing consent - optional */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rMarketing}
                    onChange={(e) => setRMarketing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-paper-300 accent-sea-400 cursor-pointer"
                  />
                  <span className="text-xs text-ink/55 leading-snug">同意接收朝日夫婦的行銷訊息（選填）</span>
                </label>
                {/* Email subscription - optional */}
                <label className="flex items-start gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rEmailSub}
                    onChange={(e) => setREmailSub(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-paper-300 accent-sea-400 cursor-pointer"
                  />
                  <span className="text-xs text-ink/55 leading-snug">訂閱電子報，掌握最新優惠（選填）</span>
                </label>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-sm tracking-widest disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              >
                {loading ? <><Spinner /> 處理中…</> : '建立帳號'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
