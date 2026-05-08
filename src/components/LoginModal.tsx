'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useModalStore } from '@/store/modal'
import { useCustomerStore } from '@/store/customer'

export function LoginModal() {
  const { loginOpen, closeLogin } = useModalStore()
  const { login, register } = useCustomerStore()
  const router = useRouter()

  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Login fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')

  const overlayRef = useRef<HTMLDivElement>(null)

  // Reset error when switching tabs
  useEffect(() => { setError('') }, [tab])

  // Prevent body scroll when open
  useEffect(() => {
    if (loginOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [loginOpen])

  if (!loginOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) closeLogin()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await login(loginEmail, loginPassword)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? '登入失敗')
    } else {
      closeLogin()
      router.push('/account')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await register({
      email: regEmail,
      password: regPassword,
      name: regName,
      phone: regPhone || undefined,
    })
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? '註冊失敗')
    } else {
      closeLogin()
      router.push('/account')
    }
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] bg-ink/25 backdrop-blur-sm flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      <div className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl w-full max-w-md mx-4 p-8 relative">
        {/* Close button */}
        <button
          onClick={closeLogin}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-ink/40 hover:text-ink/80 hover:bg-paper-100 transition-colors text-xl leading-none"
          aria-label="關閉"
        >
          ×
        </button>

        {/* Brand wordmark */}
        <p className="font-sans font-light text-xs tracking-[0.3em] text-ink/40 text-center mb-6 uppercase">
          ASAHI HUUHU 朝日夫婦
        </p>

        {/* Tabs */}
        <div className="flex border-b border-paper-200 mb-6">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 pb-3 text-sm tracking-widest transition-colors ${
              tab === 'login'
                ? 'text-ink border-b-2 border-sea-400 -mb-px font-medium'
                : 'text-ink/40 hover:text-ink/70'
            }`}
          >
            登入
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 pb-3 text-sm tracking-widest transition-colors ${
              tab === 'register'
                ? 'text-ink border-b-2 border-sea-400 -mb-px font-medium'
                : 'text-ink/40 hover:text-ink/70'
            }`}
          >
            註冊
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">電子郵件</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">密碼</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm tracking-widest mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  登入中…
                </>
              ) : '登入'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">姓名 *</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                autoComplete="name"
                className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50"
                placeholder="王小明"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">電子郵件 *</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">密碼 *</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50"
                placeholder="至少 8 個字元"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1.5">手機（選填）</label>
              <input
                type="tel"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                autoComplete="tel"
                className="w-full border border-paper-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-sea-400 bg-paper-50"
                placeholder="09xx-xxx-xxx"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-sm tracking-widest mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  處理中…
                </>
              ) : '建立帳號'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
