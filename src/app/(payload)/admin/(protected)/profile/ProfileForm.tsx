'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const INPUT_CLS =
  'h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-base px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

type Props = {
  initialName: string
  email: string
  role: string
}

const ROLE_LABEL: Record<string, string> = {
  'super-admin': '代管商（異想天開影像）',
  admin:         '客戶（朝日夫婦）',
  staff:         '員工',
}

export function ProfileForm({ initialName, email, role }: Props) {
  const [name, setName]         = React.useState(initialName)
  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm]   = React.useState('')
  const [loading, setLoading]   = React.useState(false)

  const initials = (name || email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password && password.length < 8) {
      toast.error('密碼長度至少 8 個字元')
      return
    }
    if (password && password !== confirm) {
      toast.error('兩次密碼不一致')
      return
    }
    setLoading(true)
    try {
      const body: Record<string, string> = { name }
      if (password) body.password = password
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.error ?? '更新失敗')
        return
      }
      toast.success('個人資料已更新')
      setPassword('')
      setConfirm('')
    } catch {
      toast.error('更新失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-semibold text-adm-text-primary">個人資料</h1>

      {/* Avatar + identity */}
      <Card>
        <CardContent className="p-5 flex items-center gap-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-adm-text-primary truncate">{name || '未命名'}</p>
            <p className="text-xs text-adm-text-tertiary truncate">{email}</p>
            <p className="text-xs text-adm-text-disabled mt-0.5">{ROLE_LABEL[role] ?? role}</p>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-4">
        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">基本資料</p>
            <div className="space-y-1.5">
              <Label htmlFor="name">顯示名稱</Label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的名稱"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email（不可修改）</Label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className={`${INPUT_CLS} opacity-50 cursor-not-allowed`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-adm-text-tertiary">
              變更密碼 <span className="font-normal normal-case tracking-normal text-adm-text-disabled">（留空則不更改）</span>
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="password">新密碼</Label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 個字元"
                className={INPUT_CLS}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">確認新密碼</Label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="再次輸入新密碼"
                className={INPUT_CLS}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" variant="primary" size="md" loading={loading}>
          儲存變更
        </Button>
      </form>
    </div>
  )
}
