
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from 'lucide-react';

import { brandsApi } from '../api/brand.api';
import type { Brand } from '../types/brand.types';
import { getApiErrorMessage } from '../../../lib/api-error';
import BrandFormModal from '../components/BrandFormModal';
import BrandLogo from '../components/BrandLogo';

export default function BrandListPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function loadBrands() {
    try {
      setLoading(true);
      setError('');

      const data = await brandsApi.getAll();
      setBrands(data);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(keyword) ||
      brand.slug.toLowerCase().includes(keyword)
    );
  }, [brands, search]);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    }).format(new Date(date));

  async function handleDeleteBrand() {
    if (!deletingBrand || deleting) return;

    try {
      setDeleting(true);
      setDeleteError('');

      await brandsApi.remove(deletingBrand.id);

      setBrands((previous) =>
        previous.filter((brand) => brand.id !== deletingBrand.id)
      );

      setDeletingBrand(null);
    } catch (err) {
      setDeleteError(getApiErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <BrandFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(brand) => {
          setBrands((previous) =>
            [...previous, brand].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }}
      />

      <BrandFormModal
        open={editingBrand !== null}
        brand={editingBrand}
        onClose={() => setEditingBrand(null)}
        onSuccess={(updatedBrand) => {
          setBrands((previous) =>
            previous
              .map((brand) =>
                brand.id === updatedBrand.id ? updatedBrand : brand
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
            Thương hiệu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các thương hiệu giày trong cửa hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          <Plus size={18} />
          Thêm thương hiệu
        </button>
      </div>

      {/* Statistics */}
      {/* <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Tags size={20} />
          </div>
          <p className="text-sm text-gray-500">
            Tổng thương hiệu
          </p>
          <p className="mt-1 text-3xl font-semibold text-black">
            {brands.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Search size={20} />
          </div>
          <p className="text-sm text-gray-500">
            Kết quả tìm kiếm
          </p>
          <p className="mt-1 text-3xl font-semibold text-black">
            {filteredBrands.length}
          </p>
        </div>
      </div> */}

      {/* Brand table */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 p-5">
          <div>
            <h2 className="font-semibold text-gray-900">
              Danh sách thương hiệu
            </h2>
            <p className="mt-1 text-xs text-gray-400">
              {filteredBrands.length} thương hiệu
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
                placeholder="Tìm thương hiệu..."
                className="w-48 rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black sm:w-64"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadBrands()}
              disabled={loading}
              title="Tải lại danh sách"
              aria-label="Tải lại danh sách"
              className="rounded-xl border border-gray-200 p-2.5 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && (
          <div role="alert" className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Đang tải danh sách thương hiệu...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Thương hiệu</th>
                  <th className="px-6 py-4 font-medium">Slug</th>
                  <th className="px-6 py-4 font-medium">Ngày tạo</th>
                  <th className="px-6 py-4 text-right font-medium">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                          <BrandLogo
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="h-10 w-10 rounded-lg object-contain"
                          />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {brand.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {brand.slug}
                    </td>

                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(brand.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingBrand(brand)}
                          title={`Chỉnh sửa ${brand.name}`}
                          aria-label={`Chỉnh sửa ${brand.name}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-black hover:bg-gray-100 hover:text-black"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeletingBrand(brand);
                            setDeleteError('');
                          }}
                          title={`Xóa ${brand.name}`}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-gray-400">
                      Không tìm thấy thương hiệu nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete Brand Confirmation Modal */}
      {deletingBrand && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-brand-title"
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <Trash2 size={24} />
              </div>

              <h2
                id="delete-brand-title"
                className="text-lg font-semibold text-gray-900"
              >
                Xóa thương hiệu?
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Bạn có chắc chắn muốn xóa thương hiệu{' '}
                <strong className="font-semibold text-gray-900">
                  {deletingBrand.name}
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
                  setDeletingBrand(null);
                  setDeleteError('');
                }}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDeleteBrand()}
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
                    Xóa thương hiệu
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
