'use client'

import { ProductCard, type Product } from './ProductCard'

type Props = {
  products: Product[]
  locale?: string
}

/**
 * Infinite CSS marquee carousel — matches the original asahihuuhu.com
 * horizontal scroll experience.  Products are duplicated so the loop
 * is seamless.  Pauses on hover.
 */
export function ProductCarousel({ products, locale }: Props) {
  if (!products.length) return null

  // Ensure enough items to fill the viewport (duplicate until we have ≥ 8)
  const expanded = products.length < 4
    ? [...products, ...products, ...products, ...products]
    : products.length < 8
      ? [...products, ...products]
      : products

  return (
    <div
      className="marquee-viewport -mx-5 md:-mx-8 lg:-mx-10"
      style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%)' }}
    >
      <div
        className="marquee-track gap-5 md:gap-6"
        style={{ animationPlayState: 'running' }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.animationPlayState = 'paused')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.animationPlayState = 'running')}
      >
        {/* First copy */}
        {expanded.map((p, i) => (
          <ProductCard key={`a${i}-${p.id}`} product={p} locale={locale} variant="carousel" />
        ))}
        {/* Duplicate for seamless infinite loop */}
        {expanded.map((p, i) => (
          <ProductCard key={`b${i}-${p.id}`} product={p} locale={locale} variant="carousel" aria-hidden />
        ))}
      </div>
    </div>
  )
}
