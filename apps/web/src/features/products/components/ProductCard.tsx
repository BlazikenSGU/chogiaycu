import type {
  Product,
} from '../types/product.types';

import {
  getPrimaryImage,
  getDiscountPercent,
} from '../utils/product.utils';

import ProductImage from './ProductImage';
import ProductPrice from './ProductPrice';

interface Props {
  product: Product;
  onQuickView: (slug: string) => void;
}

export default function ProductCard({
  product,
  onQuickView,
}: Props) {
  const primaryImage =
    getPrimaryImage(product.images);

  const discount = getDiscountPercent(
    product.price,
    product.originalPrice,
  );

  function handleQuickView() {
    onQuickView(product.slug);
  }

  return (
    <article className="group min-w-0">
      <button
        type="button"
        aria-label={`Xem nhanh ${product.name}`}
        onClick={handleQuickView}
        className="relative block aspect-square w-full cursor-pointer overflow-hidden rounded-[22px] bg-[#f3f3f3]"
      >
        <ProductImage
          src={primaryImage?.url}
          alt={primaryImage?.alt || product.name}
          className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
        />

        {product.conditionPercent !== null && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold">
            {product.conditionPercent}% New
          </span>
        )}

        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
      </button>

      <div className="pt-3">
        <p className="mb-1 text-xs text-neutral-500">
          {product.brand.name}
        </p>

        <h3 className="min-w-0 text-sm font-bold md:text-base">
          <button
            type="button"
            title={product.name}
            onClick={handleQuickView}
            className="block w-full cursor-pointer truncate text-left hover:underline"
          >
            {product.name}
          </button>
        </h3>

        <p className="mt-2 text-xs text-neutral-500">
          Size {product.size}
          {' · '}
          {product.category.name}
        </p>

        <div className="mt-2">
          <ProductPrice
            price={product.price}
            originalPrice={product.originalPrice}
          />
        </div>
      </div>
    </article>
  );
}