
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react';
import {
  X,
  Layers3,
  LoaderCircle,
} from 'lucide-react';

import { categoriesApi } from '../api/category.api';
import type { Category } from '../types/category.types';
import { getApiErrorMessage } from '../../../lib/api-error';

interface CategoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (category: Category) => void;
  category?: Category | null;
}

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function CategoryFormModal({
  open,
  onClose,
  onSuccess,
  category = null,
}: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(category);

  useEffect(() => {
    if (!open) return;

    setName(category?.name ?? '');
    setSlug(category?.slug ?? '');
    setDescription(category?.description ?? '');
    setSlugEdited(Boolean(category));
    setError('');
  }, [open, category]);

  if (!open) return null;

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (saving) return;

    setError('');

    const cleanName = name.trim();
    const cleanSlug = slug.trim();
    const cleanDescription = description.trim();

    if (!cleanName || !cleanSlug) {
      setError('Vui lòng nhập tên và slug danh mục.');
      return;
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setError('Slug không hợp lệ.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: cleanName,
        slug: cleanSlug,
        description: cleanDescription,
      };

      const savedCategory = category
        ? await categoriesApi.update(category.id, payload)
        : await categoriesApi.create(payload);

      onSuccess(savedCategory);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-modal-title"
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-3">
              <Layers3 size={21} />
            </div>

            <div>
              <h2
                id="category-modal-title"
                className="text-lg font-semibold"
              >
                {isEditing
                  ? 'Chỉnh sửa danh mục'
                  : 'Thêm danh mục'}
              </h2>

              <p className="text-xs text-gray-500">
                {isEditing
                  ? 'Cập nhật thông tin danh mục'
                  : 'Tạo danh mục mới cho cửa hàng'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Đóng"
            className="rounded-lg p-2 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(event) => void handleSubmit(event)}
          className="flex min-h-0 flex-col"
        >
          <div className="space-y-5 overflow-y-auto px-6 py-6">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            {/* Category name */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Tên danh mục *
              </span>

              <input
                required
                maxLength={100}
                disabled={saving}
                value={name}
                onChange={(e) =>
                  handleNameChange(e.target.value)
                }
                placeholder="Ví dụ: Giày chạy bộ"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
              />
            </label>

            {/* Slug */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Slug *
              </span>

              <input
                required
                maxLength={120}
                disabled={saving}
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                placeholder="giay-chay-bo"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
              />

              <span className="mt-1 block text-xs text-gray-400">
                Tự động tạo từ tên danh mục.
              </span>
            </label>

            {/* Description */}
            <label className="block">
              <span className="mb-2 block text-sm font-medium">
                Mô tả
              </span>

              <textarea
                maxLength={1000}
                rows={4}
                disabled={saving}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Nhập mô tả danh mục..."
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-black disabled:opacity-50"
              />

              <span className="mt-1 block text-xs text-gray-400">
                Tối đa 1000 ký tự.
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving && (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              )}

              {saving
                ? 'Đang lưu...'
                : isEditing
                  ? 'Lưu thay đổi'
                  : 'Tạo danh mục'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
