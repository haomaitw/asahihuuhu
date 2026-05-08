'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserCircle } from 'lucide-react'
import { useCustomerStore } from '@/store/customer'

export function HeaderAccountButton() {
  const [mounted, setMounted] = useState(false)
  const { customer } = useCustomerStore()
  const router = useRouter()

  useEffect(() => { setMounted(true) }, [])

  const handleClick = () => {
    router.push(customer ? '/account' : '/account/login')
  }

  if (!mounted) return null

  return (
    <button
      onClick={handleClick}
      className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors"
      aria-label={customer ? '會員中心' : '登入'}
      title={customer ? `${customer.name} · ${customer.points} 點` : '登入 / 註冊'}
    >
      <UserCircle
        size={20}
        strokeWidth={1.5}
        className={customer ? 'text-white' : 'text-white/70'}
      />
      {mounted && customer && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sea-400 border-2 border-white/30" />
      )}
    </button>
  )
}
