'use client'
import * as React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (res.ok) {
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data?.errors?.[0]?.message ?? '帳號或密碼錯誤')
      }
    } catch {
      setError('無法連線，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-adm-brand-50 px-12">
        <Image
          src="/asahi/logo-black.svg"
          alt="朝日夫婦"
          width={180}
          height={64}
          className="mb-10 object-contain"
          priority
        />
        <p className="font-serif text-2xl text-adm-brand-700 text-center leading-relaxed tracking-widest">
          朝日夫婦
        </p>
        <p className="mt-3 text-sm text-adm-text-tertiary text-center tracking-wide">
          職人堅持的日式刨冰
        </p>
      </div>

      {/* Right: Login form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center px-8 bg-adm-bg-elevated">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex justify-center lg:hidden">
            <Image
              src="/asahi/logo-black.svg"
              alt="朝日夫婦"
              width={120}
              height={44}
              className="object-contain"
              priority
            />
          </div>

          <h1 className="font-serif text-2xl text-adm-text-primary tracking-wide mb-1">
            歡迎回來
          </h1>
          <p className="text-sm text-adm-text-secondary mb-8">請使用您的管理員帳號登入</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="電子郵件"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@asahihuuhu.com"
              required
              autoComplete="email"
            />
            <Input
              label="密碼"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-xs text-adm-danger-500 bg-adm-danger-50 border border-adm-danger-500/20 rounded-adm-md px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-6"
            >
              登入
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-adm-text-tertiary">
            異想天開影像 CMS 管理系統
          </p>
        </div>
      </div>
    </div>
  )
}
