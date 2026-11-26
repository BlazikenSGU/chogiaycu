import { Search, SlidersHorizontal, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function HomeSearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[#f5f5f5] px-5 py-4">
        <Search
          size={19}
          className="shrink-0 text-neutral-400"
        />

        <input
          type=""
          aria-label="Tìm kiếm sản phẩm"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Tìm đôi giày bạn yêu thích..."
          className="w-full bg-transparent text-sm outline-none"
        />

        {value && (
          <button
            type="button"
            aria-label="Xóa từ khóa"
            onClick={() => onChange('')}
          >
            <X size={17} />
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label="Bộ lọc thương hiệu"
        onClick={() =>
          document
            .getElementById('brands')
            ?.scrollIntoView({
              behavior: 'smooth',
            })
        }
        className="rounded-2xl bg-[#f5f5f5] p-4"
      >
        <SlidersHorizontal size={20} />
      </button>
    </div>
  );
}