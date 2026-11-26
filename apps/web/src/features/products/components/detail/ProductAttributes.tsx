import type {
  Product,
} from '../../types/product.types';

interface Props {
  product: Product;
}

export default function ProductAttributes({
  product,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-5">

      {/* Size */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">
          Size
        </h3>

        <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#171717] px-3 text-sm font-semibold text-white">
          {product.size}
        </span>
      </div>

      {/* Condition */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">
          Độ mới
        </h3>

        {product.conditionPercent !== null ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex h-11 items-center justify-center rounded-full bg-[#171717] px-4 text-sm font-semibold text-white">
              {product.conditionPercent}%
            </span>

            <span className="text-xs text-neutral-500">
              New
            </span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">
            Đang cập nhật
          </span>
        )}
      </div>
    </div>
  );
}