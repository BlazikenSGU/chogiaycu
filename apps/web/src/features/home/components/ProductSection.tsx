import { ChevronLeft, ChevronRight } from 'lucide-react';

import { usePublicProducts } from '../../products/hooks/usePublicProducts';

import type {
  ProductQueryParams,
} from '../../products/types/product.types';

import ProductGrid from '../../products/components/ProductGrid';

import ErrorState from '../../../components/common/ErrorState';
import EmptyState from '../../../components/common/EmptyState';

interface Props {
  filters: ProductQueryParams;
  isSearching: boolean;
  onPageChange: (page: number) => void;
  onReset: () => void;
}

export default function ProductSection({
  filters,
  isSearching,
  onPageChange,
  onReset,
}: Props) {
  const {
    data,
    isPending,
    isError,
    isFetching,
    refetch,
  } = usePublicProducts(filters);

  const products = data?.data ?? [];
  const meta = data?.meta;

  function changePage(page: number) {
    onPageChange(page);

    document
      .getElementById('products')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  }

  return (
    <section id="products" className="scroll-mt-6">
      {isPending || isSearching ? (
        <ProductGrid
          products={[]}
          loading
        />
      ) : isError && !data ? (
        <ErrorState
          message="Không thể tải sản phẩm"
          onRetry={() => void refetch()}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="Chưa có sản phẩm phù hợp"
          description="Hãy thử thay đổi từ khóa hoặc bộ lọc."
          onReset={onReset}
        />
      ) : (
        <>
          {isError && (
            <ErrorState
              message="Không thể cập nhật dữ liệu mới"
              onRetry={() => void refetch()}
            />
          )}

          <ProductGrid products={products} />

          {meta && meta.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Trang trước"
                disabled={meta.page <= 1 || isFetching}
                onClick={() => changePage(meta.page - 1)}
                className="rounded-xl border p-3 disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>

              <span className="text-sm font-medium">
                Trang {meta.page} / {meta.totalPages}
              </span>

              <button
                type="button"
                aria-label="Trang sau"
                disabled={
                  meta.page >= meta.totalPages ||
                  isFetching
                }
                onClick={() => changePage(meta.page + 1)}
                className="rounded-xl border p-3 disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}