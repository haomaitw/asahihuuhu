'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useTranslations } from 'next-intl'

type Props = {
  id: string
  name: string
  price: number
  image: string
}

export function AddToCartButton({ id, name, price, image }: Props) {
  const t = useTranslations('cart')
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({ id, name, price, image })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handleAdd}
      className="btn-primary w-full py-2.5 text-sm tracking-widest transition-all"
    >
      {added ? t('added') : t('addToCart')}
    </button>
  )
}
