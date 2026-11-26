import { Minus, Plus } from 'lucide-react';

interface Props {
  quantity: number;
  stock: number;
  canIncrease: boolean;
  canDecrease: boolean;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function ProductQuantity({
  quantity,
  stock,
  canIncrease,
  canDecrease,
  onIncrease,
  onDecrease,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <h3 className="text-sm font-semibold">
        Số lượng
      </h3>

      <div className="flex items-center rounded-full bg-[#f3f3f3] px-1 py-1">
        <button
          type="button"
          aria-label="Giảm số lượng"
          disabled={!canDecrease}
          onClick={onDecrease}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Minus size={17} />
        </button>

        <span
          aria-live="polite"
          className="min-w-8 text-center text-sm font-bold"
        >
          {quantity}
        </span>

        <button
          type="button"
          aria-label="Tăng số lượng"
          disabled={!canIncrease}
          onClick={onIncrease}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Plus size={17} />
        </button>
      </div>

      <span className="text-xs text-neutral-500">
        {stock > 0
          ? `Còn ${stock} đôi`
          : 'Hết hàng'}
      </span>
    </div>
  );
}