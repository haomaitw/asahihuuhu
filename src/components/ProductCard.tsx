import Image from 'next/image';
import { AddToCartButton } from './AddToCartButton';

export type Product = {
  id: string;
  name: string;
  image: string;
  price?: number;
};

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="group flex w-[260px] shrink-0 flex-col gap-3">
      <div className="product-image-wrap aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="260px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex items-center gap-2 text-sm text-ink/80 transition-colors duration-200 group-hover:text-ink">
        <span className="text-sea-400">·</span>
        <span className="tracking-wide">{product.name}</span>
      </div>
      {product.price !== undefined && (
        <>
          <p className="text-xs text-sea-600 -mt-1">NT$ {product.price.toLocaleString()}</p>
          <AddToCartButton
            id={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        </>
      )}
    </div>
  );
}
