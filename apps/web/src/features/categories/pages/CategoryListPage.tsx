
import { useEffect, useMemo, useState } from 'react';
import {
  Layers3,
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { categoriesApi } from '../api/category.api';
import type { Category } from '../types/category.types';
import { getApiErrorMessage } from '../../../lib/api-error';
import CategoryFormModal from '../components/CategoryFormModal';

export default function CategoryListPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>('');

  async function loadCategories() {
    try {
      setLoading(true);
      setError('');

      const data = await categoriesApi.getAll();
      setCategories(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return categories.filter((category) =>
      category.name.toLowerCase().includes(keyword) ||
      category.slug.toLowerCase().includes(keyword) ||
      (category.description ?? '')
        .toLowerCase()
        .includes(keyword)
    );
  }, [categories, search]);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date(date));



  async function handleDeleteCategory() {
    if (!deletingCategory || deleting) return;

    try {
      setDeleting(true);
      setDeleteError('');

      await categoriesApi.remove(deletingCategory.id);

      setCategories((previous) =>
        previous.filter(
          (category) => category.id !== deletingCategory.id
        )
      );

      setDeletingCategory(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }


  return (
    <div className="space-y-6">

      <CategoryFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(category) => {
          setCategories((previous) =>
            [...previous, category].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }}
      />

      <CategoryFormModal
        open={editingCategory !== null}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={(updatedCategory) => {
          setCategories((previous) =>
            previous
              .map((category) =>
                category.id === updatedCategory.id
                  ? updatedCategory
                  : category
              )
              .sort((a, b) => a.name.localeCompare(b.name))
          );
        }}
      />

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">
            Quản lý cửa hàng
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-black">
            Danh mục
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Quản lý các danh mục sản phẩm trong cửa hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          title="Chức năng thêm danh mục sẽ được triển khai ở bước tiếp theo"
          className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Thêm danh mục
        </button>
      </div>

      {/* Category table */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">
              Danh sách danh mục
            </h2>

            <p className="mt-1 text-xs text-gray-400">
              {filteredCategories.length} danh mục
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm danh mục..."
                className="w-48 rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black sm:w-64"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadCategories()}
              disabled={loading}
              title="Tải lại danh sách"
              aria-label="Tải lại danh sách"
              className="rounded-xl border border-gray-200 p-2.5 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Đang tải danh sách danh mục...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    Danh mục
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Slug
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 font-medium">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-4 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                          <Layers3 size={20} className="text-gray-600" />
                        </div>

                        <span className="font-semibold text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {category.slug}
                    </td>

                    <td className="max-w-[250px] px-6 py-4 text-gray-500">
                      <p className="truncate" title={category.description ?? ''}>
                        {category.description || '—'}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(category.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => { setEditingCategory(category) }}
                          title={`Chỉnh sửa ${category.name}`}
                          aria-label={`Chỉnh sửa ${category.name}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-black hover:bg-gray-100 hover:text-black"
                        >
                          <Pencil size={16} />
                        </button>


                        <button
                          type="button"
                          onClick={() => {
                            setDeletingCategory(category);
                            setDeleteError('');
                          }}
                          title={`Xóa ${category.name}`}
                          aria-label={`Xóa ${category.name}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      Không tìm thấy danh mục nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>


      {/* Delete Category Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-category-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={24} />
              </div>

              <h2
                id="delete-category-title"
                className="text-lg font-semibold text-gray-900"
              >
                Xóa danh mục?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Bạn có chắc chắn muốn xóa danh mục{' '}
                <strong className="font-semibold text-gray-900">
                  {deletingCategory.name}
                </strong>
                ?
              </p>

              <p className="mt-2 text-xs text-red-600">
                Hành động này không thể hoàn tác.
              </p>
            </div>

            {/* Error */}
            {deleteError && (
              <div
                role="alert"
                className="mx-6 mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
              >
                {deleteError}
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeletingCategory(null);
                  setDeleteError('');
                }}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDeleteCategory()}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Xóa danh mục
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
