import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper-50">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif text-ink">404</h1>
        <p className="text-ink/60">找不到此頁面</p>
        <Link href="/admin/dashboard" className="text-brand-700 underline text-sm">
          返回後台
        </Link>
      </div>
    </div>
  )
}
