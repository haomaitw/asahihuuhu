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
}

type Props = {
  product: Product
  locale?: string
}

export function ProductCard({ product, locale = 'zh-TW' }: Props) {
  const hasDiscount = product.comparePrice && product.comparePrice > (product.price ?? 0)
  const discountPct = hasDiscount
    ? Math.round((1 - (product.price ?? 0) / product.comparePrice!) * 100)
    : null

  const card = (
    <div className="group flex w-[260px] shrink-0 flex-col gap-3">
      <div className="product-image-wrap aspect-square relative">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discountPct && (
          <span className="absolute top-3 left-3 bg-brand-700 text-white text-[10px] font-medium px-2 py-0.5 rounded-full z-10">
            -{discountPct}%
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-sm text-ink/80 transition-colors duration-200 group-hover:text-ink">
        <span className="text-sea-400">·</span>
        <span className="tracking-wide">{product.name}</span>
      </div>
      {product.shortDescription && (
        <p className="text-xs text-ink/50 -mt-1 line-clamp-2">{product.shortDescription}</p>
      )}
      {product.price !== undefined && (
        <>
          <div className="flex items-baseline gap-2 -mt-1">
            <p className="text-xs text-sea-600">NT$ {product.price.toLocaleString()}</p>
            {hasDiscount && (
              <p className="text-xs text-ink/30 line-through">NT$ {product.comparePrice!.toLocaleString()}</p>
            )}
          </div>
          <AddToCartButton
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        </>
      )}
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
