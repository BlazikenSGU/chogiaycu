import type {
  Product,
} from '../../types/product.types';

import {
  isProductAvailable,
} from '../../utils/product.utils';

interface Props {
  product: Product;
}

export default function ProductDetailInfo({
  product,
}: Props) {
  const available =
    isProductAvailable(product);

  return (
    <div>
      <h1 className="break-words text-2xl font-extrabold tracking-tight md:text-4xl">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium">
          {product.brand.name}
        </span>

        <span className="rounded-md bg-neutral-100 px-2.5 py-1 text-xs font-medium">
          {product.category.name}
        </span>

        <span
          className={`flex items-center gap-1.5 text-xs font-medium
            ${
              available
                ? 'text-green-700'
                : 'text-neutral-500'
            }`}
        >
          <span
            className={`h-2 w-2 rounded-full
              ${
                available
                  ? 'bg-green-600'
                  : 'bg-neutral-400'
              }`}
          />

          {available
            ? 'Còn hàng'
            : 'Không còn hàng'}
        </span>
      </div>
    </div>
  );
}