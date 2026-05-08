'use client'
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Newspaper, HelpCircle, Home, Info, Settings2,
  Package, ShoppingBag, Image as ImageIcon, Users,
  ChevronLeft, ChevronRight, Tag, FolderOpen, UserCircle,
  UsersRound, Ticket, Coins, Truck, QrCode, ChefHat, Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  superAdminOnly?: boolean
  locked?: boolean
}

type NavGroup = {
  group: string
  items: NavItem[]
  superAdminOnly?: boolean
}

const NAV: NavGroup[] = [
  {
    group: '總覽',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    group: '內容管理',
    items: [
      { label: '最新消息', href: '/admin/collections/news', icon: Newspaper },
      { label: '常見問答', href: '/admin/collections/faqs', icon: HelpCircle },
      { label: '首頁設定', href: '/admin/globals/home-page', icon: Home },
      { label: '關於設定', href: '/admin/globals/about-page', icon: Info },
      { label: '網站設定', href: '/admin/globals/site-settings', icon: Settings2 },
    ],
  },
  {
    group: '商城',
    items: [
      { label: '商品管理', href: '/admin/collections/products', icon: Package },
      { label: '訂單管理', href: '/admin/collections/orders', icon: ShoppingBag },
      { label: '顧客管理', href: '/admin/collections/customers', icon: UsersRound },
      { label: '優惠券', href: '/admin/collections/coupons', icon: Ticket },
      { label: '點數記錄', href: '/admin/collections/point-transactions', icon: Coins },
    ],
  },
  {
    group: '分類管理',
    items: [
      { label: '商品分類', href: '/admin/collections/product-categories', icon: Tag },
      { label: '文章分類', href: '/admin/collections/news-categories', icon: FolderOpen },
    ],
  },
  {
    group: '人員管理',
    items: [
      { label: '團隊成員', href: '/admin/collections/staff', icon: UserCircle },
    ],
  },
  {
    group: '資產',
    items: [
      { label: '媒體庫', href: '/admin/collections/media', icon: ImageIcon },
    ],
  },
  {
    group: '桌邊服務',
    superAdminOnly: true,
    items: [
      { label: 'QR 碼點餐', href: '/admin/dine-in', icon: QrCode, locked: true },
      { label: '廚房顯示', href: '/admin/kitchen', icon: ChefHat, locked: true },
    ],
  },
  {
    group: '帳號管理',
    superAdminOnly: true,
    items: [
      { label: '帳號管理', href: '/admin/collections/users', icon: Users, superAdminOnly: true },
    ],
  },
]

type SidebarProps = {
  collapsed: boolean
  onCollapse: () => void
  mobileOpen: boolean
  onMobileClose: () => void
  role?: string
}

function NavItemRow({
  item,
  collapsed,
  active,
}: {
  item: NavItem
  collapsed: boolean
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        'relative flex items-center gap-2.5 rounded-adm-md px-2.5 py-1.5 text-sm transition-colors duration-150',
        active
          ? 'bg-adm-brand-100 text-adm-brand-700 font-medium'
          : item.locked
            ? 'text-adm-text-tertiary hover:bg-adm-bg-sunken hover:text-adm-text-secondary'
            : 'text-adm-text-secondary hover:bg-adm-brand-50 hover:text-adm-text-primary',
        collapsed && 'justify-center px-0'
      )}
      title={collapsed ? item.label : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-adm-brand-500" />
      )}
      <Icon className={cn('shrink-0', collapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.locked && (
        <Lock className="h-3 w-3 text-adm-text-tertiary shrink-0" />
      )}
      {!collapsed && !item.locked && item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-adm-danger-500 px-1 text-[10px] font-medium text-white">
          {item.badge}
        </span>
      )}
    </Link>
  )
}

function SidebarContent({
  collapsed,
  onCollapse,
  pathname,
  role,
}: {
  collapsed: boolean
  onCollapse: () => void
  pathname: string
  role?: string
}) {
  const isSuperAdmin = role === 'super-admin'

  return (
    <div className="flex h-full flex-col bg-adm-bg-base border-r border-adm-border-subtle">
      {/* Logo */}
      <div
        className={cn(
          'flex items-center border-b border-adm-border-subtle',
          collapsed ? 'h-14 justify-center px-4' : 'h-14 gap-2.5 px-4'
        )}
      >
        <Image
          src="/asahi/logo-black.svg"
          alt="朝日夫婦"
          width={collapsed ? 28 : 88}
          height={28}
          className="shrink-0 object-contain"
          priority
        />
        {!collapsed && (
          <span className="ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded bg-adm-brand-100 text-adm-brand-700 shrink-0">
            {isSuperAdmin ? '代管商' : '客戶'}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {NAV.map((section) => {
          // Hide super-admin-only sections from regular admins
          if (section.superAdminOnly && !isSuperAdmin) return null
          const visibleItems = section.items.filter((item) => !item.superAdminOnly || isSuperAdmin)
          if (!visibleItems.length) return null

          return (
            <div key={section.group} className="space-y-0.5">
              {!collapsed && (
                <p className="mb-1.5 px-2.5 text-2xs uppercase tracking-wider font-medium text-adm-text-tertiary">
                  {section.group}
                </p>
              )}
              {visibleItems.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <NavItemRow
                    key={item.href}
                    item={item}
                    collapsed={collapsed}
                    active={active}
                  />
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-adm-border-subtle p-2">
        <button
          onClick={onCollapse}
          className="flex w-full items-center justify-center rounded-adm-md p-2 text-adm-text-tertiary hover:bg-adm-brand-50 hover:text-adm-text-primary transition-colors duration-150"
          aria-label={collapsed ? '展開側欄' : '收合側欄'}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="ml-1.5 text-xs">收合</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function Sidebar({
  collapsed,
  onCollapse,
  mobileOpen,
  onMobileClose,
  role,
}: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          'hidden lg:flex flex-col flex-shrink-0 h-full transition-all duration-300',
          collapsed ? 'w-sidebar-collapsed' : 'w-sidebar'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapse={onCollapse}
          pathname={pathname}
          role={role}
        />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-adm-bg-overlay lg:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden">
            <SidebarContent
              collapsed={false}
              onCollapse={onMobileClose}
              pathname={pathname}
              role={role}
            />
          </div>
        </>
      )}
    </>
  )
}
