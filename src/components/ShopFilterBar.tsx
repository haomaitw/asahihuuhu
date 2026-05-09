'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { AnimateIn } from './AnimateIn'

type Product = {
  id: string
  name: string
  slug?: string
  image: string
  price?: number
  comparePrice?: number
  shortDescription?: string
  stock?: number
  trackStock?: boolean
  category?: string
}

type Props = {
  goods: Product[]
  seasonal: Product[]
  locale: string
}

type Filter = 'all' | 'goods' | 'seasonal'

const FILTER_LABELS: Record<Filter, string> = {
  all:      '全部商品',
  goods:    '職人精選',
  seasonal: '季節限定',
}

export function ShopFilterBar({ goods, seasonal, locale }: Props) {
  const [filter, setFilter] = useState<Filter>('all')

  const allProducts: Product[] = [
    ...goods.map((p) => ({ ...p, category: 'goods' })),
    ...seasonal.map((p) => ({ ...p, category: 'seasonal' })),
  ]

  const displayed =
    filter === 'all'      ? allProducts :
    filter === 'goods'    ? goods.map((p) => ({ ...p, category: 'goods' })) :
                            seasonal.map((p) => ({ ...p, category: 'seasonal' }))

  const hasProducts = allProducts.length > 0

  if (!hasProducts) return null

  return (
    <div className="bg-paper-50 pt-6 pb-20 md:pb-28">
      <div className="container-content">

        {/* ── Filter tabs ──────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-1">
          {(Object.entries(FILTER_LABELS) as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 px-5 py-2 rounded-pill text-xs tracking-[0.2em] transition-all duration-300 border ${
                filter === key
                  ? 'bg-sea-400 text-white border-sea-400 shadow-sm'
                  : 'bg-white text-ink/60 border-paper-200 hover:border-sea-300 hover:text-ink'
              }`}
            >
              {label}
              {key !== 'all' && (
                <span className={`ml-1.5 ${filter === key ? 'text-white/70' : 'text-ink/30'}`}>
                  ({key === 'goods' ? goods.length : seasonal.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Category badge (when showing all) ───────────────────── */}
        {filter === 'all' && goods.length > 0 && seasonal.length > 0 ? (
          <div className="space-y-14">
            {/* Goods group */}
            <div>
              <p className="text-xs tracking-[0.3em] text-sea-400 uppercase mb-6">GOODS · 職人精選</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12">
                {goods.map((p, i) => (
                  <AnimateIn key={p.id} delay={i * 60}>
                    <ProductCard product={p} locale={locale} />
                  </AnimateIn>
                ))}
              </div>
            </div>
            {/* Seasonal group */}
            <div>
              <p className="text-xs tracking-[0.3em] text-sea-400 uppercase mb-6">SEASONAL · 季節限定</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12">
                {seasonal.map((p, i) => (
                  <AnimateIn key={p.id} delay={i * 60}>
                    <ProductCard product={p} locale={locale} />
                  </AnimateIn>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 md:gap-x-10 gap-y-12">
            {displayed.map((p, i) => (
              <AnimateIn key={p.id} delay={i * 60}>
                <ProductCard product={p} locale={locale} />
              </AnimateIn>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

function ProductCard({ product, locale }: { product: Product; locale: string }) {
  const href = product.slug ? `/${locale}/shop/${product.slug}` : `/${locale}/shop`
  const outOfStock = product.trackStock && (product.stock ?? 0) === 0
  const discount = product.comparePrice && product.comparePrice > (product.price ?? 0)
    ? Math.round((1 - (product.price ?? 0) / product.comparePrice) * 100)
    : null

  return (
    <Link href={href} className="group flex flex-col gap-3">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${outOfStock ? 'opacity-50' : ''}`}
        />
        {discount && !outOfStock && (
          <span className="absolute top-3 left-3 bg-sea-700 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/60">
            <span className="text-xs tracking-widest text-ink/50 bg-white/80 px-3 py-1 rounded-full">售完</span>
          </span>
        )}
        {product.category === 'seasonal' && !outOfStock && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
            季節
          </span>
        )}
      </div>
      <div>
        <p className="font-sans font-light text-sm text-ink group-hover:text-sea-600 transition-colors leading-snug line-clamp-2">
          {product.name}
        </p>
        {product.shortDescription && (
          <p className="text-xs text-ink/40 mt-0.5 line-clamp-1">{product.shortDescription}</p>
        )}
        <div className="flex items-baseline gap-2 mt-1">
          {product.price != null && (
            <span className="font-sans text-sm text-sea-700">
              NT$ {product.price.toLocaleString()}
            </span>
          )}
          {product.comparePrice && product.comparePrice > (product.price ?? 0) && (
            <span className="text-xs text-ink/35 line-through">
              NT$ {product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
