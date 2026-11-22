
import { useEffect } from 'react';
import { X, PackagePlus, Pencil } from 'lucide-react';

import ProductForm from './ProductForm';

import type {
  Product,
  CreateProductDto,
} from '../types/product.types';

type ProductFormModalProps = {
  open: boolean;
  product?: Product | null;
  onClose: () => void;
  onSubmit: (data: CreateProductDto) => Promise<void>;
};

export default function ProductFormModal({
  open,
  product = null,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const isEditing = product !== null;

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-gray-50 shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
              {isEditing ? (
                <Pencil size={20} />
              ) : (
                <PackagePlus size={20} />
              )}
            </div>

            <div>
              <h2
                id="product-modal-title"
                className="text-lg font-semibold text-gray-900"
              >
                {isEditing
                  ? 'Chỉnh sửa sản phẩm'
                  : 'Thêm sản phẩm'}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {isEditing
                  ? 'Cập nhật thông tin sản phẩm.'
                  : 'Nhập thông tin sản phẩm giày cũ mới.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            title="Đóng"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-black"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
          <ProductForm
            key={product?.id ?? 'create'}
            initialValues={product ?? undefined}
            onSubmit={onSubmit}
            submitLabel={
              isEditing
                ? 'Lưu thay đổi'
                : 'Tạo sản phẩm'
            }
          />
        </div>
      </div>
    </div>
  );
}
