import type React from 'react'
import type { Metadata } from 'next'
import '@/styles/admin-tokens.css'

export const metadata: Metadata = {
  title: { default: '管理後台 — 異想天開影像 CMS', template: '%s — 異想天開影像 CMS' },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body
        className="bg-adm-bg-base antialiased"
        style={{ fontFamily: '"Noto Sans TC", "Noto Sans JP", system-ui, sans-serif' }}
      >
        {children}
      </body>
    </html>
  )
}
