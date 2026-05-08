'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  orderNumber: string
  locale: string
}

// Shown when the order exists but the ECPay payment callback hasn't updated it
// to 'paid' yet. Polls the result page every 2 s for up to 30 s.
export function ResultProcessing({ orderNumber, locale }: Props) {
  const router = useRouter()
  const attemptsRef = useRef(0)
  const MAX_ATTEMPTS = 15 // 15 × 2 s = 30 s

  useEffect(() => {
    const timer = setInterval(() => {
      attemptsRef.current++
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        clearInterval(timer)
        return
      }
      router.refresh()
    }, 2000)
    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="text-center space-y-6 max-w-md w-full">
      <div className="w-20 h-20 mx-auto bg-sand-50 rounded-full flex items-center justify-center">
        <svg
          className="h-10 w-10 text-brand-500 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
      <div>
        <h1 className="font-serif text-2xl tracking-wide text-ink mb-2">付款確認中…</h1>
        <p className="text-sm text-ink/50">請稍候，正在確認您的付款結果</p>
        {orderNumber && (
          <p className="text-xs text-ink/30 font-mono mt-2">{orderNumber}</p>
        )}
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={() => router.refresh()}
          className="border border-sand-200 hover:border-brand-300 text-ink/70 py-3.5 rounded-xl transition-colors text-sm"
        >
          手動重新整理
        </button>
        <a
          href={`/${locale}/account/orders`}
          className="text-xs text-ink/40 hover:text-ink/60 underline"
        >
          前往訂單記錄查看
        </a>
      </div>
    </div>
  )
}
