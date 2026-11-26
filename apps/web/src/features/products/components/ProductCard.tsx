import { useState } from 'react';
import { Footprints } from 'lucide-react';

import type { Product } from '../types/product.types';

interface Props {
  product: Product;
}

const priceFormatter = new Intl.NumberFormat(
  'vi-VN',
  {
    style: 'currency',
    currency: 'VND',
  },
);

export default function ProductCard({
  product,
}: Props) {
  const primaryImage =
    product.images.find((image) => image.isPrimary)
    ?? product.images[0];

  const hasDiscount =
    product.originalPrice !== null &&
    product.originalPrice > product.price;

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#f3f3f3]">

        <ProductImage
          key={primaryImage?.url ?? 'empty'}
          src={primaryImage?.url}
          alt={primaryImage?.alt || product.name}
        />

        {product.conditionPercent !== null && (
          <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold">
            {product.conditionPercent}% New
          </span>
        )}

        {hasDiscount && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-semibold text-white">
            -{Math.round(
              (1 - product.price / product.originalPrice!) * 100,
            )}%
          </span>
        )}
      </div>

      <div className="pt-3">
        <p className="mb-1 text-xs text-neutral-500">
          {product.brand.name}
        </p>

        <h3
          title={product.name}
          className="truncate text-sm font-bold md:text-base"
        >
          {product.name}
        </h3>

        <p className="mt-2 text-xs text-neutral-500">
          Size {product.size}
          {' · '}
          {product.category.name}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-base font-extrabold md:text-lg">
            {priceFormatter.format(product.price)}
          </p>

          {hasDiscount && (
            <span className="text-xs text-neutral-400 line-through">
              {priceFormatter.format(
                product.originalPrice!,
              )}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

interface ImageProps {
  src?: string;
  alt: string;
}

function ProductImage({ src, alt }: ImageProps) {
  const [imageError, setImageError] = useState(false);

  if (!src || imageError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
        <Footprints size={44} strokeWidth={1.3} />

        <span className="text-xs">
          Ảnh đang cập nhật
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setImageError(true)}
      className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
    />
  );
}