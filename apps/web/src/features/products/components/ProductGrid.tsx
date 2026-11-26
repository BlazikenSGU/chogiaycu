import { useState } from 'react';

import type {
  Product,
} from '../types/product.types';

import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ProductQuickView from './ProductQuickView';

interface Props {
  products: Product[];
  loading?: boolean;
  skeletonCount?: number;
}

export default function ProductGrid({
  products,
  loading = false,
  skeletonCount = 8,
}: Props) {
  const [selectedSlug, setSelectedSlug] =
    useState<string | null>(null);

  function closeQuickView() {
    setSelectedSlug(null);
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({
              length: skeletonCount,
            }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))
          : products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setSelectedSlug}
              />
            ))}
      </div>

      {selectedSlug && (
        <ProductQuickView
          key={selectedSlug}
          slug={selectedSlug}
          onClose={closeQuickView}
        />
      )}
    </>
  );
}