import { useCategories } from '../../categories/hooks/useCategories';

import ErrorState from '../../../components/common/ErrorState';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function CategorySection({
  selectedId,
  onSelect,
}: Props) {
  const {
    data: categories = [],
    isPending,
    isError,
    refetch,
  } = useCategories();

  if (isPending) {
    return (
      <div className="mb-6 flex gap-2 overflow-hidden pb-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-neutral-200"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Không thể tải danh mục"
        onRetry={() => void refetch()}
      />
    );
  }

  const items = [
    {
      id: '',
      name: 'Tất cả',
    },
    ...categories,
  ];

  return (
    <div
      id="categories"
      className="mb-6 flex gap-2 overflow-x-auto pb-2"
    >
      {items.map((category) => (
        <button
          key={category.id}
          type="button"
          aria-pressed={selectedId === category.id}
          onClick={() => onSelect(category.id)}
          className={`shrink-0 cursor-pointer rounded-full
            border border-black px-5 py-2
            text-sm font-semibold transition
            ${
              selectedId === category.id
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-neutral-100'
            }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}