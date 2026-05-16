'use client'
import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Search, ExternalLink, LogOut, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { CommandMenu } from '@/components/ui/command-menu'
import { cn } from '@/lib/utils'

// Map URL segments to Chinese breadcrumb labels
const SEGMENT_LABELS: Record<string, string> = {
  admin: '管理後台',
  dashboard: 'Dashboard',
  collections: '資料集',
  globals: '全域設定',
  news: '最新消息',
  faqs: '常見問答',
  'home-page': '首頁設定',
  'about-page': '關於設定',
  'site-settings': '網站設定',
  products: '商品管理',
  orders: '訂單管理',
  media: '媒體庫',
  users: '使用者',
  create: '新增',
}

function useBreadcrumbs() {
  const pathname = usePathname()
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg,
    href: '/' + segments.slice(0, i + 1).join('/'),
  }))
}

// ⌘K command items (static for now, Step 3 will make them dynamic)
const COMMAND_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    group: '跳轉',
    onSelect: () => { window.location.href = '/admin/dashboard' },
  },
  {
    id: 'products',
    label: '商品管理',
    group: '跳轉',
    onSelect: () => { window.location.href = '/admin/collections/products' },
  },
  {
    id: 'orders',
    label: '訂單管理',
    group: '跳轉',
    onSelect: () => { window.location.href = '/admin/collections/orders' },
  },
  {
    id: 'news',
    label: '最新消息',
    group: '跳轉',
    onSelect: () => { window.location.href = '/admin/collections/news' },
  },
  {
    id: 'media',
    label: '媒體庫',
    group: '跳轉',
    onSelect: () => { window.location.href = '/admin/collections/media' },
  },
]

type User = { id: string | number; name?: string; email?: string } | null

export function Topbar({ user, onMenuClick }: { user: User; onMenuClick: () => void }) {
  const router = useRouter()
  const breadcrumbs = useBreadcrumbs()
  const [cmdOpen, setCmdOpen] = React.useState(false)

  // ⌘K shortcut
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSignOut = async () => {
    await fetch('/api/firebase-auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0]?.toUpperCase() ?? 'U')

  return (
    <>
      <header className="flex h-topbar items-center gap-4 border-b border-adm-border-subtle bg-adm-bg-elevated px-4 shrink-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="flex lg:hidden items-center justify-center h-8 w-8 rounded-adm-md text-adm-text-secondary hover:bg-adm-bg-base transition-colors"
          aria-label="開啟導覽"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex-1 flex items-center gap-1.5 text-sm overflow-hidden">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={crumb.href}>
              {i > 0 && <span className="text-adm-text-disabled">/</span>}
              <span
                className={cn(
                  'truncate',
                  i === breadcrumbs.length - 1
                    ? 'text-adm-text-primary font-semibold'
                    : 'text-adm-text-tertiary'
                )}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Search / ⌘K */}
          <button
            onClick={() => setCmdOpen(true)}
            className="hidden sm:flex items-center gap-2 h-8 rounded-adm-md border border-adm-border-default bg-adm-bg-base px-3 text-xs text-adm-text-tertiary hover:border-adm-border-strong transition-colors duration-150"
            aria-label="搜尋 (⌘K)"
          >
            <Search className="h-3.5 w-3.5" />
            <span>搜尋…</span>
            <kbd className="rounded border border-adm-border-default bg-adm-bg-elevated px-1 py-0.5 text-[10px]">
              ⌘K
            </kbd>
          </button>

          {/* Preview site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 h-8 rounded-adm-md border border-adm-border-default bg-adm-bg-base px-3 text-xs text-adm-text-secondary hover:border-adm-border-strong hover:text-adm-text-primary transition-colors duration-150"
            title="預覽前台"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>前台</span>
          </a>

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-adm-brand-500/30">
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>{user?.email ?? '未知帳號'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/collections/users')}>
                <User className="h-4 w-4" />
                帳號管理
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-adm-danger-600 hover:bg-adm-danger-50 focus:bg-adm-danger-50"
              >
                <LogOut className="h-4 w-4" />
                登出
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandMenu open={cmdOpen} onOpenChange={setCmdOpen} items={COMMAND_ITEMS} />
    </>
  )
}
