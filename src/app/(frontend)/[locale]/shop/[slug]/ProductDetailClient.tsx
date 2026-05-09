'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShoppingBag, Truck, Snowflake, ChevronLeft, CheckCircle2 } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import type { CmsProduct, CmsProductDetail } from '@/lib/cms-products'
import { RichText } from '@/components/RichText'

type Props = {
  product: CmsProductDetail
  locale: string
  relatedProducts?: CmsProduct[]
}

export function ProductDetailClient({ product, locale, relatedProducts = [] }: Props) {
  const { addItem, items } = useCartStore()
  const t = useTranslations()

  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  const cartItem = items.find((i) => i.id === product.id)
  const cartQty = cartItem?.quantity ?? 0

  const inStock = !product.trackStock || product.stock > 0
  const lowStock = product.trackStock && product.stock > 0 && product.stock <= 3

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 2000)
  }

  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : null

  return (
    <div className="bg-paper-50 min-h-dvh">
      {/* Breadcrumb */}
      <div className="container-content pt-28 pb-0">
        <Link
          href={`/${locale}/shop`}
          className="inline-flex items-center gap-1.5 text-xs tracking-widest text-ink/40 hover:text-ink/70 transition-colors"
        >
          <ChevronLeft className="h-3 w-3" />
          {t('shop.title')}
        </Link>
      </div>

      {/* Main grid */}
      <div className="container-content py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* ── Left: Gallery ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-sm">
              <Image
                src={product.images[activeImg] ?? product.image}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-opacity duration-300"
              />
              {discount && (
                <span className="absolute top-4 left-4 bg-sea-700 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                  -{discount}%
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      i === activeImg ? 'border-sea-500' : 'border-transparent hover:border-paper-200'
                    }`}
                  >
                    <Image src={src} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Info ───────────────────────────────────────── */}
          <div className="flex flex-col gap-6">

            {/* Category */}
            {product.category && (
              <p className="text-xs tracking-[0.25em] uppercase text-sea-500">{product.category}</p>
            )}

            {/* Name */}
            <h1 className="font-serif text-3xl md:text-4xl tracking-wider text-ink leading-snug">
              {product.name}
            </h1>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm text-ink/60 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-2xl text-sea-800">
                NT$ {product.price.toLocaleString()}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-base text-ink/40 line-through">
                  NT$ {product.comparePrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Stock badge */}
            <div>
              {!inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm bg-red-50 text-red-500 px-4 py-2 rounded-full border border-red-100">
                  售完補貨中
                </span>
              ) : lowStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm bg-amber-50 text-amber-600 px-4 py-2 rounded-full border border-amber-100">
                  僅剩 {product.stock} 份，把握機會！
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm bg-green-50 text-green-600 px-4 py-2 rounded-full border border-green-100">
                  <CheckCircle2 className="h-4 w-4" />
                  現貨供應中
                </span>
              )}
            </div>

            {/* Quantity + CTA */}
            {inStock && (
              <div className="flex items-center gap-3">
                {/* Qty stepper */}
                <div className="flex items-center border border-paper-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-3 text-ink/60 hover:text-ink hover:bg-paper-50 transition-colors text-lg leading-none"
                    aria-label="減少數量"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(q => product.trackStock ? Math.min(product.stock, q + 1) : q + 1)}
                    className="px-4 py-3 text-ink/60 hover:text-ink hover:bg-paper-50 transition-colors text-lg leading-none"
                    aria-label="增加數量"
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-sm tracking-widest font-medium transition-all duration-200 ${
                    justAdded
                      ? 'bg-green-600 text-white'
                      : 'btn-primary'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  {justAdded ? '已加入購物車 ✓' : t('cart.addToCart')}
                </button>
              </div>
            )}

            {/* Cart indicator */}
            {cartQty > 0 && (
              <p className="text-sm text-sea-500">
                購物車中已有 {cartQty} 件
                <Link href={`/${locale}/checkout`} className="ml-2 underline hover:text-sea-800">
                  前往結帳 →
                </Link>
              </p>
            )}

            {/* Delivery info */}
            <div className="border-t border-paper-100 pt-5 space-y-3">
              <div className="flex items-start gap-3 text-sm text-ink/70">
                <Truck className="h-4 w-4 mt-0.5 shrink-0 text-sea-500" />
                <div>
                  <p className="font-medium text-ink/80 mb-0.5">黑貓宅急便冷凍配送</p>
                  <p className="text-sm text-ink/50">運費 NT$120・全台宅配・約 1–3 個工作天</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm text-ink/70">
                <Snowflake className="h-4 w-4 mt-0.5 shrink-0 text-sea-400" />
                <div>
                  <p className="font-medium text-ink/80 mb-0.5">冷凍保存</p>
                  <p className="text-sm text-ink/50">本商品為冷凍商品，請於收件後盡速簽收，開封前請保持冷凍保存</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Description ─────────────────────────────────────────── */}
        {product.description && (
          <div className="mt-16 lg:mt-24 border-t border-paper-100 pt-12">
            <h2 className="font-serif text-2xl tracking-wider mb-8 text-center">商品詳情</h2>
            <div className="max-w-2xl mx-auto prose prose-sm prose-ink leading-relaxed">
              <RichText data={product.description} />
            </div>
          </div>
        )}

        {/* ── Related Products ─────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 lg:mt-24 border-t border-paper-100 pt-12">
            <h2 className="font-serif text-2xl tracking-wider mb-10 text-center">
              {t('shop.related')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/${locale}/shop/${p.slug}`}
                  className="group flex flex-col gap-3"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <p className="font-sans font-light text-sm text-ink group-hover:text-sea-600 transition-colors leading-snug">
                      {p.name}
                    </p>
                    <p className="text-xs text-sea-700 mt-1">
                      NT$ {p.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
