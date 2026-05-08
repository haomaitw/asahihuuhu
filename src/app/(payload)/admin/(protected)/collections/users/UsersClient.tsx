'use client'
import * as React from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, UserPlus, Users } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog'

// ── Types ─────────────────────────────────────────────────────────────────────

type AdminUser = {
  id: string | number
  name?: string | null
  email: string
  role: 'super-admin' | 'admin'
  createdAt?: string
}

type Props = {
  initialUsers: AdminUser[]
  currentUserEmail: string
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'super-admin', label: '最高管理員' },
  { value: 'admin',       label: '管理員' },
]

function roleBadge(role: string) {
  if (role === 'super-admin') {
    return <Badge variant="brand" size="sm">最高管理員</Badge>
  }
  return <Badge variant="neutral" size="sm">管理員</Badge>
}

function initials(user: AdminUser) {
  const src = user.name ?? user.email ?? 'U'
  return src.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const INPUT_CLS =
  'h-9 w-full rounded-adm-md border border-adm-border-default bg-adm-bg-base px-3 text-sm text-adm-text-primary placeholder:text-adm-text-tertiary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

const SELECT_CLS =
  'w-full rounded-adm-md border border-adm-border-default bg-adm-bg-base px-3 py-2 text-sm text-adm-text-primary focus:outline-none focus:border-adm-brand-500 focus:ring-2 focus:ring-adm-brand-500/15'

// ── Main Component ────────────────────────────────────────────────────────────

export function UsersClient({ initialUsers, currentUserEmail }: Props) {
  const [users, setUsers] = React.useState<AdminUser[]>(initialUsers)

  // ── Create dialog state
  const [createOpen, setCreateOpen] = React.useState(false)
  const [createName, setCreateName] = React.useState('')
  const [createEmail, setCreateEmail] = React.useState('')
  const [createPassword, setCreatePassword] = React.useState('')
  const [createRole, setCreateRole] = React.useState<'super-admin' | 'admin'>('admin')
  const [createLoading, setCreateLoading] = React.useState(false)

  // ── Edit dialog state
  const [editUser, setEditUser] = React.useState<AdminUser | null>(null)
  const [editName, setEditName] = React.useState('')
  const [editRole, setEditRole] = React.useState<'super-admin' | 'admin'>('admin')
  const [editPassword, setEditPassword] = React.useState('')
  const [editLoading, setEditLoading] = React.useState(false)

  // ── Delete dialog state
  const [deleteUser, setDeleteUser] = React.useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  // ── Re-fetch helper
  async function refreshUsers() {
    try {
      const res = await fetch('/api/users?limit=100&sort=-createdAt', {
        credentials: 'include',
      })
      if (!res.ok) return
      const data = await res.json()
      setUsers(data.docs ?? [])
    } catch {
      // silently ignore; the mutation already succeeded
    }
  }

  // ── Create submit
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (createPassword.length < 8) {
      toast.error('密碼長度至少 8 個字元')
      return
    }
    setCreateLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: createName,
          email: createEmail,
          password: createPassword,
          role: createRole,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        toast.error(body?.errors?.[0]?.message ?? '建立失敗，請確認資料')
        return
      }
      toast.success('管理員已建立')
      setCreateOpen(false)
      setCreateName('')
      setCreateEmail('')
      setCreatePassword('')
      setCreateRole('admin')
      await refreshUsers()
    } catch {
      toast.error('建立失敗，請稍後再試')
    } finally {
      setCreateLoading(false)
    }
  }

  // ── Open edit dialog
  function openEdit(user: AdminUser) {
    setEditUser(user)
    setEditName(user.name ?? '')
    setEditRole(user.role)
    setEditPassword('')
  }

  // ── Edit submit
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    if (editPassword && editPassword.length < 8) {
      toast.error('新密碼長度至少 8 個字元')
      return
    }
    setEditLoading(true)
    try {
      const body: Record<string, unknown> = {
        name: editName,
        role: editRole,
      }
      if (editPassword) body.password = editPassword

      const res = await fetch(`/api/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.errors?.[0]?.message ?? data?.error ?? '更新失敗')
        return
      }
      toast.success('已更新管理員資料')
      setEditUser(null)
      await refreshUsers()
    } catch {
      toast.error('更新失敗，請稍後再試')
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete submit
  async function handleDelete() {
    if (!deleteUser) return
    if (deleteUser.email === currentUserEmail) {
      toast.error('無法刪除目前登入的帳號')
      setDeleteUser(null)
      return
    }
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${deleteUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data?.errors?.[0]?.message ?? data?.error ?? '刪除失敗')
        return
      }
      toast.success(`已刪除 ${deleteUser.name ?? deleteUser.email} 的帳號`)
      setDeleteUser(null)
      await refreshUsers()
    } catch {
      toast.error('刪除失敗，請稍後再試')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-adm-text-primary">管理員帳號</h1>
          <p className="text-sm text-adm-text-tertiary mt-0.5">共 {users.length} 位管理員</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
          <UserPlus className="h-4 w-4" />
          新增管理員
        </Button>
      </div>

      {/* Users list */}
      <Card>
        {users.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="尚無管理員"
            description="點擊右上角「新增管理員」按鈕新增第一位管理員"
          />
        ) : (
          <div className="divide-y divide-adm-border-subtle">
            {users.map((user) => {
              const isSelf = user.email === currentUserEmail
              return (
                <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback>{initials(user)}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-adm-text-primary truncate">
                        {user.name ?? '未命名'}
                      </p>
                      {isSelf && (
                        <span className="text-2xs text-adm-text-tertiary bg-adm-bg-sunken border border-adm-border-subtle px-1.5 py-0.5 rounded-full">
                          本帳號
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-adm-text-tertiary truncate">{user.email}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {roleBadge(user.role)}
                    <span className="text-xs text-adm-text-disabled tabular-nums">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString('zh-TW')
                        : ''}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 rounded-adm-md text-adm-text-tertiary hover:bg-adm-bg-base hover:text-adm-text-primary transition-colors"
                        title="編輯"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteUser(user)}
                        disabled={isSelf}
                        className="p-1.5 rounded-adm-md text-adm-text-tertiary hover:bg-adm-danger-50 hover:text-adm-danger-600 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        title={isSelf ? '無法刪除本帳號' : '刪除'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* ── Create Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>新增管理員</DialogTitle>
            <DialogDescription>填寫以下資料以建立新的管理員帳號</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="create-name">姓名</Label>
                <input
                  id="create-name"
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="管理員姓名"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-email">
                  Email <span className="text-adm-danger-500">*</span>
                </Label>
                <input
                  id="create-email"
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-password">
                  密碼 <span className="text-adm-danger-500">*</span>
                </Label>
                <input
                  id="create-password"
                  type="password"
                  required
                  minLength={8}
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="至少 8 個字元"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="create-role">角色</Label>
                <select
                  id="create-role"
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as 'super-admin' | 'admin')}
                  className={SELECT_CLS}
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" size="md" type="button">取消</Button>
              </DialogClose>
              <Button variant="primary" size="md" type="submit" loading={createLoading}>
                建立帳號
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>編輯管理員</DialogTitle>
            <DialogDescription>{editUser?.email}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">姓名</Label>
                <input
                  id="edit-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="管理員姓名"
                  className={INPUT_CLS}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-role">角色</Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'super-admin' | 'admin')}
                  className={SELECT_CLS}
                >
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-password">
                  新密碼{' '}
                  <span className="text-adm-text-tertiary font-normal text-xs">（留空則不更改）</span>
                </Label>
                <input
                  id="edit-password"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="至少 8 個字元"
                  className={INPUT_CLS}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" size="md" type="button">取消</Button>
              </DialogClose>
              <Button variant="primary" size="md" type="submit" loading={editLoading}>
                儲存變更
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ───────────────────────────────────────── */}
      <Dialog open={!!deleteUser} onOpenChange={(open) => { if (!open) setDeleteUser(null) }}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>確認刪除帳號</DialogTitle>
            <DialogDescription>
              確定要刪除 <span className="font-semibold text-adm-text-primary">{deleteUser?.name ?? deleteUser?.email}</span> 的帳號？此操作無法復原。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" size="md" type="button">取消</Button>
            </DialogClose>
            <Button variant="danger" size="md" loading={deleteLoading} onClick={handleDelete}>
              確認刪除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
