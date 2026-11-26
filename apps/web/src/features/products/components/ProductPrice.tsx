import {
  formatProductPrice,
  getDiscountPercent,
} from '../utils/product.utils';

interface Props {
  price: number;
  originalPrice: number | null;
  size?: 'sm' | 'lg';
  showDiscount?: boolean;
}

export default function ProductPrice({
  price,
  originalPrice,
  size = 'sm',
  showDiscount = false,
}: Props) {
  const discount = getDiscountPercent(
    price,
    originalPrice,
  );

  const hasDiscount =
    originalPrice !== null &&
    originalPrice > price;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={
          size === 'lg'
            ? 'text-2xl font-extrabold md:text-3xl'
            : 'text-base font-semibold'
        }
      >
        {formatProductPrice(price)}
      </span>

      {hasDiscount && (
        <span className="text-xs text-neutral-400 line-through">
          {formatProductPrice(originalPrice)}
        </span>
      )}

      {showDiscount && discount > 0 && (
        <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
          -{discount}%
        </span>
      )}
    </div>
  );
}