'use client'
import type React from 'react'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

type User = { id: string | number; name?: string; email?: string } | null

type Props = {
  children: React.ReactNode
  user: User
}

export function AdminShell({ children, user }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-adm-bg-base">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar
          user={user}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
