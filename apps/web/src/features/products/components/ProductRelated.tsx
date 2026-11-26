import type {
  Product,
} from '../types/product.types';

import {
  usePublicProducts,
} from '../hooks/usePublicProducts';

import ProductGrid from './ProductGrid';

interface Props {
  product: Product;
}

export default function ProductRelated({
  product,
}: Props) {
  const {
    data,
    isPending,
    isError,
  } = usePublicProducts({
    page: 1,
    limit: 5,
    categoryId: product.categoryId,
    sort: 'newest',
  });

  const relatedProducts =
    (data?.data ?? [])
      .filter(
        (item) => item.id !== product.id,
      )
      .slice(0, 4);

  if (
    isError ||
    (!isPending &&
      relatedProducts.length === 0)
  ) {
    return null;
  }

  return (
    <section className="mt-10 md:mt-16">
      <h2 className="mb-6 text-xl font-bold">
        Sản phẩm liên quan
      </h2>

      <ProductGrid
        products={relatedProducts}
        loading={isPending}
        skeletonCount={4}
      />
    </section>
  );
}