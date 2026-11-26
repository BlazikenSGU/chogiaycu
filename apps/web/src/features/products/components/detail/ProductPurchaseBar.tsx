import { ShoppingBag } from 'lucide-react';

import {
  formatProductPrice,
} from '../../utils/product.utils';

interface Props {
  totalPrice: number;
  originalTotalPrice?: number | null;
  available: boolean;
  onAddToCart?: () => void;
}

export default function ProductPurchaseBar({
  totalPrice,
  originalTotalPrice,
  available,
  onAddToCart,
}: Props) {
  const disabled =
    !available || !onAddToCart;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-100 bg-white px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.04)] md:static md:z-auto md:px-0 md:pb-0 md:pt-6 md:shadow-none">
      <div className="mx-auto flex max-w-7xl items-center gap-4">

        {/* Total Price */}
        <div className="min-w-0 shrink-0">
          <p className="mb-1 text-xs text-neutral-500">
            Tổng tiền
          </p>

          <p className="text-lg font-extrabold tracking-tight md:text-2xl">
            {formatProductPrice(totalPrice)}
          </p>

          {originalTotalPrice != null &&
            originalTotalPrice > totalPrice && (
              <p className="text-xs text-neutral-400 line-through">
                {formatProductPrice(
                  originalTotalPrice,
                )}
              </p>
            )}
        </div>

        {/* Add To Cart */}
        <button
          type="button"
          disabled={disabled}
          onClick={onAddToCart}
          className="flex min-h-14 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-[#111111] px-4 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShoppingBag
            size={19}
            className="shrink-0"
          />

          <span>
            {!available
              ? 'Hết hàng'
              : 'Thêm vào giỏ'}
          </span>
        </button>
      </div>

      {available && !onAddToCart && (
        <p className="mt-2 text-right text-[11px] text-neutral-500">
          Giỏ hàng đang được phát triển.
        </p>
      )}
    </div>
  );
}