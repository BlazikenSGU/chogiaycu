
import { useEffect, useState } from 'react';
import {
    Package,
    Search,
    Plus,
    Pencil,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    ImageOff,
    RotateCcw,
} from 'lucide-react';

import { productsApi } from '../api/product.api';
import {
    ProductSort,
    ProductStatus,
    type Product,
    type PaginatedProducts,
} from '../types/product.types';
import { getApiErrorMessage } from '../../../lib/api-error';

import { brandsApi } from '../../brands/api/brand.api';
import { categoriesApi } from '../../categories/api/category.api';
import type { Brand } from '../../brands/types/brand.types';
import type { Category } from '../../categories/types/category.types';

import ProductFormModal from '../components/ProductFormModal';
import type { CreateProductDto, UpdateProductDto } from '../types/product.types';

const statusLabels: Record<ProductStatus, string> = {
    DRAFT: 'Bản nháp',
    ACTIVE: 'Đang bán',
    SOLD_OUT: 'Hết hàng',
    HIDDEN: 'Đã ẩn',
};

const statusClasses: Record<ProductStatus, string> = {
    DRAFT: 'bg-gray-100 text-gray-600',
    ACTIVE: 'bg-green-50 text-green-700',
    SOLD_OUT: 'bg-orange-50 text-orange-700',
    HIDDEN: 'bg-red-50 text-red-600',
};

