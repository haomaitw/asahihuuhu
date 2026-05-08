'use client'

import { ProductCard, type Product } from './ProductCard'

type Props = {
  products: Product[]
  locale?: string
}

/**
 * Infinite CSS marquee carousel — matches the original asahihuuhu.com
 * horizontal scroll experience.  Products are duplicated so the loop
 * is seamless.  Pauses on hover / touch hold.
 *
 * Overflow strategy:
 *  - outer wrapper: overflow-hidden + max-w-[100vw] clips the marquee
 *  - no negative margins (those were causing mobile scroll bleed)
 */
export function ProductCarousel({ products, locale }: Props) {
  if (!products.length) return null

  // Duplicate until we have ≥ 8 cards so the marquee fills wide screens
  const base = products.length < 4
    ? [...products, ...products, ...products, ...products]
    : products.length < 8
      ? [...products, ...products]
      : products

  const pauseAnim = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.animationPlayState = 'paused'
  }
  const resumeAnim = (e: React.MouseEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).style.animationPlayState = 'running'
  }

  return (
    /* Viewport — clips the overflowing marquee, never wider than screen */
    <div
      className="w-full overflow-hidden"
      style={{
        maxWidth: '100vw',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
        maskImage:        'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
      }}
    >
      {/* Track — flex row, width determined by content, animated */}
      <div
        className="marquee-track gap-4 md:gap-6 px-4"
        onMouseEnter={pauseAnim}
        onMouseLeave={resumeAnim}
      >
        {/* First copy */}
        {base.map((p, i) => (
          <ProductCard key={`a${i}-${p.id}`} product={p} locale={locale} variant="carousel" />
        ))}
        {/* Duplicate for seamless infinite loop */}
        {base.map((p, i) => (
          <ProductCard key={`b${i}-${p.id}`} product={p} locale={locale} variant="carousel" aria-hidden />
        ))}
      </div>
    </div>
  )
}
