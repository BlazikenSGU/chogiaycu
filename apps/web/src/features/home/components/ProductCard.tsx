
import { useState } from 'react';
import { Heart, Star, Footprints } from 'lucide-react';
import type { MockProduct } from '../data/mockProducts';

type Props = {
  product: MockProduct;
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export default function ProductCard({ product }: Props) {
  const [favorite, setFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-square overflow-hidden rounded-[22px] bg-[#f3f3f3]">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-neutral-400">
            <Footprints size={44} strokeWidth={1.3} />
            <span className="text-xs">Ảnh đang cập nhật</span>
          </div>
        )}

        <button
          type="button"
          aria-label="Yêu thích"
          aria-pressed={favorite}
          onClick={() => setFavorite(!favorite)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#171717] text-white shadow-sm"
        >
          <Heart
            size={18}
            fill={favorite ? 'currentColor' : 'none'}
          />
        </button>

        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold">
          {product.condition}% New
        </span>
      </div>

      <div className="pt-3">
        <h3 className="truncate text-sm font-bold md:text-base">
          {product.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <Star
            size={13}
            fill="currentColor"
            className="text-[#171717]"
          />
          <span>{product.rating}</span>
          <span className="rounded bg-[#f2f2f2] px-2 py-1 text-[10px] text-neutral-500">
            {product.sold} sold
          </span>
        </div>

        <p className="mt-2 text-xs text-neutral-500">
          Size {product.size} · Giày đã qua sử dụng
        </p>

        <p className="mt-2 text-base font-extrabold md:text-lg">
          {formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