const formatPrice = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(value);

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [meta, setMeta] =
        useState<PaginatedProducts['meta'] | null>(null);

    const [search, setSearch] = useState<string>('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [status, setStatus] = useState<ProductStatus | ''>('');

    const [brandId, setBrandId] = useState<string>('');
    const [categoryId, setCategoryId] = useState<string>('');

    const [brands, setBrands] = useState<Brand[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [filtersLoading, setFiltersLoading] = useState<boolean>(true);
    const [filtersError, setFiltersError] = useState<string>('');

    const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [sort, setSort] = useState<ProductSort>(
        ProductSort.NEWEST,
    );
    const [page, setPage] = useState<number>(1);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    //load danh sách brand và category

    useEffect(() => {
        let cancelled = false;

        async function loadFilterOptions() {
            try {
                setFiltersLoading(true);
                setFiltersError('');

                const [brandData, categoryData] = await Promise.all([
                    brandsApi.getAll(),
                    categoriesApi.getAll(),
                ]);

                if (!cancelled) {
                    setBrands(brandData);
                    setCategories(categoryData);
                }
            } catch (err) {
                if (!cancelled) {
                    setFiltersError(getApiErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setFiltersLoading(false);
                }
            }
        }

        void loadFilterOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            setDebouncedSearch(search.trim());
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // load danh sách sản phẩm
    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            setLoading(true);
            setError('');

            try {
                const result = await productsApi.getAll({
                    page,
                    limit: 12,
                    search: debouncedSearch || undefined,
                    status: status || undefined,
                    brandId: brandId || undefined,
                    categoryId: categoryId || undefined,
                    sort,
                });

                if (!cancelled) {
                    setProducts(result.data);
                    setMeta(result.meta);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err));
                    setProducts([]);
                    setMeta(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProducts();

        return () => {
            cancelled = true;
        };
    }, [page, debouncedSearch, status, brandId, categoryId, sort, refreshKey]);

    function handleResetFilters() {
        setSearch('');
        setBrandId('');
        setCategoryId('');
        setStatus('');
        setSort(ProductSort.NEWEST);
        setPage(1);
    }

    async function handleCreateProduct(
        data: CreateProductDto,
        images: File[],
    ) {
        if (images.length > 6) {
            throw new Error(
                'Mỗi sản phẩm chỉ được tối đa 6 ảnh.',
            );
        }

        // Một request duy nhất:
        // Backend xử lý upload song song và Prisma transaction.
        await productsApi.createWithImages(data, images);

        // Chỉ đóng modal khi backend trả về thành công.
        setCreateModalOpen(false);

        // Quay về trang đầu và tải lại danh sách sản phẩm.
        setPage(1);
        setRefreshKey((value) => value + 1);
    }

    async function handleUpdateProduct(data: UpdateProductDto, images: File[]) {
        if (!editingProduct) return;

        const productId = editingProduct.id;

        if (editingProduct.images.length + images.length > 6) {
            throw new Error(
                `Mỗi sản phẩm chỉ chứa tối đa 6 ảnh`
            );
        }

        const uploadedImageIds: string[] = [];

        try {
            if (images.length > 0) {
                const uploadedImages = await productsApi.uploadImagesBatch(productId, images);
                uploadedImageIds.push(
                    ...uploadedImages.map((image) => image.id),
                );
            }

            await productsApi.update(productId, data);
        } catch (error) {
            const cleanupResults = await Promise.allSettled(
                uploadedImageIds.map((imageId) =>
                    productsApi.deleteImage(productId, imageId),
                ),
            );

            setRefreshKey((value) => value + 1);

            if (
                cleanupResults.some(
                    (result) => result.status === 'rejected',
                )
            ) {
                throw new Error(
                    'Lưu sản phẩm thất bại. Một số ảnh mới chưa được dọn sạch. Vui lòng tải lại sản phẩm để kiểm tra.',
                );
            }

            throw error;
        }

        setEditingProduct(null);
        setRefreshKey((value) => value + 1);
    }


    function handlePrimaryChange(productId: string, imageId: string) {
        setProducts((previous) =>
            previous.map((product) => {
                if (product.id !== productId) {
                    return product;
                }

                return {
                    ...product,
                    images: product.images.map((image) => ({
                        ...image,
                        isPrimary: image.id === imageId,
                    })),
                };
            }),
        );
    }

    function handleImageDeleted(productId: string, imageId: string) {
        setProducts((previous) =>
            previous.map((product) => {
                if (product.id !== productId) {
                    return product;
                }

                return {
                    ...product,
                    images: product.images.filter(
                        (image) => image.id !== imageId,
                    ),
                };
            }),
        );
    }

    return (
        <div className="space-y-6">
            <ProductFormModal
                open={createModalOpen}
                onClose={() => {
                    setCreateModalOpen(false);
                }}
                onSubmit={handleCreateProduct}
            />

            <ProductFormModal
                open={editingProduct !== null}
                product={editingProduct}
                onClose={() => setEditingProduct(null)}
                onSubmit={handleUpdateProduct}
                onPrimaryChange={handlePrimaryChange}
                onImageDeleted={handleImageDeleted}
            />

            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">
                        Quản lý cửa hàng
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight text-black">
                        Sản phẩm
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Quản lý danh sách giày cũ trong cửa hàng.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setCreateModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                >
                    <Plus size={18} />
                    Thêm sản phẩm
                </button>
            </div>

            {/* Product table */}
            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                <div className="space-y-4 border-b border-gray-100 p-5">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-gray-100 p-2.5">
                                <Package size={19} />
                            </div>

                            <div>
                                <h2 className="font-semibold text-gray-900">
                                    Danh sách sản phẩm
                                </h2>
                                <p className="mt-1 text-xs text-gray-400">
                                    {meta?.total ?? 0} sản phẩm
                                </p>
                            </div>
                        </div>
                        <div className="relative min-w-[220px] flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Tìm sản phẩm..."
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-black"
                            />
                        </div>


                        {/* Brand filter */}
                        <select
                            aria-label="Lọc thương hiệu"
                            value={brandId}
                            disabled={filtersLoading}
                            onChange={(event) => {
                                setBrandId(event.target.value);
                                setPage(1);
                            }}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black disabled:opacity-50"
                        >
                            <option value="">Tất cả thương hiệu</option>

                            {brands.map((brand) => (
                                <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>

                        {/* Category filter */}
                        <select
                            aria-label="Lọc danh mục"
                            value={categoryId}
                            disabled={filtersLoading}
                            onChange={(event) => {
                                setCategoryId(event.target.value);
                                setPage(1);
                            }}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black disabled:opacity-50"
                        >
                            <option value="">Tất cả danh mục</option>

                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>


                        <select
                            aria-label="Lọc trạng thái"
                            value={status}
                            onChange={(event) => {
                                setStatus(
                                    event.target.value as ProductStatus | '',
                                );
                                setPage(1);
                            }}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value="">Tất cả trạng thái</option>
                            {Object.values(ProductStatus).map((value) => (
                                <option key={value} value={value}>
                                    {statusLabels[value]}
                                </option>
                            ))}
                        </select>

                        <select
                            aria-label="Sắp xếp sản phẩm"
                            value={sort}
                            onChange={(event) => {
                                setSort(event.target.value as ProductSort);
                                setPage(1);
                            }}
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
                        >
                            <option value={ProductSort.NEWEST}>
                                Mới nhất
                            </option>
                            <option value={ProductSort.OLDEST}>
                                Cũ nhất
                            </option>
                            <option value={ProductSort.PRICE_ASC}>
                                Giá tăng dần
                            </option>
                            <option value={ProductSort.PRICE_DESC}>
                                Giá giảm dần
                            </option>
                        </select>


                        <button
                            type="button"
                            onClick={handleResetFilters}
                            disabled={
                                !search &&
                                !brandId &&
                                !categoryId &&
                                !status &&
                                sort === ProductSort.NEWEST &&
                                page === 1
                            }
                            title="Xóa tất cả bộ lọc"
                            className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <RotateCcw size={16} />
                            Xóa bộ lọc
                        </button>


                        <button
                            type="button"
                            onClick={() => setRefreshKey((value) => value + 1)}
                            disabled={loading}
                            title="Tải lại danh sách"
                            aria-label="Tải lại danh sách"
                            className="rounded-xl border border-gray-200 p-2.5 transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? 'animate-spin' : ''}
                            />
                        </button>
                    </div>

                    {filtersError && (
                        <p role="alert" className="text-sm text-red-600">
                            Không thể tải bộ lọc: {filtersError}
                        </p>
                    )}
                </div>

                {error && (
                    <div
                        role="alert"
                        className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600"
                    >
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center text-sm text-gray-500">
                        Đang tải danh sách sản phẩm...
                    </div>
                ) : !error ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">
                                        Sản phẩm
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Thương hiệu
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Giá bán
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Size
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Kho
                                    </th>
                                    <th className="px-6 py-4 font-medium">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-right font-medium">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {products.map((product) => {
                                    const image =
                                        product.images.find(
                                            (item) => item.isPrimary,
                                        ) ?? product.images[0];

                                    return (
                                        <tr
                                            key={product.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                                        {image ? (
                                                            <img
                                                                src={image.url}
                                                                alt={image.alt ?? product.name}
                                                                loading="lazy"
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageOff
                                                                size={22}
                                                                className="text-gray-300"
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="max-w-[250px] truncate font-semibold text-gray-900">
                                                            {product.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {product.category.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {product.brand.name}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {formatPrice(product.price)}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {product.size}
                                            </td>

                                            <td className="px-6 py-4 text-gray-600">
                                                {product.stock}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses[product.status]}`}
                                                >
                                                    {statusLabels[product.status]}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingProduct(product)}
                                                        title={`Chỉnh sửa ${product.name}`}
                                                        aria-label={`Chỉnh sửa ${product.name}`}
                                                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-black hover:bg-gray-100 hover:text-black"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {products.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-6 py-16 text-center text-gray-400"
                                        >
                                            Không tìm thấy sản phẩm nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {/* Pagination */}
                {!error && !loading && meta && meta.totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-4">
                        <p className="text-sm text-gray-500">
                            Tổng {meta.total} sản phẩm · Trang {meta.page}/
                            {meta.totalPages}
                        </p>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() =>
                                    setPage((value) => Math.max(1, value - 1))
                                }
                                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={16} />
                                Trước
                            </button>

                            <button
                                type="button"
                                disabled={page >= meta.totalPages}
                                onClick={() =>
                                    setPage((value) => value + 1)
                                }
                                className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Sau
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
