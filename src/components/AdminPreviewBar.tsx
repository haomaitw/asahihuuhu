'use client'
import Link from 'next/link'
import { Settings } from 'lucide-react'

export function AdminPreviewBar({ maintenanceOn }: { maintenanceOn: boolean }) {
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9999] flex items-center justify-between px-4 py-1.5 text-xs font-medium ${
        maintenanceOn
          ? 'bg-red-600 text-white'
          : 'bg-neutral-900 text-neutral-100'
      }`}
    >
      <div className="flex items-center gap-2">
        <span className={`h-1.5 w-1.5 rounded-full ${maintenanceOn ? 'bg-red-300 animate-pulse' : 'bg-emerald-400'}`} />
        {maintenanceOn ? '維護模式開啟中（僅管理員可見前台）' : '後台預覽模式'}
      </div>
      <Link
        href="/admin/dashboard"
        className="flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity"
      >
        <Settings className="h-3.5 w-3.5" />
        返回後台
      </Link>
    </div>
  )
}
