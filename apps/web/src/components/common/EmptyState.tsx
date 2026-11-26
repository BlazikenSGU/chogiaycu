import { PackageOpen } from 'lucide-react';

interface Props {
  title?: string;
  description?: string;
  onReset?: () => void;
}

export default function EmptyState({
  title = 'Không tìm thấy dữ liệu',
  description,
  onReset,
}: Props) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <PackageOpen
        size={48}
        strokeWidth={1.2}
        className="text-neutral-400"
      />

      <h3 className="font-semibold">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-neutral-500">
          {description}
        </p>
      )}

      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl bg-black px-5 py-2.5 text-sm text-white"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}