import Image from 'next/image'
import Link from 'next/link'
import { AddToCartButton } from './AddToCartButton'

export type Product = {
  id: string
  name: string
  slug?: string
  image: string
  price?: number
  comparePrice?: number
  shortDescription?: string
  stock?: number
  trackStock?: boolean
}

type Props = {
  product: Product
  locale?: string
  /**
   * carousel — fixed width for the homepage infinite marquee
   * grid     — full column width for the shop grid
   */
  variant?: 'carousel' | 'grid'
  'aria-hidden'?: boolean
}

export function ProductCard({
  product,
  locale = 'zh-TW',
  variant = 'carousel',
  'aria-hidden': ariaHidden,
}: Props) {
  const hasDiscount = product.comparePrice && product.comparePrice > (product.price ?? 0)
  const discountPct = hasDiscount
    ? Math.round((1 - (product.price ?? 0) / product.comparePrice!) * 100)
    : null

  const isSoldOut  = product.trackStock && (product.stock ?? 0) === 0
  const isLowStock = !isSoldOut && product.trackStock && (product.stock ?? 0) <= 3

  const card = (
    <div
      aria-hidden={ariaHidden}
      className={`group flex flex-col gap-4 ${
        variant === 'grid' ? 'w-full' : 'w-[220px] md:w-[260px] shrink-0'
      }`}
    >
      {/* ── Image ─────────────────────────────────────────────────────── */}
      <div
        className="product-image-wrap aspect-square relative w-full overflow-hidden"
        style={{ borderRadius: '12px' }}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={variant === 'grid' ? '(max-width: 768px) 50vw, 33vw' : '260px'}
          className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
            isSoldOut ? 'opacity-50' : ''
          }`}
        />

        {/* Sold-out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <span className="bg-white/90 text-ink text-xs font-medium tracking-[0.2em] px-4 py-2 rounded-full shadow-sm">
              售完
            </span>
          </div>
        )}

        {/* Discount badge */}
        {discountPct && !isSoldOut && (
          <span className="absolute top-3 left-3 bg-sea-400 text-white text-xs font-medium tracking-wider px-2.5 py-1 rounded-full z-10">
            -{discountPct}%
          </span>
        )}

        {/* Low stock badge */}
        {isLowStock && (
          <span className="absolute top-3 right-3 bg-amber-500/90 text-white text-xs font-medium tracking-wide px-2.5 py-1 rounded-full z-10">
            僅剩 {product.stock} 件
          </span>
        )}
      </div>

      {/* ── Info ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2.5">
        {/* Name */}
        <p
          className={`font-sans tracking-widest text-ink transition-colors duration-300 group-hover:text-sea-400 ${
            variant === 'grid' ? 'text-base md:text-lg' : 'text-base'
          }`}
        >
          {product.name}
        </p>

        {/* Short description */}
        {product.shortDescription && (
          <p className="text-sm text-ink/55 leading-relaxed line-clamp-2">
            {product.shortDescription}
          </p>
        )}

        {/* Price + CTA */}
        {product.price !== undefined && (
          <div className="flex flex-col gap-3 mt-1">
            {/* Price row */}
            <div className="flex items-baseline gap-2">
              <span className={`text-base font-medium ${isSoldOut ? 'text-ink/30' : 'text-sea-500'}`}>
                NT$ {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-ink/35 line-through">
                  NT$ {product.comparePrice!.toLocaleString()}
                </span>
              )}
            </div>

            {/* CTA */}
            {isSoldOut ? (
              <button
                disabled
                className="w-full text-sm tracking-widest text-ink/30 border border-ink/10 rounded-xl py-2.5 cursor-not-allowed bg-paper-100"
              >
                目前售完
              </button>
            ) : (
              <AddToCartButton
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )

  if (product.slug) {
    return (
      <Link href={`/${locale}/shop/${product.slug}`} className="contents">
        {card}
      </Link>
    )
  }

  return card
}
