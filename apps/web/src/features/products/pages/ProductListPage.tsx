
import { useEffect, useState } from 'react';
import { productsApi } from '../api/product.api';
import {
    ProductSort,
    ProductStatus,
    type Product,
    type PaginatedProducts,
} from '../types/product.types';
import { getApiErrorMessage } from '../../../lib/api-error';
import './product-list.css';

const statusLabels: Record<ProductStatus, string> = {
    DRAFT: 'Bản nháp',
    ACTIVE: 'Đang bán',
    SOLD_OUT: 'Hết hàng',
    HIDDEN: 'Đã ẩn',
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

    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<ProductStatus | ''>('');
    const [sort, setSort] = useState<ProductSort>(
        ProductSort.NEWEST,
    );
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadProducts() {
            setLoading(true);
            setError('');

            try {
                const result = await productsApi.getAll({
                    page,
                    limit: 12,
                    search: search || undefined,
                    status: status || undefined,
                    sort,
                });

                if (!cancelled) {
                    setProducts(result.data);
                    setMeta(result.meta);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getApiErrorMessage(err));
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
    }, [page, search, status, sort]);

    const handleSearch = (event: React.FormEvent) => {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    };

    return (
        <main className="products-page">
            <header className="products-header">
                <div>
                    <h1>Quản lý sản phẩm</h1>
                    <p>Quản lý giày cũ trên chogiaycu.store</p>
                </div>

                <a href="/admin/products/new" className="primary-btn">
                    + Thêm sản phẩm
                </a>
            </header>

            <section className="products-panel">
                <div className="products-filters">
                    <form onSubmit={handleSearch}>
                        <input
                            type="search"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                        />
                        <button type="submit">Tìm kiếm</button>
                    </form>

                    <select
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value as ProductStatus | '');
                            setPage(1);
                        }}
                    >
                        <option value="">Tất cả trạng thái</option>
                        {Object.values(ProductStatus).map((value) => (
                            <option key={value} value={value}>
                                {statusLabels[value]}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sort}
                        onChange={(event) => {
                            setSort(event.target.value as ProductSort);
                            setPage(1);
                        }}
                    >
                        <option value={ProductSort.NEWEST}>Mới nhất</option>
                        <option value={ProductSort.OLDEST}>Cũ nhất</option>
                        <option value={ProductSort.PRICE_ASC}>
                            Giá tăng dần
                        </option>
                        <option value={ProductSort.PRICE_DESC}>
                            Giá giảm dần
                        </option>
                    </select>
                </div>

                {error && <p role="alert" className="error">{error}</p>}

                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : (
                    <div className="products-table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Thương hiệu</th>
                                    <th>Giá bán</th>
                                    <th>Size</th>
                                    <th>Kho</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>

                            <tbody>
                                {products.map((product) => {
                                    const image =
                                        product.images.find((item) => item.isPrimary) ??
                                        product.images[0];

                                    return (
                                        <tr key={product.id}>
                                            <td>
                                                <div className="product-info">
                                                    {image ? (
                                                        <img
                                                            src={image.url}
                                                            alt={image.alt ?? product.name}
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="product-placeholder">
                                                            No image
                                                        </div>
                                                    )}

                                                    <div>
                                                        <strong>{product.name}</strong>
                                                        <small>{product.category.name}</small>
                                                    </div>
                                                </div>
                                            </td>

                                            <td>{product.brand.name}</td>
                                            <td>{formatPrice(product.price)}</td>
                                            <td>{product.size}</td>
                                            <td>{product.stock}</td>
                                            <td>
                                                <span className={`status status-${product.status.toLowerCase()}`}>
                                                    {statusLabels[product.status]}
                                                </span>
                                            </td>
                                            <td>
                                                <a href={`/admin/products/${product.id}/edit`}>
                                                    Sửa
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {products.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="empty-state">
                                            Không có sản phẩm nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {meta && meta.totalPages > 1 && (
                    <div className="products-pagination">
                        <span>
                            Tổng {meta.total} sản phẩm · Trang {meta.page}/
                            {meta.totalPages}
                        </span>

                        <div>
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((value) => value - 1)}
                            >
                                Trước
                            </button>
                            <button
                                disabled={page >= meta.totalPages || loading}
                                onClick={() => setPage((value) => value + 1)}
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
