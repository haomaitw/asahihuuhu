import { ProductCard, type Product } from './ProductCard';

type Props = {
  products: Product[]
  locale?: string
}

export function ProductCarousel({ products, locale }: Props) {
  return (
    <div className="-mx-6 md:mx-0 overflow-x-auto">
      <div className="flex gap-6 px-6 md:px-0 md:justify-center md:flex-wrap">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} locale={locale} />
        ))}
      </div>
    </div>
  );
}
